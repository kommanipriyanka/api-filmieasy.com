import { and, desc, eq, ilike, inArray } from "drizzle-orm";

import type { SceneTable } from "../database/schemas";
import type { ArtistProjectTable } from "../database/schemas/artistProjects";
import type { ProjectTable } from "../database/schemas/projects";
import type { CreateProject, CreateProjectWithScenes } from "../validations/projectValidations";

import db from "../database/db";
import { artist_scenes, scenes } from "../database/schemas";
import { artist_projects } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";
import { getRecordsCount, saveRecord, saveRecords } from "./baseDbServices";
import { UserService } from "./userServices";

const userService = new UserService();

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
    const result = projectsList.map(({ members, ...result }) => ({ ...result, membersCount: members.length }));
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

          if (scene_members?.length) {
            const sceneMemberRecords = scene_members.map(id => ({ artist_id: id, scene_id: scene.id }));
            await saveRecords(artist_scenes, sceneMemberRecords, trx);
          }
        }
      }

      return project;
    });
  };
}
