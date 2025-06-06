// src/components/AppointmentSessionWrapper.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface AppointmentSessionWrapperProps {
  children: ReactNode;
}

export default function AppointmentSessionWrapper({
  children,
}: AppointmentSessionWrapperProps) {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}