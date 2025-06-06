// src/components/QualiphyWidgetAuthWrapper.tsx
// DEPRECATED - Replace with AppointmentAccessGuard
// This file can be removed once all references are updated

'use client';

import { ReactNode } from 'react';
import AppointmentAccessGuard from './AppointmentAccessGuard';

interface QualiphyWidgetAuthWrapperProps {
  children: ReactNode;
}

/**
 * @deprecated Use AppointmentAccessGuard instead
 * This wrapper is kept for backwards compatibility
 */
export const QualiphyWidgetAuthWrapper: React.FC<QualiphyWidgetAuthWrapperProps> = ({ children }) => {
  console.warn('QualiphyWidgetAuthWrapper is deprecated. Use AppointmentAccessGuard instead.');
  
  return (
    <AppointmentAccessGuard>
      {children}
    </AppointmentAccessGuard>
  );
};

export default QualiphyWidgetAuthWrapper;