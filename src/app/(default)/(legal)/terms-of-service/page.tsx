// src/app/(default)/(legal)/terms-of-service/page.tsx
"use client";

import LegalPageLayout from '@/components/legal/LegalPageLayout';

export default function TermsOfService() {
  return (
    <LegalPageLayout 
      title="Terms of Service" 
      lastUpdated="March 17, 2025"
    >
      <p className="text-sm text-gray-500 italic mt-2 mb-6">
        PLEASE READ THESE TERMS OF SERVICE CAREFULLY. BY ACCESSING OR USING OUR SERVICES, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND ALL TERMS INCORPORATED BY REFERENCE.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
      <p>
        These Terms of Service ("Terms") govern your access to and use of the Lily&apos;s website, mobile application, and telehealth services (collectively, the "Services"). These Terms constitute a legally binding agreement between you and Lily&apos;s ("we," "our," or "us"). By accessing or using our Services, you acknowledge that you have read, understood, and agree to be bound by these Terms.
      </p>
      <p>
        If you do not agree to these Terms, you must not access or use our Services.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">2. Eligibility</h2>
      <p>
        You must be at least 18 years old to use our Services. By using our Services, you represent and warrant that:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>You are at least 18 years old;</li>
        <li>You have the legal capacity to enter into a binding agreement;</li>
        <li>You are using our Services for yourself or are authorized to act on behalf of the person for whom you are using the Services;</li>
        <li>You are a resident of the United States and accessing our Services from a state where we are authorized to provide telehealth services;</li>
        <li>You will comply with these Terms and all applicable local, state, and federal laws and regulations.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">3. Medical Services and Telehealth</h2>
      <p>
        <strong>Not Medical Advice:</strong> The information provided through our Services is for informational purposes only and is not intended as a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
      </p>
      <p>
        <strong>Telehealth Consultations:</strong> Our Services include telehealth consultations with licensed healthcare providers. These providers will make their own independent judgment about whether the requested services are appropriate for you based on the information you provide.
      </p>
      <p>
        <strong>Prescription Medications:</strong> If a healthcare provider prescribes medication through our Services, you agree to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Provide accurate and complete information about your medical history, medications, allergies, and other relevant health information;</li>
        <li>Follow all instructions regarding the use of prescribed medications;</li>
        <li>Report any adverse effects or concerns to your healthcare provider immediately;</li>
        <li>Understand that not all conditions can be treated through telehealth, and you may be referred to an in-person consultation if appropriate.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">4. Account Registration and Security</h2>
      <p>
        To access certain features of our Services, you may need to create an account. When you register, you agree to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Provide accurate, current, and complete information;</li>
        <li>Maintain and promptly update your account information;</li>
        <li>Keep your password secure and confidential;</li>
        <li>Notify us immediately of any unauthorized access to your account;</li>
        <li>Take responsibility for all activities that occur under your account.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">5. User Content and Surveys</h2>
      <p>
        Our Services may allow you to submit information, including responses to surveys and questionnaires ("User Content"). By submitting User Content, you grant us a non-exclusive, transferable, sublicensable, royalty-free, worldwide license to use, store, display, reproduce, modify, and distribute your User Content for the purpose of providing our Services.
      </p>
      <p>
        <strong>AI-Generated Recommendations:</strong> When you complete surveys on our platform, we may process your responses using artificial intelligence technology (including OpenAI) to generate personalized product and treatment recommendations. By submitting survey responses, you:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Consent to our use of AI technology to process your responses;</li>
        <li>Understand that recommendations are generated algorithmically and are subject to review by our healthcare providers;</li>
        <li>Acknowledge that AI-generated recommendations do not constitute medical advice without review and approval by a licensed healthcare provider;</li>
        <li>Accept that the quality of recommendations depends on the accuracy and completeness of the information you provide.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">6. Prohibited Activities</h2>
      <p>
        You agree not to engage in any of the following activities:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Violating any applicable law, regulation, or these Terms;</li>
        <li>Providing false or misleading information;</li>
        <li>Impersonating another person or entity;</li>
        <li>Attempting to obtain prescriptions for other individuals;</li>
        <li>Attempting to bypass any security measures or access restricted areas;</li>
        <li>Using our Services for any unauthorized or illegal purpose;</li>
        <li>Interfering with or disrupting our Services or servers;</li>
        <li>Reverse engineering or attempting to extract the source code of our software;</li>
        <li>Submitting or transmitting harmful code, viruses, or other destructive content;</li>
        <li>Collecting or harvesting information about other users.</li>
      </ul>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
      <p>
        All content, features, and functionality on our Services, including but not limited to text, graphics, logos, icons, images, audio clips, digital downloads, data compilations, and software, are owned by Lily&apos;s, our licensors, or other providers of such material and are protected by United States and international copyright, trademark, patent, trade secret, and other intellectual property or proprietary rights laws.
      </p>
      <p>
        These Terms do not grant you any right, title, or interest in our Services or any content, features, or functionality offered through our Services.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">8. Disclaimer of Warranties</h2>
      <p>
        YOUR USE OF OUR SERVICES IS AT YOUR SOLE RISK. OUR SERVICES ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
      </p>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
      </p>
      <p>
        WE DO NOT WARRANT THAT OUR SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE, THAT DEFECTS WILL BE CORRECTED, OR THAT OUR SERVICES OR THE SERVER THAT MAKES THEM AVAILABLE ARE FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">9. Limitation of Liability</h2>
      <p>
        TO THE FULLEST EXTENT PERMITTED BY LAW, IN NO EVENT SHALL Lily&apos;s, ITS AFFILIATES, SERVICE PROVIDERS, EMPLOYEES, AGENTS, OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OR INABILITY TO USE OUR SERVICES, ANY WEBSITES LINKED TO THEM, ANY CONTENT ON OUR SERVICES OR SUCH OTHER WEBSITES, INCLUDING ANY DIRECT, INDIRECT, SPECIAL, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">10. Indemnification</h2>
      <p>
        You agree to defend, indemnify, and hold harmless Lily&apos;s, its affiliates, licensors, and service providers, and its and their respective officers, directors, employees, contractors, agents, licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms or your use of our Services.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">11. Governing Law and Jurisdiction</h2>
      <p>
        These Terms shall be governed by and construed in accordance with the laws of the State of California, without giving effect to any principles of conflicts of law. Any action arising out of or relating to these Terms or our Services shall be filed only in the state or federal courts located in San Francisco County, California, and you consent to the exclusive jurisdiction and venue of such courts.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">12. Changes to These Terms</h2>
      <p>
        We may revise these Terms from time to time. The most current version will always be posted on our website. If a revision is material, we will provide notice prior to the new terms taking effect. By continuing to access or use our Services after revisions become effective, you agree to be bound by the revised Terms.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">13. Termination</h2>
      <p>
        We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use our Services will immediately cease.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">14. Severability</h2>
      <p>
        If any provision of these Terms is held to be invalid, illegal, or unenforceable, the remaining provisions shall continue in full force and effect.
      </p>
      
      <h2 className="text-xl font-semibold mt-8 mb-4">15. Entire Agreement</h2>
      <p>
        These Terms, together with our Privacy Policy, Cookie Policy, and any other agreements expressly incorporated by reference herein, constitute the entire agreement between you and Lily&apos;s concerning our Services.
      </p>
      
  
    </LegalPageLayout>
  );
}