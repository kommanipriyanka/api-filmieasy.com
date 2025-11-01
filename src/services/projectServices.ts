import { and, Column, ColumnBuilderExtraConfig, desc, eq, ilike, inArray } from "drizzle-orm";

import db from "../database/db";
import { artistProjects } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { listArtists } from "./userServices";
import { projects } from "../database/schemas/projects";
import { getRecordsCount } from "./baseDbServices";

export async function getUsers(projectId: number, page: number, limit: number) {
  const filters: any[] = [];

  const artistIds = await db
    .select()
    .from(artistProjects)
    .where(eq(artistProjects.project_id, projectId));

  const ids = artistIds.map(a => a.artist_id);

  if (ids.length > 0) {
    filters.push(inArray(artists.id, ids as number[]));
  }
  else {
    return [];
  }

  return await listArtists(page, limit, filters);
}

export async function listProjects(page: number, limit: number,userId:number,searchString?:string) {
  const offset = (page - 1) * limit;
  const whereCondition = searchString
    ? and(
        eq(projects.created_by, userId),
        ilike(projects.name, `%${searchString}%`)
      )
    : eq(projects.created_by, userId);
  const projectsList = await db.query.projects.findMany({
    where: whereCondition, 
    with: {
      members: {
        columns: {
          artist_id: true,
        },
      },
    },
    limit,
    offset,
    orderBy: desc(projects.created_at),
   });
  const result = projectsList.map(({ members, ...result }) => ({...result,membersCount: members.length,}));
  const total_records = await getRecordsCount(projects, [whereCondition]);
  return {total_records,result};
}


