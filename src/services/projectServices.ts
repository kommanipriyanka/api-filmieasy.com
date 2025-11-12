import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";

import type { SceneTable } from "../database/schemas";
import type { ArtistProjectTable, CallSheetData } from "../database/schemas/artistProjects";
import type { ProjectTable } from "../database/schemas/projects";
import type { CreateProject, CreateProjectWithScenes } from "../validations/projectValidations";

import db from "../database/db";
import { artist_scenes, scenes } from "../database/schemas";
import { artist_projects } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";
import { getRecordsCount, saveRecord, saveRecords } from "./baseDbServices";
import { S3Service } from "./fileServices";
import { UserService } from "./userServices";

const userService = new UserService();
const s3Service = new S3Service();

export class ProjectService {
  getUsers = async (projectId: number, page: number, limit: number) => {
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
  };

  listProjects = async (page: number, limit: number, userId: number, searchString?: string) => {
    const offset = (page - 1) * limit;
    const whereCondition = searchString
      ? and(
          eq(projects.created_by, userId),
          ilike(projects.name, `%${searchString}%`),
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
    const result = await Promise.all(
      projectsList.map(async ({ members, ...proj }) => {
        const project_logo_url = proj.project_logo ? await s3Service.getPresignedDownloadUrl(proj.project_logo) : null;
        return {
          ...proj,
          project_logo_url,
          membersCount: members.length,
        };
      }),
    );
    const total_records = await getRecordsCount(projects, [whereCondition]);
    return { total_records, result };
  };

  createProject = async (data: CreateProject, userId: number) => {
    return await db.transaction(async (trx) => {
      const project = await saveRecord<ProjectTable>(projects, { ...data, created_by: userId }, trx);
      if (data.team_members && data.team_members.length > 0) {
        const records = data.team_members.map((artistId: number) => ({
          artist_id: artistId,
          project_id: project.id,
        }));
        await saveRecords<ArtistProjectTable>(artist_projects, records, trx);
      }
      return project;
    });
  };

  createProjectWithScenes = async (userId: number, data: CreateProjectWithScenes) => {
    return db.transaction(async (trx) => {
      const { project_scenes, ...projectData } = data;
      const project = await saveRecord(projects, { ...projectData, created_by: userId }, trx);
      const teamMembers = data.team_members ?? [];
      if (teamMembers.length > 0) {
        const teamRecords = teamMembers.map(id => ({ artist_id: id, project_id: project.id }));
        await saveRecords(artist_projects, teamRecords, trx);
      }
      if (Array.isArray(project_scenes) && project_scenes.length > 0) {
        for (const sceneData of project_scenes) {
          const { scene_members, ...sceneFields } = sceneData;
          const scene = await saveRecord<SceneTable>(scenes, { ...sceneFields, project_id: project.id }, trx);

          if (scene_members?.length && sceneFields.start_date) {
            await userService.markArtistsUnavailableForDate(trx, scene_members, sceneFields.start_date);
            const startDate = sceneFields.start_date;
            const callSheetRecords = scene_members.map(id => ({
              artist_id: id,
              project_id: project.id,
              dates: [
                {
                  date: startDate,
                  scene_id: scene.id,
                  status: "Upcoming" as const,
                },
              ],
            }));
            await saveRecords<ArtistProjectTable>(artist_projects, callSheetRecords, trx);
          }
          if (scene_members?.length) {
            const sceneMemberRecords = scene_members.map(id => ({ artist_id: id, scene_id: scene.id }));

            await saveRecords(artist_scenes, sceneMemberRecords, trx);
          }
        }
      }
      return project;
    });
  };
 upsertArtistProjectDates = async(trx: any,projectId: number,artistId: number,newEntries: CallSheetData[]) =>{
  const jsonValue = sql`${JSON.stringify(newEntries)}::jsonb`;
  await trx
    .insert(artist_projects)
    .values({
      project_id: projectId,
      artist_id: artistId,
      dates: jsonValue,
      created_at: new Date(),
      updated_at: new Date(),
    })
    .onConflictDoUpdate({
      target: [artist_projects.project_id, artist_projects.artist_id],
      set: {
        dates: sql`${artist_projects.dates} || ${jsonValue}`,
        updated_at: new Date(),
      },
    });
  }
}