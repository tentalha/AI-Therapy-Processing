interface KeyTopicsProps {
    topics: string[];
}

export default function KeyTopics({ topics }: KeyTopicsProps) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Key Topics</h3>
                <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-full">AI</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {topics.map((topic, index) => (
                    <span
                        key={index}
                        className="px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium rounded-full"
                    >
                        {topic}
                    </span>
                ))}
            </div>
        </div>
    );
}
