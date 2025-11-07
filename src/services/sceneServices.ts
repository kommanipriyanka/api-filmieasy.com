import { eq } from "drizzle-orm";
import db from "../database/db";
import { scenes } from "../database/schemas";


export class SceneService{

 getScenes = async(projectId: number)=> {
  return await db.query.scenes.findMany({
    where: eq(scenes.project_id, projectId),
    with: {
      artistScenes: {
        with: {
          artist: true
        }
      }
    }
  });
}
}


