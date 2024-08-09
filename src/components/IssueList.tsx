import {newspaper, title} from '@prisma/client';
import React, {useEffect, useState} from 'react';
import {getIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik} from 'formik';
import {FaEdit, FaTrash} from 'react-icons/fa';


interface formIssue extends newspaper {
  editable: boolean;
}

export default function IssueList(props: {forTitle: title}) {

  const [issuesFromDb, setIssuesFromDb] = useState<formIssue[]>([]);

  const initialValues = {
    issues: issuesFromDb
  };

  useEffect(() => {
    function prepareTitles(titles: newspaper[]) {
      const formTitles = titles.map(t =>
        Object.assign(t, {editable: false})
      );
      formTitles.push({
        // eslint-disable-next-line @typescript-eslint/naming-convention
        title_id: props.forTitle.id,
        edition: '',
        date: null,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        not_published: null,
        received: null,
        username: null,
        box: '',
        notes: null,
        editable: true
      });
      return formTitles;
    }
    void getIssuesForTitle(props.forTitle.id)
      .then((data: newspaper[]) => {
        setIssuesFromDb(prepareTitles(data));
      });
  }, [props]);

  function safeDate(date: Date | null) : string {
    if (date) {
      const dateObject = new Date(date);
      return `${dateObject.toLocaleDateString('no-NB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}`;
    } else return '';
  }

  return (
    <div>
      <p>Form:</p>

      <Formik
        initialValues={initialValues}
        enableReinitialize
        onSubmit={async values => {
          await new Promise(r => setTimeout(r, 500));
          alert(JSON.stringify(values, null, 2));
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
                            <Field
                              name={`issues.${index}.date`}
                              className=" border"
                              type="text"
                              disabled={!issue.editable}
                              value={safeDate(issue.date)}
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
                              className="max-w-16 border"
                              type="text"
                              width='40'
                              disabled={!issue.editable}
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
                              disabled={!issue.editable}
                              value={issue.not_published || false}
                              checked={issue.not_published || false}
                            />
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.received`}
                              type="checkbox"
                              disabled={!issue.editable}
                              value={issue.received || false}
                              checked={issue.received || false}
                            />
                          </td>
                          <td>
                            <Field
                              name={`issues.${index}.notes`}
                              className="border"
                              type="text"
                              disabled={!issue.editable}
                              value={issue.notes || ''}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => {
                                Object.assign(issue, {editable: true});
                                setIssuesFromDb(values.issues);
                              }}>
                              <FaEdit/>
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="secondary"
                              onClick={() => remove(index)}>
                              <FaTrash/>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <button
                    type="button"
                    className="secondary"
                    onClick={() => push({
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      title_id: props.forTitle.id,
                      edition: '',
                      date: '',
                      // eslint-disable-next-line @typescript-eslint/naming-convention
                      not_published: false,
                      received: false,
                      notes: '',
                      editable: true
                    })}
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
