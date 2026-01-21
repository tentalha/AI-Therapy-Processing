'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProcessingsList, ProcessingsHeader, ProcessingDetail, SearchBar } from '@/components/processings';
import { Processing, SessionResponse } from '@/types/processing';
import { sessionsService } from '@/services/sessions.service';

// Format duration in seconds to readable format
function formatDuration(seconds?: number): string {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Transform API response to Processing format
function transformSession(session: SessionResponse): Processing {
    // Parse embedding if it's a string (PostgreSQL vector type returns as string)
    let parsedEmbedding: number[] | undefined;
    if (session.embedding) {
        if (Array.isArray(session.embedding)) {
            parsedEmbedding = session.embedding;
        } else if (typeof session.embedding === 'string') {
            try {
                parsedEmbedding = JSON.parse(session.embedding);
            } catch (e) {
                console.error('Failed to parse embedding:', e);
            }
        }
    }

    return {
        id: session.id,
        fileName: session.metadata.original_filename || session.metadata.unique_filename || `session-${new Date(session.created_at).toISOString().split('T')[0]}.mp3`,
        uploadDate: session.created_at,
        status: 'completed',
        duration: formatDuration(session.metadata.duration),
        fileSize: session.metadata.file_size ? parseFloat((session.metadata.file_size / (1024 * 1024)).toFixed(2)) : 0, // Convert to MB with 2 decimal places
        transcription: session.labelled_transcription,
        audioUrl: session.file_link,
        embedding: parsedEmbedding,
        embeddingModel: session.embedding_model,
        similarity: session.similarity,
        processingResults: {
            summary: session.ai_summary,
            keyTopics: session.metadata.key_topics || [],
            sentiment: (session.metadata.sentiment as any) || 'neutral',
            transcriptionAvailable: !!session.labelled_transcription,
        },
    };
}

export default function ProcessingsPage() {
    const [processings, setProcessings] = useState<Processing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProcessing, setSelectedProcessing] = useState<string | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<Processing[] | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        async function fetchSessions() {
            try {
                const response = await sessionsService.getAllSessions();
                const transformedData = response.data.map(transformSession);
                setProcessings(transformedData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            } finally {
                setLoading(false);
            }
        }

        fetchSessions();
    }, []);

    const handleSearch = async (query: string) => {
        setIsSearching(true);
        setSearchQuery(query);
        try {
            const response = await sessionsService.semanticSearch(query);
            const transformedResults = response.results.map(transformSession);
            setSearchResults(transformedResults);
            setSelectedProcessing(null); // Clear selection when searching
        } catch (err) {
            console.error('Search failed:', err);
            setError(err instanceof Error ? err.message : 'Search failed');
        } finally {
            setIsSearching(false);
        }
    };

    const handleClearSearch = () => {
        setSearchResults(null);
        setSearchQuery('');
        setSelectedProcessing(null);
    };

    const displayedProcessings = searchResults !== null ? searchResults : processings;
    const selectedItem = displayedProcessings.find(p => p.id === selectedProcessing);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-900 dark:border-zinc-100 mx-auto mb-4"></div>
                    <p className="text-zinc-600 dark:text-zinc-400">Loading sessions...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:opacity-90 transition-opacity"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-black">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="mb-6">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Upload
                    </Link>
                </div>

                <ProcessingsHeader />

                <SearchBar
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    isSearching={isSearching}
                    hasResults={searchResults !== null}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        {searchResults !== null && searchResults.length === 0 ? (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border border-zinc-200 dark:border-zinc-800 text-center">
                                <svg className="w-16 h-16 mx-auto mb-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">No results found</h3>
                                <p className="text-zinc-600 dark:text-zinc-400 mb-4">No sessions match your search query: &quot;{searchQuery}&quot;</p>
                                <button
                                    onClick={handleClearSearch}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all"
                                >
                                    Clear Search
                                </button>
                            </div>
                        ) : (
                            <ProcessingsList
                                processings={displayedProcessings}
                                selectedId={selectedProcessing}
                                onSelect={setSelectedProcessing}
                            />
                        )}
                    </div>

                    <div className="lg:col-span-2">
                        {selectedItem ? (
                            <ProcessingDetail processing={selectedItem} />
                        ) : (
                            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-12 border border-zinc-200 dark:border-zinc-800">
                                <div className="text-center text-zinc-500 dark:text-zinc-400">
                                    <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <p className="text-lg font-medium">Select a processing to view details</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
