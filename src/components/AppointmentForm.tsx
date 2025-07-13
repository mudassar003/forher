// src/components/AppointmentForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

// Form data interface
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dob: string;
  state: string;
  examId: number;
}

// API response interfaces
interface QualiphyApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  meetingUrl?: string;
  examId?: number;
  patientExamId?: number;
}

interface UserDataApiResponse {
  success: boolean;
  data?: UserData;
  error?: string;
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

// Akina Pharmacy supported states (full names)
const AKINA_PHARMACY_STATES = [
  'Arizona', 'Colorado', 'Connecticut', 'Delaware', 'Georgia', 'Idaho', 
  'Illinois', 'Indiana', 'Kentucky', 'Massachusetts', 'Maryland', 
  'New Jersey', 'Nevada', 'New York', 'Missouri', 'Montana', 
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 
  'South Dakota', 'Tennessee', 'Utah', 'Virginia', 'Washington', 
  'Wisconsin', 'West Virginia'
];

// All US states for the dropdown
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

// Updated exam options with new medication shipping options
const EXAM_OPTIONS = [
  { id: 918, title: 'GLP-1 (No Labwork Required) Weight Loss Initial Consult' },
  { id: 1324, title: 'GLP-1 (Labwork Required) Weight Loss Initial Consult' },
  { id: 1325, title: 'Weight Loss GLP-1 Monthly Follow Up' },
  { id: 1148, title: 'Compounded Semaglutide with Medication Shipping (No Labwork Required)' },
  { id: 1693, title: 'Compounded Semaglutide with Medication Shipping (With Lab-work Upload)' },
  { id: 1287, title: 'Compounded Tirzepatide with Medication Shipping (No Labwork Required)' },
  { id: 1694, title: 'Compounded Tirzepatide with Medication Shipping (With Lab-work Upload)' },
  { id: 2095, title: '3 Month Supply: Semaglutide (No Labwork)' },
  { id: 2097, title: '3 Month Supply: Tirzepatide (No Labwork)' },
  { id: 2186, title: 'Qualiphy Test' },
  { id: 2490, title: 'AOD-9604 / MOTS-C With Medication Shipping' },
  { id: 452, title: 'Ablative Laser' },
  { id: 127, title: 'BBL Broadband Light' },
  { id: 131, title: 'BodyTone' }
];

// Pharmacy details component
const PharmacyDetails: React.FC<{ state: string }> = ({ state }) => {
  const isAkinaAvailable = AKINA_PHARMACY_STATES.includes(state);

  if (!state) {
    return null;
  }

  if (!isAkinaAvailable) {
    return (
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          🚫 Pharmacy Services Not Available
        </h3>
        <p className="text-yellow-700">
          Our pharmacy services are currently not available in {state}. 
          We currently serve the following states: AZ, CO, CT, DC, DE, GA, ID, IL, IN, KY, MA, MD, NJ, NV, NY, MO, MT, ND, OH, OK, OR, PA, SD, TN, UT, VA, WA, WI, WV.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        📋 Your Assigned Pharmacy
      </h3>
      <div className="space-y-2 text-blue-700">
        <div><strong>Pharmacy Name:</strong> Akina Pharmacy</div>
        <div><strong>Address:</strong> 23475 Rock Haven Way</div>
        <div><strong>City, State:</strong> Sterling, VA</div>
        <div><strong>Type:</strong> Mail Order Pharmacy</div>
        <div><strong>NCPDP ID:</strong> 4844824</div>
      </div>
      <p className="text-sm text-blue-600 mt-3">
        ℹ️ This pharmacy has been automatically selected based on your state. 
        Medications will be shipped directly to your address.
      </p>
    </div>
  );
};

const AppointmentForm: React.FC = () => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dob: '',
    state: '',
    examId: 1148 // Default to Compounded Semaglutide
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
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+1[0-9]{10}$/.test(formData.phoneNumber.replace(/\D/g, '').replace(/^1/, '+1'))) {
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
        // Adjust age if birthday hasn't occurred this year
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

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatPhoneNumber = (value: string): string => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 10) {
      return `+1${digits}`;
    }
    return `+1${digits.slice(-10)}`;
  };

  const checkExistingSubmission = async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/user-data/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const result: UserDataApiResponse = await response.json();
      
      if (result.success && result.data) {
        if ((result.data.submission_count || 0) >= 1) {
          setHasSubmitted(true);
          setMeetingUrl(result.data.meeting_url || null);
          setMessage({
            type: 'error',
            text: 'You have already submitted a consultation request. Only one submission is allowed per account.'
          });
        }
      }
    } catch (error) {
      console.error('Error checking submission status:', error);
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || '',
        firstName: user.user_metadata?.full_name?.split(' ')[0] || user.user_metadata?.name?.split(' ')[0] || '',
        lastName: user.user_metadata?.full_name?.split(' ').slice(1).join(' ') || user.user_metadata?.name?.split(' ').slice(1).join(' ') || '',
        phoneNumber: user.phone || ''
      }));
      
      checkExistingSubmission();
    } else {
      setIsDataLoading(false);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors above and try again.' });
      return;
    }

    // Check if state is supported by Akina Pharmacy
    if (!AKINA_PHARMACY_STATES.includes(formData.state)) {
      setMessage({ 
        type: 'error', 
        text: `Sorry, our pharmacy services are not yet available in ${formData.state}. We currently serve: AZ, CO, CT, DC, DE, GA, ID, IL, IN, KY, MA, MD, NJ, NV, NY, MO, MT, ND, OH, OK, OR, PA, SD, TN, UT, VA, WA, WI, WV.` 
      });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/qualiphy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim().toLowerCase(),
          phoneNumber: formatPhoneNumber(formData.phoneNumber),
          dob: formData.dob,
          state: formData.state,
          examId: formData.examId
        }),
      });

      const result: QualiphyApiResponse = await response.json();

      if (result.success) {
        setMessage({ type: 'success', text: result.message || 'Appointment scheduled successfully!' });
        setMeetingUrl(result.meetingUrl || null);
        setHasSubmitted(true);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to schedule appointment' });
        if (result.meetingUrl) {
          setMeetingUrl(result.meetingUrl);
          setHasSubmitted(true);
        }
      }
    } catch (error) {
      console.error('Error submitting appointment:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (isDataLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Your Consultation</h1>
        <p className="text-gray-600 mb-8">Book your appointment with our healthcare providers</p>

        {/* Show meeting URL for already submitted users */}
        {hasSubmitted && meetingUrl && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              ✅ Your Appointment is Scheduled
            </h3>
            <p className="text-green-700 mb-3">
              You have already submitted a consultation request. Here's your meeting link:
            </p>
            <a 
              href={meetingUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              🔗 Join Your Meeting
            </a>
          </div>
        )}

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
                disabled={hasSubmitted}
              />
              {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
                disabled={hasSubmitted}
              />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your email address"
              disabled={hasSubmitted}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+1 (555) 123-4567"
              disabled={hasSubmitted}
            />
            {errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>}
          </div>

          {/* Personal Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-2">
                Date of Birth *
              </label>
              <input
                type="date"
                id="dob"
                value={formData.dob}
                onChange={(e) => handleInputChange('dob', e.target.value)}
                max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                min={new Date(new Date().setFullYear(new Date().getFullYear() - 120)).toISOString().split('T')[0]}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.dob ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={hasSubmitted}
              />
              {errors.dob && <p className="mt-1 text-sm text-red-600">{errors.dob}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State *
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.state ? 'border-red-500' : 'border-gray-300'
                }`}
                disabled={hasSubmitted}
              >
                <option value="">Select your state</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
              {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state}</p>}
            </div>
          </div>

          {/* Exam Selection */}
          <div>
            <label htmlFor="examId" className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Type *
            </label>
            <select
              id="examId"
              value={formData.examId}
              onChange={(e) => handleInputChange('examId', parseInt(e.target.value))}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.examId ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={hasSubmitted}
            >
              <option value="">Select consultation type</option>
              {EXAM_OPTIONS.map((exam) => (
                <option key={exam.id} value={exam.id}>
                  {exam.title}
                </option>
              ))}
            </select>
            {errors.examId && <p className="mt-1 text-sm text-red-600">{errors.examId}</p>}
          </div>

          {/* Pharmacy Details Display */}
          <PharmacyDetails state={formData.state} />

          {/* Submit Button */}
          {!hasSubmitted && (
            <button
              type="submit"
              disabled={isLoading || !AKINA_PHARMACY_STATES.includes(formData.state)}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : AKINA_PHARMACY_STATES.includes(formData.state)
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-400 cursor-not-allowed text-gray-600'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Scheduling Appointment...
                </div>
              ) : (
                'Schedule Consultation'
              )}
            </button>
          )}
          
          {formData.state && !AKINA_PHARMACY_STATES.includes(formData.state) && !hasSubmitted && (
            <p className="text-sm text-orange-600 text-center">
              Please select a state where our pharmacy services are available to proceed.
            </p>
          )}
        </form>

        {/* Additional Information */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Important Information</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Consultations are available during business hours</li>
            <li>• You will receive an email confirmation with meeting details</li>
            <li>• Our healthcare providers are licensed professionals</li>
            <li>• All consultations are secure and HIPAA compliant</li>
            <li>• Pharmacy services are currently available in select states only</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AppointmentForm;