// src/app/(default)/page.tsx
import RotatingHeadline from "@/components/RotatingHeadline";
import RotatingSection from "@/components/RotatingSection";
import FaqAccordion from "@/components/FaqAccordion";
import SubscribeSection from "@/components/SubscribeSection";
import HowItWorks from "@/components/HowItWorks";
import NewHairLossSection from "@/components/NewHairLossSection";
import Packages from "@/components/Packages";

export default function HomePage() {
  return (
    <main>
      <div>
        <RotatingHeadline />
        <HowItWorks />
        <RotatingSection />
        
        {/* Adding the Packages component with custom heading */}
        <div className="bg-gradient-to-b from-white to-gray-50">
          <div className="py-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-normal mb-4" style={{ color: "#e63946" }}>
                Our Weight Loss Programs
              </h2>
              <p className="text-gray-600 text-lg sm:text-xl max-w-3xl mx-auto">
                Choose from our all-inclusive or prescription-only options
              </p>
            </div>
            {/* Use the Packages component with showHeading=false to avoid duplicate headings */}
            <Packages showHeading={false} />
          </div>
        </div>
        
        <NewHairLossSection />
        <FaqAccordion />
        <SubscribeSection />
      </div>
    </main>
  );
}