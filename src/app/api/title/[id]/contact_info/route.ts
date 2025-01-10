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
  const contactInfo = await req.json() as contact_info[];

  // Filter out the id field as it is an empty string
  const contactInfoToCreate = contactInfo.map(contact => {
    const { title_id, contact_type, contact_value } = contact;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    return { title_id, contact_type, contact_value };
  });

  return prisma.contact_info.createMany({
    data: contactInfoToCreate.filter(contact => contact.contact_value !== '')
  })
    .then(() => {
      return NextResponse.json(contactInfoToCreate, {status: 201});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create contact_info: ${e.message}`}, {status: 500});
    });
}

export async function PUT(req: NextRequest): Promise<NextResponse> {
  const contactInfo = await req.json() as contact_info[];
  // Remove duplicate entries. An entry is duplicate if two or more object with the same contact_type and contact_value exists.
  const uniqueContactInfo = contactInfo.filter((contact, index, self) =>
    index === self.findIndex(t => (
      t.contact_type === contact.contact_type && t.contact_value === contact.contact_value
    ))
  );

  const rowsToUpdate = uniqueContactInfo.filter(contact => contact.contact_value !== '' && contact.id !== '');
  const rowsToCreate = uniqueContactInfo.filter(contact => contact.contact_value !== '' && contact.id === '');
  const rowsToDelete = uniqueContactInfo.filter(contact => contact.contact_value === '' && contact.id !== '');


  try {
    return await prisma.$transaction(async () => {
      const updatedRows = await Promise.all(
        rowsToUpdate.map(async record => {
          return prisma.contact_info.upsert({
            where: { id: record.id },
            update: record,
            create: record
          });
        })
      );

      const createdRows = await prisma.contact_info.createMany({
        data: rowsToCreate.map(contact => {
          const { title_id, contact_type, contact_value } = contact;
          // eslint-disable-next-line @typescript-eslint/naming-convention
          return { title_id, contact_type, contact_value };
        })
      });

      const deletedRows = await Promise.all(
        rowsToDelete.map(async record => {
          return prisma.contact_info.delete({
            where: { id: record.id }
          });
        }));

      return { updatedRows, createdRows, deletedRows };

    }).then(() => {
      return NextResponse.json({status: 200});
    }).catch((e: Error) => {
      return NextResponse.json({error: `Failed to update contact_info: ${e.message}`}, {status: 500});
    });

  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({error: `Failed to update contact_info: ${e.message}`});
    }
    return NextResponse.json({error: 'Failed to update contact_info.'}, {status: 500});
  }
}

export async function DELETE(req: NextRequest): Promise<NextResponse> {
  const contactInfo = await req.json() as contact_info[];

  const contactInfoToDelete = contactInfo.filter(contact => contact.id !== '');

  return prisma.contact_info.deleteMany({
    where: {
      id: {
        in: contactInfoToDelete.map(contact => contact.id)
      }
    }
  })
    .then(() => {
      return NextResponse.json({status: 204});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to delete contact_info: ${e.message}`}, {status: 500});
    });
}