'use client';

import React, {useEffect, useState} from 'react';
import {fetchNewspaperTitleFromCatalog} from '@/services/catalog.data';
import {CatalogTitle} from '@/models/CatalogTitle';
import {getLocalTitle} from '@/services/local.data';
import {title} from '@prisma/client';
import {useRouter} from 'next/navigation';
import { NotFoundError } from '@/models/Errors';

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
          <h1 className="text-2xl font-bold mb-4">{catalogTitle.name}</h1>
        </div>
      ) : (
        <div className="mb-4">Henter tittel ...</div>
      )}

      <p className="mb-4">Serie-ID: {params.id}</p>

      {localTitle ? (
        <div>
          {localTitle.vendor && <p>Avleverer: {localTitle.vendor}</p>}
          {localTitle.contact_name && <p>Kontaktperson: {localTitle.contact_name}</p>}
          {localTitle.contact_email && <p>E-post: {localTitle.contact_email}</p>}
          {localTitle.contact_phone && <p>Telefon: {localTitle.contact_phone}</p>}

          <br></br>

          {localTitle.last_box && <p>Eske til registrering: {localTitle.last_box}</p>}

          <br></br>

          {localTitle.release_pattern &&
                <>
                  <p>Utgivelsesmønster:</p>
                  <p>Mandag: {localTitle.release_pattern[0]}</p>
                  <p>Tirsdag: {localTitle.release_pattern[1]}</p>
                  <p>Onsdag: {localTitle.release_pattern[2]}</p>
                  <p>Torsdag: {localTitle.release_pattern[3]}</p>
                  <p>Fredag: {localTitle.release_pattern[4]}</p>
                  <p>Lørdag: {localTitle.release_pattern[5]}</p>
                  <p>Søndag: {localTitle.release_pattern[6]}</p>
                </>
          }

          <button
            type="button"
            className="bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-5"
            onClick={() => router.push(`/${params.id}/edit`)}
          >
              Rediger
          </button>

        </div>
      ) : (
        <>
          { !localTitleNotFound && <p> Henter kontakt- og utgivelsesinformasjon... </p> }
        </>
      )
      }

      {localTitleNotFound &&
          <>
            <p className="mt-10">Fant ikke kontakt- og utgivelsesinformasjon for denne tittelen. Ønsker du å legge til? </p>
            <button
              type="button"
              className="bg-green-400 hover:bg-green-600 text-white font-bold py-2 px-4 rounded mt-5"
              onClick={() => router.push(`/${params.id}/edit`)}
            >
              Legg til informasjon
            </button>
          </>
      }
    </div>
  );
}
