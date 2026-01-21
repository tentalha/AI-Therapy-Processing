interface SessionSummaryProps {
    summary: string;
}

export default function SessionSummary({ summary }: SessionSummaryProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI-Generated Summary</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-full">AI</span>
            </div>
            <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                {summary}
            </p>
        </div>
    );
}
