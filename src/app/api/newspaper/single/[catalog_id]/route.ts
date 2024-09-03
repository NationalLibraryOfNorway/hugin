import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {deletePhysicalItemFromCatalog, postItemToCatalog, putPhysicalItemInCatalog} from '@/services/catalog.data';
import {newspaper} from '@prisma/client';
import {createCatalogNewspaperDtoFromIssue} from '@/models/CatalogNewspaperDto';
import {createCatalogNewspaperEditDtoFromIssue} from '@/models/CatalogNewspaperEditDto';

// eslint-disable-next-line @typescript-eslint/naming-convention
interface IdParams { params: { catalog_id: string} }

// DELETE api/newspaper/single/[catalog_id]
export async function DELETE(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const catalog_id = params.params.catalog_id;
  const catalogResponse = await deletePhysicalItemFromCatalog(catalog_id)
    .catch((e: Error)  => {
      return NextResponse.json({error: `Failed to delete newspaper in catalog: ${e.message}`}, {status: 500});
    });
  if (catalogResponse instanceof NextResponse) return catalogResponse;

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

export async function PUT(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const catalog_id = params.params.catalog_id;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  const oldIssue = await prisma.newspaper.findUniqueOrThrow({where: {catalog_id}})
    .catch((e: Error) => NextResponse.json({error: `Failed to find newspaper with id ${catalog_id}: ${e.message}`}, {status: 500}));
  if (oldIssue instanceof NextResponse) return oldIssue;

  const box = await prisma.box.findUniqueOrThrow({where: {id: oldIssue.box_id}})
    .catch((e: Error) => NextResponse.json({error: `Failed to find box with id ${oldIssue.box_id}: ${e.message}`}, {status: 500}));
  if (box instanceof NextResponse) return box;

  const updatedIssue: newspaper = await req.json() as newspaper;

  // If notes or edition is changed, update the manifestation in catalog
  if (oldIssue.notes !== updatedIssue.notes || oldIssue.edition !== updatedIssue.edition) {
    const catalogPutResponse = await putPhysicalItemInCatalog(createCatalogNewspaperEditDtoFromIssue(updatedIssue))
      .catch((e: Error) => NextResponse.json({error: `Could not update item in catalog: ${e.message}`}, {status: 500}));
    if (catalogPutResponse instanceof NextResponse) return catalogPutResponse;
  }

  if (oldIssue.received && !updatedIssue.received) {
    // Must delete item (but not manifestation) in catalog if issue is changed from received to missing

    const catalogDeleteResponse = await deletePhysicalItemFromCatalog(params.params.catalog_id, false)
      .catch((e: Error) => {
        return NextResponse.json({error: `Could not update item in catalog: ${e.message}`}, {status: 500});
      });
    if (catalogDeleteResponse instanceof NextResponse) return catalogDeleteResponse;
  } else if (!oldIssue.received && updatedIssue.received) {
    // If issue was missing, but is now received, add item to catalog

    const catalogPostResponse = await postItemToCatalog(createCatalogNewspaperDtoFromIssue(updatedIssue, String(box.title_id)))
      .catch((e: Error) => NextResponse.json({error: `Could not update item in catalog: ${e.message}`}, {status: 500}));
    if (catalogPostResponse instanceof NextResponse) return catalogPostResponse;
  }

  // Update in database
  return prisma.newspaper.update({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    where: {catalog_id},
    data: updatedIssue
  })
    .then(() => new NextResponse(null, {status: 204}))
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to update newspaper in database: ${e.message}`}, {status: 500});
    });
}
