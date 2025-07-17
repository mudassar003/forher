// src/components/AppointmentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import AppointmentFormSuccess from './AppointmentFormSuccess';

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
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  state: string;
  dob: string;
  submission_count: number;
  meeting_url?: string;
  meeting_uuid?: string;
  created_at: string;
  updated_at: string;
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

// Only Akina Pharmacy supported states
const US_STATES = [
  'Arizona', 'Colorado', 'Connecticut', 'Delaware', 'Georgia', 'Idaho',
  'Illinois', 'Indiana', 'Kentucky', 'Massachusetts', 'Maryland', 
  'New Jersey', 'Nevada', 'New York', 'Missouri', 'Montana', 
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'South Dakota', 'Tennessee', 'Utah', 'Virginia', 'Washington', 
  'Wisconsin', 'West Virginia'
];

// Only 5 exams total (2 existing + 3 new)
const EXAM_OPTIONS = [
  { id: 918, title: 'GLP-1 (No Labwork Required) Weight Loss Initial Consult' },
  { id: 1324, title: 'GLP-1 (Labwork Required) Weight Loss Initial Consult' },
  { id: 1148, title: 'Compounded Semaglutide with Medication Shipping (No Labwork Required)' },
  { id: 1693, title: 'Compounded Semaglutide with Medication Shipping (With Lab-work Upload)' },
  { id: 2413, title: 'Custom Pharmacy: Compounded Semaglutide (No Labwork Required) - Rx Only' }
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

  // Format phone number for better UX
  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/[^\d]/g, '');
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

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

    // Phone validation with formatted input
    const digitsOnly = formData.phoneNumber.replace(/[^\d]/g, '');
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (digitsOnly.length !== 10) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit US phone number';
    }

    if (!formData.dob) {
      newErrors.dob = 'Date of birth is required';
    } else {
      const today = new Date();
      const birthDate = new Date(formData.dob);
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        // Age adjustment handled by date comparison above
      }
      
      if (age < 18) {
        newErrors.dob = 'You must be at least 18 years old';
      } else if (age > 120) {
        newErrors.dob = 'Please enter a valid date of birth';
      }
    }

    if (!formData.state) {
      newErrors.state = 'Please select a state';
    }

    if (!formData.examId) {
      newErrors.examId = 'Please select an exam type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Better phone number handling
    if (name === 'phoneNumber') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: name === 'examId' ? parseInt(value) : value 
    }));
  };

  // Load user data and check submission status
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setIsDataLoading(false);
        return;
      }

      try {
        // Checking user data for authenticated user

        // Use the existing API endpoint to fetch user data
        const response = await fetch('/api/user-data/fetch', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          console.error('Failed to fetch user data:', response.status);
          setFormData(prev => ({ ...prev, email: user.email || '' }));
          setIsDataLoading(false);
          return;
        }

        const result = await response.json();
        // User data fetched successfully
        
        if (result.success && result.data) {
          // Auto-fill all existing data
          setFormData(prev => ({
            ...prev,
            firstName: result.data.first_name || '',
            lastName: result.data.last_name || '',
            email: user.email || '', // Always use user account email
            phoneNumber: result.data.phone ? formatPhoneNumber(result.data.phone.replace('+1', '')) : '',
            dob: result.data.dob || '',
            state: result.data.state || ''
          }));

          // Check submission count properly
          if (result.data.submission_count && result.data.submission_count >= 1) {
            // User has already submitted, hiding form
            setHasSubmitted(true);
            if (result.data.meeting_url) {
              setMeetingUrl(result.data.meeting_url);
              // Meeting URL found and set
            }
          }
        } else {
          // No existing data, just set email
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      } finally {
        setIsDataLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({
        type: 'error',
        text: 'Please correct the errors below and try again.'
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Convert formatted phone to API format
      const digitsOnly = formData.phoneNumber.replace(/[^\d]/g, '');
      const apiFormData = {
        ...formData,
        phoneNumber: `+1${digitsOnly}`
      };

      const response = await fetch('/api/qualiphy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiFormData),
        credentials: 'include'
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      const result: AppointmentResponse = await response.json();

      if (result.success) {
        setMessage({
          type: 'success',
          text: result.message || 'Consultation scheduled successfully!'
        });
        
        if (result.meetingUrl) {
          setMeetingUrl(result.meetingUrl);
        }
        
        setHasSubmitted(true);
      } else {
        setMessage({
          type: 'error',
          text: result.error || 'Failed to schedule appointment'
        });
        
        if (result.meetingUrl) {
          setMeetingUrl(result.meetingUrl);
          setHasSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setMessage({
        type: 'error',
        text: 'Network error. Please try again later.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (isDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full mx-auto p-8 bg-white rounded-xl shadow-lg">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            <span className="ml-3 text-lg text-gray-700">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Show success component if user already submitted
  if (hasSubmitted) {
    return <AppointmentFormSuccess meetingUrl={meetingUrl || undefined} />;
  }

  // Main form component
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Consultation</h1>
            <p className="text-gray-600">Book your appointment with our healthcare providers</p>
          </div>

          {/* Message display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {/* Pharmacy Information */}
          {formData.state && (
            <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">
                🏥 Your Assigned Pharmacy
              </h3>
              <div className="text-blue-700 space-y-1">
                <p><strong>Akina Pharmacy</strong> (Mail Order)</p>
                <p>📍 23475 Rock Haven Way, Sterling, VA</p>
                <p>📦 Medications shipped directly to you</p>
              </div>
              <p className="text-sm text-blue-600 mt-3">
                This pharmacy is automatically assigned based on your state.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                    errors.firstName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && <p className="text-red-600 text-sm mt-1">{errors.firstName}</p>}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                    errors.lastName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && <p className="text-red-600 text-sm mt-1">{errors.lastName}</p>}
              </div>
            </div>

            {/* Email field - non-editable */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                readOnly
                disabled
                className="w-full px-4 py-3 border border-gray-200 rounded-lg text-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                placeholder="Email from your account"
              />
              <p className="text-sm text-gray-500 mt-1">Email is automatically filled from your account and cannot be changed</p>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Phone number field */}
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                    errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="(555) 123-4567"
                  maxLength={14}
                />
                {errors.phoneNumber && <p className="text-red-600 text-sm mt-1">{errors.phoneNumber}</p>}
                <p className="text-sm text-gray-500 mt-1">Enter your 10-digit US phone number</p>
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-2">
                  State *
                </label>
                <select
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                    errors.state ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your state</option>
                  {US_STATES.map(state => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.state && <p className="text-red-600 text-sm mt-1">{errors.state}</p>}
                <p className="text-sm text-gray-500 mt-1">Services available in select states only</p>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                name="dob"
                value={formData.dob}
                onChange={handleInputChange}
                required
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors ${
                  errors.dob ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.dob && <p className="text-red-600 text-sm mt-1">{errors.dob}</p>}
              <p className="text-sm text-gray-500 mt-1">You must be at least 18 years old</p>
            </div>

            {/* Consultation Type */}
            <div>
              <label htmlFor="examId" className="block text-sm font-semibold text-gray-700 mb-2">
                Consultation Type *
              </label>
              <select
                id="examId"
                name="examId"
                value={formData.examId}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              >
                {EXAM_OPTIONS.map(option => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
              {errors.examId && <p className="text-red-600 text-sm mt-1">{errors.examId}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-600 text-white py-4 px-6 rounded-lg text-lg font-semibold hover:from-pink-700 hover:to-rose-700 focus:outline-none focus:ring-4 focus:ring-pink-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    Scheduling Your Consultation...
                  </div>
                ) : (
                  'Schedule Consultation'
                )}
              </button>
            </div>
          </form>

          {/* Important Information */}
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Important Information</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                Only one consultation request is allowed per account
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                Your meeting link will be provided immediately after submission
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                Services available in select states only
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                Medications shipped via Akina Pharmacy
              </li>
              <li className="flex items-start">
                <span className="text-pink-500 mr-2">•</span>
                All consultations are secure and HIPAA compliant
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;