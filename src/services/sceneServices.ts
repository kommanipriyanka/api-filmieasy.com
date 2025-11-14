import { desc, eq, sql } from "drizzle-orm";


import db from "../database/db";
import { artist_projects, artist_scenes, ArtistProjectTable, ArtistSceneTable, newArtistScene, Scene, scenes, SceneTable } from "../database/schemas";
import { deleteRecordById, deleteRecordsByAColumnValue, saveRecord, saveRecords } from "./baseDbServices";
import { markArtistsAvailableForDates, markArtistsUnavailableForDate } from "./userServices";
import { upsertArtistProjectDates } from "./projectServices";
import { createScene } from "../validations/sceneValidations";
import { S3Service } from "./fileServices";

const s3Service = new S3Service();


export const getScenes = async (projectId: number, page: number, limit: number) => {
  const offset = (page - 1) * limit;

  const data = await db.query.scenes.findMany({
    where: eq(scenes.project_id, projectId),
    offset,
    limit,
    orderBy: desc(scenes.created_at),
    with: {
      artistScenes: {
        columns: {},
        with: {
           artist:{
            columns: {
              full_name:true,
              role_type:true

            }
           }
         },
      },
    },
  });
  return await Promise.all(
    data.map(async (scene) => ({
      ...scene,
      script_download_url: scene.script_path
        ? await s3Service.getPresignedDownloadUrl(scene.script_path)
        : null,
    }))
  );
};


export const create = async (data: createScene, projectId: number) => {
  const { scene_members, ...sceneData } = data;
  return db.transaction(async (trx) => {
    const newScene = await saveRecord<SceneTable>(scenes, { ...data, project_id: projectId }, trx);

    if (Array.isArray(scene_members) && scene_members.length > 0) {
      const records: newArtistScene[] = scene_members.map((artistId: number) => ({
        artist_id: artistId,
        scene_id: newScene.id,
      }));
      await saveRecords<ArtistSceneTable>(artist_scenes, records, trx);
    }

    if (scene_members?.length && sceneData.start_date) {
      await markArtistsUnavailableForDate(trx, scene_members, sceneData.start_date);
      const startDate = sceneData.start_date;
      const callSheetRecords = scene_members.map(id => ({
        artist_id: id,
        project_id: projectId,
        dates: [
          {
            date: startDate,
            scene_id: newScene.id,
            status: "Upcoming" as const,
          },
        ],
      }));
      await saveRecords<ArtistProjectTable>(artist_projects, callSheetRecords, trx);
    }

    return newScene;
  });
};

export const createScenes = async (data: createScene, projectId: number) => {
  return db.transaction(async (trx) => {
    const { scene_members, start_date, end_date, ...sceneFields } = data;
    const scene = await saveRecord<SceneTable>(scenes, { ...sceneFields, start_date, end_date, project_id: projectId }, trx);

    const members = Array.isArray(scene_members) ? scene_members : [];
    if (!members.length) return scene;

    await saveRecords<ArtistSceneTable>(
      artist_scenes,
      members.map(artistId => ({ artist_id: artistId, scene_id: scene.id })),
      trx,
    );

    const dates: string[] = [];
    if (start_date && end_date) {
      const s = new Date(start_date);
      const e = new Date(end_date);
      for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
        dates.push(d.toISOString().slice(0, 10));
      }

      if (dates.length) {
        await Promise.all(dates.map(date => markArtistsUnavailableForDate(trx, members, date)));

        const scenesPayload = dates.map(date => ({
          scene_id: scene.id,
          date,
          status: "Upcoming" as const,
        }));

        await Promise.all(
          members.map(artist_id => upsertArtistProjectDates(trx, projectId, artist_id, scenesPayload)),
        );
      }
    }

    return scene;
  });
};
export const getArtistIdsForScene = async (sceneId: number, trx: any) => {
  const executor = trx ?? db;
  const rows: any[] = await executor
    .select({ artist_id: artist_scenes.artist_id })
    .from(artist_scenes)
    .where(eq(artist_scenes.scene_id, sceneId));
  return (rows || []).map((r: any) => Number(r.artist_id));
};

export const removeScene = (sceneId: number, projectId: number, trx: any) => {
  return trx.query(
    sql`
      UPDATE artist_projects ap
      SET status = jsonb_set(
        ap.status,
        '{scenes}',
        COALESCE((
          SELECT jsonb_agg(elem)
          FROM jsonb_array_elements(ap.status->'scenes') AS elem
          WHERE (elem->>'id')::int <> ${sceneId}
        ), '[]'::jsonb)
      )
      WHERE ap.project_id = ${projectId}
        AND ap.deleted_at IS NULL
        AND (ap.status ? 'scenes')
    `
  );
};

export const buildDateRangeFromScene = (scene: any) => {
  const dates: string[] = [];
  const start = scene?.start_date ? new Date(String(scene.start_date)) : null;
  const end = scene?.end_date ? new Date(String(scene.end_date)) : null;

  if (start && !isNaN(start.getTime())) {
    if (end && !isNaN(end.getTime())) {
      // iterate inclusive from start -> end (UTC-safe)
      let cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate()));
      const last = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate()));
      while (cur <= last) {
        dates.push(cur.toISOString().slice(0, 10));
        cur.setUTCDate(cur.getUTCDate() + 1);
      }
    } else {
      dates.push(start.toISOString().slice(0, 10));
    }
  } else if (end && !isNaN(end.getTime())) {
    dates.push(end.toISOString().slice(0, 10));
  }

  return dates;
};



export const deleteScene = async (scene:Scene) => {
    return db.transaction(async (trx) => {
      const projectId = scene.project_id;
      const artistIds = await getArtistIdsForScene(scene.id, trx);
      await deleteRecordsByAColumnValue(artist_scenes,"scene_id",scene.id,trx);
      await removeScene(scene.id, projectId!, trx);
      const dates = buildDateRangeFromScene(scene);
      const freedCount = await markArtistsAvailableForDates(artistIds, dates, trx);
      await deleteRecordById(scenes,scene.id)
      return {
        deletedSceneId: scene.id,
        affectedArtistIds: artistIds,
        freedDates: dates,
        freedCount,
      };
    });
  };





