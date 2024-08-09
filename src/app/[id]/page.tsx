'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {getLocalTitle, updateNotesForTitle} from '@/services/local.data';
import {title} from '@prisma/client';
import {useRouter, useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit} from 'react-icons/fa';
import {Box} from '@/models/Box';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';
import NotesComponent from '@/components/NotesComponent';

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
    } else {
      void fetchNewspaperTitleFromCatalog(params.id).then((data: CatalogTitle) => setTitleString(data.name));
    }
  }, [params, titleFromQueryParams]);

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

  return (
    <div className='w-11/12 flex flex-col content-center'>
      {titleFromDb ? (<>
        <div className='flex flex-row flex-wrap self-center w-full justify-evenly'>
          <div>
            <div className='flex flex-col'>
              <div className='w-full mb-10'>
                {titleString ? (
                  <h1 className="top-title-style">{titleString}</h1>
                ) : (
                  <div>Henter tittel ...</div>
                )}
                {titleFromDb && titleFromDb.shelf &&
                    <p className="text-2xl mt-1">Hyllesignatur: {titleFromDb.shelf}</p>
                }
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

            <div className="flex flex-row mb-10 mt-5">
              <p className="group-title-style"> Serie ID: </p>
              <p className="group-content-style ml-2">{params.id}</p>
            </div>


            <div className='flex flex-col outline outline-2 outline-blue-300 p-2 rounded-xl'>
              <h1 className="group-title-style self-start mb-2"> Kontaktinformasjon: </h1>

              {titleFromDb.vendor &&
                <div className="self-start flex flex-row">
                  <p className="group-subtitle-style">Avleverer: </p>
                  <p className="group-content-style ml-2">{titleFromDb.vendor}</p>
                </div>
              }

              {titleFromDb.contact_name &&
                <div className="self-start flex flex-row">
                  <p className="group-subtitle-style">Kontaktperson: </p>
                  <p className="group-content-style ml-2">{titleFromDb.contact_name}</p>
                </div>
              }

              {titleFromDb.contact_email &&
                <div className="self-start flex flex-row">
                  <p className="group-subtitle-style">E-post: </p>
                  <p className="group-content-style ml-2">{titleFromDb.contact_email}</p>
                </div>
              }

              {titleFromDb.contact_phone &&
                <div className="self-start flex flex-row">
                  <p className="group-subtitle-style">Telefon: </p>
                  <p className="group-content-style ml-2">{titleFromDb.contact_phone}</p>
                </div>
              }

              {titleFromDb.release_pattern &&
                <div className="self-start mt-12">
                  <h2 className="group-title-style mb-2">Utgivelsesmønster:</h2>

                  <table className="table-fixed">
                    <tbody className="text-left">
                      <tr>
                        <td className="pr-3 font-bold">Mandag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[0]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Tirsdag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[1]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Onsdag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[2]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Torsdag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[3]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Fredag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[4]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Lørdag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[5]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Søndag:</td>
                        <td className='group-content-style'>{titleFromDb.release_pattern[6]}</td>
                      </tr>


                    </tbody>
                  </table>
                </div>
              }

              <Button
                type="button"
                size="lg"
                className="edit-button-style mt-5"
                endContent={<FaEdit size={25}/>}
                onClick={() => router.push(`/${params.id}/edit?title=${titleString}`)}
              >
              Rediger
              </Button>
            </div>
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
                onClick={() => router.push(`/${params.id}/edit?title=${titleString}`)}
              >
                Legg til informasjon
              </Button>
            </div>

          </>
      }
    </div>
  );
}
