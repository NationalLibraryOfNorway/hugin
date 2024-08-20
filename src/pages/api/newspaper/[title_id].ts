/* eslint-disable @typescript-eslint/naming-convention */

import {NextApiRequest, NextApiResponse} from 'next';
import prisma from '@/lib/prisma';
import {newspaper} from '@prisma/client';
import {createCatalogNewspaperDtoFromIssue} from '@/models/CatalogNewspaperDto';
import {postItemToCatalog, postMissingItemToCatalog} from '@/services/catalog.data';
import {createCatalogMissingNewspaperDtoFromIssue} from '@/models/CatalogMissingNewspaperDto';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/app/auth';

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  const titleId = req.query.title_id;
  const box = req.query.box;

  if (!session) {
    return res.status(401).json({error: 'Unauthorized: Not signed in'});
  }

  switch (req.method) {
  case 'GET':
    return handleGET(titleId as string, box as string, res);
  case 'POST':
    return handlePOST(req.body as newspaper[], res);
  default:
    return res.status(405).end();
  }
}

// GET api/newspaper/[title_id]?box=[box]
async function handleGET(titleId: string, box: string, res: NextApiResponse) {
  const issuesForTitle = await prisma.newspaper.findMany({
    where: {
      title_id: +titleId,
      box
    },
    orderBy: { date: 'desc' }
  }).catch((e: Error) => {
    return res.status(500).json({error: `Error looking for title: ${e.name} - ${e.message}`});
  });
  return res.status(200).json(issuesForTitle);
}

// POST api/newspaper/[title_id]
async function handlePOST(issues: newspaper[], res: NextApiResponse) {
  const issuesWithId: newspaper[] = [];

  for (const issue of issues) {
    if (issue.received) {
      const dto = createCatalogNewspaperDtoFromIssue(issue);
      const catalogItem = await postItemToCatalog(dto);
      const issueWithId: newspaper = {...issue, catalog_id: catalogItem.parentCatalogueId};
      issuesWithId.push(issueWithId);
    } else {
      const dto = createCatalogMissingNewspaperDtoFromIssue(issue);
      const catalogItem = await postMissingItemToCatalog(dto);
      const issueWithId: newspaper = {...issue, catalog_id: catalogItem.catalogueId};
      issuesWithId.push(issueWithId);
    }
  }

  await prisma.newspaper.createMany({
    data: issuesWithId
  }).catch(e => {
    return res.status(500).json({error: `Failed to create or update newspapers in local database: ${e}`});
  });

  return res.status(200).json(issues);
}
