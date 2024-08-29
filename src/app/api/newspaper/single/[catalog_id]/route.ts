import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {deletePhysicalItemFromCatalog} from '@/services/catalog.data';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface IdParams { params: { catalog_id: string} }

// DELETE api/newspaper/single/[catalog_id]
export async function DELETE(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const catalog_id = params.params.catalog_id;
  await deletePhysicalItemFromCatalog(catalog_id)
    .catch((e: Error)  => {
      return NextResponse.json({error: `Failed to delete newspaper in catalog: ${e.message}`}, {status: 500});
    });

  return prisma.newspaper.delete({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    where: { catalog_id: params.params.catalog_id }
  })
    .then(() => {
      return new NextResponse(null, {status: 204});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to delete newspapers: ${e.message}`}, {status: 500});
    });
}
