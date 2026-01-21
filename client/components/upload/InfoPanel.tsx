export default function InfoPanel() {
    return (
        <div className="mt-8 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                AI Processing Information
            </h3>
            <ul className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <li>• Audio files are transcribed and analyzed using advanced AI</li>
                <li>• AI generates summaries, key topics, and sentiment analysis</li>
                <li>• Vector embeddings enable semantic search and similarity analysis</li>
                <li>• All data is encrypted and HIPAA compliant</li>
                <li>• Maximum file size: 50MB</li>
            </ul>
        </div>
    );
}
