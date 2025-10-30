import { eq, inArray } from "drizzle-orm";

import db from "../database/db";
import { artistProjects } from "../database/schemas/artistProjects";
import { artists } from "../database/schemas/artists";
import { listArtists } from "./userServices";

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
