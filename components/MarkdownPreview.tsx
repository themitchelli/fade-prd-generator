'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  content: string;
}

export default function MarkdownPreview({ content }: MarkdownPreviewProps) {
  return (
    <div className="prose prose-slate max-w-none">
      <ReactMarkdown
        components={{
          h1: ({ node, ...props }) => (
            <h1 className="text-3xl font-bold mb-4 mt-6" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-2xl font-bold mb-3 mt-5" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-xl font-semibold mb-2 mt-4" {...props} />
          ),
          p: ({ node, ...props }) => <p className="mb-3" {...props} />,
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-6 mb-3" {...props} />
          ),
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          code: ({ node, ...props }) => (
            <code className="bg-gray-100 px-1 py-0.5 rounded text-sm" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
