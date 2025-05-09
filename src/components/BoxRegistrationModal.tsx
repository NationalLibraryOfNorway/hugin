import React, {FC, useState} from 'react';
import {Field, Form, Formik} from 'formik';
import {getBoxById, postNewBoxForTitle, updateActiveBoxForTitle} from '@/services/local.data';
import ErrorModal from '@/components/ErrorModal';
import {Calendar, Spinner} from '@nextui-org/react';
import {box} from '@prisma/client';
import InfoModal from '@/components/InfoModal';
import {AlreadyExistsError} from '@/models/Errors';
import Link from 'next/link';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {dateToCalendarDate} from '@/utils/dateUtils';
import AccessibleButton from '@/components/ui/AccessibleButton';
import Modal from '@/components/ui/Modal';
import {FaSave} from 'react-icons/fa';

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
    <>
      <Modal
        isOpen={true}
        onClose={props.closeModal}
        title={props.text}
        contentClassName="w-96"
        secondaryActionText="Avbryt"
      >
        <div className="text-center">
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
                  <Spinner size='lg' className='py-3 w-full'/>
                ) : (
                  <AccessibleButton
                    type="submit"
                    variant='solid'
                    color='primary'
                    size={'lg'}
                    endContent={<FaSave     />}
                    className="my-2 w-full"
                  >
                    Lagre ny eske
                  </AccessibleButton>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </Modal>

      <InfoModal
        header="Esken finnes allerede"
        content={
          <div className="flex flex-col items-center">
            {showInfo.sameTitle ? (
              <>
                Esken er allerede registrert på denne tittelen ({props.titleName}). Ønsker du å laste inn den eksisterende esken?<br/>
                <AccessibleButton
                  variant='solid'
                  color='primary'
                  onClick={() => {
                    void updateActiveBoxForTitle(props.titleId, existingBox!.id);
                    props.updateBoxInfo(existingBox!);
                    props.closeModal();
                  }}
                >
                  Bruk eske
                </AccessibleButton>
              </>
            ) : (
              <>
                Denne esken er allerede registrert på en annen tittel ({otherTitleName}).<br/>
                <AccessibleButton
                  variant='solid'
                  color='primary'
                  as={Link}
                  href={`/${existingBox?.title_id}`}
                >
                  Gå til tittel
                </AccessibleButton>
              </>
            )}
          </div>
        }
        onExit={() => setShowInfo({showModal: false, sameTitle: false})}
        showModal={showInfo.showModal}
      />

      <ErrorModal
        text='Noe gikk galt ved lagring av eske.'
        onExit={() => setShowError(false)}
        showModal={showError}
      />
    </>
  );
};

export default BoxRegistrationModal;