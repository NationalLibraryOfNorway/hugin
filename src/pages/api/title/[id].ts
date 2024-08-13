import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import {title} from '@prisma/client';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {Box} from '@/models/Box';

type PatchData = {
  box?: Box;
  notes?: string;
  shelf?: string;
};


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
  case 'PUT':
    return handlePUT(req.body as title, res);
  case 'PATCH':
    return handlePATCH(titleId as string, req.body as PatchData, res);
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
  const exists = await prisma.title.findUnique({
    where: { id: localTitle.id }
  });
  if (exists) {
    return res.status(409).json({error: 'Title already exists'});
  }

  await prisma.title.create({
    data: { ...localTitle }
  }).catch(e => {
    return res.status(500).json({error: `Failed to create title: ${e}`});
  });

  return res.status(201).json(localTitle);
}

// PUT api/title/[id]
async function handlePUT(localTitle: title, res: NextApiResponse) {
  await prisma.title.update({
    where: { id: localTitle.id },
    data: { ...localTitle }
  }).catch(e => {
    return res.status(500).json({error: `Failed to update title: ${e}`});
  });

  return res.status(204).end();
}

// PATCH api/title/[id]
async function handlePATCH(titleId: string, data: PatchData, res: NextApiResponse) {
  if (data.box) {
    await prisma.title.update({
      where: { id: +titleId },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      data: { last_box: data.box.boxId, last_box_from: data.box.startDate }
    }).catch(e => {
      return res.status(500).json({error: `Failed to update box for title: ${e}`});
    });
  }

  if (data.notes) {
    await prisma.title.update({
      where: { id: +titleId },
      data: { notes: data.notes }
    }).catch(e => {
      return res.status(500).json({error: `Failed to update notes for title: ${e}`});
    });
  }

  if (data.shelf) {
    await prisma.title.update({
      where: {id: +titleId},
      data: {shelf: data.shelf}
    }).catch(e => {
      return res.status(500).json({error: `Failed to update shelf for title: ${e}`});
    });
  }

  if (!data.box && !data.notes && !data.shelf) {
    return res.status(400).json({error: 'No updatable data provided (can patch box, notes and shelf)'});
  }

  return res.status(204).end();
}
