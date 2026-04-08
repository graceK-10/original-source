import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const isFailureStatus = (status) => {
  const normalized = String(status || "").trim().toLowerCase();
  return ["failed", "failure", "cancelled", "canceled", "expired", "declined", "error"].includes(normalized);
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, formatPrice } = useCart();
  useAuth();
  
  const [processing, setProcessing] = useState(true);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [confirmed, setConfirmed] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Confirming your payment with our server...");

  useEffect(() => {
    const processPaymentReturn = async () => {
      try {
        const transactionId = searchParams.get("transaction_id") || searchParams.get("m_tx_id") || localStorage.getItem("lastOrderId");
        const paymentId = searchParams.get("payment_id") || searchParams.get("pf_payment_id");
        const paymentStatus = searchParams.get("payment_status") || searchParams.get("status");
        const amount = searchParams.get("amount_gross") || searchParams.get("amount");
        const lastOrderId = searchParams.get("orderId") || searchParams.get("m_tx_id") || localStorage.getItem("lastOrderId");
        const successToken = searchParams.get("st") || localStorage.getItem("lastOrderSuccessToken");
        
        console.log("Payment return parameters:", {
          transactionId,
          paymentId,
          paymentStatus,
          amount,
          allParams: Object.fromEntries(searchParams.entries())
        });

        setPaymentDetails({
          transactionId,
          paymentId,
          paymentStatus,
          amount,
        });

        if (isFailureStatus(paymentStatus)) {
          const failureParams = new URLSearchParams();
          if (lastOrderId) failureParams.set("orderId", lastOrderId);
          if (transactionId) failureParams.set("reference", transactionId);
          if (paymentStatus) failureParams.set("status", paymentStatus);
          if (paymentId) failureParams.set("paymentId", paymentId);
          navigate(`/checkout/failed?${failureParams.toString()}`, { replace: true });
          return;
        }

        if (!lastOrderId) {
          throw new Error("No order reference found. Please contact support with your payment reference.");
        }

        if (!successToken) {
          throw new Error("Invalid or incomplete payment success link. Please contact support with your order reference.");
        }

        setOrderId(lastOrderId);

        const response = await apiFetch("/api/payment/confirm-success", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: lastOrderId,
            token: successToken,
            paymentStatus,
            paymentId,
            transactionId,
            amount,
            rawParams: Object.fromEntries(searchParams.entries()),
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to confirm payment");
        }

        let verified = Boolean(result.verified);
        let resolvedOrder = result.order || null;

        if (!verified && lastOrderId) {
          setStatusMessage("Payment return received. Finalising your order now...");

          for (let attempt = 0; attempt < 6; attempt += 1) {
            await sleep(2000);
            const statusRes = await apiFetch(`/api/payment/status/${encodeURIComponent(lastOrderId)}`);
            const statusJson = await statusRes.json().catch(() => ({}));
            if (statusRes.ok && statusJson?.paymentStatus === "paid") {
              verified = true;
              resolvedOrder = statusJson.order || resolvedOrder;
              break;
            }
          }

          if (!verified) {
            setStatusMessage("Still waiting for confirmation. Running final payment recovery...");

            const rescueRes = await apiFetch("/api/payment/resend-notifications", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderId: lastOrderId,
                markPaid: true,
                paymentId,
                transactionId,
                amount,
              }),
            });

            const rescueJson = await rescueRes.json().catch(() => ({}));
            if (rescueRes.ok && rescueJson?.success) {
              verified = true;
              resolvedOrder = rescueJson.order || resolvedOrder;
            }
          }
        }

        clearCart();
        localStorage.removeItem("pendingPayment");
        localStorage.removeItem("lastOrderSuccessToken");
        localStorage.setItem("hasOrder", "true");
        localStorage.setItem("lastOrderId", lastOrderId);

        setConfirmed(verified);
        setStatusMessage(
          verified
            ? "Your payment has been confirmed and your notifications have been queued."
            : "Your payment return was received, but the order is still waiting for confirmation."
        );

        if (verified) {
          setTimeout(() => {
            navigate(`/my-orders`, { replace: true });
          }, 1200);
        }
        
      } catch (err) {
        console.error("Error processing payment return:", err);
        setError(err.message);
      } finally {
        setProcessing(false);
      }
    };

    processPaymentReturn();
  }, [searchParams, clearCart, navigate]);

  // Loading state
  if (processing) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3F0071] mx-auto mb-4"></div>
            <p className="text-gray-600">Processing your payment...</p>
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
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Processing Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate("/checkout")}
                className="px-6 py-2 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a] transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Success state
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Success Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-green-600 mb-2">
                {confirmed ? "Payment Successful!" : "Payment Received"}
              </h1>
              <p className="text-gray-600">
                {statusMessage}
              </p>
            </div>

            {/* Payment Details */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-2">Payment Details</h3>
              
              {paymentDetails.transactionId && (
                <p className="text-sm text-green-700 mb-1">
                  <span className="font-medium">Transaction ID:</span> {paymentDetails.transactionId}
                </p>
              )}
              
              {paymentDetails.paymentId && (
                <p className="text-sm text-green-700 mb-1">
                  <span className="font-medium">Payment ID:</span> {paymentDetails.paymentId}
                </p>
              )}
              
              {paymentDetails.amount && (
                <p className="text-sm text-green-700">
                  <span className="font-medium">Amount:</span> {formatPrice(parseFloat(paymentDetails.amount) * 100)}
                </p>
              )}
            </div>

            <div className={`${confirmed ? "bg-blue-50 border-blue-200" : "bg-yellow-50 border-yellow-200"} border rounded-lg p-4 mb-6`}>
              <h3 className={`font-medium mb-2 ${confirmed ? "text-blue-800" : "text-yellow-800"}`}>
                {confirmed ? "Order Confirmed" : "Pending Verification"}
              </h3>
              <p className={confirmed ? "text-blue-700" : "text-yellow-700"}>
                {confirmed
                  ? `Your order #${orderId} has been confirmed. Redirecting you to your order details now.`
                  : `Your order #${orderId} was found, but we are still waiting for final payment confirmation. Please refresh shortly or check My Orders.`}
              </p>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-2">What&apos;s Next?</h3>
              <ul className="text-gray-700 space-y-1">
                <li>• You will receive an order confirmation email after payment is confirmed</li>
                <li>• We will process and prepare your order</li>
                <li>• You&apos;ll get shipping details once your order is dispatched</li>
                <li>• Contact us if you have any questions</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {orderId && (
                <button
                  onClick={() => navigate(`/my-orders`)}
                  className="px-6 py-3 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a] transition-colors"
                >
                  Continue to My Orders
                </button>
              )}
              
              <button
                onClick={() => navigate("/products")}
                className="px-6 py-3 border border-[#3F0071] text-[#3F0071] rounded-full hover:bg-[#3F0071] hover:text-white transition-colors"
              >
                Continue Shopping
              </button>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <p className="text-gray-600 mb-2">
                Questions about your order?
              </p>
              <p className="text-sm text-gray-500">
                Contact us at{" "}
                <a
                  href="mailto:support@synergywellness.co.za"
                  className="text-[#3F0071] hover:underline"
                >
                  support@synergywellness.co.za
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccessPage;
