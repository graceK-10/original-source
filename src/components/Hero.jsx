import { useState, useEffect } from "react";
import bgDesktop from "../assets/landscape2.jpg";
import placeholder from "../assets/landscape2.jpg";

const Hero = () => {
  const [loaded, setLoaded] = useState(false);
  const [bgImage, setBgImage] = useState(bgDesktop);
  const [vh, setVh] = useState("100vh");

  // 🧠 Fix for mobile viewport height (accounts for browser UI bars)
  useEffect(() => {
    const setViewportHeight = () => {
      const vhValue = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vhValue}px`);
      setVh(`calc(var(--vh) * 100)`);
    };
    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    return () => window.removeEventListener("resize", setViewportHeight);
  }, []);

  // 📱 Detect mobile & set background image
  useEffect(() => {
    setBgImage(bgDesktop);
  }, []);

  // 🖼️ Preload the chosen background
  useEffect(() => {
    const img = new Image();
    img.src = bgImage;
    img.onload = () => setLoaded(true);
  }, [bgImage]);

  return (
    <div
      className="relative w-full pt-[9rem] overflow-hidden z-0"
      style={{ height: vh }}
    >
      {/* Placeholder while loading */}
      <img
        src={placeholder}
        alt="Hero Placeholder"
        className="w-full h-full object-cover absolute inset-0 z-0 transition-opacity duration-700 ease-in-out"
        style={{ opacity: loaded ? 0 : 1 }}
      />

      {/* Hero background */}
      <img
        src={bgImage}
        alt="Hero Background"
        className="w-full h-full object-cover absolute inset-0 z-10 transition-opacity duration-1000 ease-in-out"
        style={{ opacity: loaded ? 1 : 0 }}
        draggable="false"
      />

      {/* Overlay + content */}
      <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center p-8">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="relative z-30 flex flex-col items-center justify-center space-y-8">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-baloo font-medium tracking-wide mb-6 text-white text-bottom-outline3 transition-opacity duration-500 fade-up-title">
            CANNABIS CARE <br /> DELIVERED
          </h1>

{/* Fade-up button, delayed by 3s */}
<a
  href="https://hub.synergywellness.co.za/welcome?store=Original+Source"
  target="_blank"
  rel="noopener noreferrer"
  className="fade-up-button delay-3s relative inline-block p-px font-normal font-roboto leading-6 text-black bg-white shadow-2xl cursor-pointer rounded-full shadow-teal-600 transition-transform duration-300 ease-in-out group text-sm sm:text-base"
>
  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-teal-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>

  <span className="relative z-10 block px-6 sm:px-8 py-2 sm:py-2.5 rounded-full bg-white">
    <div className="relative z-10 flex items-center space-x-2 justify-center">
      {/* Text for mobile vs desktop */}
      <span className="transition-all duration-500 group-hover:translate-x-1 text-center block sm:hidden">
        BECOME A PATIENT
      </span>
      <span className="transition-all duration-500 group-hover:translate-x-1 text-center hidden sm:block">
        BECOME AN ORIGINAL SOURCE PATIENT
      </span>

      <svg
        className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-500 group-hover:translate-x-1"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          fillRule="evenodd"
          d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
        />
      </svg>
    </div>
  </span>
</a>

        </div>
      </div>
    </div>
  );
};

export default Hero;
