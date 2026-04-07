import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { motion } from "framer-motion";
import onboardingImage from "../assets/logos/OS-final.png";
import bgServices from "../assets/landscape2.jpg";
import Footer from "../components/Footer";

const Services = () => {
    const [showModal, setShowModal] = useState(false);

    // Add this effect inside Services
useEffect(() => {
  if (showModal) {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }
}, [showModal]);


  return (
    <>
      <Navbar />
      {/* Hero Section - Inlined instead of separate component */}
<div className="relative w-full h-screen overflow-hidden z-0">
  <img
    src={bgServices}
    alt="Hero Background"
    className="w-full h-full object-cover absolute inset-0"
  />
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 text-center p-8 mt-[9rem]">
    <h1 className="text-4xl sm:text-7xl font-baloo font-medium tracking-wide mb-6 text-[#F3EDE2]">
  MEDICAL CANNABIS<br className="block sm:hidden" /> SERVICES
</h1>

<h3 className="text-xl md:text-xl lg:text-3xl max-w-3xl mb-8 text-[#fff] font-roboto font-medium">    
    Discover a seamless path to wellness with our range of doctor-supported cannabis services.
      From personalised consultations to prescription access and discreet delivery,
      Original Source brings compliant cannabis care directly to you.
    </h3>
  </div>
</div>

      
      {/* Modal */}
{showModal && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70"
    role="dialog"
    aria-modal="true"
  >
    <div className="relative bg-white border-4 rounded-xl px-6 sm:px-10 py-8 sm:my-12 mx-4 sm:mx-0 max-w-md w-full text-center shadow-lg">
      {/* Close Button */}
      <button
        className="absolute top-2 right-4 text-[#028282] text-2xl hover:text-red-600"
        onClick={() => setShowModal(false)}
      >
        &times;
      </button>

      {/* Logo */}
      <img
        src={onboardingImage}
        alt="Synergy Logo"
        className="w-40 h-40 mx-auto mb-5 rounded-md my-5"
      />

      {/* Heading */}
      <h3 className="text-3xl text-[#028282] font-gothic mb-2">Patient Onboarding</h3>

      {/* Paragraph */}
      <p className="text-[#028282] text-md mb-6 leading-relaxed">
        By signing up as a new patient, you agree to our Terms of Service,
        including privacy protection, compliance with laws, and responsible
        use of our platform and services.
      </p>

      {/* Consent Toggle */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <span className="text-gray-600 text-md">I agree to the Terms of Service</span>
        <label className="relative inline-flex items-center cursor-not-allowed">
          <input type="checkbox" checked disabled className="sr-only peer" />
          <div className="w-11 h-6 bg-green-600 rounded-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
        </label>
      </div>

      {/* Get Started Button */}
      <a
        href="https://hub.synergywellness.co.za/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block w-full"
      >
<button
  type="button"
  className="mt-6 px-8 py-2 rounded-full text-white text-lg font-medium 
             bg-gradient-to-tr from-[#0A4040] via-[#08B2B2] to-[#0A4040] 
             shadow-lg transition-all duration-300 ease-in-out 
              hover:bg-[#0A4040]"
>
  GET STARTED
</button>

      </a>
    </div>
  </div>
)}



 {/* Services Section */}
<section className="relative bg-white text-[#028282] py-24 px-6 md:px-12">
  {/* Top-left logo outline */}
  {/* <img
    src={logoOutline}
    alt="Top Left Logo Outline"
    className="hidden sm:block absolute top-7 left-8 w-2/5 max-w-[220px] opacity-30 pointer-events-none z-0 rotate-[15deg]"
  /> */}
  {/* Top-right logo outline */}
{/* <img
  src={logoOutline2}
  alt="Top Right Logo Outline"
  className="hidden sm:block absolute top-7 right-8 w-2/5 max-w-[220px] opacity-30 pointer-events-none z-0 -rotate-[15deg]"
/> */}

        <div className="max-w-6xl mx-auto text-center">
    <h2 className="text-3xl lg:text-5xl font-normal font-baloo mb-6 tracking-wide">
            OUR SERVICES
          </h2>
          <p className="text-xl font-light max-w-3xl mx-auto mb-12 font-roboto">
            At Original Source, we combine medical expertise with cannabis care—making
            your wellness journey comfortable, discreet, and professional.
          </p>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            {/* Patient Onboarding */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-white/90 p-8 rounded-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[-8px_8px_20px_#08B2B280]"
            >
              <h3 className="text-3xl font-medium mb-4 font-balooChettan text-center">PATIENT ONBOARDING</h3>
              <p className="text-xl font-light font-balooBhaijaan max-w-3xl mx-auto mb-6 text-center">
                Whether you’re new to cannabis or just looking for expert-backed
                guidance, our onboarding process makes it simple. From your first
                click, you’ll be guided through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg font-light mx-auto">
                <li>Booking a doctor consultation at your convenience</li>
                <li>Personalised product recommendations based on your health needs</li>
                <li>Discreet, home delivery of your chosen bundle</li>
                <li>Follow-up and check-in support to ensure ongoing care</li>
              </ul>
            </motion.div>

            {/* Doctor Consultations */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/90 p-8 rounded-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[-8px_8px_20px_#08B2B280]"
            >
              <h3 className="text-3xl font-medium mb-4 font-balooChettan text-center">DOCTOR CONSULTATIONS</h3>
              <p className="text-xl font-light font-balooBhaijaan max-w-3xl mx-auto mb-12 text-center">
                Our telehealth network connects you with fully certified cannabis
                doctors. Enjoy a professional medical experience from home:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg font-light mx-auto">
                <li>Compliant with South African medical regulations</li>
                <li>No queues, no hassle—appointments via secure video call</li>
                <li>Doctors evaluate symptoms and advise best treatment options</li>
                <li>Section 21 application and product access arranged by us</li>
              </ul>
            </motion.div>
          </div>

<div className="mt-16">
  <button
    onClick={() => setShowModal(true)}
    className="relative inline-block p-px font-normal font-roboto leading-6 text-black bg-white shadow-2xl cursor-pointer rounded-full shadow-teal-600 transition-transform duration-300 ease-in-out group"
  >
    <span className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-400 via-blue-500 to-teal-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
    <span className="relative z-10 block px-8 py-2 rounded-full bg-white">
      <div className="relative z-10 flex items-center space-x-2">
        <span className="transition-all duration-500 group-hover:translate-x-1">
          JOIN NOW
        </span>
        <svg
          className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1"
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
  </button>
</div>


        </div>
      </section>
      <Footer />
    </>
  );
};

export default Services;
