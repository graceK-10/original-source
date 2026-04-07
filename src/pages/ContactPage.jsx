import { useEffect, useState } from "react";
import { useModal } from "../context/ModalContext";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import bg1 from "../assets/landscape.jpg";

const ContactPage = () => {
  const { setContactOpen } = useModal();
  // const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState("");
  const [errorType, setErrorType] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    setContactOpen(true);
    // lock page scroll for smoother modal feel
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      setContactOpen(false);
      document.body.style.overflow = prev;
    };
  }, [setContactOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setErrorType("");
    // setSubmitting(true);

    const form = e.currentTarget;
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      message: form.message.value.trim(),
    };

    try {
      const base = import.meta.env.VITE_API_BASE || "";
      const res = await fetch(`${base}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorReason = data.reason || data.error || "Unknown error";
        setErrorType(errorReason);
        throw new Error(errorReason);
      }

      if (data.testMode && data.previewUrl) {
        setPreviewUrl(data.previewUrl);
        setStatus("✅ Test email sent successfully. No actual email will be delivered in test mode.");
      } else {
        setStatus("✅ Message sent. We'll get back to you shortly.");
      }

      form.reset();
    } catch (err) {
      let errorMessage = "❌ Sorry—couldn't send your message. Please try again.";

      if (errorType.includes("authentication failed")) {
        errorMessage = "❌ Mail server authentication error. Please contact us directly at info@originalsource.co.za.";
      } else if (errorType.includes("connect to mail server")) {
        errorMessage = "❌ Couldn't connect to mail server. Please try again later or email us directly.";
      } else if (errorType.includes("timed out")) {
        errorMessage = "❌ Connection to mail server timed out. Please try again or contact us directly.";
      }

      setStatus(errorMessage);
      console.error("Contact form submission error:", err.message);
    } 
  };

  const overlayTransition = { duration: 0.25, ease: [0.16, 1, 0.3, 1] }; // smooth fade
  const panelTransition = { type: "spring", stiffness: 260, damping: 28, mass: 0.9 }; // buttery slide

  const formVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { staggerChildren: 0.05, delayChildren: 0.05 },
    },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={overlayTransition}
      className="fixed inset-0 z-50"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={overlayTransition}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
      />

      <Navbar />

      {/* Animated panel */}
      <motion.div
        initial={{ x: 40, opacity: 0, scale: 0.98 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: 40, opacity: 0, scale: 0.98 }}
        transition={panelTransition}
        className="relative z-10 w-full h-full"
      >
        <div
          className="w-full h-full bg-cover bg-center flex items-start justify-center px-4 sm:px-8 md:px-20 pt-[12rem] pb-12"
          style={{ backgroundImage: `url(${bg1})` }}
        >
          <div className="absolute inset-0 bg-[#028282]/15 z-0" />

          <div className="relative z-10 w-full max-w-xl text-white">
            <motion.form
              onSubmit={handleSubmit}
              variants={formVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6 bg-white/95 p-8 rounded-2xl shadow-2xl text-black"
            >
              <motion.div variants={itemVariants}>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#028282]"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#028282]"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#028282]"
                  required
                ></textarea>
              </motion.div>

              {status && (
                <motion.div
                  variants={itemVariants}
                  className={`p-3 rounded ${
                    status.includes("✅") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                  aria-live="polite"
                >
                  <p className="text-sm font-medium">{status}</p>

                  {previewUrl && (
                    <p className="text-xs mt-1">
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium text-blue-700 hover:text-blue-900"
                      >
                        View test email in Ethereal
                      </a>
                      <span className="block mt-1 text-gray-600">
                        (This is a test email that won&apos;t actually be delivered to info@originalsource.co.za)
                      </span>
                    </p>
                  )}

                  {!status.includes("✅") && (
                    <p className="text-xs mt-1">
                      If problems persist, please email us directly at{" "}
                      <a href="mailto:info@originalsource.co.za" className="underline hover:text-red-900">
                        info@originalsource.co.za
                      </a>
                    </p>
                  )}
                </motion.div>
              )}

<motion.button
  variants={itemVariants}
  type="submit"
  className="w-full py-3 bg-[#028282] text-white font-semibold rounded-lg shadow-md hover:bg-[#046A6A] transition"
>
  Submit
</motion.button>

            </motion.form>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactPage;
