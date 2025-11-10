import { and, desc, eq } from "drizzle-orm";

import db from "../database/db";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";

export class UserService {
  listArtists = async (page: number, limit: number, filters: any[]) => {
    const offset = (page - 1) * limit;
    const whereCondition = filters.length > 0 ? and(...filters) : undefined;
    const allArtists = await db.query.artists.findMany({
      offset,
      limit,
      where: whereCondition,
      orderBy: [desc(artists.created_at)],
      with: {
        department: {
          columns: {
            name: true,
          },
        },
      },
    });
    return allArtists.map(artist => ({ ...artist, DOB: artist.DOB ? new Date(artist.DOB).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : null }));
  };

  getProjects = async (page: number, limit: number, filters: any[]) => {
    const offset = (page - 1) * limit;
    const whereCondition = and(...filters);
    const result = await db.query.artist_projects.findMany({
      offset,
      limit,
      where: whereCondition,
      orderBy: (desc(projects.created_at)),
      with: {
        project: true,
      },
    },
    );
    return result.map(row => row.project);
  };

  getArtistDetails = async (id: number) => {
    return await db.query.artists.findFirst({
      where: eq(artists.id, id),
      with: {
        department: {
          columns: {
            name: true,
          },
        },
      },
    });
  };

  importArtistsService = async (records: any[]) => {
    if (!records?.length)
      return { insertedRecords: 0, skippedDuplicates: 0 };

    const inserted = await db
      .insert(artists)
      .values(records)
      .onConflictDoNothing()
      .returning({ id: artists.id });

    return {
      insertedRecords: inserted.length,
      skippedDuplicates: records.length - inserted.length,
    };
  };
}
