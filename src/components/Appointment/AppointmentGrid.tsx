// src/components/Appointment/AppointmentGrid.tsx
'use client';

import { useEffect, useState } from 'react';
import { client } from '@/sanity/lib/client';
import AppointmentCard from './AppointmentCard';
import { useAuthStore } from '@/store/authStore';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';

interface Appointment {
  _id: string;
  title: string;
  description?: string;
  price: number;
  duration: number;
  image?: SanityImageSource;
  qualiphyExamId?: number;
  isActive: boolean;
}

const AppointmentGrid: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuthStore();
  const { hasActiveSubscription, hasActiveAppointment, checkUserAccess } = useSubscriptionStore();
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        // Fetch active appointment types from Sanity
        const query = `*[_type == "appointment" && isActive == true] {
          _id,
          title,
          description,
          price,
          duration,
          image,
          qualiphyExamId,
          isActive
        } | order(price asc)`;
        
        const data = await client.fetch<Appointment[]>(query);
        
        setAppointments(data);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to load appointment types. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
    
    // If user is authenticated, check their access status
    if (isAuthenticated && user) {
      checkUserAccess(user.id);
    }
  }, [isAuthenticated, user, checkUserAccess]);

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
          <h2 className="text-lg text-gray-600">Loading appointments...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto p-6 bg-red-50 rounded-lg text-center">
          <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-medium text-red-800 mb-2">Something went wrong</h2>
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl font-medium text-gray-800 mb-4">No appointment types available</h2>
          <p className="text-gray-600">
            Please check back later for new appointment options.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Access status message */}
      {isAuthenticated && (
        <div className={`mb-8 p-4 rounded-lg ${hasActiveAppointment || hasActiveSubscription ? 'bg-green-50' : 'bg-yellow-50'}`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg 
                className={`h-6 w-6 ${hasActiveAppointment || hasActiveSubscription ? 'text-green-600' : 'text-yellow-600'}`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                {hasActiveAppointment || hasActiveSubscription ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                )}
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className={`text-sm font-medium ${hasActiveAppointment || hasActiveSubscription ? 'text-green-800' : 'text-yellow-800'}`}>
                {hasActiveAppointment 
                  ? 'You have an active appointment' 
                  : hasActiveSubscription 
                    ? 'You have an active subscription with appointment access' 
                    : 'You need an active appointment or subscription'}
              </h3>
              <div className={`mt-2 text-sm ${hasActiveAppointment || hasActiveSubscription ? 'text-green-700' : 'text-yellow-700'}`}>
                {hasActiveAppointment ? (
                  <p>You have an active appointment scheduled. You can book additional appointments below.</p>
                ) : hasActiveSubscription ? (
                  <p>Your subscription includes appointment access. You can book appointments below.</p>
                ) : (
                  <p>You need to purchase an appointment or a subscription with appointment access to book a consultation.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment._id}
            id={appointment._id}
            title={appointment.title}
            description={appointment.description}
            price={appointment.price}
            duration={appointment.duration}
            image={appointment.image}
            qualiphyExamId={appointment.qualiphyExamId}
          />
        ))}
      </div>
      
      {!isAuthenticated && (
        <div className="mt-12 p-4 bg-indigo-50 rounded-lg max-w-2xl mx-auto">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-indigo-800">Sign in to book appointments</h3>
              <div className="mt-2 text-sm text-indigo-700">
                <p>You need to be signed in to book appointments. Please sign in or create an account.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentGrid;