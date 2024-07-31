import {NextApiRequest, NextApiResponse} from 'next';
import {title} from '@prisma/client';
import prisma from '@/lib/prisma';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
  case 'POST':
    return handlePOST(req.body as title, res);
  default:
    throw new Error('Method not supported');
  }
}

// POST api/title
async function handlePOST(localTitle: title, res: NextApiResponse) {
  await prisma.title.upsert({
    where: { id: localTitle.id },
    update: { ...localTitle },
    create: { ...localTitle },
  }).catch(e => {
    throw new Error(`Failed to create or update title: ${e}`);
  });

  return res.status(200).json(localTitle);
}
