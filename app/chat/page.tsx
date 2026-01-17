'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import ProgressIndicator from '@/components/ProgressIndicator';
import Navbar from '@/components/Navbar';
import NavigationModal from '@/components/NavigationModal';
import { Message, ConversationPhase, WorkType, InterviewMode, FlowType, getFlowType, ParkedSession } from '@/lib/types';
import { formatMarkdownPRD, formatSpikeBrief, formatTechDebtBrief, downloadFile, kebabCase } from '@/lib/utils';

const workTypeLabels: Record<WorkType, string> = {
  'new-project': 'New Project',
  'new-feature': 'New Feature',
  'enhancement': 'Enhancement',
  'spike': 'Spike',
  'tech-debt': 'Tech Debt',
};

const initialMessages: Record<FlowType, string> = {
  feature: "Let's create a PRD for your feature. What problem are we solving?",
  spike: "Let's define your spike. What question are you trying to answer, or what do you need to learn?",
  'tech-debt': "Let's document this tech debt. What system or component needs improvement, and why is it a problem?",
};

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isResume = searchParams.get('resume') === 'true';

  const [messages, setMessages] = useState<Message[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>('value');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [workType, setWorkType] = useState<WorkType | null>(null);
  const [interviewMode, setInterviewMode] = useState<InterviewMode | null>(null);
  const [flowType, setFlowType] = useState<FlowType>('feature');
  const [showNavigationModal, setShowNavigationModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (isResume) {
      const parkedSessionJson = sessionStorage.getItem('parkedSession');

      if (parkedSessionJson) {
        try {
          const parkedSession: ParkedSession = JSON.parse(parkedSessionJson);

          setWorkType(parkedSession.workType);
          setFlowType(parkedSession.flowType);
          setPhase(parkedSession.phase);
          setMessages(parkedSession.messages);
          if (parkedSession.interviewMode) {
            setInterviewMode(parkedSession.interviewMode);
          }

          sessionStorage.setItem('workType', parkedSession.workType);
          if (parkedSession.interviewMode) {
            sessionStorage.setItem('interviewMode', parkedSession.interviewMode);
          }

          sessionStorage.removeItem('parkedSession');
          return;
        } catch (err) {
          console.error('Failed to parse parked session:', err);
        }
      }

      router.push('/');
      return;
    }

    const storedWorkType = sessionStorage.getItem('workType') as WorkType | null;
    const storedMode = sessionStorage.getItem('interviewMode') as InterviewMode | null;

    if (!storedWorkType) {
      router.push('/');
      return;
    }

    setWorkType(storedWorkType);
    const flow = getFlowType(storedWorkType);
    setFlowType(flow);

    if (flow === 'spike') {
      setPhase('hypothesis');
    } else if (flow === 'tech-debt') {
      setPhase('current');
    } else {
      setPhase('value');
    }

    if (storedMode) {
      setInterviewMode(storedMode);
    }

    const initialMessage: Message = {
      role: 'assistant',
      content: initialMessages[flow],
    };
    setMessages([initialMessage]);
  }, [isResume, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const hasUserMessages = messages.some(m => m.role === 'user');

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
          flowType,
          interviewMode,
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
        const outputData = JSON.parse(jsonString);

        let markdownContent: string;
        let title: string;

        if (flowType === 'spike') {
          markdownContent = formatSpikeBrief(outputData.markdown);
          title = outputData.markdown.title || 'spike';
        } else if (flowType === 'tech-debt') {
          markdownContent = formatTechDebtBrief(outputData.markdown);
          title = outputData.markdown.title || 'tech-debt';
        } else {
          markdownContent = formatMarkdownPRD(outputData.markdown);
          title = outputData.markdown.featureName || 'feature';
        }

        sessionStorage.setItem('prdMarkdown', markdownContent);
        sessionStorage.setItem('prdJson', JSON.stringify(outputData.json, null, 2));
        sessionStorage.setItem('prdFeatureName', title);
        sessionStorage.setItem('outputType', flowType);

        router.push('/output');
      }
    } catch (err) {
      console.error('Failed to parse output:', err);
      setError('Failed to parse output. Please try again.');
    }
  };

  const handleParkIt = () => {
    if (!workType) return;

    const parkedSession: ParkedSession = {
      version: 1,
      timestamp: new Date().toISOString(),
      workType,
      interviewMode: interviewMode || undefined,
      flowType,
      phase,
      messages,
    };

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `parked-session-${kebabCase(workTypeLabels[workType])}-${dateStr}.json`;

    downloadFile(
      JSON.stringify(parkedSession, null, 2),
      filename,
      'application/json'
    );

    router.push('/?parked=true');
  };

  const handleHomeClick = () => {
    if (hasUserMessages) {
      setShowNavigationModal(true);
    } else {
      // No conversation yet, go directly home
      sessionStorage.removeItem('workType');
      sessionStorage.removeItem('interviewMode');
      router.push('/');
    }
  };

  const handleModalPark = () => {
    setShowNavigationModal(false);
    handleParkIt();
  };

  const handleModalDiscard = () => {
    setShowNavigationModal(false);
    sessionStorage.removeItem('workType');
    sessionStorage.removeItem('interviewMode');
    router.push('/');
  };

  const handleModalCancel = () => {
    setShowNavigationModal(false);
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
      <Navbar onHomeClick={handleHomeClick} />

      {/* Sub-header with work type and Park It button */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center">
        <div>
          {workType && (
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                {workTypeLabels[workType]}
              </span>
              {interviewMode && (
                <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                  {interviewMode === 'quick' ? 'Quick' : 'Standard'}
                </span>
              )}
            </div>
          )}
        </div>
        <button
          onClick={handleParkIt}
          disabled={isLoading || phase === 'complete'}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Park It
        </button>
      </div>

      <ProgressIndicator phase={phase} flowType={flowType} />

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

      {phase !== 'complete' && (
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      )}

      <NavigationModal
        isOpen={showNavigationModal}
        onPark={handleModalPark}
        onDiscard={handleModalDiscard}
        onCancel={handleModalCancel}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    }>
      <ChatPageContent />
    </Suspense>
  );
}
