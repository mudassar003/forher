//src/app/account/appointments/page.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

// Define the Appointment interface
interface Appointment {
  id: string;
  treatment_name: string;
  appointment_date: string;
  status: string;
  created_at: string;
  notes?: string;
}

// Format date with time
const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  let bgColor = "bg-gray-100 text-gray-800";
  
  switch (status.toLowerCase()) {
    case "scheduled":
      bgColor = "bg-blue-100 text-blue-800";
      break;
    case "confirmed":
      bgColor = "bg-green-100 text-green-800";
      break;
    case "completed":
      bgColor = "bg-indigo-100 text-indigo-800";
      break;
    case "cancelled":
      bgColor = "bg-red-100 text-red-800";
      break;
    case "rescheduled":
      bgColor = "bg-yellow-100 text-yellow-800";
      break;
    default:
      bgColor = "bg-gray-100 text-gray-800";
  }
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      // In the future, integrate with Supabase
      // For now, use static data
      setTimeout(() => {
        setAppointments([
          {
            id: "1",
            treatment_name: "Hair Regrowth Consultation",
            appointment_date: "2025-03-20T10:00:00",
            status: "Scheduled",
            created_at: "2025-03-01T15:00:00",
            notes: "Initial consultation for hair regrowth treatment. Please arrive 15 minutes early to complete paperwork."
          },
          {
            id: "2",
            treatment_name: "Weight Loss Consultation",
            appointment_date: "2025-03-25T14:00:00",
            status: "Confirmed",
            created_at: "2025-03-02T16:00:00",
            notes: "Follow-up appointment to discuss progress and adjust treatment plan if necessary."
          },
          {
            id: "3",
            treatment_name: "Skin Care Treatment",
            appointment_date: "2025-03-10T13:30:00",
            status: "Completed",
            created_at: "2025-02-28T09:15:00",
            notes: "Completed facial treatment with recommended products for continued home care."
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchAppointments();
  }, []);

  const viewAppointmentDetails = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    document.getElementById("appointmentDetailsModal")?.classList.remove("hidden");
  };

  const closeAppointmentDetails = () => {
    document.getElementById("appointmentDetailsModal")?.classList.add("hidden");
    setSelectedAppointment(null);
  };

  const isUpcoming = (dateString: string) => {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    return appointmentDate > now;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // Separate upcoming and past appointments
  const upcomingAppointments = appointments.filter(appointment => 
    isUpcoming(appointment.appointment_date) && appointment.status.toLowerCase() !== "cancelled"
  );
  
  const pastAppointments = appointments.filter(appointment => 
    !isUpcoming(appointment.appointment_date) || appointment.status.toLowerCase() === "cancelled"
  );

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Upcoming Appointments</h2>
          <Link href="/book-appointment" className="px-4 py-2 bg-pink-500 text-white text-sm rounded-md hover:bg-pink-600 transition-colors">
            Book New Appointment
          </Link>
        </div>

        {upcomingAppointments.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No upcoming appointments</h3>
            <p className="text-gray-600 mb-6">You don't have any scheduled appointments at this time.</p>
            <Link href="/book-appointment" className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors">
              Book an Appointment
            </Link>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition">
                <div className="flex flex-col sm:flex-row">
                  {/* Date column */}
                  <div className="bg-pink-50 p-4 sm:w-36 flex flex-col items-center justify-center">
                    <p className="text-xl font-bold text-pink-600">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', { day: 'numeric' })}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      {new Date(appointment.appointment_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </p>
                    <p className="text-sm mt-1 text-gray-500">
                      {new Date(appointment.appointment_date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  </div>
                  
                  {/* Details column */}
                  <div className="p-4 flex-1 flex flex-col sm:flex-row items-start sm:items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-800">{appointment.treatment_name}</h3>
                      <div className="mt-1">
                        <StatusBadge status={appointment.status} />
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 flex space-x-2">
                      <button 
                        onClick={() => viewAppointmentDetails(appointment)}
                        className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50"
                      >
                        Details
                      </button>
                      <button className="px-3 py-1 border border-pink-500 bg-white text-pink-500 text-sm rounded hover:bg-pink-50">
                        Reschedule
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Appointments Section */}
      {pastAppointments.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-800">Past Appointments</h2>
          </div>
          <div className="p-6">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Treatment
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {pastAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {appointment.treatment_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDateTime(appointment.appointment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => viewAppointmentDetails(appointment)}
                        className="text-pink-500 hover:text-pink-700"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      <div id="appointmentDetailsModal" className="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md overflow-hidden">
            {selectedAppointment && (
              <>
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Appointment Details
                  </h3>
                  <button onClick={closeAppointmentDetails} className="text-gray-400 hover:text-gray-600">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-center mb-4">
                      <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                      </div>
                    </div>
                    
                    <h4 className="text-center text-xl font-semibold text-gray-800 mb-1">
                      {selectedAppointment.treatment_name}
                    </h4>
                    <p className="text-center text-gray-600 mb-4">
                      {formatDateTime(selectedAppointment.appointment_date)}
                    </p>
                    
                    <div className="flex justify-center mb-4">
                      <StatusBadge status={selectedAppointment.status} />
                    </div>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div className="mb-6">
                      <h5 className="font-medium text-gray-700 mb-1">Notes</h5>
                      <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h5 className="font-medium text-gray-700 mb-3">What to expect</h5>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Please arrive 15 minutes before your appointment time</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Bring any previous treatment records if applicable</span>
                      </li>
                      <li className="flex items-start">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>The appointment will last approximately 45-60 minutes</span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-between">
                  {isUpcoming(selectedAppointment.appointment_date) && selectedAppointment.status.toLowerCase() !== "cancelled" ? (
                    <>
                      <button className="px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50">
                        Cancel
                      </button>
                      <button className="px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600">
                        Reschedule
                      </button>
                    </>
                  ) : (
                    <button 
                      onClick={closeAppointmentDetails}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 ml-auto"
                    >
                      Close
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}