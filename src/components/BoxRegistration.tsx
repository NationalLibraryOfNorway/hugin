import React, {useState} from 'react';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen} from 'react-icons/fa';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import 'react-calendar/dist/Calendar.css';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import {ErrorMessage, Field, Form, Formik, useField} from 'formik';
import {updateLocalTitle} from '@/services/local.data';


export default function BoxRegistration(props: {titleId: string}) {

  const [showForm, setShowForm] = useState<boolean>(false);
  const [saveMessageIsVisible, setSaveMessageIsVisible] = useState<boolean>(false);

  function toggleForm() {
    setShowForm(!showForm);
  }

  function showSavedMessage() {
    setSaveMessageIsVisible(true);
    setTimeout(() => setSaveMessageIsVisible(false), 5000);
  }

  return (
    <div>
      <div>
        {saveMessageIsVisible && <p className="flex justify-end mt-2"> Lagret! </p>}
      </div>
      {showForm ? (
        <div>
          <Formik
            initialValues={{boxId: '', dateRange: ''}}
            onSubmit={(values, {setSubmitting}) => {
              setTimeout(() => {
                void updateLocalTitle(props.titleId, values.boxId).then(res => {
                  setSubmitting(false);
                  setShowForm(false);
                  if (res.ok) {
                    showSavedMessage();
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
              <ErrorMessage name="boxId"/>
              <br/>

              <label className="block text-gray-700 text-sm mb-1" htmlFor="dateRange">Datoene</label>
              <DateRangePickerField fieldName="dateRange"/>
              <br/>

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

const DateRangePickerField = (props: { fieldName: string }) => {
  const [field, , {setValue}] = useField(props.fieldName);
  return (
    <DateRangePicker
      id="date-range-picker"
      className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
      {...field}
      onChange={val => {
        void setValue(val);
      }}
      required
    />
  );
};
