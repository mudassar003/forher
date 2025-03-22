"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Doctor } from './DoctorCard';

interface AppointmentSchedulerProps {
  doctorId: string;
  doctor: Doctor;
  onBack: () => void;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

type AppointmentType = 'video' | 'in-person';
type AppointmentCategory = 'first-visit' | 'follow-up' | 'consultation';

interface AppointmentDetails {
  doctorId: string;
  date: Date | null;
  timeSlot: string | null;
  type: AppointmentType;
  category: AppointmentCategory;
  notes: string;
}

// Generate dates for the next 14 days
const generateDates = (): Date[] => {
  const dates: Date[] = [];
  const today = new Date();
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }
  
  return dates;
};

// Generate sample time slots for demonstration
const generateTimeSlots = (date: Date): TimeSlot[] => {
  // This would come from your API in a real application
  const slots: TimeSlot[] = [];
  const isWeekend = date.getDay() === 0 || date.getDay() === 6;
  
  // Fewer slots on weekends
  const startHour = 9;
  const endHour = isWeekend ? 15 : 17;
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Randomly determine if slot is available (70% chance)
      const available = Math.random() > 0.3;
      
      slots.push({
        id: `${date.toISOString().split('T')[0]}-${hour}-${minute}`,
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        available
      });
    }
  }
  
  return slots;
};

export default function AppointmentScheduler({ 
  doctorId,
  doctor,
  onBack 
}: AppointmentSchedulerProps): React.ReactElement {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [dates] = useState<Date[]>(generateDates());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [appointmentDetails, setAppointmentDetails] = useState<AppointmentDetails>({
    doctorId,
    date: null,
    timeSlot: null,
    type: 'video',
    category: 'consultation',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  
  // Handle date selection
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setTimeSlots(generateTimeSlots(date));
    
    setAppointmentDetails({
      ...appointmentDetails,
      date,
      timeSlot: null // Reset time slot when date changes
    });
  };
  
  // Handle time slot selection
  const handleTimeSelect = (timeSlotId: string) => {
    setAppointmentDetails({
      ...appointmentDetails,
      timeSlot: timeSlotId
    });
  };
  
  // Handle appointment type selection
  const handleTypeSelect = (type: AppointmentType) => {
    setAppointmentDetails({
      ...appointmentDetails,
      type
    });
  };
  
  // Handle appointment category selection
  const handleCategorySelect = (category: AppointmentCategory) => {
    setAppointmentDetails({
      ...appointmentDetails,
      category
    });
  };
  
  // Handle notes input
  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAppointmentDetails({
      ...appointmentDetails,
      notes: e.target.value
    });
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsComplete(true);
    } catch (error) {
      console.error("Error booking appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Check if current step is complete and can proceed
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return selectedDate !== null && appointmentDetails.timeSlot !== null;
      case 2:
        return true; // Always can proceed from step 2
      default:
        return false;
    }
  };
  
  // Format date for display
  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Add keyframes for gradient background animation
  const animationKeyframes = `
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;
  
  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Inject the keyframes animation */}
      <style>{animationKeyframes}</style>
      
      {/* Header */}
      <div 
        className="py-4 px-6"
        style={{ 
          background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
          backgroundSize: "200% auto",
          animation: "gradient 3s linear infinite",
        }}
      >
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="text-white hover:text-gray-100 flex items-center"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          
          <h2 className="text-white text-xl font-medium">Schedule Appointment</h2>
          
          <div className="w-10"></div> {/* Empty space for layout balance */}
        </div>
      </div>
      
      {/* Progress steps */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
              currentStep >= 1 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-300'
            }`}>
            1
          </div>
          <div className={`h-1 w-12 mx-1 ${currentStep >= 2 ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gray-200'}`}></div>
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
              currentStep >= 2 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-300'
            }`}>
            2
          </div>
          <div className={`h-1 w-12 mx-1 ${currentStep >= 3 ? 'bg-gradient-to-r from-pink-500 to-red-500' : 'bg-gray-200'}`}></div>
          <div 
            className={`flex items-center justify-center w-8 h-8 rounded-full text-white font-medium ${
              currentStep >= 3 ? 'bg-gradient-to-r from-red-500 to-pink-500' : 'bg-gray-300'
            }`}>
            3
          </div>
        </div>
        
        <div className="text-sm text-gray-600 font-medium">
          {currentStep === 1 && "Select Date & Time"}
          {currentStep === 2 && "Appointment Details"}
          {currentStep === 3 && "Review & Confirm"}
        </div>
      </div>
      
      {/* Main content */}
      {!isComplete ? (
        <div className="p-6">
          {/* Step 1: Date and time selection */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-medium mb-4">Select a date</h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                {dates.map((date, index) => (
                  <motion.button
                    key={index}
                    className={`p-3 rounded-lg text-center transition-all ${
                      selectedDate && date.toDateString() === selectedDate.toDateString()
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={selectedDate && date.toDateString() === selectedDate.toDateString() ? {
                      background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)"
                    } : {}}
                    onClick={() => handleDateSelect(date)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="text-xs mb-1">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                    <div className="text-lg font-medium">{date.getDate()}</div>
                    <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </motion.button>
                ))}
              </div>
              
              {selectedDate && (
                <>
                  <h3 className="text-xl font-medium mb-4">Select a time</h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-6">
                    {timeSlots.map((slot) => (
                      <motion.button
                        key={slot.id}
                        className={`p-3 rounded-lg text-center transition-all ${
                          !slot.available 
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-60'
                            : appointmentDetails.timeSlot === slot.id
                              ? 'text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={slot.available && appointmentDetails.timeSlot === slot.id ? {
                          background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)"
                        } : {}}
                        onClick={() => slot.available && handleTimeSelect(slot.id)}
                        disabled={!slot.available}
                        whileHover={slot.available ? { scale: 1.02 } : {}}
                        whileTap={slot.available ? { scale: 0.98 } : {}}
                      >
                        {slot.time}
                      </motion.button>
                    ))}
                  </div>
                </>
              )}
            </motion.div>
          )}
          
          {/* Step 2: Appointment details */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-medium mb-4">Appointment Details</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-medium mb-2">Appointment Type</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <motion.button
                      className={`p-4 border rounded-lg flex items-center ${
                        appointmentDetails.type === 'video' 
                          ? 'border-2 border-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTypeSelect('video')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        appointmentDetails.type === 'video' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">Video Consultation</div>
                        <div className="text-sm text-gray-500">Meet via secure video call</div>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      className={`p-4 border rounded-lg flex items-center ${
                        appointmentDetails.type === 'in-person' 
                          ? 'border-2 border-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTypeSelect('in-person')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                        appointmentDetails.type === 'in-person' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="text-left">
                        <div className="font-medium">In-Person Visit</div>
                        <div className="text-sm text-gray-500">Visit our office location</div>
                      </div>
                    </motion.button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Visit Type</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <motion.button
                      className={`p-3 border rounded-lg text-center ${
                        appointmentDetails.category === 'first-visit' 
                          ? 'border-2 border-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCategorySelect('first-visit')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium">First Visit</div>
                      <div className="text-sm text-gray-500">New patient</div>
                    </motion.button>
                    
                    <motion.button
                      className={`p-3 border rounded-lg text-center ${
                        appointmentDetails.category === 'follow-up' 
                          ? 'border-2 border-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCategorySelect('follow-up')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium">Follow-up</div>
                      <div className="text-sm text-gray-500">Existing treatment</div>
                    </motion.button>
                    
                    <motion.button
                      className={`p-3 border rounded-lg text-center ${
                        appointmentDetails.category === 'consultation' 
                          ? 'border-2 border-red-500' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleCategorySelect('consultation')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="font-medium">Consultation</div>
                      <div className="text-sm text-gray-500">General advice</div>
                    </motion.button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Additional Notes (Optional)</h4>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={4}
                    placeholder="Please share any specific concerns or questions you'd like to discuss during your appointment..."
                    value={appointmentDetails.notes}
                    onChange={handleNotesChange}
                  />
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Step 3: Review and confirm */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h3 className="text-xl font-medium mb-4">Review Your Appointment</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-start mb-4">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2" style={{ borderColor: "#e63946" }}>
                    <Image 
                      src={doctor.imageUrl} 
                      alt={doctor.name} 
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-lg">{doctor.name}</h4>
                    <p className="text-gray-600">{doctor.title}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Date & Time</div>
                    <div className="font-medium">
                      {selectedDate && formatDate(selectedDate)}, {" "}
                      {appointmentDetails.timeSlot && timeSlots.find(slot => slot.id === appointmentDetails.timeSlot)?.time}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Appointment Type</div>
                    <div className="font-medium">
                      {appointmentDetails.type === 'video' ? 'Video Consultation' : 'In-Person Visit'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-gray-500">Visit Type</div>
                    <div className="font-medium">
                      {appointmentDetails.category === 'first-visit' ? 'First Visit' : 
                       appointmentDetails.category === 'follow-up' ? 'Follow-up' : 'Consultation'}
                    </div>
                  </div>
                </div>
                
                {appointmentDetails.notes && (
                  <div>
                    <div className="text-sm text-gray-500">Additional Notes</div>
                    <div className="text-gray-700 bg-white p-3 rounded border border-gray-200 mt-1">
                      {appointmentDetails.notes}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium mb-2">By confirming this appointment, you agree to:</h4>
                <ul className="list-disc list-inside text-gray-600 space-y-1 mb-4">
                  <li>Provide at least 24 hours notice for cancellations</li>
                  <li>Arrive 10 minutes before your scheduled appointment time</li>
                  <li>Bring any relevant medical records or test results</li>
                </ul>
              </div>
              
              <form onSubmit={handleSubmit}>
                <motion.button
                  type="submit"
                  className="w-full p-4 rounded-lg text-white font-medium text-center shadow-lg disabled:opacity-60"
                  style={{ 
                    background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                    backgroundSize: "200% auto",
                    animation: "gradient 3s linear infinite",
                  }}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Appointment'}
                </motion.button>
              </form>
            </motion.div>
          )}
          
          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <motion.button
                className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium"
                onClick={() => setCurrentStep(currentStep - 1)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Previous
              </motion.button>
            )}
            
            {currentStep < 3 && (
              <motion.button
                className="px-6 py-2 rounded-lg text-white font-medium ml-auto"
                style={{ 
                  background: canProceed() 
                    ? "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)" 
                    : "rgb(209, 213, 219)"
                }}
                onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
                whileHover={canProceed() ? { scale: 1.02 } : {}}
                whileTap={canProceed() ? { scale: 0.98 } : {}}
              >
                Next
              </motion.button>
            )}
          </div>
        </div>
      ) : (
        // Confirmation message after successful booking
        <motion.div
          className="p-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-2xl font-medium mb-2">Appointment Confirmed!</h3>
          
          <p className="text-gray-600 mb-6">
            Your appointment with {doctor.name} is scheduled for {selectedDate && formatDate(selectedDate)} at {
              appointmentDetails.timeSlot && timeSlots.find(slot => slot.id === appointmentDetails.timeSlot)?.time
            }.
          </p>
          
          <p className="text-gray-600 mb-8">
            You will receive a confirmation email with additional details. If this is a video consultation, 
            a link to join the call will be provided prior to your appointment time.
          </p>
          
          <div className="space-y-3">
            <motion.button
              className="px-8 py-3 rounded-full text-white font-medium w-full sm:w-auto"
              style={{ 
                background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                backgroundSize: "200% auto",
                animation: "gradient 3s linear infinite",
              }}
              onClick={() => window.location.href = "/dashboard"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Go to Dashboard
            </motion.button>
            
            <motion.button
              className="px-8 py-3 rounded-full bg-white text-gray-700 border border-gray-200 font-medium w-full sm:w-auto"
              onClick={() => window.location.href = "/"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Return to Home
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
}