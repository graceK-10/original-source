import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const LoginPage = () => {
  const [name, setName] = useState("");
  const [pNumber, setPNumber] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [expiredPopup, setExpiredPopup] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const sessionExpired = Boolean(location.state?.sessionExpired);
  const returnPath = location.state?.from || "/products";

  useEffect(() => {
    if (!expiredPopup) return undefined;
    const timer = window.setTimeout(() => setExpiredPopup(null), 6000);
    return () => window.clearTimeout(timer);
  }, [expiredPopup]);

  const formatExpiryDate = (value) => {
    if (!value) return "an earlier date";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("en-ZA", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login(name, pNumber);
      navigate(returnPath);
    } catch (err) {
      if (err?.expired) {
        setExpiredPopup({
          name: err.nameFromServer || name || "there",
          expiryDate: formatExpiryDate(err.expiryDate),
        });
        setError("");
        return;
      }

      setError(
        err.message ||
          "Failed to log in. Please check your credentials or your SAHPRA Number may have expired."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      {expiredPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold text-[#028282]">
                  Hey {expiredPopup.name}, glad you&apos;re back.
                </h3>
                <p className="mt-3 text-gray-700">
                  So sad to say, but your S number has expired on <strong>{expiredPopup.expiryDate}</strong>.
                </p>
                <p className="mt-2 text-gray-700">
                  To access the full features of this website, please start the onboarding process again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpiredPopup(null)}
                className="text-2xl leading-none text-gray-400 hover:text-gray-700"
                aria-label="Close expired number popup"
              >
                ×
              </button>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="https://hub.synergywellness.co.za/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-[#028282] px-5 py-3 text-sm font-semibold text-white hover:bg-[#08B2B2]"
              >
                Start onboarding again
              </a>
              <button
                type="button"
                onClick={() => setExpiredPopup(null)}
                className="inline-flex items-center rounded-full border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-[#f1f1f1] pt-[15em] sm:pt-[15em] lg:pt-[13em] pb-16 px-4">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-8">
          <h2 className="text-3xl font-bold text-tertiary mb-6 text-center">
            Login
          </h2>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {sessionExpired && !error && (
            <div className="bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded mb-4">
              Your session expired. Please log in again to continue.
            </div>
          )}

          <div className="mb-6 text-center">
            <p className="text-gray-600">
              Enter your name and SAHPRA Number to access product pricing and ordering.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label htmlFor="pNumber" className="block text-sm font-medium text-gray-700 mb-1">
                SAHPRA Number
              </label>
              <input
                id="pNumber"
                type="text"
                value={pNumber}
                onChange={(e) => setPNumber(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your SAHPRA Number"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#028282] text-white py-2 px-4 rounded-md hover:bg-[#08B2B2] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition duration-200"
              >
                {isLoading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Your SAHPRA Number is provided by your healthcare provider.
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default LoginPage;
