import {Form, Formik} from 'formik';
import React, {FC, useState} from 'react';
import {Textarea} from '@nextui-org/input';
import {FaSave} from 'react-icons/fa';
import ErrorModal from '@/components/ErrorModal';
import {Spinner} from '@nextui-org/react';
import AccessibleButton from '@/components/ui/AccessibleButton';

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
              variant='faded'
              placeholder='Legg til kommentar'
              value={values.notes}
              onChange={handleChange}
              className='mb-2'
              minRows={props.minRows ?? 1}
              maxRows={props.maxRows ?? 5}
              endContent={showSuccess && <p className='italic text-sm'>Lagret!</p>}
            />
            <AccessibleButton
              type='submit'
              isDisabled={isSubmitting || !dirty}
              variant='flat'
              color='secondary'
              startContent={isSubmitting && <Spinner size='sm' color='white'/>}
              endContent={<FaSave/>}
              className='w-full min-h-9'
            >
              Lagre kommentar
            </AccessibleButton>
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
