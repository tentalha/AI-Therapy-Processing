import OpenAI from 'openai';
import { Injectable } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { generateSummaryMessages, labelTranscriptionMessages } from '@/utils';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(private readonly configService: ConfigService) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateTranscription(fileBuffer: Buffer, filename: string): Promise<any> {
        // Convert Buffer to File using OpenAI's toFile helper
        const file = await OpenAI.toFile(fileBuffer, filename);

        const response = await this.openai.audio.transcriptions.create({
            file: file,
            model: this.configService.get<string>('TRANSCRIPTION_MODEL') || 'gpt-4o-transcribe-diarize',
            response_format: 'text',
            chunking_strategy: 'auto',
        });

        return response;
    }

    async generateSummary(transcription: string): Promise<{ summary: string; keyTopics: string[]; sentiment: string }> {
        const response = await this.openai.chat.completions.create({
            model: this.configService.get<string>('SUMMARY_MODEL') || 'gpt-3.5-turbo',
            messages: generateSummaryMessages(transcription),
            max_tokens: 500,
            temperature: 0.7,
            response_format: { type: "json_object" },
        });

        const content = response.choices[0].message.content;
        return JSON.parse(content as string);
    }

    async labelTranscription(transcription: string): Promise<string> {
        const response = await this.openai.chat.completions.create({
            model: this.configService.get<string>('SUMMARY_MODEL') || 'gpt-3.5-turbo',
            messages: labelTranscriptionMessages(transcription),
            temperature: 0.5,
        });

        return response.choices[0].message.content as any;
    }

    async generateEmbeddings(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: this.configService.get<string>('EMBEDDING_MODEL') || 'text-embedding-3-small',
            input: text,
        });

        return response.data[0].embedding;
    }
}