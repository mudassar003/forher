// src/app/(default)/(legal)/privacy-policy/page.tsx
"use client";

import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function PrivacyPolicy() {
  return (
    <LegalPageLayout 
      title="Privacy Policy" 
      lastUpdated="March 17, 2025"
    >
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
      <p>
        Welcome to Lily&apos;s ("we," "our," or "us"). We are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our mobile application, or utilize our telehealth services.
      </p>
      <p>
        Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
      
      <h3 className="text-lg font-medium mt-6 mb-3">Personal Information</h3>
      <p>
        We may collect personal information that you voluntarily provide to us when you:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Register for an account</li>
        <li>Fill out a form for a consultation</li>
        <li>Schedule an appointment</li>
        <li>Complete a survey or questionnaire</li>
        <li>Contact us with inquiries</li>
        <li>Provide medical information for treatment</li>
      </ul>
      <p>
        This information may include your name, email address, phone number, mailing address, date of birth, payment information, medical history, and other health-related information.
      </p>
      
      <h3 className="text-lg font-medium mt-6 mb-3">Survey and AI Recommendation Data</h3>
      <p>
        When you complete surveys on our website, we collect the responses you provide. This may include information about your preferences, health concerns, symptoms, and desired treatments. We use this information, along with artificial intelligence technology from OpenAI, to generate personalized product and treatment recommendations.
      </p>
      <p>
        Please note that when your survey data is processed by OpenAI:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>We share only the information necessary to generate appropriate recommendations</li>
        <li>Your personal identifiers (name, email, etc.) are not shared with OpenAI</li>
        <li>The data shared is subject to OpenAI's privacy practices and security measures</li>
        <li>The recommendations generated are reviewed by our healthcare providers before being presented to you</li>
      </ul>
      
      <h3 className="text-lg font-medium mt-6 mb-3">Automatically Collected Information</h3>
      <p>
        When you access our website or mobile application, we may automatically collect certain information about your device and usage patterns. This includes:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Device information (type of device, operating system, browser type)</li>
        <li>IP address</li>
        <li>Usage data (pages visited, time spent on pages, links clicked)</li>
        <li>Referral sources</li>
        <li>Location information (with your consent)</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
      <p>
        We may use the information we collect for various purposes, including:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Providing and managing your account</li>
        <li>Delivering telehealth services and medical consultations</li>
        <li>Processing and fulfilling orders for medications or treatments</li>
        <li>Generating personalized product and treatment recommendations</li>
        <li>Communicating with you about appointments, prescriptions, and follow-ups</li>
        <li>Sending you marketing communications (with your consent)</li>
        <li>Improving our website, products, and services</li>
        <li>Ensuring the security and integrity of our services</li>
        <li>Complying with legal obligations</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">4. Sharing Your Information</h2>
      <p>
        We may share your information in the following circumstances:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Healthcare Providers:</strong> Your information may be shared with healthcare providers who provide consultations and prescribe treatments.</li>
        <li><strong>Service Providers:</strong> We may share information with third-party vendors and service providers who perform services on our behalf, such as payment processing, data analysis, email delivery, hosting services, and customer service.</li>
        <li><strong>Analytics Partners:</strong> We use analytics providers to help us understand how users engage with our website.</li>
        <li><strong>AI Technology Partners:</strong> Anonymous survey data may be shared with OpenAI to generate personalized recommendations.</li>
        <li><strong>Compliance with Laws:</strong> We may disclose your information to comply with applicable laws and regulations, to respond to a subpoena, search warrant, or other lawful request for information we receive, or to otherwise protect our rights.</li>
        <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">5. HIPAA and Medical Information</h2>
      <p>
        As a healthcare provider, we comply with the Health Insurance Portability and Accountability Act (HIPAA). When applicable, your medical information is protected as Protected Health Information (PHI) under HIPAA. Please refer to our Notice of Privacy Practices for additional information about how medical information may be used and disclosed.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
      <p>
        Depending on your location, you may have certain rights regarding your personal information:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li><strong>Access:</strong> You may request access to the personal information we maintain about you.</li>
        <li><strong>Correction:</strong> You may request that we correct inaccurate or incomplete information.</li>
        <li><strong>Deletion:</strong> You may request deletion of your personal information, subject to certain exceptions.</li>
        <li><strong>Data Portability:</strong> You may request a copy of your information in a structured, commonly used format.</li>
        <li><strong>Opt-out:</strong> You can opt out of marketing communications at any time by clicking the "unsubscribe" link in our emails or contacting us directly.</li>
      </ul>
      <p>
        To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">7. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect the security of your personal information. However, please be aware that no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">8. Children's Privacy</h2>
      <p>
        Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to this Privacy Policy</h2>
      <p>
        We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. The updated version will be indicated by an updated "Last Updated" date. We encourage you to review this Privacy Policy frequently to stay informed about how we protect your information.
      </p>
      

    </LegalPageLayout>
  );
}