'use client';

import React, {useEffect, useState} from 'react';
import {title} from '@prisma/client';
import {getLocalTitle, postLocalTitle} from '@/services/local.data';
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

export default function Page({params}: { params: { id: string } }) {
  const router = useRouter();
  const [titleString, setTitleString] = useState<string>();
  const [titleFromDb, setTitleFromDb] = useState<title>();
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
          setTitleFromDb({
            id: +params.id,
            vendor: '',
            /* eslint-disable @typescript-eslint/naming-convention */
            contact_name: '',
            contact_email: '',
            contact_phone: '',
            release_pattern: [0, 0, 0, 0, 0, 0, 0],
            /* eslint-enable @typescript-eslint/naming-convention */
          } as title);
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

  return (
    <div className='flex w-9/12 flex-col max-w-screen-lg items-start'>
      <Button
        type='button'
        className='abort-button-style'
        startContent={<FaArrowAltCircleLeft/>}
        onClick={() => router.push(`/${params.id}?title=${titleString}`)}
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

      {titleFromDb ? (
        <div>
          <Formik
            enableReinitialize
            initialValues={titleFromDb}
            onSubmit={(values: title, {setSubmitting}) => {
              void postLocalTitle(values)
                .then(res => {
                  if (res.ok) {
                    showSavedMessage();
                  } else {
                    setErrorText('Noe gikk galt ved lagring.');
                    setShowError(true);
                  }
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
                  />

                  <div className='w-60 overflow-auto flex flex-col mb-6'>
                    <p className='group-title-style mb-4 text-left'> Utgivelsesmønster </p>
                    <ReleasePatternForm releasePattern={values.release_pattern} handleChange={handleChange} handleBlur={handleBlur} />
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
                      id='shelf'
                      className='input-text-style'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.shelf ?? ''}
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
                      id='notes'
                      className='w-80 mt-3'
                      variant='bordered'
                      maxRows={10}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.notes ?? ''}
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
