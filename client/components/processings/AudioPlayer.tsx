'use client';

import AudioPlayerComponent from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

interface AudioPlayerProps {
    audioUrl: string;
    fileName: string;
}

export default function AudioPlayer({ audioUrl, fileName }: AudioPlayerProps) {
    return (
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 p-6 rounded-xl border border-purple-100 dark:border-gray-700">

            <div className="space-y-2">
                <AudioPlayerComponent
                    src={audioUrl}
                    showJumpControls={false}
                    customAdditionalControls={[]}
                    className="rounded-lg"
                />

                <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="truncate">{fileName}</p>
                </div>
            </div>
        </div>
    );
}
