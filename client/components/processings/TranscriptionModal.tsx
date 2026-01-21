interface TranscriptionModalProps {
    transcription: string;
    fileName: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function TranscriptionModal({ transcription, fileName, isOpen, onClose }: TranscriptionModalProps) {
    if (!isOpen) return null;

    const handleDownload = () => {
        const blob = new Blob([transcription], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${fileName.replace(/\.[^/.]+$/, '')}-transcription.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose}>
            <div
                className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden border border-zinc-200 dark:border-zinc-800"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">AI-Labeled Transcription</h3>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-full">AI</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(80vh-10rem)]">
                    <div className="space-y-4">
                        {transcription.split('\n').map((line, index) => {
                            const isTherapist = line.startsWith('Therapist:');
                            const isClient = line.startsWith('Client:');

                            if (!line.trim()) return null;

                            return (
                                <div
                                    key={index}
                                    className={`p-4 rounded-lg ${isTherapist
                                        ? 'bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500'
                                        : isClient
                                            ? 'bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500'
                                            : 'bg-zinc-50 dark:bg-zinc-800/50'
                                        }`}
                                >
                                    {isTherapist || isClient ? (
                                        <>
                                            <span className={`font-semibold ${isTherapist ? 'text-blue-700 dark:text-blue-300' : 'text-purple-700 dark:text-purple-300'
                                                }`}>
                                                {line.split(':')[0]}:
                                            </span>
                                            <span className="text-zinc-700 dark:text-zinc-300 ml-2">
                                                {line.split(':').slice(1).join(':').trim()}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-zinc-700 dark:text-zinc-300">{line}</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-200 dark:border-zinc-800">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200"
                    >
                        Download Transcription
                    </button>
                </div>
            </div>
        </div>
    );
}
