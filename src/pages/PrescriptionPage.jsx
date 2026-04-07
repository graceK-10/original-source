// src/pages/PrescriptionPage.jsx
import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Reuse your existing hero background so it matches the Products page vibe
import bgServices from "../assets/landscape2.jpg";

const tabData = [
  { label: "Why Prescription?", value: "why" },
  { label: "Why Choose Us", value: "chooseus" },
  { label: "Quality Control", value: "quality" },
  { label: "Doctor Guidance", value: "guidance" },
  { label: "Legal Protection", value: "legal" },
];

export const PrescriptionSnippetCard = () => (
  <section className="bg-white px-4 pb-10">
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-[#046A6A]/30 overflow-hidden shadow-sm">
        <div className="bg-[#046A6A] text-white px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/80">
              Patient Information
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold">
              Why do I need a doctor’s prescription?
            </h3>
          </div>

          <div className="flex gap-3">
            <Link
              to="/why-prescription"
              className="px-6 py-2 rounded-full bg-white text-[#046A6A] font-medium hover:bg-white/90 transition-colors"
            >
              Read More
            </Link>
            <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2 rounded-full border border-white text-white font-medium hover:bg-white/10 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>

        <div className="bg-white px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-[#046A6A]/30 rounded-xl p-5">
            <p className="font-bold text-[#046A6A]">Rigorous Quality Control</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              Lab testing for potency, purity, and contaminants like pesticides
              and heavy metals — with consistent dosing you can rely on.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-5">
            <p className="font-bold text-[#046A6A]">Professional Dosing Guidance</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              A doctor-guided plan tailored to your condition and medications —
              reducing guesswork and improving outcomes.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-5">
            <p className="font-bold text-[#046A6A]">Legal Protection</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              Medical authorisation to possess and use cannabis, with clinically
              justified quantities and continuity of supply.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const PrescriptionPage = () => {
  const [activeTab, setActiveTab] = useState("why");

  // Optional: allow deep-linking like /why-prescription#legal
  useEffect(() => {
    const hash = window.location.hash?.replace("#", "");
    if (hash && tabData.some((t) => t.value === hash)) setActiveTab(hash);
  }, []);

  const jumpTo = (value) => {
    setActiveTab(value);
    window.history.replaceState(null, "", `#${value}`);
  };

  return (
    <>
      <Navbar />

      {/* Hero (matches Products page structure) */}
      <div className="relative w-full h-screen overflow-hidden z-0">
        <img
          src={bgServices}
          alt="Hero Background"
          className="w-full h-full object-cover absolute inset-0"
        />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/30 text-center p-8 mt-[9rem]">
          <h1 className="text-4xl sm:text-7xl font-baloo font-medium tracking-wide mb-6 text-[#F3EDE2]">
            WHY A DOCTOR’S <br className="block sm:hidden" /> PRESCRIPTION?
          </h1>

          {/* Updated hero subheading to include Section 21 */}
          <h3 className="text-xl md:text-xl lg:text-3xl max-w-4xl mb-8 text-[#fff] font-roboto font-medium">
            Medical cannabis isn’t “over-the-counter wellness.” It’s a clinical pathway
            designed for safety, consistency, and legal protection — guided by a doctor and
            delivered through South Africa’s <span className="text-white font-semibold">Section 21</span>{" "}
            SAHPRA-regulated prescription process.
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* GET STARTED */}
            <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-8 py-3 rounded-full text-lg font-medium
                text-white
                border border-white
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              GET STARTED
            </a>

            {/* VIEW BENEFITS */}
            <button
              onClick={() => {
                const el = document.getElementById("prescription-tabs");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="
                px-8 py-3 rounded-full text-lg font-medium
                text-[#04b6b6]
                border border-[#04b6b6]
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              VIEW BENEFITS
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Section (same style as Products page) */}
      <section id="prescription-tabs" className="bg-[#fff] text-[#028282] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Tabs value={activeTab} className="w-full bg-white rounded-lg shadow-md p-10">
            <div className="sm:overflow-visible overflow-x-auto no-scrollbar -mx-4 px-4">
              <TabsHeader
                className="inline-flex w-max gap-2 bg-transparent rounded-full"
                indicatorProps={{
                  className: "bg-[#028282]/10 shadow-none text-[#028282] rounded-full",
                }}
              >
                {tabData.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    onClick={() => jumpTo(value)}
                    className="w-auto inline-flex text-sm sm:text-base px-4 py-2 rounded-full border border-[#028282] data-[active=true]:bg-[#028282]/10 data-[active=true]:text-[#028282]"
                  >
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
            </div>

            <TabsBody>
              {/* TAB: WHY */}
              <TabPanel key="why" value="why" className="text-center mt-6">
                <div className="space-y-10 text-left">

                  {/* ✅ IMPORTANT: Section 21 FIRST */}
                  <div className="rounded-xl border border-[#046A6A]/30 p-6 sm:p-10 bg-white">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                      Why Section 21
                    </h2>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                      In South Africa, Section 21 of the Medicines and Related Substances Act is a
                      regulated pathway that allows doctors to prescribe certain medicines, such as
                      medical cannabis, before they are fully registered, when it is clinically
                      appropriate to do so. Our doctors assess your needs, and apply to South Africa’s
                      Health Products Regulatory Authority (SAHPRA) for a Section 21 Medical Cannabis
                      prescription, on your behalf.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A] mb-2">
                          Why cannabis is treated this way
                        </p>
                        <ul className="list-disc pl-5 space-y-2 text-gray-700 text-sm sm:text-base leading-relaxed">
                          <li>Still undergoing formal registration processes</li>
                          <li>Produced in limited or specialised batches</li>
                          <li>Prescribed for patients with specific medical needs</li>
                        </ul>
                      </div>

                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A] mb-2">
                          How the process works
                        </p>
                        <ol className="list-decimal pl-5 space-y-2 text-gray-700 text-sm sm:text-base leading-relaxed">
                          <li>One of our qualified healthcare practitioners assesses your needs</li>
                          <li>If appropriate, a Section 21 application is submitted</li>
                          <li>Approval is granted under SAHPRA’s regulatory oversight</li>
                          <li>You receive legal, medically supervised access</li>
                          <li>You are now able to have medical cannabis delivered, to your door!</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {/* Existing “short answer” content */}
                  <div className="rounded-xl border border-[#046A6A]/30 p-6 sm:p-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                      The short answer
                    </h2>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                      A doctor’s prescription ensures your cannabis is clinically appropriate,
                      consistently dosed, and safe — with oversight that protects your health
                      and gives you legal authorisation where recreational use may be restricted.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Quality You Can Trust</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Rigorous lab testing for potency, purity, and contaminants like pesticides
                          and heavy metals — with consistent dosing.
                        </p>
                      </div>

                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Proper Dosing & Strain Guidance</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Personalised treatment guidance — avoiding trial-and-error and supporting
                          safe use alongside other medications.
                        </p>
                      </div>

                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Legal Protection</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Medical authorisation to possess and use cannabis, with clinically justified
                          quantities and continuity of supply.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA band */}
                  <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                    <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                      <h3 className="text-2xl sm:text-3xl font-semibold">
                        Want to get started the right way?
                      </h3>
                      <p className="text-white/90 mt-2">
                        Begin your patient onboarding and get assessed by a doctor.
                      </p>

                      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                                 <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-8 py-3 rounded-full text-lg font-medium
                text-white
                border border-white
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              GET STARTED
            </a>
                        <Link
                          to="/products"
                          className="px-8 py-3 rounded-full border border-white text-white text-lg font-medium hover:bg-white/10 transition-colors"
                        >
                          VIEW PRODUCTS
                        </Link>
                      </div>
                    </div>

                    <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                      Safer, trusted, therapeutic access — through a doctor-led pathway.
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    All products dispensed under a valid prescription for medical use only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      SAHPRA Schedule 6 compliance required.
                    </span>
                  </div>
                </div>
              </TabPanel>

              {/* TAB: WHY CHOOSE US */}
              <TabPanel key="chooseus" value="chooseus" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="rounded-xl border border-[#046A6A]/30 p-6 sm:p-10 bg-white">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-3">
                      Why Choose Us
                    </h2>

                    <h3 className="text-lg sm:text-xl font-semibold text-[#046A6A] mb-3">
                      Compliant Medical Cannabis Access
                    </h3>

                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                      At Original Source, we are dedicated to transforming how South Africans
                      access medical cannabis. Our patient-first approach ensures seamless,
                      compliant, and personalised care, empowering you to take control of your
                      health with confidence and peace of mind.
                    </p>

                    <div className="mt-8 border border-[#046A6A]/30 rounded-xl p-5 bg-[#046A6A]/5">
                      <p className="font-bold text-[#046A6A] text-lg">Price</p>
                      <p className="text-3xl sm:text-4xl font-bold text-[#046A6A] mt-1">R699.00</p>
                      <p className="text-gray-700 mt-2 text-sm sm:text-base leading-relaxed">
                        Includes: Doctor consultation via Zoom, application processing, and follow-up.
                      </p>
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    All products dispensed under a valid prescription for medical use only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      SAHPRA Schedule 6 compliance required.
                    </span>
                  </div>
                </div>
              </TabPanel>

              {/* TAB: QUALITY */}
              <TabPanel key="quality" value="quality" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Rigorous Quality Control
                      </h2>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        At Original Source, we take the quality of our products very seriously.
                        Our products are subject to rigorous lab testing for potency, purity,
                        and especially contaminants like pesticides and heavy metals.
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Why contaminants matter</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Cannabis is a hyper-accumulator — meaning it can absorb heavy metals,
                            pesticides, and toxins from its environment. Those contaminants can lead
                            to serious health issues.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Consistency is the point</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Over-the-counter purchases don’t compare to the quality standard of
                            medical cannabis. We offer access to consistently dosed products —
                            which is never guaranteed otherwise.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">
                          What you get with prescription-based access
                        </h3>
                      </div>

                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Potency & Purity testing</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Confidence in what you’re taking — and how strong it is.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Contaminant screening</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Pesticides and heavy metals are a growing concern in the industry.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Consistent dosing</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Medical cannabis is about repeatable outcomes — not roulette.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white px-6 py-5 mt-6 text-center border-t border-[#046A6A]/30">
            <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-8 py-3 rounded-full text-lg font-medium 
                text-[#028282]
                border border-[#028282]
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              GET STARTED
            </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    All products dispensed under a valid prescription for medical use only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      SAHPRA Schedule 6 compliance required.
                    </span>
                  </div>
                </div>
              </TabPanel>

              {/* TAB: GUIDANCE */}
              <TabPanel key="guidance" value="guidance" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Professional Guidance on Proper Dosing
                      </h2>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        Original Source offers professional medical oversight with personalised
                        treatment plans. There is no trial-and-error approach here.
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Personalised to you</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Our doctors guide dosage and product selection based on your medical
                            conditions, goals, and tolerance.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Medication interactions</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Your plan is designed to support safe interactions with any other
                            medications you may be taking.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">
                          What doctor-guided care changes
                        </h3>
                      </div>

                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Less guesswork</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Clear starting doses and adjustment guidance.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Better consistency</p>
                          <p className="text-gray-700 text-sm mt-1">
                            A plan you can follow and track over time.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">More confidence</p>
                          <p className="text-gray-700 text-sm mt-1">
                            You understand what you’re taking and why.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white px-6 py-5 text-center border-t border-[#046A6A]/30">
                     <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-8 py-3 rounded-full text-lg font-medium 
                text-[#028282]
                border border-[#028282]
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              GET STARTED
            </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    All products dispensed under a valid prescription for medical use only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      SAHPRA Schedule 6 compliance required.
                    </span>
                  </div>
                </div>
              </TabPanel>

              {/* TAB: LEGAL */}
              <TabPanel key="legal" value="legal" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Legal Protection
                      </h2>
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                        With a medical card and doctor’s prescription, you have legal authorisation
                        to possess and use cannabis — offering protection where recreational use
                        might be restricted.
                      </p>

                      <div className="mt-6 space-y-3">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Clinically justified quantities</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Patients often require higher-than-standard limits. Under a doctor’s
                            prescription, you can order larger quantities where clinically justified.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Continuity of supply</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            The prescription pathway supports a stable, consistent supply — not sporadic access.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">
                          The result: safer, trusted access
                        </h3>
                        <p className="text-white/90 mt-2">
                          Medical cannabis is a therapeutic option — backed by oversight, standards, and authorisation.
                        </p>
                      </div>

                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Authorised possession & use</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Documented medical use where it matters.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Reliable supply</p>
                          <p className="text-gray-700 text-sm mt-1">
                            A consistent pathway — not a “maybe we have it” market.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Higher quantities when needed</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Based on clinical need and prescription guidance.
                          </p>
                        </div>
                      </div>

                      <div className="bg-white px-6 py-5 text-center border-t border-[#046A6A]/30">
            <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="
                px-8 py-3 rounded-full text-lg font-medium 
                text-[#028282]
                border border-[#028282]
                bg-white/10 backdrop-blur-md
                transition-all duration-300
                hover:bg-[#028282]
                hover:text-white
                hover:border-white
              "
            >
              GET STARTED
            </a>
                      </div>
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    All products dispensed under a valid prescription for medical use only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      SAHPRA Schedule 6 compliance required.
                    </span>
                  </div>
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PrescriptionPage;
