'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OutputTabs from '@/components/OutputTabs';
import { kebabCase } from '@/lib/utils';

export default function OutputPage() {
  const router = useRouter();
  const [markdown, setMarkdown] = useState('');
  const [json, setJson] = useState('');
  const [featureName, setFeatureName] = useState('feature');

  useEffect(() => {
    // Retrieve PRD data from session storage
    const mdContent = sessionStorage.getItem('prdMarkdown');
    const jsonContent = sessionStorage.getItem('prdJson');
    const name = sessionStorage.getItem('prdFeatureName');

    if (!mdContent || !jsonContent) {
      // No PRD data, redirect to home
      router.push('/');
      return;
    }

    setMarkdown(mdContent);
    setJson(jsonContent);
    setFeatureName(kebabCase(name || 'feature'));
  }, [router]);

  const handleStartAnother = () => {
    // Clear session storage
    sessionStorage.removeItem('prdMarkdown');
    sessionStorage.removeItem('prdJson');
    sessionStorage.removeItem('prdFeatureName');
    router.push('/');
  };

  if (!markdown || !json) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Your PRD is Ready!
          </h1>
          <p className="text-lg text-gray-600">
            Download or copy your PRD in your preferred format
          </p>
        </div>

        {/* Output Tabs */}
        <OutputTabs markdown={markdown} json={json} featureName={featureName} />

        {/* Actions */}
        <div className="mt-8 text-center">
          <button
            onClick={handleStartAnother}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            Start Another PRD
          </button>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-3">
            What&apos;s Next?
          </h2>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">•</span>
              <span>
                Use the <strong>Markdown version</strong> for team reviews and
                documentation
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
              <span>
                Share with stakeholders to validate scope before development
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
