import React, {FC, useState} from 'react';
import {Field, Form, Formik, useField} from 'formik';
import {getBoxById, postNewBoxForTitle} from '@/services/local.data';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import {FaArrowAltCircleLeft} from 'react-icons/fa';
import {FiSave} from 'react-icons/fi';
import {Button} from '@nextui-org/button';
import ErrorModal from '@/components/ErrorModal';
import {Spinner} from '@nextui-org/react';
import {box} from '@prisma/client';
import InfoModal from '@/components/InfoModal';
import {AlreadyExistsError} from '@/models/Errors';


interface BoxRegistrationModalProps {
  text: string;
  titleId: string;
  updateBoxInfo: (box: box) => void;
  closeModal: () => void;
}

const BoxRegistrationModal: FC<BoxRegistrationModalProps> = (props: BoxRegistrationModalProps) => {
  const [showError, setShowError] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<{showModal: boolean; sameTitle: boolean}>({showModal: false, sameTitle: false});

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full flex items-center justify-center z-50">
      <div className="p-8 border w-96 rounded bg-white">
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4"> {props.text} </h3>
          <Formik
            initialValues={{boxId: '', startDate: new Date()}}
            onSubmit={(values, {setSubmitting}) => {

              setSubmitting(true);
              setTimeout(() => {
                void postNewBoxForTitle(props.titleId, values.boxId, values.startDate)
                  .then(createdBox => {
                    props.updateBoxInfo(createdBox);
                    props.closeModal();

                  })
                  .catch(async (e: Error) => {
                    if (e instanceof AlreadyExistsError) {
                      // Find out if box exists on same title_id or different to render different info modals
                      await getBoxById(values.boxId).then((b: box) => {
                        if (b.title_id === +props.titleId) {
                          setShowInfo({showModal: true, sameTitle: true});
                        } else {
                          setShowInfo({showModal: true, sameTitle: false});
                        }
                      });
                    } else {
                      setShowError(true);
                    }
                  })
                  .finally(() => setSubmitting(false));
              }, 400);
            }}
          >
            {({
              isSubmitting
            }) => (
              <Form>
                <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="boxId">Eske id</label>
                <Field
                  className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                  name="boxId" type="text" required/>
                <br/>

                <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="startDate">Fra dato</label>
                <CalendarField fieldName="startDate"/>

                {isSubmitting ? (
                  <Spinner size='lg' className='py-3'/>
                ) : (
                  <Button type="submit"
                    size={'lg'}
                    endContent={<FiSave/>}
                    className="save-button-style my-2"
                  >
                    Lagre ny eske
                  </Button>
                )}
              </Form>
            )}
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

      <InfoModal
        header="Esken finnes allerede"
        text={
          showInfo.sameTitle ? (
            <>Esken finnes allerede på denne tittelen {props.titleId}</>
          ) : (
            <>Esken finnes allerede på en annen tittel.</>
          )
        }
        onExit={() => setShowInfo({showModal: false, sameTitle: false})}
        showModal={showInfo.showModal}
      />

      <ErrorModal
        text='Noe gikk galt ved lagring av eske.'
        onExit={() => setShowError(false)}
        showModal={showError}
      />
    </div>
  );
};

export default BoxRegistrationModal;

const CalendarField = (props: { fieldName: string }) => {
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
