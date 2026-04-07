import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaLeaf,
  FaEye,
  FaHeart,
  FaStar,
  FaHandHoldingHeart,
} from "react-icons/fa";
import accessibility from "../assets/accessibility.jpeg";
import transparency from "../assets/transparency.jpeg";
import wellness from "../assets/wellness_first.jpeg";
import quality from "../assets/premium_quality.jpeg";
import empowered from "../assets/empowered.jpeg";
// import logoOutline from "../assets/logo_outline_colour.svg";

const values = [
  {
    icon: <FaLeaf className="text-3xl text-[#028282] mt-16" />,
    title: "Accessibility",
    description:
      "Cannabis care that’s easy to understand, access, and trust—wherever you are on your journey.",
    image: accessibility,
  },
  {
    icon: <FaEye className="text-3xl text-[#028282] mt-16" />,
    title: "Transparency",
    description:
      "We believe in honest labels, clear processes, and communication without the fluff.",
    image: transparency,
  },
  {
    icon: <FaHeart className="text-3xl text-[#028282] mt-16" />,
    title: "Wellness First",
    description:
      "Every product and service we offer is rooted in elevating your physical and mental well-being.",
    image: wellness,
  },
  {
    icon: <FaStar className="text-3xl text-[#028282] mt-16" />,
    title: "Premium Quality",
    description:
      "Only the best. From seed to service, we uphold premium standards in every touchpoint.",
    image: quality,
  },
  {
    icon: <FaHandHoldingHeart className="text-3xl text-[#028282] mt-16" />,
    title: "Empowered Enjoyment",
    description:
      "We celebrate mindful cannabis use as part of a balanced, fulfilling lifestyle.",
    image: empowered,
  },
];

const BrandValues = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveIndex((prev) => (prev + 1) % values.length),
      5000
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative bg-white text-[#028282] py-24 px-6 md:px-12 overflow-hidden">
      {/* Centered, oversized logo outline */}
      {/* <img
        src={logoOutline}
        alt="Centered Logo Outline"
        className="hidden sm:block absolute top-2/3 left-1/2 w-[100%] h-[100%] opacity-20 pointer-events-none z-0 object-contain -translate-x-1/2 -translate-y-1/2"
      /> */}

      <div className="relative max-w-6xl mx-auto">
        {/* ================== ONBOARDING SECTION ================== */}
        <motion.div
          className="mb-20"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="text-center mb-10">
            <p className="text-sm tracking-[0.25em] uppercase text-[#028282] font-roboto mb-2">
              Onboarding
            </p>
            <h2 className="text-3xl md:text-4xl font-medium mb-4 font-balooChettan">
              Patient Onboarding Documents
            </h2>
            <p className="text-lg md:text-xl font-light font-balooBhaijaan text-[#028282] max-w-3xl mx-auto">
              Below are the official Original Source onboarding workflow
              guides. These PDFs show the full step-by-step process for becoming
              a medical cannabis patient. The <strong>Android Workflow</strong>{" "}
              demonstrates the process on Android devices, while the{" "}
              <strong>iOS Workflow</strong> outlines the steps specifically for
              Apple users.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 py-6">
            {/* Android PDF Card */}
            <motion.div
              className="rounded-xl p-6 bg-[#f1f1f1] flex flex-col h-full shadow-[0_20px_25px_-4px_#02828250]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h3 className="font-roboto text-xl md:text-2xl font-semibold mb-2 text-[#028282]">
                Android Onboarding Workflow
              </h3>
              <p className="text-sm md:text-base text-gray-800 font-balooBhaijaan flex-grow mb-4">
                A complete walkthrough showing Android users how to complete the
                Original Source patient onboarding journey step by step.
              </p>
              <a
                href="/onboarding-android-v2.pdf"
                download
                className="inline-flex items-center justify-center w-full rounded-full bg-[#028282] text-white px-6 py-2 text-sm md:text-base font-roboto tracking-wide hover:bg-[#026060] transition-colors"
              >
                Download Android Guide
              </a>
            </motion.div>

            {/* iOS PDF Card */}
            <motion.div
              className="rounded-xl p-6 bg-[#f1f1f1] flex flex-col h-full shadow-[0_20px_25px_-4px_#02828250]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <h3 className="font-roboto text-xl md:text-2xl font-semibold mb-2 text-[#028282]">
                iOS Onboarding Workflow
              </h3>
              <p className="text-sm md:text-base text-gray-800 font-balooBhaijaan flex-grow mb-4">
                A detailed guide for iPhone/iPad users, showing the exact steps
                to follow to register, upload documents, and complete onboarding
                successfully.
              </p>
              <a
                href="/onboarding-ios-v2.pdf"
                download
                className="inline-flex items-center justify-center w-full rounded-full bg-[#028282] text-white px-6 py-2 text-sm md:text-base font-roboto tracking-wide hover:bg-[#026060] transition-colors"
              >
                Download iOS Guide
              </a>
            </motion.div>
          </div>
        </motion.div>
        {/* ================== END ONBOARDING SECTION ================== */}

        {/* ================== WHAT WE STAND FOR (2-COLUMN LAYOUT) ================== */}
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2 lg:gap-32">
          {/* LEFT: Title + Copy */}
          <div className="mt-6 space-y-6 px-6 text-center lg:mt-28 lg:space-y-8">
            <h2 className="text-3xl md:text-4xl font-medium font-balooChettan">
              WHAT WE STAND FOR
            </h2>
            <p className="text-lg md:text-xl font-light font-balooBhaijaan text-[#028282]">
              Original Source offers trusted wellness services and medical-grade
              cannabis products—delivered straight to your door. We bridge
              modern science and natural healing, making premium cannabis care
              simple, safe, and accessible for everyone.
            </p>
          </div>

          {/* RIGHT: Tabs + Image + Card */}
          <div className="flex flex-col gap-8">
            {/* Tabs Positioned Above Both Sections */}
            <div className="flex justify-start overflow-x-auto px-1 scroll-mx-4 gap-4 whitespace-nowrap">
              {values.map((value, index) => (
                <button
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`px-4 py-2 min-w-max rounded-full border font-roboto text-sm transition-all duration-300 mb-2
                  ${
                    activeIndex === index
                      ? "bg-[#028282] text-white border-[#fff]"
                      : "bg-white text-[#028282] border-[#fff] hover:bg-[#028282]/10"
                  }`}
                >
                  {value.title}
                </button>
              ))}
            </div>

            <div className="flex flex-col items-center gap-8 lg:flex-row lg:items-center lg:justify-center">
              {/* Image Section */}
              <div className="hidden lg:block w-[320px] h-[320px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`image-${activeIndex}`}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6 }}
                    className="w-[320px] h-[320px] shadow-md overflow-hidden"
                  >
                    <img
                      src={values[activeIndex].image}
                      alt={values[activeIndex].title}
                      className="w-full h-full object-cover"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Card Section */}
              <div className="flex justify-center items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -40 }}
                    transition={{ duration: 0.6 }}
                    className="rounded-xl p-8 bg-[#f1f1f1] flex flex-col justify-start w-[320px] h-[320px] shadow-[0_20px_25px_-4px_#02828250]"
                  >
                    <div className="flex flex-col items-center gap-2 mb-4 text-center">
                      {values[activeIndex].icon}
                      <h3 className="text-2xl md:text-3xl font-semibold font-roboto">
                        {values[activeIndex].title}
                      </h3>
                    </div>

                    <p className="text-md text-center">
                      {values[activeIndex].description}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
        {/* ================== END WHAT WE STAND FOR ================== */}
      </div>
    </section>
  );
};

export default BrandValues;
