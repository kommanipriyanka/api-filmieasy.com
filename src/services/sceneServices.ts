import { eq } from "drizzle-orm";
import db from "../database/db";
import { scenes } from "../database/schemas";




export async function getScenes(projectId: number) {
  return await db.query.scenes.findMany({
    where: eq(scenes.project_id, projectId),
    with: {
      artistScenes: {
        with: {
          user: true
        }
      }
    }
  });
}


