import { and, desc, eq } from "drizzle-orm";

import db from "../database/db";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";

export async function listArtists(page: number, limit: number, filters: any[]) {
  const offset = (page - 1) * limit;
  const whereCondition = filters.length > 0 ? and(...filters) : undefined;
  const allArtists = await db.query.artists.findMany({
    offset,
    limit,
    where: whereCondition,
    orderBy:(desc(artists.created_at)),
    with: {
      department: {
        columns: {
          name: true,
        },
      },
    },
  });
  return allArtists.map(artist => ({
    ...artist,
    DOB: artist.DOB
      ? new Date(artist.DOB).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : null,
    }));
}

export async function getProjects(page: number, limit: number, filters:any[] ) {
  const offset = (page - 1) * limit;
  const whereCondition = and(...filters) 
  const result = await db.query.artistProjects.findMany({
    offset,
    limit,
    where:whereCondition,
    orderBy:(desc(projects.created_at)),
    with: {
      project: true,
    },
  },

  );
  return result.map(row => row.project);
}
