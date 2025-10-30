import { and, eq } from "drizzle-orm";

import db from "../database/db";
import { artistProjects } from "../database/schemas/artistProjects";

export async function listArtists(page: number, limit: number, filters: any[] = []) {
  const offset = (page - 1) * limit;
  const whereCondition = filters.length > 0 ? and(...filters) : undefined;
  const allArtists = await db.query.artists.findMany({
    offset,
    limit,
    where: whereCondition,
    columns: {
      id: true,
      full_name: true,
      email: true,
      department_id: true,
      phone: true,
      DOB: true,
      address: true,

    },
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
      ? new Intl.DateTimeFormat("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }).format(new Date(artist.DOB))
      : null,
  }));
}

export async function getProjects(page: number, limit: number, userId: number) {
  const offset = (page - 1) * limit;
  const result = await db.query.artistProjects.findMany({
    offset,
    limit,
    where: eq(artistProjects.artist_id, userId),
    with: {
      project: true,
    },
  },

  );
  return result.map(row => row.project);
}
