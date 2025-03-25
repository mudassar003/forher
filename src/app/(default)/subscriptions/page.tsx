// src/app/subscriptions/page.tsx
import SubscriptionGrid from '@/components/Subscription/SubscriptionGrid';

export const metadata = {
  title: 'Subscription Plans',
  description: 'Choose a subscription plan that best fits your needs',
};

export default function SubscriptionsPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl mb-4">
            Subscription Plans
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500">
            Choose a subscription plan that best fits your needs and enjoy exclusive benefits
          </p>
        </div>
        
        <div className="bg-white shadow-sm rounded-lg overflow-hidden mb-12">
          <div className="px-6 py-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Why Subscribe?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.5H22" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 16.5H8" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 16.5H14.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-1">Save 15%</h3>
                  <p className="text-sm text-gray-600">Subscribers save 15% on all treatments and products</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-1">Priority Appointments</h3>
                  <p className="text-sm text-gray-600">Get priority scheduling for telehealth consultations</p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-pink-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-medium text-gray-800 mb-1">Personalized Care</h3>
                  <p className="text-sm text-gray-600">Receive customized wellness plans and recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <SubscriptionGrid />
        
        <div className="bg-indigo-50 rounded-lg p-6 mt-12">
          <h2 className="text-xl font-bold text-indigo-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-medium text-indigo-800">How do subscriptions work?</h3>
              <p className="mt-2 text-sm text-indigo-700">
                Our subscriptions are charged on a recurring basis according to the plan you choose. You can cancel at any time through your account dashboard.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">Can I change my subscription plan?</h3>
              <p className="mt-2 text-sm text-indigo-700">
                Yes, you can upgrade or downgrade your subscription at any time. Changes will be applied at the start of the next billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">What happens to my appointment access if I cancel?</h3>
              <p className="mt-2 text-sm text-indigo-700">
                You'll maintain access to the telehealth platform until the end of your current billing period. After that, you'll need to purchase individual appointments.
              </p>
            </div>
            <div>
              <h3 className="text-base font-medium text-indigo-800">Are there any refunds if I cancel early?</h3>
              <p className="mt-2 text-sm text-indigo-700">
                We do not provide prorated refunds for cancellations mid-cycle. Your subscription will remain active until the end of the current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}