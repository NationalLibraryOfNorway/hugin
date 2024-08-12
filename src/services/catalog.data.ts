import {CatalogTitle} from '@/models/CatalogTitle';

export async function searchNewspaperTitlesInCatalog(searchTerm: string, signal: AbortSignal): Promise<CatalogTitle[]> {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/title/search?searchTerm=${searchTerm}&materialType=NEWSPAPER`,
    {signal}
  );
  return await response.json() as Promise<CatalogTitle[]>;
}

export async function fetchNewspaperTitleFromCatalog(id: string): Promise<CatalogTitle> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/title?catalogueId=${id}&materialType=NEWSPAPER`);
  if (response.ok) {
    return await response.json() as Promise<CatalogTitle>;
  } else {
    throw new Error('Failed to fetch title');
  }
}
