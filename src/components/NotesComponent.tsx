import {Form, Formik} from 'formik';
import React, {FC} from 'react';
import {Textarea} from '@nextui-org/input';
import {Button} from '@nextui-org/button';
import {FiSave} from 'react-icons/fi';

interface NotesProps {
  notes: string;
  onSubmit: (notes: string) => void;
}

const NotesComponent: FC<NotesProps> = (props: NotesProps) => {
  return (
    <Formik
      initialValues={{notes: props.notes}}
      onSubmit={(values, {setSubmitting}) => {
        props.onSubmit(values.notes);
        setSubmitting(false);
      }}
    >
      {({
        values,
        handleChange,
        isSubmitting
      }) => (
        <Form>
          <Textarea
            name='notes'
            id='notes'
            value={values.notes}
            onChange={handleChange}
            className='mb-2'
          />
          <Button
            type='submit'
            disabled={isSubmitting}
            endContent={<FiSave/>}
            size={'sm'}
            className='save-button-style [&]:text-small w-full'
          >Lagre kommentar</Button>
        </Form>
      )}
    </Formik>
  );
};

export default NotesComponent;
