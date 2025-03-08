"use client";
import { useState, useEffect } from "react";

// Define the Appointment interface (for future use)
interface Appointment {
  id: string;
  treatment_name: string;
  appointment_date: string;
  status: string;
  created_at: string;
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      // In the future, we will fetch appointments from Supabase.
      // You will use supabase.auth.getUser() to get the logged-in user's email or user_id.

      // Fetch appointments from Supabase (currently commented out)
      /*
      const user = (await supabase.auth.getUser()).data.user;
      
      const { data, error } = await supabase
        .from("appointments")
        .select("id, treatment_name, appointment_date, status, created_at")
        .eq("email", user?.email) // Fetch by user email
        .order("appointment_date", { ascending: true });

      if (error) {
        console.error("Error fetching appointments:", error);
      } else {
        setAppointments(data); // Store fetched appointments
      }
      */
      
      // Simulate fetching data by using static values
      setTimeout(() => {
        setAppointments([
          {
            id: "1",
            treatment_name: "Hair Regrowth Consultation",
            appointment_date: "2025-03-10T10:00:00",
            status: "Scheduled",
            created_at: "2025-03-01T15:00:00",
          },
          {
            id: "2",
            treatment_name: "Weight Loss Consultation",
            appointment_date: "2025-03-15T14:00:00",
            status: "Scheduled",
            created_at: "2025-03-02T16:00:00",
          },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchAppointments();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-lg font-semibold mb-4">Appointments</h2>
      {appointments.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 flex justify-center items-center">
          <p>You have no scheduled appointments.</p>
          <button className="ml-4 px-4 py-2 bg-black text-white rounded-lg">
            Find a treatment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-white shadow-md rounded-lg p-6">
              <p>Appointment ID: {appointment.id}</p>
              <p>Treatment: {appointment.treatment_name}</p>
              <p>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</p>
              <p>Status: {appointment.status}</p>
              <p>Created at: {new Date(appointment.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
