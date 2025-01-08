import React, {FC, useState} from 'react';
import {contact_info, title} from '@prisma/client';
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
import {TitleContactInfo} from '@/models/TitleContactInfo';


interface ContactAndReleaseInfoProps {
  titleFromDb: title;
  contactInfo: contact_info[];
  onSubmit: (contactAndReleaseInfo: TitleContactInfo) => Promise<Response>;
  handleChangeEvent: (e: React.ChangeEvent) => void;
  handleAdd: (values: TitleContactInfo, type: 'email' | 'phone') => void;
  handleRemove: (values: TitleContactInfo, index: number) => void;
  className?: string;
}

const ContactAndReleaseInfo: FC<ContactAndReleaseInfoProps> = (
  {titleFromDb, contactInfo, onSubmit, handleAdd, handleRemove, handleChangeEvent, className} : ContactAndReleaseInfoProps
) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <div className={'flex flex-col border-style p-3 m-0' + className}>
      {isEditing ? (
        <>
          <Formik
            initialValues={{title: titleFromDb, contactInfo}}
            onSubmit={(values: TitleContactInfo, {setSubmitting, resetForm}) => {
              void onSubmit(values)
                .then((res: Response) => {
                  if (res.ok) {
                    setShowSuccess(true);
                    setTimeout(() => {
                      setShowSuccess(false);
                    }, 3000);
                    resetForm({values});
                    // setCurrentValue(values);
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
                    values={{
                      title: titleFromDb,
                      contactInfo
                    }}
                    handleChange={handleChangeEvent}
                    handleBlur={handleBlur}
                    handleAdd={handleAdd}
                    handleRemove={handleRemove}
                  />
                  <p className='group-title-style mb-2 mt-6 text-left'> Utgivelsesmønster </p>
                  <ReleasePatternForm
                    releasePattern={values.title.release_pattern}
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
          {titleFromDb &&
              <div className='flex flex-col'>
                <h1 className="group-title-style self-start mb-2"> Kontaktinformasjon: </h1>

                <ContactInformation
                  vendor={titleFromDb.vendor}
                  contactName={titleFromDb.contact_name}
                  contactInformation={contactInfo}
                />

                {titleFromDb.release_pattern &&
                    <ReleasePattern releasePattern={titleFromDb.release_pattern}/>
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
