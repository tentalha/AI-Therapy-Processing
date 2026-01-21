# Scaling & Enhancement Guide

As your therapy session analysis platform grows, you'll need to think about scalability, performance, and cost optimization. This guide walks through practical strategies to handle more users, process uploads faster, and keep your API bills under control.

## Table of Contents
1. [Intelligent Conversation Detection](#1-intelligent-conversation-detection)
2. [Background Job Processing](#2-background-job-processing)
3. [Audio Quality Assessment](#3-audio-quality-assessment)
4. [Multi-Tenant Authentication](#4-multi-tenant-authentication)
5. [Additional Scaling Considerations](#5-additional-scaling-considerations)

---

## 1. Intelligent Conversation Detection

### The Problem
Right now, every audio file you upload gets the full treatment - transcription, analysis, embeddings, the works. That's great for therapy sessions, but what if someone accidentally uploads a team meeting or a personal voice note? You're paying for AI processing that doesn't need to happen.

### Solution: Smart Classification Before Processing
The idea is simple: analyze a quick sample of the audio first (say, the first 60 seconds) and use AI to determine if it's actually a therapy session. If it's not, skip the expensive processing.

#### Architecture Overview
```
Audio Upload
    ↓
[Quick Sample Transcription] (first 30-60 seconds)
    ↓
[AI Orchestrator - Classification]
    ↓
    ├─→ Therapy Session (High Confidence) → Full Processing
    ├─→ Likely Therapy (Medium Confidence) → Ask User Confirmation
    └─→ Not Therapy (Low Confidence) → Skip/Store Only
```

#### Implementation Details

**Step 1: Sample Extraction**
```typescript
// server/src/utils/audio.utils.ts
export async function extractAudioSample(
  buffer: Buffer, 
  durationSeconds: number = 60
): Promise<Buffer> {
  // Use ffmpeg to extract first 60 seconds
  // Reduces processing time and cost
  const ffmpeg = require('fluent-ffmpeg');
  
  return new Promise((resolve, reject) => {
    ffmpeg(buffer)
      .setStartTime(0)
      .setDuration(durationSeconds)
      .toFormat('mp3')
      .on('end', resolve)
      .on('error', reject);
  });
}
```

**Step 2: Classification Model**
```typescript
// server/src/modules/ai/ai.service.ts
async classifyConversation(sampleTranscription: string): Promise<{
  isTherapySession: boolean;
  confidence: number;
  reasoning: string;
}> {
  const prompt = `Analyze this conversation transcript and determine if it's a therapy or counseling session.

Indicators of therapy sessions:
- Professional therapeutic language
- Client sharing personal concerns
- Therapist asking reflective questions
- Discussion of mental health, emotions, or personal challenges
- Structured session format

Transcript:
${sampleTranscription}

Respond with JSON:
{
  "isTherapySession": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`;

  const response = await this.openai.chat.completions.create({
    model: 'gpt-4o-mini', // Fast and cost-effective
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content);
}
```

**Step 3: Updated Controller Flow**
```typescript
// server/src/modules/session/session.controller.ts
async uploadRecording(@UploadedFile() file: Express.Multer.File) {
  // 1. Extract sample (first 60 seconds)
  const sample = await extractAudioSample(file.buffer, 60);
  
  // 2. Quick transcription of sample
  const sampleTranscription = await this.aiService.generateTranscription(
    sample, 
    'sample.mp3'
  );
  
  // 3. Classify conversation type
  const classification = await this.aiService.classifyConversation(
    sampleTranscription
  );
  
  // 4. Decide on processing
  if (classification.confidence < 0.5) {
    // Low confidence - ask user
    return {
      needsConfirmation: true,
      classification,
      message: 'We are not sure if this is a therapy session. Proceed with analysis?'
    };
  }
  
  if (!classification.isTherapySession && classification.confidence > 0.7) {
    // High confidence it's NOT therapy - save file but skip analysis
    const { publicUrl } = await this.sessionService.saveRecordingSupabase(file);
    return {
      message: 'File saved but skipped analysis (not a therapy session)',
      fileUrl: publicUrl,
      classification
    };
  }
  
  // Proceed with full analysis
  return await this.processFullSession(file);
}
```

### What This Saves You
Let's talk numbers. Transcribing a sample costs about $0.01, while full processing runs $0.15-0.30 per file. If even half your uploads aren't therapy sessions, you're looking at 60-80% savings on those files. That adds up fast.

### Things to Keep in Mind
You'll want to give users an override button in case the AI gets it wrong. Also, make sure to log misclassifications so you can tune the model over time. Caching classification results for similar content patterns can help too.

---

## 2. Background Job Processing

### Why This Matters
Currently, when someone uploads a file, they sit there waiting for 2-5 minutes while everything processes. That's a terrible user experience. Plus, if multiple people try to upload at once, they're basically standing in line. Large files might even time out your server.

### The Fix: Job Queues
Instead of making users wait, accept the upload, store it quickly, and return a confirmation immediately. Then process everything in the background using a job queue system like BullMQ with Redis.

#### Architecture Overview
```
User Upload
    ↓
[Quick File Validation & Storage]
    ↓
Return Immediately with Job ID
    |
    └─→ [Background Queue] (BullMQ/Redis)
            ↓
        [Worker Processes]
            ├─→ Transcription Worker
            ├─→ Analysis Worker
            └─→ Vectorization Worker
                ↓
            Update Database
                ↓
            Notify User (WebSocket/Email)
```

#### Implementation with BullMQ

**Step 1: Install Dependencies**
```bash
cd server
pnpm add bullmq ioredis
pnpm add -D @types/ioredis
```

**Step 2: Job Queue Setup**
```typescript
// server/src/modules/queue/queue.module.ts
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    BullModule.registerQueue(
      { name: 'session-processing' },
      { name: 'vectorization' },
    ),
  ],
})
export class QueueModule {}
```

**Step 3: Session Processing Queue**
```typescript
// server/src/modules/session/session.processor.ts
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('session-processing')
export class SessionProcessor extends WorkerHost {
  constructor(
    private aiService: AiService,
    private sessionService: SessionService,
  ) {
    super();
  }

  async process(job: Job<{
    sessionId: string;
    fileBuffer: Buffer;
    fileName: string;
    fileUrl: string;
  }>): Promise<void> {
    const { sessionId, fileBuffer, fileName, fileUrl } = job.data;

    try {
      // Update status to processing
      await job.updateProgress(10);
      await this.sessionService.updateStatus(sessionId, 'processing');

      // Step 1: Transcription (40% of job)
      await job.updateProgress(20);
      const transcription = await this.aiService.generateTranscription(
        fileBuffer, 
        fileName
      );
      await job.updateProgress(40);

      // Step 2: Speaker Labeling
      const labeledTranscription = await this.aiService.labelTranscription(
        transcription
      );
      await job.updateProgress(60);

      // Step 3: AI Analysis
      const { summary, keyTopics, sentiment } = await this.aiService.generateSummary(
        labeledTranscription
      );
      await job.updateProgress(80);

      // Step 4: Generate Embeddings (queue separate job)
      await this.queueVectorization(sessionId, summary);
      await job.updateProgress(90);

      // Step 5: Update database
      await this.sessionService.updateSessionAnalysis(sessionId, {
        raw_transcription: transcription,
        labelled_transcription: labeledTranscription,
        ai_summary: summary,
        metadata: { key_topics: keyTopics, sentiment }
      });

      await job.updateProgress(100);
      await this.sessionService.updateStatus(sessionId, 'completed');

      // Notify user (WebSocket/Email)
      await this.notifyUser(sessionId, 'completed');

    } catch (error) {
      await this.sessionService.updateStatus(sessionId, 'failed');
      await this.notifyUser(sessionId, 'failed', error.message);
      throw error;
    }
  }
}
```

**Step 4: Vectorization Queue**
```typescript
// server/src/modules/session/vectorization.processor.ts
@Processor('vectorization')
export class VectorizationProcessor extends WorkerHost {
  async process(job: Job<{ sessionId: string; text: string }>): Promise<void> {
    const { sessionId, text } = job.data;
    
    const embedding = await this.aiService.generateEmbeddings(text);
    
    await this.sessionService.updateEmbedding(sessionId, {
      embedding,
      embedding_model: process.env.EMBEDDING_MODEL,
    });
  }
}
```

**Step 5: Updated Controller**
```typescript
// server/src/modules/session/session.controller.ts
@Post('upload')
async uploadRecording(@UploadedFile() file: Express.Multer.File) {
  // 1. Quick validation
  if (file.size > 50 * 1024 * 1024) {
    throw new BadRequestException('File too large');
  }

  // 2. Generate session record
  const session = await this.sessionService.createSessionRecord({
    status: 'queued',
    metadata: { file_size: file.size }
  });

  // 3. Upload to storage (fast)
  const { publicUrl, uniqueFileName } = await this.sessionService
    .saveRecordingSupabase(file);

  await this.sessionService.updateSessionUrl(session.id, publicUrl);

  // 4. Queue processing job
  await this.sessionQueue.add('process-session', {
    sessionId: session.id,
    fileBuffer: file.buffer,
    fileName: uniqueFileName,
    fileUrl: publicUrl,
  }, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: true,
  });

  // 5. Return immediately
  return {
    message: 'Session queued for processing',
    sessionId: session.id,
    status: 'queued',
    estimatedTime: '2-5 minutes'
  };
}
```

**Step 6: Status Endpoint**
```typescript
@Get(':id/status')
async getSessionStatus(@Param('id') sessionId: string) {
  const session = await this.sessionService.getSession(sessionId);
  const job = await this.sessionQueue.getJob(sessionId);
  
  return {
    sessionId,
    status: session.status,
    progress: job ? await job.progress() : 100,
    result: session.status === 'completed' ? session : null
  };
}
```

### What You Get
Users get instant feedback instead of staring at a loading spinner. Your system can handle 100+ uploads at the same time without breaking a sweat. If something fails, jobs automatically retry. You can track progress and see what's happening at any time. And your servers use resources way more efficiently.

### What You'll Need
You'll need a Redis server (Redis Cloud works great if you don't want to manage it yourself), multiple worker processes to handle the load, and ideally a WebSocket setup for real-time progress updates.

---

## 3. Audio Quality Assessment

### The Challenge
Ever tried to transcribe audio that was recorded on a bad microphone in a noisy coffee shop? The results are usually garbage, but you've already paid for the API call. Users get frustrated with poor results, and you've wasted money on processing unusable audio.

### Better Quality Checks
Before spending money on transcription, check the audio quality. Look at things like signal-to-noise ratio, bit rate, sample rate, and whether the audio is clipping. If quality is too low, warn the user and give them a chance to re-record with better settings.

#### Quality Metrics to Check
1. **Signal-to-Noise Ratio (SNR)**
2. **Audio Clarity/Distortion**
3. **Sample Rate & Bit Rate**
4. **Dynamic Range**
5. **Clipping Detection**

#### Implementation

**Step 1: Install Audio Analysis Library**
```bash
cd server
pnpm add node-audio-analyzer audiowaveform
```

**Step 2: Quality Assessment Service**
```typescript
// server/src/modules/audio/audio-quality.service.ts
import { Injectable } from '@nestjs/common';
import * as ffmpeg from 'fluent-ffmpeg';

interface AudioQualityReport {
  isAcceptable: boolean;
  score: number; // 0-100
  issues: string[];
  recommendations: string[];
  metrics: {
    sampleRate: number;
    bitRate: number;
    duration: number;
    signalToNoiseRatio: number;
    hasClipping: boolean;
    channelCount: number;
  };
}

@Injectable()
export class AudioQualityService {
  async assessQuality(audioBuffer: Buffer): Promise<AudioQualityReport> {
    const metrics = await this.extractMetrics(audioBuffer);
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check sample rate (should be >= 16kHz for good transcription)
    if (metrics.sampleRate < 16000) {
      score -= 30;
      issues.push('Low sample rate detected');
      recommendations.push('Re-record with at least 16kHz sample rate');
    }

    // Check bit rate (should be >= 64kbps)
    if (metrics.bitRate < 64000) {
      score -= 20;
      issues.push('Low bit rate may affect quality');
      recommendations.push('Use higher bit rate (128kbps+ recommended)');
    }

    // Check SNR (should be > 20dB)
    if (metrics.signalToNoiseRatio < 20) {
      score -= 25;
      issues.push('High background noise detected');
      recommendations.push('Record in a quieter environment');
    }

    // Check for clipping
    if (metrics.hasClipping) {
      score -= 15;
      issues.push('Audio clipping detected');
      recommendations.push('Reduce microphone gain/volume');
    }

    // Check duration (should be > 1 minute)
    if (metrics.duration < 60) {
      score -= 10;
      issues.push('Very short recording');
      recommendations.push('Ensure recording captures full session');
    }

    return {
      isAcceptable: score >= 60,
      score: Math.max(0, score),
      issues,
      recommendations,
      metrics
    };
  }

  private async extractMetrics(audioBuffer: Buffer) {
    return new Promise((resolve, reject) => {
      ffmpeg(audioBuffer)
        .ffprobe((err, metadata) => {
          if (err) return reject(err);

          const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
          
          resolve({
            sampleRate: parseInt(audioStream.sample_rate),
            bitRate: parseInt(audioStream.bit_rate || metadata.format.bit_rate),
            duration: parseFloat(metadata.format.duration),
            channelCount: audioStream.channels,
            // Note: SNR and clipping require additional processing
            signalToNoiseRatio: await this.calculateSNR(audioBuffer),
            hasClipping: await this.detectClipping(audioBuffer),
          });
        });
    });
  }

  private async calculateSNR(buffer: Buffer): Promise<number> {
    // Implement SNR calculation using audio analysis
    // This is a simplified version
    const audioData = await this.getAudioSamples(buffer);
    
    // Calculate RMS of signal
    const rms = Math.sqrt(
      audioData.reduce((sum, sample) => sum + sample * sample, 0) / audioData.length
    );
    
    // Estimate noise floor (bottom 10% of samples)
    const sorted = [...audioData].sort((a, b) => Math.abs(a) - Math.abs(b));
    const noiseFloor = sorted.slice(0, Math.floor(sorted.length * 0.1));
    const noiseRms = Math.sqrt(
      noiseFloor.reduce((sum, sample) => sum + sample * sample, 0) / noiseFloor.length
    );
    
    // SNR in dB
    return 20 * Math.log10(rms / noiseRms);
  }

  private async detectClipping(buffer: Buffer): Promise<boolean> {
    const audioData = await this.getAudioSamples(buffer);
    const threshold = 0.99; // 99% of max amplitude
    const clippedSamples = audioData.filter(s => Math.abs(s) > threshold).length;
    
    // If more than 1% of samples are clipped, mark as problematic
    return (clippedSamples / audioData.length) > 0.01;
  }

  private async getAudioSamples(buffer: Buffer): Promise<number[]> {
    // Extract raw audio samples from buffer
    // Implementation depends on audio format
    // Use libraries like node-wav or audio-buffer-utils
    return []; // Simplified
  }
}
```

**Step 3: Integration in Upload Flow**
```typescript
// server/src/modules/session/session.controller.ts
async uploadRecording(@UploadedFile() file: Express.Multer.File) {
  // Assess audio quality
  const qualityReport = await this.audioQualityService.assessQuality(file.buffer);
  
  if (!qualityReport.isAcceptable) {
    return {
      success: false,
      qualityReport,
      message: 'Audio quality is below acceptable threshold',
      allowOverride: true, // Let user decide to proceed anyway
    };
  }
  
  if (qualityReport.score < 80) {
    // Warn but allow processing
    // Store warning in metadata
  }
  
  // Continue with processing...
}
```

**Step 4: Client-Side UI**
```typescript
// client/components/upload/QualityWarning.tsx
export function QualityWarning({ report, onProceed, onCancel }) {
  return (
    <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-500 rounded-xl p-6">
      <div className="flex items-start gap-4">
        <div className="text-amber-600 dark:text-amber-400">
          <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
            Audio Quality Issues Detected (Score: {report.score}/100)
          </h3>
          
          {report.issues.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Issues Found:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300">
                {report.issues.map((issue, i) => (
                  <li key={i}>{issue}</li>
                ))}
              </ul>
            </div>
          )}
          
          {report.recommendations.length > 0 && (
            <div className="mb-4">
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                Recommendations:
              </p>
              <ul className="list-disc list-inside text-sm text-amber-700 dark:text-amber-300">
                {report.recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-4">
            Processing this audio may result in poor transcription quality. 
            We recommend re-recording with better quality settings.
          </p>
          
          <div className="flex gap-3">
            <button onClick={onCancel} className="px-4 py-2 bg-white dark:bg-zinc-800 border-2 border-amber-500 text-amber-700 dark:text-amber-300 rounded-lg hover:bg-amber-50">
              Cancel & Re-upload
            </button>
            <button onClick={onProceed} className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
              Proceed Anyway
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Why Bother?
You save money by not processing files that won't transcribe well anyway. Users get better results because they're only submitting quality audio. They learn how to record properly, which helps everyone. And you'll spend way less time on support tickets about "why was my transcription so bad?"

---

## 4. Multi-Tenant Authentication

### The Reality Check
Right now, anyone can access any session. There's no login, no data isolation, nothing. That's fine for a demo, but completely unacceptable for production use with real patient data. You need proper authentication and multi-tenancy.

### Building Proper Security
Implement user authentication so each therapist or clinic has their own account. Use row-level security in your database to ensure organizations can only see their own data. Set up role-based access control so admins, therapists, and viewers have appropriate permissions.

#### Architecture Overview
```
User Login
    ↓
[Auth Service] (Supabase Auth/Auth0/Custom)
    ↓
JWT Token Issued
    ↓
[Request with Token]
    ↓
[Auth Middleware] - Validates & Extracts User
    ↓
[Role-Based Access Control]
    ↓
[Row-Level Security] - Data Isolation
```

#### Implementation with Supabase Auth

**Step 1: Enable Supabase Auth**
```sql
-- server/supabase/migrations/20260122000000_add_auth_and_tenants.sql

-- Create organizations/clinics table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    settings JSONB DEFAULT '{}'::jsonb
);

-- Create user profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    full_name TEXT,
    role TEXT CHECK (role IN ('admin', 'therapist', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add organization_id to sessions table
ALTER TABLE sessions ADD COLUMN organization_id UUID REFERENCES organizations(id);
ALTER TABLE sessions ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Create indexes
CREATE INDEX idx_sessions_organization ON sessions(organization_id);
CREATE INDEX idx_sessions_created_by ON sessions(created_by);
CREATE INDEX idx_user_profiles_org ON user_profiles(organization_id);

-- Enable Row Level Security (RLS)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sessions
CREATE POLICY "Users can view sessions from their organization"
    ON sessions FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Therapists can insert sessions"
    ON sessions FOR INSERT
    WITH CHECK (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid() 
            AND role IN ('therapist', 'admin')
        )
    );

CREATE POLICY "Users can update their own sessions"
    ON sessions FOR UPDATE
    USING (created_by = auth.uid());

-- RLS Policies for organizations
CREATE POLICY "Users can view their organization"
    ON organizations FOR SELECT
    USING (
        id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- RLS Policies for user profiles
CREATE POLICY "Users can view profiles in their organization"
    ON user_profiles FOR SELECT
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );
```

**Step 2: Auth Guard in NestJS**
```typescript
// server/src/guards/auth.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

@Injectable()
export class AuthGuard implements CanActivate {
  private supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
  );

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      return false;
    }

    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);
      
      if (error || !user) {
        return false;
      }

      // Fetch user profile with organization
      const { data: profile } = await this.supabase
        .from('user_profiles')
        .select('*, organization:organizations(*)')
        .eq('id', user.id)
        .single();

      request.user = {
        id: user.id,
        email: user.email,
        profile,
        organizationId: profile?.organization_id,
        role: profile?.role,
      };

      return true;
    } catch {
      return false;
    }
  }

  private extractToken(request: any): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) return null;
    return authHeader.replace('Bearer ', '');
  }
}
```

**Step 3: Role-Based Guards**
```typescript
// server/src/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user?.role);
  }
}

// Decorator
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
```

**Step 4: Protected Controller**
```typescript
// server/src/modules/session/session.controller.ts
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/guards/auth.guard';
import { RolesGuard, Roles } from '@/guards/roles.guard';
import { User } from '@/decorators/user.decorator';

@Controller('session')
@UseGuards(AuthGuard, RolesGuard)
export class SessionController {
  
  @Post('upload')
  @Roles('therapist', 'admin')
  async uploadRecording(
    @UploadedFile() file: Express.Multer.File,
    @User() user: any
  ) {
    // User is authenticated and authorized
    // Add organization_id and created_by to session
    const session = await this.sessionService.createSessionRecord({
      organization_id: user.organizationId,
      created_by: user.id,
      metadata: { file_size: file.size }
    });
    
    // Process as before...
  }

  @Get()
  async getAllSessions(@User() user: any) {
    // RLS automatically filters by organization
    // No need to add WHERE clause
    const sessions = await this.sessionService.getAllSessions();
    return { success: true, data: sessions };
  }

  @Post('search')
  async semanticSearch(
    @Body() body: { query: string },
    @User() user: any
  ) {
    // Search only within user's organization
    const results = await this.sessionService.semanticSearch(
      body.query,
      user.organizationId
    );
    return { success: true, results };
  }
}
```

**Step 5: Client-Side Auth**
```typescript
// client/lib/auth.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signUp(email: string, password: string, organizationName: string) {
  // 1. Create user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) return { error: authError };
  
  // 2. Create organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({ name: organizationName })
    .select()
    .single();
  
  if (orgError) return { error: orgError };
  
  // 3. Create user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authData.user.id,
      organization_id: org.id,
      role: 'admin',
    });
  
  return { data: authData, error: profileError };
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signOut() {
  await supabase.auth.signOut();
}
```

**Step 6: Protected API Client**
```typescript
// client/services/sessions.service.ts
import axios from 'axios';
import { getSession } from '@/lib/auth';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const sessionsService = {
  async getAllSessions() {
    const response = await api.get('/session/');
    return response.data;
  },
  // ... other methods
};
```

### What This Gets You
Complete data isolation means Clinic A never sees Clinic B's patients. You can support thousands of organizations on the same platform. This is also essential for HIPAA and GDPR compliance - no way around it. Role-based permissions let you control who can do what. And you have a full audit trail of who accessed which sessions.

### Features Worth Adding
Once you have auth working, build an admin dashboard for each organization, add user invitation flows, track usage per org (important for billing), integrate payment processing, and let organizations customize their settings and branding.

---

## 5. Additional Scaling Considerations

### Database Optimization
```sql
-- Add more indexes for common queries
CREATE INDEX idx_sessions_created_at_org ON sessions(organization_id, created_at DESC);
CREATE INDEX idx_sessions_sentiment ON sessions((metadata->>'sentiment'));

-- Partition large tables by date
CREATE TABLE sessions_2026_01 PARTITION OF sessions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
```

### Caching Strategy
```typescript
// Add Redis caching for frequently accessed data
import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

async function getCachedSession(id: string) {
  const cached = await redis.get(`session:${id}`);
  if (cached) return JSON.parse(cached);
  
  const session = await db.getSession(id);
  await redis.setex(`session:${id}`, 3600, JSON.stringify(session));
  return session;
}
```

### CDN for Audio Files
- Move Supabase storage behind CloudFront/Cloudflare
- Enable browser caching
- Use signed URLs for security

### Monitoring & Observability
```typescript
// Add application monitoring
import * as Sentry from '@sentry/node';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

// Track key metrics
- API response times
- Job processing duration
- AI API usage and costs
- Error rates
- User activity
```

### Cost Optimization
```typescript
// Implement usage-based pricing
interface UsageLimits {
  monthlyMinutes: number;
  storageGB: number;
  searches: number;
}

async function checkUsageLimits(organizationId: string) {
  const usage = await getMonthlyUsage(organizationId);
  const limits = await getLimits(organizationId);
  
  if (usage.minutes >= limits.monthlyMinutes) {
    throw new Error('Monthly minute limit reached');
  }
}
```

### Auto-scaling Configuration
```yaml
# Example Kubernetes deployment
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: session-api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: session-api
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

---

## Implementation Priority

### Phase 1 (Do This First)
1. Multi-tenant authentication
2. Row-level security
3. Background job processing

### Phase 2 (High Impact)
4. Audio quality assessment
5. Conversation classification
6. Caching layer

### Phase 3 (Optimization)
7. Database partitioning
8. CDN integration
9. Advanced monitoring

### Phase 4 (Nice to Have)
10. Usage analytics
11. Billing integration
12. Advanced search filters

---

## Estimated Costs After Scaling

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| OpenAI API (per 100 uploads) | $30 | $12 | 60% |
| Infrastructure | $50/mo | $150/mo | -200% |
| Support Time | 10h/mo | 2h/mo | 80% |
| **Net Change** | $80/mo | $162/mo | **-102%** |

**The Reality**: Yes, infrastructure costs go up initially. But you get 10x the user capacity, professional SaaS features that let you charge real money, way less time spent on support, and the ability to actually turn this into a business.

---

## Getting Started

1. Set up your development environment with Redis and worker processes
2. Start with Phase 1 - get auth and background jobs working
3. Test it properly with at least 100 concurrent uploads to find the breaking points
4. Watch your metrics closely and optimize where it hurts
5. Roll changes out gradually to production users

If you need more details on any of this, check the main README.md and API_DOCS.md files.
