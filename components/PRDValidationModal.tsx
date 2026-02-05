'use client';

import { PRDValidationResult, QualityIssue } from '@/lib/types';

interface PRDValidationModalProps {
  isOpen: boolean;
  result: PRDValidationResult | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
  onViewPRD: () => void;
  onFixInInterview: () => void;
  onDownloadAnyway: () => void;
}

function SeverityBadge({ severity }: { severity: QualityIssue['severity'] }) {
  const colors = {
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    suggestion: 'bg-blue-100 text-blue-800',
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium ${colors[severity]}`}>
      {severity}
    </span>
  );
}

function ScoreBadge({ score }: { score: 'good' | 'acceptable' | 'needs-improvement' }) {
  const colors = {
    good: 'bg-green-100 text-green-800 border-green-300',
    acceptable: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'needs-improvement': 'bg-red-100 text-red-800 border-red-300',
  };

  const labels = {
    good: 'Good Quality',
    acceptable: 'Acceptable',
    'needs-improvement': 'Needs Improvement',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${colors[score]}`}>
      {labels[score]}
    </span>
  );
}

export default function PRDValidationModal({
  isOpen,
  result,
  isLoading,
  error,
  onClose,
  onViewPRD,
  onFixInInterview,
  onDownloadAnyway,
}: PRDValidationModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900">Validating PRD...</h3>
            <p className="text-gray-600 text-sm mt-2">Analyzing format and quality</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
          <div className="text-center">
            <div className="text-4xl mb-4">&#x26a0;&#xfe0f;</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Validation Error</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No result yet (shouldn't happen, but safe fallback)
  if (!result) {
    return null;
  }

  // Schema errors - can't transform
  if (result.schemaErrors.length > 0 && !result.transformed) {
    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={handleBackdropClick}
      >
        <div className="bg-white rounded-xl p-8 max-w-lg w-full mx-4 shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">&#x274c;</div>
            <h3 className="text-xl font-semibold text-gray-900">Unable to Parse PRD</h3>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-800 mb-2">Schema Errors:</h4>
            <ul className="text-sm text-red-700 space-y-1">
              {result.schemaErrors.map((err, i) => (
                <li key={i}>• {err}</li>
              ))}
            </ul>
          </div>

          <p className="text-gray-600 text-sm mb-6">
            The uploaded file does not match any recognized PRD format. Please check the file and try again.
          </p>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const assessment = result.qualityAssessment;
  const isGoodQuality = assessment?.score === 'good' || assessment?.recommendation === 'output';
  const hasIssues = assessment?.issues && assessment.issues.length > 0;

  // Success state - transformed successfully
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              PRD Validation Complete
            </h3>
            {assessment && <ScoreBadge score={assessment.score} />}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Transformations applied */}
        {result.transformations.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Transformations Applied:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              {result.transformations.map((t, i) => (
                <li key={i}>• {t}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quality issues */}
        {hasIssues && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-800 mb-3">Quality Assessment:</h4>
            <ul className="space-y-2">
              {assessment?.issues.map((issue, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <SeverityBadge severity={issue.severity} />
                  <span className="text-gray-700">
                    <span className="font-medium">{issue.field}:</span> {issue.issue}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Schema warnings (from transformation) */}
        {result.schemaErrors.length > 0 && result.transformed && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">Warnings:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {result.schemaErrors.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Feature name preview */}
        {result.transformed && (
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <div className="text-sm text-gray-500 mb-1">Feature Name</div>
            <div className="font-medium text-gray-900">{result.transformed.featureName}</div>
            <div className="text-sm text-gray-600 mt-2">
              {result.transformed.userStories?.length || 0} user stories
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-3">
          {isGoodQuality ? (
            <>
              <button
                onClick={onViewPRD}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                View PRD
              </button>
              {hasIssues && (
                <button
                  onClick={onFixInInterview}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Improve in Interview
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={onFixInInterview}
                className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Fix in Interview
              </button>
              <button
                onClick={onDownloadAnyway}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Download Anyway
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-full px-6 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
