'use client';

import React, {useEffect, useState} from 'react';
import {contact_info} from '@prisma/client';
import {getLocalTitle, postContactInfo, postLocalTitle} from '@/services/local.data';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {Field, Form, Formik} from 'formik';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@nextui-org/button';
import {NotFoundError} from '@/models/Errors';
import SuccessModal from '@/components/SuccessModal';
import {FaArrowAltCircleLeft, FaQuestionCircle, FaSave} from 'react-icons/fa';
import {Textarea} from '@nextui-org/input';
import ErrorModal from '@/components/ErrorModal';
import {Spinner, Tooltip} from '@nextui-org/react';
import ContactInformationForm from '@/components/ContactInformationForm';
import ReleasePatternForm from '@/components/ReleasePatternForm';
import {TitleContactInfo} from '@/models/TitleContactInfo';

export default function Page({params}: { params: { id: string } }) {
  const router = useRouter();
  const [titleString, setTitleString] = useState<string>();
  const [titleAndContactFromDb, setTitleAndContactFromDb] = useState<TitleContactInfo>();
  const [saveMessageIsVisible, setSaveMessageIsVisible] = useState<boolean>(false);
  const titleFromQueryParams = useSearchParams()?.get('title');
  const [showError, setShowError] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>('Noe gikk galt.');

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
      document.title = titleString ? 'Opprett ' + titleString : 'Hugin';
    } else {
      void fetchNewspaperTitleFromCatalog(params.id)
        .then((data: CatalogTitle) => {
          setTitleString(data.name);
          document.title = titleString ? 'Opprett ' + titleString : 'Hugin';
        })
        .catch(() => {
          setErrorText('Kunne ikke finne tittel i katalogen. Dobbeltsjekk at ID er korrekt.');
          setShowError(true);
        });
    }
  }, [params, titleFromQueryParams, titleString]);

  useEffect(() => {
    void getLocalTitle(params.id)
      .then(() => {
        router.push(`/${params.id}?title=${titleString}`);
      })
      .catch((e: Error) => {
        if (e instanceof NotFoundError) {
          setTitleAndContactFromDb({
            title: {
              id: +params.id,
              vendor: '',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              contact_name: '',
              // eslint-disable-next-line @typescript-eslint/naming-convention
              release_pattern: [0, 0, 0, 0, 0, 0, 0],
              shelf: '',
              notes: ''
            },
            contactInfo: [
              // eslint-disable-next-line @typescript-eslint/naming-convention
              {id: '', title_id: +params.id, contact_type: 'email', contact_value: ''},
              // eslint-disable-next-line @typescript-eslint/naming-convention
              {id: '', title_id: +params.id, contact_type: 'phone', contact_value: ''}
            ] as contact_info[]
          });
        } else {
          setErrorText('Noe gikk galt ved henting av tittelinformasjon.');
          setShowError(true);
        }
      });
  }, [params, router, titleString]);

  function showSavedMessage() {
    setSaveMessageIsVisible(true);
    setTimeout(() => setSaveMessageIsVisible(false), 5000);
  }

  const handleRemoveContact = (values: TitleContactInfo, index: number) => {
    const newContacts = values?.contactInfo.filter((_, i) => i !== index);
    setTitleAndContactFromDb({
      ...values,
      contactInfo: newContacts ?? []
    } as TitleContactInfo);
  };

  const handleAddContact = (values: TitleContactInfo, type: 'email' | 'phone') => {
    setTitleAndContactFromDb({
      ...values,
      contactInfo: [
        ...values?.contactInfo ?? [],
        // eslint-disable-next-line @typescript-eslint/naming-convention
        {id: '', title_id: +params.id, contact_type: type, contact_value: ''}
      ]
    } as TitleContactInfo);
  };

  return (
    <div className='flex w-9/12 flex-col max-w-screen-lg items-start'>
      <Button
        type='button'
        className='abort-button-style'
        startContent={<FaArrowAltCircleLeft/>}
        onPress={() => router.push(`/${params.id}?title=${titleString}`)}
      >
        Tilbake til titteloversikt
      </Button>

      <div className='flex flex-row justify-between mt-6 mb-10'>
        <div>
          {titleString ? (
            <div className='flex flex-row items-center'>
              <h1 className='top-title-style'> {titleString} </h1>
              <p className='ml-4 text-2xl'> ({params.id}) </p>
            </div>
          )
            : (<p>Henter navn fra katalogen...</p>)
          }
        </div>
      </div>

      {titleAndContactFromDb ? (
        <div>
          <Formik
            enableReinitialize
            initialValues={titleAndContactFromDb}
            onSubmit={(values: TitleContactInfo, {setSubmitting}) => {
              void postLocalTitle({
                id: +params.id,
                vendor: values.title.vendor,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                contact_name: values.title.contact_name,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                release_pattern: values.title.release_pattern,
                shelf: '',
                notes: ''
              })
                .then(res => {
                  if (!res.ok) {
                    setErrorText('Noe gikk galt ved lagring.');
                    setShowError(true);
                  }
                })
                .then(async () => {
                  await postContactInfo(+params.id, values.contactInfo).then(res => {
                    if (res.ok) {
                      showSavedMessage();
                    } else {
                      setErrorText('Noe gikk galt ved lagring av kontaktinformasjon.');
                      setShowError(true);
                    }
                  }).catch(() => {
                    setErrorText('Noe gikk galt ved lagring av kontaktinformasjon.');
                    setShowError(true);
                  });
                })
                .catch(() => {
                  setErrorText('Noe gikk galt ved lagring.');
                  setShowError(true);
                })
                .finally(() => setSubmitting(false));
            }}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              isValid
            }) => (
              <Form className='flex flex-col items-start' onSubmit={handleSubmit}>
                <div className='flex flex-row flex-wrap'>
                  <ContactInformationForm
                    className='w-60 mr-20 flex flex-col mb-6'
                    values={values}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                    handleRemove={handleRemoveContact}
                    handleAdd={handleAddContact}
                  />

                  <div className='w-60 overflow-auto flex flex-col mb-6'>
                    <p className='group-title-style mb-4 text-left'> Utgivelsesmønster </p>
                    <ReleasePatternForm releasePattern={values.title.release_pattern} handleChange={handleChange} handleBlur={handleBlur} />
                  </div>

                  <div>
                    <div className='group-title-style text-left mb-2'>
                      Hyllesignatur
                      <Tooltip content='Plassering av avis i paternoster.'>
                        <div className='inline-block ml-2'>
                          <FaQuestionCircle className={'text-blue-600'} size={18} />
                        </div>
                      </Tooltip>
                    </div>
                    <Field
                      type='text'
                      id='title.shelf'
                      className='input-text-style'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.title.shelf ?? ''}
                    />

                    <div className='group-title-style text-left mt-6'>
                      Merknad/kommentar
                      <Tooltip content='Kommentarer blir kun liggende i Hugin og lagres ikke i katalogen.'>
                        <div className='inline-block ml-2'>
                          <FaQuestionCircle className={'text-blue-600'} size={18} />
                        </div>
                      </Tooltip>
                    </div>
                    <Textarea
                      id='title.notes'
                      className='w-80 mt-3'
                      variant='bordered'
                      maxRows={10}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.title.notes ?? ''}
                    />
                  </div>
                </div>

                <div className="mt-10">
                  {isSubmitting ? (
                    <Spinner size={'lg'} className='py-3'/>
                  ) : (
                    <Button
                      type='submit'
                      disabled={isSubmitting || !isValid}
                      size='lg'
                      endContent={<FaSave/>}
                      className='save-button-style'
                    >
                      Lagre
                    </Button>
                  )}
                </div>
              </Form>

            )}
          </Formik>
          <div>
            {saveMessageIsVisible &&
                <SuccessModal
                  text='Lagret!'
                  buttonText='Til titteloversikt'
                  buttonOnClick={() => router.push(`/${params.id}?title=${titleString}`)}
                  onExit={() => router.push(`/${params.id}?title=${titleString}`)}
                />}
          </div>
        </div>
      ) : (<p className=''> Henter skjema...</p>)}

      <ErrorModal
        text={errorText}
        onExit={() => setShowError(false)}
        showModal={showError}
      />
    </div>
  );
}
