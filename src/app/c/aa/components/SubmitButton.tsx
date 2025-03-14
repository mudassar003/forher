//src/app/c/hl/components/SubmitButton.tsx
"use client";

export default function SubmitButton({ onSubmit }: { onSubmit: () => void }) {
  return (
    <div className="fixed bottom-6 w-full flex justify-center">
      <button
        onClick={onSubmit}
        className="bg-black text-white text-lg font-medium px-6 py-3 rounded-full w-[90%] max-w-lg"
      >
        Submit
      </button>
    </div>
  );
}