import {Title} from '@/models/Title';

export async function searchNewspaperTitles(searchTerm: string, signal: AbortSignal): Promise<Title[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/search?searchTerm=${searchTerm}&materialType=NEWSPAPER`,
    {signal}
  );
  return await response.json() as Promise<Title[]>;
}

export async function fetchNewspaperTitle(id: string): Promise<Title> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title?catalogueId=${id}&materialType=NEWSPAPER`);
  return await response.json() as Promise<Title>;
}
