import { and, desc, eq, sql } from "drizzle-orm";

import db from "../database/db";
import { ArtistAvailability, artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";
import { S3Service } from "./fileServices";

const s3Service = new S3Service();


export const listArtists = async (page: number, limit: number, filters: any[]) => {
  const offset = (page - 1) * limit;
  const whereCondition = filters.length > 0 ? and(...filters) : undefined;

  const allArtists = await db.query.artists.findMany({
    offset,
    limit,
    where: whereCondition,
    orderBy: [desc(artists.created_at)],
    with: {
      department: {
        columns: { name: true },
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
};


export const getProjects = async (page: number, limit: number, filters: any[]) => {
  const offset = (page - 1) * limit;

  const rows = await db.query.artist_projects.findMany({
    offset,
    limit,
    where: and(...filters),
    orderBy: desc(projects.created_at),
    with: { project: true },
  });

  const uniqueById = new Map<number, typeof rows[0]["project"]>();
  for (const r of rows) {
    if (r.project && !uniqueById.has(r.project.id)) uniqueById.set(r.project.id, r.project);
  }

  const uniqueProjects = Array.from(uniqueById.values());

  return await Promise.all(
    uniqueProjects.map(async proj => {
      const project_logo_url = proj?proj.project_logo ? await s3Service.getPresignedDownloadUrl(proj.project_logo): null:null;

      return { ...proj, project_logo_url };
    }),
  );
};

export const getArtistDetails = async (id: number) => {
  return db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      department: { columns: { name: true } },
    },
  });
};


export const importArtistsService = async (records: any[]) => {
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

export const getArtistAvailabilities = async (artistId: number) => {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, artistId),
    columns: { id: true, available_dates: true },
  });

  const allDates = (artist!.available_dates ?? []) as ArtistAvailability[];
  const available = allDates.filter(d => d.status === "Available");

  return { available_dates: available };
};

export const markArtistsUnavailableForDate = async (
  trx: any,
  artistIds: number[],
  date: string,
) => {
  if (!artistIds.length) return;

  const client = trx ?? db;

  await client.execute(sql`
    UPDATE artists
    SET available_dates = (
      SELECT jsonb_agg(
        CASE
          WHEN elem->>'date' = ${date} AND elem->>'status' = 'Available'
          THEN jsonb_set(elem, '{status}', '"Unavailable"', true)
          ELSE elem
        END
      )
      FROM jsonb_array_elements(available_dates) AS elem
    )
    WHERE id = ANY(ARRAY[${sql.join(artistIds.map(id => sql`${id}`), sql`, `)}]::int[])
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(available_dates) AS e
        WHERE e->>'date' = ${date} AND e->>'status' = 'Available'
      )
    RETURNING id
  `);
};

export const markArtistsAvailableForDates = async (
  artistIds: number[],
  dates: string[],
  trx?:any): Promise<number> => {
  if (!artistIds?.length || !dates?.length) return 0;
  const client = trx ?? db;

  const artistIdsSql = sql.join(artistIds.map((id) => sql`${id}`), sql`, `);
  const datesSql = sql.join(dates.map((d) => sql`${d}`), sql`, `);

  const res = await client.execute(sql`
    UPDATE artists
    SET available_dates = (
      SELECT jsonb_agg(
        CASE
          WHEN (elem->>'date') = ANY(ARRAY[${datesSql}]::text[])
            AND elem->>'status' = 'Unavailable'
          THEN jsonb_set(elem, '{status}', '"Available"', true)
          ELSE elem
        END
      )
      FROM jsonb_array_elements(available_dates) AS elem
    )
    WHERE id = ANY(ARRAY[${artistIdsSql}]::int[])
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(available_dates) AS e
        WHERE (e->>'date') = ANY(ARRAY[${datesSql}]::text[]) AND e->>'status' = 'Unavailable'
      )
    RETURNING id
  `);

    return Array.isArray(res) ? res.length : 0;

};

