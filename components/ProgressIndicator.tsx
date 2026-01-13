import { ConversationPhase } from '@/lib/types';

interface ProgressIndicatorProps {
  phase: ConversationPhase;
}

const phases = [
  { id: 'value', label: 'Phase 1: Value' },
  { id: 'scope', label: 'Phase 2: Scope' },
  { id: 'stories', label: 'Phase 3: Stories' },
];

export default function ProgressIndicator({ phase }: ProgressIndicatorProps) {
  if (phase === 'complete') {
    return null;
  }

  const currentIndex = phases.findIndex((p) => p.id === phase);

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex gap-2 justify-center flex-wrap">
        {phases.map((p, index) => {
          const isActive = p.id === phase;
          const isPast = index < currentIndex;

          return (
            <div
              key={p.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : isPast
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {p.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
