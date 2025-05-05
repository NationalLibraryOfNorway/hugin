import {box, newspaper, title} from '@prisma/client';
import React, {ChangeEvent, useCallback, useEffect, useState} from 'react';
import {deleteIssue, getNewspapersForBoxOnTitle, postNewIssuesForTitle, putIssue} from '@/services/local.data';
import {Field, FieldArray, Form, Formik} from 'formik';
import {FaPlus, FaSave, FaTrash} from 'react-icons/fa';
import {DatePicker, Spinner, Switch, Table, Tooltip} from '@nextui-org/react';
import {TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import ErrorModal from '@/components/ErrorModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import {dateToCalendarDate} from '@/utils/dateUtils';
import {FiEdit} from 'react-icons/fi';
import {ImCross} from 'react-icons/im';
import * as Yup from 'yup';
import {checkDuplicateEditions} from '@/utils/validationUtils';
import AccessibleButton from '@/components/ui/AccessibleButton';


export default function IssueList(props: {title: title; box: box}) {

  const [issues, setIssues] = useState<newspaper[]>([]);
  const [nIssuesInDb, setNIssuesInDb] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [saveWarning, setSaveWarning] = useState<string>('');
  const [issueToDelete, setIssueToDelete] = useState<string>('');
  const [issueIndexToEdit, setIssueIndexToEdit] = useState<number|undefined>(undefined);
  const [issueBeingSaved, setIssueBeingSaved] = useState<boolean>(false);

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

  const validationSchema = Yup.object().shape({
    issues: Yup.array().of(
      Yup.object().shape({
        date: Yup.date().required(),
        edition: Yup.string()
      })
    )
      .required()
      .test(
        'no-duplicates',
        'Duplicate edition numbers',
        values => {
          const editions = values.map(v => v.edition ?? '');
          setSaveWarning(checkDuplicateEditions(editions));
          return true; // allow saving anyway
        }
      )
  });

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
        const editions = data.map(d => d.edition ?? '');
        setSaveWarning(checkDuplicateEditions(editions));
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

  function newspaperIsSaved(index: number, arrayLength: number): boolean {
    return index >= arrayLength - nIssuesInDb;
  }

  function isEditingIssue(index?: number): boolean {
    if (index || index === 0) return issueIndexToEdit === index;
    return issueIndexToEdit !== undefined;
  }

  function shouldDisableIssue(index: number, arrayLength: number): boolean {
    return newspaperIsSaved(index, arrayLength) && !isEditingIssue(index);
  }

  function startEditingIssue(index: number) {
    if (issueIndexToEdit === undefined) setIssueIndexToEdit(index);
  }

  function stopEditingIssue() {
    setIssueIndexToEdit(undefined);
  }

  function showSuccessMessage() {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  }

  function updateIssue(issue: newspaper) {
    setIssueBeingSaved(true);
    void putIssue(issue)
      .then(res => {
        if (res.ok) {
          stopEditingIssue();
        } else {
          setErrorText('Kunne ikke lagre avisutgave.');
        }
      })
      .catch(() => setErrorText('Kunne ikke lagre avisutgave.'))
      .finally(() => setIssueBeingSaved(false));
  }

  return (
    <div className='w-full mb-6 mt-4 py-10 border-style m-30'>
      { loading ? (
        <Spinner/>
      ) : (
        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
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
          {({ values, isSubmitting, setFieldValue, handleChange, validateForm }) => (
            <Form>
              <FieldArray name="issues">
                {/* eslint-disable-next-line @typescript-eslint/unbound-method */}
                {({insert, remove}) => (
                  <div className="mx-6">
                    <div className='flex flex-row mb-5 justify-between items-center'>
                      <AccessibleButton
                        endContent={<FaPlus />}
                        type="button"
                        variant='flat'
                        color='primary'
                        disabled={isSubmitting}
                        onClick={() => {
                          insert(0, proposeNewIssue(values.issues));
                        }}
                      >
                        Legg til ny utgave
                      </AccessibleButton>

                      {showSuccess &&
                        <p className='font-bold text-lg'> Lagret! </p>
                      }

                      <div className='flex flex-row items-center'>
                        <p className='mr-2'>{saveWarning}</p>

                        <Tooltip
                          content='Lagre aller avbryt endring av avisutgave først'
                          isDisabled={!isEditingIssue()}
                        >
                          <AccessibleButton
                            endContent={<FaSave size={18}/>}
                            variant='solid'
                            color='primary'
                            type="submit"
                            disabled={isSubmitting || isEditingIssue()}
                            startContent={isSubmitting && <Spinner className='ml-1' size='sm' color='white'/>}
                          >Lagre</AccessibleButton>
                        </Tooltip>
                      </div>
                    </div>

                    <Table aria-label="list of issues in current box"
                      classNames={{base: 'text-lg'}}>
                      <TableHeader>
                        <TableColumn align='center' className="text-lg">Dag</TableColumn>
                        <TableColumn align='center' className="text-lg">Dato</TableColumn>
                        <TableColumn align='center' className="text-lg">Nummer</TableColumn>
                        <TableColumn align='center' className="text-lg">Mottatt</TableColumn>
                        <TableColumn align='center' className="text-lg">Kommentar</TableColumn>
                        <TableColumn align='end' hideHeader={true} className="text-lg">Slett</TableColumn>
                      </TableHeader>
                      <TableBody>
                        {values.issues.map((issue, index) => (
                          <TableRow key={index} className={isEditingIssue(index) ? 'bg-blue-50 border-1 border-blue-200' : ''}>
                            <TableCell className="text-lg">
                              {dayOfWeek(issue.date)}
                            </TableCell>
                            <TableCell className="text-lg">
                              <DatePicker
                                showMonthAndYearPickers
                                aria-label='Datovelger'
                                id={`issues.${index}.date`}
                                value={dateToCalendarDate(issue.date)}
                                onChange={val => void setFieldValue(`issues.${index}.date`, val.toDate('UTC'))}
                                isDisabled={shouldDisableIssue(index, values.issues.length)}
                                popoverProps={{placement: 'right'}}
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.edition`}
                                className="max-w-16 border text-center"
                                type="text"
                                width='40'
                                disabled={shouldDisableIssue(index, values.issues.length)}
                                onChange={(e: ChangeEvent) => {
                                  handleChange(e);
                                  asyncTimeout()
                                    .then(
                                      () => validateForm(),
                                      reason => console.error(reason)
                                    );
                                }}
                              />
                            </TableCell>
                            <TableCell className="text-lg text-left">
                              <Switch
                                name={`issues.${index}.received`}
                                isSelected={issue.received ?? false}
                                isDisabled={shouldDisableIssue(index, values.issues.length)}
                                onChange={value => void setFieldValue(`issues.${index}.received`, value.target.checked)}
                              > {issue.received ? 'Mottatt' : 'Ikke mottatt'} </Switch>
                            </TableCell>
                            <TableCell className="text-lg">
                              <Field
                                name={`issues.${index}.notes`}
                                className="border"
                                type="text"
                                disabled={shouldDisableIssue(index, values.issues.length)}
                                value={issue.notes || ''}
                              />
                            </TableCell>
                            <TableCell className="text-lg">
                              {newspaperIsSaved(index, values.issues.length) &&
                                <>
                                  {isEditingIssue(index) ?
                                    <>
                                      {issueBeingSaved ?
                                        <Spinner size='sm' className='mr-2'/>
                                        :
                                        <>
                                          <AccessibleButton
                                            isIconOnly
                                            variant='solid'
                                            color='success'
                                            className='mr-1'
                                            type='button'
                                            onClick={() => updateIssue(issue)}>
                                            <FaSave/>
                                          </AccessibleButton>
                                          <AccessibleButton
                                            isIconOnly
                                            variant='solid'
                                            color='warning'
                                            className='mr-1'
                                            type='button'
                                            onClick={() => stopEditingIssue()}>
                                            <ImCross/>
                                          </AccessibleButton>
                                        </>
                                      }
                                    </>
                                    :
                                    <AccessibleButton
                                      isIconOnly
                                      variant='flat'
                                      color='primary'
                                      className={isEditingIssue() ? 'opacity-25 mr-0.5' : 'mr-0.5'}
                                      type='button'
                                      disabled={isEditingIssue()}
                                      onClick={() => startEditingIssue(index)}
                                    >
                                      <FiEdit/>
                                    </AccessibleButton>
                                  }
                                </>
                              }
                              <AccessibleButton
                                isIconOnly
                                type="button"
                                variant='flat'
                                color="danger"
                                onClick={() => {
                                  if (!newspaperIsSaved(index, values.issues.length)) {
                                    remove(index);
                                  } else {
                                    setIssueToDelete(issue.catalog_id);
                                  }
                                }}>
                                <FaTrash size={16}/>
                              </AccessibleButton>
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

export const asyncTimeout = () => {
  return new Promise(resolve => {
    setTimeout(resolve);
  });
};
