import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { useModal } from "../context/ModalContext";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import ogSourceLogo from "../assets/logos/OS-final.png";
import { RxHamburgerMenu } from "react-icons/rx";
import { RxCross2 } from "react-icons/rx";
import { FiShoppingCart } from "react-icons/fi";
import "../index.css";
import { useCart } from "../CartContext";
import logo from "../assets/logos/OS-final.png";
import bgDesktop from "../assets/landscape2.jpg";

const Navbar = () => {
  const [menu, setMenu] = useState(false);
  const [activeContentIndex, setActiveContentIndex] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isSpecialPage, setIsSpecialPage] = useState(false);
  // top of component
const [contactAnimating, setContactAnimating] = useState(false);

  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const location = useLocation();
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const { contactOpen, setContactOpen } = useModal();
  const { currentUser, logout, checkUserPaidOrders } = useAuth();

  // Check for paid orders when the user menu is openednpm run dev
  useEffect(() => {
    if (userMenuOpen && currentUser) {
      checkUserPaidOrders();
    }
  }, [userMenuOpen, currentUser, checkUserPaidOrders]);

  const toggleMenu = () => {
    setMenu(!menu);
  };


const handleContactClick = () => {
  setMenu(false); // Always close the mobile menu first
  setContactAnimating(true);

  if (contactOpen) {
    // 🔹 If contact is open, close it and go home
    setContactOpen(false);
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigate("/");
        setTimeout(() => setContactAnimating(false), 350);
      }, 80);
    });
  } else {
    // 🔹 Otherwise, open the contact page with smooth transition
    setContactOpen(true);
    requestAnimationFrame(() => {
      setTimeout(() => {
        navigate("/contact");
        setTimeout(() => setContactAnimating(false), 350);
      }, 80);
    });
  }
};



  // Used to show the active page on the navbar
  const handleNavClick = (index) => {
    setActiveContentIndex(index);
  };

  useEffect(() => {
  if (menu) {
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => { document.documentElement.style.overflow = prev; };
  }
}, [menu]);


  // Using use effect to set the activeContentIndex based on the current path.
  useEffect(() => {
    // Set active index based on the current path
    switch (location.pathname) {
      case "/services":
        setActiveContentIndex(1);
        setIsSpecialPage(false);
        break;
      case "/products":
        setActiveContentIndex(2);
        setIsSpecialPage(false);
        break;
      case "/about":
        setActiveContentIndex(3);
        setIsSpecialPage(false);
        break;
      case "/contact":
        setActiveContentIndex(4);
        setIsSpecialPage(false);
        break;
      case "/my-orders":
        setActiveContentIndex(5);
        setIsSpecialPage(false);
        break;
      case "/cart":
        setActiveContentIndex(6);
        setIsSpecialPage(false);
        break;
        case "/prescription-benefits":
        setActiveContentIndex(7);
        setIsSpecialPage(false);
        break;
         case "/benefits-of-medical-cannabis":
        setActiveContentIndex(8);
        setIsSpecialPage(false);
        break;
      case "/fonts":
        setActiveContentIndex(0);
        setIsSpecialPage(true);
        break;
      default:
        setActiveContentIndex(0);
        setIsSpecialPage(false);
        break;
    }
  }, [location.pathname]);

  const navVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  useEffect(() => {
  if (isMobile) {
    // Adjust the path to your actual file:
    import("../pages/ContactPage").catch(() => {});
  }
}, [isMobile]);


  const itemVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  };

useEffect(() => {
  const onResize = () => {
    setIsMobile(window.innerWidth < 1024);
  };
  const onScroll = () => {
    setShowScrollTop(window.scrollY > 300);
  };

  // initialize on mount
  onResize();
  onScroll();

  window.addEventListener("resize", onResize);
  window.addEventListener("scroll", onScroll, { passive: true });

  return () => {
    window.removeEventListener("resize", onResize);
    window.removeEventListener("scroll", onScroll);
  };
}, []);


useEffect(() => {
  const prev = document.body.style.overflow;
  document.body.style.overflow = menu ? "hidden" : "";
  return () => { document.body.style.overflow = prev; };
}, [menu]);



  return (
   <header className="sticky w-full z-[100] transition-colors duration-500 h-[0.01rem]">
    {contactAnimating && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[120] bg-black/70 flex items-center justify-center"
    style={{ willChange: "opacity" }}
  >
  </motion.div>
)}
<motion.nav
  className={`w-full flex justify-between items-center px-6 lg:px-16 shadow-md font-roboto h-[9rem] transition-colors duration-500
  ${isSpecialPage ? "bg-white/70 text-black" : "bg-black/40 text-white"}
  backdrop-blur-0 md:backdrop-blur-md`}

        variants={navVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Logo */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 text-sm h-full ml-0 md:ml-0"
        >
          <img
            src={ogSourceLogo}
            alt="OG Source Logo"
             className="w-28 h-28 sm:w-32 sm:h-32 lg:w-28 lg:h-28 object-contain rounded-full"
/>
        </motion.div>

        <motion.div
          id="tabs"
          className="hidden lg:flex absolute right-1/2 translate-x-1/2 items-center gap-2 font-normal text-lg mr-16"
        >
          <motion.div variants={itemVariants}>
            <Link
              to="/"
              className={`nav-link hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full
                ${activeContentIndex === 0 ? "active" : ""}`}
              onClick={() => handleNavClick(0)}
            >
              HOME
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Link
              to="/about"
              className={`nav-link hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full 
        ${activeContentIndex === 3 ? "active" : ""}`}
              onClick={() => handleNavClick(3)}
            >
              ABOUT
            </Link>
          </motion.div>

          {/* SERVICES LINK */}
          <motion.div variants={itemVariants}>
            <Link
              to="/services"
              className={`nav-link flex items-center gap-2 hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full
      ${activeContentIndex === 1 ? "active" : ""}`}
              onClick={() => handleNavClick(1)}
            >
              SERVICES
            </Link>
          </motion.div>

          {/* PRODUCTS LINK */}
          <motion.div variants={itemVariants}>
            <Link
              to="/products"
              className={`nav-link flex items-center gap-2 hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full
      ${activeContentIndex === 2 ? "active" : ""}`}
              onClick={() => handleNavClick(2)}
            >
              PRODUCTS
            </Link>
          </motion.div>

               {/* PRESCRIPTIONS LINK */}
          <motion.div variants={itemVariants}>
            <Link
              to="/prescription-benefits"
              className={`nav-link flex items-center gap-2 hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full
      ${activeContentIndex === 7 ? "active" : ""}`}
              onClick={() => handleNavClick(2)}
            >
              PRESCRIPTIONS
            </Link>
          </motion.div>

                    {/* BENEFITS LINK */}
          <motion.div variants={itemVariants}>
            <Link
              to="/benefits-of-medical-cannabis"
              className={`nav-link flex items-center gap-2 hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full
      ${activeContentIndex === 8 ? "active" : ""}`}
              onClick={() => handleNavClick(2)}
            >
              BENEFITS
            </Link>
          </motion.div>



          {/* CART LINK (desktop) — only when logged in */}
          {currentUser && (
            <motion.div variants={itemVariants}>
              <Link
                to="/cart"
className={`nav-link flex items-center gap-2 hover:text-[#33C4C4] hover:border-b-[#33C4C4] border-r-[#33C4C4] px-5 py-1 rounded-full relative ${activeContentIndex === 6 ? "active" : ""}`}
                aria-label="Cart"
                onClick={() => setActiveContentIndex(6)}
              >
                <FiShoppingCart className="text-xl" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#33C4C4] text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="hidden lg:flex items-center gap-4"
        >
{/* Contact Button */}
<button
  onClick={handleContactClick}
  className="
    mr-0
    inline-flex items-center gap-2
    px-6 py-3
    rounded-full
    border border-transparent
    text-white
    font-normal font-roboto
    transition-all duration-300 ease-in-out
    hover:border-white
    hover:text-white
  "
>
  <span className="transition-transform duration-300 group-hover:translate-x-1">
    CONTACT
  </span>

  {contactOpen ? (
    <RxCross2 className="text-lg" />
  ) : (
    <svg
      className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        clipRule="evenodd"
        fillRule="evenodd"
        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
      />
    </svg>
  )}
</button>


          {/* Authentication Buttons */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-0 px-4 py-2 rounded-full border border-[#33C4C4] text-[#33C4C4] hover:bg-[#33C4C4]/10 transition-colors"
              >
                <span>My Account</span>
                <svg
                  className={`w-4 h-4 transition-transform ${
                    userMenuOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    {currentUser.name || currentUser.email}
                  </div>

                  {/* Show "My Orders" for all authenticated users */}
                  {currentUser && (
                    <Link
                      to="/my-orders"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  )}

                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Products
                  </Link>
                  <button
                    onClick={() => {
                      localStorage.removeItem("hasOrder");
                      localStorage.removeItem("lastOrderId");
                      logout();
                      setUserMenuOpen(false);
                      navigate("/");
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-full bg-[#028282] text-white hover:bg-[#046A6A] transition-colors"
              >
                Login
              </Link>
            </div>
          )}
        </motion.div>

        {/* navbar open and close responsive icon */}
<button
  type="button"
  aria-label={menu ? "Close menu" : "Open menu"}
  className="lg:hidden sm:pr-[2rem] flex items-center p-3 -mr-3 active:scale-95 transition"
  onClick={toggleMenu}
>
  {menu ? <RxCross2 size={25} /> : <RxHamburgerMenu size={25} />}
</button>

      </motion.nav>

{/* Responsive section with close X */}
{/* Responsive section with image background and black overlay */}
<motion.div
  initial={false}
  animate={menu && (!contactOpen || isMobile) ? { y: 0, opacity: 1 } : { y: -16, opacity: 0 }}
  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
  className={`
    fixed inset-0
    font-roboto flex flex-col items-center text-xl sm:text-lg gap-6 pt-6 pb-8
    z-[9999]
    h-screen overflow-y-auto
  `}
  style={{
    backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.55)), url(${bgDesktop})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    willChange: "transform, opacity",
    pointerEvents: menu ? "auto" : "none",
  }}
>
  {/* Content */}
  <div className="relative z-10 w-full flex flex-col items-center text-white">
    <div className="w-full flex justify-end pr-5 mt-9">
      <RxCross2
        size={28}
        onClick={() => setMenu(false)}
        className="text-white cursor-pointer hover:text-[#08B2B2] transition-colors duration-300"
      />
    </div>


<Link
  to="/"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-2 rounded-lg
    ${location.pathname === "/" 
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  HOME
</Link>


<Link
  to="/about"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/about"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2  hover:border-[#08B2B2]"}`}
>
  ABOUT
</Link>

<Link
  to="/services"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/services"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  SERVICES
</Link>

<Link
  to="/products"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/products"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  PRODUCTS
</Link>

<Link
  to="/prescription-benefits"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/prescription-benefits"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  PRESCRIPTIONS
</Link>

<Link
  to="/benefits-of-medical-cannabis"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/benefits-of-medical-cannabis"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  BENEFITS
</Link>

<Link
  to="/contact"
  onClick={() => setMenu(false)}
  className={`transition duration-200 ease-linear px-2 py-3 rounded-lg 
    ${location.pathname === "/contact"
      ? "text-[#08B2B2] border-b-2 border-[#08B2B2]" 
      : "text-white hover:text-[#08B2B2] hover:border-b-2 hover:border-[#08B2B2]"}`}
>
  CONTACT
</Link>


        {/* Mobile Authentication Links */}
        {currentUser ? (
          <>
<div className="text-center">
  <span className="inline-block bg-white px-4 py-1 rounded-3xl font-normal text-[#028282]">
    {currentUser.name || currentUser.email}
  </span>
</div>

            <button
              onClick={() => {
                logout();
                setMenu(false);
                navigate("/");
              }}
              className="text-red-600 hover:text-tertiary transition duration-200 ease-linear hover:border-b-2 px-2 py-3 rounded-lg hover:border-tertiary"
            >
              LOGOUT
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="hover:text-tertiary transition duration-200 ease-linear hover:border-b-2 px-2 py-3 rounded-lg hover:border-tertiary"
              onClick={() => setMenu(false)}
            >
              LOGIN
            </Link>
          </>
        )}

        {/* Paste from here down: */}
        <div className="mt-6 text-center text-base font-light">
          <p className="mb-6 text-white">(+27) 82 345 6789</p>
          <a
            href="mailto:info@originalsource.co.za"
            className="inline-flex items-center gap-2 border border-black px-4 py-2 rounded-full hover:bg-black hover:text-[#fff] transition tracking-wider"
          >
            info@originalsource.co.za
            <span className="text-xl">→</span>
          </a>
        </div>
        <div className="my-3 text-center text-base tracking-wider text-white/70 font-light">
          <p className="mb-3 uppercase tracking-widest text-white">Follow us</p>
          <div className="flex flex-col gap-2 text-white font-normal">
            <a
              href="https://www.tiktok.com/@originalsource"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 hover:underline"
            >
              TikTok <span className="text-sm">↗</span>
            </a>
            <a
              href="https://www.instagram.com/originalsource"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 hover:underline"
            >
              Instagram <span className="text-sm">↗</span>
            </a>
            <a
              href="https://www.facebook.com/originalsource"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 hover:underline"
            >
              Facebook <span className="text-sm">↗</span>
            </a>

            {/* Logo - visible only on small devices */}
            <div className="block sm:hidden mt-4">
              <img
                src={logo}
                alt="Original Source Logo"
                className="h-32 mx-auto mb-5 rounded-full mt-10"
              />
            </div>
          </div>
        </div>
      </div>
      {showScrollTop && !menu && (
   <button
     onClick={scrollToTop}
     aria-label="Scroll to top"
     className="fixed bottom-6 right-6 z-[110] rounded-full p-3 bg-[#028282] text-white shadow-lg hover:scale-[1.03] transition-transform"
   >
     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
       <path fillRule="evenodd" d="M10 3a.75.75 0 0 1 .53.22l5 5a.75.75 0 1 1-1.06 1.06L10 4.81 5.53 9.28a.75.75 0 0 1-1.06-1.06l5-5A.75.75 0 0 1 10 3Zm0 5a.75.75 0 0 1 .75.75v7.5a.75.75 0 0 1-1.5 0v-7.5A.75.75 0 0 1 10 8Z" clipRule="evenodd" />
     </svg>
   </button>
 )}
 {/* </div> */}
 </motion.div>

    </header>
  );
};

export default Navbar;
