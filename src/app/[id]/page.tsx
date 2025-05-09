'use client';

import React, {useCallback, useEffect, useRef, useState} from 'react';
import {fetchNewspaperTitleFromCatalog, getLinkToNewspaperInCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {
  deleteContactInfo,
  getBoxForTitle,
  getContactInfoForTitle,
  getLocalTitle,
  putContactInfo,
  putLocalTitle,
  updateNotesForTitle,
  updateShelfForTitle
} from '@/services/local.data';
import {box, contact_info, title} from '@prisma/client';
import {useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {FaBoxOpen, FaEdit, FaExternalLinkAlt, FaSave} from 'react-icons/fa';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import NotesComponent from '@/components/NotesComponent';
import EditTextInput from '@/components/EditTextInput';
import IssueList from '@/components/IssueList';
import ErrorModal from '@/components/ErrorModal';
import WarningLabel from '@/components/WarningLabel';
import {catalogDateStringToNorwegianDateString} from '@/utils/dateUtils';
import {TitleContactInfo} from '@/models/TitleContactInfo';
import {Form, Formik} from 'formik';
import {Spinner} from '@nextui-org/spinner';
import ReleasePatternForm from '@/components/ReleasePatternForm';
import ContactInformationForm from '@/components/ContactInformationForm';
import {ImCross} from 'react-icons/im';
import ContactInformation from '@/components/ContactInformation';
import ReleasePattern from '@/components/ReleasePattern';
import TitleNotFound from '@/components/TitleNotFound';
import SuccessAlert from '@/components/SuccessAlert';
import AccessibleButton from '@/components/ui/AccessibleButton';

export default function Page({params}: { params: { id: string } }) {
  const [titleString, setTitleString] = useState<string>();
  const [titleLink, setTitleLink] = useState<string>();
  const [catalogTitle, setCatalogTitle] = useState<CatalogTitle>();
  const [titleContact, setTitleContact] = useState<TitleContactInfo>();
  const [boxFromDb, setBoxFromDb] = useState<box>();
  const [titleFromDbNotFound, setTitleFromDbNotFound] = useState<boolean>(false);
  const [showBoxRegistrationModal, setShowBoxRegistrationModal] = useState<boolean>(false);
  const titleFromQueryParams = useSearchParams()?.get('title');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('Noe gikk galt.');
  const [contactsToDelete, setContactsToDelete] = useState<contact_info[]>([]);

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
      document.title = titleString ?? 'Hugin';
    }

    void fetchNewspaperTitleFromCatalog(params.id)
      .then((data: CatalogTitle) => {
        setCatalogTitle(data);
        setTitleString(data.name);
        document.title = titleString ?? 'Hugin';
      })
      .catch((e: Error) => {
        if (e instanceof NotFoundError) {
          setErrorMessage('Fant ikke tittel på denne ID i katalogen. Se om ID er korrekt.');
          setShowError(true);
        } else {
          setErrorMessage('Får ikke kontakt med katalogen.');
          setShowError(true);
        }
      });
  }, [params, titleFromQueryParams, titleString]);

  const fetchTitleAndContactInformation = useCallback(() => {
    void getLocalTitle(params.id)
      .then((data: title) => {
        setTitleFromDbNotFound(false);
        return data;
      })
      .then(async titleData => {
        await getContactInfoForTitle(+params.id)
          .then((contactData: contact_info[]) => {
            setTitleContact({
              title: titleData,
              contactInfo: contactData
            } as TitleContactInfo);
          })
          .catch(() => {
            setErrorMessage('Får ikke kontakt med databasen for å se etter kontakt- og utgivelsesinformasjon.');
            setShowError(true);
          });
      })
      .catch((e: Error) => {
        setTitleContact(undefined);
        if (e instanceof NotFoundError) {
          setTitleFromDbNotFound(true);
        } else {
          setErrorMessage('Får ikke kontakt med databasen for å se etter kontakt- og utgivelsesinformasjon.');
          setShowError(true);
        }
      });
  }, [params.id]);

  const fetchTitleAndContactInformationRef = useRef(fetchTitleAndContactInformation);

  useEffect(() => {
    fetchTitleAndContactInformationRef.current();
  }, []);

  useEffect(() => {
    void getLinkToNewspaperInCatalog(params.id)
      .then((link: string) => {
        setTitleLink(link);
      });
  }, [params]);

  useEffect(() => {
    void getBoxForTitle(+params.id).then((b: box) => {
      setBoxFromDb(b);
    }).catch((e: Error) => {
      if (e instanceof NotFoundError) {
        setBoxFromDb(undefined);
      } else {
        setErrorMessage('Får ikke kontakt med databasen for å se etter eskeinformasjon.');
        setShowError(true);
      }
    }).then();
  }, [params.id]);

  const handleSubmit = async (titleContactInfo: TitleContactInfo): Promise<Response> => {
    const titlePut = await putLocalTitle({
      id: +params.id,
      vendor: titleContactInfo.title.vendor,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      contact_name: titleContactInfo.title.contact_name,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      release_pattern: titleContactInfo.title.release_pattern,
      shelf: titleContact?.title.shelf ?? '',
      notes:  titleContact?.title.notes ?? ''
    });
    const contactPut = await putContactInfo(+params.id, titleContactInfo.contactInfo);
    const contactDelete = await Promise.all(contactsToDelete.map(async contact => {
      return await deleteContactInfo(+params.id, [contact]);
    }));

    if (titlePut.ok && contactPut.ok && contactDelete.every(res => res.ok)) {
      return new Response('Success');
    } else {
      setErrorMessage('Noe gikk galt ved lagring av kontakt- og utgivelsesinformasjonen.');
      setShowError(true);
      return new Response('Failure');
    }
  };

  const handleRemoveContact = (values: TitleContactInfo, index: number) => {
    const newContacts = values?.contactInfo.filter((_, i) => i !== index);
    setTitleContact({
      ...values,
      contactInfo: newContacts ?? []
    } as TitleContactInfo);

    // if the contact was in the database (has an id !== ''), add it to the list of contacts to delete
    if (values.contactInfo[index].id !== '') {
      setContactsToDelete([...contactsToDelete, values.contactInfo[index]]);
    }
  };

  const handleAddContact = (values: TitleContactInfo, type: 'email' | 'phone') => {
    setTitleContact({
      ...values,
      contactInfo: [
        ...values?.contactInfo ?? [],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {id: '', title_id: +params.id, contact_type: type, contact_value: ''}
      ]
    } as TitleContactInfo);
  };

  function boxToString(b: box) : string {
    return b.id + (b.date_from ? ` (fra ${new Date(b.date_from).toLocaleDateString('no-NB')})` : '');
  }

  function submitNotes(notes: string): Promise<Response> {
    return updateNotesForTitle(params.id, notes);
  }

  function submitShelf(shelf: string): Promise<Response> {
    return updateShelfForTitle(params.id, shelf);
  }

  function updateShelfLocally(shelf: string): void {
    setTitleContact({
      ...titleContact as TitleContactInfo,
      title: {...titleContact?.title as title, ['shelf']: shelf}
    });
  }

  return (
    <div className='w-9/12 flex flex-col content-center'>
      {titleContact ? (<>
        <div className='flex flex-row flex-wrap self-center w-full justify-evenly'>
          <div className='flex flex-col grow mx-10'>
            <div>
              <div className='w-full mb-3 border-style p-3'>
                {titleString ? (
                  <h1 className="top-title-style">{titleString}</h1>
                ) : (
                  <p>Henter tittel ...</p>
                )}
                <div className="flex justify-start gap-2">
                  <p className="group-title-style"> Katalog ID: </p>
                  <a className="group-content-style underline" href={titleLink} target="_blank">
                    <div className="flex flex-row gap-2 items-center">
                      <p>{params.id}</p>
                      <FaExternalLinkAlt/>
                    </div>
                  </a>
                </div>
                {catalogTitle && catalogTitle.endDate && (
                  <WarningLabel
                    className="my-2 w-full"
                    text={`Denne avisen ble avsluttet ${catalogDateStringToNorwegianDateString(catalogTitle.endDate)}`}
                  />
                )}
                <div className='flex flex-col justify-between gap-2.5 mt-4'>
                  <EditTextInput
                    name='Hyllesignatur'
                    value={titleContact.title.shelf ?? ''}
                    onSubmit={submitShelf}
                    onSuccess={updateShelfLocally}
                    className='w-96'
                  />

                  <div className='flex flex-row flex-wrap items-center'>
                    {boxFromDb ? (
                      <>
                        <p className="group-title-style">Eske til registrering: </p>
                        <p className="group-content-style ml-2">{boxToString(boxFromDb)}</p>
                      </>
                    ) : (<p className="group-content-style"> Ingen eske registrert </p>)
                    }

                    {showBoxRegistrationModal &&
                        <BoxRegistrationModal
                          text='Registrer en ny eske'
                          closeModal={() => setShowBoxRegistrationModal(false)}
                          updateBoxInfo={setBoxFromDb}
                          titleName={titleString ?? ''}
                          titleId={params.id}/>
                    }

                    <AccessibleButton
                      endContent={<FaBoxOpen size={18}/>}
                      variant='flat'
                      color='secondary'
                      className='ml-2'
                      onClick={() => setShowBoxRegistrationModal(true)}>
                      Ny eske
                    </AccessibleButton>
                  </div>
                </div>
              </div>

              {boxFromDb ? (
                <IssueList title={titleContact.title} box={boxFromDb}/>
              ) : (
                <p className='mt-20 group-content-style text-start'>Legg til eske for å legge inn avisutgaver</p>
              )}

            </div>
          </div>

          <div className="flex flex-col w-96">
            <div className='items-start mb-3 w-full border-style p-3'>
              {titleContact &&
                  <NotesComponent
                    notes={titleContact.title.notes ?? ''}
                    onSubmit={submitNotes}
                    maxRows={2}
                    notesTitle='Merknad/kommentar på tittel:'
                  />
              }
            </div>
            <div className='flex flex-col border-style p-3 m-0'>
              {isEditing ? (
                <>
                  <Formik
                    enableReinitialize
                    initialValues={titleContact}
                    onSubmit={(values: TitleContactInfo, {setSubmitting, resetForm}) => {
                      void handleSubmit(values)
                        .then((res: Response) => {
                          if (res.ok) {
                            setShowSuccess(true);
                            setTimeout(() => {
                              setShowSuccess(false);
                            }, 5000);
                            resetForm({values});
                          } else {
                            setShowError(true);
                          }
                        })
                        .then(() => fetchTitleAndContactInformation())
                        .catch(() =>  {
                          setShowError(true);
                        })
                        .finally(() => {
                          setIsEditing(false);
                          setSubmitting(false);

                        });
                    }}
                  >
                    {({
                      values,
                      handleChange,
                      isSubmitting,
                      handleBlur,
                      isValid,
                      resetForm
                    }) => (
                      <div>
                        <Form className='flex flex-col items-start'>
                          <ContactInformationForm
                            className={'flex flex-col w-full'}
                            values={values}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                            handleAdd={handleAddContact}
                            handleRemove={handleRemoveContact}
                          />
                          <p className='group-title-style mb-2 mt-6 text-left'> Utgivelsesmønster </p>
                          <ReleasePatternForm
                            releasePattern={values.title.release_pattern}
                            handleChange={handleChange}
                            handleBlur={handleBlur}
                          />
                          {isSubmitting ? (
                            <Spinner className='self-center p-1' size='lg'/>
                          ) : (
                            <div className='flex flex-row justify-between w-full'>
                              <AccessibleButton
                                type="button"
                                variant='flat'
                                color='secondary'
                                endContent={<ImCross size={18}/>}
                                onClick={() => {
                                  resetForm();
                                  setIsEditing(false);
                                }}
                              >
                                Avbryt
                              </AccessibleButton>

                              <AccessibleButton
                                type="submit"
                                variant='solid'
                                color='primary'
                                endContent={<FaSave size={18}/>}
                                disabled={!isValid || isSubmitting}
                              >
                                Lagre
                              </AccessibleButton>
                            </div>
                          )}
                        </Form>
                      </div>
                    )}
                  </Formik>
                </>
              ) : (
                <>
                  {titleContact &&
                    <div className='flex flex-col'>
                      <h1 className="group-title-style self-start mb-2"> Kontaktinformasjon: </h1>

                      <ContactInformation
                        vendor={titleContact.title.vendor}
                        contactName={titleContact.title.contact_name}
                        contactInformation={titleContact.contactInfo}
                      />

                      {titleContact.title.release_pattern &&
                          <ReleasePattern releasePattern={titleContact.title.release_pattern}/>
                      }
                      <AccessibleButton
                        type="button"
                        variant='flat'
                        color='secondary'
                        className='mt-1'
                        endContent={<FaEdit size={18}/>}
                        onClick={() => setIsEditing(true)}
                      >
                        Rediger
                      </AccessibleButton>
                    </div>
                  }
                </>
              )}

              {showSuccess &&
                <SuccessAlert message={'Kontaktinformasjonen ble lagret'} onClick={() => setShowSuccess(false)}/>
              }

              <ErrorModal
                text='Noe gikk galt ved lagring av kontakt- og utgivelsesinformasjonen.'
                onExit={() => setShowError(false)}
                showModal={showError}
              />
            </div>
          </div>
        </div>
      </>
      ) : (
        <>
          {!titleFromDbNotFound && <p> Henter kontakt- og utgivelsesinformasjon... </p>}
        </>
      )
      }

      {titleFromDbNotFound &&
        <TitleNotFound titleId={+params.id} titleString={titleString} catalogTitle={catalogTitle}/>
      }

      <ErrorModal
        text={errorMessage}
        showModal={showError}
        onExit={() => setShowError(false)}
      />
    </div>
  );
}
