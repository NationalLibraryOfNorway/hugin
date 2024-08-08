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
                  <h1 className="text-4xl font-bold">{titleString}</h1>
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
                    <p className="text-lg font-bold">Eske til registrering: </p>
                    <p className="text-lg ml-2">{boxToString(titleFromDb)}</p>
                  </>
                ) : (<p className="text-lg"> Ingen eske registrert </p>)
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
                Til og med når komponenten er veldig veldig veldig veldig bred!
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
              <p className="text-xl font-bold"> Serie ID: </p>
              <p className="text-xl ml-2">{params.id}</p>
            </div>


            <h1 className="self-start font-bold text-xl mb-1"> Kontaktinformasjon: </h1>

            {titleFromDb.vendor &&
                <div className="self-start flex flex-row">
                  <p className="text-lg font-bold">Avleverer: </p>
                  <p className="text-lg ml-2">{titleFromDb.vendor}</p>
                </div>
            }

            {titleFromDb.contact_name &&
                <div className="self-start flex flex-row">
                  <p className="text-lg font-bold">Kontaktperson: </p>
                  <p className="text-lg ml-2">{titleFromDb.contact_name}</p>
                </div>
            }

            {titleFromDb.contact_email &&
                <div className="self-start flex flex-row">
                  <p className="text-lg font-bold">E-post: </p>
                  <p className="text-lg ml-2">{titleFromDb.contact_email}</p>
                </div>
            }

            {titleFromDb.contact_phone &&
                <div className="self-start flex flex-row">
                  <p className="text-lg font-bold">Telefon: </p>
                  <p className="text-lg ml-2">{titleFromDb.contact_phone}</p>
                </div>
            }

            {titleFromDb.release_pattern &&
                <div className="self-start mt-12">
                  <h2 className="font-bold text-xl mb-1">Utgivelsesmønster:</h2>

                  <table className="table-fixed">
                    <tbody className="text-left">
                      <tr>
                        <td className="pr-3 font-bold">Mandag:</td>
                        <td>{titleFromDb.release_pattern[0]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Tirsdag:</td>
                        <td>{titleFromDb.release_pattern[1]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Onsdag:</td>
                        <td>{titleFromDb.release_pattern[2]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Torsdag:</td>
                        <td>{titleFromDb.release_pattern[3]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Fredag:</td>
                        <td>{titleFromDb.release_pattern[4]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Lørdag:</td>
                        <td>{titleFromDb.release_pattern[5]}</td>
                      </tr>
                      <tr>
                        <td className="font-bold">Søndag:</td>
                        <td>{titleFromDb.release_pattern[6]}</td>
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
