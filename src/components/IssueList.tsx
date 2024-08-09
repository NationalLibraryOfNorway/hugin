import {newspaper, title} from '@prisma/client';
import React, {useEffect, useState} from 'react';
import {getIssuesForTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, useField} from 'formik';
import {FaEdit, FaTrash} from 'react-icons/fa';
import DatePicker from 'react-date-picker';
import 'react-date-picker/dist/DatePicker.css';
import 'react-calendar/dist/Calendar.css';


export default function IssueList(props: {title: title}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [editableIssues, setEditableIssues] = useState<boolean[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);

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
        not_published: null,
        received: null,
        username: null,
        box: props.title.last_box ?? '',
        notes: null
      });
      return formTitles;
    }
    void getIssuesForTitle(props.title.id)
      .then((data: newspaper[]) => {
        setNIssuesInDb(data.length);
        const editableIndices = new Array<boolean>(data.length);
        editableIndices.fill(false);
        editableIndices.push(true);
        setEditableIssues(editableIndices);
        setIssues(prepareTitles(data));
      });
  }, [props]);

  function safeDate(date: Date | null) : string {
    if (date) {
      const dateObject = new Date(date);
      return `${dateObject.toLocaleDateString('no-NB', { weekday: 'long' })}`;
    } else return '';
  }

  return (
    <div>
      <p>Form:</p>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={(values, {setSubmitting}) => {
          const newIssues = values.issues;
          setTimeout(() => {
            void postNewIssuesForTitle(props.title.id, newIssues).then(res => {
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
          }, 400);
        }}
      >
        {({ values }) => (
          <Form>
            <FieldArray name="issues">
              {({push, remove}) => (
                <div>
                  <table>
                    <thead>
                      <tr>
                        <th>Dag</th>
                        <th>Dato</th>
                        <th>Nummer</th>
                        <th className="min-w-16">Ikke utgitt</th>
                        <th className="min-w-16">Mottatt</th>
                        <th>Kommentar</th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {values.issues.map((issue, index) => (
                        <tr key={index}>
                          <td>
                            {safeDate(issue.date)}
                          </td>
                          <td>
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
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.edition`}
                              className="max-w-16 border text-center"
                              type="text"
                              width='40'
                              disabled={!editableIssues[index]}
                            />
                            <ErrorMessage
                              name={`issues.${index}.edition`}
                              component="div"
                              className="field-error"
                            />
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.not_published`}
                              type="checkbox"
                              disabled={!editableIssues[index]}
                              value={issue.not_published || false}
                              checked={issue.not_published || false}
                            />
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.received`}
                              type="checkbox"
                              disabled={!editableIssues[index]}
                              value={issue.received || false}
                              checked={issue.received || false}
                            />
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.notes`}
                              className="border"
                              type="text"
                              disabled={!editableIssues[index]}
                              value={issue.notes || ''}
                            />
                          </td>
                          <td>
                            {!editableIssues[index] &&
                                <button
                                  type="button"
                                  className="secondary"
                                  onClick={() => {
                                    setEditableIssues(editableIssues.with(index, true));
                                  }}>
                                  <FaEdit/>
                                </button>
                            }
                          </td>
                          <td>
                            { index > nIssuesInDb - 1 &&
                              <button
                                type="button"
                                className="secondary"
                                onClick={() => remove(index)}>
                                <FaTrash/>
                              </button>
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="secondary"
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
                    Add issue
                  </button>
                </div>
              )}
            </FieldArray>
            <button type="submit">Save</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}


const DatePickerField = (props: { fieldName: string; value: Date | null; id?: string; disabled?: boolean }) => {
  const [field, , {setValue}] = useField(props.fieldName);
  return (
    <DatePicker
      id={props.fieldName}
      // className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
      {...field}
      {...props}
      onChange={val => {
        void setValue(val);
      }}
      locale='no-NB'
    />
  );
};