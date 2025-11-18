import { and, desc, eq, ilike, sql } from "drizzle-orm";

import { ArtistAvailability } from "../database/schemas/artists";

import db from "../database/db";
import { departments } from "../database/schemas";
import { artists } from "../database/schemas/artists";
import { projects } from "../database/schemas/projects";
import { S3Service } from "./fileServices";

const s3Service = new S3Service();
export async function listArtists(page: number, limit: number, filters: any[]) {
  const offset = (page - 1) * limit;
  const where = filters.length ? and(...filters) : undefined;
  const allArtists = await db.query.artists.findMany({
    offset,
    limit,
    where,
    orderBy: desc(artists.created_at),
    with: {
      department: { columns: { name: true } },
    },
  });
  return Promise.all(
    allArtists.map(async artist => ({
      ...artist,
      DOB: artist.DOB
        ? new Date(artist.DOB).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : null,
      user_logo_url: artist.profile_pic
        ? await s3Service.getPresignedDownloadUrl(artist.profile_pic)
        : null,
    })),
  );
}

export async function getProjects(page: number, limit: number, filters: any[]) {
  const offset = (page - 1) * limit;
  const artistProjects = await db.query.artist_projects.findMany({
    offset,
    limit,
    where: and(...filters),
    orderBy: desc(projects.created_at),
    columns: {},
    with: { project: true },
  });
  return Promise.all(artistProjects.map(async ({ project }) => ({
    ...project,
    project_logo_url: project?.project_logo
      ? await s3Service.getPresignedDownloadUrl(project.project_logo)
      : null,
  })),
  );
}

export async function getArtistDetails(id: number) {
  const userDetails = await db.query.artists.findFirst({
    where: eq(artists.id, id),
    with: {
      department: { columns: { name: true } },
    },
  });
  if (!userDetails)
    return null;
  const profile_pic_url = userDetails.profile_pic ? await s3Service.getPresignedDownloadUrl(userDetails.profile_pic) : null;
  return { ...userDetails, profile_pic_url };
};

export async function getDepartments(userId: number) {
  const rows = await db.query.departments.findMany({
    where: eq(departments.created_by, userId),
    orderBy: desc(departments.created_at),
    with: {
      artists: {
        columns: {
          id: true,
        },
      },
    },
  });
  const result = rows.map(r => ({
    id: r.id,
    name: r.name,
    created_at: r.created_at,
    memberCount: r.artists.length,
  }));
  return result;
}

export async function importArtistsService(records: any[]) {
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
}

export async function getArtistsDropdownService(userId: number, search_string?: string) {
  const where = and(
    eq(artists.invited_by, userId),
    search_string
      ? ilike(artists.email, `%${search_string}%`)
      : undefined
    );

  const rows = await db.query.artists.findMany({
    where,
    columns: {
      id: true,
      email: true,
    },
    orderBy: artists.email,
  });
  return rows;
}


export async function getArtistAvailabilities(artistId: number) {
  const artist = await db.query.artists.findFirst({
    where: eq(artists.id, artistId),
    columns: { id: true, available_dates: true },
  });

  const allDates = (artist!.available_dates ?? []) as ArtistAvailability[];
  const available = allDates.filter(d => d.status === "Available");

  return { available_dates: available };
}

// export async function markArtistsUnavailableForDate(trx: any, artistIds: number[], date: string) {
//   if (!artistIds.length)
//     return;

//   const client = trx ?? db;

//   await client.execute(sql`
//     UPDATE artists
//     SET available_dates = (
//       SELECT jsonb_agg(
//         CASE
//           WHEN elem->>'date' = ${date} AND elem->>'status' = 'Available'
//           THEN jsonb_set(elem, '{status}', '"Unavailable"', true)
//           ELSE elem
//         END
//       )
//       FROM jsonb_array_elements(available_dates) AS elem
//     )
//     WHERE id = ANY(ARRAY[${sql.join(artistIds.map(id => sql`${id}`), sql`, `)}]::int[])
//       AND EXISTS (
//         SELECT 1
//         FROM jsonb_array_elements(available_dates) AS e
//         WHERE e->>'date' = ${date} AND e->>'status' = 'Available'
//       )
//     RETURNING id
//   `);
// }

// export async function markArtistsAvailableForDates(artistIds: number[], dates: string[], trx?: any): Promise<number> {
//   if (!artistIds?.length || !dates?.length)
//     return 0;
//   const client = trx ?? db;

//   const artistIdsSql = sql.join(artistIds.map(id => sql`${id}`), sql`, `);
//   const datesSql = sql.join(dates.map(d => sql`${d}`), sql`, `);

//   const res = await client.execute(sql`
//     UPDATE artists
//     SET available_dates = (
//       SELECT jsonb_agg(
//         CASE
//           WHEN (elem->>'date') = ANY(ARRAY[${datesSql}]::text[])
//             AND elem->>'status' = 'Unavailable'
//           THEN jsonb_set(elem, '{status}', '"Available"', true)
//           ELSE elem
//         END
//       )
//       FROM jsonb_array_elements(available_dates) AS elem
//     )
//     WHERE id = ANY(ARRAY[${artistIdsSql}]::int[])
//       AND EXISTS (
//         SELECT 1
//         FROM jsonb_array_elements(available_dates) AS e
//         WHERE (e->>'date') = ANY(ARRAY[${datesSql}]::text[]) AND e->>'status' = 'Unavailable'
//       )
//     RETURNING id
//   `);

//   return Array.isArray(res) ? res.length : 0;
// }

export async function setArtistsAvailabilityForDates(
  artistIds: number[],
  dates: string[] | string,
  status: "Available" | "Unavailable",
  trx?: any,
): Promise<number> {
  if (!artistIds?.length || !dates || !status)
    return 0;

  const client = trx ?? db;
  const datesArr = Array.isArray(dates) ? dates : [dates];

  const artistIdsSql = sql.join(artistIds.map(id => sql`${id}`), sql`, `);
  const datesSql = sql.join(datesArr.map(d => sql`${d}`), sql`, `);

  const res = await client.execute(sql`
    UPDATE artists
    SET available_dates = (
      SELECT jsonb_agg(
        CASE
          WHEN (elem->>'date') = ANY(ARRAY[${datesSql}]::text[])
          THEN jsonb_set(elem, '{status}', to_jsonb(${status}::text), true)
          ELSE elem
        END
      )
      FROM jsonb_array_elements(available_dates) AS elem
    )
    WHERE id = ANY(ARRAY[${artistIdsSql}]::int[])
      AND EXISTS (
        SELECT 1
        FROM jsonb_array_elements(available_dates) AS e
        WHERE (e->>'date') = ANY(ARRAY[${datesSql}]::text[])
      )
    RETURNING id
  `);

  return Array.isArray(res) ? res.length : 0;
}
