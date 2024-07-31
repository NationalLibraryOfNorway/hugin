import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';


// ANY api/title/[id]
export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const titleId = req.query.id;

  switch (req.method) {
  case 'GET':
    return handleGET(titleId as string, res);
  default:
    throw new Error('Method not supported');
  }

}

// GET api/title/[id]
async function handleGET(titleId: string, res: NextApiResponse) {
  const id: number = +titleId;
  const title = await prisma.title.findUnique({
    where: { id }
  });

  return res.status(200).json(title);
}
