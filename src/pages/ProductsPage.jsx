import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ProductDescriptionModal from "../components/ProductDescriptionModal";
import bgServices from "../assets/landscape2.jpg";
import flowerOnly from "../assets/products_flower_only.png";
import flowerImage from "../assets/products/flower.svg";
import flowerOnly2 from "../assets/products/flower.png";
import vapeImage from "../assets/products/disp_vape.svg";
import gummyImage from "../assets/products/pastillePurple.svg";
import gummyImage2 from "../assets/products/pastilleRed.svg";
import gummyImage3 from "../assets/products/pastillePink.svg";
import gummyImage4 from "../assets/products/pastilleOrange.svg";

// Indoor
import trinity from "../assets/products/Trinity.png";
import synergyNova from "../assets/products/SynergyNova2.png";
import ogCheese from "../assets/products/OGCheese.png";

// Greenhouse
import sourOgCheese from "../assets/products/FemmeFatale2.png";
import gorillaGlue from "../assets/products/JunglePie.png";
import goldLeaf from "../assets/products/JunglePie.png";

import maxRelief from "../assets/products_max_relief_pack.png";
import miniRelief from "../assets/products_mini_relief_pack.png";
import regularSupport from "../assets/products_regular_support_pack.png";
import strains from "../assets/strains.png";

const tabData = [
  {
    label: "Mini Relief Pack",
    value: "mini",
    image: miniRelief,
  },
  {
    label: "Regular Support Pack",
    value: "regular",
    image: regularSupport,
  },
  {
    label: "Max Relief Pack",
    value: "max",
    image: maxRelief,
  },
  {
    label: "Flower Only",
    value: "flower",
    image: flowerOnly,
  },
  {
    label: "Strains",
    value: "strains",
    image: strains,
  },
];

const gummyImages = [gummyImage, gummyImage2, gummyImage3, gummyImage4];

// Login prompt component for unauthenticated users
const LoginPrompt = () => {
  const [showModal, setShowModal] = useState(false);


  return (
    <div className="bg-[#028282]/5 border border-[#028282]/20 rounded-lg p-6 my-0 text-center">
      <h3 className="text-xl font-bold text-[#028282] mb-2">
        Login for Full Access
      </h3>
      <p className="text-gray-700 mb-4">
        To view pricing and place orders, please login or get started as an
        Original Source patient.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          to="/login"
          className="px-6 py-2 bg-[#028282] text-white rounded-full hover:bg-[#046A6A] transition-colors"
        >
          Login
        </Link>
        {/* Get Started button opens modal */}
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-2 border border-[#028282] text-[#028282] rounded-full hover:bg-[#028282]/10 transition-colors"
        >
          Join Now
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <div className="relative bg-[#F3EDE2] border-4 rounded-xl px-6 sm:px-10 py-8 sm:my-12 mx-4 sm:mx-0 max-w-md w-full text-center shadow-lg">
            {/* Close Button */}
            <button
              className="absolute top-2 right-4 text-[#028282] text-2xl hover:text-red-600"
              onClick={() => setShowModal(false)}
            >
              &times;
            </button>

            {/* Heading */}
            <h3 className="text-3xl text-[#028282] font-gothic mb-2">
              Patient Onboarding
            </h3>

            <p className="text-[#028282] text-md mb-6 leading-relaxed">
              By signing up as a new patient, you agree to our Terms of Service,
              including privacy protection, compliance with laws, and responsible
              use of our platform and services.
            </p>

            {/* Consent Toggle (disabled visual only) */}
            <div className="flex items-center justify-center gap-2 mb-6 ">
              <span className="text-gray-600 text-md">
                I agree to the Terms of Service
              </span>
              <label className="relative inline-flex items-center cursor-not-allowed">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-green-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>

            {/* Get Started Link */}
            <a
              href="https://hub.synergywellness.co.za/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full"
            >
              <button
                type="button"
                className="mt-6 px-8 py-2 rounded-full text-white text-lg font-medium bg-gradient-to-tr from-[#028282] via-purple-800 to-[#FDBA21] shadow-lg"
              >
                GET STARTED
              </button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

// Validation message for users who are logged in but not validated
const ValidationMessage = () => (
  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-8 text-center">
    <h3 className="text-xl font-bold text-amber-700 mb-2">
      Account Pending Validation
    </h3>
    <p className="text-amber-700 mb-4">
      Your account is pending validation. Once your SAHPRA number is verified, you&apos;ll have full access to pricing and ordering.
    </p>
  </div>
);

const Products = () => {
  const { currentUser } = useAuth();
  const { addItem } = useCart();
  const [currentGummyIndex, setCurrentGummyIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [selectedTiers, setSelectedTiers] = useState({});
  const [addingToCart, setAddingToCart] = useState({});
  
  // Check if user is validated (has valid SAHPRA number in spreadsheet)
  const isValidated = currentUser && currentUser.isValidated;
  
  // Function to conditionally render price or nothing
  const renderPrice = (price) => {
    if (!currentUser) {
      return null; // Return nothing for non-logged in users
    }
    if (currentUser && !isValidated) {
      return <span className="text-amber-600">Pending validation</span>;
    }
    return price;
  };
  
  // Function to conditionally render the entire pricing span block
  const renderPriceBlock = (content) => {
    if (!currentUser) {
      return null; // Hide the entire block for non-logged in users
    }
    return (
      <span className="block mt-1">
        {content}
      </span>
    );
  };
  
  // Initialize selected tiers for each product
  useEffect(() => {
    const initialTiers = {};
    tabData.forEach(tab => {
      if (tab.value === "mini") {
        initialTiers["PACK_MINI"] = "PACK_MINI_ECO";
      } else if (tab.value === "regular") {
        initialTiers["PACK_REGULAR"] = "PACK_REGULAR_ECO";
      } else if (tab.value === "max") {
        initialTiers["PACK_MAX"] = "PACK_MAX_ECO";
      } else if (tab.value === "flower") {
        initialTiers["FLOWER_ONLY"] = "FLOWER_ONLY_ECO";
      }
    });
    setSelectedTiers(initialTiers);
  }, []);
  
  // Handle tier selection
  const handleTierChange = (productId, variantId) => {
    setSelectedTiers(prev => ({
      ...prev,
      [productId]: variantId
    }));
  };
  
  // Handle add to cart
  const handleAddToCart = (productId, productName, image) => {
    if (!isValidated) return;
    
    const variantId = selectedTiers[productId];
    if (!variantId) return;
    
    // Set loading state for this product
    setAddingToCart(prev => ({ ...prev, [productId]: true }));
    
    // Get tier and price based on variant
    let tier = "Eco";
    let price = 0;
    
    if (variantId.includes("PREMIUM")) {
      tier = "Premium";
    }
    
    if (productId === "PACK_MINI") {
      price = tier === "Eco" ? 366700 : 546700;
    } else if (productId === "PACK_REGULAR") {
      price = tier === "Eco" ? 812750 : 1172800;
    } else if (productId === "PACK_MAX") {
      price = tier === "Eco" ? 1258800 : 1798800;
    } else if (productId === "FLOWER_ONLY") {
      price = tier === "Eco" ? 180000 : 100;
    }
    
    // Add to cart
    addItem({
      productId,
      variantId,
      name: productName,
      tier,
      price,
      image,
      qty: 1
    });
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [productId]: false }));
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade-out

      setTimeout(() => {
        setCurrentGummyIndex(
          (prevIndex) => (prevIndex + 1) % gummyImages.length
        );
        setFade(true); // fade-in next image
      }, 300); // fade out duration
    }, 5000); // interval

    return () => clearInterval(interval);
  }, []);

  const PRODUCT_DESCRIPTIONS = {
  gummies: {
    title: "Pastilles / Gummies",
    description:
      "Synergy Pastilles are soft, fruit-infused lozenges designed for slow release and controlled absorption. Each pastille delivers a low-dose, balanced formulation for daily support, making them ideal for patients seeking mild, sustained effects throughout the day.\n\n6 x Pastilles per box.",
  },
  vapes: {
    title: "Vapes",
    description:
      "Our Eco Star 0.5 ml disposable vapes are filled with solventless live rosin - the purest expression of the plant. Each strain delivers a clean, terpene-forward vapour experience using precision ceramic hardware for consistent flavour and potency in every draw.",
  },
  flower: {
    title: "Flower",
    description:
      "Our flower range represents the plant in its most natural form. Each strain is carefully cultivated, cured, and tested to preserve its full cannabinoid profile and native terpene expression.\n\nFlower allows for flexible dosing and fast onset, giving patients greater control over both intensity and duration of effects.\n\nStrain characteristics may vary from calming and body-focused to uplifting and mentally stimulating, allowing patients to select options that best suit their individual needs. Available in a selection of curated genetics, each chosen for consistency, quality, and therapeutic reliability.",
  },
};

const [descOpen, setDescOpen] = useState(false);
const [activeDescKey, setActiveDescKey] = useState(null);

const openDesc = (key) => {
  setActiveDescKey(key);
  setDescOpen(true);
};

const closeDesc = () => {
  setDescOpen(false);
  setActiveDescKey(null);
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
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/20 text-center p-8 mt-[9rem]">
              <h1 className="text-4xl sm:text-7xl font-baloo font-medium tracking-wide mb-6 text-[#F3EDE2]">
            MEDICAL CANNABIS <br className="block sm:hidden" /> PRODUCTS
          </h1>
          <h3 className="text-xl md:text-xl lg:text-3xl max-w-3xl mb-8 text-[#fff] font-roboto font-medium">
            Premium cannabis care, delivered to your door. From doctor-supported
            bundles to monthly drops of flower and rosin, Original Source makes
            wellness easy, elegant, and empowering.
          </h3>
        </div>
      </div>

      {/* Tabs */}
      <section className="bg-[#fff] text-[#028282] py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <Tabs
            value="mini"
            className="w-full bg-white rounded-lg shadow-md p-10"
          >
            <div className="sm:overflow-visible overflow-x-auto no-scrollbar -mx-4 px-4">
              <TabsHeader
                className="inline-flex w-max gap-2 bg-transparent rounded-full"
                indicatorProps={{
                  className:
                    "bg-[#028282]/10 shadow-none text-[#028282] rounded-full",
                }}
              >
                {tabData.map(({ label, value }) => (
                  <Tab
                    key={value}
                    value={value}
                    className="w-auto inline-flex text-sm sm:text-base px-4 py-2 rounded-full border border-[#028282] data-[active=true]:bg-[#028282]/10 data-[active=true]:text-[#028282]"
                  >
                    {label}
                  </Tab>
                ))}
              </TabsHeader>
            </div>

            <TabsBody>
              {tabData.map(({ value, image }) => {
                if (value === "mini") {
                  return (
                    <TabPanel
                      key={value}
                      value={value}
                      className="text-center mt-6"
                    >
                      <div className="space-y-16 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* 30g Flower */}
                          <div className="relative border border-[#028282] rounded-xl p-1 sm:p-8 pb-6 sm:pb-24 pr-4 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#028282]">
                                30g Flower
                              </h3>
                              <p className="text-xs sm:text-lg text-[#028282] leading-tight">
                                2× 15g bags
                                {renderPriceBlock(
                                  <>30 × {renderPrice("R60")} = {renderPrice("R1,800")}</>
                                )}
                                <span className="block mt-1">
                                  Patient Selects 2 Strains
                                </span>
                              </p>
                            </div>

                            {/* Image block */}
<div className="relative sm:absolute sm:right-0 lg:-top-32 group inline-block">
  {/* Image wrapper – defines the exact size */}
  <div className="relative inline-block">
    <img
      src={flowerImage}
      alt="30g Flower"
      className="
        w-64 sm:w-72 lg:w-96
        h-auto
        drop-shadow-xl
        -mt-12 sm:mt-0
        -mb-12 sm:-mb-12
        block
      "
    />

    {/* Hover overlay – now matches image exactly */}
    <button
      onClick={() => openDesc("flower")}
      className="
        absolute inset-0
        flex items-center justify-center
        rounded-xl
        bg-black/0
        opacity-0 sm:opacity-0 sm:group-hover:opacity-100
        transition-opacity duration-200 ease-out
      "
      aria-label="View flower description"
    >
      <span className="px-4 py-2 mt-12 rounded-full border border-[#046A6A] bg-[#046A6A] text-white text-sm font-medium">
        View details
      </span>
    </button>
  </div>
</div>


                          </div>

                          {/* 2 Disposable Vapes */}
                          <div className="relative border border-[#028282] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-4 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#028282]">
                                2 Disposable Vapes
                              </h3>
                              <p className="text-xs sm:text-lg text-[#028282] leading-tight">
                                Live Rosin Vapes
                                {renderPriceBlock(
                                  <>2 × {renderPrice("R793.50")} = {renderPrice("R1,587")}</>
                                )}
                                {/* <span className="block mt-1">full-spectrum flavour experience</span> */}
                              </p>
                            </div>

                            {/* Image block */}
<div className="relative sm:absolute sm:right-0 sm:-top-12 lg:-top-16 inline-block group">
  <div className="relative inline-block">
    <img
      src={vapeImage}
      alt="Vapes"
      className="w-52 sm:w-72 lg:w-72 h-auto drop-shadow-xl mt-2 sm:mt-0 block"
    />

    <button
      onClick={() => openDesc("vapes")}
      className="
        absolute inset-0
        flex items-center justify-center
        pointer-events-none
      "
      aria-label="View vape description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* 30× 5mg Gummies */}
                          <div className="relative border border-[#028282] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#028282]">
                                30× 5mg Gummies
                              </h3>
                              <p className="text-xs sm:text-lg text-[#028282] leading-tight">
                                {renderPriceBlock(
                                  <>1 × {renderPrice("R280")} = {renderPrice("R280")}</>
                                )}
                                Synergy Medibles
                              </p>
                            </div>

                            {/* Image block */}
<div className="relative sm:absolute sm:right-0 sm:-top-14 lg:-top-20 inline-block group">
  <div className="relative inline-block">
    <img
      src={gummyImages[currentGummyIndex]}
      alt="Gummies"
      className={`
        w-72 sm:w-72 lg:w-80
        h-auto
        drop-shadow-xl
        -mt-12 sm:mt-0
        -mb-24 sm:-mb-12
        block
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-100" : "opacity-0"}
      `}
    />

    <button
      onClick={() => openDesc("gummies")}
      className="
        absolute inset-0
        flex items-center justify-center
        pointer-events-none
      "
      aria-label="View gummies description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* Pricing Block */}
                          <div className="rounded-xl overflow-hidden border border-[#028282] w-full">
                            {/* Top section: Teal background */}
                            <div className="bg-[#046A6A] px-6 py-6 text-white text-center">
                              <p className="text-xl sm:text-2xl font-semibold">
                                Eco: <span className="font-bold">{renderPrice("R3,667")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Greenhouse)
                                </span>
                              </p>
                              <p className="text-xl sm:text-2xl font-semibold">
                                Premium:{" "}
                                <span className="font-bold">{renderPrice("R5,467")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Indoor)
                                </span>
                              </p>
                              
                              {/* Tier Selection */}
                              {currentUser && isValidated && (
                                <div className="mt-4 flex justify-center gap-2">
                                  <button
                                    onClick={() => handleTierChange("PACK_MINI", "PACK_MINI_ECO")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_MINI"] === "PACK_MINI_ECO"
                                        ? "bg-white text-[#028282]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Eco
                                  </button>
                                  <button
                                    onClick={() => handleTierChange("PACK_MINI", "PACK_MINI_PREMIUM")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_MINI"] === "PACK_MINI_PREMIUM"
                                        ? "bg-white text-[#028282]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Premium
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Bottom section: Light background */}
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Approx. Daily Cost: {renderPrice("R120 – R180/day")}
                            </div>
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Daily Cost (31 days): {renderPrice("R118.29")}
                            </div>
                            
                            {/* Add to Cart Button - Only for validated users */}
                            {currentUser && isValidated && (
                              <div className="bg-white px-6 py-4 text-center border-t border-[#046A6A]/30">
                                <button
                                  onClick={() => handleAddToCart("PACK_MINI", "Mini Relief Pack", miniRelief)}
                                  disabled={addingToCart["PACK_MINI"]}
                                  className="w-full py-2 rounded-full bg-[#046A6A] text-white hover:bg-[#046A6A] transition-colors"
                                >
                                  {addingToCart["PACK_MINI"] ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Adding...
                                    </span>
                                  ) : (
                                    "Add to Cart"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SAHPRA Disclaimer */}
                        <div className="text-center text-xs sm:text-sm text-gray-600 mt-8">
                          All products dispensed via valid SAHPRA-approved
                          Section 21 script. <br />
                          <span className="uppercase font-semibold text-[#046A6A]">
                            For medical use only
                          </span>
                        </div>
                      </div>
                    </TabPanel>
                  );
                }

                if (value === "regular") {
                  return (
                    <TabPanel
                      key={value}
                      value={value}
                      className="text-center mt-6"
                    >
                      <div className="space-y-16 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* 60g Flower */}
                          <div className="relative border border-[#046A6A] rounded-xl p-1 sm:p-8 pb-6 sm:pb-24 pr-4 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                60g Flower
                              </h3>
                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                2× 30g bags
                                {renderPriceBlock(
                                  <>60 × {renderPrice("R60")} = {renderPrice("R1.00")}</>
                                )}
                                <span className="block mt-1">
                                  Choose Up To 2 Strains
                                </span>
                              </p>
                            </div>

                            {/* Image block */}
{/* Image block */}
<div className="relative sm:absolute sm:right-0 lg:-top-32 inline-block group">
  <div className="relative inline-block">
    <img
      src={flowerImage}
      alt="60g Flower"
      className="w-64 sm:w-72 lg:w-96 h-auto drop-shadow-xl
        -mt-12 sm:mt-0 -mb-12 sm:-mb-12"
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("flower")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View flower description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2 mt-12
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>
                         
                          </div>

                          {/* 5 Disposable Vapes */}
                          <div className="relative border border-[#046A6A] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-4 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                5 Disposable Vapes
                              </h3>
                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                {renderPriceBlock(
                                  <>5 × {renderPrice("R793.50")} = {renderPrice("R3,967.50")}</>
                                )}
                                Live Rosin Vapes
                              </p>
                            </div>

                            {/* Image block */}
{/* Image block */}
<div className="relative sm:absolute sm:right-0 sm:-top-12 lg:-top-16 inline-block group">
  <div className="relative inline-block">
    <img
      src={vapeImage}
      alt="5 Disposable Vapes"
      className="w-52 sm:w-72 lg:w-72 h-auto drop-shadow-xl
        mt-2 sm:mt-0"
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("vapes")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View vape description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* 60× 5mg Gummies */}
                          <div className="relative border border-[#046A6A] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                60× 5mg Gummies
                              </h3>
                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                {renderPriceBlock(
                                  <>2 × {renderPrice("R280")} = {renderPrice("R560")}</>
                                )}
                                Synergy Medibles
                              </p>
                            </div>

                            {/* Image block */}
{/* Image block */}
<div className="relative sm:absolute sm:right-0 sm:-top-14 lg:-top-20 inline-block group">
  <div className="relative inline-block">
    <img
      src={gummyImages[currentGummyIndex]}
      alt="60× 5mg Gummies"
      className={`w-72 sm:w-72 lg:w-80 h-auto drop-shadow-xl
        -mt-12 sm:mt-0 -mb-24 sm:-mb-12
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-100" : "opacity-0"}`}
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("gummies")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View gummies description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* Pricing Block */}
                          <div className="rounded-xl overflow-hidden border border-[#046A6A] w-full">
                            {/* Top section: Teal background */}
                            <div className="bg-[#046A6A] px-6 py-6 text-white text-center">
                              <p className="text-xl sm:text-2xl font-semibold">
                                Eco: <span className="font-bold">{renderPrice("R8,127.50")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Greenhouse)
                                </span>
                              </p>
                              <p className="text-xl sm:text-2xl font-semibold">
                                Premium:{" "}
                                <span className="font-bold">{renderPrice("R11,728")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Indoor)
                                </span>
                              </p>
                              
                              {/* Tier Selection */}
                              {currentUser && isValidated && (
                                <div className="mt-4 flex justify-center gap-2">
                                  <button
                                    onClick={() => handleTierChange("PACK_REGULAR", "PACK_REGULAR_ECO")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_REGULAR"] === "PACK_REGULAR_ECO"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Eco
                                  </button>
                                  <button
                                    onClick={() => handleTierChange("PACK_REGULAR", "PACK_REGULAR_PREMIUM")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_REGULAR"] === "PACK_REGULAR_PREMIUM"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Premium
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Bottom section: Light background */}
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Approx. Daily Cost: {renderPrice("R262 – R380/day")}
                            </div>
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Daily Cost (31 days): {renderPrice("R262.18")}
                            </div>
                            
                            {/* Add to Cart Button - Only for validated users */}
                            {currentUser && isValidated && (
                              <div className="bg-white px-6 py-4 text-center border-t border-[#046A6A]/30">
                                <button
                                  onClick={() => handleAddToCart("PACK_REGULAR", "Regular Support Pack", regularSupport)}
                                  disabled={addingToCart["PACK_REGULAR"]}
                                  className="w-full py-2 rounded-full bg-[#046A6A] text-white hover:bg-[#046A6A] transition-colors"
                                >
                                  {addingToCart["PACK_REGULAR"] ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Adding...
                                    </span>
                                  ) : (
                                    "Add to Cart"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SAHPRA Disclaimer */}
                        <div className="text-center text-xs sm:text-sm text-gray-600 mt-8">
                          Prescribed and dispensed under SAHPRA Section 21
                          <br />
                          <span className="uppercase font-semibold text-[#046A6A]">
                            Schedule 6 use only. No Recreational sales
                          </span>
                        </div>
                      </div>
                    </TabPanel>
                  );
                }

                // MAX PRODUCTS
                if (value === "max") {
                  return (
                    <TabPanel
                      key={value}
                      value={value}
                      className="text-center mt-6"
                    >
                      <div className="space-y-16 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* 90g Flower */}
                          <div className="relative border border-[#046A6A] rounded-xl p-1 sm:p-8 pb-6 sm:pb-24 pr-4 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                90g Flower
                              </h3>
                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                3× 30g bags
                                {renderPriceBlock(
                                  <>90 × {renderPrice("R60")} = {renderPrice("R5,400")}</>
                                )}
                                <span className="block mt-1">
                                  choose up to 3 strains
                                </span>
                              </p>
                            </div>

                            {/* Image */}
{/* Image */}
<div className="relative sm:absolute sm:right-0 lg:-top-32 inline-block group">
  <div className="relative inline-block">
    <img
      src={flowerImage}
      alt="90g Flower"
      className="w-64 sm:w-72 lg:w-96 h-auto drop-shadow-xl
        -mt-12 sm:mt-0 -mb-12 sm:-mb-12"
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("flower")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View flower description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2 mt-12
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* 8 Premium Vapes */}
                          <div className="relative border border-[#046A6A] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-4 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                8 Premium Vapes
                              </h3>

                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                {renderPriceBlock(
                                  <>8 × {renderPrice("R793.50")} = {renderPrice("R6,348")}</>
                                )}
                                Live Rosin Vapes
                              </p>
                            </div>

                            {/* Image */}
{/* Image */}
<div className="relative sm:absolute sm:right-0 sm:-top-12 lg:-top-16 inline-block group">
  <div className="relative inline-block">
    <img
      src={vapeImage}
      alt="8 Premium Vapes"
      className="w-52 sm:w-72 lg:w-72 h-auto drop-shadow-xl
        mt-2 sm:mt-0"
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("vapes")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View vape description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* 90× 5mg Gummies */}
                          <div className="relative border border-[#046A6A] rounded-xl p-2 sm:p-8 pb-4 sm:pb-24 pr-2 sm:pr-56 flex flex-col items-center justify-center">
                            {/* Text block */}
                            <div className="z-10 w-full text-center sm:text-left mt-2 sm:mt-0 lg:mt-12">
                              <h3 className="text-base sm:text-xl font-bold text-[#046A6A]">
                                90× 5mg Gummies
                              </h3>
                              <p className="text-xs sm:text-lg text-[#046A6A] leading-tight">
                                {renderPriceBlock(
                                  <>3 × {renderPrice("R280")} = {renderPrice("R840")}</>
                                )}
                                Synergy Medibles
                              </p>
                            </div>

                            {/* Image */}
{/* Image */}
<div className="relative sm:absolute sm:right-0 sm:-top-14 lg:-top-20 inline-block group">
  <div className="relative inline-block">
    <img
      src={gummyImages[currentGummyIndex]}
      alt="90× 5mg Gummies"
      className={`w-72 sm:w-72 lg:w-80 h-auto drop-shadow-xl
        -mt-12 sm:mt-0 -mb-24 sm:-mb-12
        transition-opacity duration-500 ease-in-out
        ${fade ? "opacity-100" : "opacity-0"}`}
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("gummies")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View gummies description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                          </div>

                          {/* Pricing Block */}
                          <div className="rounded-xl overflow-hidden border border-[#046A6A] w-full">
                            {/* Top: Deep Teal background */}
                            <div className="bg-[#046A6A] px-6 py-6 text-white text-center">
                              <p className="text-xl sm:text-2xl font-semibold">
                                Eco: <span className="font-bold">{renderPrice("R12,588")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Greenhouse)
                                </span>
                              </p>
                              <p className="text-xl sm:text-2xl font-semibold">
                                Premium:{" "}
                                <span className="font-bold">{renderPrice("R17,988")}</span>{" "}
                                <span className="text-sm sm:text-base font-normal text-white/80">
                                  (Indoor)
                                </span>
                              </p>
                              
                              {/* Tier Selection */}
                              {currentUser && isValidated && (
                                <div className="mt-4 flex justify-center gap-2">
                                  <button
                                    onClick={() => handleTierChange("PACK_MAX", "PACK_MAX_ECO")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_MAX"] === "PACK_MAX_ECO"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Eco
                                  </button>
                                  <button
                                    onClick={() => handleTierChange("PACK_MAX", "PACK_MAX_PREMIUM")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["PACK_MAX"] === "PACK_MAX_PREMIUM"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Premium
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Bottom: White background */}
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Approx. Daily Cost: {renderPrice("R410–R581/day")}
                            </div>
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Daily Cost (31 days): {renderPrice("R406.06")}
                            </div>
                            
                            {/* Add to Cart Button - Only for validated users */}
                            {currentUser && isValidated && (
                              <div className="bg-white px-6 py-4 text-center border-t border-[#046A6A]/30">
                                <button
                                  onClick={() => handleAddToCart("PACK_MAX", "Max Relief Pack", maxRelief)}
                                  disabled={addingToCart["PACK_MAX"]}
                                  className="w-full py-2 rounded-full bg-[#046A6A] text-white hover:bg-[#046A6A] transition-colors"
                                >
                                  {addingToCart["PACK_MAX"] ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Adding...
                                    </span>
                                  ) : (
                                    "Add to Cart"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* SAHPRA Disclaimer */}
                        <div className="text-center text-xs sm:text-sm text-gray-600 mt-8">
                          All products dispensed under Section 21 prescription
                          for medical use only.
                          <br />
                          <span className="uppercase font-semibold text-[#046A6A]">
                            SAHPRA Schedule 6 compliance required.
                          </span>
                        </div>
                      </div>
                    </TabPanel>
                  );
                }

                if (value === "flower") {
                  return (
                    <TabPanel
                      key={value}
                      value={value}
                      className="text-center mt-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
                        {/* Flower Block */}
                        <div className="border border-[#046A6A] rounded-xl p-8 flex flex-col justify-center items-center w-full">
                          {/* Title */}
                          <div className="text-center mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-[#046A6A]">
                              30g Flower
                            </h3>
                            <p className="text-sm sm:text-lg text-[#046A6A]">
                              Up to 2 strains
                            </p>
                          </div>

                          {/* Image Row */}
{/* Image Row */}
<div className="flex flex-wrap justify-center items-center gap-4">
  <img
    src={synergyNova}
    alt="Synergy Nova"
    className="w-20 sm:w-20 drop-shadow-md"
  />
  <img
    src={ogCheese}
    alt="OG Cheese"
    className="w-20 sm:w-20 drop-shadow-md"
  />

  {/* Main bag image with hover CTA */}
  <div className="relative inline-block group">
    <img
      src={flowerOnly2}
      alt="Prescription Flower Bags"
      className="w-52 sm:w-64 drop-shadow-lg block"
    />

    {/* Hover-only CTA */}
    <button
      onClick={() => openDesc("flower")}
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      aria-label="View flower description"
    >
      <span
        className="
          pointer-events-auto
          opacity-0 group-hover:opacity-100
          px-4 py-2
          rounded-full
          bg-[#046A6A]
          border border-white
          text-white
          text-sm
          font-medium
          transition-opacity duration-200 ease-out
        "
      >
        View details
      </span>
    </button>
  </div>
</div>

                        </div>

                        {/* Pricing Column */}
                        <div className="flex flex-col gap-6 w-full">
                          {/* Eco */}
                          <div className="rounded-xl overflow-hidden border border-[#046A6A]">
                            <div className="bg-[#046A6A] px-6 py-10 text-white text-center">
                              <p className="text-xl sm:text-2xl font-semibold">
                                Eco: <span className="font-bold">{renderPrice("R1,800")}</span>
                              </p>
                              
                              {/* Tier Selection - Only for validated users */}
                              {currentUser && isValidated && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    onClick={() => handleTierChange("FLOWER_ONLY", "FLOWER_ONLY_ECO")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["FLOWER_ONLY"] === "FLOWER_ONLY_ECO"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Eco
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Approximate Daily Cost: {renderPrice("R60/day")}
                            </div>
                          </div>

                          {/* Premium */}
                          <div className="rounded-xl overflow-hidden border border-[#046A6A]">
                            <div className="bg-[#046A6A] px-6 py-11 text-white text-center">
                              <p className="text-xl sm:text-2xl font-semibold">
                                Premium:{" "}
                                <span className="font-bold">{renderPrice("R1.00")}</span>
                              </p>
                              
                              {/* Tier Selection - Only for validated users */}
                              {currentUser && isValidated && (
                                <div className="mt-4 flex justify-center">
                                  <button
                                    onClick={() => handleTierChange("FLOWER_ONLY", "FLOWER_ONLY_PREMIUM")}
                                    className={`px-4 py-1 rounded-full text-sm ${
                                      selectedTiers["FLOWER_ONLY"] === "FLOWER_ONLY_PREMIUM"
                                        ? "bg-white text-[#046A6A]"
                                        : "border border-white text-white hover:bg-white/10"
                                    } transition-colors`}
                                  >
                                    Select Premium
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="bg-white px-6 py-4 text-[#046A6A] text-center text-sm sm:text-base font-medium border-t border-[#046A6A]/30">
                              Approximate Daily Cost: {renderPrice("R117/day")}
                            </div>
                            
                            {/* Add to Cart Button - Only for validated users */}
                            {currentUser && isValidated && (
                              <div className="bg-white px-6 py-4 text-center border-t border-[#046A6A]/30">
                                <button
                                  onClick={() => handleAddToCart("FLOWER_ONLY", "Flower Only", flowerOnly)}
                                  disabled={addingToCart["FLOWER_ONLY"]}
                                  className="w-full py-2 rounded-full bg-[#046A6A] text-white hover:bg-[#046A6A] transition-colors"
                                >
                                  {addingToCart["FLOWER_ONLY"] ? (
                                    <span className="flex items-center justify-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Adding...
                                    </span>
                                  ) : (
                                    "Add to Cart"
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* SAHPRA Disclaimer */}
                      <div className="text-center text-xs sm:text-sm text-gray-600 mt-8">
                        All products dispensed under Section 21 prescription for
                        medical use only.
                        <br />
                        <span className="uppercase font-semibold text-[#046A6A]">
                          SAHPRA Schedule 6 compliance required.
                        </span>
                      </div>
                    </TabPanel>
                  );
                }

                // STRAINS TAB
                if (value === "strains") {
                  return (
                    <TabPanel
                      key={value}
                      value={value}
                      className="text-center mt-6"
                    >
                      <div className="text-left max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                          {/* INDOOR Section */}
                          <div className="border border-[#046A6A] rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-center mb-6 bg-[#046A6A] text-white py-2 rounded-md">
                              INDOOR
                            </h3>
                            <div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    1. Trinity
                                  </span>
                                  <br />
                                  Rich in limonene, beta-caryophyllene, and
                                  linalool, Trinity delivers a balanced euphoria
                                  with calming body effects and mental clarity.
                                </p>
                                <img
                                  src={trinity}
                                  alt="Trinity"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    2. Synergy Nova{" "}
                                  </span>
                                  <br />
                                  Dominated by myrcene, pinene, and humulene,
                                  Synergy Nova offers gentle sedation with
                                  uplifting cerebral focus.
                                </p>
                                <img
                                  src={synergyNova}
                                  alt="Synergy Nova"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    3. OG Cheese
                                  </span>
                                  <br />
                                  Packed with caryophyllene, myrcene, and
                                  limonene, OG Cheese provides deep relaxation
                                  with a mood-elevating buzz and appetite
                                  stimulation.
                                </p>
                                <img
                                  src={ogCheese}
                                  alt="OG Cheese"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                            </div>
                          </div>

                          {/* GREENHOUSE Section */}
                          <div className="border border-[#046A6A] rounded-xl p-6">
                            <h3 className="text-2xl font-bold text-center mb-6 bg-[#046A6A] text-white py-2 rounded-md">
                              GREENHOUSE
                            </h3>
                            <div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    4. Sour OG Cheese
                                  </span>
                                  <br />
                                  With strong terpinolene, myrcene, and
                                  caryophyllene content, Sour OG Cheese blends
                                  energetic euphoria with mellow body relief.
                                </p>
                                <img
                                  src={sourOgCheese}
                                  alt="Sour OG Cheese"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    5. Gorilla Glue
                                  </span>
                                  <br />
                                  High in myrcene, caryophyllene, and limonene,
                                  Gorilla Glue delivers heavy relaxation and
                                  couch-lock effects perfect for pain and
                                  stress.
                                </p>
                                <img
                                  src={gorillaGlue}
                                  alt="Gorilla Glue"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                              <div>
                                <p>
                                  <span className="font-bold text-[#046A6A]">
                                    6. Gold Leaf
                                  </span>
                                  <br />
                                  Featuring limonene, myrcene, and pinene, Gold
                                  Leaf provides a smooth, creative high with
                                  mood-enhancing calm and light body relief.
                                </p>
                                <img
                                  src={goldLeaf}
                                  alt="Gold Leaf"
                                  className="w-20 drop-shadow-md rotate-90 mx-auto"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* SAHPRA Disclaimer */}
                        <div className="text-center text-xs sm:text-sm text-gray-600 mt-8">
                          Section 21 dispensed for medical use only.
                          <br />
                          <span className="uppercase font-semibold text-[#046A6A]">
                            SAHPRA Schedule 6 restrictions apply.
                          </span>
                        </div>
                      </div>
                    </TabPanel>
                  );
                }

                // Default layout for other tabs
                return (
                  <TabPanel
                    key={value}
                    value={value}
                    className="text-center mt-6"
                  >
                    <p className="mb-4 text-gray-700 text-sm">
                      A look at our {value.replace("-", " ")} package.
                    </p>
                    <div className="w-full max-w-xl mx-auto">
                      <img
                        src={image}
                        alt={value}
                        className="w-full h-auto object-contain rounded-lg shadow"
                      />
                    </div>
                  </TabPanel>
                );
              })}
            </TabsBody>
          </Tabs>
        </div>
      </section>
      {/* Authentication Messages */}
      {!currentUser && <LoginPrompt />}
      {currentUser && !isValidated && <ValidationMessage />}
      
      {/* Order Button - Only for validated users */}
      {currentUser && isValidated && (
        <div className="bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Link 
              to="/cart"
              className="px-8 py-3 bg-[#046A6A] text-white rounded-full hover:bg-[#046A6A] transition-colors text-lg font-medium"
            >
              View Cart
            </Link>
            <p className="mt-2 text-sm text-gray-600">
              Orders are processed within 24 hours and delivered within 2-3 business days.
            </p>
          </div>
        </div>
      )}

      <ProductDescriptionModal
  open={descOpen}
  onClose={closeDesc}
  title={activeDescKey ? PRODUCT_DESCRIPTIONS[activeDescKey]?.title : ""}
  description={activeDescKey ? PRODUCT_DESCRIPTIONS[activeDescKey]?.description : ""}
/>

      
      <Footer />
    </>
  );
};



export default Products;
