const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB in bytes

export const validateFile = (file: File): boolean => {
    const validTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/ogg'];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|ogg)$/i)) {
        alert('Please upload a valid audio file (MP3, WAV, M4A, or OGG)');
        return false;
    }

    if (file.size > MAX_FILE_SIZE) {
        alert(`File size exceeds the maximum limit of 50MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
        return false;
    }

    return true;
};