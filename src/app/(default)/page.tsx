// src/app/(default)/page.tsx
import RotatingHeadline from "@/components/RotatingHeadline";
import RotatingSection from "@/components/RotatingSection";
import FaqAccordion from "@/components/FaqAccordion";
// import SubscribeSection from "@/components/SubscribeSection";
import HowItWorks from "@/components/HowItWorks";
import NewHairLossSection from "@/components/NewHairLossSection";
// import Packages from "@/components/Packages";

export default function HomePage() {
  return (
    <main>
      <div>
        <RotatingHeadline />
        <HowItWorks />
        <RotatingSection />
        <NewHairLossSection />
        <FaqAccordion />
       
      </div>
    </main>
  );
}