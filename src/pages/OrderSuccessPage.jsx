import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../CartContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const OrderSuccessPage = () => {
  const { orderId } = useParams();
  const isCanonicalId = /^OS-\d{8}-\d{3}$/.test(orderId || "");
  const { currentUser } = useAuth();
  const { formatPrice } = useCart();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const paymentStatus = String(order?.payment?.status || "pending").toLowerCase();
  const isPaid = paymentStatus === "paid" || paymentStatus === "completed";

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Authentication token not found");
        }

        const response = await fetch(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch order details");
        }

        const data = await response.json();
        setOrder(data);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError(err.message || "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    if (orderId && isCanonicalId) { fetchOrder(); }
  }, [orderId]);

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3F0071] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading order details...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
            <h1 className="text-3xl font-bold text-red-600 mb-4">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link
              to="/products"
              className="inline-block px-6 py-2 bg-[#028282] text-white rounded-full hover:bg-[#08B2B2] transition-colors"
            >
              Return to Products
            </Link>
          </div>
          {!isCanonicalId && (
  <p className="text-gray-600">
    This link uses an old or invalid order reference. Please place a new order, or use “My Orders” after checkout.
  </p>
)}

        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Success Message */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8 text-center mt-12">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-[#028282] mb-2">
              Order Confirmed!
            </h1>
            <p className="text-gray-600 mb-4">
              Thank you for your order. Your order number is:
            </p>
            <p className="text-xl font-semibold text-[#028282] mb-6">
              {orderId}
            </p>
            {isPaid ? (
              <p className="text-gray-600">
                Your payment has been confirmed. A confirmation email has been sent to{" "}
                {order?.customer?.email || currentUser?.email || "your email address"}.
              </p>
            ) : (
              <div className="text-gray-600 space-y-2">
                <p>Your order was received and your payment is still being confirmed.</p>
                <p>
                  Confirmation email and WhatsApp updates are only sent after InstaPay marks the
                  payment as completed.
                </p>
              </div>
            )}
          </div>

          {/* Order Details */}
          {order && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-[#028282] mb-6">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Items
                  </h3>
                  <div className="divide-y divide-gray-200">
                    {order.items.map((item) => (
                      <div
                        key={item.variantId}
                        className="py-3 flex justify-between"
                      >
                        <div>
                          <p className="text-gray-800">
                            {item.productName} ({item.variantName})
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.qty} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-medium text-[#028282]">
                          {formatPrice(item.itemTotal)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Totals */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Totals
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span className="font-medium">
                          {formatPrice(order.totals.subtotal)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-medium">
                          {formatPrice(order.totals.shipping)}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-[#028282]">
                            {formatPrice(order.totals.grandTotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Shipping Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-1">
                      <span className="font-medium">Address:</span>{" "}
                      {order.shipping.address1}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">Suburb:</span>{" "}
                      {order.shipping.suburb}
                    </p>
                    <p className="mb-1">
                      <span className="font-medium">City:</span>{" "}
                      {order.shipping.city}
                    </p>
                    <p>
                      <span className="font-medium">Postal Code:</span>{" "}
                      {order.shipping.postalCode}
                    </p>
                  </div>
                </div>

                {/* Payment Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">
                    Payment Information
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="mb-1">
                      <span className="font-medium">Method:</span>{" "}
                      {order.payment.method}
                    </p>
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <span className={isPaid ? "text-green-700 font-medium" : "text-amber-700 font-medium"}>
                        {order.payment.status}
                      </span>
                    </p>

                    {/* EFT Instructions */}
                    {order.payment.method === "EFT" && (
                      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">
                          EFT Payment Instructions
                        </h4>
                        <p className="text-sm text-gray-700 mb-2">
                          Please make payment to the following account:
                        </p>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Reference:</span> OS-{orderId}
                        </p>
                        <p className="text-sm text-gray-700 mt-2">
                          Please include your order reference in the payment description.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-[#028282]/5 border border-[#028282]/20 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-[#028282] mb-2">
                    What&apos;s Next?
                  </h3>
                  <p className="text-gray-700 mb-2">
                    We&apos;ll process your order and be in touch shortly with shipping details.
                  </p>
                  <p className="text-gray-700">
                    If you have any questions, please contact our support team at{" "}
                    <a
                      href="mailto:info@originalsource.co.za"
                      className="text-[#028282] hover:underline"
                    >
                      info@originalsource.co.za
                    </a>
                  </p>
                </div>

                {/* Continue Shopping Button */}
                <div className="mt-8 text-center">
                  <Link
                    to="/products"
                    className="inline-block px-6 py-3 bg-[#028282] text-white rounded-full hover:bg-[#08B2B2] transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </> 
  );
};

export default OrderSuccessPage;
