"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">!</h1>
      <p className="text-xl text-muted mb-4">Something went wrong</p>
      <p className="text-sm text-muted mb-8">{error.message}</p>
      <button
        onClick={reset}
        className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
