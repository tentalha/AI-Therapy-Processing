'use client';

import { useState } from 'react';

interface SearchBarProps {
    onSearch: (query: string) => void;
    onClear: () => void;
    isSearching: boolean;
    hasResults: boolean;
}

export default function SearchBar({ onSearch, onClear, isSearching, hasResults }: SearchBarProps) {
    const [query, setQuery] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim());
        }
    };

    const handleClear = () => {
        setQuery('');
        onClear();
    };

    return (
        <div className="mb-6">
            <form onSubmit={handleSubmit} className="relative">
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                        <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search sessions using AI semantic search..."
                        className="w-full pl-12 pr-24 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 transition-all"
                        disabled={isSearching}
                    />
                    {(query || hasResults) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute inset-y-0 right-20 flex items-center pr-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={!query.trim() || isSearching}
                        className="absolute inset-y-0 right-0 flex items-center px-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-r-lg hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {isSearching ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            <span className="font-medium">Search</span>
                        )}
                    </button>
                </div>
            </form>
            {hasResults && (
                <div className="mt-3 flex items-center gap-2 text-sm flex-wrap">
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        AI Search Results
                    </span>
                </div>
            )}
        </div>
    );
}
