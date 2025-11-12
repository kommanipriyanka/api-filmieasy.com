-- 1. Merge duplicates – keep lowest id, deduplicate dates
WITH dupes AS (
  SELECT
    project_id,
    artist_id,
    array_agg(id ORDER BY id)          AS ids,
    jsonb_agg(dates)                  AS all_dates
  FROM artist_projects
  GROUP BY project_id, artist_id
  HAVING COUNT(*) > 1
),
merged AS (
  SELECT
    project_id,
    artist_id,
    ids[1] AS keep_id,
    COALESCE(
      (SELECT jsonb_agg(DISTINCT elem)
         FROM (SELECT jsonb_array_elements(dates) AS elem
               FROM artist_projects ap2
               WHERE ap2.project_id = d.project_id
                 AND ap2.artist_id = d.artist_id) sub),
      '[]'::jsonb
    ) AS merged_dates
  FROM dupes d
)
-- Update the row we keep
UPDATE artist_projects
SET    dates      = merged.merged_dates,
       updated_at = NOW()
FROM   merged
WHERE  artist_projects.id = merged.keep_id;

-- 2. Delete the extra rows
WITH dupes AS (
  SELECT UNNEST(ids[2:]) AS id_to_delete
  FROM (SELECT array_agg(id ORDER BY id) AS ids
        FROM artist_projects
        GROUP BY project_id, artist_id
        HAVING COUNT(*) > 1) sub
)
DELETE FROM artist_projects
WHERE id IN (SELECT id_to_delete FROM dupes);

-- 3. Add the UNIQUE index
CREATE UNIQUE INDEX "unique_project_artist"
ON "artist_projects" USING btree ("project_id","artist_id");