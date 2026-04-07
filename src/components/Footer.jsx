import { Link } from "react-router-dom";
import logo from "../assets/logos/OS-final.png";

const Footer = () => {
  return (
    <footer className="bg-white text-black px-6 lg:px-16 pb-5 pt-10 font-baloo">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-8 lg:gap-x-16 px-4 py-5 items-center sm:items-start text-center sm:text-left">
        {/* Logo */}
        <div className="flex flex-col items-center sm:items-start lg:w-[200px] mt-[0em] sm:-mt-[1em] mb-9 sm:-mb-[0em]">
          <img
            src={logo}
            alt="Original Source"
            className="h-16 sm:h-24 lg:h-32 w-auto"
          />
        </div>

        {/* Navigation */}
        <div className="text-center sm:text-left mt-[-3em] sm:-mt-3">
          <h4 className="text-black font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2 text-sm text-black">
            <li>
              <Link to="/services" className="hover:text-[#028282]">
                Services
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-[#028282]">
                Products
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-[#028282]">
                About
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="text-center sm:text-left sm:-mt-3">
          <h4 className="text-black font-semibold mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-black">
            <li>Phone: (+27) 82 345 6789</li>
            <li>
              Email:{" "}
              <a
                href="mailto:info@originalsource.co.za"
                className="hover:text-[#028282]"
              >
                info@originalsource.co.za
              </a>
            </li>
            <li>Johannesburg, South Africa</li>
          </ul>
        </div>

        {/* Social */}
        <div className="text-center sm:text-left mb-[3em] sm:mb-0 sm:-mt-3">
          <h4 className="text-black font-semibold mb-4">Follow Us</h4>
          <ul className="space-y-2 text-sm text-black">
            <li>
              <a
                href="https://www.instagram.com/originalsource"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#028282]"
              >
                Instagram ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.tiktok.com/@originalsource"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#028282]"
              >
                TikTok ↗
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/originalsource"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#028282]"
              >
                Facebook ↗
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-6">
        © {new Date().getFullYear()} Original Source. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
