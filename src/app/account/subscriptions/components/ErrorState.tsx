//src/app/account/subscriptions/components/ErrorState.tsx
"use client";

interface ErrorStateProps {
  error: string;
  retry: () => void;
}

export const ErrorState = ({ error, retry }: ErrorStateProps) => {
  return (
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-500">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">Something went wrong</h3>
      <p className="text-red-500 mb-4">{error}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600"
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorState;