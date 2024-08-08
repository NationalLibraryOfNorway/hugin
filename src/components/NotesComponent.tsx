import {Form, Formik} from 'formik';
import React, {FC, useState} from 'react';
import {Textarea} from '@nextui-org/input';
import {Button} from '@nextui-org/button';
import {FiSave} from 'react-icons/fi';

interface NotesProps {
  notes: string;
  onSubmit: (notes: string) => Promise<Response>;
  minRows?: number;
  maxRows?: number;
  notesTitle?: string;
}

const NotesComponent: FC<NotesProps> = (props: NotesProps) => {
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  return (
    <div className='flex flex-col w-full'>
      <label
        htmlFor='notes'
        className="text-lg font-bold mb-1 text-start"
      > { props.notesTitle ?? 'Merknad/kommentar' } </label>

      <Formik
        initialValues={{notes: props.notes}}
        onSubmit={(values, {setSubmitting, resetForm}) => {
          void props.onSubmit(values.notes)
            .then(res => {
              if (res.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                  setShowSuccess(false);
                }, 3000);
              } else {
                alert('Noe gikk galt ved lagring av kommentar. Kontakt tekst-teamet om problemet vedvarer.');
              }
            })
            .finally(() => {
              setSubmitting(false);
              resetForm({values});
            });
          setSubmitting(false);
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
            />
            <Button
              type='submit'
              disabled={isSubmitting || !dirty}
              endContent={<FiSave/>}
              size={'sm'}
              className='save-button-style [&]:text-small w-full'
            >Lagre kommentar</Button>
          </Form>
        )}
      </Formik>

      <div>
        {showSuccess &&
          <p className='mt-1'> Kommentar lagret!</p>
        }
      </div>
    </div>
  );
};

export default NotesComponent;
