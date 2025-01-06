import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {contact_info} from '@prisma/client';

interface IdParams { params: { id: string} }

export async function GET(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = +params.params.id;
  return prisma.contact_info.findMany({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    where: { title_id: id }
  })
    .then(contactInfo => {
      return NextResponse.json(contactInfo, {status: 200});
    })
    .catch((e: Error) => {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        return NextResponse.json({error: `No title found with ID ${id}.`}, {status: 404});
      }
      return NextResponse.json({error: `Error looking for contact_info: ${e.name} - ${e.message}`}, {status: 500});
    });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const localContactInfo = await req.json() as contact_info[];

  return prisma.contact_info.createMany({
    data: { ...localContactInfo }
  })
    .then(() => {
      return NextResponse.json(localContactInfo, {status: 201});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create contact_info: ${e.message}`}, {status: 500});
    });
}