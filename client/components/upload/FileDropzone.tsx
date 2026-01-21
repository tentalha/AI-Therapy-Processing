import { RefObject } from 'react';

interface FileDropzoneProps {
    isDragging: boolean;
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    fileInputRef: RefObject<HTMLInputElement | null>;
    onFileInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FileDropzone({
    isDragging,
    onDrop,
    onDragOver,
    onDragLeave,
    fileInputRef,
    onFileInputChange,
}: FileDropzoneProps) {
    return (
        <div className="text-center">
            <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,.mp3,.wav,.m4a,.ogg"
                onChange={onFileInputChange}
                className="hidden"
            />
            <svg className="mx-auto h-12 w-12 text-zinc-400 dark:text-zinc-600 mb-4" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                Drop your audio file here
            </p>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                or click to browse
            </p>
            <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
                Select File
            </button>
            <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-4">
                Supported formats: MP3, WAV, M4A, OGG
            </p>
        </div>
    );
}
