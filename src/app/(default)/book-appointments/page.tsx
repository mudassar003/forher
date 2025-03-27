// src/app/(default)/book-appointments/page.tsx
import AppointmentGrid from '@/components/Appointment/AppointmentGrid';

export const metadata = {
  title: 'Book an Appointment',
  description: 'Schedule a telehealth consultation with our healthcare providers',
};

export default function AppointmentsPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Book a Telehealth Appointment
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Schedule a virtual consultation with our licensed healthcare providers
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-12">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="flex flex-col items-center text-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-pink-600">1</span>
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Select Appointment Type</h3>
                <p className="text-sm text-gray-600">Choose the type of consultation that best fits your needs</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-pink-600">2</span>
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Secure Payment</h3>
                <p className="text-sm text-gray-600">Complete the payment process through our secure checkout</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-pink-600">3</span>
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Join Virtual Waiting Room</h3>
                <p className="text-sm text-gray-600">Access our telehealth platform at your scheduled time</p>
              </div>
              
              <div className="flex flex-col items-center text-center">
                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center mb-3">
                  <span className="text-xl font-bold text-pink-600">4</span>
                </div>
                <h3 className="text-base font-medium text-gray-800 mb-1">Meet Your Provider</h3>
                <p className="text-sm text-gray-600">Consult with a licensed healthcare professional</p>
              </div>
            </div>
          </div>
        </div>
        
        <AppointmentGrid />
        
        <div className="bg-indigo-50 rounded-lg p-6 mt-12">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Important Information</h2>
          <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-base font-medium text-indigo-800 mb-2">Subscription-Required Appointments</h3>
              <p className="text-sm text-indigo-700">
                Some appointments require an active subscription. These appointments are marked with a "Subscription Required" badge. 
                You can view our subscription options on the <a href="/subscriptions" className="underline hover:text-indigo-900">subscriptions page</a>.
              </p>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-indigo-800">Telehealth Consultations</h3>
              <p className="mt-2 text-sm text-indigo-700">
                Our telehealth consultations provide convenient access to healthcare providers from the comfort of your home. All consultations are conducted through our secure and HIPAA-compliant platform.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">Appointment Duration</h3>
              <p className="mt-2 text-sm text-indigo-700">
                The duration listed for each appointment type is an approximation. Some consultations may take less time, while others might require additional time based on your specific needs.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">Cancellation Policy</h3>
              <p className="mt-2 text-sm text-indigo-700">
                Appointments can be rescheduled or cancelled up to 24 hours before the scheduled time. Late cancellations or no-shows may result in charges.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">Medical Emergencies</h3>
              <p className="mt-2 text-sm text-indigo-700">
                Our telehealth services are not intended for medical emergencies. If you are experiencing a medical emergency, please call 911 or go to your nearest emergency room.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}