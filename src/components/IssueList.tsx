import {box, newspaper, title} from '@prisma/client';
import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {deleteIssue, getNewspapersForBoxOnTitle, postNewIssuesForTitle} from '@/services/local.data';
import {ErrorMessage, Field, FieldArray, Form, Formik, FormikErrors, FormikValues} from 'formik';
import {FaTrash} from 'react-icons/fa';
import {Button, CalendarDate, DatePicker, Spinner, Table} from '@nextui-org/react';
import {TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import ErrorModal from '@/components/ErrorModal';
import {newNewspapersContainsDuplicateEditions, newspapersContainsEdition} from '@/utils/validationUtils';
import {parseDate} from '@internationalized/date';
import ConfirmationModal from '@/components/ConfirmationModal';


export default function IssueList(props: {title: title; box: box}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [saveWarning, setSaveWarning] = useState<string>('');
  const [issueToDelete, setIssueToDelete] = useState<string>('');

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
      date: props.box.date_from
        ? new Date(props.box.date_from).setDate(new Date(props.box.date_from).getDate() - 1)
        : new Date(),
      edition: '0'
    };

    // TS paranoia check: issue.date can in theory be null, but should in practice never be
    const newDate = newestIssue.date ? new Date(newestIssue.date) : new Date();
    const daysToJump = getDaysToNextExpected(newDate.getDay());
    newDate.setDate(newDate.getDate() + daysToJump);

    // Using parseInt instead of +issue.edition since we can then e.g. increase from 8b to 9
    const editionAsNumber = newestIssue.edition ? parseInt(newestIssue.edition, 10) : 0;
    const newNumber = Number.isNaN(editionAsNumber) || editionAsNumber === 0 ? '' : `${editionAsNumber + 1}`;

    return {
      /* eslint-disable @typescript-eslint/naming-convention */
      edition: newNumber,
      date: newDate,
      received: false,
      username: null,
      notes: '',
      box_id: props.box.id,
      catalog_id: ''
      /* eslint-enable @typescript-eslint/naming-convention */
    };
  }, [props]);

  const updateIssues = useCallback(() => {
    function prepareTitles(newspapers: newspaper[]) {
      const formTitles = newspapers;
      formTitles.unshift(proposeNewIssue(newspapers));
      return formTitles;
    }

    void getNewspapersForBoxOnTitle(props.title.id, props.box.id)
      .then(data => {
        setNIssuesInDb(data.length);
        setIssues(prepareTitles(data));
        setLoading(false);
      });
  }, [props, proposeNewIssue]);

  useEffect(() => {
    updateIssues();
  }, [updateIssues]);

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

  function checkForDuplicateEditionsAndShowWarning(edition: string, newspapers: newspaper[]) {
    const newIssues = newspapers.slice(0, newspapers.length - nIssuesInDb);
    // Uses newspapersContainsEdition since the newspaper value is not yet updated in list
    if (newspapersContainsEdition(edition, newspapers) || newNewspapersContainsDuplicateEditions(newIssues, newspapers)) {
      setSaveWarning('Det fins duplikate utgavenummer');
    } else {
      setSaveWarning('');
    }
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
                  showSuccessMessage();
                  updateIssues();
                } else {
                  setErrorText('Kunne ikke lagre avisutgaver.');
                }
              })
              .catch(() => setErrorText('Kunne ikke lagre avisutgaver.'))
              .finally(() => setSubmitting(false));
          }}
        >
          {({ values, isSubmitting, setFieldValue, handleChange }) => (
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

                      <div className='flex flex-row items-center'>
                        <p className='mr-2'>{saveWarning}</p>
                        <Button
                          className="save-button-style min-w-28"
                          type="submit"
                          disabled={isSubmitting}
                          startContent={isSubmitting && <Spinner className='ml-1' size='sm'/>}
                        >Lagre</Button>
                      </div>
                    </div>

                    <Table aria-label="list of issues in current box"
                      classNames={{base: 'text-lg'}}>
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
                                popoverProps={{placement: 'right'}}
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
                                onChange={(e: ChangeEvent) => {
                                  checkForDuplicateEditionsAndShowWarning((e.nativeEvent as InputEvent).data ?? '', values.issues);
                                  handleChange(e);
                                }}
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
                              <button
                                type="button"
                                onClick={() => {
                                  if (!newspaperIsSaved(index, values.issues.length)) {
                                    remove(index);
                                  } else {
                                    setIssueToDelete(issue.catalog_id);
                                  }
                                }}>
                                <FaTrash/>
                              </button>
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
        text={errorText}
        onExit={() => setErrorText('')}
        showModal={errorText !== ''}
      />

      <ConfirmationModal
        showModal={issueToDelete !== ''}
        header={'Er du sikker på at du vil slette?'}
        text={'Avisen vil bli slettet både fra Hugin og katalogen.'}
        buttonText={'Ja'}
        buttonOnClick={async () => {
          await deleteIssue(issueToDelete)
            .then(() => {
              setIssueToDelete('');
              updateIssues();
            })
            .catch(() => setErrorText('Kunne ikke slette avisutgave.'));
        }}
        onExit={() => setIssueToDelete('')}
      />
    </div>
  );
}
