"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Import Supabase client

export default function PaymentMethod() {
  const [cardLast4, setCardLast4] = useState<string | null>(null);

  // Fetch payment details from Supabase (Assuming it's stored in a `payments` table)
  useEffect(() => {
    const fetchPaymentMethod = async () => {
      const { data, error } = await supabase
        .from("payments") // Assuming you have a `payments` table
        .select("last4")
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (error) console.error("Error fetching payment method:", error);
      else setCardLast4(data?.last4);
    };

    fetchPaymentMethod();
  }, []);

  return (
    <div className=" bg-white shadow-md rounded-lg border border-gray-200 p-6 mt-10 "> {/* Increased width */}
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>

      {/* Payment Card Box */}
      <div className="bg-white shadow rounded-lg p-6 flex justify-between items-center w-full">
        <div>
          <p className="text-gray-500">Default card</p>
          <p className="text-black font-medium text-lg">
            {cardLast4 ? `•••• •••• •••• ${cardLast4}` : "No payment method added"}
          </p>
        </div>

        {/* Add Payment Button */}
        <button className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100">
          Add payment method
        </button>
      </div>
    </div>
  );
}
