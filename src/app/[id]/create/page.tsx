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
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import NumberInputWithButtons from '@/components/NumberInput';
import SuccessModal from '@/components/SuccessModal';
import {FaArrowAltCircleLeft, FaSave} from 'react-icons/fa';
import {Textarea} from '@nextui-org/input';
import {validateBetweenZeroAndFive} from '@/utils/validationUtils';

export default function Page({params}: { params: { id: string } }) {
  const router = useRouter();
  const [titleString, setTitleString] = useState<string>();
  const [titleFromDb, setTitleFromDb] = useState<title>();
  const [saveMessageIsVisible, setSaveMessageIsVisible] = useState<boolean>(false);
  const titleFromQueryParams = useSearchParams()?.get('title');

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
      document.title = titleString ? 'Opprett ' + titleString : 'Hugin';
    }

    void fetchNewspaperTitleFromCatalog(params.id)
      .then((data: CatalogTitle) => {
        setTitleString(data.name);
        document.title = titleString ? 'Opprett ' + titleString : 'Hugin';
      });
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
          alert('Noe gikk galt ved henting av tittelinformasjon. Kontakt tekst-teamet om problemet vedvarer.');
        }
      });
  }, [params, router, titleString]);

  function showSavedMessage() {
    setSaveMessageIsVisible(true);
    setTimeout(() => setSaveMessageIsVisible(false), 5000);
  }

  async function submitForm(values: title) {
    const res = await postLocalTitle(values);
    if (res.ok) {
      showSavedMessage();
      setTimeout(() => router.push(`/${params.id}?title=${titleString}`), 5000);
    } else {
      alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
    }
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
              void submitForm(values)
                .then(() => setSubmitting(false));
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
                  <div className='w-60 mr-20 flex flex-col mb-6'>
                    <p className='group-title-style mb-4 text-left'>Kontaktinformasjon</p>
                    <label htmlFor='vendor' className='group-subtitle-style mb-1 self-start'> Avleverer </label>
                    <Field
                      type='text'
                      id='vendor'
                      className='input-text-style mb-3'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.vendor ?? ''}
                    />

                    <label htmlFor='contact_name' className='group-subtitle-style mb-1 self-start'> Navn </label>
                    <Field
                      type='text'
                      id='contact_name'
                      className='input-text-style mb-3'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_name ?? ''}
                    />

                    <label htmlFor='contact_email' className='group-subtitle-style mb-1 self-start'> E-post </label>
                    <Field
                      type='text'
                      id='contact_email'
                      className='input-text-style mb-3'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_email ?? ''}
                    />

                    <label htmlFor='contact_phone' className='group-subtitle-style mb-1 self-start'> Telefon </label>
                    <Field
                      type='text'
                      id='contact_phone'
                      className='input-text-style'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_phone ?? ''}
                    />
                  </div>

                  <div className='w-60 overflow-auto flex flex-col mb-6 my-4'>
                    <p className='group-title-style mb-4 text-left'> Utgivelsesmønster </p>
                    <Table hideHeader removeWrapper className='table-fixed text-left' aria-labelledby='releaseTable'>
                      <TableHeader>
                        <TableColumn>Dag</TableColumn>
                        <TableColumn>Antall</TableColumn>
                      </TableHeader>
                      <TableBody>
                        <TableRow className='text-left'>
                          <TableCell className='text-lg p-0'>Mandag</TableCell>
                          <TableCell className='py-0 pr-0 w-full'>
                            <Field
                              name={'release_pattern[0]'}
                              value={+values.release_pattern[0]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Tirsdag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[1]'}
                              value={+values.release_pattern[1]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Onsdag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[2]'}
                              value={+values.release_pattern[2]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Torsdag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[3]'}
                              value={+values.release_pattern[3]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Fredag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[4]'}
                              value={+values.release_pattern[4]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Lørdag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[5]'}
                              value={+values.release_pattern[5]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>

                        <TableRow>
                          <TableCell className='text-lg p-0'>Søndag</TableCell>
                          <TableCell className='py-0 pr-0'>
                            <Field
                              name={'release_pattern[6]'}
                              value={+values.release_pattern[6]}
                              component={NumberInputWithButtons}
                              className='input-number-style'
                              onChange={handleChange}
                              validate={validateBetweenZeroAndFive}
                              onBlur={handleBlur}
                              minValue={0}
                              maxValue={5}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>

                  <div>
                    <p className='group-title-style text-left mb-2'> Hyllesignatur </p>
                    <Field
                      type='text'
                      id='shelf'
                      className='input-text-style'
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.shelf ?? ''}
                    />

                    <p className='group-title-style text-left mt-6'> Merknad/kommentar </p>
                    <Textarea
                      id='notes'
                      className='w-80 mt-3 input-textarea-style'
                      maxRows={10}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.notes ?? ''}
                    />
                  </div>
                </div>

                <div className="mt-10">
                  <Button
                    type='submit'
                    disabled={isSubmitting || !isValid}
                    size='lg'
                    endContent={<FaSave/>}
                    className='save-button-style'
                  >
                    Lagre
                  </Button>
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
    </div>
  );
}
