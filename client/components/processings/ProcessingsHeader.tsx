export default function ProcessingsHeader() {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-4 mb-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        AI Session Analysis
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400">
                        View AI-generated insights and analysis for your therapy sessions
                    </p>
                </div>
            </div>
        </div>
    );
}
