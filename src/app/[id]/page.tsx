'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {getLocalTitle, putLocalTitle, updateNotesForTitle, updateShelfForTitle} from '@/services/local.data';
import {title} from '@prisma/client';
import {useRouter, useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit} from 'react-icons/fa';
import {Box} from '@/models/Box';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import NotesComponent from '@/components/NotesComponent';
import EditTextInput from '@/components/EditTextInput';
import ContactAndReleaseInfo from '@/components/ContactAndReleaseInfo';

export default function Page({params}: { params: { id: string } }) {
  const [titleString, setTitleString] = useState<string>();
  const [titleFromDb, setTitleFromDb] = useState<title>();
  const [titleFromDbNotFound, setTitleFromDbNotFound] = useState<boolean>(false);
  const [showBoxRegistrationModal, setShowBoxRegistrationModal] = useState<boolean>(false);
  const router = useRouter();
  const titleFromQueryParams = useSearchParams()?.get('title');

  useEffect(() => {
    if (titleFromQueryParams) {
      setTitleString(titleFromQueryParams);
      document.title = titleString ?? 'Hugin';
    }

    void fetchNewspaperTitleFromCatalog(params.id)
      .then((data: CatalogTitle) => {
        setTitleString(data.name);
        document.title = titleString ?? 'Hugin';
      })
      .catch(() => {
        alert('Fant ikke tittel på denne ID i katalogen. Se om ID er korrekt.');
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
          alert('Kunne ikke se etter kontakt- og utgivelsesinformasjon. Kontakt tekst-teamet om problemet vedvarer.');
        }
      });
  }, [params]);

  function updateBox(newBox: Box) {
    setTitleFromDb(
      {...titleFromDb as title, ['last_box']: newBox.boxId, ['last_box_from']: newBox.startDate}
    );
  }

  function boxToString(t: title) : string {
    let dateString = '';
    if (t.last_box_from) {
      const dateObject = new Date(t.last_box_from);
      dateString = ` (fra ${dateObject.toLocaleDateString('no-NB')})`;
    }
    return t.last_box + dateString;
  }

  function submitNotes(notes: string): Promise<Response> {
    return updateNotesForTitle(params.id, notes);
  }

  function submitShelf(shelf: string): Promise<Response> {
    return updateShelfForTitle(params.id, shelf);
  }

  function updateShelf(shelf: string): void {
    setTitleFromDb({...titleFromDb as title, ['shelf']: shelf});
  }

  return (
    <div className='w-11/12 flex flex-col content-center'>
      {titleFromDb ? (<>
        <div className='flex flex-row flex-wrap self-center w-full justify-evenly'>
          <div>
            <div className='flex flex-col'>
              <div className='w-full mb-3'>
                {titleString ? (
                  <h1 className="top-title-style">{titleString}</h1>
                ) : (
                  <p>Henter tittel ...</p>
                )}
                <div className='flex flex-row justify-between items-center mt-4'>
                  <EditTextInput
                    name='Hyllesignatur'
                    value={titleFromDb.shelf ?? ''}
                    onSubmit={submitShelf}
                    onSuccess={updateShelf}
                    className='w-96'
                  />

                  <div className="flex flex-row">
                    <p className="group-title-style"> Serie ID: </p>
                    <p className="group-content-style ml-2">{params.id}</p>
                  </div>
                </div>
              </div>

              <div className='flex flex-row flex-wrap items-center'>
                {titleFromDb.last_box ? (
                  <>
                    <p className="group-title-style">Eske til registrering: </p>
                    <p className="group-content-style ml-2">{boxToString(titleFromDb)}</p>
                  </>
                ) : (<p className="group-content-style"> Ingen eske registrert </p>)
                }

                {showBoxRegistrationModal &&
                    <BoxRegistrationModal
                      text='Registrer en ny eske'
                      closeModal={() => setShowBoxRegistrationModal(false)}
                      updateBoxInfo={updateBox}
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

              <p className='mb-6 mt-4 py-64 border-5 border-blue-200'>
                Denne plassen er reservert til avisregistrering,
                så teksten her er bare for å se hvordan bredden blir.
                Til og med når komponenten er veldig veldig bred!
              </p>
            </div>
          </div>

          <div className="flex flex-col">
            <div className='items-start mx-2 w-72 mb-6'>
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
              <h1 className="top-title-style">{titleString}</h1>
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
    </div>
  );
}
