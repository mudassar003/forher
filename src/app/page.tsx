import Ticker from "../components/Ticker";

type TickerItem = {
  id: number;
  icon: JSX.Element; // Avoid using `any`
  text: string;
};


export default function HomePage() {
  return (
    <div>
      <Ticker />
      {/* Other sections of the homepage */}
    </div>
  );
}
