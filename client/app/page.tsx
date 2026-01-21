'use client';

import Link from 'next/link';
import UploadHeader from '@/components/upload/UploadHeader';
import FileDropzone from '@/components/upload/FileDropzone';
import FilePreview from '@/components/upload/FilePreview';
import UploadStatus from '@/components/upload/UploadStatus';
import UploadButton from '@/components/upload/UploadButton';
import InfoPanel from '@/components/upload/InfoPanel';
import { useFileUpload } from '@/hooks/useFileUpload';

export default function Home() {
  const {
    selectedFile,
    isDragging,
    isUploading,
    uploadStatus,
    fileInputRef,
    handleDrop,
    handleDragOver,
    handleDragLeave,
    handleFileInput,
    handleUpload,
    removeFile,
  } = useFileUpload();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black p-4">
      <main className="w-full max-w-2xl">
        <div className="mb-6 flex justify-end">
          <Link
            href="/processings"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View AI Analysis
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 md:p-12 border border-zinc-200 dark:border-zinc-800">
          <UploadHeader />

          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 ${isDragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
              : 'border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600'
              }`}
          >
            {!selectedFile ? (
              <FileDropzone
                isDragging={isDragging}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                fileInputRef={fileInputRef}
                onFileInputChange={handleFileInput}
              />
            ) : (
              <div className="space-y-4">
                <FilePreview
                  file={selectedFile}
                  onRemove={removeFile}
                  canRemove={!isUploading && uploadStatus !== 'success'}
                />

                {isUploading && (
                  <div className="p-6 bg-blue-50 dark:bg-blue-950/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Processing your session...</h3>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">This may take a few moments</p>
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'error' && <UploadStatus status={uploadStatus} />}

                {!isUploading && uploadStatus !== 'success' && (
                  <UploadButton onClick={handleUpload} />
                )}
              </div>
            )}
          </div>

          <InfoPanel />
        </div>
      </main>
    </div>
  );
}
