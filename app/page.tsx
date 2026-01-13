'use client';

import { useRouter } from 'next/navigation';
import { useState, ChangeEvent } from 'react';

export default function Home() {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);

  const handleStartNew = () => {
    router.push('/chat');
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Store in session storage to pass to chat page
        sessionStorage.setItem('parkedPRD', content);
        router.push('/chat?resume=true');
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Ralph PRD Generator
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            A conversational tool that guides you through creating well-structured
            Product Requirements Documents. Get clear on value, scope, and
            user stories in about 15 minutes.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleStartNew}
              className="w-full bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              Start New PRD
            </button>

            {!showUpload ? (
              <button
                onClick={() => setShowUpload(true)}
                className="w-full bg-gray-100 text-gray-700 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Continue Parked PRD
              </button>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".md,.json,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="text-gray-600">
                    <div className="text-lg font-medium mb-2">
                      Upload your parked PRD
                    </div>
                    <div className="text-sm text-gray-500">
                      Click to select a file (.md, .json, or .txt)
                    </div>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">
              How it works:
            </h2>
            <ol className="space-y-2 text-sm text-gray-600">
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-2">1.</span>
                <span>Answer questions about your feature&apos;s value and problem</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-2">2.</span>
                <span>Define scope and boundaries</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-2">3.</span>
                <span>Review and refine user stories</span>
              </li>
              <li className="flex">
                <span className="font-semibold text-blue-600 mr-2">4.</span>
                <span>Download your PRD in Markdown or JSON (Ralph-compatible)</span>
              </li>
            </ol>
          </div>
        </div>

        <div className="text-center mt-6 text-sm text-gray-600">
          Compatible with{' '}
          <a
            href="https://github.com/snarktank/ralph"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Ralph
          </a>
          , the autonomous AI agent loop
        </div>
      </div>
    </div>
  );
}
