import { and, Column, ColumnBuilderExtraConfig, desc, eq, ilike, inArray } from "drizzle-orm";

import db from "../database/db";
import { artist_projects, ArtistProjectTable } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { projects, ProjectTable } from "../database/schemas/projects";
import { getRecordsCount, saveRecord, saveRecords } from "./baseDbServices";
import { CreateProject } from "../validations/projectValidations";
import { UserService } from "./userServices";

const userService = new UserService();

export class ProjectService{

 getUsers = async(projectId: number, page: number, limit: number) =>{
   const filters: any[] = [];
   const artistIds = await db.select().from(artist_projects).where(eq(artist_projects.project_id, projectId));
   const ids = artistIds.map(a => a.artist_id);
   if (ids.length > 0) {
     filters.push(inArray(artists.id, ids as number[]));
   }
   else {
    return [];
  }
  return await userService.listArtists(page, limit, filters);
}

listProjects = async(page: number, limit: number,userId:number,searchString?:string) =>{
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


 createProject = async (data:CreateProject,userId:number)=>{
    return await db.transaction(async (trx) => {
     const project = await saveRecord<ProjectTable>(projects,{ ...data, created_by: userId },trx);
       if (data.team_members && data.team_members.length > 0) {
         const records = data.team_members.map((artistId: number) => ({
          artist_id: artistId,
          project_id: project.id
        }));
        await saveRecords<ArtistProjectTable>(artist_projects, records, trx); 
       }
    return project;
  })
}

}


