//src/components/Auth/AuthLayout.tsx
import React from "react";

const AuthLayout = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-center text-2xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;


