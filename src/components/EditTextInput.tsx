import React, {FC, useState} from 'react';
import {Field, Form, Formik} from 'formik';
import {FaEdit, FaSave} from 'react-icons/fa';
import {IconContext} from 'react-icons';
import {ImCross} from 'react-icons/im';


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
                } else {
                  alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                }
              })
              .finally(() => {
                setSubmitting(false);
                setIsEditing(false);
                setCurrentValue(values.textInput);
                resetForm({values});
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
                className='input-text-style'
              />
              <button
                type='submit'
                disabled={isSubmitting || !dirty}
                className='ml-2'
              >
                <IconContext.Provider value={{
                  className: 'icon-style save-button-style',
                  size: '1.5em'
                }}>
                  <FaSave/>
                </IconContext.Provider>
              </button>
              <button className='ml-1'>
                <IconContext.Provider value={{
                  className: 'icon-style abort-button-style [&]:text-xl',
                  size: '1.5em'
                }}>
                  <ImCross
                    onClick={() => setIsEditing(false)}
                  />
                </IconContext.Provider>
              </button>
            </Form>
          )}
        </Formik>
      </>
      ) : (
        <>
          <p className='group-content-style'>{currentValue}</p>
          <button className='ml-2'>
            <IconContext.Provider value={{
              className: 'icon-style edit-button-style',
              size: '1.5em'
            }}>
              <FaEdit onClick={() => setIsEditing(true)}/>
            </IconContext.Provider>
          </button>
        </>
      )}
      {showSuccess && <p className='ml-2'>Lagret!</p>}
    </div>
  );
};

export default EditTextInput;
