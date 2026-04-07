import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CheckoutPage = () => {
  const { cartItems, subtotal, formatPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    contact: {
      email: "",
      phone: "",
    },
    shipping: {
      address1: "",
      suburb: "",
      city: "",
      postalCode: "",
    },
    onboardingConfirmed: false,
    paymentMethod: "INSTAPAY",
  });

  // Form validation and submission state
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate("/cart");
    }
  }, [cartItems, navigate]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes(".")) {
      const [section, field] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Contact validation
    if (!formData.contact.email) {
      newErrors["contact.email"] = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.contact.email)) {
      newErrors["contact.email"] = "Email is invalid";
    }
    
    if (!formData.contact.phone) {
      newErrors["contact.phone"] = "Phone number is required";
    }
    
    // Shipping validation
    if (!formData.shipping.address1) {
      newErrors["shipping.address1"] = "Address is required";
    }
    
    if (!formData.shipping.suburb) {
      newErrors["shipping.suburb"] = "Suburb is required";
    }
    
    if (!formData.shipping.city) {
      newErrors["shipping.city"] = "City is required";
    }
    
    if (!formData.shipping.postalCode) {
      newErrors["shipping.postalCode"] = "Postal code is required";
    }
    
    // Onboarding confirmation
    if (!formData.onboardingConfirmed) {
      newErrors["onboardingConfirmed"] = "You must confirm that you have completed onboarding";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with InstaPay integration
// Handle form submission with InstaPay integration
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsSubmitting(true);
  setSubmitError("");

  try {
    // 0) Auth
    const token = localStorage.getItem("authToken");
    if (!token) throw new Error("Authentication token not found");

    // 1) Create the order on your backend (this gives you the canonical orderId)
    const orderPayload = {
      contact: {
        email: formData.contact.email,
        phone: formData.contact.phone,
      },
      shipping: {
        address1: formData.shipping.address1,
        suburb: formData.shipping.suburb,
        city: formData.shipping.city,
        postalCode: formData.shipping.postalCode,
      },
      onboardingConfirmed: formData.onboardingConfirmed,
      paymentMethod: "INSTAPAY",
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        qty: item.qty,
      })),
    };

    const createRes = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!createRes.ok) {
      const errText = await createRes.text().catch(() => "");
      throw new Error(`Create order failed (${createRes.status}): ${errText}`);
    }

    const { orderId } = await createRes.json(); // e.g. OS-20250917-001
    if (!orderId) throw new Error("Order ID missing from createOrder response");

    // Store for navbar "My Orders"
    localStorage.setItem("lastOrderId", orderId);

    // 2) Prepare InstaPay payload using the REAL orderId as m_tx_id
    const totalAmount = (subtotal / 100).toFixed(2);

    const paymentData = {
      m_tx_id: orderId, // tie payment to your server order id
      m_tx_amount: totalAmount,
      m_tx_item_name: `Order from ${cartItems.length} item(s)`,
      m_tx_item_description: `Original Source - ${cartItems.map((i) => i.name).join(", ")}`,
      b_email: formData.contact.email,
      b_name: (currentUser?.name?.split(" ")[0]) || "Customer",
      b_surname: (currentUser?.name?.split(" ").slice(1).join(" ")) || "Name",
      b_mobile: formData.contact.phone,
      // You're using HashRouter, so return to the hash route with the orderId:
      m_return_url: `${window.location.origin}/order-success/${orderId}`,
      m_notify_url: `${window.location.origin}/api/payment/notifications`,
    };

    // 3) Ask your backend to sign/initiate payment
    const paymentResponse = await fetch("/api/payment/initiate-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentData),
    });

    if (!paymentResponse.ok) {
      const errText = await paymentResponse.text().catch(() => "");
      throw new Error(`Payment init failed (${paymentResponse.status}): ${errText}`);
    }

    const paymentResult = await paymentResponse.json();
    if (!paymentResult.success) {
      throw new Error(paymentResult.error || "Failed to initiate payment");
    }

    // 4) Auto-submit InstaPay form
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "https://webpay-v2-sbox.omnea.co.za"; // Sandbox
    form.style.display = "none";

    Object.entries(paymentResult.formData).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = String(value ?? "");
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  } catch (error) {
    console.error("Payment initiation error:", error);
    setSubmitError(error.message || "An error occurred while processing your payment");
    setIsSubmitting(false);
  }
};


  useEffect(() => {
  if (currentUser) {
    setFormData(prev => ({
      ...prev,
      contact: {
        email: currentUser.email || prev.contact.email || "",
        phone: currentUser.phone || prev.contact.phone || ""
      }
    }));
  }
}, [currentUser]);


  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#3F0071] mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-[#3F0071] mb-6">
                    Complete Your Order
                  </h2>

                  {submitError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                      {submitError}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>
                    {/* Patient Information (Read-only) */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Patient Information
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={currentUser?.name || ""}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071] cursor-not-allowed"
                              disabled
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              P-Number
                            </label>
                            <input
                              type="text"
                              value={currentUser?.pNumber || ""}
                              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071] cursor-not-allowed"
                              disabled
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="contact.email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address *
                          </label>
                          <input
                            id="contact.email"
                            name="contact.email"
                            type="email"
                            value={formData.contact.email}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${
                              errors["contact.email"] ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                            placeholder="your.email@example.com"
                          />
                          {errors["contact.email"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["contact.email"]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="contact.phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number *
                          </label>
                          <input
                            id="contact.phone"
                            name="contact.phone"
                            type="tel"
                            value={formData.contact.phone}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${
                              errors["contact.phone"] ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                            placeholder="071 234 5678"
                          />
                          {errors["contact.phone"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["contact.phone"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Shipping Information */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Shipping Information
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="shipping.address1" className="block text-sm font-medium text-gray-700 mb-1">
                            Address *
                          </label>
                          <input
                            id="shipping.address1"
                            name="shipping.address1"
                            type="text"
                            value={formData.shipping.address1}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${
                              errors["shipping.address1"] ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                            placeholder="123 Main Street"
                          />
                          {errors["shipping.address1"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["shipping.address1"]}
                            </p>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="shipping.suburb" className="block text-sm font-medium text-gray-700 mb-1">
                              Suburb *
                            </label>
                            <input
                              id="shipping.suburb"
                              name="shipping.suburb"
                              type="text"
                              value={formData.shipping.suburb}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border ${
                                errors["shipping.suburb"] ? "border-red-500" : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                              placeholder="Sandton"
                            />
                            {errors["shipping.suburb"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["shipping.suburb"]}
                              </p>
                            )}
                          </div>
                          <div>
                            <label htmlFor="shipping.city" className="block text-sm font-medium text-gray-700 mb-1">
                              City *
                            </label>
                            <input
                              id="shipping.city"
                              name="shipping.city"
                              type="text"
                              value={formData.shipping.city}
                              onChange={handleChange}
                              className={`w-full px-3 py-2 border ${
                                errors["shipping.city"] ? "border-red-500" : "border-gray-300"
                              } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                              placeholder="Johannesburg"
                            />
                            {errors["shipping.city"] && (
                              <p className="mt-1 text-sm text-red-600">
                                {errors["shipping.city"]}
                              </p>
                            )}
                          </div>
                        </div>
                        <div>
                          <label htmlFor="shipping.postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                          </label>
                          <input
                            id="shipping.postalCode"
                            name="shipping.postalCode"
                            type="text"
                            value={formData.shipping.postalCode}
                            onChange={handleChange}
                            className={`w-full px-3 py-2 border ${
                              errors["shipping.postalCode"] ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-[#3F0071] focus:border-[#3F0071]`}
                            placeholder="2196"
                          />
                          {errors["shipping.postalCode"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["shipping.postalCode"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Onboarding Confirmation */}
                    <div className="mb-6">
                      <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input
                            id="onboardingConfirmed"
                            name="onboardingConfirmed"
                            type="checkbox"
                            checked={formData.onboardingConfirmed}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#3F0071] border-gray-300 rounded focus:ring-[#3F0071]"
                          />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="onboardingConfirmed" className="font-medium text-gray-700">
                            I confirm that I have completed the onboarding process *
                          </label>
                          <p className="text-gray-500">
                            <a
                              href="https://hub.synergywellness.co.za/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#3F0071] hover:underline"
                            >
                              Click here to complete onboarding
                            </a>{" "}
                            if you haven&apos;t already.
                          </p>
                          {errors["onboardingConfirmed"] && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors["onboardingConfirmed"]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-3">
                        Payment Method
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center">
                          <input
                            id="instapay"
                            name="paymentMethod"
                            type="radio"
                            value="INSTAPAY"
                            checked={formData.paymentMethod === "INSTAPAY"}
                            onChange={handleChange}
                            className="h-4 w-4 text-[#3F0071] border-gray-300 focus:ring-[#3F0071]"
                            disabled
                          />
                          <label htmlFor="instapay" className="ml-3 block text-sm font-medium text-gray-700">
                            Secure Online Payment
                          </label>
                        </div>
                        <p className="text-sm text-gray-600 mt-2 ml-7">
                          Pay securely with your credit card, debit card, or EFT. Powered by InstaPay.
                        </p>
                        <div className="flex items-center mt-3 ml-7 space-x-2">
                          <span className="text-xs text-gray-500">Accepted:</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Visa</span>
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Mastercard</span>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">EFT</span>
                        </div>
                      </div>
                    </div>

                    {/* Submit / Pay Button */}
                    <div className="mt-8">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a] transition-colors disabled:bg-[#3F0071]/50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? "Redirecting to Payment…" : "Pay Now"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold text-[#3F0071] mb-4">
                  Order Summary
                </h2>

                <div className="divide-y divide-gray-200 mb-4">
                  {cartItems.map((item) => (
                    <div key={item.variantId} className="py-3 flex justify-between">
                      <div>
                        <p className="text-gray-800">
                          {item.name} ({item.tier})
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.qty} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <p className="font-medium text-[#3F0071]">
                        {formatPrice(item.price * item.qty)}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">Free</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 mt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-[#3F0071]">{formatPrice(subtotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CheckoutPage;
