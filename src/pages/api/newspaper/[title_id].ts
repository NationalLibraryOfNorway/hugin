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
    return handlePOST(titleId as string, req.body as newspaper[], res);
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
    if (e instanceof PrismaClientKnownRequestError) { // Error returned from prisma when not found (but request is OK)
      return res.status(404).json({error: `Failed to find title: ${e.message}`});
    }
    return res.status(500).json({error: 'Could not look for titles'});
  });

  return res.status(200).json(issuesForTitle);
}

// POST api/newspaper/[title_id]
async function handlePOST(titleId: string, issues: newspaper[], res: NextApiResponse) {
  await prisma.$transaction(
    issues.map(issue =>
      prisma.newspaper.upsert({
        where: {
          title_id_box_edition: {
            title_id: issue.title_id,
            box: issue.box,
            edition: issue.edition
          }
        },
        update: {...issue},
        create: {...issue}
      })
    )
  ).catch(e => {
    return res.status(500).json({error: `Failed to create or update newspapers: ${e}`});
  });

  return res.status(200).json(issues);
}
