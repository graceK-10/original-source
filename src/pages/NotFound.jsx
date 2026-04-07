import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const NotFound = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] flex flex-col items-center justify-center px-4 pt-24 pb-16">
        <div className="bg-white rounded-xl shadow-md p-10 text-center max-w-lg">
          <div className="mx-auto mb-6">
            <svg
              className="w-16 h-16 text-red-500 mx-auto"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          <h1 className="text-4xl font-bold text-[#3F0071] mb-2">404</h1>
          <p className="text-gray-600 mb-6">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>

          <Link
            to="/"
            className="inline-block px-6 py-3 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a] transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
