interface MetadataGridProps {
    duration: string;
    fileSize: number;
}

export default function MetadataGrid({ duration, fileSize }: MetadataGridProps) {
    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Duration</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{duration}</p>
            </div>
            <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">File Size</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{fileSize.toFixed(2)} MB</p>
            </div>
        </div>
    );
}
