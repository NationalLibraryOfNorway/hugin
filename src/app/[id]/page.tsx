'use client';

import React, {useCallback, useEffect, useState} from 'react';
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
import {useRouter, useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {Alert} from '@nextui-org/alert';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit, FaExternalLinkAlt, FaSave} from 'react-icons/fa';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import NotesComponent from '@/components/NotesComponent';
import EditTextInput from '@/components/EditTextInput';
import IssueList from '@/components/IssueList';
import ErrorModal from '@/components/ErrorModal';
import WarningLabel from '@/components/WarningLabel';
import {catalogDateStringToNorwegianDateString} from '@/utils/dateUtils';
import {TitleContactInfo} from '@/models/TitleContactInfo';
import {Form, Formik} from 'formik';
import SuccessModal from '@/components/SuccessModal';
import {Spinner} from '@nextui-org/spinner';
import ReleasePatternForm from '@/components/ReleasePatternForm';
import ContactInformationForm from '@/components/ContactInformationForm';
import {ImCross} from 'react-icons/im';
import ContactInformation from '@/components/ContactInformation';
import ReleasePattern from '@/components/ReleasePattern';

export default function Page({params}: { params: { id: string } }) {
  const [titleString, setTitleString] = useState<string>();
  const [titleLink, setTitleLink] = useState<string>();
  const [catalogTitle, setCatalogTitle] = useState<CatalogTitle>();
  const [titleContact, setTitleContact] = useState<TitleContactInfo>();
  const [boxFromDb, setBoxFromDb] = useState<box>();
  const [titleFromDbNotFound, setTitleFromDbNotFound] = useState<boolean>(false);
  const [showBoxRegistrationModal, setShowBoxRegistrationModal] = useState<boolean>(false);
  const router = useRouter();
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
            const dataToAdd = contactData.length === 0 ?
              [
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {id: '', title_id: +params.id, contact_type: 'email', contact_value: ''},
                // eslint-disable-next-line @typescript-eslint/naming-convention
                {id: '', title_id: +params.id, contact_type: 'phone', contact_value: ''}
              ] :
              contactData;
            setTitleContact({
              title: titleData,
              contactInfo: dataToAdd
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

  useEffect(() => {
    fetchTitleAndContactInformation();
  }, [params]);

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

  useEffect(() => {
    console.log('titleContact changed:', titleContact);
  }, [titleContact]);

  const handleRemoveContact = (values: TitleContactInfo, index: number) => {
    console.log('Removing contact', values);
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
    console.log('Adding contact', values);
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
      {titleContact ? (<> {/* TODO: Fiks slik at det funker også når contactInfo ikke finnes. */}
        <div className='flex flex-row flex-wrap self-center w-full justify-evenly'>
          <div className='flex flex-col grow mx-10'>
            <div>
              <div className='w-full mb-3'>
                {titleString ? (
                  <h1 className="top-title-style">{titleString}</h1>
                ) : (
                  <p>Henter tittel ...</p>
                )}
                <div className="flex justify-center gap-2">
                  <p className="group-title-style"> Katalog ID: </p>
                  <a className="group-content-style underline" href={titleLink} target="_blank">
                    <div className="flex flex-row gap-2">
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
                <div className='flex flex-row justify-between items-center mt-4'>
                  <EditTextInput
                    name='Hyllesignatur'
                    value={titleContact.title.shelf ?? ''}
                    onSubmit={submitShelf}
                    onSuccess={updateShelfLocally}
                    className='w-96'
                  />
                </div>
              </div>

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

                <Button
                  endContent={<FaBoxOpen size={25}/>}
                  size={'md'}
                  className="edit-button-style ml-4 [&]:text-medium"
                  onClick={() => setShowBoxRegistrationModal(true)}>
                  Ny eske
                </Button>
              </div>

              {boxFromDb ? (
                <IssueList title={titleContact.title} box={boxFromDb}/>
              ) : (
                <p className='mt-20 group-content-style text-start'>Legg til eske for å legge inn avisutgaver</p>
              )}

            </div>
          </div>

          <div className="flex flex-col w-96">
            <div className='items-start mt-16 w-72 mb-6'>
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
                              <Button
                                type="submit"
                                size="lg"
                                className="save-button-style"
                                endContent={<FaSave size={25}/>}
                                disabled={!isValid || isSubmitting}
                              >
                                Lagre
                              </Button>

                              <Button
                                type="button"
                                size="lg"
                                className="abort-button-style"
                                endContent={<ImCross size={25}/>}
                                onClick={() => {
                                  resetForm();
                                  setIsEditing(false);
                                }}
                              >
                                Avbryt
                              </Button>
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
                      <Button
                        type="button"
                        size="lg"
                        className="edit-button-style mt-5"
                        endContent={<FaEdit size={25}/>}
                        onClick={() => setIsEditing(true)}
                      >
                        Rediger
                      </Button>
                    </div>
                  }
                </>
              )}

              {showSuccess && (
                <div className='my-2.5'>
                  <Alert color='success' title='Kontaktinformasjonen ble lagret' onClose={() => setShowSuccess(false)} />
                </div>
              )}

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

      { /* TODO: make title not found component */ }
      {titleFromDbNotFound &&
          <>
            {titleString ? (
              <div className='flex flex-col items-center'>
                <h1 className="top-title-style">{titleString}</h1>
                {catalogTitle && catalogTitle.endDate && (
                  <WarningLabel
                    className="mt-2"
                    text={`Denne avisen ble avsluttet ${catalogDateStringToNorwegianDateString(catalogTitle.endDate)}`}
                  />
                )}
              </div>
            ) : (
              <p>Henter tittel ...</p>
            )}

            <p className="mt-10 text-lg">Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å
              legge til? </p>
            <div className="mt-12 flex justify-between max-w-3xl w-full self-center">
              <Button
                type="button"
                size={'lg'}
                startContent={<FaArrowAltCircleLeft/>}
                className="abort-button-style"
                onClick={() => router.push('/')}
              >
                Tilbake
              </Button>
              <Button
                type="button"
                size={'lg'}
                className="edit-button-style"
                endContent={<FaEdit/>}
                onClick={() => router.push(`/${params.id}/create?title=${titleString}`)}
              >
                Legg til informasjon
              </Button>
            </div>
          </>
      }

      <ErrorModal
        text={errorMessage}
        showModal={showError}
        onExit={() => setShowError(false)}
      />
    </div>
  );
}
