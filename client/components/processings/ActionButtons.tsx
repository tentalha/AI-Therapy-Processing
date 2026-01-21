interface ActionButtonsProps {
    hasTranscription: boolean;
    onViewTranscription: () => void;
    audioUrl?: string;
    fileName?: string;
}

export default function ActionButtons({ hasTranscription, onViewTranscription, audioUrl, fileName }: ActionButtonsProps) {
    const handleDownload = async () => {
        if (!audioUrl) return;

        try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName || 'audio-recording.mp3';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
        }
    };

    return (
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-wrap gap-3">
                {audioUrl && (
                    <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:opacity-90 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download Audio
                    </button>
                )}
                {hasTranscription && (
                    <button
                        onClick={onViewTranscription}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Transcription
                    </button>
                )}
            </div>
        </div>
    );
}
