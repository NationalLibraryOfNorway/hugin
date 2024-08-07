import React, {FC} from 'react';
import {Field, Form, Formik, useField} from 'formik';
import {updateLocalTitle} from '@/services/local.data';
import {Box} from '@/models/Box';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {FaArrowAltCircleLeft} from 'react-icons/fa';
import {FiSave} from 'react-icons/fi';
import {Button} from '@nextui-org/button';


interface BoxRegistrationModalProps {
  text: string;
  titleId: string;
  updateBoxInfo: (box: Box) => void;
  closeModal: () => void;
}

const BoxRegistrationModal: FC<BoxRegistrationModalProps> = (props: BoxRegistrationModalProps) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-50">
      <div className="p-8 border w-96 rounded bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4"> {props.text} </h3>
          <Formik
            initialValues={{boxId: '', startDate: new Date()}}
            onSubmit={(values, {setSubmitting}) => {
              const box = new Box(values.boxId, values.startDate);
              setTimeout(() => {
                void updateLocalTitle(props.titleId, box).then(res => {
                  setSubmitting(false);
                  if (res.ok) {
                    props.updateBoxInfo(box);
                    props.closeModal();
                  } else {
                    alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                  }
                });
                setSubmitting(false);
              }, 400);
            }}
          >
            <Form>
              <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="boxId">Eske id</label>
              <Field
                className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                name="boxId" type="text" required/>
              <br/>

              <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="startDate">Fra dato</label>
              <DatePickerField fieldName="startDate"/>

              <Button type="submit"
                size={'lg'}
                endContent={<FiSave/>}
                className="save-button-style my-2"
              >
                Lagre ny eske
              </Button>
            </Form>
          </Formik>

          <Button
            startContent={<FaArrowAltCircleLeft/>}
            size={'lg'}
            className="abort-button-style mt-4"
            onClick={() => props.closeModal()}>
            Avbryt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BoxRegistrationModal;

const DatePickerField = (props: { fieldName: string }) => {
  const [field, , {setValue}] = useField(props.fieldName);
  return (
    <Calendar
      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
      {...field}
      onChange={val => {
        void setValue(val);
      }}
      locale='no-NB'
    />
  );
};
