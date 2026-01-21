-- Update semantic search function with lower threshold for better recall
-- Lower threshold from 0.5 to 0.2 to capture more potentially relevant results
CREATE OR REPLACE FUNCTION match_sessions(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.2,
    match_count int DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    raw_transcription text,
    labelled_transcription text,
    ai_summary text,
    file_link text,
    embedding vector(1536),
    embedding_model text,
    metadata jsonb,
    created_at timestamptz,
    updated_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        sessions.id,
        sessions.raw_transcription,
        sessions.labelled_transcription,
        sessions.ai_summary,
        sessions.file_link,
        sessions.embedding,
        sessions.embedding_model,
        sessions.metadata,
        sessions.created_at,
        sessions.updated_at,
        1 - (sessions.embedding <=> query_embedding) AS similarity
    FROM sessions
    WHERE sessions.embedding IS NOT NULL
        AND 1 - (sessions.embedding <=> query_embedding) > match_threshold
    ORDER BY sessions.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION match_sessions IS 'Performs semantic search on sessions using cosine similarity (threshold: 0.2 for better recall)';
