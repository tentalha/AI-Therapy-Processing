-- Enable pgvector extension for vector embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding and embedding_model columns to sessions table
ALTER TABLE sessions ADD COLUMN embedding vector(1536);
ALTER TABLE sessions ADD COLUMN embedding_model TEXT;

-- Create index on embedding for faster similarity searches
CREATE INDEX idx_sessions_embedding ON sessions USING ivfflat (embedding vector_cosine_ops);
