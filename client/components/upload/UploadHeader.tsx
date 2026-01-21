export default function UploadHeader() {
    return (
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
            </div>
            <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                Upload Session Recording
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
                Upload audio recordings for <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">AI-powered analysis</span> and insights
            </p>
        </div>
    );
}
