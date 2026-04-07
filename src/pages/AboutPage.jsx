import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgServices from "../assets/landscape2.jpg";
import oilVideo from "../assets/oil_video.mov";
import aboutImg2 from "../assets/oil.jpg";
import { motion } from "framer-motion";

const About = () => {
  return (
    <>
      <Navbar />

      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden z-0">
        <img
          src={bgServices}
          alt="Hero Background"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 text-center p-8 mt-[9rem]">
              <h1 className="text-4xl sm:text-7xl font-baloo font-medium tracking-wide mb-6 text-[#F3EDE2]">
            ABOUT US
            <br className="block sm:hidden" />
          </h1>
          <h3 className="text-xl md:text-xl lg:text-3xl max-w-3xl mb-8 text-[#fff] font-roboto font-medium">
            At Original Source, our journey is rooted in care. We bring premium
            cannabis wellness straight to your door—doctor-approved,
            lifestyle-driven, and built for everyday comfort.
          </h3>
        </div>
      </div>

      {/* Our Story Section */}
      <section className="bg-[#f1f1f1] text-[#028282] py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto text-center font-balooBhaijaan">
              <h2 className="text-3xl lg:text-5xl font-normal font-balooChettan mb-6 tracking-wide">
 
            OUR STORY
          </h2>
          <p className="text-xl font-light font-balooBhaijaan  max-w-3xl mx-auto mb-12">
            Original Source was born from the belief that medical cannabis
            should be accessible, trusted, and beautiful. We blended
            science-backed care with lifestyle elegance to create South Africa’s
            go-to provider for home-based cannabis wellness.
          </p>

          <div className="grid md:grid-cols-2 gap-12 text-left">
            {/* Text Left, Video Right */}
            <motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
  viewport={{ once: true, margin: "-10% 0px" }}
  className="bg-white/90 p-8 rounded-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[-8px_8px_20px_#08B2B280] py-10 sm:py-10 lg:py-20"
>

              <h3 className="text-3xl font-medium mb-4 font-balooChettan text-center">
                ROOTED IN PURPOSE
              </h3>
              <p className="text-xl font-light font-balooBhaijaan  max-w-3xl mx-auto mb-12">
                Our story began with one simple question: how do we make premium
                cannabis care easier, more trusted, and more enjoyable for every
                patient? From that spark came Original Source—a brand that puts
                people first, without compromise.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-lg font-light mx-auto">
                <li>Doctor-supported bundles tailored to real needs</li>
                <li>Wellness-first products delivered monthly</li>
                <li>A mission driven by accessibility, quality, and care</li>
              </ul>
            </motion.div>

<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.15 }}
  viewport={{ once: true, margin: "-10% 0px" }}
  className="rounded-2xl overflow-hidden shadow-2xl"
>
  <video
    src={oilVideo}
    className="w-full h-[500px] object-cover"
    autoPlay
    loop
    muted
    playsInline
  />
</motion.div>



            {/* Image Right, Text Left */}
<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.25 }}
  viewport={{ once: true, margin: "-10% 0px" }}
  className="hidden md:block rounded-2xl overflow-hidden shadow-2xl h-[420px]"
>
  <img
    src={aboutImg2}
    alt="Wellness Mission"
    className="w-full h-full object-cover"
  />
</motion.div>


<motion.div
  initial={{ opacity: 0, y: 40 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: 0.35 }}
  viewport={{ once: true, margin: "-10% 0px" }}
  className="bg-white/90 p-8 rounded-2xl shadow-2xl transition-shadow duration-500 hover:shadow-[-8px_8px_20px_#08B2B280] h-[420px] flex flex-col justify-center"
>
  <h3 className="text-3xl font-medium mb-4 font-balooChettan text-center">
    OUR MISSION
  </h3>
  <p className="text-xl font-light font-balooBhaijaan max-w-3xl mx-auto mb-12">
    We’re here to empower your healing journey—from consultation to
    doorstep delivery. Our mission is to blend premium cannabis, medical
    trust, and effortless delivery into a single, elegant solution
    for modern wellness.
  </p>
  <ul className="list-disc pl-6 space-y-2 text-lg font-light mx-auto">
    <li>Premium flower, rosin, and medibles curated for your lifestyle</li>
    <li>Discreet, accessible care from the comfort of home</li>
  </ul>
</motion.div>

          </div>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default About;
