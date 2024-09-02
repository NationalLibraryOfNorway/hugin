import {NextRequest, NextResponse} from 'next/server';
import prisma from '@/lib/prisma';
import {newspaper} from '@prisma/client';
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

  for (const issue of issues) {
    if (issue.received) {
      const dto = createCatalogNewspaperDtoFromIssue(issue, titleId);
      const catalogItem = await postItemToCatalog(dto);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const issueWithId: newspaper = {...issue, catalog_id: catalogItem.parentCatalogueId};
      issuesWithId.push(issueWithId);
    } else {
      const dto = createCatalogMissingNewspaperDtoFromIssue(issue, titleId);
      const catalogItem = await postMissingItemToCatalog(dto);
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const issueWithId: newspaper = {...issue, catalog_id: catalogItem.catalogueId};
      issuesWithId.push(issueWithId);
    }
  }

  return prisma.newspaper.createMany({
    data: issuesWithId
  })
    .then(() => {
      return NextResponse.json(issuesWithId, {status: 200});
    })
    .catch((e: Error) => {
      return NextResponse.json({error: `Failed to create newspaper: ${e.message}`}, {status: 500});
    });
}
