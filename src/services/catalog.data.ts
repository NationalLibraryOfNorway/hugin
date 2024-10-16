import {CatalogTitle} from '@/models/CatalogTitle';
import {NotFoundError} from '@/models/Errors';
import {CatalogNewspaperDto} from '@/models/CatalogNewspaperDto';
import {CatalogMissingNewspaperDto} from '@/models/CatalogMissingNewspaperDto';
import {CatalogItem} from '@/models/CatalogItem';
import {KeycloakToken} from '@/models/KeycloakToken';
import {CatalogNewspaperEditDto} from '@/models/CatalogNewspaperEditDto';

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

export async function getLinkToNewspaperInCatalog(id: string): Promise<string> {
  return fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/catalog/title/link?catalogueId=${id}&materialType=NEWSPAPER`)
    .then(response => {
      if (response.ok) {
        return response.json() as Promise<string>;
      } else {
        return Promise.reject(new Error('Failed getting link'));
      }
    })
    .catch(() => {
      return Promise.reject(new Error('Failed getting link'));
    });
}

export async function postItemToCatalog(issue: CatalogNewspaperDto): Promise<CatalogItem> {
  const token = await getKeycloakTekstToken();

  return fetch(`${process.env.CATALOGUE_API_PATH}/newspapers/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${token.access_token}`
    },
    body: JSON.stringify(issue)
  })
    .then(async response => {
      if (response.ok) {
        return await response.json() as Promise<CatalogItem>;
      } else {
        return Promise.reject(new Error(`Failed to create issue in catalog: ${response.status} - ${await response.json()}`));
      }
    })
    .catch((e: Error) => {
      return Promise.reject(new Error(`Failed to create issue in catalog: ${e.message}`));
    });
}

export async function postMissingItemToCatalog(issue: CatalogMissingNewspaperDto): Promise<CatalogItem> {
  const token = await getKeycloakTekstToken();

  return fetch(`${process.env.CATALOGUE_API_PATH}/newspapers/items/missing`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${token.access_token}`
    },
    body: JSON.stringify(issue)
  })
    .then(async response => {
      if (response.ok) {
        return await response.json() as Promise<CatalogItem>;
      } else {
        return Promise.reject(new Error(`Failed to create title in catalog: ${response.status} - ${await response.json()}`));
      }
    })
    .catch((e: Error) => {
      return Promise.reject(new Error(`Failed to create title in catalog: ${e.message}`));
    });
}

export async function deletePhysicalItemFromCatalog(catalog_id: string, deleteManifestation?: boolean): Promise<void> {
  const token = await getKeycloakTekstToken();
  const queryParams = deleteManifestation !== undefined ? `?deleteManifestation=${deleteManifestation}` : '';

  return fetch(`${process.env.CATALOGUE_API_PATH}/newspapers/items/physical/${catalog_id}${queryParams}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${token.access_token}`
    }
  })
    .then(async response => {
      if (response.ok) {
        return Promise.resolve();
      } else if (response.status === 404) {
        // If the item does not exist in the catalogue then we can consider it deleted
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(`Failed to delete item in catalog: ${response.status} - ${await response.json()}`));
      }
    })
    .catch((e: Error) => {
      return Promise.reject(new Error(`Failed to delete item in catalog: ${e.message}`));
    });
}

export async function putPhysicalItemInCatalog(issue: CatalogNewspaperEditDto): Promise<void> {
  const token = await getKeycloakTekstToken();

  return fetch(`${process.env.CATALOGUE_API_PATH}/newspapers/items`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      Authorization: `Bearer ${token.access_token}`
    },
    body: JSON.stringify(issue)
  })
    .then(async response => {
      if (response.ok) {
        return Promise.resolve();
      } else {
        return Promise.reject(new Error(`Failed to update issue in catalog: ${response.status} - ${await response.json()}`));
      }
    })
    .catch((e: Error) => {
      return Promise.reject(new Error(`Failed to update issue in catalog: ${e.message}`));
    });
}

async function getKeycloakTekstToken(): Promise<KeycloakToken> {
  const body = `client_id=${process.env.KEYCLOAK_TEKST_CLIENT_ID}` +
      `&client_secret=${process.env.KEYCLOAK_TEKST_CLIENT_SECRET}` +
      '&grant_type=client_credentials';
  const res = await fetch(`${process.env.KEYCLOAK_TEKST_URL}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body
  });
  return await res.json() as KeycloakToken;
}
