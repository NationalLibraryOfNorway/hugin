import {Form, Formik} from 'formik';
import React, {FC, useState} from 'react';
import {Textarea} from '@nextui-org/input';
import {Button} from '@nextui-org/button';
import {FaSave} from 'react-icons/fa';
import ErrorModal from '@/components/ErrorModal';
import {Spinner} from '@nextui-org/react';

interface NotesProps {
  notes: string;
  onSubmit: (notes: string) => Promise<Response>;
  minRows?: number;
  maxRows?: number;
  notesTitle?: string;
}

const NotesComponent: FC<NotesProps> = (props: NotesProps) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);
  const [showError, setShowError] = useState<boolean>(false);

  return (
    <div className='flex flex-col w-full'>
      <label
        htmlFor='notes'
        className="group-title-style mb-1 text-start"
      > { props.notesTitle ?? 'Merknad/kommentar' } </label>

      <Formik
        initialValues={{notes: props.notes}}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          setSubmitting(true);
          void props.onSubmit(values.notes)
            .then(res => {
              if (res.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                }, 3000);
                resetForm({values});
              } else {
                setShowError(true);
              }
            })
            .catch(() => setShowError(true))
            .finally(() => {
              setSubmitting(false);
            });
        }}
      >
        {({
          values,
          handleChange,
          isSubmitting,
          dirty
        }) => (
          <Form>
            <Textarea
              name='notes'
              id='notes'
              value={values.notes}
              onChange={handleChange}
              className='mb-2'
              minRows={props.minRows ?? 1}
              maxRows={props.maxRows ?? 5}
              endContent={showSuccess && <p className='italic text-sm'>Lagret!</p>}
            />
            <Button
              type='submit'
              disabled={isSubmitting || !dirty}
              startContent={isSubmitting && <Spinner size='sm'/>}
              endContent={<FaSave/>}
              size={'sm'}
              className='save-button-style [&]:text-small w-full'
            >Lagre kommentar</Button>
          </Form>
        )}
      </Formik>

      <ErrorModal
        text='Noe gikk galt ved lagring av kommentar.'
        showModal={showError}
        onExit={() => setShowError(false)}
      />
    </div>
  );
};

export default NotesComponent;
