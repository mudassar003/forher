//src/app/(default)/(legal)/ccpa-notice/page.tsx
"use client";

import Link from "next/link";

export default function CCPANotice() {
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
        
        <h2 className="text-xl font-semibold mt-8 mb-4">6. Your Rights and Choices</h2>
        <p>
          The CCPA provides California residents with specific rights regarding their personal information. This section describes your CCPA rights and explains how to exercise those rights.
        </p>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Your CCPA Rights</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Right to Know:</strong> You have the right to request information about the personal information we collect, use, and disclose.</li>
          <li><strong>Right to Delete:</strong> You have the right to request deletion of personal information we have collected from you.</li>
          <li><strong>Right to Non-Discrimination:</strong> You have the right not to be discriminated against for exercising your CCPA rights.</li>
        </ul>
        
        <h3 className="text-lg font-medium mt-6 mb-3">How to Exercise Your Rights</h3>
        <p>
          To exercise your rights under the CCPA, please contact us using one of the following methods:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Email: <a href="mailto:privacy@direct2her.com" className="text-blue-600 hover:underline">privacy@direct2her.com</a></li>
          <li>Phone: (555) 123-4567</li>
        </ul>
        
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mt-8 mb-8">
          <h3 className="text-lg font-medium mb-3 text-blue-800">CCPA Rights Request</h3>
          <p className="mb-4">To submit a request to know what personal information we have about you or to delete your personal information, please contact our privacy team.</p>
          <a 
            href="mailto:privacy@direct2her.com" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Email Privacy Team
          </a>
        </div>
        
        <h3 className="text-lg font-medium mt-6 mb-3">Response Timing and Format</h3>
        <p>
          We endeavor to respond to a verifiable consumer request within forty-five (45) days of its receipt. If we require more time (up to 90 days), we will inform you of the reason and extension period in writing.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">7. Non-Discrimination</h2>
        <p>
          We will not discriminate against you for exercising any of your CCPA rights. We will not:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Deny you goods or services.</li>
          <li>Charge you different prices or rates for goods or services, including through granting discounts or other benefits, or imposing penalties.</li>
          <li>Provide you a different level or quality of goods or services.</li>
          <li>Suggest that you may receive a different price or rate for goods or services or a different level or quality of goods or services.</li>
        </ul>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">8. Changes to Our CCPA Privacy Notice</h2>
        <p>
          We reserve the right to amend this privacy notice at our discretion and at any time. When we make changes to this privacy notice, we will post the updated notice on our website and update the notice's effective date. Your continued use of our Services following the posting of changes constitutes your acceptance of such changes.
        </p>
        
        <h2 className="text-xl font-semibold mt-8 mb-4">9. Contact Information</h2>
        <p>
          If you have any questions or comments about this notice, the ways in which Direct2Her collects and uses your information, your choices and rights regarding such use, or wish to exercise your rights under California law, please do not hesitate to contact us at:
        </p>
        <p className="mb-8">
          Direct2Her<br />
          Email: <a href="mailto:privacy@direct2her.com" className="text-blue-600 hover:underline">privacy@direct2her.com</a><br />
          Phone: (555) 123-4567<br />
          Address: 123 Healthcare Ave, Suite 100, San Francisco, CA 94107
        </p>
        
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