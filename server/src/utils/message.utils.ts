import { LABEL_AND_NORMALIZE_PROMPT, SUMMARY_PROMPT } from '@/constants';
import { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

export const generateSummaryMessages = (transcription: string): ChatCompletionMessageParam[] => {
    return [
        {
            role: "system",
            content: SUMMARY_PROMPT
        },
        {
            role: "user",
            content: `Please provide a concise summary of the following therapy session transcription:\n\n${transcription}`
        }
    ];
};

export const labelTranscriptionMessages = (transcription: string): ChatCompletionMessageParam[] => {
    return [
        {
            role: "system",
            content: LABEL_AND_NORMALIZE_PROMPT
        },
        {
            role: "user",
            content: `Please clean, normalize, and label the following therapy session transcription:\n\n${transcription}`
        }
    ];
};