// src/app/(default)/packages/page.tsx
import FaqAccordion from "@/components/FaqAccordion";
import Packages from "@/components/Packages";

export const metadata = {
  title: "Weight Loss Packages | Sesame",
  description: "Choose from our weight loss program options including compounded semaglutide and prescription GLP-1 medications."
};

export default function PackagesPage() {
  return (
    <main>
      <div className="bg-white">
        {/* Hero Section */}
        <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 text-center">
          <h1 
            className="text-4xl sm:text-5xl md:text-6xl font-normal mb-6"
            style={{ color: "#e63946" }}
          >
            Weight Loss Programs
          </h1>
          <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto mb-8">
            Personalized care with medication options to help you achieve sustainable weight loss
          </p>
          
          {/* Wave transition */}
          <div className="relative w-full overflow-hidden leading-[0] h-16 sm:h-24">
            <svg 
              className="absolute bottom-0 left-0 w-full" 
              viewBox="0 0 1200 120" 
              preserveAspectRatio="none"
            >
              <path 
                d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V0C15,10.18,36.88,20.62,58.94,31.06,108.88,52.93,163.34,71.36,216,87.57,281.12,107.36,345.66,119.57,411,119.22Z" 
                className="fill-gray-50"
                style={{
                  filter: "drop-shadow(0px -2px 3px rgba(230, 57, 70, 0.1))"
                }}
              ></path>
            </svg>
          </div>
        </section>
        
        {/* Packages Component */}
        <Packages />
        
        {/* How it Works Section */}
        <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 
              className="text-3xl sm:text-4xl font-normal mb-12 text-center"
              style={{ color: "#e63946" }}
            >
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "1",
                  title: "Choose your plan",
                  description: "Select the plan that fits your needs and budget, with or without medication included."
                },
                {
                  step: "2",
                  title: "Complete assessment",
                  description: "Tell us about your health history and weight loss goals through our simple assessment."
                },
                {
                  step: "3",
                  title: "Connect with provider",
                  description: "Meet with your provider via video to discuss your personalized weight loss plan."
                }
              ].map((item, index) => (
                <div key={index} className="text-center p-6">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-medium"
                    style={{ background: "linear-gradient(90deg, #e63946 0%, #ff4d6d 100%)" }}
                  >
                    {item.step}
                  </div>
                  <h3 className="text-xl font-medium mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <section className="py-16 px-4 sm:px-6 md:px-12 lg:px-24 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 
              className="text-3xl sm:text-4xl font-normal mb-12 text-center"
              style={{ color: "#e63946" }}
            >
              Frequently Asked Questions
            </h2>
            
            <FaqAccordion />
          </div>
        </section>
      </div>
    </main>
  );
}