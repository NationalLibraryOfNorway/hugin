import {CatalogTitle} from '@/models/CatalogTitle';
import WarningLabel from '@/components/WarningLabel';
import {catalogDateStringToNorwegianDateString} from '@/utils/dateUtils';
import {FaArrowAltCircleLeft, FaEdit} from 'react-icons/fa';
import React from 'react';
import {useRouter} from 'next/navigation';
import AccessibleButton from '@/components/ui/AccessibleButton';

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
        <AccessibleButton
          type="button"
          variant='flat'
          color='secondary'
          size='lg'
          startContent={<FaArrowAltCircleLeft/>}
          onClick={() => router.push('/')}
        >
          Tilbake
        </AccessibleButton>
        <AccessibleButton
          type="button"
          variant='solid'
          color='primary'
          size='lg'
          endContent={<FaEdit/>}
          onClick={() => router.push(`/${titleId}/create?title=${titleString}`)}
        >
          Legg til informasjon
        </AccessibleButton>
      </div>
    </>
  );
};

export default TitleNotFound;