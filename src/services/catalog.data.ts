import {CatalogTitle} from '@/models/CatalogTitle';
import {NotFoundError} from '@/models/Errors';

export async function searchNewspaperTitlesInCatalog(searchTerm: string, signal: AbortSignal): Promise<CatalogTitle[]> {
  return fetch(
    `${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/title/search?searchTerm=${searchTerm}&materialType=NEWSPAPER`,
    {signal}
  )
    .then(response => {
      if (response.ok || response.status === 404) {
        return response.json() as Promise<CatalogTitle[]>;
      } else {
        return Promise.reject(new Error('Failed to fetch titles'));
      }
    })
    .catch(() => {
      return Promise.reject(new Error('Failed to fetch titles'));
    });
}

export async function fetchNewspaperTitleFromCatalog(id: string): Promise<CatalogTitle> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/title?catalogueId=${id}&materialType=NEWSPAPER`);
  if (response.ok) {
    return await response.json() as Promise<CatalogTitle>;
  } else if (response.status === 404) {
    return Promise.reject(new NotFoundError('Failed to fetch title'));
  } else {
    return Promise.reject(new Error('Failed to fetch title'));
  }
}
