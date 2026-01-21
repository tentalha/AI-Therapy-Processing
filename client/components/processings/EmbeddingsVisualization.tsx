'use client';

import { useState } from 'react';

interface EmbeddingsVisualizationProps {
    embedding: number[];
    model?: string;
}

export default function EmbeddingsVisualization({ embedding, model }: EmbeddingsVisualizationProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Validate embedding is a proper array
    if (!embedding || !Array.isArray(embedding) || embedding.length === 0) {
        return null;
    }

    // Calculate statistics
    const min = Math.min(...embedding);
    const max = Math.max(...embedding);
    const avg = embedding.reduce((a, b) => a + b, 0) / embedding.length;
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));

    // Take a sample for visualization (first 50 values)
    const sampleSize = 50;
    const sample = embedding.slice(0, sampleSize);
    const normalizedSample = sample.map(val => (val - min) / (max - min));

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                            AI Vector Embedding
                        </h3>
                        <span className="px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-medium rounded-full">AI</span>
                    </div>
                    {model && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            Model: {model}
                        </p>
                    )}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                    {isExpanded ? 'Show Less' : 'Show More'}
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Dimensions</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {embedding.length}
                    </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Magnitude</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {magnitude.toFixed(4)}
                    </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Average</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {avg.toFixed(4)}
                    </p>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-3">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">Range</p>
                    <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                        {(max - min).toFixed(4)}
                    </p>
                </div>
            </div>

            {/* Visualization */}
            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                    First {sampleSize} dimensions
                </p>
                <div className="flex items-end gap-[2px] h-24">
                    {normalizedSample.map((value, index) => (
                        <div
                            key={index}
                            className="flex-1 bg-gradient-to-t from-emerald-500 to-teal-600 rounded-t-sm transition-all hover:opacity-75"
                            style={{ height: `${value * 100}%` }}
                            title={`Dim ${index}: ${embedding[index].toFixed(6)}`}
                        />
                    ))}
                </div>
            </div>

            {/* Expanded view with all values */}
            {isExpanded && (
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4 max-h-96 overflow-y-auto">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                        All dimensions ({embedding.length} values)
                    </p>
                    <div className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all">
                        [{embedding.join(', ')}]
                    </div>
                </div>
            )}
        </div>
    );
}
