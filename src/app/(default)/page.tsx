// import Ticker from "../components/Ticker";
import RotatingHeadline from "@/components/RotatingHeadline";
import Categories from "@/components/Categories";
import RotatingSection from "@/components/RotatingSection";
import VideoSection from "@/components/VideoSection";
import HairLoss from "@/components/HairLoss";
import HairRegrowCard from "@/components/HairRegrowCard";
import FaqAccordion from "@/components/FaqAccordion";
// import HomeHeader from "@/components/HomeHeader";
import SubscribeSection from "@/components/SubscribeSection";




export default function HomePage() {
  return (
    <main>
      <div>
        <RotatingHeadline />
        <Categories />
        <RotatingSection />
        <VideoSection />
        <HairLoss />
        <HairRegrowCard />
        <FaqAccordion />
        <SubscribeSection />

        {/* Other sections of the homepage */}
      </div>
    </main>
  );
}

