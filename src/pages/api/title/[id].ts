import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import {title} from '@prisma/client';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {Box} from '@/models/Box';


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
  case 'PATCH':
    return handlePATCH(titleId as string, req.body as Box, res);
  default:
    throw new Error('Method not supported');
  }

}

// GET api/title/[id]
async function handleGET(titleId: string, res: NextApiResponse) {
  const id: number = +titleId;
  const localTitle = await prisma.title.findUniqueOrThrow({
    where: { id }
  }).catch((e: Error) => {
    if (e instanceof PrismaClientKnownRequestError) { // Error returned from prisma when not found (but request is OK)
      return res.status(404).json({error: `Failed to find title: ${e.message}`});
    }
    return res.status(500).json({error: 'Could not look for titles'});
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
    return res.status(500).json({error: `Failed to create or update title: ${e}`});
  });

  return res.status(200).json(localTitle);
}

// PATCH api/title/[id]
async function handlePATCH(titleId: string, box: Box,  res: NextApiResponse) {
  await prisma.title.update({
    where: { id: +titleId },
    // eslint-disable-next-line @typescript-eslint/naming-convention
    data: { last_box: box.boxId, last_box_from: box.startDate }
  }).catch(e => {
    return res.status(500).json({error: `Failed to update title: ${e}`});
  });

  return res.status(204).end();
}
