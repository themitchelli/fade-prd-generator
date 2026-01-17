'use client';

interface NavigationModalProps {
  isOpen: boolean;
  onPark: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export default function NavigationModal({
  isOpen,
  onPark,
  onDiscard,
  onCancel,
}: NavigationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Save your progress?
        </h2>
        <p className="text-gray-600 mb-6">
          You have an active conversation. Would you like to save it before leaving?
        </p>

        <div className="space-y-3">
          <button
            onClick={onPark}
            className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
            Park & Download
          </button>

          <button
            onClick={onDiscard}
            className="w-full px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Discard & Leave
          </button>

          <button
            onClick={onCancel}
            className="w-full px-4 py-3 text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
