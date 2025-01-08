import React, {FC, useState} from 'react';
import {title} from '@prisma/client';
import {Button} from '@nextui-org/button';
import {FaEdit, FaSave} from 'react-icons/fa';
import {ImCross} from 'react-icons/im';
import {Form, Formik} from 'formik';
import SuccessModal from '@/components/SuccessModal';
import ErrorModal from '@/components/ErrorModal';
import {Spinner} from '@nextui-org/react';
import ReleasePatternForm from '@/components/ReleasePatternForm';
import ContactInformationForm from '@/components/ContactInformationForm';
import ReleasePattern from '@/components/ReleasePattern';
import ContactInformation from '@/components/ContactInformation';


interface ContactAndReleaseInfoProps {
  titleFromDb: title;
  onSubmit: (title: title) => Promise<Response>;
  className?: string;
}

const ContactAndReleaseInfo: FC<ContactAndReleaseInfoProps> = (props: ContactAndReleaseInfoProps) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<title>(props.titleFromDb);
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <div className={'flex flex-col border-style p-3 m-0' + props.className}>
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
                    resetForm({values});
                    setCurrentValue(values);
                  } else {
                    setShowError(true);
                  }
                })
                .catch(() =>  {
                  setShowError(true);
                })
                .finally(() => {
                  setIsEditing(false);
                  setSubmitting(false);
                });
            }}
          >
            {({
              values,
              handleChange,
              isSubmitting,
              handleBlur,
              isValid,
              resetForm
            }) => (
              <div>
                <Form className='flex flex-col items-start'>
                  <ContactInformationForm
                    className={'flex flex-col w-full'}
                    values={values}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                  <p className='group-title-style mb-2 mt-6 text-left'> Utgivelsesmønster </p>
                  <ReleasePatternForm
                    releasePattern={values.release_pattern}
                    handleChange={handleChange}
                    handleBlur={handleBlur}
                  />
                  {isSubmitting ? (
                    <Spinner className='self-center p-1' size='lg'/>
                  ) : (
                    <div className='flex flex-row justify-between w-full'>
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
                        onClick={() => {
                          resetForm();
                          setIsEditing(false);
                        }}
                      >
                        Avbryt
                      </Button>
                    </div>
                  )}
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

                <ContactInformation
                  vendor={currentValue.vendor}
                  contactName={currentValue.contact_name}
                  contactEmail={currentValue.contact_email}
                  contactPhone={currentValue.contact_phone}
                />

                {currentValue.release_pattern &&
                    <ReleasePattern releasePattern={currentValue.release_pattern}/>
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

      <SuccessModal
        text='Kontakt- og utgivelsesinformasjon lagret!'
        onExit={() => setShowSuccess(false)}
        buttonText='Lukk'
        buttonOnClick={() => setShowSuccess(false)}
        showModal={showSuccess}
      />

      <ErrorModal
        text='Noe gikk galt ved lagring av kontakt- og utgivelsesinformasjonen.'
        onExit={() => setShowError(false)}
        showModal={showError}
      />
    </div>
  );
};

export default ContactAndReleaseInfo;
