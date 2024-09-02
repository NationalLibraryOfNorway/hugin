import {AlreadyExistsError, NotFoundError} from '@/models/Errors';
import { newspaper, title, box } from '@prisma/client';

export async function getLocalTitle(id: string): Promise<title> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${id}`);

  switch (response.status) {
  case 200:
    return await response.json() as Promise<title>;
  case 404:
    return Promise.reject(new NotFoundError('Title not found'));
  default:
    return Promise.reject(new Error(`Failed to fetch title: ${await response.json()}`));
  }
}

export async function postLocalTitle(localTitle: title): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${localTitle.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(localTitle)
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to post title: ${e.message}`));
  });
}

export async function putLocalTitle(localTitle: title): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${localTitle.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(localTitle)
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to put title: ${e.message}`));
  });
}

export async function updateActiveBoxForTitle(
  titleId: string,
  boxId: string
): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${titleId}/box`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({boxId})
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to update box: ${e.message}`));
  });
}

export async function updateNotesForTitle(
  titleId: string,
  notes: string
): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${titleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({notes})
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to update notes: ${e.message}`));
  });
}

export async function updateShelfForTitle(
  titleId: string,
  shelf: string
): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${titleId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({shelf})
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to update shelf: ${e.message}`));
  });
}

export async function getBoxById(id: string): Promise<box> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/box/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  switch(response.status) {
  case 200:
    return await response.json() as Promise<box>;
  case 404:
    return Promise.reject(new NotFoundError(`No box with id ${id} found.`));
  default:
    return Promise.reject(new Error('Failed to fetch box.'));
  }
}

export async function getBoxForTitle(id: number): Promise<box> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${id}/box`);

  switch (response.status) {
  case 200:
    return await response.json() as Promise<box>;
  case 404:
    return Promise.reject(new NotFoundError(`No box found on title with id ${id}`));
  default:
    return Promise.reject(new Error('Failed to fetch box.'));
  }
}

export async function getNewspapersForBoxOnTitle(titleId: number, boxId: string): Promise<newspaper[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/newspaper/${titleId}?box_id=${boxId}`);
  switch (response.status) {
  case 200:
    return await response.json() as Promise<newspaper[]>;
  case 404:
    return Promise.reject(new NotFoundError('Box or title not found'));
  default:
    return Promise.reject(new Error(`Failed to fetch newspapers for box ${boxId} on title ${titleId}`));
  }
}

export async function postNewBoxForTitle(id: string, boxId: string, startDate: Date): Promise<box> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${id}/box`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({boxId, startDate})
  })
    .catch((e: Error) => {
      return Promise.reject(new Error(`Failed to post box: ${e.message}`));
    });

  switch(response.status) {
  case 201:
    return await response.json() as Promise<box>;
  case 409:
    return Promise.reject(new AlreadyExistsError(`Box with id ${boxId} already exists`));
  default:
    return Promise.reject(new Error('Failed to create box'));
  }
}

export async function postNewIssuesForTitle(id: number, issues: newspaper[]): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/newspaper/${id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(issues)
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to post newspaper issues: ${e.message}`));
  });
}

export async function deleteIssue(catalog_id: string): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/newspaper/single/${catalog_id}`, {
    method: 'DELETE'
  }).catch((e: Error) => {
    return Promise.reject(new Error(`Failed to delete newspaper issue: ${e.message}`));
  });
}
