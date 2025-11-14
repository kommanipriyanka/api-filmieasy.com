import { and, desc, eq, ilike, inArray, sql } from "drizzle-orm";
import db from "../database/db";
import { artist_scenes, scenes, SceneTable } from "../database/schemas";
import { artist_projects, ArtistProjectTable, CallSheetData } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";
import { deleteRecordsByAColumnValue, getRecordsCount, saveRecord, saveRecords, updateRecordById } from "./baseDbServices";
import { S3Service } from "./fileServices";
import { listArtists, markArtistsUnavailableForDate } from "./userServices";
import { CreateProjectWithScenes, UpdateProject } from "../validations/projectValidations";

const s3Service = new S3Service();

export const getUsers = async (projectId: number, page: number, limit: number) => {
  const filters: any[] = [];
  const artistRows = await db.select().from(artist_projects).where(eq(artist_projects.project_id, projectId));
  const ids = artistRows.map(a => a.artist_id);
  if (ids.length > 0) {
    filters.push(inArray(artists.id, ids as number[]));
  } else {
    return [];
  }
  return await listArtists(page, limit, filters);
};

export const listProjects = async (page: number, limit: number, userId: number, searchString?: string) => {
  const offset = (page - 1) * limit;
  const whereCondition = searchString
    ? and(eq(projects.created_by, userId), ilike(projects.name, `%${searchString}%`))
    : eq(projects.created_by, userId);

  const projectsList = await db.query.projects.findMany({
    where: whereCondition,
    with: {
      members: { columns: { artist_id: true } },
    },
    limit,
    offset,
    orderBy: desc(projects.created_at),
  });

  const result = await Promise.all(
    projectsList.map(async ({ members, ...proj }) => {
      const project_logo_url = proj.project_logo
        ? await s3Service.getPresignedDownloadUrl(proj.project_logo)
        : null;

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

export const createProjectWithScenes = async (userId: number, data: CreateProjectWithScenes) => {
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
          await markArtistsUnavailableForDate(trx, scene_members, sceneFields.start_date);
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

export const upsertArtistProjectDates = async (
  trx: any,
  projectId: number,
  artistId: number,
  newEntries: CallSheetData[],
) => {
  const jsonValue = sql`${JSON.stringify(newEntries)}::jsonb`;
  await trx
    .insert(artist_projects)
    .values({
      project_id: projectId,
      artist_id: artistId,
      dates: jsonValue,
    })
    .onConflictDoUpdate({
      target: [artist_projects.project_id, artist_projects.artist_id],
      set: {
        dates: sql`${artist_projects.dates} || ${jsonValue}`,
        updated_at: new Date(),
      },
    });
};

export const getArtistScenes = async (memberId: number, projectId: number, trx: any) => {
  return trx.query.scenes.findMany({
    with: {
      artistScenes: {
        where: eq(artist_scenes.artist_id, memberId),
      },
    },
    where: eq(scenes.project_id, projectId),
  });
};

export const updateProjectWithTeamMembers = async (
  projectId: number,
  projectData: UpdateProject,
  team_members_add?: number[],
  team_members_remove?: number[],
) => {
  return db.transaction(async (trx) => {
    if (Array.isArray(team_members_remove) && team_members_remove.length > 0) {
      const checks = await Promise.all(
        team_members_remove.map(async (id) => {
          const scenes = await getArtistScenes(id, projectId, trx);
          return { id, scenes };
        }),
      );

      const blocked = checks.filter((c) => c.scenes.length > 0);
      if (blocked.length > 0) {
        return { error: "HAS_SCENES", blocked };
      }

      await Promise.all(
        team_members_remove.map((id) =>
          deleteRecordsByAColumnValue(artist_projects, "artist_id", id, trx),
        ),
      );
    }

    if (Array.isArray(team_members_add) && team_members_add.length > 0) {
      const rowsToInsert = team_members_add.map((id) => ({
        project_id: projectId,
        artist_id: id,
      }));
      await saveRecords(artist_projects, rowsToInsert, trx);
    }

    await updateRecordById(projects, projectId, projectData, trx);
  });
};
