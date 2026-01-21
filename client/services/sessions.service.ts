import axios from 'axios';
import { SessionResponse } from '@/types/processing';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

interface UploadResponse {
    message: string;
    file: {
        filename: string;
        path: string;
        originalName: string;
        mimetype: string;
        size: number;
        uploadedAt: string;
    };
    transcription: string;
}

interface SearchResponse {
    success: boolean;
    query: string;
    results: SessionResponse[];
    count: number;
}

export const sessionsService = {
    async getAllSessions() {
        const response = await axios.get<{ success: boolean; data: SessionResponse[]; count: number }>(
            `${API_BASE_URL}/session/`
        );
        return response.data;
    },

    async uploadSession(file: File) {
        const formData = new FormData();
        formData.append('recording', file);

        const response = await axios.post<UploadResponse>(
            `${API_BASE_URL}/session/upload`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    async semanticSearch(query: string) {
        const response = await axios.post<SearchResponse>(
            `${API_BASE_URL}/session/search`,
            { query, limit: 5 }
        );
        return response.data;
    },
};
