// src/lib/validations/userData.ts
import { z } from 'zod';

// US States mapping for validation
const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho',
  'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota',
  'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming'
];

export const userDataSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),
    
  lastName: z
    .string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),
    
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address')
    .max(254, 'Email address is too long'),
    
  phone: z
    .string()
    .trim()
    .regex(/^\+1[0-9]{10}$/, 'Phone must be in format +1XXXXXXXXXX'),
    
  state: z
    .string()
    .trim()
    .refine(
      (state) => US_STATES.includes(state),
      'Invalid US state'
    ),
    
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((date) => {
      const dateObj = new Date(date);
      const now = new Date();
      const minAge = 18;
      const maxAge = 120;
      
      // Check if date is valid
      if (isNaN(dateObj.getTime())) return false;
      
      // Check age bounds
      const age = now.getFullYear() - dateObj.getFullYear();
      const monthDiff = now.getMonth() - dateObj.getMonth();
      const dayDiff = now.getDate() - dateObj.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }
      
      return actualAge >= minAge && actualAge <= maxAge;
    }, 'Age must be between 18 and 120 years')
});

export type UserDataInput = z.infer<typeof userDataSchema>;

// Sanitization functions
export const sanitizeUserData = {
  name: (value: string): string => {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[<>\"'&]/g, '')
      .slice(0, 50);
  },
  
  email: (value: string): string => {
    return value
      .trim()
      .toLowerCase()
      .slice(0, 254);
  },
  
  phone: (value: string): string => {
    // Convert from formatted phone to +1XXXXXXXXXX
    const digitsOnly = value.replace(/[^\d]/g, '');
    if (digitsOnly.length === 10) {
      return `+1${digitsOnly}`;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
      return `+${digitsOnly}`;
    }
    return value;
  }
};