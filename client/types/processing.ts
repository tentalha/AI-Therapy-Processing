export interface Processing {
    id: string;
    fileName: string;
    uploadDate: string;
    status: 'completed' | 'processing' | 'failed';
    duration: string;
    fileSize: number;
    progress?: number;
    error?: string;
    transcription?: string;
    audioUrl?: string;
    embedding?: number[];
    embeddingModel?: string;
    similarity?: number; // For search results
    processingResults?: {
        summary: string;
        keyTopics: string[];
        sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
        transcriptionAvailable: boolean;
    };
}

export interface SessionResponse {
    id: string;
    labelled_transcription: string;
    ai_summary: string;
    created_at: string;
    updated_at: string;
    file_link?: string;
    embedding?: number[] | string; // Can be string from PostgreSQL vector type
    embedding_model?: string;
    similarity?: number; // For search results
    metadata: {
        file_size?: number;
        sentiment?: string;
        key_topics?: string[];
        original_filename?: string;
        unique_filename?: string;
        duration?: number;
    };
}
