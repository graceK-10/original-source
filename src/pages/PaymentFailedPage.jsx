import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { apiFetch } from "../lib/api";

const PaymentFailedPage = () => {
  const [searchParams] = useSearchParams();
  const [errorDetails, setErrorDetails] = useState({
    message: "Payment was unsuccessful",
    orderId: null,
    reference: null,
    errorCode: null,
    status: null,
  });
  const [syncMessage, setSyncMessage] = useState("");

  useEffect(() => {
    const syncFailedPayment = async () => {
      const message = searchParams.get("message") || "Payment was unsuccessful";
      const reference = searchParams.get("reference") || searchParams.get("transaction_id") || searchParams.get("m_tx_id");
      const errorCode = searchParams.get("error_code");
      const status = searchParams.get("status") || searchParams.get("payment_status") || "FAILED";
      const orderId = searchParams.get("orderId") || searchParams.get("m_tx_id") || localStorage.getItem("lastOrderId");

      setErrorDetails({
        message,
        orderId,
        reference,
        errorCode,
        status,
      });

      if (!orderId) return;

      try {
        const response = await apiFetch("/api/payment/confirm-failure", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            paymentStatus: status,
            transactionId: reference,
            rawParams: Object.fromEntries(searchParams.entries()),
          }),
        });

        const result = await response.json().catch(() => ({}));
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to sync failed payment status");
        }

        setSyncMessage("Your order has been updated to failed payment in My Orders.");
      } catch (error) {
        console.error("Failed to sync failed payment:", error);
        setSyncMessage("We could not automatically update your order status, but you can retry payment from checkout.");
      }
    };

    syncFailedPayment();
  }, [searchParams]);

  const handleRetryPayment = () => {
    // Clear any stored payment data and redirect to checkout
    localStorage.removeItem("pendingPayment");
    window.location.href = "/checkout";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8">
            {/* Error Icon */}
            <div className="text-center mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-red-600 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600">
                We were unable to process your payment
              </p>
            </div>

            {/* Error Details */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-red-800 mb-2">Error Details</h3>
              <p className="text-red-700 mb-2">{errorDetails.message}</p>
              
              {errorDetails.reference && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Reference:</span> {errorDetails.reference}
                </p>
              )}

              {errorDetails.orderId && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Order ID:</span> {errorDetails.orderId}
                </p>
              )}
              
              {errorDetails.errorCode && (
                <p className="text-sm text-red-600">
                  <span className="font-medium">Error Code:</span> {errorDetails.errorCode}
                </p>
              )}

              {syncMessage && (
                <p className="text-sm text-red-700 mt-3">{syncMessage}</p>
              )}
            </div>

            {/* Common Reasons */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">
                Common reasons for payment failure:
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Insufficient funds in your account</li>
                <li>Incorrect card details or expired card</li>
                <li>Network connectivity issues</li>
                <li>Bank security restrictions</li>
                <li>Payment timeout</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRetryPayment}
                className="px-6 py-3 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a] transition-colors"
              >
                Try Payment Again
              </button>
              
              <Link
                to="/cart"
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full hover:bg-gray-300 transition-colors text-center"
              >
                Review Cart
              </Link>
              
              <Link
                to="/products"
                className="px-6 py-3 border border-[#3F0071] text-[#3F0071] rounded-full hover:bg-[#3F0071] hover:text-white transition-colors text-center"
              >
                Continue Shopping
              </Link>
            </div>

            {/* Support Information */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-center">
              <h4 className="font-medium text-gray-800 mb-2">Need Help?</h4>
              <p className="text-gray-600 mb-2">
                If you continue to experience issues, please contact our support team.
              </p>
              <p className="text-sm text-gray-500">
                Email:{" "}
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

export default PaymentFailedPage;
