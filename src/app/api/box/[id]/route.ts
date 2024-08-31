import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';

interface IdParams { params: { id: string } }

export async function GET(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = params.params.id;
  return prisma.box.findUniqueOrThrow({
    where: { id }
  })
    .then(result => {
      return NextResponse.json(result, {status: 200});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to fetch box: ${e.message}`}, {status: 500});
    });
}