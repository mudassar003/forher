"use client";

import { useState } from "react";

const SubscribeSection = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = () => {
    // Placeholder logic for email subscription
    alert(`Subscribed with email: ${email}`);
    setEmail("");
  };

  return (
    <section className="bg-gray-100 py-16">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-semibold text-[#464E3D] mb-4">
          Subscribe To Our Newsletter
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Get the latest updates on new products and upcoming offers.
        </p>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          <input
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full md:w-auto flex-1 px-4 py-3 rounded-full border border-gray-300 shadow-sm focus:outline-none focus:border-[#729693]"
          />
          <button
            onClick={handleSubscribe}
            className="px-8 py-3 bg-[#464E3D] text-white rounded-full shadow-md hover:bg-[#333A2D] transition font-semibold"
          >
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};

export default SubscribeSection;
