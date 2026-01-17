import { ConversationPhase, FlowType } from '@/lib/types';

interface ProgressIndicatorProps {
  phase: ConversationPhase;
  flowType: FlowType;
}

const phasesByFlow: Record<FlowType, { id: string; label: string }[]> = {
  feature: [
    { id: 'value', label: 'Phase 1: Value' },
    { id: 'scope', label: 'Phase 2: Scope' },
    { id: 'stories', label: 'Phase 3: Stories' },
  ],
  spike: [
    { id: 'hypothesis', label: 'Phase 1: Hypothesis' },
    { id: 'questions', label: 'Phase 2: Questions' },
    { id: 'boundaries', label: 'Phase 3: Boundaries' },
  ],
  'tech-debt': [
    { id: 'current', label: 'Phase 1: Current State' },
    { id: 'target', label: 'Phase 2: Target State' },
    { id: 'migration', label: 'Phase 3: Migration' },
  ],
  bug: [
    { id: 'description', label: 'Phase 1: Description' },
    { id: 'evidence', label: 'Phase 2: Evidence' },
    { id: 'behavior', label: 'Phase 3: Behavior' },
  ],
};

export default function ProgressIndicator({ phase, flowType }: ProgressIndicatorProps) {
  if (phase === 'complete') {
    return null;
  }

  const phases = phasesByFlow[flowType] || phasesByFlow.feature;
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
