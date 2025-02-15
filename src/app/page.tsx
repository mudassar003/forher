import Ticker from "../components/Ticker";
import RotatingHeadline from "@/components/RotatingHeadline";
import Categories from "@/components/Categories";


export default function HomePage() {
  return (
    <div>
      <Ticker />
      <RotatingHeadline />
      <Categories />
      {/* Other sections of the homepage */}
    </div>
  );
}
