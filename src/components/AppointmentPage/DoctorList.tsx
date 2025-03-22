"use client";

import React, { useState } from 'react';
import DoctorCard, { Doctor, Specialty } from './DoctorCard';
import AppointmentScheduler from './AppointmentScheduler';
import { motion, AnimatePresence } from 'framer-motion';

// Sample doctor data - in a real app, this would come from an API
const SPECIALTIES: Specialty[] = [
  { id: "s1", name: "Hair Loss" },
  { id: "s2", name: "Weight Management" },
  { id: "s3", name: "Mental Health" },
  { id: "s4", name: "Skincare" },
  { id: "s5", name: "Women's Health" },
];

const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Sarah Johnson",
    title: "Board Certified Dermatologist",
    specialties: [SPECIALTIES[0], SPECIALTIES[3]],
    bio: "Dr. Johnson specializes in hair loss prevention and treatment with over 10 years of experience helping patients regrow and maintain healthy hair.",
    imageUrl: "/api/placeholder/200/200", // Replace with actual image path
    rating: 4.8,
    reviewCount: 127,
    availability: "Mon, Wed, Fri"
  },
  {
    id: "d2",
    name: "Dr. Michael Chen",
    title: "Nutritionist & Weight Management Specialist",
    specialties: [SPECIALTIES[1]],
    bio: "With a focus on sustainable weight management, Dr. Chen creates personalized nutrition plans that fit into your lifestyle for long-term success.",
    imageUrl: "/api/placeholder/200/200", // Replace with actual image path
    rating: 4.7,
    reviewCount: 89,
    availability: "Tue, Thu, Sat"
  },
  {
    id: "d3",
    name: "Dr. Emily Rodriguez",
    title: "Licensed Therapist",
    specialties: [SPECIALTIES[2]],
    bio: "Dr. Rodriguez helps patients develop coping strategies for anxiety and stress, focusing on evidence-based approaches to mental wellness.",
    imageUrl: "/api/placeholder/200/200", // Replace with actual image path
    rating: 4.9,
    reviewCount: 156,
    availability: "Mon-Fri"
  },
  {
    id: "d4",
    name: "Dr. David Williams",
    title: "Dermatologist & Skincare Expert",
    specialties: [SPECIALTIES[3]],
    bio: "Specializing in acne treatment and anti-aging solutions, Dr. Williams develops custom skincare regimens for all skin types and concerns.",
    imageUrl: "/api/placeholder/200/200", // Replace with actual image path
    rating: 4.6,
    reviewCount: 112,
    availability: "Wed-Sun"
  },
  {
    id: "d5",
    name: "Dr. Lisa Park",
    title: "OB-GYN & Hormone Specialist",
    specialties: [SPECIALTIES[4], SPECIALTIES[1]],
    bio: "Dr. Park specializes in women's health issues including hormone balancing, menopause management, and reproductive wellness.",
    imageUrl: "/api/placeholder/200/200", // Replace with actual image path
    rating: 4.8,
    reviewCount: 143,
    availability: "Mon, Tue, Thu, Fri"
  }
];

export default function DoctorList() {
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);
  const [filterSpecialty, setFilterSpecialty] = useState<string | null>(null);
  const [showScheduler, setShowScheduler] = useState<boolean>(false);
  
  // Handle doctor selection
  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctor(doctorId);
    
    // Auto-scroll to the Continue button when a doctor is selected
    setTimeout(() => {
      const continueButton = document.getElementById('continue-button');
      if (continueButton) {
        continueButton.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };
  
  // Filter doctors by specialty (if a filter is selected)
  const filteredDoctors = filterSpecialty 
    ? DOCTORS.filter(doctor => 
        doctor.specialties.some(specialty => specialty.id === filterSpecialty)
      )
    : DOCTORS;
  
  // Handle continue to scheduling
  const handleContinue = () => {
    if (selectedDoctor) {
      setShowScheduler(true);
      
      // Auto-scroll to the scheduler when it appears
      setTimeout(() => {
        const schedulerElement = document.getElementById('appointment-scheduler');
        if (schedulerElement) {
          schedulerElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };
  
  // Handle specialty filter selection
  const handleSpecialtyFilter = (specialtyId: string | null) => {
    setFilterSpecialty(specialtyId);
    // Reset selected doctor when changing filters
    setSelectedDoctor(null);
    setShowScheduler(false);
  };
  
  return (
    <div>
      {/* Specialty filter */}
      <div className="mb-8">
        <h2 className="text-lg font-medium mb-3 text-gray-700">Filter by specialty:</h2>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filterSpecialty === null 
                ? 'bg-gray-800 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            onClick={() => handleSpecialtyFilter(null)}
          >
            All Specialists
          </button>
          
          {SPECIALTIES.map(specialty => (
            <button
              key={specialty.id}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filterSpecialty === specialty.id 
                  ? 'text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              style={filterSpecialty === specialty.id ? {
                background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)"
              } : {}}
              onClick={() => handleSpecialtyFilter(specialty.id)}
            >
              {specialty.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Doctor grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {filteredDoctors.map(doctor => (
          <DoctorCard
            key={doctor.id}
            doctor={doctor}
            onSelect={handleDoctorSelect}
            isSelected={selectedDoctor === doctor.id}
          />
        ))}
      </div>
      
      {/* Continue button (appears when a doctor is selected) */}
      <AnimatePresence>
        {selectedDoctor && !showScheduler && (
          <motion.div 
            className="flex justify-center my-8"
            id="continue-button"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <motion.button
              className="px-8 py-3 rounded-full text-white font-medium text-lg shadow-lg"
              style={{ 
                background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                backgroundSize: "200% auto",
              }}
              onClick={handleContinue}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue to Schedule
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Appointment scheduler (appears after clicking continue) */}
      <AnimatePresence>
        {showScheduler && selectedDoctor && (
          <motion.div
            id="appointment-scheduler"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5 }}
            className="mt-10 pt-10 border-t border-gray-200"
          >
            <AppointmentScheduler 
              doctorId={selectedDoctor}
              doctor={DOCTORS.find(doc => doc.id === selectedDoctor)!}
              onBack={() => setShowScheduler(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}