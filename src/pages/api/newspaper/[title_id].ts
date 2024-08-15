/* eslint-disable @typescript-eslint/naming-convention */

import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import {newspaper} from '@prisma/client';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const titleId = req.query.title_id;
  const box = req.query.box;

  switch (req.method) {
  case 'GET':
    return handleGET(titleId as string, box as string, res);
  case 'POST':
    return handlePOST(req.body as newspaper[], res);
  default:
    throw new Error('Method not supported');
  }
}

// GET api/newspaper/[title_id]?box=[box]
async function handleGET(titleId: string, box: string, res: NextApiResponse) {
  const issuesForTitle = await prisma.newspaper.findMany({
    where: {
      title_id: +titleId,
      box
    },
    orderBy: { date: 'asc' }
  }).catch((e: Error) => {
    // PrismaClientKnownRequestError is returned from Prisma when request is OK but something is wrong
    // P2025 is code for record not found. See https://www.prisma.io/docs/orm/reference/error-reference
    if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
      return res.status(404).json({error: `No title found with ID ${titleId}: ${e.message}`});
    }
    return res.status(500).json({error: `Error looking for title: ${e.name} - ${e.message}`});
  });

  return res.status(200).json(issuesForTitle);
}

// POST api/newspaper/[title_id]
async function handlePOST(issues: newspaper[], res: NextApiResponse) {
  await prisma.newspaper.createMany({
    data: issues
  }).catch(e => {
    return res.status(500).json({error: `Failed to create or update newspapers: ${e}`});
  });

  return res.status(200).json(issues);
}
