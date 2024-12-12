import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {newspaper, Prisma} from '@prisma/client';
import {createCatalogNewspaperDtoFromIssue} from '@/models/CatalogNewspaperDto';
import {postItemToCatalog, postMissingItemToCatalog} from '@/services/catalog.data';
import {createCatalogMissingNewspaperDtoFromIssue} from '@/models/CatalogMissingNewspaperDto';


// eslint-disable-next-line @typescript-eslint/naming-convention
interface IdParams { params: { title_id: string} }

// GET api/newspaper/[title_id]?box=[box]
export async function GET(req: NextRequest): Promise<NextResponse> {
  const boxId = req.nextUrl.searchParams.get('box_id');
  if (!boxId) return NextResponse.json({error: 'Box not provided'}, {status: 400});

  return await prisma.newspaper.findMany({
    where: {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      box_id: boxId
    },
    orderBy: { date: 'desc' }
  })
    .then(issuesForTitle => {
      return NextResponse.json(issuesForTitle, {status: 200});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Error looking for title: ${e.name} - ${e.message}`}, {status: 500});
    });
}

// POST api/newspaper/[title_id]
export async function POST(req: NextRequest, params: IdParams): Promise<NextResponse> {
  const titleId = params.params.title_id;
  const issues = await req.json() as newspaper[];
  const issuesWithId: newspaper[] = [];
  const issuesToUpdate: newspaper[] = [];

  for (const issue of issues) {
    if (issue.received) {
      const dto = createCatalogNewspaperDtoFromIssue(issue, titleId);
      const catalogItem = await postItemToCatalog(dto);

      const existingIssue = await prisma.newspaper.findFirst({
        where: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          catalog_id: catalogItem.parentCatalogueId
        }
      });

      if (existingIssue) {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        issuesToUpdate.push({...issue, catalog_id: existingIssue.catalog_id});
      } else {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const issueWithId: newspaper = {...issue, catalog_id: catalogItem.parentCatalogueId};
        issuesWithId.push(issueWithId);
      }
    } else {
      const dto = createCatalogMissingNewspaperDtoFromIssue(issue, titleId);
      const catalogItem = await postMissingItemToCatalog(dto);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const issueWithId: newspaper = {...issue, catalog_id: catalogItem.catalogueId};
      issuesWithId.push(issueWithId);
    }
  }

  return updateAndCreate(issuesToUpdate, issuesWithId)
    .then(() => {
      return NextResponse.json([...issuesWithId, ...issuesToUpdate], {status: 200});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create newspaper: ${e.message}`}, {status: 500});
    });
}

async function updateAndCreate(toUpdate: newspaper[], toCreate: newspaper[]): Promise<Prisma.BatchPayload> {
  try {
    return await prisma.$transaction(async () => {
      const updatedRecords = await Promise.all(
        toUpdate.map(async record => {
          return prisma.newspaper.update({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            where: {catalog_id: record.catalog_id},
            data: record,
          });
        })
      );

      const createdRecords = await prisma.newspaper.createMany({
        data: toCreate,
      });

      return {...updatedRecords, ...createdRecords};
    });
  } catch (error) {
    if (error instanceof Error) {
      return Promise.reject(new Error(`Failed to update newspaper: ${error.message}`));
    }
    return Promise.reject(new Error('Failed to update newspaper'));
  }
}
