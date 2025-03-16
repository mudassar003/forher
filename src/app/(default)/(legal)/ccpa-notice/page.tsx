//src/app/ccpa-notice/page.tsx
"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Link from "next/link";

// Define the form data interface
interface FormData {
  requestType: string;
  firstName: string;
  lastName: string;
  email: string;
  details: string;
  verification: boolean;
}

export default function CCPANotice(): JSX.Element {
  const [formData, setFormData] = useState<FormData>({
    requestType: "",
    firstName: "",
    lastName: "",
    email: "",
    details: "",
    verification: false
  });
  
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  
  // Handle form input changes
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };
  
  // Function to handle CCPA rights request form submission
  const handleRequestSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    setError("");
    
    // Simple validation
    if (!formData.requestType || !formData.firstName || !formData.lastName || !formData.email) {
      setError("Please fill in all required fields");
      return;
    }
    
    if (!formData.verification) {
      setError("You must verify that you are the consumer or an authorized representative");
      return;
    }
    
    // In a real implementation, you would send this data to your backend
    // For example:
    // fetch('/api/ccpa-request', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(formData)
    // })
    // .then(response => response.json())
    // .then(data => {
    //   setSubmitted(true);
    // })
    // .catch(error => {
    //   setError("There was an error submitting your request. Please try again.");
    // });
    
    // For demo purposes, just show success
    setSubmitted(true);
  };
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">California Consumer Privacy Act (CCPA) Notice</h1>
      
      <div className="prose max-w-none text-gray-700">
        <p className="text-lg">
          Last Updated: March 17, 2025
        </p>
        
        <p className="italic text-gray-600 mt-4 mb-8">
          This CCPA Notice applies only to California residents and supplements our Privacy Policy.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          This California Consumer Privacy Act ("CCPA") Notice supplements the Direct2Her Privacy Policy and applies solely to California residents. We adopt this notice to comply with the California Consumer Privacy Act of 2018 ("CCPA") and other applicable California privacy laws. Any terms defined in the CCPA have the same meaning when used in this notice.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        <p>
          We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device ("personal information").
        </p>
        <p>
          Within the last twelve (12) months, we have collected the following categories of personal information from consumers:
        </p>
        
        <div className="overflow-x-auto mt-6 mb-8">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-500">Category</th>
                <th className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-500">Examples</th>
                <th className="px-4 py-2 border border-gray-200 text-sm font-medium text-gray-500">Collected</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">A. Identifiers</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Name, email address, postal address, telephone number, IP address</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">B. Personal information categories listed in the California Customer Records statute</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Name, address, telephone number, credit card number, medical information, health insurance information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">C. Protected classification characteristics under California or federal law</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Age, gender</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">D. Commercial information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Products or services purchased, obtained, or considered</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">E. Biometric information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Genetic, physiological, behavioral, and biological characteristics</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">NO</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">F. Internet or other similar network activity</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Browsing history, search history, information on a consumer's interaction with a website, application, or advertisement</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">G. Geolocation data</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Physical location or movements</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">H. Sensory data</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Audio, electronic, visual, thermal, olfactory, or similar information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">NO</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">I. Professional or employment-related information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Current or past job history</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">NO</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">J. Non-public education information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Education records</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">NO</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">K. Inferences drawn from other personal information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Profile reflecting a person's preferences, characteristics, psychological trends, predispositions, behavior, attitudes, intelligence, abilities, and aptitudes</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
              <tr>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">L. Health information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">Medical history, conditions, treatments, medications, and healthcare provider information</td>
                <td className="px-4 py-2 border border-gray-200 text-sm text-gray-700">YES</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Personal Information Relating to Minors</h3>
        <p>
          Our Services are not intended for individuals under 18 years of age. We do not knowingly collect personal information from minors under 18. If we learn we have collected or received personal information from a minor under 18 without verification of parental consent, we will delete that information.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">3. Sources of Personal Information</h2>
        <p>
          We obtain the categories of personal information listed above from the following categories of sources:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Directly from you.</strong> For example, from forms you complete, products you purchase, survey responses, or information you provide for healthcare services.</li>
          <li><strong>Indirectly from you.</strong> For example, from observing your actions on our website or from information your computer or device sends us when you visit our website.</li>
          <li><strong>From service providers.</strong> For example, our payment processors, analytics providers, and advertising partners.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">4. Use of Personal Information</h2>
        <p>
          We may use or disclose the personal information we collect for one or more of the following business purposes:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>To provide you with telehealth services, including consultations, prescriptions, and ongoing care.</li>
          <li>To process your payments and fulfill your orders for products.</li>
          <li>To create, maintain, customize, and secure your account with us.</li>
          <li>To provide you with personalized product and treatment recommendations, including through the use of AI technology such as OpenAI.</li>
          <li>To provide you with support and to respond to your inquiries, including to investigate and address your concerns and monitor and improve our responses.</li>
          <li>To personalize your website experience and to deliver content and product and service offerings relevant to your interests.</li>
          <li>To help maintain the safety, security, and integrity of our Services, databases and other technology assets, and business.</li>
          <li>For testing, research, analysis, and product development, including to develop and improve our Services.</li>
          <li>To respond to law enforcement requests and as required by applicable law, court order, or governmental regulations.</li>
          <li>As described to you when collecting your personal information or as otherwise set forth in the CCPA.</li>
        </ul>
        <p>
          We will not collect additional categories of personal information or use the personal information we collected for materially different, unrelated, or incompatible purposes without providing you notice.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">5. Sharing Personal Information</h2>
        <p>
          We may disclose your personal information to a third party for a business purpose. When we disclose personal information for a business purpose, we enter a contract that describes the purpose and requires the recipient to both keep that personal information confidential and not use it for any purpose except performing the contract.
        </p>
        <p>
          In the past twelve (12) months, we have disclosed the following categories of personal information for a business purpose:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Category A: Identifiers</li>
          <li>Category B: California Customer Records personal information categories</li>
          <li>Category C: Protected classification characteristics under California or federal law</li>
          <li>Category D: Commercial information</li>
          <li>Category F: Internet or other similar network activity</li>
          <li>Category L: Health information</li>
        </ul>
        
        <p>
          We disclose your personal information for a business purpose to the following categories of third parties:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Our healthcare providers and affiliated medical professionals.</li>
          <li>Our service providers, such as payment processors, shipping companies, and customer service providers.</li>
          <li>AI technology providers (such as OpenAI) for generating personalized recommendations based on anonymized survey data.</li>
          <li>Analytics and advertising partners.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Sale of Personal Information</h3>
        <p>
          We do not sell personal information as the term "sell" is traditionally understood. However, if "sale" under the CCPA is defined broadly to include any arrangement where we share your data and receive something of value, this may include some of our marketing arrangements where we use cookies and similar technologies to deliver targeted advertising.
        </p>
        <p>
          In the past twelve (12) months, we have not "sold" personal information as defined under CCPA, other than potentially through the use of cookie-based analytics and advertising technologies as described in our Cookie Policy.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
        <p>
          The CCPA provides California residents with specific rights regarding their personal information. This section describes your CCPA rights and explains how to exercise those rights.
        </p>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Access to Specific Information and Data Portability Rights</h3>
        <p>
          You have the right to request that we disclose certain information to you about our collection and use of your personal information over the past 12 months. Once we receive and confirm your verifiable consumer request, we will disclose to you:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>The categories of personal information we collected about you.</li>
          <li>The categories of sources for the personal information we collected about you.</li>
          <li>Our business or commercial purpose for collecting or selling that personal information.</li>
          <li>The categories of third parties with whom we share that personal information.</li>
          <li>The specific pieces of personal information we collected about you.</li>
          <li>If we sold or disclosed your personal information for a business purpose, two separate lists disclosing:
            <ul className="list-disc pl-6 mt-2">
              <li>sales, identifying the personal information categories that each category of recipient purchased; and</li>
              <li>disclosures for a business purpose, identifying the personal information categories that each category of recipient obtained.</li>
            </ul>
          </li>
        </ul>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Deletion Request Rights</h3>
        <p>
          You have the right to request that we delete any of your personal information that we collected from you and retained, subject to certain exceptions. Once we receive and confirm your verifiable consumer request, we will delete (and direct our service providers to delete) your personal information from our records, unless an exception applies.
        </p>
        <p>
          We may deny your deletion request if retaining the information is necessary for us or our service provider(s) to:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Complete the transaction for which we collected the personal information, provide a good or service that you requested, take actions reasonably anticipated within the context of our ongoing business relationship with you, or otherwise perform our contract with you.</li>
          <li>Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity, or prosecute those responsible for such activities.</li>
          <li>Debug products to identify and repair errors that impair existing intended functionality.</li>
          <li>Exercise free speech, ensure the right of another consumer to exercise their free speech rights, or exercise another right provided for by law.</li>
          <li>Comply with the California Electronic Communications Privacy Act.</li>
          <li>Engage in public or peer-reviewed scientific, historical, or statistical research in the public interest that adheres to all other applicable ethics and privacy laws.</li>
          <li>Enable solely internal uses that are reasonably aligned with consumer expectations based on your relationship with us.</li>
          <li>Comply with a legal obligation.</li>
          <li>Make other internal and lawful uses of that information that are compatible with the context in which you provided it.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Exercising Access, Data Portability, and Deletion Rights</h3>
        <p>
          To exercise the access, data portability, and deletion rights described above, please submit a verifiable consumer request to us by:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Emailing us at privacy@direct2her.com</li>
          <li>Calling us at (555) 123-4567</li>
          <li>Completing the form below</li>
        </ul>
        
        {!submitted ? (
          <div className="mt-8 mb-10 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h4 className="text-lg font-medium mb-4 text-blue-800">Submit a CCPA Rights Request</h4>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            <form onSubmit={handleRequestSubmit} className="space-y-4">
              <div>
                <label htmlFor="requestType" className="block text-sm font-medium text-gray-700 mb-1">
                  Request Type<span className="text-red-500">*</span>
                </label>
                <select 
                  id="requestType" 
                  name="requestType" 
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  required
                  value={formData.requestType}
                  onChange={handleChange}
                >
                  <option value="">Select a request type</option>
                  <option value="access">Right to Know (Access)</option>
                  <option value="delete">Right to Delete</option>
                  <option value="portability">Data Portability</option>
                  <option value="opt-out">Opt-Out of Sale</option>
                </select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    id="firstName"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    id="lastName"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Must match the email associated with your Direct2Her account
                </p>
              </div>
              
              <div>
                <label htmlFor="details" className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Details
                </label>
                <textarea
                  id="details"
                  name="details"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border border-gray-300 rounded-md"
                  placeholder="Please provide any additional information about your request"
                  value={formData.details}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="verification"
                    name="verification"
                    type="checkbox"
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    required
                    checked={formData.verification}
                    onChange={handleChange}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="verification" className="font-medium text-gray-700">
                    I verify that I am the consumer to whom the personal information relates or an authorized representative<span className="text-red-500">*</span>
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="mt-8 mb-10 bg-green-50 p-6 rounded-lg border border-green-100 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-green-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h4 className="text-lg font-medium mb-2 text-green-800">Request Submitted Successfully</h4>
            <p className="text-green-700">
              Thank you for your submission. We will process your request and respond within 45 days as required by CCPA.
            </p>
            <button 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              onClick={() => setSubmitted(false)}
            >
              Submit Another Request
            </button>
          </div>
        )}
        
        <p>
          Only you, or a person registered with the California Secretary of State that you authorize to act on your behalf, may make a verifiable consumer request related to your personal information. You may also make a verifiable consumer request on behalf of your minor child.
        </p>
        <p>
          You may only make a verifiable consumer request for access or data portability twice within a 12-month period. The verifiable consumer request must:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Provide sufficient information that allows us to reasonably verify you are the person about whom we collected personal information or an authorized representative.</li>
          <li>Describe your request with sufficient detail that allows us to properly understand, evaluate, and respond to it.</li>
        </ul>
        <p>
          We cannot respond to your request or provide you with personal information if we cannot verify your identity or authority to make the request and confirm the personal information relates to you.
        </p>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Response Timing and Format</h3>
        <p>
          We endeavor to respond to a verifiable consumer request within forty-five (45) days of its receipt. If we require more time (up to 90 days), we will inform you of the reason and extension period in writing.
        </p>
        <p>
          We will deliver our written response by mail or electronically, at your option. Any disclosures we provide will only cover the 12-month period preceding the receipt of the verifiable consumer request. The response we provide will also explain the reasons we cannot comply with a request, if applicable.
        </p>
        <p>
          We do not charge a fee to process or respond to your verifiable consumer request unless it is excessive, repetitive, or manifestly unfounded. If we determine that the request warrants a fee, we will tell you why we made that decision and provide you with a cost estimate before completing your request.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Non-Discrimination</h2>
        <p>
          We will not discriminate against you for exercising any of your CCPA rights. Unless permitted by the CCPA, we will not:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Deny you goods or services.</li>
          <li>Charge you different prices or rates for goods or services, including through granting discounts or other benefits, or imposing penalties.</li>
          <li>Provide you a different level or quality of goods or services.</li>
          <li>Suggest that you may receive a different price or rate for goods or services or a different level or quality of goods or services.</li>
        </ul>
        <p>
          However, we may offer you certain financial incentives permitted by the CCPA that can result in different prices, rates, or quality levels. Any CCPA-permitted financial incentive we offer will reasonably relate to your personal information's value and contain written terms that describe the program's material aspects. Participation in a financial incentive program requires your prior opt in consent, which you may revoke at any time.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Other California Privacy Rights</h2>
        <p>
          California's "Shine the Light" law (Civil Code Section § 1798.83) permits users of our website that are California residents to request certain information regarding our disclosure of personal information to third parties for their direct marketing purposes. To make such a request, please send an email to privacy@direct2her.com or write to us at: Direct2Her, 123 Healthcare Ave, Suite 100, San Francisco, CA 94107.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">9. Changes to Our CCPA Privacy Notice</h2>
        <p>
          We reserve the right to amend this privacy notice at our discretion and at any time. When we make changes to this privacy notice, we will post the updated notice on our website and update the notice's effective date. Your continued use of our Services following the posting of changes constitutes your acceptance of such changes.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">10. Contact Information</h2>
        <p>
          If you have any questions or comments about this notice, the ways in which Direct2Her collects and uses your information, your choices and rights regarding such use, or wish to exercise your rights under California law, please do not hesitate to contact us at:
        </p>
        <p className="mb-8">
          Direct2Her<br />
          Email: privacy@direct2her.com<br />
          Phone: (555) 123-4567<br />
          Address: 123 Healthcare Ave, Suite 100, San Francisco, CA 94107
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Additional Information Regarding AI and Survey Data</h2>
        <p>
          As part of our services, we collect survey data to provide personalized product recommendations using OpenAI's technology. In accordance with CCPA, we want to provide additional transparency about this process:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Data Collection and Processing:</strong> When you complete a survey on our platform, your responses are collected and may be processed using OpenAI's technology to generate personalized product and treatment recommendations.</li>
          <li><strong>Data Minimization:</strong> We only share survey data necessary for generating appropriate recommendations and do not include personal identifiers (such as your name, email address, or account information) when processing your data with OpenAI.</li>
          <li><strong>Review Process:</strong> All AI-generated recommendations are reviewed by our licensed healthcare providers before being presented to you.</li>
          <li><strong>Your Rights:</strong> All survey data is subject to the same CCPA rights outlined in this notice, including your right to access, delete, and opt-out of the sale of your personal information.</li>
        </ul>
        
        <div className="mt-12 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-medium mb-4">Related Policies</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/privacy-policy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link href="/terms-of-service" className="text-blue-600 hover:underline">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link href="/cookie-policy" className="text-blue-600 hover:underline">
                Cookie Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}