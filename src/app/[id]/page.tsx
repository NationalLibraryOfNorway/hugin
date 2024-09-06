'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {
  getBoxForTitle,
  getLocalTitle,
  putLocalTitle,
  updateNotesForTitle,
  updateShelfForTitle
} from '@/services/local.data';
import {box, title} from '@prisma/client';
import {useRouter, useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit} from 'react-icons/fa';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import NotesComponent from '@/components/NotesComponent';
import EditTextInput from '@/components/EditTextInput';
import ContactAndReleaseInfo from '@/components/ContactAndReleaseInfo';
import IssueList from '@/components/IssueList';
import ErrorModal from '@/components/ErrorModal';
import WarningLabel from '@/components/WarningLabel';
import {catalogDateStringToNorwegianDateString} from '@/utils/dateUtils';

export default function Page({params}: { params: { id: string } }) {
  const [titleString, setTitleString] = useState<string>();
  const [catalogTitle, setCatalogTitle] = useState<CatalogTitle>();
  const [titleFromDb, setTitleFromDb] = useState<title>();
  const [boxFromDb, setBoxFromDb] = useState<box>();
  const [titleFromDbNotFound, setTitleFromDbNotFound] = useState<boolean>(false);
  const [showBoxRegistrationModal, setShowBoxRegistrationModal] = useState<boolean>(false);
  const router = useRouter();
  const titleFromQueryParams = useSearchParams()?.get('title');
  const [showError, setShowError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('Noe gikk galt.');

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
      document.title = titleString ?? 'Hugin';
    }

    void fetchNewspaperTitleFromCatalog(params.id)
      .then((data: CatalogTitle) => {
        setCatalogTitle(data);
        setTitleString(data.name);
        document.title = titleString ?? 'Hugin';
      })
      .catch((e: Error) => {
        if (e instanceof NotFoundError) {
          setErrorMessage('Fant ikke tittel på denne ID i katalogen. Se om ID er korrekt.');
          setShowError(true);
        } else {
          setErrorMessage('Får ikke kontakt med katalogen.');
          setShowError(true);
        }
      });
  }, [params, titleFromQueryParams, titleString]);

  useEffect(() => {
    void getLocalTitle(params.id)
      .then((data: title) => {
        setTitleFromDb(data);
        setTitleFromDbNotFound(false);
      })
      .catch((e: Error) => {
        setTitleFromDb(undefined);
        if (e instanceof NotFoundError) {
          setTitleFromDbNotFound(true);
        } else {
          setErrorMessage('Får ikke kontakt med databasen for å se etter kontakt- og utgivelsesinformasjon.');
          setShowError(true);
        }
      });
  }, [params]);

  useEffect(() => {
    void getBoxForTitle(+params.id).then((b: box) => {
      setBoxFromDb(b);
    }).catch((e: Error) => {
      if (e instanceof NotFoundError) {
        setBoxFromDb(undefined);
      } else {
        setErrorMessage('Får ikke kontakt med databasen for å se etter eskeinformasjon.');
        setShowError(true);
      }
    }).then();
  }, [params.id]);

  function boxToString(b: box) : string {
    return b.id + (b.date_from ? ` (fra ${new Date(b.date_from).toLocaleDateString('no-NB')})` : '');
  }

  function submitNotes(notes: string): Promise<Response> {
    return updateNotesForTitle(params.id, notes);
  }

  function submitShelf(shelf: string): Promise<Response> {
    return updateShelfForTitle(params.id, shelf);
  }

  function updateShelfLocally(shelf: string): void {
    setTitleFromDb({...titleFromDb as title, ['shelf']: shelf});
  }

  return (
    <div className='w-9/12 flex flex-col content-center'>
      {titleFromDb ? (<>
        <div className='flex flex-row flex-wrap self-center w-full justify-evenly'>
          <div className='flex flex-col grow mx-10'>
            <div>
              <div className='w-full mb-3'>
                {titleString ? (
                  <h1 className="top-title-style">{titleString}</h1>
                ) : (
                  <p>Henter tittel ...</p>
                )}
                <div className="flex flex-row mt-2 w-full">
                  <p className="group-title-style ml-auto"> Katalog ID: </p>
                  <p className="group-content-style ml-2 mr-auto">{params.id}</p>
                </div>
                {catalogTitle && catalogTitle.endDate && (
                  <WarningLabel
                    className="my-2 w-full"
                    text={`Denne avisen ble avsluttet ${catalogDateStringToNorwegianDateString(catalogTitle.endDate)}`}
                  />
                )}
                <div className='flex flex-row justify-between items-center mt-4'>
                  <EditTextInput
                    name='Hyllesignatur'
                    value={titleFromDb.shelf ?? ''}
                    onSubmit={submitShelf}
                    onSuccess={updateShelfLocally}
                    className='w-96'
                  />
                </div>
              </div>

              <div className='flex flex-row flex-wrap items-center'>
                {boxFromDb ? (
                  <>
                    <p className="group-title-style">Eske til registrering: </p>
                    <p className="group-content-style ml-2">{boxToString(boxFromDb)}</p>
                  </>
                ) : (<p className="group-content-style"> Ingen eske registrert </p>)
                }

                {showBoxRegistrationModal &&
                    <BoxRegistrationModal
                      text='Registrer en ny eske'
                      closeModal={() => setShowBoxRegistrationModal(false)}
                      updateBoxInfo={setBoxFromDb}
                      titleName={titleString ?? ''}
                      titleId={params.id}/>
                }

                <Button
                  endContent={<FaBoxOpen size={25}/>}
                  size={'md'}
                  className="edit-button-style ml-4 [&]:text-medium"
                  onClick={() => setShowBoxRegistrationModal(true)}>
                  Ny eske
                </Button>
              </div>

              {boxFromDb ? (
                <IssueList title={titleFromDb} box={boxFromDb}/>
              ) : (
                <p className='mt-20 group-content-style text-start'>Legg til eske for å legge inn avisutgaver</p>
              )}

            </div>
          </div>

          <div className="flex flex-col w-96">
            <div className='items-start mt-16 w-72 mb-6'>
              {titleFromDb &&
                  <NotesComponent
                    notes={titleFromDb.notes ?? ''}
                    onSubmit={submitNotes}
                    maxRows={2}
                    notesTitle='Merknad/kommentar på tittel:'
                  />
              }
            </div>

            <ContactAndReleaseInfo
              titleFromDb={titleFromDb}
              onSubmit={putLocalTitle}
            />

          </div>
        </div>
      </>
      ) : (
        <>
          {!titleFromDbNotFound && <p> Henter kontakt- og utgivelsesinformasjon... </p>}
        </>
      )
      }

      {titleFromDbNotFound &&
          <>
            {titleString ? (
              <div className='flex flex-col items-center'>
                <h1 className="top-title-style">{titleString}</h1>
                {catalogTitle && catalogTitle.endDate && (
                  <WarningLabel
                    className="mt-2"
                    text={`Denne avisen ble avsluttet ${catalogDateStringToNorwegianDateString(catalogTitle.endDate)}`}
                  />
                )}
              </div>
            ) : (
              <p>Henter tittel ...</p>
            )}

            <p className="mt-10 text-lg">Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å
              legge til? </p>
            <div className="mt-12 flex justify-between max-w-3xl w-full self-center">
              <Button
                type="button"
                size={'lg'}
                startContent={<FaArrowAltCircleLeft/>}
                className="abort-button-style"
                onClick={() => router.push('/')}
              >
                Tilbake
              </Button>
              <Button
                type="button"
                size={'lg'}
                className="edit-button-style"
                endContent={<FaEdit/>}
                onClick={() => router.push(`/${params.id}/create?title=${titleString}`)}
              >
                Legg til informasjon
              </Button>
            </div>

          </>
      }

      <ErrorModal
        text={errorMessage}
        showModal={showError}
        onExit={() => setShowError(false)}
      />
    </div>
  );
}
