import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import BrandValues from "../components/BrandValues";
// import BenefitsSnippet from "../components/BenefitsHomePage";
import HomeChatOnboarding from "../components/HomeChatOnboarding";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../index.css";
import {
  UserPlus,
  CreditCard,
  Stethoscope,
  FileCheck2,
  LogIn,
} from "lucide-react";

const HomePage = () => {
  return (
    <>
      <Navbar />
      <div className="w-full overflow-x-hidden">
        <Hero />
        <BrandValues />

{/* Why Choose Us */}
<section className="bg-white px-6 pb-10 md:px-12">
  <div className="mx-auto max-w-6xl space-y-6">
    <div className="overflow-hidden rounded-2xl border border-[#046A6A]/30 shadow-[0_20px_25px_-4px_#02828230]">
      <div className="bg-[#046A6A] px-6 py-8 text-center text-white sm:px-10">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/80 sm:text-sm">
          Why Choose Us
        </p>
        <h2 className="font-balooChettan text-3xl font-medium sm:text-4xl">
          Compliant Medical Cannabis Access
        </h2>
      </div>

      <div className="grid grid-cols-1 items-stretch gap-6 bg-[#f8fbfb] px-6 py-8 sm:px-10 lg:grid-cols-3">
        <div className="rounded-xl border border-[#046A6A]/20 bg-white p-6 sm:p-8 lg:col-span-2">
          <p className="text-base leading-relaxed text-[#046A6A] sm:text-lg">
            At Original Source, we are dedicated to transforming how South
            Africans access medical cannabis. Our patient-first approach
            ensures seamless, compliant, and personalised care, empowering you
            to take control of your health with confidence and peace of mind.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <span className="rounded-full bg-[#046A6A]/10 px-4 py-2 text-center text-sm font-medium text-[#046A6A]">
              Doctor-led care
            </span>
            <span className="rounded-full bg-[#046A6A]/10 px-4 py-2 text-center text-sm font-medium text-[#046A6A]">
              Patient support
            </span>
            <span className="rounded-full bg-[#046A6A]/10 px-4 py-2 text-center text-sm font-medium text-[#046A6A]">
              Zoom consultations
            </span>
            <span className="rounded-full bg-[#046A6A]/10 px-4 py-2 text-center text-sm font-medium text-[#046A6A]">
              SAHPRA compliant
            </span>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-xl border border-[#046A6A]/30 bg-white p-6 sm:p-8">
          <div>
            <p className="text-lg font-semibold text-[#046A6A]">Price</p>
            <p className="mt-1 text-4xl font-bold text-[#046A6A]">R699.00</p>
            <p className="mt-3 text-sm leading-relaxed text-gray-700">
              Includes: Doctor consultation via Zoom, application processing,
              and follow-up.
            </p>
          </div>

          <Link
            to="/prescription-benefits"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-[#046A6A] bg-[#046A6A] px-6 py-3 font-medium text-white transition-colors hover:bg-[#035a5a]"
          >
            Learn More
          </Link>
        </div>
      </div>
    </div>

    {/* Step by Step */}
    <div className="rounded-2xl bg-[#046A6A] px-6 py-6 shadow-[0_20px_25px_-4px_#02828230] sm:px-8">
      <div className="px-6 py-8 text-center text-white sm:px-10">
        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-white/80 sm:text-sm">
          STEP BY STEP
        </p>
        <h2 className="font-balooChettan text-3xl font-medium sm:text-4xl">
          How Access Works
        </h2>
      </div>

      {(() => {
        const steps = [
          {
            step: "Step 1",
            title: "Complete onboarding",
            text: "Register as an Original Source patient by completing the onboarding process.",
            icon: UserPlus,
          },
          {
            step: "Step 2",
            title: "Pay for your consultation",
            text: "Once onboarded, you will need to pay for your doctor’s consultation.",
            icon: CreditCard,
          },
          {
            step: "Step 3",
            title: "Attend your consultation",
            text: "You will then have a consultation with one of our doctors, who will assess your case.",
            icon: Stethoscope,
          },
          {
            step: "Step 4",
            title: "SAHPRA approval",
            text: "After your consultation, your application will be submitted to SAHPRA for approval. Please allow 7–10 business days for the application to be processed.",
            icon: FileCheck2,
          },
          {
            step: "Step 5",
            title: "Receive your approval letter",
            text: "Once approved, you will receive your SAHPRA approval letter by email, along with your SAHPRA patient number (S-Number).",
            icon: FileCheck2,
          },
          {
            step: "Step 6",
            title: "Log in and place orders",
            text: "Once you have received your S-Number, you will be able to log in to the Original Source website and place product orders.",
            icon: LogIn,
          },
        ];

        return (
          <div className="space-y-4">
            {[steps.slice(0, 3), steps.slice(3, 6)].map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="grid grid-cols-1 gap-4 lg:grid-cols-3"
              >
                {row.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.step} className="relative">
                      <div className="h-full rounded-xl bg-white/10 px-4 py-5 backdrop-blur-sm">
                        <div className="flex flex-col items-center text-center">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                            <Icon className="h-5 w-5 text-white" />
                          </div>

                          <p className="mt-3 text-xs font-bold uppercase tracking-[0.18em] text-white/70">
                            {item.step}
                          </p>

                          <p className="mt-2 text-sm font-semibold text-white">
                            {item.title}
                          </p>

                          <p className="mt-2 text-sm leading-relaxed text-white/85">
                            {item.text}
                          </p>
                        </div>
                      </div>

                      {index < row.length - 1 && (
                        <div className="absolute left-[calc(100%-8px)] top-6 hidden h-0.5 w-4 bg-white/30 lg:block" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  </div>
</section>

        {/* <BenefitsSnippet /> */}
        <HomeChatOnboarding />
        <Footer />
      </div>
    </>
  );
};

export default HomePage;