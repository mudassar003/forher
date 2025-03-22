"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Define strict TypeScript types
export interface Specialty {
  id: string;
  name: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  specialties: Specialty[];
  bio: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  availability: string;
}

interface DoctorCardProps {
  doctor: Doctor;
  onSelect: (doctorId: string) => void;
  isSelected: boolean;
}

export default function DoctorCard({ doctor, onSelect, isSelected }: DoctorCardProps): React.ReactElement {
  // Render stars based on rating
  const renderStars = (rating: number): React.ReactNode => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <svg key={`full-${i}`} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(
        <svg key="half" className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
          <defs>
            <linearGradient id={`half-star-${doctor.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stopColor="currentColor" />
              <stop offset="50%" stopColor="#D1D5DB" />
            </linearGradient>
          </defs>
          <path fill={`url(#half-star-${doctor.id})`} d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    // Add empty stars
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <svg key={`empty-${i}`} className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    
    return stars;
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
    <motion.div 
      className={`relative rounded-xl overflow-hidden transition-all duration-300 h-full ${
        isSelected ? 'ring-4 ring-offset-2' : 'hover:shadow-xl'
      }`}
      style={{ 
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
        ringColor: "#e63946" 
      }}
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Inject the keyframes animation */}
      <style>{animationKeyframes}</style>
      
      <div className="bg-white p-6 flex flex-col h-full">
        <div className="flex items-center mb-4">
          <div className="relative w-24 h-24 rounded-full overflow-hidden mr-4 flex-shrink-0 border-2" style={{ borderColor: "#e63946" }}>
            <Image 
              src={doctor.imageUrl} 
              alt={doctor.name} 
              fill
              sizes="(max-width: 768px) 96px, 96px"
              className="object-cover"
            />
          </div>
          
          <div>
            <h3 className="text-xl font-semibold">{doctor.name}</h3>
            <p className="text-gray-600">{doctor.title}</p>
            <div className="flex items-center mt-1">
              {renderStars(doctor.rating)}
              <span className="ml-2 text-sm text-gray-600">({doctor.reviewCount} reviews)</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {doctor.specialties.map((specialty) => (
            <span 
              key={specialty.id}
              className="px-2 py-1 text-xs rounded-full text-white"
              style={{ 
                background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
                backgroundSize: "200% auto",
                animation: "gradient 3s linear infinite",
              }}
            >
              {specialty.name}
            </span>
          ))}
        </div>
        
        <p className="text-gray-700 text-sm mb-4 flex-grow">{doctor.bio}</p>
        
        <div className="mt-auto">
          <p className="text-sm text-gray-600 mb-3">
            <span className="font-medium">Availability:</span> {doctor.availability}
          </p>
          
          <motion.button 
            className="w-full px-4 py-2 rounded-full text-white font-medium transition-all"
            style={{ 
              background: isSelected 
                ? "linear-gradient(90deg, #118ab2 0%, #073b4c 100%)" 
                : "linear-gradient(90deg, #e63946 0%, #ff4d6d 50%, #ff758f 100%)",
              backgroundSize: "200% auto",
              animation: "gradient 3s linear infinite",
            }}
            onClick={() => onSelect(doctor.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isSelected ? "Selected ✓" : "Select Doctor"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}