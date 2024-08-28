import {newspaper} from '@prisma/client';

export function validateBetweenZeroAndFive(value: number) {
  let error;
  if (value < 0) {
    error = 'Tallet kan ikke være negativt';
  } else if (value > 5) {
    error = 'Tallet kan ikke være større enn 5';
  }
  return error;
}

export function newspapersContainsEdition(edition: string, newspapers: newspaper[]): boolean {
  const issuesWithDuplicates = newspapers.filter(issue1 => issue1.edition === edition);
  return issuesWithDuplicates.length !== 0;
}

export function newNewspapersContainsDuplicateEditions(newNewspapers: newspaper[], newspapers: newspaper[]): boolean {
  const duplicates = newNewspapers.filter(issue1 => {
    return newspapers.some(issue2 => issue1.edition === issue2.edition && issue1.date !== issue2.date);
  });
  return duplicates.length !== 0;
}
