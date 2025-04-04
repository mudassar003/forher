// src/app/(default)/layout.tsx
import Ticker from "@/components/Ticker";
import HomeHeader from "@/components/HomeHeader";
import GlobalFooter from "@/components/GlobalFooter";
import AuthProvider from "@/components/Auth/AuthProvider";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <Ticker />
      <HomeHeader />
      <main>{children}</main>
      <GlobalFooter />
    </AuthProvider>
  );
}