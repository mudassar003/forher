"use client"; // Enables state handling

import { useState } from "react";
import Image from "next/image";

const testimonials = [
  {
    text: "I felt so much relief, and stopped worrying so much about how my hair looked and began to feel confident that I was no longer going bald. Hers ‘had’ me. I knew I could relax.",
    name: "Danielle, 47",
    duration: "4 months",
    product: "Hair Vitamins + Minoxidil",
    image: "/images/Kimberly_WL.webp",
  },
  {
    text: "I was skeptical at first, but after just a few months, I saw significant regrowth! My confidence is back, and I couldn’t be happier.",
    name: "Emily, 35",
    duration: "3 months",
    product: "Minoxidil + Biotin",
    image: "/images/Kimberly_WL.webp",
  },
];

const HairRegrowCard = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) =>
      prev === 0 ? testimonials.length - 1 : prev - 1
    );
  };

  return (
    <div className="bg-[#f96897] min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-[400px_minmax(0,1fr)] gap-4">
        {/* Left Column - First Two Sections */}
        <div className="flex flex-col space-y-6">
          {/* First Section */}
          <div className="relative w-full h-[400px] rounded-2xl bg-white/10 backdrop-blur-md shadow-lg overflow-hidden">
            <Image
              src="/images/Regrow_Hair.webp"
              alt="Regrow Hair"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute top-6 left-6 text-white font-semibold text-lg max-w-[60%]">
              <p>Regrow hair in</p>
              <p>3–6 months with</p>
              <p className="font-bold">Minoxidil</p>
            </div>
            <button className="absolute bottom-6 right-6 bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md">
              Get started
            </button>
          </div>

          {/* Second Section */}
          <div className="relative w-full h-[400px] rounded-2xl shadow-lg overflow-hidden">
            <Image
              src="/images/hair_goals.webp"
              alt="Hair Goals"
              layout="fill"
              objectFit="cover"
            />
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="absolute top-6 left-6 text-white font-semibold text-lg">
              <p>What are your</p>
              <p>hair goals?</p>
            </div>
            <div className="absolute bottom-6 right-6 flex flex-col space-y-2">
              <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md">
                Stop thinning or shedding
              </button>
              <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md">
                Regrow thicker, fuller hair
              </button>
              <button className="bg-white/30 text-white px-5 py-2 rounded-full backdrop-blur-lg shadow-md">
                All the above
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Testimonial Section */}
        <div className="relative w-full h-[820px] rounded-2xl bg-white/10 backdrop-blur-md shadow-lg p-8 text-white overflow-hidden flex flex-col justify-between">
          {/* Rotating Image at Top Left */}
          <div className="absolute top-8 left-8 animate-spin-slow">
            <Image
              src="/images/tablet.webp"
              alt="Tablet"
              width={150}
              height={150}
              className="rounded-lg"
            />
          </div>

          {/* Testimonial Quote and Image */}
          <div className="flex flex-col items-center justify-center mt-32">
            <p className="text-2xl italic font-medium leading-relaxed max-w-md text-center">
              “<span className="font-bold">{testimonials[currentTestimonial].text}</span>”
            </p>
            <div className="flex justify-center mt-6">
              <Image
                src={testimonials[currentTestimonial].image}
                alt="Before and After"
                width={200}
                height={200}
                className="rounded-lg"
              />
            </div>
          </div>

          {/* Testimonial Info in Bottom Left */}
          <div className="absolute bottom-24 left-8 text-left">
            <p className="text-lg font-semibold">
              {testimonials[currentTestimonial].name}
            </p>
            <p className="text-md">{testimonials[currentTestimonial].duration}</p>
            <p className="text-md">{testimonials[currentTestimonial].product}</p>
          </div>

          {/* Carousel Dots in Bottom Left */}
          <div className="absolute bottom-8 left-8 flex space-x-2">
            {testimonials.map((_, index) => (
              <span
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentTestimonial ? "bg-white" : "bg-white/50"
                }`}
              ></span>
            ))}
          </div>

          {/* Get Results Button in Bottom Right */}
          <button className="absolute bottom-8 right-8 bg-white text-[#464E3D] px-6 py-3 rounded-full shadow-md">
            Get results
          </button>

          {/* Manual Navigation Arrows */}
          <button
            onClick={prevTestimonial}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 rounded-full"
          >
            ←
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-white/20 rounded-full"
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
};

export default HairRegrowCard;
