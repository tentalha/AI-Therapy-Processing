interface UploadProgressProps {
    progress: number;
}

export default function UploadProgress({ progress }: UploadProgressProps) {
    return (
        <div className="space-y-2">
            <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-600 transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center">
                Uploading and processing with AI... {progress}%
            </p>
        </div>
    );
}
