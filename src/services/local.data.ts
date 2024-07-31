import { title } from '@prisma/client';

export async function getLocalTitle(id: string): Promise<title> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title/${id}`);
  return await response.json() as Promise<title>;
}

export async function postLocalTitle(localTitle: title): Promise<Response> {
  return await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH}/api/title`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(localTitle),
  });
}
