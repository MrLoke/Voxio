"use client";

const GlobalError = ({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) => {
  return (
    <div className="h-screen flex flex-col items-center pt-24 text-slate-200 bg-slate-900">
      <h1 className="text-4xl font-bold">Something went wrong</h1>

      <p className="mt-4 text-slate-200">
        {error.message || "An unexpected error occurred."}
      </p>

      <button
        onClick={() => reset()}
        className="mt-6 border-2 rounded-md px-4 py-2 text-slate-300"
      >
        Try Again
      </button>
    </div>
  );
};

export default GlobalError;
