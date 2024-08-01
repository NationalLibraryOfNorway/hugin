import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import {title} from '@prisma/client';


// ANY api/title/[id]
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const titleId = req.query.id;

  switch (req.method) {
  case 'GET':
    return handleGET(titleId as string, res);
  case 'POST':
    return handlePOST(req.body as title, res);
  default:
    throw new Error('Method not supported');
  }

}

// GET api/title/[id]
async function handleGET(titleId: string, res: NextApiResponse) {
  const id: number = +titleId;
  const localTitle = await prisma.title.findUniqueOrThrow({
    where: { id }
  }).catch(e => {
    return res.status(404).json({error: `Failed to find title: ${e}`});
  });

  return res.status(200).json(localTitle);
}

// POST api/title/[id]
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
