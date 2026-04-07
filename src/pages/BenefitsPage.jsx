// src/pages/BenefitsClinical.jsx
import { Tabs, TabsHeader, TabsBody, Tab, TabPanel } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import bgServices from "../assets/landscape2.jpg";

const tabData = [
  { label: "Overview", value: "overview" },
  { label: "Pain", value: "pain" },
  { label: "Arthritis", value: "arthritis" },
  { label: "Neurology", value: "neurology" },
  { label: "Cancer Support", value: "cancer" },
  { label: "Appetite", value: "appetite" },
  { label: "Sleep & Anxiety", value: "mental" },
  { label: "Blood Pressure", value: "bp" },
];

export const BenefitsSnippetCard = () => (
  <section className="bg-white px-4 pb-10">
    <div className="max-w-7xl mx-auto">
      <div className="rounded-2xl border border-[#046A6A]/30 overflow-hidden shadow-sm">
        <div className="bg-[#046A6A] text-white px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-widest text-white/80">
              Evidence-Based Information
            </p>
            <h3 className="text-2xl sm:text-3xl font-semibold">
              Clinical Benefits of Medical Cannabis
            </h3>
          </div>

          <div className="flex gap-3">
            <Link
              to="/clinical-benefits"
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
            <p className="font-bold text-[#046A6A]">Chronic Pain</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              Evidence supports cannabinoids for neuropathic pain and chronic non-cancer pain.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-5">
            <p className="font-bold text-[#046A6A]">Neurology</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              Evidence includes epilepsy syndromes, MS spasticity, and Parkinson’s symptom support.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-5">
            <p className="font-bold text-[#046A6A]">Sleep & Appetite</p>
            <p className="text-gray-700 mt-2 text-sm leading-relaxed">
              Common clinical use includes sleep support, anxiety management, and appetite stimulation.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const BenefitsClinical = () => {
  const [activeTab, setActiveTab] = useState("overview");

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

      {/* Hero */}
      <div className="relative w-full h-screen overflow-hidden z-0">
        <img
          src={bgServices}
          alt="Hero Background"
          className="w-full h-full object-cover absolute inset-0"
        />
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/30 text-center p-8 mt-[9rem]">
          <h1 className="text-4xl sm:text-7xl font-baloo font-medium tracking-wide mb-6 text-[#F3EDE2]">
            CLINICAL BENEFITS <br className="block sm:hidden" /> OF CANNABIS
          </h1>
          <h3 className="text-xl md:text-xl lg:text-3xl max-w-4xl mb-8 text-[#fff] font-roboto font-medium">
            Scientifically supported health benefits of cannabis use based on clinical studies —
            presented in a clear, patient-friendly way.
          </h3>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* GET STARTED (keep ONLY in hero) */}
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
                const el = document.getElementById("benefits-tabs");
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

      {/* Tabs */}
      <section id="benefits-tabs" className="bg-[#fff] text-[#028282] py-20 px-4">
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
              {/* OVERVIEW */}
              <TabPanel key="overview" value="overview" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="rounded-xl border border-[#046A6A]/30 p-6 sm:p-10">
                    <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                      Evidence-based areas of benefit
                    </h2>
                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed">
                      Clinical research has explored cannabis and cannabinoids across multiple
                      therapeutic areas. Below are the most commonly referenced categories and
                      how they may support symptoms.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Pain & Inflammation</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Neuropathic pain, chronic pain, arthritis, and fibromyalgia support.
                        </p>
                      </div>
                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Neurology</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Epilepsy syndromes, MS spasticity, and Parkinson’s symptom support.
                        </p>
                      </div>
                      <div className="border border-[#046A6A]/30 rounded-xl p-5">
                        <p className="font-bold text-[#046A6A]">Supportive Care</p>
                        <p className="text-gray-700 mt-2 text-sm leading-relaxed">
                          Chemotherapy nausea, appetite support, sleep improvement and anxiety management.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* CTA band (REMOVED GET STARTED button) */}
                  <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                    <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                      <h3 className="text-2xl sm:text-3xl font-semibold">
                        The right benefit depends on the right plan
                      </h3>
                      <p className="text-white/90 mt-2">
                        Dosing and product selection should be doctor-guided — especially alongside other medication.
                      </p>
                      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-3">
                        <Link
                          to="/prescription-benefits"
                          className="px-8 py-3 rounded-full border border-white text-white text-lg font-medium hover:bg-white/10 transition-colors"
                        >
                          Why Prescription?
                        </Link>
                      </div>
                    </div>

                    <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                      This page is informational and not a substitute for medical advice.
                    </div>
                  </div>

                  {/* Disclaimer */}
                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    Information provided is for educational purposes only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      Always consult a healthcare professional.
                    </span>
                  </div>
                </div>
              </TabPanel>

              {/* PAIN */}
              <TabPanel key="pain" value="pain" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Chronic Pain Management
                      </h2>

                      <div className="space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Neuropathic pain</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Substantial evidence shows cannabinoids can reduce neuropathic (nerve) pain,
                            often associated with conditions such as multiple sclerosis or diabetes.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Chronic pain in adults</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Reviews have found cannabis may be as effective as opioids for chronic non-cancer pain,
                            with fewer patients stopping treatment due to side effects.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">
                          How doctors typically approach pain support
                        </h3>
                      </div>

                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Start low, go slow</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Dosing is often adjusted gradually to find effective relief with minimal side effects.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Symptom tracking</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Pain severity, sleep, mobility and function are monitored over time.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Medication interaction checks</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Especially important for patients on chronic medication.
                          </p>
                        </div>
                      </div>

                      {/* REMOVED GET STARTED button */}
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* ARTHRITIS */}
              <TabPanel key="arthritis" value="arthritis" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Arthritis & Fibromyalgia
                      </h2>
                      <div className="border border-[#046A6A]/30 rounded-xl p-4">
                        <p className="font-semibold text-[#046A6A]">Inflammation-related pain</p>
                        <p className="text-gray-700 text-sm leading-relaxed mt-1">
                          CBD and THC have been studied for managing inflammation-related pain in arthritis and fibromyalgia.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">Common focus areas</h3>
                      </div>
                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Pain + stiffness</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Supporting daily function and comfort.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Sleep quality</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Better sleep can reduce pain sensitivity over time.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Inflammation support</p>
                          <p className="text-gray-700 text-sm mt-1">
                            A key contributor in many arthritis presentations.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white px-6 py-5 text-center border-t border-[#046A6A]/30">
                        <Link
                          to="/prescription-benefits"
                          className="inline-block px-8 py-3 rounded-full border border-[#046A6A] text-[#046A6A] text-lg font-medium hover:bg-[#046A6A]/5 transition-colors"
                        >
                          Why Prescription?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* NEUROLOGY */}
              <TabPanel key="neurology" value="neurology" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Neurological Conditions & Epilepsy
                      </h2>

                      <div className="space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Epilepsy syndromes</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            The FDA has approved a cannabis-derived medication for certain rare and severe epilepsy syndromes.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Multiple Sclerosis (MS)</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Evidence supports cannabis for reducing muscle spasticity and spasms in MS.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Parkinson’s support</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Studies suggest cannabis may decrease tremors and rigidity and improve sleep quality in Parkinson’s patients.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">
                          Why medical oversight matters here
                        </h3>
                      </div>

                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Neurology is medication-heavy</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Interactions and dose sensitivity are common — doctor supervision reduces risk.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Dose precision matters</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Small changes can have meaningful effects for symptoms and side effects.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Structured follow-ups</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Tracking outcomes over time helps refine the plan safely.
                          </p>
                        </div>
                      </div>

                      {/* REMOVED GET STARTED button */}
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* CANCER */}
              <TabPanel key="cancer" value="cancer" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Cancer-Related Symptom Relief
                      </h2>
                      <div className="border border-[#046A6A]/30 rounded-xl p-4">
                        <p className="font-semibold text-[#046A6A]">Chemotherapy nausea</p>
                        <p className="text-gray-700 text-sm leading-relaxed mt-1">
                          THC medications are used to manage severe nausea and vomiting associated with chemotherapy.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">Supportive care focus</h3>
                      </div>
                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Nausea + appetite</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Often treated together to improve comfort and nutrition.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Sleep and quality of life</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Symptom relief can support rest and daily wellbeing.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Doctor-guided decisions</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Especially important alongside oncology treatment plans.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white px-6 py-5 text-center border-t border-[#046A6A]/30">
                        <Link
                          to="/prescription-benefits"
                          className="inline-block px-8 py-3 rounded-full border border-[#046A6A] text-[#046A6A] text-lg font-medium hover:bg-[#046A6A]/5 transition-colors"
                        >
                          Why Prescription?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* APPETITE */}
              <TabPanel key="appetite" value="appetite" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Appetite Stimulation
                      </h2>
                      <div className="border border-[#046A6A]/30 rounded-xl p-4">
                        <p className="font-semibold text-[#046A6A]">Weight-loss support</p>
                        <p className="text-gray-700 text-sm leading-relaxed mt-1">
                          Cannabis may increase appetite and reduce weight-loss in patients with conditions such as HIV/AIDS.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">Why this is clinically useful</h3>
                      </div>
                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Nutrition and recovery</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Appetite can support strength, immune function, and healing.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Dose matters</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Too much can cause unwanted side effects — doctor guidance helps balance this.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Often paired with nausea relief</p>
                          <p className="text-gray-700 text-sm mt-1">
                            In supportive care settings, these symptoms can overlap.
                          </p>
                        </div>
                      </div>

                      {/* REMOVED GET STARTED button */}
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* MENTAL */}
              <TabPanel key="mental" value="mental" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Mental Health & Insomnia
                      </h2>

                      <div className="space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Sleep improvement</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Cannabis may help some patients improve sleep quality and reduce sleep latency.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Anxiety management</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Certain cannabinoid profiles may support anxiety management in some patients.
                          </p>
                        </div>

                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-semibold text-[#046A6A]">Relapse prevention</p>
                          <p className="text-gray-700 text-sm leading-relaxed mt-1">
                            Some studies explore cannabinoids in relapse prevention contexts.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">A careful area</h3>
                        <p className="text-white/90 mt-2">
                          Mental health benefits are individual — and THC sensitivity can vary widely.
                        </p>
                      </div>
                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Personal sensitivity varies</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Some people feel calmer; others feel worse — dosing and profile selection matters.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Start conservative</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Doctor oversight reduces the risk of taking too much too soon.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Follow-up matters</p>
                          <p className="text-gray-700 text-sm mt-1">
                            The plan should be reviewed and adjusted based on real outcomes.
                          </p>
                        </div>
                      </div>
                      <div className="bg-white px-6 py-5 text-center border-t border-[#046A6A]/30">
                        <Link
                          to="/prescription-benefits"
                          className="inline-block px-8 py-3 rounded-full border border-[#046A6A] text-[#046A6A] text-lg font-medium hover:bg-[#046A6A]/5 transition-colors"
                        >
                          Why Prescription?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>

              {/* BP */}
              <TabPanel key="bp" value="bp" className="text-center mt-6">
                <div className="space-y-10 text-left">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="relative border border-[#046A6A]/30 rounded-xl p-6 sm:p-10">
                      <h2 className="text-2xl sm:text-3xl font-bold text-[#046A6A] mb-4">
                        Lowering Blood Pressure
                      </h2>
                      <div className="border border-[#046A6A]/30 rounded-xl p-4">
                        <p className="font-semibold text-[#046A6A]">2017 study</p>
                        <p className="text-gray-700 text-sm leading-relaxed mt-1">
                          A 2017 study reported that a single dose of cannabis lowered blood pressure in human participants.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl overflow-hidden border border-[#046A6A]/30">
                      <div className="bg-[#046A6A] px-6 py-8 text-white text-center">
                        <h3 className="text-xl sm:text-2xl font-semibold">Important caution</h3>
                        <p className="text-white/90 mt-2">
                          Blood pressure effects can be complex and vary by individual.
                        </p>
                      </div>
                      <div className="bg-white px-6 py-6 text-left space-y-4">
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Medication interactions</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Especially relevant for patients already on blood pressure or cardiac medication.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Dizziness risk</p>
                          <p className="text-gray-700 text-sm mt-1">
                            Lower BP can lead to lightheadedness in some people — dosing and monitoring matter.
                          </p>
                        </div>
                        <div className="border border-[#046A6A]/30 rounded-xl p-4">
                          <p className="font-bold text-[#046A6A]">Doctor guidance recommended</p>
                          <p className="text-gray-700 text-sm mt-1">
                            This should always be discussed clinically, not self-managed.
                          </p>
                        </div>
                      </div>

                      {/* REMOVED GET STARTED button */}
                    </div>
                  </div>

                  <div className="text-center text-xs sm:text-sm text-gray-600 mt-2">
                    Information provided is for educational purposes only.
                    <br />
                    <span className="uppercase font-semibold text-[#046A6A]">
                      Always consult a healthcare professional.
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

export default BenefitsClinical;
