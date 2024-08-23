import {newspaper, title} from '@prisma/client';
import React, {useCallback, useEffect, useState} from 'react';
import {getIssuesForTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikValues} from 'formik';
import {FaTrash} from 'react-icons/fa';
import {Button, CalendarDate, DatePicker, Spinner, Table} from '@nextui-org/react';
import {TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import ErrorModal from '@/components/ErrorModal';
import {parseDate} from '@internationalized/date';


export default function IssueList(props: {title: title}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  const initialValues = { issues };

  const proposeNewIssue = useCallback((currentIssues: newspaper[]): newspaper => {
    function getDaysToNextExpected(currentDayOfWeek: number) {
      // Current might be '0' from getDay, which is sunday...
      const dayIndexOfWeek = currentDayOfWeek === 0 ? 7 : currentDayOfWeek;

      // If release pattern only consists of 0s, just go to next day
      const pattern = props.title.release_pattern;
      if (pattern.every(day => day === 0)) return 1;

      // Using two patterns merged to continue after reaching sunday
      const doublePattern = pattern.concat(props.title.release_pattern);
      return doublePattern.findIndex((day, index) => index + 1 > dayIndexOfWeek && day !== 0) + 1 - dayIndexOfWeek;
    }

    function getNewestNewspaper(newspapers: newspaper[]): newspaper | null {
      if (newspapers.length === 0) return null;
      return newspapers.reduce((prev, current) => {
        return (prev.date ? new Date(prev.date).getTime() : 0) > (current.date ? new Date(current.date).getTime() : 0) ? prev : current;
      });
    }

    const newestIssue = getNewestNewspaper(currentIssues) ?? {
      date: props.title.last_box_from
        ? new Date(props.title.last_box_from).setDate(new Date(props.title.last_box_from).getDate() - 1)
        : new Date(),
      edition: '0'
    };

    // TS paranoia check: issue.date can in theory be null, but should in practice never be
    const newDate = newestIssue.date ? new Date(newestIssue.date) : new Date();
    const daysToJump = getDaysToNextExpected(newDate.getDay());
    newDate.setDate(newDate.getDate() + daysToJump);

    // Using parseInt instead of +issue.edition since we can then e.g. increase from 8b to 9
    const editionAsNumber = parseInt(newestIssue.edition, 10);
    const newNumber = Number.isNaN(editionAsNumber) || editionAsNumber === 0 ? '' : `${editionAsNumber + 1}`;

    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      title_id: props.title.id,
      edition: newNumber,
      date: newDate,
      received: false,
      username: null,
      notes: '',
      box: props.title.last_box ?? '',
      catalog_id: null
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }, [props]);

  useEffect(() => {
    function prepareTitles(newspapers: newspaper[]) {
      const formTitles = newspapers;
      formTitles.unshift(proposeNewIssue(newspapers));
      return formTitles;
    }

    void getIssuesForTitle(props.title.id, props.title.last_box ?? '')
      .then((data: newspaper[]) => {
        setNIssuesInDb(data.length);
        setIssues(prepareTitles(data));
        setLoading(false);
      });
  }, [props, nIssuesInDb, proposeNewIssue]);

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

  function showSuccessMessage() {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  }

  function dateToCalendarDate(date: Date | null): CalendarDate {
    const usedDate = date ? date : new Date();
    return parseDate(new Date(usedDate).toISOString().split('T')[0]);
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
                  showSuccessMessage();
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
                    <div className='flex flex-row mb-5 justify-between items-center'>
                      <Button
                        type="button"
                        className="edit-button-style"
                        disabled={isSubmitting}
                        onClick={() => {
                          insert(0, proposeNewIssue(values.issues));
                        }}
                      >
                        Legg til ny utgave
                      </Button>

                      {showSuccess &&
                        <p className='font-bold text-lg'> Lagret! </p>
                      }

                      <Button
                        className="save-button-style min-w-28"
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
                              <DatePicker
                                aria-label='Datovelger'
                                id={`issues.${index}.date`}
                                value={dateToCalendarDate(issue.date)}
                                onChange={val => void setFieldValue(`issues.${index}.date`, val.toDate('UTC'))}
                                isDisabled={newspaperIsSaved(index, values.issues.length)}
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
