'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {getLocalTitle} from '@/services/local.data';
import {title} from '@prisma/client';
import {useRouter, useSearchParams} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit} from 'react-icons/fa';
import {Box} from '@/models/Box';
import BoxRegistrationModal from '@/components/BoxRegistrationModal';

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
    } else {
      void fetchNewspaperTitleFromCatalog(params.id).then((data: CatalogTitle) => setTitleString(data.name));
      document.title = titleString ?? 'Hugin';
    }
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

  return (
    <div>
      {titleString ? (
        <div>
          <h1 className="text-4xl font-bold mb-4">{titleString}</h1>
        </div>
      ) : (
        <div className="mb-4">Henter tittel ...</div>
      )}

      <p className="text-xl mb-6">Serie-ID: {params.id}</p>

      {titleFromDb ? (
        <div className="flex flex-col">
          {titleFromDb.last_box ? (
            <div className="flex flex-row items-center">
              <p className="text-lg font-bold" >Eske til registrering: </p>
              <p className="text-lg ml-2">{boxToString(titleFromDb)}</p>
            </div>
          ) : (<p className="text-lg mb-2" > Ingen eske registrert </p>)
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
            size={'lg'}
            className="edit-button-style my-4"
            onClick={() => setShowBoxRegistrationModal(true)}>
              Ny eske
          </Button>

          <h1 className="self-start font-bold text-xl mb-3 mt-4"> Kontaktinformasjon: </h1>

          {titleFromDb.vendor &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Avleverer: </p>
              <p className="text-lg ml-2">{titleFromDb.vendor}</p>
            </div>
          }

          {titleFromDb.contact_name &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Kontaktperson: </p>
              <p className="text-lg ml-2">{titleFromDb.contact_name}</p>
            </div>
          }

          {titleFromDb.contact_email &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >E-post: </p>
              <p className="text-lg ml-2">{titleFromDb.contact_email}</p>
            </div>
          }

          {titleFromDb.contact_phone &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Telefon: </p>
              <p className="text-lg ml-2">{titleFromDb.contact_phone}</p>
            </div>
          }

          {titleFromDb.release_pattern &&
            <div className="self-start mt-12">
              <h2 className="font-bold text-xl mb-3">Utgivelsesmønster:</h2>

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
      ) : (
        <>
          { !titleFromDbNotFound && <p> Henter kontakt- og utgivelsesinformasjon... </p> }
        </>
      )
      }

      {titleFromDbNotFound &&
          <>
            <p className="mt-10 text-lg">Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å legge til? </p>
            <div className="mt-10 flex justify-between">
              <Button
                type="button"
                size={'lg'}
                startContent={<FaArrowAltCircleLeft/>}
                className="abort-button-style mr-5"
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
