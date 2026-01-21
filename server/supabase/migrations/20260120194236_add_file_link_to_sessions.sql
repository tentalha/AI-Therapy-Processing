-- Add file_link column to sessions table
ALTER TABLE sessions ADD COLUMN file_link TEXT;

-- Create index on file_link for faster queries
CREATE INDEX idx_sessions_file_link ON sessions(file_link);
