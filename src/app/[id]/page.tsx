'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {getLocalTitle} from '@/services/local.data';
import {title} from '@prisma/client';
import {useRouter} from 'next/navigation';
import {NotFoundError} from '@/models/Errors';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaBoxOpen, FaEdit} from 'react-icons/fa';

export default function Page({params}: { params: { id: string } }) {
  const [catalogTitle, setCatalogTitle] = useState<CatalogTitle>();
  const [localTitle, setLocalTitle] = useState<title>();
  const router = useRouter();
  const [localTitleNotFound, setLocalTitleNotFound] = useState<boolean>(false);

  useEffect(() => {
    void fetchNewspaperTitleFromCatalog(params.id).then((data: CatalogTitle) => setCatalogTitle(data));
  }, [params]);

  useEffect(() => {
    void getLocalTitle(params.id)
      .then((data: title) => {
        setLocalTitle(data);
        setLocalTitleNotFound(false);
      })
      .catch((e: Error) => {
        setLocalTitle(undefined);
        if (e instanceof NotFoundError) {
          setLocalTitleNotFound(true);
        } else {
          alert('Kunne ikke se etter kontakt- og utgivelsesinformasjon. Kontakt tekst-teamet om problemet vedvarer.');
        }
      });
  }, [params]);

  return (
    <div>
      {catalogTitle ? (
        <div>
          <h1 className="text-4xl font-bold mb-4">{catalogTitle.name}</h1>
        </div>
      ) : (
        <div className="mb-4">Henter tittel ...</div>
      )}

      <p className="text-xl">Serie-ID: {params.id}</p>

      <br></br>

      {localTitle ? (
        <div className="flex flex-col">
          {localTitle.last_box ? (
            <div className="flex flex-row items-center">
              <p className="text-lg font-bold" >Eske til registrering: </p>
              <p className="text-lg ml-2">{localTitle.last_box}</p>

              <Button
                endContent={<FaBoxOpen/>}
                className="ml-3 font-bold"
                size={'lg'}
              >
                Ny eske
              </Button>

            </div>
          ) : (
            <Button
              endContent={<FaBoxOpen/>}
              size={'lg'}
              className="font-bold"
              // TODO Add form for barcode (?) and/or link to box creation here (related to TT-1559)
            >
              Legg til eske
            </Button>
          )
          }

          <br></br>

          {localTitle.vendor &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Avleverer: </p>
              <p className="text-lg ml-2">{localTitle.vendor}</p>
            </div>
          }

          {localTitle.contact_name &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Kontaktperson: </p>
              <p className="text-lg ml-2">{localTitle.contact_name}</p>
            </div>
          }

          {localTitle.contact_email &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >E-post: </p>
              <p className="text-lg ml-2">{localTitle.contact_email}</p>
            </div>
          }

          {localTitle.contact_phone &&
            <div className="self-start flex flex-row">
              <p className="text-lg font-bold" >Telefon: </p>
              <p className="text-lg ml-2">{localTitle.contact_phone}</p>
            </div>
          }

          <br></br>
          <br></br>

          {localTitle.release_pattern &&
            <div className="self-start">
              <h2 className="font-bold text-xl mb-3">Utgivelsesmønster:</h2>

              <table className="table-fixed">
                <tbody className="text-left">
                  <tr>
                    <td className="pr-3 font-bold">Mandag:</td>
                    <td>{localTitle.release_pattern[0]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Tirsdag:</td>
                    <td>{localTitle.release_pattern[1]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Onsdag:</td>
                    <td>{localTitle.release_pattern[2]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Torsdag:</td>
                    <td>{localTitle.release_pattern[3]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Fredag:</td>
                    <td>{localTitle.release_pattern[4]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Lørdag:</td>
                    <td>{localTitle.release_pattern[5]}</td>
                  </tr>
                  <tr>
                    <td className="font-bold">Søndag:</td>
                    <td>{localTitle.release_pattern[6]}</td>
                  </tr>


                </tbody>
              </table>
            </div>
          }

          <br></br>

          <Button
            type="button"
            size="lg"
            className="bg-green-400 hover:bg-green-600 font-bold py-2 px-4"
            endContent={<FaEdit/>}
            onClick={() => router.push(`/${params.id}/edit`)}
          >
              Rediger
          </Button>

        </div>
      ) : (
        <>
          { !localTitleNotFound && <p> Henter kontakt- og utgivelsesinformasjon... </p> }
        </>
      )
      }

      {localTitleNotFound &&
          <>
            <p className="mt-10 text-lg">Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å legge til? </p>
            <div className="mt-10 flex justify-between">
              <Button
                type="button"
                size={'lg'}
                startContent={<FaArrowAltCircleLeft/>}
                className="bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 mr-5"
                onClick={() => router.push('/')}
              >
                Tilbake
              </Button>
              <Button
                type="button"
                size={'lg'}
                className="bg-blue-400 hover:bg-blue-600 text-white font-bold py-2 px-4"
                endContent={<FaEdit/>}
                onClick={() => router.push(`/${params.id}/edit`)}
              >
                Legg til informasjon
              </Button>
            </div>

          </>
      }
    </div>
  );
}
