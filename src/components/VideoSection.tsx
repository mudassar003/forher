"use client";

import Image from "next/image";

export default function VideoSection() {
  return (
    <section className="w-full flex justify-center py-8 md:py-16" style={{ backgroundColor: "#F7F7F7" }}>
      {/* Inner Container */}
      <div 
        className="relative w-full max-w-5xl rounded-2xl p-4 md:p-12 flex flex-col items-center scale-[0.78] md:scale-100 origin-top"
        style={{ background: "linear-gradient(to bottom, #fe92b5, #fc4e87)" }}
      >
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-10" 
          style={{
            backgroundImage: "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "20px 20px"
          }}
        />
        
        {/* Top Heading - Adjusted for single line */}
        <h2 className="text-white text-[3.7rem] md:text-9xl font-normal text-center mb-3 md:mb-6 tracking-wide leading-[0.9] whitespace-nowrap z-10">
          Lose weight,
        </h2>

        {/* Video Container */}
        <div className="relative w-full max-w-[280px] md:max-w-[380px] h-[480px] md:h-[620px] -mt-2 md:-mt-2 z-10">
          <video
            className="w-full h-full rounded-2xl object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/videos/video.mp4" type="video/mp4" />
          </video>

          {/* Decorative shadows around video */}
          <div className="absolute inset-0 rounded-2xl shadow-xl"></div>
          <div className="absolute -inset-1 rounded-3xl blur-md opacity-30" style={{ background: "linear-gradient(45deg, #fc4e87, #fff)" }}></div>

          {/* Top Left Image */}
          <div className="absolute top-0 left-0 transform -translate-x-1/2 translate-y-1/4 scale-75 md:scale-100">
            <Image
              src="/images/hers_homepage_fsa_hsa_glp.webp"
              alt="Supplement"
              width={75}
              height={75}
              className="rounded-xl shadow-lg"
            />
          </div>

          {/* Bottom Right Image */}
          <div className="absolute bottom-0 right-0 transform translate-x-1/2 -translate-y-1/4 scale-75 md:scale-100">
            <Image
              src="/images/hers_homepage_fsa_hsa_protein.webp"
              alt="Protein Bar"
              width={75}
              height={75}
              className="rounded-xl shadow-lg"
            />
          </div>
        </div>

        {/* Text Section Below Video */}
        <div className="-mt-6 md:-mt-4 text-center z-10">
          <h3 className="text-white text-[3.2rem] md:text-8xl font-semibold mb-3 md:mb-4 tracking-wide">
            not strength
          </h3>
          <p className="text-white text-sm md:text-xl mb-4 md:mb-6 max-w-[90%] mx-auto leading-tight md:leading-normal">
            Healthy protein intake is essential for maintaining muscle, especially when
            taking a GLP-1. Protein shakes and bars formulated specifically for women
            taking weight loss medication is a doctor-trusted way to get the nutrition
            you need to maintain your hard-earned results.
          </p>
          <button 
            className="text-black px-6 py-2 md:px-8 md:py-4 rounded-full text-sm md:text-lg font-semibold shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: "white" }}
          >
            Get started
          </button>
        </div>
      </div>
    </section>
  );
}