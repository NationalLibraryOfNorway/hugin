import React, {FC, useState} from 'react';
import {Field, Form, Formik} from 'formik';
import {getBoxById, postNewBoxForTitle, updateActiveBoxForTitle} from '@/services/local.data';
import {FaArrowAltCircleLeft} from 'react-icons/fa';
import {FiSave} from 'react-icons/fi';
import {Button} from '@nextui-org/button';
import ErrorModal from '@/components/ErrorModal';
import {Calendar, Spinner} from '@nextui-org/react';
import {box} from '@prisma/client';
import InfoModal from '@/components/InfoModal';
import {AlreadyExistsError} from '@/models/Errors';
import Link from 'next/link';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {dateToCalendarDate} from '@/utils/dateUtils';


interface BoxRegistrationModalProps {
  text: string;
  titleId: string;
  titleName: string;
  updateBoxInfo: (box: box) => void;
  closeModal: () => void;
}

const BoxRegistrationModal: FC<BoxRegistrationModalProps> = (props: BoxRegistrationModalProps) => {
  const [showError, setShowError] = useState<boolean>(false);
  const [showInfo, setShowInfo] = useState<{showModal: boolean; sameTitle: boolean}>({showModal: false, sameTitle: false});
  const [existingBox, setExistingBox] = useState<box|undefined>(undefined);
  const [otherTitleName, setOtherTitleName] = useState<string|undefined>(undefined);

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
                      await getBoxById(values.boxId).then((b: box) => {
                        setExistingBox(b);
                        if (b.title_id === +props.titleId) {
                          setShowInfo({showModal: true, sameTitle: true});
                        } else {
                          void fetchNewspaperTitleFromCatalog(b.title_id.toString()).then((t: CatalogTitle) => {
                            setOtherTitleName(t.name);
                          });
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
              isSubmitting, values, setFieldValue
            }) => (
              <Form>
                <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="boxId">Eske id</label>
                <Field
                  className="border mb-3 w-full py-2 px-3 text-gray-700 focus:outline-secondary-200"
                  name="boxId" id="boxId" type="text" required/>
                <br/>

                <label className="block text-gray-700 text-lg font-bold mb-1" htmlFor="startDate">Fra dato</label>
                <Calendar
                  showMonthAndYearPickers
                  aria-label='startDate'
                  value={dateToCalendarDate(values.startDate)}
                  onChange={val => void setFieldValue('startDate', val.toDate('UTC'))}
                />

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
        content={
          showInfo.sameTitle ? (
            <>
              Esken er allerede registrert på denne tittelen ({props.titleName}). Ønsker du å laste inn den eksisterende esken?<br/>
              <Button className="edit-button-style" onClick={() => {
                void updateActiveBoxForTitle(props.titleId, existingBox!.id);
                props.updateBoxInfo(existingBox!);
                props.closeModal();
              }}>Bruk eske</Button>
            </>
          ) : (
            <>
              Denne esken er allerede registrert på en annen tittel ({otherTitleName}).<br/>
              <Button className="edit-button-style" as={Link} href={`/${existingBox?.title_id}`}>Gå til tittel</Button>
            </>
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
