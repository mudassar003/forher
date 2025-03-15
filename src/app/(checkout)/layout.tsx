// src/app/(default)/layout.tsx
import Ticker from "@/components/Ticker";
import HomeHeader from "@/components/HomeHeader";
import GlobalFooter from "@/components/GlobalFooter";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
    
      <HomeHeader />
      <main>{children}</main>
      
    </>
  );
}