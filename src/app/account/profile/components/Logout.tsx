"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

const LogoutPage = () => {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut();
    router.push("/"); // Redirect to login after logout
  };

  return (
    <div className=" rounded-lg p-6  mt-10">
      <button
        onClick={handleLogout}
        className="bg-black text-white text-lg font-semibold px-6 py-3 rounded-full transition hover:opacity-90 flex justify-between items-center"
      >
        Logout
      </button>
    </div>
  );
};

export default LogoutPage;
