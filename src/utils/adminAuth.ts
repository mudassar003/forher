// src/utils/adminAuth.ts

// Server-side admin email list (NOT exposed to client)
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',').map(email => email.trim()) || [];

/**
 * Check if an email is an admin email (server-side only)
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

/**
 * Check if current user is admin (for client-side components)
 */
export async function checkAdminStatus(): Promise<{ isAdmin: boolean; error?: string }> {
  try {
    const response = await fetch('/api/admin/check-status', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      return { isAdmin: false, error: 'Failed to check admin status' };
    }
    
    const data = await response.json();
    return { isAdmin: data.isAdmin || false };
  } catch (error) {
    return { isAdmin: false, error: 'Network error checking admin status' };
  }
}