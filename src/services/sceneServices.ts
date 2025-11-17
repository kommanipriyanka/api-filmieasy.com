import { desc, eq, sql } from "drizzle-orm";
import { Scene, scenes, SceneTable } from "../database/schemas";
import {artist_scenes, ArtistSceneTable } from "../database/schemas/artistScenes"
import  { Transaction } from "../types/dbTypes";
import  { createScene } from "../validations/sceneValidations";
import db from "../database/db";
import { deleteRecordById, deleteRecordsByAColumnValue, saveRecord, saveRecords } from "./baseDbServices";
import { S3Service } from "./fileServices";
import { upsertArtistProjectDates } from "./projectServices";
import { setArtistsAvailabilityForDates } from "./userServices";

const s3Service = new S3Service();

export async function getScenes(projectId: number, page: number, limit: number) {
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
          artist: {
            columns: {
              full_name: true,
              role_type: true,

            },
          },
        },
      },
    },
  });
  return await Promise.all(
    data.map(async scene => ({
      ...scene,
      script_download_url: scene.script_path
        ? await s3Service.getPresignedDownloadUrl(scene.script_path)
        : null,
    })),
  );
}

export async function createScenes(data: createScene, projectId: number) {
  return db.transaction(async (trx) => {
    const { scene_members, start_date, end_date, ...sceneFields } = data;
    const scene = await saveRecord<SceneTable>(scenes, { ...sceneFields, start_date, end_date, project_id: projectId }, trx);
    const members = Array.isArray(scene_members) ? scene_members : [];
    if (!members.length)
      return scene;
    await saveRecords<ArtistSceneTable>(
      artist_scenes,
      members.map(artistId => ({ artist_id: artistId, scene_id: scene.id })),
      trx,
    );
    const dates = buildDateRangeFromScene(scene);
    await setArtistsAvailabilityForDates(members, dates, "Available", trx);
    const scenesPayload = dates.map(date => ({ scene_id: scene.id, date, status: "Upcoming" as const }));
    await Promise.all(members.map(artist_id => upsertArtistProjectDates(trx, projectId, artist_id, scenesPayload)));
    return scene;
  });
}
export async function getArtistIdsForScene(sceneId: number, trx: Transaction) {
  const client = trx ?? db;
  const rows = await client
    .select({ artist_id: artist_scenes.artist_id })
    .from(artist_scenes)
    .where(eq(artist_scenes.scene_id, sceneId));
  return (rows || []).map(r => Number(r.artist_id));
}

export function removeScene(sceneId: number, projectId: number, trx: any) {
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
    `,
  );
}

export function buildDateRangeFromScene(scene: Scene) {
  const dates: string[] = [];

  const cur = new Date(`${scene.start_date}T00:00:00Z`);
  const last = new Date(`${scene.end_date}T00:00:00Z`);

  while (cur <= last) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setUTCDate(cur.getUTCDate() + 1);
  }

  return dates;
}

export async function deleteScene(scene: Scene) {
  return db.transaction(async (trx) => {
    const projectId = scene.project_id;
    const artistIds = await getArtistIdsForScene(scene.id, trx);
    await deleteRecordsByAColumnValue(artist_scenes, "scene_id", scene.id, trx);
    await removeScene(scene.id, projectId!, trx);
    const dates = buildDateRangeFromScene(scene);
    const freedCount = await setArtistsAvailabilityForDates(artistIds, dates, "Available", trx);
    await deleteRecordById(scenes, scene.id);
    return {
      deletedSceneId: scene.id,
      affectedArtistIds: artistIds,
      freedDates: dates,
      freedCount,
    };
  });
}
