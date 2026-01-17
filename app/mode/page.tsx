'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { InterviewMode, WorkType } from '@/lib/types';
import Navbar from '@/components/Navbar';

const modes: { id: InterviewMode; title: string; description: string; duration: string }[] = [
  {
    id: 'quick',
    title: 'Quick Mode',
    description: 'Faster path for well-understood work. Fewer probing questions, gets to output sooner.',
    duration: '~5 minutes',
  },
  {
    id: 'standard',
    title: 'Standard Mode',
    description: 'Full exploration for complex work. Thorough questioning to ensure nothing is missed.',
    duration: '~15 minutes',
  },
];

const workTypeLabels: Record<WorkType, string> = {
  'new-project': 'New Project',
  'new-feature': 'New Feature',
  'enhancement': 'Enhancement',
  'spike': 'Spike',
  'tech-debt': 'Tech Debt',
  'bug': 'Bug Report',
};

export default function ModePage() {
  const router = useRouter();
  const [workType, setWorkType] = useState<WorkType | null>(null);

  useEffect(() => {
    const storedWorkType = sessionStorage.getItem('workType') as WorkType | null;
    if (!storedWorkType) {
      router.push('/');
      return;
    }
    setWorkType(storedWorkType);
  }, [router]);

  const handleSelectMode = (mode: InterviewMode) => {
    sessionStorage.setItem('interviewMode', mode);
    router.push('/chat');
  };

  const handleHomeClick = () => {
    sessionStorage.removeItem('workType');
    router.push('/');
  };

  if (!workType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar onHomeClick={handleHomeClick} />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="mb-2">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {workTypeLabels[workType]}
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Interview Depth
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              How thorough should the interview be? Quick mode is faster but assumes more. Standard mode explores deeply.
            </p>

            <div className="space-y-4">
              {modes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => handleSelectMode(mode.id)}
                  className="w-full text-left p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-700">
                      {mode.title}
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {mode.duration}
                    </span>
                  </div>
                  <p className="text-gray-600">{mode.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
