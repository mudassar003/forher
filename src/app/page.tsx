import Ticker from "../components/Ticker";
import RotatingHeadline from "@/components/RotatingHeadline";


export default function HomePage() {
  return (
    <div>
      <Ticker />
      <RotatingHeadline />
      {/* Other sections of the homepage */}
    </div>
  );
}
