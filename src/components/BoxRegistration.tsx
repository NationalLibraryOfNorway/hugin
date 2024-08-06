import React, {useState} from 'react';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen} from 'react-icons/fa';
import {Field, Form, Formik, useField} from 'formik';
import {updateLocalTitle} from '@/services/local.data';
import {Box} from '@/models/Box';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';


export default function BoxRegistration(props: {titleId: string; sendNewId: (box: Box) => void}) {

  const [showForm, setShowForm] = useState<boolean>(false);

  function toggleForm() {
    setShowForm(!showForm);
  }

  return (
    <div>
      {showForm ? (
        <div>
          <Formik
            initialValues={{boxId: '', startDate: new Date()}}
            onSubmit={(values, {setSubmitting}) => {
              const box = new Box(values.boxId, values.startDate);
              setTimeout(() => {
                void updateLocalTitle(props.titleId, box).then(res => {
                  setSubmitting(false);
                  setShowForm(false);
                  if (res.ok) {
                    props.sendNewId(box);
                  } else {
                    alert('Noe gikk galt ved lagring. Kontakt tekst-teamet om problemet vedvarer.');
                  }
                });
                setSubmitting(false);
              }, 400);
            }}
          >
            <Form>
              <label className="block text-gray-700 text-sm mb-1" htmlFor="boxId">Eske id</label>
              <Field
                className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                name="boxId" type="text" required/>
              <br/>

              <label className="block text-gray-700 text-sm mb-1" htmlFor="startDate">Fra dato</label>
              <DatePickerField fieldName="startDate"/>

              <Button type="submit"
                className="bg-green-400 hover:bg-green-600 font-bold py-2 px-4 text-lg mb-6">
                Lagre ny eske
              </Button>
            </Form>
          </Formik>

          <Button
            startContent={<FaArrowAltCircleLeft/>}
            size={'lg'}
            className="font-bold text-lg"
            onClick={toggleForm}>
            Avbryt
          </Button>
        </div>
      ) : (
        <div>
          <Button
            endContent={<FaBoxOpen size={25}/>}
            size={'lg'}
            className="font-bold text-lg"
            onClick={toggleForm}>
            Ny eske
          </Button>
        </div>
      )}
    </div>
  );
}


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
