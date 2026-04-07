import { Link } from "react-router-dom";

const BenefitsSnippet = () => {
  return (
    <section className="bg-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="uppercase tracking-widest text-sm text-[#046A6A]/80">
            Evidence-Based Care
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#046A6A] mt-2">
            Clinical Benefits of Medical Cannabis
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-gray-700 text-base sm:text-lg leading-relaxed">
            Medical cannabis is prescribed for specific conditions where clinical
            evidence supports its use. Treatment is doctor-guided, monitored, and
            tailored to individual patient needs.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-[#046A6A]/30 rounded-xl p-6">
            <h3 className="font-semibold text-[#046A6A] mb-2">
              Chronic Pain & Inflammation
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Evidence supports cannabinoids for neuropathic pain, arthritis,
              fibromyalgia, and chronic non-cancer pain management.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-6">
            <h3 className="font-semibold text-[#046A6A] mb-2">
              Neurology & Epilepsy
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Clinical use includes epilepsy syndromes, MS spasticity, and
              neurological symptom support under medical supervision.
            </p>
          </div>

          <div className="border border-[#046A6A]/30 rounded-xl p-6">
            <h3 className="font-semibold text-[#046A6A] mb-2">
              Sleep, Anxiety & Appetite
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              Prescribed for sleep support, anxiety management, appetite
              stimulation, and supportive care in selected patients.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            to="/clinical-benefits"
            className="
              inline-block
              px-8 py-3
              rounded-full
              text-lg font-medium
              text-[#046A6A]
              border border-[#046A6A]
              hover:bg-[#046A6A]
              hover:text-white
              transition-all duration-300
            "
          >
            View Clinical Benefits
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BenefitsSnippet;
