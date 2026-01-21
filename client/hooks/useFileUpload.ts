import { validateFile } from '@/utils/fileUtils';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { sessionsService } from '@/services/sessions.service';

export type UploadStatus = 'idle' | 'success' | 'error';

export function useFileUpload() {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (file: File) => {
        if (!validateFile(file)) return;
        setSelectedFile(file);
        setUploadStatus('idle');
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setIsUploading(true);

        try {
            await sessionsService.uploadSession(selectedFile);
            setUploadStatus('success');
            // Navigate to processings page after successful upload
            router.push('/processings');
        } catch (error) {
            setUploadStatus('error');
            console.error('Upload failed:', error);
            setIsUploading(false);
        }
    };

    const removeFile = () => {
        setSelectedFile(null);
        setUploadStatus('idle');
    };

    return {
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
    };
}
