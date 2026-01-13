'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import { Message, ConversationPhase } from '@/lib/types';
import { formatMarkdownPRD } from '@/lib/utils';

export default function ChatPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResume = searchParams.get('resume') === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>('value');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isParkMode, setIsParkMode] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize conversation
    const initConversation = async () => {
      let initialMessage: Message;
      let resumeContent = '';

      if (isResume) {
        resumeContent = sessionStorage.getItem('parkedPRD') || '';
        sessionStorage.removeItem('parkedPRD');
        if (resumeContent) {
          initialMessage = {
            role: 'assistant',
            content:
              "I've reviewed your parked PRD. Let me pick up where we left off.",
          };
        } else {
          initialMessage = {
            role: 'assistant',
            content:
              "Let's create a PRD for your feature. What problem are we solving?",
          };
        }
      } else {
        initialMessage = {
          role: 'assistant',
          content:
            "Let's create a PRD for your feature. What problem are we solving?",
        };
      }

      setMessages([initialMessage]);
    };

    initConversation();
  }, [isResume]);

  useEffect(() => {
    // Auto-scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          resumeContent: isResume ? sessionStorage.getItem('parkedPRD') : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
      };

      setMessages([...updatedMessages, assistantMessage]);
      setPhase(data.phase);

      // If PRD is complete, extract and navigate to output
      if (data.complete) {
        extractAndNavigateToOutput(data.message);
      }
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const extractAndNavigateToOutput = (message: string) => {
    try {
      const startMarker = '===PRD_START===';
      const endMarker = '===PRD_END===';
      const startIndex = message.indexOf(startMarker);
      const endIndex = message.indexOf(endMarker);

      if (startIndex !== -1 && endIndex !== -1) {
        const jsonString = message
          .substring(startIndex + startMarker.length, endIndex)
          .trim();
        const prdData = JSON.parse(jsonString);

        // Format markdown
        const markdownContent = formatMarkdownPRD(prdData.markdown);

        // Store in session storage
        sessionStorage.setItem('prdMarkdown', markdownContent);
        sessionStorage.setItem('prdJson', JSON.stringify(prdData.json, null, 2));
        sessionStorage.setItem('prdFeatureName', prdData.markdown.featureName);

        // Navigate to output page
        router.push('/output');
      }
    } catch (err) {
      console.error('Failed to parse PRD:', err);
      setError('Failed to parse PRD. Please try again.');
    }
  };

  const handleParkIt = () => {
    setIsParkMode(true);
    // Request Claude to output current state
    sendMessage(
      'Please output the current state of our PRD conversation as a partial PRD that I can continue later.'
    );
  };

  const handleRetry = () => {
    setError('');
    if (messages.length > 0) {
      const lastUserMessage = messages
        .slice()
        .reverse()
        .find((m) => m.role === 'user');
      if (lastUserMessage) {
        sendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Ralph PRD Generator</h1>
        <button
          onClick={handleParkIt}
          disabled={isLoading || phase === 'complete'}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Park It
        </button>
      </div>

      {/* Progress Indicator */}
      <ProgressIndicator phase={phase} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((message, index) => (
            <ChatMessage key={index} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="bg-gray-100 rounded-lg px-4 py-3 border border-gray-200">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-red-800 mb-2">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      {phase !== 'complete' && (
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      )}
    </div>
  );
}
