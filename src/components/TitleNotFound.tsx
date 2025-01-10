import {CatalogTitle} from '@/models/CatalogTitle';
import WarningLabel from '@/components/WarningLabel';
import {catalogDateStringToNorwegianDateString} from '@/utils/dateUtils';
import {Button} from '@nextui-org/button';
import {FaArrowAltCircleLeft, FaEdit} from 'react-icons/fa';
import React from 'react';
import {useRouter} from 'next/navigation';

interface TitleNotFoundProps {
  titleId: number;
  titleString?: string;
  catalogTitle?: CatalogTitle;
}

const TitleNotFound = ({titleId, titleString, catalogTitle}: TitleNotFoundProps) => {
  const router = useRouter();

  return (
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
          onClick={() => router.push(`/${titleId}/create?title=${titleString}`)}
        >
          Legg til informasjon
        </Button>
      </div>
    </>
  );
};

export default TitleNotFound;