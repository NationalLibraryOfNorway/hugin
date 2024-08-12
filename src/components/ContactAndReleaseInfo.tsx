import React, {FC, useState} from 'react';
import {title} from '@prisma/client';
import {Button} from '@nextui-org/button';
import {FaEdit, FaSave} from 'react-icons/fa';
import {ImCross} from 'react-icons/im';
import {Field, Form, Formik} from 'formik';
import {Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from '@nextui-org/table';
import NumberInputWithButtons from '@/components/NumberInput';
import {validateBetweenZeroAndFive} from '@/utils/validationUtils';
import SuccessModal from '@/components/SuccessModal';


interface ContactAndReleaseInfoProps {
  titleFromDb: title;
  onSubmit: (title: title) => Promise<Response>;
  className?: string;
}

const ContactAndReleaseInfo: FC<ContactAndReleaseInfoProps> = (props: ContactAndReleaseInfoProps) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<title>(props.titleFromDb);

  return (
    <div className={'flex flex-col outline outline-2 outline-blue-300 p-2 rounded-xl' + props.className}>
      {isEditing ? (
        <>
          <Formik
            initialValues={currentValue}
            onSubmit={(values: title, {setSubmitting, resetForm}) => {
              void props.onSubmit(values)
                .then((res: Response) => {
                  if (res.ok) {
                    setShowSuccess(true);
                    setTimeout(() => {
                      setShowSuccess(false);
                    }, 3000);
                  } else {
                    alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                  }
                })
                .catch(() =>  {
                  alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                })
                .finally(() => {
                  setIsEditing(false);
                  setCurrentValue(values);
                  setSubmitting(false);
                  resetForm({values});
                });
            }}
          >
            {({
              values,
              handleChange,
              isSubmitting,
              handleBlur,
              isValid
            }) => (
              <div>
                <Form className='flex flex-col items-start'>
                  <p className='group-title-style mb-2 text-left'>Kontaktinformasjon</p>
                  <label htmlFor='vendor' className='group-subtitle-style mb-1 self-start'> Avleverer </label>
                  <Field
                    type='text'
                    id='vendor'
                    className='input-text-style'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.vendor ?? ''}
                  />

                  <label htmlFor='contact_name' className='group-subtitle-style mb-1 self-start'> Navn </label>
                  <Field
                    type='text'
                    id='contact_name'
                    className='input-text-style'
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={values.contact_name ?? ''}
                  />

                  <label htmlFor='contact_email' className='group-subtitle-style mb-1 self-start'> E-post </label>
                  <Field
                    type='text'
                    id='contact_email'
                    className='input-text-style'
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

                  <p className='group-title-style mb-2 mt-6 text-left'> Utgivelsesmønster </p>
                  <Table hideHeader removeWrapper
                    className='table-fixed text-left'
                    aria-labelledby='releaseTable'
                  >
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
                  <div className='flex flex-row justify-between w-full mt-5'>
                    <Button
                      type="submit"
                      size="lg"
                      className="save-button-style"
                      endContent={<FaSave size={25}/>}
                      disabled={!isValid || isSubmitting}
                    >
                      Lagre
                    </Button>

                    <Button
                      type="button"
                      size="lg"
                      className="abort-button-style"
                      endContent={<ImCross size={25}/>}
                      onClick={() => setIsEditing(false)}
                    >
                      Avbryt
                    </Button>
                  </div>

                </Form>
              </div>
            )}
          </Formik>
        </>
      ) : (
        <>
          {currentValue &&
                <div className='flex flex-col'>
                  <h1 className="group-title-style self-start mb-2"> Kontaktinformasjon: </h1>

                  {currentValue.vendor &&
                    <div className="self-start flex flex-row">
                      <p className="group-subtitle-style">Avleverer: </p>
                      <p className="group-content-style ml-2">{currentValue.vendor}</p>
                    </div>
                  }

                  {currentValue.contact_name &&
                    <div className="self-start flex flex-row">
                      <p className="group-subtitle-style">Kontaktperson: </p>
                      <p className="group-content-style ml-2">{currentValue.contact_name}</p>
                    </div>
                  }

                  {currentValue.contact_email &&
                    <div className="self-start flex flex-row">
                      <p className="group-subtitle-style">E-post: </p>
                      <p className="group-content-style ml-2">{currentValue.contact_email}</p>
                    </div>
                  }

                  {currentValue.contact_phone &&
                    <div className="self-start flex flex-row">
                      <p className="group-subtitle-style">Telefon: </p>
                      <p className="group-content-style ml-2">{currentValue.contact_phone}</p>
                    </div>
                  }

                  {currentValue.release_pattern &&
                    <div className="self-start mt-12">
                      <h2 className="group-title-style mb-2">Utgivelsesmønster:</h2>

                      <table className="table-fixed">
                        <tbody className="text-left">
                          <tr>
                            <td className="pr-3 font-bold">Mandag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[0]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Tirsdag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[1]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Onsdag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[2]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Torsdag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[3]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Fredag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[4]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Lørdag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[5]}</td>
                          </tr>
                          <tr>
                            <td className="font-bold">Søndag:</td>
                            <td className='group-content-style'>{currentValue.release_pattern[6]}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  }

                  <Button
                    type="button"
                    size="lg"
                    className="edit-button-style mt-5"
                    endContent={<FaEdit size={25}/>}
                    onClick={() => setIsEditing(true)}
                  >
                    Rediger
                  </Button>
                </div>
          }
        </>
      )}

      {showSuccess &&
        <SuccessModal
          text={'Lagret!'}
          onExit={() => setShowSuccess(false)}
          buttonText='Lukk'
          buttonOnClick={() => setShowSuccess(false)}
        />
      }
    </div>
  );
};

export default ContactAndReleaseInfo;
