import { Controller, Get, Post, Body, UploadedFile, UseInterceptors, BadRequestException } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { SessionService } from "./session.service";
import { UploadRecordingResponseDto } from "@/dto";
import { AiService } from "@/modules/ai";
import { ConfigService } from "@nestjs/config";
import { extractAudioDuration } from "@/utils";

@Controller('session')
export class SessionController {
    constructor(private readonly sessionService: SessionService, private readonly aiService: AiService, private readonly configService: ConfigService) { }

    @Get()
    async getAllSessions() {
        const sessions = await this.sessionService.getAllSessions();
        return {
            success: true,
            data: sessions,
            count: sessions.length,
        };
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('recording', {
        limits: {
            fileSize: 50 * 1024 * 1024, // 50MB
        },
    }))
    async uploadRecording(@UploadedFile() file: Express.Multer.File): Promise<UploadRecordingResponseDto> {

        if (!file)
            throw new BadRequestException('No file uploaded');

        if (file.size > 50 * 1024 * 1024)
            throw new BadRequestException('File size exceeds the maximum limit of 50MB');

        const { publicUrl, uniqueFileName } = await this.sessionService.saveRecordingSupabase(file);

        // Extract audio duration
        const durationInSeconds = await extractAudioDuration(file.buffer, file.mimetype);

        const transcription = await this.aiService.generateTranscription(file.buffer, file.originalname);
        const labeledTranscription = await this.aiService.labelTranscription(transcription);
        const { summary, keyTopics, sentiment } = await this.aiService.generateSummary(labeledTranscription);
        const vectors = await this.aiService.generateEmbeddings(summary);

        await this.sessionService.createSessionRecord({
            raw_transcription: transcription,
            labelled_transcription: labeledTranscription,
            ai_summary: summary,
            file_link: publicUrl,
            embedding: vectors,
            embedding_model: this.configService.get<string>('EMBEDDING_MODEL') || 'text-embedding-3-small',
            metadata: {
                key_topics: keyTopics,
                sentiment: sentiment,
                file_size: file.size,
                original_filename: file.originalname,
                unique_filename: uniqueFileName,
                duration: durationInSeconds
            }
        });

        return {
            message: 'Session recording uploaded successfully',
            transcription: labeledTranscription,
        };
    }

    @Post('search')
    async semanticSearch(@Body() body: { query: string; limit?: number }) {
        const { query, limit = 10 } = body;

        if (!query || query.trim().length === 0)
            throw new BadRequestException('Search query is required');

        // Generate embeddings for the search query
        const queryEmbedding = await this.aiService.generateEmbeddings(query);

        // Perform semantic search using vector similarity
        const results = await this.sessionService.semanticSearch(queryEmbedding, limit);

        return {
            success: true,
            query,
            results,
            count: results.length,
        };
    }
}