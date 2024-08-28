import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {PrismaClientKnownRequestError} from '@prisma/client/runtime/library';
import {title} from '@prisma/client';
import {Box} from '@/models/Box';


interface IdParams { params: { id: string} }
interface PatchData {
  box?: Box;
  notes?: string;
  shelf?: string;
}

// GET api/title/[id]
export async function GET(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = +params.params.id;
  return prisma.title.findUniqueOrThrow({
    where: { id }
  })
    .then(localTitle => {
      return NextResponse.json(localTitle, {status: 200});
    })
    .catch((e: Error) => {
      // PrismaClientKnownRequestError is returned from Prisma when request is OK but something is wrong
      // P2025 is code for record not found. See https://www.prisma.io/docs/orm/reference/error-reference
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        return NextResponse.json({error: `No title found with ID ${id}.`}, {status: 404});
      }
      return NextResponse.json({error: `Error looking for title: ${e.name} - ${e.message}`}, {status: 500});
    });
}

// POST api/title/[id]
export async function POST(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const exists = await prisma.title.findUnique({
    where: { id: +params.params.id }
  });
  if (exists) return NextResponse.json({error: 'Title already exists'}, {status: 409});

  const localTitle = await req.json() as title;

  return prisma.title.create({
    data: { ...localTitle }
  })
    .then(() => {
      return NextResponse.json(localTitle, {status: 201});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create title: ${e.message}`}, {status: 500});
    });
}

// PUT api/title/[id]
export async function PUT(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const localTitle = await req.json() as title;

  return prisma.title.update({
    where: { id: +params.params.id },
    data: { ...localTitle }
  })
    .then(() => {
      return new NextResponse(null, {status: 204});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to update title: ${e.name} - ${e.message}`}, {status: 500});
    });
}

// PATCH api/title/[id]
export async function PATCH(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const { box, notes, shelf } = await req.json() as PatchData;
  const id = +params.params.id;

  if (box) {
    return prisma.title.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      data: { last_box: box.boxId, last_box_from: box.startDate }
    })
      .then(() => {
        return new NextResponse(null, {status: 204});
      })
      .catch((e: Error) => {
        return NextResponse.json({error: `Failed to update box: ${e.message}`}, {status: 500});
      });
  } else if (notes || notes === '') {
    return prisma.title.update({
      where: { id },
      data: { notes }
    })
      .then(() => {
        return new NextResponse(null, {status: 204});
      })
      .catch((e: Error) => {
        return NextResponse.json({error: `Failed to update notes: ${e.message}`}, {status: 500});
      });
  } else if (shelf) {
    return prisma.title.update({
      where: { id },
      data: { shelf }
    })
      .then(() => {
        return new NextResponse(null, {status: 204});
      })
      .catch((e: Error) => {
        return NextResponse.json({error: `Failed to update shelf: ${e.message}`}, {status: 500});
      });
  } else {
    return NextResponse.json({error: 'No updatable data provided (can patch box, notes and shelf)'}, {status: 400});
  }
}
