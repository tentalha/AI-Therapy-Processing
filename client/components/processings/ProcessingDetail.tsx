'use client';

import { Processing } from '@/types/processing';
import { useState } from 'react';
import TranscriptionModal from './TranscriptionModal';
import MetadataGrid from './MetadataGrid';
import StatusBanner from './StatusBanner';
import SessionSummary from './SessionSummary';
import KeyTopics from './KeyTopics';
import SentimentBadge from './SentimentBadge';
import ActionButtons from './ActionButtons';
import AudioPlayer from './AudioPlayer';
import EmbeddingsVisualization from './EmbeddingsVisualization';

interface ProcessingDetailProps {
    processing: Processing;
}

export default function ProcessingDetail({ processing }: ProcessingDetailProps) {
    const [showTranscriptionModal, setShowTranscriptionModal] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 space-y-6">
            {/* Header */}
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                            {processing.fileName}
                        </h2>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            Uploaded on {formatDate(processing.uploadDate)}
                        </p>
                    </div>

                    <button className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                </div>

                {/* Metadata Grid */}
                <MetadataGrid duration={processing.duration} fileSize={processing.fileSize} />
            </div>

            {/* Status Banner */}
            {(processing.status === 'processing' || processing.status === 'failed') && (
                <StatusBanner status={processing.status} progress={processing.progress} error={processing.error} />
            )}

            {/* Processing Results */}
            {processing.status === 'completed' && processing.processingResults && (
                <>
                    {processing.audioUrl && (
                        <AudioPlayer audioUrl={processing.audioUrl} fileName={processing.fileName} />
                    )}
                    {processing.processingResults.summary && (
                        <SessionSummary summary={processing.processingResults.summary} />
                    )}
                    {processing.embedding && (
                        <EmbeddingsVisualization
                            embedding={processing.embedding}
                            model={processing.embeddingModel}
                        />
                    )}
                    <ActionButtons
                        hasTranscription={processing.processingResults.transcriptionAvailable}
                        onViewTranscription={() => setShowTranscriptionModal(true)}
                        audioUrl={processing.audioUrl}
                        fileName={processing.fileName}
                    />
                </>
            )}

            {/* Transcription Modal */}
            {processing.transcription && (
                <TranscriptionModal
                    transcription={processing.transcription}
                    fileName={processing.fileName}
                    isOpen={showTranscriptionModal}
                    onClose={() => setShowTranscriptionModal(false)}
                />
            )}
        </div>
    );
}
