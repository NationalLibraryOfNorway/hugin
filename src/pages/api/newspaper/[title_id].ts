import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const titleId = req.query.title_id;

  switch (req.method) {
  case 'GET':
    return handleGET(titleId as string, res);
  default:
    throw new Error('Method not supported');
  }
}

// GET api/newspaper/[title_id]
async function handleGET(titleId: string, res: NextApiResponse) {
  const issuesForTitle = await prisma.newspaper.findMany({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    where: { title_id: +titleId },
    orderBy: { date: 'asc' }
  }).catch((e: Error) => {
    if (e instanceof PrismaClientKnownRequestError) { // Error returned from prisma when not found (but request is OK)
      return res.status(404).json({error: `Failed to find title: ${e.message}`});
    }
    return res.status(500).json({error: 'Could not look for titles'});
  });

  return res.status(200).json(issuesForTitle);
}
