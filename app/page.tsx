'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, ChangeEvent, Suspense } from 'react';
import { WorkType, needsModeSelection, ParkedSession, PRDValidationResult, ImportedPRDSession } from '@/lib/types';
import { formatMarkdownPRD } from '@/lib/utils';
import Navbar from '@/components/Navbar';
import HelpModal from '@/components/HelpModal';
import PRDValidationModal from '@/components/PRDValidationModal';

const workTypes: { id: WorkType; title: string; description: string; icon: string }[] = [
  {
    id: 'new-project',
    title: 'New Project',
    description: 'Starting from scratch with a greenfield codebase',
    icon: '🚀',
  },
  {
    id: 'new-feature',
    title: 'New Feature',
    description: 'Adding new capability to an existing system',
    icon: '✨',
  },
  {
    id: 'enhancement',
    title: 'Enhancement',
    description: 'Improving or extending existing functionality',
    icon: '📈',
  },
  {
    id: 'spike',
    title: 'Spike / Research',
    description: 'Time-boxed exploration or learning',
    icon: '🔬',
  },
  {
    id: 'tech-debt',
    title: 'Tech Debt',
    description: 'Refactor, upgrade, or pay down technical debt',
    icon: '🔧',
  },
  {
    id: 'bug',
    title: 'Bug Report',
    description: 'Document a bug with reproduction steps and evidence',
    icon: '🐛',
  },
];

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showUpload, setShowUpload] = useState(false);
  const [showPRDUpload, setShowPRDUpload] = useState(false);
  const [showParkedMessage, setShowParkedMessage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [prdUploadError, setPRDUploadError] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationResult, setValidationResult] = useState<PRDValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (searchParams.get('parked') === 'true') {
      setShowParkedMessage(true);
      window.history.replaceState({}, '', '/');
    }
  }, [searchParams]);

  const handleSelectWorkType = (workType: WorkType) => {
    sessionStorage.setItem('workType', workType);
    if (needsModeSelection(workType)) {
      router.push('/mode');
    } else {
      router.push('/chat');
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;

      try {
        const parsed = JSON.parse(content);

        if (
          typeof parsed.version !== 'number' ||
          typeof parsed.workType !== 'string' ||
          !Array.isArray(parsed.messages)
        ) {
          throw new Error('Invalid session file format');
        }

        sessionStorage.setItem('parkedSession', content);
        window.location.href = '/chat?resume=true';
      } catch (err: any) {
        console.error('Upload error:', err);
        setUploadError(err.message || 'Invalid file format. Please upload a valid parked session file.');
      }
    };
    reader.readAsText(file);
  };

  const handleHomeClick = () => {
    // Already on home, no-op
  };

  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  const handlePRDUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPRDUploadError(null);
    setValidationError(null);
    setValidationResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;

      try {
        const parsed = JSON.parse(content);

        // Show the validation modal and start validation
        setShowValidationModal(true);
        setIsValidating(true);

        const response = await fetch('/api/prd/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prdContent: parsed }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Validation failed');
        }

        const result: PRDValidationResult = await response.json();
        setValidationResult(result);
      } catch (err: any) {
        console.error('PRD upload error:', err);
        if (err.message.includes('JSON')) {
          setValidationError('Invalid JSON file. Please upload a valid JSON file.');
        } else {
          setValidationError(err.message || 'Failed to validate PRD.');
        }
      } finally {
        setIsValidating(false);
      }
    };
    reader.readAsText(file);

    // Reset the input so the same file can be uploaded again
    e.target.value = '';
  };

  const handleViewPRD = () => {
    if (!validationResult?.transformed) return;

    const prd = validationResult.transformed;

    // Convert to markdown format for display
    const markdownData = {
      featureName: prd.featureName,
      problemStatement: prd.problemStatement,
      successMetrics: prd.successMetrics,
      inScope: prd.inScope,
      outOfScope: prd.outOfScope,
      userStories: prd.userStories.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        acceptanceCriteria: s.acceptanceCriteria,
      })),
      technicalNotes: prd.technicalNotes,
      openQuestions: prd.openQuestions,
      contextDocs: prd.contextDocs,
    };

    sessionStorage.setItem('prdMarkdown', formatMarkdownPRD(markdownData));
    sessionStorage.setItem('prdJson', JSON.stringify(prd, null, 2));
    sessionStorage.setItem('prdFeatureName', prd.featureName);
    sessionStorage.setItem('outputType', 'feature');

    setShowValidationModal(false);
    router.push('/output');
  };

  const handleFixInInterview = () => {
    if (!validationResult?.transformed || !validationResult.qualityAssessment) return;

    // Store the imported PRD session data
    const importSession: ImportedPRDSession = {
      version: 1,
      prd: validationResult.transformed,
      qualityAssessment: validationResult.qualityAssessment,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem('importedPRD', JSON.stringify(importSession));
    sessionStorage.setItem('workType', 'enhancement');

    setShowValidationModal(false);
    router.push('/chat?import=true');
  };

  const handleDownloadAnyway = () => {
    if (!validationResult?.transformed) return;

    const prd = validationResult.transformed;

    // Convert to markdown format for display
    const markdownData = {
      featureName: prd.featureName,
      problemStatement: prd.problemStatement,
      successMetrics: prd.successMetrics,
      inScope: prd.inScope,
      outOfScope: prd.outOfScope,
      userStories: prd.userStories.map(s => ({
        id: s.id,
        title: s.title,
        description: s.description,
        acceptanceCriteria: s.acceptanceCriteria,
      })),
      technicalNotes: prd.technicalNotes,
      openQuestions: prd.openQuestions,
      contextDocs: prd.contextDocs,
    };

    sessionStorage.setItem('prdMarkdown', formatMarkdownPRD(markdownData));
    sessionStorage.setItem('prdJson', JSON.stringify(prd, null, 2));
    sessionStorage.setItem('prdFeatureName', prd.featureName);
    sessionStorage.setItem('outputType', 'feature');

    setShowValidationModal(false);
    router.push('/output');
  };

  const handleCloseValidationModal = () => {
    setShowValidationModal(false);
    setValidationResult(null);
    setValidationError(null);
    setShowPRDUpload(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar onHomeClick={handleHomeClick} onHelpClick={handleHelpClick} />
      <HelpModal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} />
      <PRDValidationModal
        isOpen={showValidationModal}
        result={validationResult}
        isLoading={isValidating}
        error={validationError}
        onClose={handleCloseValidationModal}
        onViewPRD={handleViewPRD}
        onFixInInterview={handleFixInInterview}
        onDownloadAnyway={handleDownloadAnyway}
      />
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {showParkedMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800">
                  Session parked successfully! Your progress has been downloaded.
                </p>
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              FADE PRD Generator
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              A conversational tool that guides you through creating well-structured
              requirements documents. Choose your work type to get started.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {workTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectWorkType(type.id)}
                  className="text-left p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="text-3xl mb-3">{type.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                    {type.title}
                  </h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </button>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-6 space-y-4">
              {/* Upload Existing PRD */}
              {!showPRDUpload ? (
                <button
                  onClick={() => setShowPRDUpload(true)}
                  className="w-full bg-blue-50 text-blue-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-100 transition-colors border-2 border-blue-200"
                >
                  Upload Existing PRD
                </button>
              ) : (
                <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center bg-blue-50">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handlePRDUpload}
                      className="hidden"
                    />
                    <div className="text-blue-700">
                      <div className="text-lg font-medium mb-2">
                        Upload your PRD file
                      </div>
                      <div className="text-sm text-blue-600">
                        Click to select a JSON PRD file for validation and reformatting
                      </div>
                    </div>
                  </label>
                  {prdUploadError && (
                    <p className="mt-3 text-sm text-red-600">{prdUploadError}</p>
                  )}
                  <button
                    onClick={() => setShowPRDUpload(false)}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {/* Continue Parked Session */}
              {!showUpload ? (
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors"
                >
                  Continue Parked Session
                </button>
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="text-gray-600">
                      <div className="text-lg font-medium mb-2">
                        Upload your parked session
                      </div>
                      <div className="text-sm text-gray-500">
                        Click to select your parked session JSON file
                      </div>
                    </div>
                  </label>
                  {uploadError && (
                    <p className="mt-3 text-sm text-red-600">{uploadError}</p>
                  )}
                  <button
                    onClick={() => setShowUpload(false)}
                    className="mt-3 text-sm text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-6 text-sm text-gray-600">
            Compatible with{' '}
            <a
              href="https://github.com/themitchelli/fade"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              FADE
            </a>
            , the Framework for Agentic Development and Engineering
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
