import {newspaper, title} from '@prisma/client';
import React, {useEffect, useState} from 'react';
import {getIssuesForTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikValues, useField} from 'formik';
import {FaTrash} from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import {Button, Spinner, Table} from '@nextui-org/react';
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
      formTitles.unshift({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        title_id: props.title.id,
        edition: '',
        date: null,
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
      errors.push(issueError);
    });
    if (isValid)
      return {};
    return {issues: errors} as FormikErrors<newspaper>;
  }

  function newspaperIsSaved(index: number, arrayLength: number) {
    return index >= arrayLength - nIssuesInDb;
  }

  return (
    <div className='w-full mb-6 mt-4 py-10 border-style m-30'>
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
            const newIssues = values.issues.slice(0, values.issues.length - nIssuesInDb);
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
          {({ values, isSubmitting, setFieldValue }) => (
            <Form>
              <FieldArray name="issues">
                {({insert, remove}) => (
                  <div className="mx-6">
                    <div className='flex flex-row mb-5'>
                      <Button
                        type="button"
                        className="edit-button-style"
                        disabled={isSubmitting}
                        onClick={() => {
                          insert(0, {
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            title_id: props.title.id,
                            edition: '',
                            date: '',
                            // eslint-disable-next-line @typescript-eslint/naming-convention
                            received: false,
                            username: null,
                            notes: null,
                            box: props.title.last_box
                          });
                        }}
                      >
                        Legg til ny utgave
                      </Button>

                      <Button
                        className="save-button-style ml-auto min-w-28"
                        type="submit"
                        disabled={isSubmitting}
                        startContent={isSubmitting && <Spinner className='ml-1' size='sm'/>}
                      >Lagre</Button>
                    </div>

                    <Table aria-label="list of issues in current box"
                      classNames={{base: 'text-lg', table: 'min-h-80'}}>
                      <TableHeader>
                        <TableColumn align='center' className="text-lg">Dag</TableColumn>
                        <TableColumn align='center' className="text-lg">Dato</TableColumn>
                        <TableColumn align='center' className="text-lg">Nummer</TableColumn>
                        <TableColumn align='center' className="text-lg">Ikke mottatt</TableColumn>
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
                                disabled={newspaperIsSaved(index, values.issues.length)}
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
                                disabled={newspaperIsSaved(index, values.issues.length)}
                              />
                              <ErrorMessage
                                name={`issues.${index}.edition`}
                                component="div"
                                className="field-error text-lg"
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.not_received`}
                                type="checkbox"
                                disabled={newspaperIsSaved(index, values.issues.length)}
                                value={!issue.received}
                                checked={!issue.received}
                                onChange={() => setFieldValue(`issues.${index}.received`, false)}
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.received`}
                                type="checkbox"
                                disabled={newspaperIsSaved(index, values.issues.length)}
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
                                disabled={newspaperIsSaved(index, values.issues.length)}
                                value={issue.notes || ''}
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              { !newspaperIsSaved(index, values.issues.length) &&
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
                  </div>
                )}
              </FieldArray>
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

  function convertLocalDateToUTCDateString(date: string) : Date {
    const oldDate = new Date(date);
    // Both prisma and DatePicker have bad support for timezones, causing a need for this workaround
    // 1 min = 60s * 1000ms = 60000ms; timezoneOffset is in minutes from current to UTC, causing a subtraction
    // E.g. getTimezoneOffset() returns -120 for CEST, so 2 hours are essentially added to the old date with the double negative
    return new Date(oldDate.getTime() - oldDate.getTimezoneOffset() * 60000);
  }

  return (
    <DatePicker
      id={props.fieldName}
      {...field}
      {...props}
      onChange={val => {
        if (val) void setValue(convertLocalDateToUTCDateString(val.toString()));
      }}
      locale='no-NB'
      onBlur={() => field.onBlur(field.name)}
    />
  );
};
