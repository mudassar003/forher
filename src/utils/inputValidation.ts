// Input validation and sanitization utilities
import DOMPurify from 'isomorphic-dompurify';

// Email validation with strict pattern
export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email is required' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email address is too long' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  return { valid: true };
};

// Password validation with comprehensive checks
export const validatePassword = (password: string): { valid: boolean; error?: string; strength?: number } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long' };
  }

  // Check for common patterns
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  let strength = 0;
  if (hasUpperCase) strength++;
  if (hasLowerCase) strength++;
  if (hasNumbers) strength++;
  if (hasSpecialChar) strength++;

  if (strength < 3) {
    return { 
      valid: false, 
      error: 'Password must contain at least 3 of: uppercase letters, lowercase letters, numbers, and special characters',
      strength
    };
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890'
  ];

  if (commonPasswords.includes(password.toLowerCase())) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password.' };
  }

  return { valid: true, strength };
};

// Sanitize string input
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Remove potentially dangerous characters
  return DOMPurify.sanitize(input.trim(), { ALLOWED_TAGS: [] });
};

// Validate phone number (US format)
export const validatePhoneNumber = (phone: string): { valid: boolean; error?: string } => {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, error: 'Phone number is required' };
  }

  const digitsOnly = phone.replace(/[^\d]/g, '');
  
  if (digitsOnly.length !== 10) {
    return { valid: false, error: 'Please enter a valid 10-digit US phone number' };
  }

  return { valid: true };
};

// Validate date of birth
export const validateDateOfBirth = (dob: string): { valid: boolean; error?: string } => {
  if (!dob || typeof dob !== 'string') {
    return { valid: false, error: 'Date of birth is required' };
  }

  const birthDate = new Date(dob);
  const today = new Date();
  
  if (isNaN(birthDate.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }

  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();

  const actualAge = age - (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0) ? 1 : 0);

  if (actualAge < 18) {
    return { valid: false, error: 'You must be at least 18 years old' };
  }

  if (actualAge > 120) {
    return { valid: false, error: 'Please enter a valid date of birth' };
  }

  return { valid: true };
};

// Validate reCAPTCHA token
export const validateRecaptchaToken = (token: string): { valid: boolean; error?: string } => {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Security verification required' };
  }

  if (token.length < 10) {
    return { valid: false, error: 'Invalid security verification token' };
  }

  return { valid: true };
};

// General input sanitization for form fields
export const sanitizeFormData = (data: Record<string, any>): Record<string, any> => {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[key] = value;
    } else if (typeof value === 'boolean') {
      sanitized[key] = value;
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};