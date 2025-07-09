// src/components/AppointmentForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { supabase } from '@/lib/supabase';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  state: string;
  examId: number;
}

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  dob: string;
  state: string;
  submission_count: number;
}

interface AppointmentResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  meetingUrl?: string;
  examId?: number;
  patientExamId?: number;
}

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

const EXAM_OPTIONS = [
  { id: 918, title: 'GLP-1 (No Labwork Required) Weight Loss Initial Consult' },
  { id: 1324, title: 'GLP-1 (Labwork Required) Weight Loss Initial Consult' },
  { id: 1325, title: 'Weight Loss GLP-1 Monthly Follow Up' },
  { id: 2095, title: '3 Month Supply: Semaglutide (No Labwork)' },
  { id: 2097, title: '3 Month Supply: Tirzepatide (No Labwork)' },
  { id: 2186, title: 'Qualiphy Test' },
  { id: 2490, title: 'AOD-9604 / MOTS-C With Medication Shipping' },
  { id: 452, title: 'Ablative Laser' },
  { id: 127, title: 'BBL Broadband Light' },
  { id: 131, title: 'BodyTone' }
];

const AppointmentForm: React.FC = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    state: '',
    examId: 918
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.firstName.trim())) {
      newErrors.firstName = 'First name contains invalid characters';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    } else if (!/^[a-zA-Z\s'-]+$/.test(formData.lastName.trim())) {
      newErrors.lastName = 'Last name contains invalid characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+1[0-9]{10}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = 'Phone must be in format +1XXXXXXXXXX';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const dateObj = new Date(formData.dob);
      const now = new Date();
      const age = now.getFullYear() - dateObj.getFullYear();
      const monthDiff = now.getMonth() - dateObj.getMonth();
      const dayDiff = now.getDate() - dateObj.getDate();
      
      let actualAge = age;
      if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
        actualAge--;
      }
      
      if (actualAge < 18 || actualAge > 120) {
        newErrors.dob = 'Age must be between 18 and 120 years';
      }
    }

    if (!formData.state) {
      newErrors.state = 'State is required';
    } else if (!US_STATES.includes(formData.state)) {
      newErrors.state = 'Please select a valid US state';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setIsDataLoading(false);
        return;
      }

      try {
        const { data: userData, error } = await supabase
          .from('user_data')
          .select('*')
          .eq('email', user.email)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading user data:', error);
          setIsDataLoading(false);
          return;
        }

        if (userData) {
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || user.email || '',
            phoneNumber: userData.phone || '',
            dob: userData.dob || '',
            state: userData.state || ''
          }));

          if (userData.submission_count && userData.submission_count >= 1) {
            setHasSubmitted(true);
          }
        } else {
          setFormData(prev => ({
            ...prev,
            email: user.email || ''
          }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'phoneNumber') {
      const digitsOnly = value.replace(/[^\d]/g, '');
      
      if (digitsOnly.length === 10) {
        setFormData(prev => ({ ...prev, [name]: `+1${digitsOnly}` }));
        return;
      } else if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
        setFormData(prev => ({ ...prev, [name]: `+${digitsOnly}` }));
        return;
      }
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'examId' ? parseInt(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (hasSubmitted) {
      setMessage({
        type: 'error',
        text: 'You have already submitted a consultation request. Only one submission is allowed per account.'
      });
      return;
    }

    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please correct the errors below and try again.'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setMeetingUrl(null);

    try {
      const response = await fetch('/api/qualiphy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      const result: AppointmentResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to schedule appointment');
      }

      setMessage({
        type: 'success',
        text: result.message || 'Appointment scheduled successfully!'
      });
      
      if (result.meetingUrl) {
        setMeetingUrl(result.meetingUrl);
      }
      
      setHasSubmitted(true);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage({
        type: 'error',
        text: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="w-6 h-6 text-yellow-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <h3 className="text-lg font-medium text-yellow-800">Consultation Already Requested</h3>
            <p className="text-yellow-700 mt-1">
              You have already submitted a consultation request. Only one submission is allowed per account.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Schedule Your Telehealth Consultation</h2>
      
      {message && (
        <div className={`p-4 rounded-md mb-6 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700' 
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          <div className="flex">
            <div className="flex-shrink-0">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm">{message.text}</p>
            </div>
          </div>
        </div>
      )}

      {meetingUrl && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Your Meeting Is Ready!</h3>
          <p className="text-blue-700 mb-3">Click the link below to join your telehealth consultation:</p>
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Join Consultation
          </a>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.firstName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your first name"
            />
            {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.lastName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter your last name"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+1XXXXXXXXXX"
            />
            {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            <p className="text-xs text-gray-500 mt-1">Format: +1XXXXXXXXXX</p>
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
              State *
            </label>
            <select
              id="state"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.state ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select your state</option>
              {US_STATES.map(state => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              errors.dob ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.dob && <p className="text-red-500 text-xs mt-1">{errors.dob}</p>}
        </div>

        <div>
          <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-1">
            Consultation Type *
          </label>
          <select
            id="examId"
            name="examId"
            value={formData.examId}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
            {EXAM_OPTIONS.map(option => (
              <option key={option.id} value={option.id}>
                {option.title}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white py-3 px-4 rounded-md font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Scheduling...
              </div>
            ) : (
              'Schedule Consultation'
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <h4 className="text-sm font-medium text-gray-800 mb-2">Important Notes:</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Only one consultation request is allowed per account</li>
          <li>• Your meeting link will be provided immediately after submission</li>
          <li>• Please ensure you have a stable internet connection</li>
          <li>• Have your medical history ready for the consultation</li>
        </ul>
      </div>
    </div>
  );
};

export default AppointmentForm;