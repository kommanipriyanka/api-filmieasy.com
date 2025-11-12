import { eq } from "drizzle-orm";

import type { ArtistProjectTable, ArtistSceneTable, newArtistScene, SceneTable } from "../database/schemas";
import type { createScene } from "../validations/sceneValidations";

import db from "../database/db";
import { artist_projects, artist_scenes, scenes } from "../database/schemas";
import { saveRecord, saveRecords } from "./baseDbServices";
import { UserService } from "./userServices";
import { ProjectService } from "./projectServices";

const userService = new UserService();
const projectService = new ProjectService()

export class SceneService {
  getScenes = async (projectId: number, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    return await db.query.scenes.findMany({
      where: eq(scenes.project_id, projectId),
      offset,
      limit,
      with: {
        artistScenes: {
          with: {
            artist: true,
          },
        },
      },
    });
  };

  create = async (data: createScene, projectId: number) => {
    const { scene_members, ...sceneData } = data;
    return db.transaction(async (trx) => {
      const newScene = await saveRecord<SceneTable>(scenes, { ...data, project_id: projectId });
      if (data.scene_members && data.scene_members.length > 0) {
        const records: newArtistScene[] = data.scene_members.map((artistId: number) => ({
          artist_id: artistId,
          scene_id: newScene.id,
        }));
        await saveRecords<ArtistSceneTable>(artist_scenes, records);
      }
      if (scene_members?.length && sceneData.start_date) {
        await userService.markArtistsUnavailableForDate(trx, scene_members, sceneData.start_date);
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
    });
  };

  createScenes = async (data: createScene, projectId: number) => {
    return db.transaction(async (trx) => {
      const { scene_members, start_date, end_date, ...sceneFields } = data;
      const scene = await saveRecord(scenes, { ...sceneFields, start_date, end_date, project_id: projectId }, trx);
      const members = Array.isArray(scene_members) ? scene_members : [];
      if (!members.length)
        return scene;
      await saveRecords(artist_scenes, members.map(artistId => ({ artist_id: artistId, scene_id: scene.id })), trx);

      const dates: string[] = [];
      if (start_date && end_date) {
        const s = new Date(start_date);
        const e = new Date(end_date);
        for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
          dates.push(d.toISOString().slice(0, 10));
        }
        if (dates.length) {
          await Promise.all(dates.map(date => userService.markArtistsUnavailableForDate(trx, members, date)));
          const scenesPayload = dates.map(date => ({scene_id: scene.id,date,status: 'Upcoming' as const,}));
          await Promise.all(members.map(artist_id =>projectService.upsertArtistProjectDates(trx, projectId, artist_id, scenesPayload)));
        }
        return scene;
      }
    });
  };
}
