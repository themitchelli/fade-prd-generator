'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OutputTabs from '@/components/OutputTabs';
import { kebabCase } from '@/lib/utils';
import { FlowType } from '@/lib/types';
import Navbar from '@/components/Navbar';

const outputTitles: Record<FlowType, string> = {
  feature: 'Your PRD is Ready!',
  spike: 'Your Spike Brief is Ready!',
  'tech-debt': 'Your Tech Debt Brief is Ready!',
};

const outputDescriptions: Record<FlowType, string> = {
  feature: 'Download or copy your PRD in your preferred format',
  spike: 'Download or copy your spike brief in your preferred format',
  'tech-debt': 'Download or copy your tech debt brief in your preferred format',
};

export default function OutputPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('');
  const [json, setJson] = useState('');
  const [featureName, setFeatureName] = useState('feature');
  const [outputType, setOutputType] = useState<FlowType>('feature');

  useEffect(() => {
    const mdContent = sessionStorage.getItem('prdMarkdown');
    const jsonContent = sessionStorage.getItem('prdJson');
    const name = sessionStorage.getItem('prdFeatureName');
    const type = sessionStorage.getItem('outputType') as FlowType | null;

    if (!mdContent || !jsonContent) {
      router.push('/');
      return;
    }

    setMarkdown(mdContent);
    setJson(jsonContent);
    setFeatureName(kebabCase(name || 'document'));
    setOutputType(type || 'feature');
  }, [router]);

  const handleStartAnother = () => {
    sessionStorage.removeItem('prdMarkdown');
    sessionStorage.removeItem('prdJson');
    sessionStorage.removeItem('prdFeatureName');
    sessionStorage.removeItem('outputType');
    sessionStorage.removeItem('workType');
    sessionStorage.removeItem('interviewMode');
    router.push('/');
  };

  const handleHomeClick = () => {
    handleStartAnother();
  };

  if (!markdown || !json) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar onHomeClick={handleHomeClick} />
      <div className="flex-1">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {outputTitles[outputType]}
            </h1>
            <p className="text-lg text-gray-600">
              {outputDescriptions[outputType]}
            </p>
          </div>

          <OutputTabs markdown={markdown} json={json} featureName={featureName} />

          <div className="mt-8 text-center">
            <button
              onClick={handleStartAnother}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start Another
            </button>
          </div>

          <div className="mt-12 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              What&apos;s Next?
            </h2>
            {outputType === 'feature' && (
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Use the <strong>Markdown version</strong> for team reviews and documentation
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Use the <strong>JSON version</strong> with{' '}
                    <a
                      href="https://github.com/snarktank/ralph"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      Ralph
                    </a>{' '}
                    for autonomous implementation
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>Share with stakeholders to validate scope before development</span>
                </li>
              </ul>
            )}
            {outputType === 'spike' && (
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Share the spike brief with your team to align on the research goals
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Set a calendar reminder for the time box end date
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Document your findings in the expected output format
                  </span>
                </li>
              </ul>
            )}
            {outputType === 'tech-debt' && (
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Review the migration steps with your team to identify risks
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Use the <strong>JSON version</strong> with Claude Code for guided refactoring
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  <span>
                    Plan validation checkpoints to catch issues early
                  </span>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
