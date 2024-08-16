import {newspaper, title} from '@prisma/client';
import React, {useEffect, useState} from 'react';
import {getIssuesForTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikValues, useField} from 'formik';
import {FaTrash} from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Button, Spinner, Table } from '@nextui-org/react';
import {TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import ErrorModal from '@/components/ErrorModal';


export default function IssueList(props: {title: title}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);

  const initialValues = { issues };

  useEffect(() => {
    function prepareTitles(titles: newspaper[]) {
      const formTitles = titles;
      formTitles.push({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        title_id: props.title.id,
        edition: '',
        date: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        not_published: false,
        received: false,
        username: null,
        box: props.title.last_box ?? '',
        notes: null
      });
      return formTitles;
    }
    void getIssuesForTitle(props.title.id, props.title.last_box ?? '')
      .then((data: newspaper[]) => {
        setNIssuesInDb(data.length);
        setIssues(prepareTitles(data));
        setLoading(false);
      });
  }, [props, nIssuesInDb]);

  function dayOfWeek(date: Date | null) : string {
    if (date) {
      const dateObject = new Date(date);
      return `${dateObject.toLocaleDateString('no-NB', { weekday: 'long' })}`;
    } else return '';
  }

  interface errorType {
    date: string | null;
    edition: string | null;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    not_published: string | null;
    received: string | null;
  }

  function validate(values: FormikValues): FormikErrors<newspaper> {
    const errors: errorType[] = [];
    const formIssues = values.issues as newspaper[];
    let isValid = true;
    formIssues.forEach((issue: newspaper) => {
      const issueError: errorType = {
        date: null,
        edition: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        not_published: null,
        received: null
      };
      const identicalEditionNumbers = formIssues.filter(i => i.edition === issue.edition).length;
      if (identicalEditionNumbers > 1) {
        isValid = false;
        issueError.edition = 'Duplikat!';
      }
      if (!issue.date) {
        isValid = false;
        issueError.date = 'Dato er påkrevd';
      }
      if (!issue.edition) {
        isValid = false;
        issueError.edition = 'Påkrevd';
      }
      if (issue.not_published && issue.received) {
        isValid = false;
        issueError.not_published = '!';
        issueError.received = '!';
      }
      errors.push(issueError);
    });
    if (isValid)
      return {};
    return {issues: errors} as FormikErrors<newspaper>;
  }

  return (
    <div className='w-full mb-6 mt-4 py-10 pl-50 pr-50 border-5 border-blue-200 m-30'>
      { loading ? (
        <Spinner/>
      ) : (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validate={validate}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values, {setSubmitting}) => {
            setSubmitting(true);
            const newIssues = values.issues.slice(nIssuesInDb);
            void postNewIssuesForTitle(props.title.id, newIssues)
              .then(res => {
                if (res.ok) {
                  setNIssuesInDb(values.issues.length);
                } else {
                  setShowError(true);
                }
              })
              .catch(() => setShowError(true))
              .finally(() => setSubmitting(false));
          }}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <FieldArray name="issues">
                {({push, remove}) => (
                  <div className="mx-6">
                    <Table aria-label="list of issues in current box" className="text-lg"
                      classNames={{table: 'min-h-80'}}>
                      <TableHeader>
                        <TableColumn align='center' className="text-lg">Dag</TableColumn>
                        <TableColumn align='center' className="text-lg">Dato</TableColumn>
                        <TableColumn align='center' className="text-lg">Nummer</TableColumn>
                        <TableColumn align='center' className="text-lg">Ikke utgitt</TableColumn>
                        <TableColumn align='center' className="text-lg">Mottatt</TableColumn>
                        <TableColumn align='center' className="text-lg">Kommentar</TableColumn>
                        <TableColumn align='center' hideHeader={true} className="text-lg">Slett</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {values.issues.map((issue, index) => (
                          <TableRow key={index}>
                            <TableCell className="text-lg">
                              {dayOfWeek(issue.date)}
                            </TableCell>
                            <TableCell className="text-lg">
                              <DatePickerField
                                id={`issues.${index}.date`}
                                value={issue.date}
                                fieldName={`issues.${index}.date`}
                                disabled={index < nIssuesInDb}
                              />
                              <ErrorMessage
                                name={`issues.${index}.date`}
                                component="div"
                                className="field-error text-lg"
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.edition`}
                                className="max-w-16 border text-center"
                                type="text"
                                width='40'
                                disabled={index < nIssuesInDb}
                              />
                              <ErrorMessage
                                name={`issues.${index}.edition`}
                                component="div"
                                className="field-error text-lg"
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.not_published`}
                                type="checkbox"
                                disabled={index < nIssuesInDb}
                                value={Boolean(issue.not_published)}
                                checked={Boolean(issue.not_published)}
                              />
                              <ErrorMessage
                                name={`issues.${index}.not_published`}
                                component="div"
                                className="field-error text-lg"
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.received`}
                                type="checkbox"
                                disabled={index < nIssuesInDb}
                                value={Boolean(issue.received)}
                                checked={Boolean(issue.received)}
                              />
                              <ErrorMessage
                                name={`issues.${index}.received`}
                                component="div"
                                className="field-error text-lg"
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.notes`}
                                className="border"
                                type="text"
                                disabled={index < nIssuesInDb}
                                value={issue.notes || ''}
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              { index > nIssuesInDb - 1 &&
                                <button
                                  type="button"
                                  onClick={() => remove(index)}>
                                  <FaTrash/>
                                </button>
                              }
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <Button
                      type="button"
                      className="edit-button-style my-4"
                      disabled={isSubmitting}
                      onClick={() => {
                        push({
                          // eslint-disable-next-line @typescript-eslint/naming-convention
                          title_id: props.title.id,
                          edition: '',
                          date: '',
                          // eslint-disable-next-line @typescript-eslint/naming-convention
                          not_published: false,
                          received: false,
                          username: null,
                          notes: null,
                          box: props.title.last_box
                        });
                      }}
                    >
                      Legg til ny utgave
                    </Button>
                  </div>
                )}
              </FieldArray>
              <Button
                className="save-button-style"
                type="submit"
                disabled={isSubmitting}
                startContent={isSubmitting && <Spinner className='ml-1' size='sm'/>}
              >Lagre</Button>
            </Form>
          )}
        </Formik>
      )}

      <ErrorModal
        text='Kunne ikke lagre avisutgaver.'
        onExit={() => setShowError(false)}
        showModal={showError}
      />
    </div>
  );
}

const DatePickerField = (props: { fieldName: string; value: Date | null; id?: string; disabled?: boolean }) => {
  const [field, , {setValue}] = useField(props.fieldName);
  return (
    <DatePicker
      id={props.fieldName}
      {...field}
      {...props}
      onChange={val => {
        void setValue(val);
      }}
      locale='no-NB'
    />
  );
};
