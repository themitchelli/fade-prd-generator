'use client';

import { useState } from 'react';
import MarkdownPreview from './MarkdownPreview';
import { copyToClipboard, downloadFile } from '@/lib/utils';

interface OutputTabsProps {
  markdown: string;
  json: string;
  featureName: string;
}

export default function OutputTabs({ markdown, json, featureName }: OutputTabsProps) {
  const [activeTab, setActiveTab] = useState<'markdown' | 'json'>('markdown');
  const [copyStatus, setCopyStatus] = useState<string>('');

  const handleCopy = async (content: string) => {
    const success = await copyToClipboard(content);
    if (success) {
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } else {
      setCopyStatus('Failed to copy');
      setTimeout(() => setCopyStatus(''), 2000);
    }
  };

  const handleDownload = (content: string, extension: string, type: string) => {
    const filename = `prd-${featureName}.${extension}`;
    downloadFile(content, filename, type);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200 flex">
        <button
          onClick={() => setActiveTab('markdown')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'markdown'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          Markdown
        </button>
        <button
          onClick={() => setActiveTab('json')}
          className={`flex-1 px-6 py-3 font-medium transition-colors ${
            activeTab === 'json'
              ? 'bg-white text-blue-600 border-b-2 border-blue-600'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          JSON (Ralph)
        </button>
      </div>

      {/* Actions */}
      <div className="bg-gray-50 px-6 py-3 border-b border-gray-200 flex gap-3 flex-wrap">
        <button
          onClick={() =>
            handleCopy(activeTab === 'markdown' ? markdown : json)
          }
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {copyStatus || 'Copy to Clipboard'}
        </button>
        <button
          onClick={() =>
            handleDownload(
              activeTab === 'markdown' ? markdown : json,
              activeTab === 'markdown' ? 'md' : 'json',
              activeTab === 'markdown' ? 'text/markdown' : 'application/json'
            )
          }
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
        >
          Download
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[600px] overflow-y-auto">
        {activeTab === 'markdown' ? (
          <MarkdownPreview content={markdown} />
        ) : (
          <pre className="bg-gray-50 p-4 rounded overflow-x-auto">
            <code className="text-sm">{json}</code>
          </pre>
        )}
      </div>
    </div>
  );
}
