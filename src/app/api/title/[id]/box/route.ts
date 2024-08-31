/* eslint-disable @typescript-eslint/naming-convention */

import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';

interface IdParams { params: { id: string} }

// GET /title/[id]/box get active box for title
export async function GET(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = +params.params.id;
  return prisma.title.findUnique({
    where: { id },
    include: {
      box: {
        where: { active: true }
      }
    }
  })
    .then(result => {
      if (!result || result.box.length === 0) {
        return NextResponse.json({error: `No title found with ID ${id}.`}, {status: 404});
      }
      if (result.box.length > 1) {
        return NextResponse.json({error: `Multiple active boxes found for title with ID ${id}.`}, {status: 500});
      }
      return NextResponse.json(result.box[0], {status: 200});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to get box: ${e.message}`}, {status: 500});
    });
}

// POST /title/[id]/box create new box for title
export async function POST(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = +params.params.id;
  const { boxId, startDate } = await req.json() as {boxId: string; startDate: string};

  if (await doesBoxExist(boxId)) {
    return NextResponse.json({error: `Box with ID ${boxId} already exists.`}, {status: 409});
  }

  await setActiveBoxToInactive(id);

  return prisma.box.create({
    data: {
      id: boxId,
      date_from: new Date(startDate),
      title_id: id,
      active: true
    }
  })
    .then(result => {
      return NextResponse.json(result, {status: 201});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create box: ${e.message}`}, {status: 500});
    });
}

// PATCH /title/[id]/box set active box for title
export async function PATCH(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const id = +params.params.id;
  const { boxId } = await req.json() as {boxId: string; startDate: string};

  await setActiveBoxToInactive(id);

  const existingBox = await prisma.box.findUniqueOrThrow({
    where: { id: boxId }
  });

  return prisma.box.create({
    data: {
      ...existingBox,
      active: true
    }
  })
    .then(result => {
      return NextResponse.json(result, {status: 204});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to update box: ${e.message}`}, {status: 500});
    });
}


export async function doesBoxExist(boxId: string): Promise<boolean> {
  const existingBox = await prisma.box.findFirst({
    where: { id: boxId }
  });
  return !!existingBox;
}

export async function setActiveBoxToInactive(titleId: number): Promise<void> {
  const activeBox = await prisma.box.findFirst({
    where: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      title_id: titleId,
      active: true
    }
  });
  if (activeBox) {
    await prisma.box.update({
      where: { id: activeBox.id },
      data: { active: false }
    });
  }
}