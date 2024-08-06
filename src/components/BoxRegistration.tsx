import React, {useState} from 'react';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen} from 'react-icons/fa';
import {Field, Form, Formik} from 'formik';
import {updateLocalTitle} from '@/services/local.data';
import {Box} from '@/models/Box';


export default function BoxRegistration(props: {titleId: string; sendNewId: (a: string, d: Date) => void}) {

  const [showForm, setShowForm] = useState<boolean>(false);

  function toggleForm() {
    setShowForm(!showForm);
  }

  return (
    <div>
      {showForm ? (
        <div>
          <Formik
            initialValues={{boxId: '', startDate: ''}}
            onSubmit={(values, {setSubmitting}) => {
              const box = new Box(values.boxId, values.startDate);
              setTimeout(() => {
                void updateLocalTitle(props.titleId, box).then(res => {
                  setSubmitting(false);
                  setShowForm(false);
                  if (res.ok) {
                    props.sendNewId(values.boxId, box.startDate);
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
              <Field
                className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                name="startDate" type="date" placeholder="dd-mm-yyyy" required/>
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

