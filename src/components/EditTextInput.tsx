import React, {FC, useState} from 'react';
import {Field, Form, Formik} from 'formik';
import {FaEdit, FaSave} from 'react-icons/fa';
import {IconContext} from 'react-icons';
import {ImCross} from 'react-icons/im';
import ErrorModal from '@/components/ErrorModal';
import {Spinner} from '@nextui-org/react';
import AccessibleButton from '@/components/ui/AccessibleButton';


interface EditTextInputProps {
  name: string;
  value: string;
  onSubmit: (value: string) => Promise<Response>;
  onSuccess?: (value: string) => void;
  className?: string;
}

const EditTextInput: FC<EditTextInputProps> = (props: EditTextInputProps) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentValue, setCurrentValue] = useState<string>(props.value);
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <div className={'flex flex-row items-center min-h-11 ' + props.className}>
      <p className='group-title-style mr-2'>{props.name}: </p>

      {isEditing ? (<>
        <Formik
          initialValues={{textInput: currentValue}}
          onSubmit={(values, {setSubmitting, resetForm}) => {
            void props.onSubmit(values.textInput)
              .then(res => {
                if (res.ok) {
                  if (props.onSuccess) props.onSuccess(values.textInput);
                  setShowSuccess(true);
                  setTimeout(() => {
                    setShowSuccess(false);
                  }, 3000);
                  setCurrentValue(values.textInput);
                  resetForm({values});
                } else {
                  setShowError(true);
                }
              })
              .catch(() => setShowError(true))
              .finally(() => {
                setSubmitting(false);
                setIsEditing(false);
              });
          }}
        >
          {({
            values,
            handleChange,
            isSubmitting,
            dirty,
            handleBlur
          }) => (
            <Form className='flex flex-row items-center'>
              <Field
                type='text'
                name='textInput'
                id='textInput'
                value={values.textInput ?? ''}
                onChange={handleChange}
                onBlur={handleBlur}
                className='input-text-style mr-2'
                autoFocus={true}
              />
              {isSubmitting ? (
                <Spinner size='sm' className='px-1' />
              ) : (
                <AccessibleButton
                  type='submit'
                  disabled={isSubmitting || !dirty}
                  isIconOnly
                  color='primary'
                  variant='solid'
                  data-testid='save-button'
                >
                  <IconContext.Provider value={{
                    className: 'icon-style [&]:text-xl',
                    size: '1.5em'
                  }}>
                    <FaSave/>
                  </IconContext.Provider>
                </AccessibleButton>
              )}
              <AccessibleButton
                isIconOnly
                color='secondary'
                variant='flat'
                className='ml-1'
                data-testid='abort-button'
                onClick={() => setIsEditing(false)}
              >
                <IconContext.Provider value={{
                  className: 'icon-style [&]:text-xl',
                  size: '1.5em'
                }}>
                  <ImCross />
                </IconContext.Provider>
              </AccessibleButton>
            </Form>
          )}
        </Formik>
      </>
      ) : (
        <>
          <p className='group-content-style'>{currentValue}</p>
          <AccessibleButton
            isIconOnly
            color='secondary'
            variant='flat'
            className='ml-2'
            onClick={() => setIsEditing(true)}
          >
            <IconContext.Provider value={{
              className: 'icon-style text-lg',
              size: '1.5em'
            }}>
              <FaEdit/>
            </IconContext.Provider>
          </AccessibleButton>
        </>
      )}
      {showSuccess && <p className='ml-2'>Lagret!</p>}

      <ErrorModal
        text={`Noe gikk galt ved lagring av ${props.name.toLowerCase()}.`}
        showModal={showError}
        onExit={() => setShowError(false)}
      />
    </div>
  );
};

export default EditTextInput;
