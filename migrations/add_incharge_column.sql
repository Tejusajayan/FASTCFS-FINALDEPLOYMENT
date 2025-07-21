-- Add a default value for the `incharge` column to avoid data loss
ALTER TABLE branches
ADD COLUMN incharge TEXT DEFAULT 'Unknown' NOT NULL;

-- If you still want to delete the `session` table, ensure it's no longer needed
-- DROP TABLE session;
