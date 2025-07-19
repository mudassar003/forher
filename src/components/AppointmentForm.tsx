// src/components/AppointmentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
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

// Exam options based on subscription type
const EXAM_OPTIONS = {
  semaglutide: {
    id: 2413,
    title: 'Custom Pharmacy: Compounded Semaglutide (No Labwork Required) - Rx Only'
  },
  tirzepatide: {
    id: 2414,
    title: 'Custom Pharmacy: Compounded Tirzepatide (No Labwork Required) - Rx Only'
  }
} as const;

const AppointmentForm: React.FC = () => {
  const { user } = useAuthStore();
  const { subscriptions } = useSubscriptionStore();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    state: '',
    examId: 2413
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedExam, setSelectedExam] = useState<typeof EXAM_OPTIONS.semaglutide | typeof EXAM_OPTIONS.tirzepatide | null>(null);

  // Get exam based on active subscription
  const getExamFromSubscription = (): typeof EXAM_OPTIONS.semaglutide | typeof EXAM_OPTIONS.tirzepatide => {
    const activeSubscriptions = subscriptions.filter(sub => 
      sub.is_active === true && 
      ['active', 'trialing', 'past_due'].includes(sub.status?.toLowerCase() || '')
    );
    
    for (const subscription of activeSubscriptions) {
      const planName = subscription.plan_name?.toLowerCase() || '';
      
      if (planName.includes('tirzepatide')) {
        return EXAM_OPTIONS.tirzepatide;
      }
      if (planName.includes('semaglutide')) {
        return EXAM_OPTIONS.semaglutide;
      }
    }
    
    return EXAM_OPTIONS.semaglutide; // Default to semaglutide
  };

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

  // Set exam based on subscription
  useEffect(() => {
    const exam = getExamFromSubscription();
    setSelectedExam(exam);
    setFormData(prev => ({ ...prev, examId: exam.id }));
  }, [subscriptions]);

  // Load user data and check submission status
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.email) {
        setIsDataLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user-data/fetch', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include'
        });

        if (!response.ok) {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
          setIsDataLoading(false);
          return;
        }

        const result = await response.json();
        
        if (result.success && result.data) {
          const userData: UserData = result.data;
          
          // Check if user has already submitted
          if (userData.submission_count && userData.submission_count >= 1) {
            setHasSubmitted(true);
            if (userData.meeting_url) {
              setMeetingUrl(userData.meeting_url);
            }
            setIsDataLoading(false);
            return;
          }
          
          // Populate form with existing data
          setFormData(prev => ({
            ...prev,
            firstName: userData.first_name || '',
            lastName: userData.last_name || '',
            email: userData.email || '',
            phoneNumber: formatPhoneNumber(userData.phone || ''),
            dob: userData.dob || '',
            state: userData.state || ''
          }));
        } else {
          setFormData(prev => ({ ...prev, email: user.email || '' }));
        }
      } catch (error) {
        setFormData(prev => ({ ...prev, email: user.email || '' }));
      } finally {
        setIsDataLoading(false);
      }
    };

    loadUserData();
  }, [user?.email]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/qualiphy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: `+1${formData.phoneNumber.replace(/[^\d]/g, '')}`,
          dob: formData.dob,
          state: formData.state,
          examId: formData.examId
        }),
        credentials: 'include'
      });

      const result: AppointmentResponse = await response.json();

      if (result.success && result.meetingUrl) {
        setMeetingUrl(result.meetingUrl);
        setHasSubmitted(true);
        setMessage({ type: 'success', text: 'Appointment scheduled successfully!' });
      } else {
        setMessage({ 
          type: 'error', 
          text: result.error || 'Failed to schedule appointment. Please try again.'
        });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: 'An unexpected error occurred. Please try again later.'
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

  if (hasSubmitted && meetingUrl) {
    return <AppointmentFormSuccess meetingUrl={meetingUrl} />;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {message && (
        <div className={`mb-4 p-4 rounded-md ${
          message.type === 'error' 
            ? 'bg-red-50 border border-red-200 text-red-700' 
            : 'bg-green-50 border border-green-200 text-green-700'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Selected Exam Display */}
        {selectedExam && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Selected Consultation Type:</h3>
            <p className="text-blue-800">{selectedExam.title}</p>
            <p className="text-sm text-blue-600 mt-1">
              This consultation type is based on your active subscription and cannot be changed.
            </p>
          </div>
        )}

        {/* Pharmacy Information */}
        {selectedExam && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <h3 className="font-semibold text-green-900 mb-3">Pharmacy Information</h3>
            <div className="space-y-2">
              <div>
                <span className="font-medium text-green-800">Pharmacy:</span>
                <span className="text-green-700 ml-2">
                  {selectedExam.id === 2413 ? 'BELMAR PHARMACY' : 'Revive Rx'}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-800">Address:</span>
                <span className="text-green-700 ml-2">
                  {selectedExam.id === 2413 
                    ? '231 VIOLET STRE 140, GOLDEN, CO 80401'
                    : '3831 Golf Dr. A, Houston, TX 77018'
                  }
                </span>
              </div>
              <div>
                <span className="font-medium text-green-800">Phone:</span>
                <span className="text-green-700 ml-2">
                  {selectedExam.id === 2413 ? '(800) 525-9473' : '(888) 689-2271'}
                </span>
              </div>
              <div>
                <span className="font-medium text-green-800">Type:</span>
                <span className="text-green-700 ml-2">
                  {selectedExam.id === 2413 ? 'Retail' : 'Retail Compounding Pharmacy'}
                </span>
              </div>
            </div>
            <p className="text-sm text-green-600 mt-3">
              Your prescription will be processed through our partner pharmacy and shipped directly to you.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
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
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isLoading}
            />
            {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-gray-50"
            disabled={true}
          />
          <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
        </div>

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
            placeholder="(555) 123-4567"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              errors.dob ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          />
          {errors.dob && <p className="text-red-500 text-sm mt-1">{errors.dob}</p>}
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
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent ${
              errors.state ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isLoading}
          >
            <option value="">Select a state</option>
            {US_STATES.map(state => (
              <option key={state} value={state}>{state}</option>
            ))}
          </select>
          {errors.state && <p className="text-red-500 text-sm mt-1">{errors.state}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
            isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#e63946] to-[#ff4d6d] hover:from-[#d32f2f] hover:to-[#f44336]'
          }`}
        >
          {isLoading ? 'Scheduling...' : 'Schedule Appointment'}
        </button>
      </form>
    </div>
  );
};

export default AppointmentForm;