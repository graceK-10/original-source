import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import HomePage from "./pages/HomePage";
import Services from "./pages/ServicesPage";
import Products from "./pages/ProductsPage"; 
import About from "./pages/AboutPage"; 
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PaymentFailedPage from "./pages/PaymentFailedPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import FontPreviewPage from "./pages/FontPreviewPage";
import LoadingScreen from "./components/LoadingScreen"; 
import NotFound from "./pages/NotFound";
import PrescriptionPage from "./pages/PrescriptionPage";
import BenefitsPage from "./pages/BenefitsPage";
import PrivateRoute from "./components/PrivateRoute";
import { ModalProvider } from "./context/ModalContext";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./CartContext";
import "./index.css";

// 🧭 Custom wrapper to control loading by route
const RouteWrapper = () => {
  const location = useLocation();
const [firstLoad, setFirstLoad] = useState(true);
const [showLoader, setShowLoader] = useState(false);

useEffect(() => {
  let timer;

  if (firstLoad) {
    // Show loader only once when app first mounts
    setShowLoader(true);
    timer = setTimeout(() => {
      setShowLoader(false);
      setFirstLoad(false);
    }, 600);
  } else {
    // No loader on other pages
    setShowLoader(false);
  }

  return () => {
    if (timer) clearTimeout(timer);
  };
}, [location.pathname, firstLoad]);

  return (
    <>
      <AnimatePresence>{showLoader && <LoadingScreen />}</AnimatePresence>

      {/* Page fade-in on every route change (independent of the loader) */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
      >
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/fonts" element={<FontPreviewPage />} />
          <Route path="/prescription-benefits" element={<PrescriptionPage />} />
          <Route path="/benefits-of-medical-cannabis" element={<BenefitsPage />} />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <CheckoutPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <PrivateRoute>
                <MyOrdersPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/checkout/order-success/:orderId"
            element={
              <PrivateRoute>
                <OrderSuccessPage />
              </PrivateRoute>
            }
          />
          <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
          <Route path="/checkout/failed" element={<PaymentFailedPage />} />
          <Route
            path="/checkout/success"
            element={
              <PrivateRoute>
                <PaymentSuccessPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </>
  );
};

const App = () => {
  const isTestPath = window.location.pathname.startsWith("/test");
  const basename = isTestPath ? "/test" : "/";

  if (import.meta.env.DEV) {
    console.log("[App] Running with basename:", basename);
  }

  return (
    <AuthProvider>
      <CartProvider>
        <ModalProvider>
          <BrowserRouter basename={basename}>
            <RouteWrapper />
          </BrowserRouter>
        </ModalProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
