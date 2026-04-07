/**
 * InstaPay WebPay V2 Gateway Service
 * Implementation based on InstaPay WebPay V2 Gateway Developer Guide
 * Updated for WebPay V2 integration
 */
import md5 from "md5";
import axios from "axios";

// Configuration constants - Updated for WebPay V2
export const INSTAPAY_WEBPAY_SANDBOX_URL = "https://webpay-v2-sbox.omnea.co.za";
export const INSTAPAY_WEBPAY_LIVE_URL = "https://webpay-v2.omnea.co.za";
// Fallback URL for payment processing
export const INSTAPAY_FALLBACK_URL = "https://webpay-fallback.omnea.co.za";

// Detect environment
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

// Helper function to get base URL
const getBaseUrl = () => {
  if (isBrowser) {
    return window.location.origin;
  }
  // Server-side fallback - use environment variable or default
  return (
    process.env.INSTAPAY_MAIN_URL || "http://localhost:3000"
  );
};

// Load environment variables
const getEnvVar = (key) => {
  // In browser, try to get from process.env (populated by webpack)
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }

  // Fallback for development
  const envVars = {
    INSTAPAY_MEMBER_ID: "KT2Ta25wWjhX",
    INSTAPAY_IACCOUNT_ID: "KT2Ta25wWjhX",
  };

  return envVars[key] || "";
};

// Default configuration - updated with values from environment variables
const DEFAULT_CONFIG = {
  // Test mode flag - set to false for production
  testMode: true,

  // Merchant details from environment variables
  merchantUuid: getEnvVar("INSTAPAY_MEMBER_ID"),
  merchantAccountUuid: getEnvVar("INSTAPAY_IACCOUNT_ID"),
  merchantShortCode: "SWO", // Updated routing code provided by Omnea

  // Security key for WebPay V2
  securityKey: getEnvVar("INSTAPAY_SECURITY_KEY"),

  // Payment methods configuration - UPDATED to enable all methods for testing
  paymentMethods: {
    card: true, // Credit/Debit card payments
    instantEft: true, // Instant EFT payments
    scanToPay: true, // QR code payments
    chips: false, // CHIPS payments (not required for testing)
    payAt: true, // Pay@Deposits
    zapper: true, // Zapper payments (new in V2)
    snapscan: true, // SnapScan payments (new in V2)
  },

  // WebPay V2 specific settings
  webPayV2: {
    version: "2.0",
    apiVersion: "2023-05-01",
    checkoutType: "iframe", // Changed from 'redirect' to 'iframe' to show payment form within our app
  },
};

// Add callback URLs based on environment variables or fallback to constructed URLs
const baseUrl = getBaseUrl();
DEFAULT_CONFIG.returnUrl =
  process.env.INSTAPAY_SUCCESS_URL || `${baseUrl}/payment-success`;
DEFAULT_CONFIG.cancelUrl =
  process.env.INSTAPAY_FAILURE_URL || `${baseUrl}/payment-failed`;
DEFAULT_CONFIG.notifyUrl =
  process.env.INSTAPAY_NOTIFICATION_URL ||
  `${baseUrl}/api/payment/notifications`;
DEFAULT_CONFIG.backToShopUrl =
  process.env.INSTAPAY_SHOP_URL || `${baseUrl}/products`;

// Service configuration - can be updated at runtime
let config = { ...DEFAULT_CONFIG };

/**
 * Updates the service configuration
 * @param {Object} newConfig - New configuration values
 */
export const updateConfig = (newConfig) => {
  config = { ...config, ...newConfig };
};

/**
 * Calculates the checksum for the payment request
 * @param {Object} paymentData - Payment data
 * @returns {string} - MD5 checksum
 */
const calculateChecksum = (paymentData) => {
  const amountInCents = Math.round(paymentData.amount * 100).toString();

  const checksumString = [
    config.merchantUuid,
    config.merchantAccountUuid,
    paymentData.transactionId,
    amountInCents,
    "ZAR",
    config.securityKey,
  ].join("_");

  console.log("✅ Using security key:", config.securityKey);
  console.log("🔐 Checksum string:", checksumString);

  const checksum = md5(checksumString);
  console.log("🔐 MD5 Checksum:", checksum);

  return checksum;
};

/**
 * Creates a form for InstaPay WebPay V2 Gateway submission
 * @param {Object} paymentData - Payment data
 * @returns {HTMLFormElement|Object} - Form element ready for submission or form data object for server-side
 */
export const createPaymentForm = (paymentData) => {
  // Get transaction details
  const transactionId = paymentData.transactionId || `TX-${Date.now()}`;
  const orderNumber = `${config.merchantShortCode}${Date.now()}`;

  // Calculate checksum
  const checksum = calculateChecksum({
    ...paymentData,
    transactionId,
  });

  // Prepare form data - Updated for WebPay V2 format with all required fields
  const formData = {
    // WebPay V2 version information
    api_version: config.webPayV2.apiVersion,
    checkout_type: config.webPayV2.checkoutType,

    // Merchant details
    m_uuid: config.merchantUuid,
    m_account_uuid: config.merchantAccountUuid,
    m_site_name: paymentData.merchantSiteName || "Original Source",

    // Transaction details
    transaction_id: transactionId,
    order_number: paymentData.orderNumber || orderNumber,
    currency: "ZAR",
    amount: paymentData.amount.toFixed(2),
    item_name: paymentData.itemName || paymentData.m_tx_item_name || "Online Purchase",
    item_description: paymentData.itemDescription || paymentData.m_tx_item_description || "Synergy Medibles | No description",

    // Buyer details
    customer_name: paymentData.customerName,
    customer_surname: paymentData.customerSurname,
    customer_email: paymentData.customerEmail,
    customer_mobile: paymentData.customerMobile,

    // Payment methods configuration - use provided payment methods or fallback to config
    payment_methods: {
      card: true,
      instant_eft: false,
      scan_to_pay: false,
      chips: false,
      payat: false,
      zapper: false,
      snapscan: false,
    },

    // Callback URLs
    return_url: paymentData.m_return_url || config.returnUrl,
    notify_url: paymentData.m_notify_url || config.notifyUrl,
    cancel_url: config.cancelUrl,
    back_to_shop_url: config.backToShopUrl,

    // Checksum
    checksum: checksum,
  };

  // Convert payment_methods object to individual fields for form submission
  // WebPay V2 still requires individual fields for the form
  const flattenedFormData = {
    ...formData,
    card_allowed: "true",
    instant_eft_allowed: "false",
    scan_to_pay_allowed: "false",
    chips_allowed: "false",
    payat_allowed: "false",
    zapper_allowed: "false",
    snapscan_allowed: "false"
  };

  // Remove the payment_methods object as it's now flattened
  delete flattenedFormData.payment_methods;

  // If in browser environment, create an actual form element
  if (isBrowser) {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = config.testMode
      ? "https://webpay-v2-sbox.omnea.co.za"
      : "https://webpay-v2.omnea.co.za";

    form.style.display = "none";

    const v2FormFields = {
      api_version: config.webPayV2.apiVersion,
      checkout_type: config.webPayV2.checkoutType,

      m_site_id: "KT2Ta25wWjhX", // ✅ REQUIRED

      m_uuid: config.merchantUuid,
      m_account_uuid: config.merchantAccountUuid,
      m_site_name: paymentData.merchantSiteName || "Original Source",

      transaction_id: transactionId,
      order_number: orderNumber,
      currency: "ZAR",
      amount: paymentData.amount.toFixed(2),
      item_name: paymentData.itemName || "Online Purchase",
      item_description: paymentData.itemDescription || "Synergy Medibles | No description",

      customer_name: paymentData.customerName,
      customer_surname: paymentData.customerSurname,
      customer_email: paymentData.customerEmail,
      customer_mobile: paymentData.customerMobile,

      return_url: config.returnUrl,
      notify_url: config.notifyUrl,
      cancel_url: config.cancelUrl,
      back_to_shop_url: config.backToShopUrl,

      card_allowed: "true",
      instant_eft_allowed: "true",

      checksum: checksum,
    };

    // Add all fields as hidden inputs
    Object.entries(v2FormFields).forEach(([name, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = name;
      input.value = value || "";
      form.appendChild(input);
    });

    return form;
  }

  return flattenedFormData;
};

/**
 * Processes a payment with enhanced failover and recovery capabilities
 * @param {Object} paymentData - Payment data
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object>} - Payment result
 */
export const processPayment = async (paymentData, maxRetries = 3) => {
  // Add idempotency key to prevent duplicate transactions
  const idempotencyKey =
    paymentData.transactionId ||
    `tx-${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;

  // Configure request options with increased timeout and headers
  const requestOptions = {
    timeout: 30000, // Increased timeout for better reliability (30 seconds)
    headers: {
      "Content-Type": "application/json",
      "X-Idempotency-Key": idempotencyKey,
      Accept: "application/json",
    },
  };

  // Track retry attempts
  let retryCount = 0;
  let lastError = null;

  // Retry logic with exponential backoff
  while (retryCount <= maxRetries) {
    try {
      // Primary attempt using our server proxy to avoid CORS issues
      try {
        console.log(
          `Payment attempt ${retryCount + 1}/${
            maxRetries + 1
          } to primary endpoint via proxy`
        );

        // Use our server-side proxy instead of direct API call
        // Use absolute URL for server-side requests
        const baseUrl =
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:3000";
        const response = await axios.post(
          `${baseUrl}/api/payment-proxy`,
          {
            url: config.testMode
              ? INSTAPAY_WEBPAY_SANDBOX_URL
              : INSTAPAY_WEBPAY_LIVE_URL,
            data: paymentData,
            headers: {
              "X-Idempotency-Key": idempotencyKey,
            },
          },
          requestOptions
        );

        // Validate response format
        if (!response.data) {
          throw new Error("Empty response from payment gateway");
        }

        // Check for error responses that might be formatted as success
        if (
          response.data.error ||
          response.data.status === "error" ||
          response.data.status === "failed"
        ) {
          throw new Error(
            response.data.error || response.data.message || "Payment failed"
          );
        }

        return {
          success: true,
          data: response.data,
          message: "Payment processed successfully",
        };
      } catch (primaryError) {
        console.warn(
          `Primary payment provider failed on attempt ${retryCount + 1}`,
          primaryError
        );
        lastError = primaryError;

        // Check if we should try fallback or retry primary
        if (primaryError.response && primaryError.response.status >= 500) {
          // Server error, try fallback
          console.log(
            `Trying fallback endpoint on attempt ${retryCount + 1} via proxy`
          );
          const baseUrl =
            typeof window !== "undefined"
              ? window.location.origin
              : "http://localhost:3000";
          const response = await axios.post(
            `${baseUrl}/api/payment-proxy`,
            {
              url: INSTAPAY_FALLBACK_URL,
              data: paymentData,
              headers: {
                "X-Idempotency-Key": idempotencyKey,
              },
            },
            requestOptions
          );

          // Validate fallback response
          if (!response.data) {
            throw new Error("Empty response from fallback payment gateway");
          }

          // Check for error responses from fallback
          if (
            response.data.error ||
            response.data.status === "error" ||
            response.data.status === "failed"
          ) {
            throw new Error(
              response.data.error ||
                response.data.message ||
                "Fallback payment failed"
            );
          }

          return {
            success: true,
            data: response.data,
            message: "Payment processed successfully via fallback",
          };
        } else {
          // Client error or network issue, throw to retry
          throw primaryError;
        }
      }
    } catch (error) {
      lastError = error;

      // Check if we should retry
      if (retryCount < maxRetries) {
        // Calculate backoff delay: 1s, 2s, 4s, etc.
        const backoffDelay = Math.pow(2, retryCount) * 1000;
        console.log(
          `Payment attempt ${
            retryCount + 1
          } failed. Retrying in ${backoffDelay}ms...`
        );

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        retryCount++;
      } else {
        // Max retries reached
        break;
      }
    }
  }

  // All attempts failed
  console.error("All payment processing attempts failed after retries");

  // Provide detailed error information
  const errorMessage =
    lastError?.response?.data?.message ||
    lastError?.message ||
    "Payment processing failed - please try again later";

  return {
    success: false,
    error: errorMessage,
    details: lastError?.response?.data || null,
    retriesAttempted: retryCount,
  };
};

/**
 * Initiates a payment through InstaPay WebPay Gateway
 * @param {Object} paymentData - Payment data
 * @returns {Promise<Object>} - Result of the payment initiation
 */
export const initiatePayment = async (paymentData) => {
  const res = await fetch("/api/payment/initiate-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(paymentData),
  });

  const result = await res.json();

  if (!result.success || !result.formData) {
    return { success: false };
  }

  const form = document.createElement("form");
  form.method = "POST";
  form.action = "https://webpay-v2-sbox.omnea.co.za"; // ✅ sandbox endpoint
  form.style.display = "none";

  for (const [key, value] of Object.entries(result.formData)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = key;
    input.value = String(value);
    form.appendChild(input);
  }

  return { success: true, formData: form };
};

/**
 * Verifies the checksum in a payment notification
 * @param {Object} notificationData - Payment notification data
 * @returns {boolean} - Whether the checksum is valid
 */
export const verifyNotificationChecksum = (notificationData) => {
  try {
    // Create checksum string as per InstaPay WebPay V2 documentation
    // Format: merchantUuid_merchantAccountUuid_transactionId_amountInCents_currency_securityKey
    const checksumString = [
      notificationData.payeeUuid,
      notificationData.payeeAccountUuid,
      notificationData.payeeRefInfo,
      Math.round(parseFloat(notificationData.requestAmount) * 100).toString(),
      notificationData.requestCurrency,
      config.securityKey,
    ].join("_");

    // Calculate expected checksum
    const expectedChecksum = md5(checksumString);

    // Compare with received checksum
    return expectedChecksum === notificationData.checksum;
  } catch (error) {
    console.error("Error verifying notification checksum:", error);
    return false;
  }
};

/**
 * Processes a payment notification from InstaPay WebPay V2 Gateway
 * @param {Object} notificationData - Payment notification data
 * @returns {Object} - Processed notification result
 */
export const processPaymentNotification = (notificationData) => {
  try {
    // Log notification data for debugging
    console.log("Processing WebPay V2 notification:", notificationData);

    // Verify checksum
    const isValid = verifyNotificationChecksum(notificationData);

    if (!isValid) {
      console.error("Invalid payment notification checksum");
      return {
        success: false,
        error: "Invalid checksum",
      };
    }

    // Verify merchant details
    if (
      notificationData.m_uuid !== config.merchantUuid ||
      notificationData.m_account_uuid !== config.merchantAccountUuid
    ) {
      console.error("Invalid merchant details in payment notification");
      return {
        success: false,
        error: "Invalid merchant details",
      };
    }

    // Process based on payment status
    switch (notificationData.status) {
      case "COMPLETED":
      case "PAID":
      case "SUCCESS":
        return {
          success: true,
          status: "completed",
          paymentId: notificationData.payment_reference,
          amount: notificationData.amount,
          reference: notificationData.transaction_id,
          paymentMethod: notificationData.payment_method,
          timestamp: notificationData.timestamp,
        };

      case "PENDING":
      case "PROCESSING":
        return {
          success: true,
          status: "pending",
          reference: notificationData.transaction_id,
          paymentMethod: notificationData.payment_method,
        };

      case "EXPIRED":
      case "CANCELLED":
      case "FAILED":
      default:
        return {
          success: false,
          status: notificationData.status.toLowerCase(),
          error:
            notificationData.error_message ||
            `Payment ${notificationData.status.toLowerCase()}`,
          reference: notificationData.transaction_id,
          errorCode: notificationData.error_code,
        };
    }
  } catch (error) {
    console.error("Error processing payment notification:", error);
    return {
      success: false,
      error: "Error processing notification",
      details: error.message,
    };
  }
};

// Create a default export object with all the functions
const instaPayService = {
  updateConfig,
  processPayment,
  initiatePayment,
  verifyNotificationChecksum,
  processPaymentNotification,
  createPaymentForm,
};

export default instaPayService;
