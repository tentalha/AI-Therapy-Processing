interface StatusBannerProps {
    status: 'processing' | 'failed';
    progress?: number;
    error?: string;
}

export default function StatusBanner({ status, progress, error }: StatusBannerProps) {
    if (status === 'processing') {
        return (
            <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3 mb-3">
                    <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Processing in progress...</h3>
                </div>
                {progress !== undefined && (
                    <div className="space-y-2">
                        <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300">{progress}% complete</p>
                    </div>
                )}
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="p-6 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200 dark:border-red-800">
                <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div>
                        <h3 className="text-sm font-semibold text-red-900 dark:text-red-100 mb-1">Processing failed</h3>
                        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
