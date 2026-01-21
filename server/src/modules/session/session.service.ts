import { TABLES } from "@/constants";
import { Inject, Injectable } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { promises as fs } from 'fs';
import { join } from 'path';

@Injectable()
export class SessionService {

    constructor(@Inject('SUPABASE_CLIENT') private readonly supabase: SupabaseClient) { }

    async saveRecordingSupabase(file: Express.Multer.File) {
        // Generate unique filename with timestamp
        const timestamp = Date.now();
        const extension = file.originalname.split('.').pop();
        const baseName = file.originalname.replace(/\.[^/.]+$/, ''); // Remove extension
        const uniqueFileName = `${baseName}_${timestamp}.${extension}`;

        const { data, error } = await this.supabase
            .storage
            .from('audio-files')
            .upload(`public/${uniqueFileName}`, file.buffer, {
                contentType: file.mimetype,
            });

        if (error)
            throw new Error(`Failed to upload file to Supabase Storage: ${error.message}`);

        const publicUrl = this.supabase
            .storage
            .from('audio-files')
            .getPublicUrl(data.path).data.publicUrl;

        return { publicUrl, uniqueFileName };
    }

    async createSessionRecord(data: any) {
        const { data: session, error } = await this.supabase
            .from(TABLES.SESSIONS)
            .insert([data])
            .select()
            .single();

        if (error)
            throw new Error(`Failed to create session record: ${error.message}`);

        return session;
    }

    async getAllSessions() {
        const { data: sessions, error } = await this.supabase
            .from(TABLES.SESSIONS)
            .select('*')
            .order('created_at', { ascending: false });

        if (error)
            throw new Error(`Failed to fetch sessions: ${error.message}`);

        return sessions;
    }

    async semanticSearch(queryEmbedding: number[], limit: number = 10) {
        // Use pgvector's cosine similarity search
        const { data, error } = await this.supabase.rpc('match_sessions', {
            query_embedding: queryEmbedding,
            match_threshold: 0.4,
            match_count: limit
        });
        return data || [];
    }
}