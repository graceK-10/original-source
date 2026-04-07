// components/ProductDescriptionModal.jsx
import { useEffect } from "react";
import { RxCross2 } from "react-icons/rx";
import PropTypes from "prop-types";

export default function ProductDescriptionModal({
  open,
  onClose,
  title,
  description,
}) {
  useEffect(() => {
    if (!open) return;

    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Product description"}
    >
      {/* Backdrop */}
      <button
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-black/10">
          <h3 className="text-lg sm:text-xl font-semibold text-[#046A6A]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors"
            aria-label="Close"
          >
            <RxCross2 className="text-xl text-[#046A6A]" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm sm:text-base text-black/80 leading-relaxed whitespace-pre-line">
            {description}
          </p>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-full border border-[#046A6A] text-[#046A6A] hover:bg-[#046A6A]/10 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

ProductDescriptionModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
};

ProductDescriptionModal.defaultProps = {
  title: "",
  description: "",
};
