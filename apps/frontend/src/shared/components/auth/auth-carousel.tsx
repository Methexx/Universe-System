'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const slides = [
  {
    title: "Command Your Skies with Confidence",
    subtitle: "From fleet monitoring to mission control — AeroPanel simplifies every detail",
    image: "/dashboard-mockup.png",
    quote: '"From tracking to reporting, AeroPanel simplifies it all. Game-changer for our workflow"',
    author: "— Rama, Ops Lead at SkyFleet"
  },
  {
    title: "Real-time Tracking & Analytics",
    subtitle: "Monitor your entire drone fleet's performance and location in real-time",
    image: "/dashboard-mockup-2.png",
    quote: '"We reduced our mission planning time by 40% using the advanced tracking features."',
    author: "— Sarah, Head of Operations"
  },
  {
    title: "Automated Mission Planning",
    subtitle: "Schedule and dispatch drones automatically with intelligent routing",
    image: "/dashboard-mockup-3.png",
    quote: '"AeroPanel took our delivery efficiency to the next level. Seamless integration."',
    author: "— David, Logistics Director"
  }
];

export function AuthCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full h-full bg-[#2563eb] rounded-[24px] flex flex-col justify-between p-10 text-white overflow-hidden relative shadow-lg">
      <style>{`
        @keyframes customFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .slide-animate {
          animation: customFadeIn 0.6s ease-out forwards;
        }
      `}</style>

      {/* Abstract grid background */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:60px_60px] -translate-y-4"></div>

      <div key={`title-${currentSlide}`} className="relative z-10 max-w-lg mt-2 shrink-0 slide-animate">
        <h2 className="text-[32px] font-semibold mb-3 leading-tight">{slides[currentSlide].title}</h2>
        <p className="text-blue-100/90 text-base font-light">
          {slides[currentSlide].subtitle}
        </p>
      </div>

      <div key={`img-${currentSlide}`} className="relative z-10 my-4 flex-1 flex items-center justify-center pointer-events-none min-h-0 slide-animate">
        <Image 
          src={slides[currentSlide].image} 
          alt={slides[currentSlide].title} 
          width={680} 
          height={450} 
          className="rounded-xl shadow-2xl object-contain drop-shadow-2xl max-h-full w-auto"
          priority
        />
      </div>

      <div className="relative z-10 flex justify-between items-end shrink-0">
        <div key={`quote-${currentSlide}`} className="max-w-md slide-animate">
          <p className="text-blue-100/90 text-[14px] mb-2 leading-relaxed">
            {slides[currentSlide].quote}
          </p>
          <p className="font-semibold text-sm">{slides[currentSlide].author}</p>
        </div>
        <div className="flex space-x-2 items-center mb-1">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
