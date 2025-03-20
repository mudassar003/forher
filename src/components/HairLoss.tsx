"use client";

// import Image from "next/image";

export default function HairLoss() {
  return (
    <section
      className="relative max-w-full h-[70vh] flex flex-col items-center justify-between bg-cover bg-center text-white rounded-t-2xl overflow-hidden"
      style={{ backgroundImage: "url('/images/picture3.png')" }}
    >
      {/* Headings */}
      <div className="absolute top-[5%] text-center px-4 md:px-0">
        <h1 className="text-xl md:text-4xl font-semibold leading-tight">
          Grow hair like 
        </h1>
        <h2 className="text-xl md:text-4xl font-semibold leading-tight">
          never before
        </h2>
      </div>



      {/* Buttons */}
      <div className="absolute bottom-[5%] flex gap-4 w-full max-w-xs md:max-w-md">
        <button className="w-1/2 py-3 text-black bg-white rounded-full font-semibold shadow-md transition hover:bg-gray-200 text-xs md:text-sm">
          Get started
        </button>
        <button className="w-1/2 py-3 bg-gray-400 text-white rounded-full font-semibold shadow-md transition text-xs md:text-sm">
          See if I&apos;m eligible
        </button>
      </div>
    </section>
  );
}
