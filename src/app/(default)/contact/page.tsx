// src/app/(default)/contact/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '@/components/PageHeader';

// Define metadata for SEO
export const metadata: Metadata = {
  title: 'Contact Us | Lily\'s',
  description: 'Get in touch with our team for inquiries, support, or to schedule an appointment.',
};

// Define types for our form fields
interface ContactFormField {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  required: boolean;
}

export default function ContactPage() {
  // Define form fields with proper typing
  const formFields: ContactFormField[] = [
    {
      id: 'name',
      label: 'Your Name',
      type: 'text',
      placeholder: 'Jane Doe',
      required: true
    },
    {
      id: 'email',
      label: 'Email Address',
      type: 'email',
      placeholder: 'jane@example.com',
      required: true
    },
    {
      id: 'subject',
      label: 'Subject',
      type: 'text',
      placeholder: 'How can we help you?',
      required: true
    }
  ];

  return (
    <div className="bg-white">
      {/* Using our reusable PageHeader component */}
      <PageHeader 
        title="Get in Touch"
        subtitle="Have questions or need support? 
         We're here to help. Send us a message or give us a call."
      />

      {/* Main content with white background */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-16">
            {/* Contact Form */}
            <div className="md:col-span-3 bg-white p-8 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Send Us a Message</h2>
              
              <form className="space-y-6">
                {formFields.map((field) => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      id={field.id}
                      name={field.id}
                      required={field.required}
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    required
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:outline-none"
                    placeholder="Tell us more about your inquiry..."
                  ></textarea>
                </div>

                <div>
                  <button
                    type="submit"
                    className="w-full px-6 py-3 bg-[#fc4e87] hover:bg-pink-600 text-white font-medium rounded-md transition-colors"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>

            {/* Contact Information */}
            <div className="md:col-span-2">
              <div className="bg-pink-50 p-8 rounded-lg shadow-sm border border-pink-100 mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Contact Information</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Email</h3>
                      <p className="mt-1 text-gray-600">cole@lilyswomenshealth.com</p>
                      <p className="mt-1 text-sm text-gray-500">We usually respond within 24 hours</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Phone</h3>
                      <p className="mt-1 text-gray-600">682-386-7827</p>
                      <p className="mt-1 text-sm text-gray-500">Available during business hours</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <svg className="h-5 w-5 text-[#fc4e87]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">Hours</h3>
                      <p className="mt-1 text-gray-600">Every day: 8AM - 9PM CST</p>
                      <p className="mt-0.5 text-gray-600">7 days a week, 365 days a year</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-lg shadow-sm border border-blue-100">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Need immediate assistance?</h3>
                <p className="text-gray-600 mb-6">
                  For urgent matters, you can schedule a telehealth consultation with one of our providers.
                </p>
                <Link 
                  href="/subscriptions" 
                  className="inline-block bg-[#fc4e87] text-white px-6 py-2 rounded-md font-medium hover:bg-pink-600 transition-colors"
                >
                  Book a Consultation
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-gray-50 rounded-lg p-8 mb-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Frequently Asked Questions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  How quickly can I get an appointment?
                </h3>
                <p className="text-gray-600">
                  During 8AM-9PM CST an appointment can be made <strong>instantly</strong>, 7 days a week, 365 days a year.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  How do telehealth appointments work?
                </h3>
                <p className="text-gray-600">
                  A customer creates an appointment for a Good Faith Exam. Good Faith Exams are simple and can take only 10 minutes. A licensed provider will review medical history, assess current goals and symptoms, take some health screening questions, and make a medical judgment for the patient. That's it!
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  What insurance do you accept?
                </h3>
                <p className="text-gray-600">
                  We do not take insurance, we are a cash only business.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  How can I refill my prescription?
                </h3>
                <p className="text-gray-600">
                  Refills come on a monthly basis. In order to have your next month's order shipped, a check-in telehealth consultation is required. Once check-in is done, the next month's prescription will be sent.
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter Signup */}
          <div className="bg-pink-50 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Stay Updated
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 mb-6">
              Subscribe to our newsletter for health tips, new services, and special offers.
            </p>
            
            <form className="max-w-md mx-auto flex">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow p-3 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                required
              />
              <button
                type="submit"
                className="bg-[#fc4e87] text-white px-6 py-3 rounded-r-md font-medium hover:bg-pink-600 transition-colors"
              >
                Subscribe
              </button>
            </form>
            
            <p className="text-xs text-gray-500 mt-4">
              By subscribing, you agree to receive our marketing emails. You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}