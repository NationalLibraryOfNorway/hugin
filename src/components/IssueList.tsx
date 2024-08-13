import {newspaper, title} from '@prisma/client';
import React, {useEffect, useState} from 'react';
import {getIssuesForTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikValues, useField} from 'formik';
import {FaEdit, FaTrash} from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';
import { Button, Spinner, Table } from '@nextui-org/react';
import {TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';


export default function IssueList(props: {title: title}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [editableIssues, setEditableIssues] = useState<boolean[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

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
        const editableIndices = new Array<boolean>(data.length);
        editableIndices.fill(false);
        editableIndices.push(true);
        setEditableIssues(editableIndices);
        setIssues(prepareTitles(data));
        setLoading(false);
      });
  }, [props]);

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
      {loading ? (
        <Spinner/>
      ) : (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validate={validate}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={(values, {setSubmitting}) => {
            void postNewIssuesForTitle(props.title.id, values.issues).then(res => {
              setSubmitting(false);
              if (res.ok) {
                const editableIndices = new Array<boolean>(values.issues.length);
                editableIndices.fill(false);
                setEditableIssues(editableIndices);
                setIssues(values.issues);
                setNIssuesInDb(values.issues.length);
              } else {
                alert('Noe gikk galt...');
              }
            });
            setSubmitting(false);
          }}
        >
          {({ values, isSubmitting }) => (
            <Form>
              <FieldArray name="issues">
                {({push, remove}) => (
                  <div className="mx-6">
                    <Table aria-label="list of issues in current box">
                      <TableHeader>
                        <TableColumn align='center'>Dag</TableColumn>
                        <TableColumn align='center'>Dato</TableColumn>
                        <TableColumn align='center'>Nummer</TableColumn>
                        <TableColumn align='center'>Ikke utgitt</TableColumn>
                        <TableColumn align='center'>Mottatt</TableColumn>
                        <TableColumn align='center'>Kommentar</TableColumn>
                        <TableColumn align='center' hideHeader={true}>Action</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {values.issues.map((issue, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              {dayOfWeek(issue.date)}
                            </TableCell>
                            <TableCell>
                              <DatePickerField
                                id={`issues.${index}.date`}
                                value={issue.date}
                                fieldName={`issues.${index}.date`}
                                disabled={!editableIssues[index]}
                              />
                              <ErrorMessage
                                name={`issues.${index}.date`}
                                component="div"
                                className="field-error"
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                name={`issues.${index}.edition`}
                                className="max-w-16 border text-center"
                                type="text"
                                width='40'
                                disabled={!editableIssues[index] || index < nIssuesInDb}
                              />
                              <ErrorMessage
                                name={`issues.${index}.edition`}
                                component="div"
                                className="field-error"
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                name={`issues.${index}.not_published`}
                                type="checkbox"
                                disabled={!editableIssues[index]}
                                value={Boolean(issue.not_published)}
                                checked={Boolean(issue.not_published)}
                              />
                              <ErrorMessage
                                name={`issues.${index}.not_published`}
                                component="div"
                                className="field-error"
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                name={`issues.${index}.received`}
                                type="checkbox"
                                disabled={!editableIssues[index]}
                                value={Boolean(issue.received)}
                                checked={Boolean(issue.received)}
                              />
                              <ErrorMessage
                                name={`issues.${index}.received`}
                                component="div"
                                className="field-error"
                              />
                            </TableCell>
                            <TableCell>
                              <Field
                                name={`issues.${index}.notes`}
                                className="border"
                                type="text"
                                disabled={!editableIssues[index]}
                                value={issue.notes || ''}
                              />
                            </TableCell>
                            <TableCell>
                              {!editableIssues[index] &&
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditableIssues(editableIssues.with(index, true));
                                    }}>
                                    <FaEdit/>
                                  </button>
                              }
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
                        setEditableIssues(editableIssues.toSpliced(editableIssues.length, 0, true));
                      }}
                    >
                      Legg til ny utgave
                    </Button>
                  </div>
                )}
              </FieldArray>
              <Button className="save-button-style" type="submit" disabled={isSubmitting}>Lagre</Button>
            </Form>
          )}
        </Formik>
      )
      }
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
