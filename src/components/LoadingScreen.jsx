import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";
import logo from "../assets/logos/OS-final.png";

const LoadingScreen = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [ready, setReady] = useState(false);

  // ✅ Preload the logo for smooth mobile animation
  useEffect(() => {
    const img = new Image();
    img.src = logo;
    img.onload = () => setReady(true);
    img.onerror = () => setReady(true);
  }, []);

  // ✅ Control total visibility (spin + 0.5 s hold)
  useEffect(() => {
    if (!ready) return;
    const totalDuration = 1100; // 0.6 s spin + 0.5 s hold
    const timer = setTimeout(() => {
      setIsVisible(false);
      onFinish && onFinish();
    }, totalDuration);
    return () => clearTimeout(timer);
  }, [ready, onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[999] flex items-center justify-center bg-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          style={{ willChange: "opacity" }}
        >
          <motion.img
            src={logo}
            alt="Original Source"
            className="object-contain select-none w-32 sm:w-40 md:w-48 lg:w-56 h-auto"
            initial={{ opacity: 0, scale: 0.8, rotate: 0 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            exit={{ opacity: 0, scale: 1, rotate: 360 }}
            transition={{
              duration: 0.6,               // spin duration
              ease: [0.22, 1, 0.36, 1],   // smooth ease
            }}
            style={{
              willChange: "transform, opacity",
              transform: "translateZ(0)", // GPU acceleration
            }}
            draggable={false}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

LoadingScreen.propTypes = {
  onFinish: PropTypes.func,
};

export default LoadingScreen;
