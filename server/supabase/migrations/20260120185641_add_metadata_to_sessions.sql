-- Add metadata field as JSONB to sessions table
ALTER TABLE sessions ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Create index on metadata for faster queries
CREATE INDEX idx_sessions_metadata ON sessions USING GIN (metadata);
