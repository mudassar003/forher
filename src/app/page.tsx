import Ticker from "../components/Ticker";
import RotatingHeadline from "@/components/RotatingHeadline";
import Categories from "@/components/Categories";
import RotatingSection from "@/components/RotatingSection";
import VideoSection from "@/components/VideoSection";
import HairLoss from "@/components/HairLoss";
import HairRegrowCard from "@/components/HairRegrowCard";



export default function HomePage() {
  return (
    <div>
      <Ticker />
      <RotatingHeadline />
      <Categories />
      <RotatingSection />
      <VideoSection />
      <HairLoss />
      <HairRegrowCard />

      {/* Other sections of the homepage */}
    </div>
  );
}
