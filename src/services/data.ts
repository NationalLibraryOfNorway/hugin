import {CatalogTitle} from '@/models/CatalogTitle';

export async function searchNewspaperTitles(searchTerm: string, signal: AbortSignal): Promise<CatalogTitle[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalogue/title/search?searchTerm=${searchTerm}&materialType=NEWSPAPER`,
    {signal}
  );
  return await response.json() as Promise<CatalogTitle[]>;
}

export async function fetchNewspaperTitle(id: string): Promise<CatalogTitle> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalogue/title?catalogueId=${id}&materialType=NEWSPAPER`);
  return await response.json() as Promise<CatalogTitle>;
}
