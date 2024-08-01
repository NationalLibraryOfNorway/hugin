import { NotFoundError } from '@/models/Errors';
import { title } from '@prisma/client';

export async function getLocalTitle(id: string): Promise<title> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${id}`);

  switch (response.status) {
  case 200:
    return await response.json() as Promise<title>;
  case 404:
    return Promise.reject(new NotFoundError('Title not found'));
  default:
    return Promise.reject(new Error('Failed to fetch title'));
  }
}

export async function postLocalTitle(localTitle: title): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${localTitle.id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(localTitle),
  });
}
