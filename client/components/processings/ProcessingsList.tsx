import { Processing } from '@/types/processing';
import ProcessingCard from './ProcessingCard';

interface ProcessingsListProps {
    processings: Processing[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

export default function ProcessingsList({ processings, selectedId, onSelect }: ProcessingsListProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    All Recordings ({processings.length})
                </h2>
            </div>

            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                {processings.map((processing) => (
                    <ProcessingCard
                        key={processing.id}
                        processing={processing}
                        isSelected={processing.id === selectedId}
                        onClick={() => onSelect(processing.id)}
                    />
                ))}
            </div>
        </div>
    );
}
