interface SentimentBadgeProps {
    sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
}

export default function SentimentBadge({ sentiment }: SentimentBadgeProps) {
    const getSentimentColor = (sentiment: string) => {
        switch (sentiment) {
            case 'positive':
                return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
            case 'negative':
                return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
            case 'neutral':
                return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20';
            default:
                return 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800';
        }
    };

    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Sentiment Analysis</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-full">AI</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${getSentimentColor(sentiment)}`}>
                <span className="capitalize">{sentiment}</span>
            </div>
        </div>
    );
}
