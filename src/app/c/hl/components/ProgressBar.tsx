//src/app/c/hl/components/ProgressBar.tsx
"use client";

interface ProgressBarProps {
  progress: number; // Accept progress percentage dynamically
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="absolute top-6 w-full flex justify-center">
      <div className="w-full max-w-2xl bg-gray-300 h-2 rounded-full">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%`, backgroundColor: "#fe92b5" }} 
        />
      </div>
    </div>
  );
}