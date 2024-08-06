'use client';

import React, {useEffect, useState} from 'react';
import {title} from '@prisma/client';
import {getLocalTitle, postLocalTitle} from '@/services/local.data';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {Field, Form, Formik} from 'formik';
import {useRouter, useSearchParams} from 'next/navigation';
import {Button} from '@nextui-org/button';
import { NotFoundError } from '@/models/Errors';

export default function Page({params}: { params: { id: string } }) {
  const router = useRouter();
  const [titleString, setTitleString] = useState<string>();
  const [titleFromDb, setTitleFromDb] = useState<title>();
  const [saveMessageIsVisible, setSaveMessageIsVisible] = useState<boolean>(false);
  const titleFromQueryParams = useSearchParams()?.get('title');

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
    } else {
      void fetchNewspaperTitleFromCatalog(params.id).then((data: CatalogTitle) => setTitleString(data.name));
    }
  }, [params, titleFromQueryParams]);

  useEffect(() => {
    void getLocalTitle(params.id)
      .then((data: title) => setTitleFromDb(data))
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
  }, [params]);

  function showSavedMessage() {
    setSaveMessageIsVisible(true);
    setTimeout(() => setSaveMessageIsVisible(false), 5000);
  }

  function validatePositiveNumber(value: number) {
    let error;
    if (value < 0) {
      error = 'Tallet kan ikke være negativt';
    }
    return error;
  }

  return (
    <div className="flex w-10/12 flex-col max-w-screen-lg">
      <div className="mb-7">
        {titleString ? (<h1>{titleString} ({params.id})</h1>)
          : (<p>Henter navn fra katalogen...</p>)
        }
      </div>
      {titleFromDb ? (
        <div>
          <h2 className="mb-5">Rediger tittelinformasjon</h2>
          <Formik
            enableReinitialize
            initialValues={titleFromDb}
            onSubmit={(values, {setSubmitting}) => {
              void postLocalTitle(values).then(res => {
                setSubmitting(false);
                if (res.ok) {
                  showSavedMessage();
                } else {
                  alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                }
              });

            }}
          >
            {({
              values,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
              errors,
              isValid
            }) => (
              <Form className="flex flex-col" onSubmit={handleSubmit}>
                <div className="flex flex-row">
                  <div className="w-2/3 mr-10">
                    <label htmlFor="vendor" className="block text-gray-700 text-sm mb-1"> Avleverer </label>
                    <Field
                      type="text"
                      name="vendor"
                      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.vendor ?? ''}
                    />

                    <label htmlFor="contact_name"
                      className="block text-gray-700 text-sm mb-1"> Kontaktperson </label>
                    <Field
                      type="text"
                      name="contact_name"
                      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_name ?? ''}
                    />

                    <label htmlFor="contact_email" className="block text-gray-700 text-sm mb-1"> E-post </label>
                    <Field
                      type="text"
                      name="contact_email"
                      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_email ?? ''}
                    />

                    <label htmlFor="contact_phone" className="block text-gray-700 text-sm mb-1"> Telefon </label>
                    <Field
                      type="text"
                      name="contact_phone"
                      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                      onChange={handleChange}
                      onBlur={handleBlur}
                      value={values.contact_phone ?? ''}
                    />
                  </div>

                  <div className="w-1/3 overflow-auto">
                    <label className="text-gray-700 text-sm mb-1"> Utgivelsesmønster </label>
                    <table className="w-full table-fixed">
                      <tbody className="">
                        <tr className="">
                          <td className="w-1/2">Mandag</td>
                          <td className="w-1/2 ml-2">
                            <Field
                              type="number"
                              name="release_pattern[0]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[0] ?? 0}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[0] && <p>{errors.release_pattern[0]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Tirsdag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[1]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[1]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[1] && <p>{errors.release_pattern[1]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Onsdag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[2]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[2]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[2] && <p>{errors.release_pattern[2]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Torsdag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[3]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[3]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[3] && <p>{errors.release_pattern[3]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Fredag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[4]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[4]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[4] && <p>{errors.release_pattern[4]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Lørdag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[5]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[5]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[5] && <p>{errors.release_pattern[5]}</p>}
                          </td>
                        </tr>

                        <tr>
                          <td>Søndag</td>
                          <td>
                            <Field
                              type="number"
                              name="release_pattern[6]"
                              className="border w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              value={+values.release_pattern[6]}
                              validate={validatePositiveNumber}
                            />
                            {errors.release_pattern && errors.release_pattern[6] && <p>{errors.release_pattern[6]}</p>}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-10 flex w-full justify-between">
                  <button
                    type="button"
                    className="bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    onClick={() => router.push(`/${params.id}`)}
                  >
                    Tilbake
                  </button>

                  <Button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className="bg-blue-400 enabled:hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:bg-red-400"
                  >
                    Lagre
                  </Button>
                </div>
              </Form>

            )}
          </Formik>
          <div>
            {saveMessageIsVisible && <p className="flex justify-end mt-2"> Lagret! </p>}
          </div>
        </div>
      ) : (<p> Henter skjema...</p>)}
    </div>
  );
}
