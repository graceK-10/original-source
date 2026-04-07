/**
 * InstaPay WebPay V1 Gateway Service
 * Implements the Webform method per InstaPay WebPay V1 documentation.
 */
import md5 from "md5";

// ---------- Endpoints (V1) ----------
export const INSTAPAY_WEBPAY_SANDBOX_URL = "https://webpay-sbox.omnea.co.za";
export const INSTAPAY_WEBPAY_LIVE_URL = "https://webpay.omnea.co.za";

// ---------- Environment / helpers ----------
const isBrowser = typeof window !== "undefined" && typeof document !== "undefined";

const getBaseUrl = () => {
  if (isBrowser) return window.location.origin;
  return process.env.INSTAPAY_MAIN_URL || "http://localhost:4040";
};

const getEnvVar = (key, fallback = "") => {
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

// ---------- Defaults ----------
const DEFAULT_CONFIG = {
  testMode: true, // set false in production

  // Merchant (from your existing envs; same values you used on V2)
  merchantUuid: getEnvVar("INSTAPAY_MEMBER_ID"),       // m_uuid
  merchantAccountUuid: getEnvVar("INSTAPAY_IACCOUNT_ID"), // m_account_uuid
  merchantShortCode: "SWO", // first 3 chars required for m_tx_order_nr

  securityKey: getEnvVar("INSTAPAY_SECURITY_KEY"),

  // Allowed methods (optional – if omitted, WebPay profile defaults apply)
  paymentMethods: {
    card: true,
    instantEft: true,
    chips: false,
    trident: false,
    scanToPay: false, // m_mpass (Scan-to-Pay / Masterpass)
    payAt: false,
    zapper: false,
    snapscan: false,
  },

  // Routing URLs
  returnUrl: getEnvVar("INSTAPAY_SUCCESS_URL") || `${getBaseUrl()}/payment-success`,
  notifyUrl: getEnvVar("INSTAPAY_NOTIFICATION_URL") || `${getBaseUrl()}/api/payment/notifications`,
  processUrl: "", // optional
  backToShopUrl: getEnvVar("INSTAPAY_SHOP_URL") || `${getBaseUrl()}/products`,
};

let config = { ...DEFAULT_CONFIG };

// ---------- Public config updater ----------
export const updateConfig = (newConfig) => {
  config = { ...config, ...newConfig };
};

// ---------- Utils ----------
const toCents = (amount) => {
  // Accepts number or numeric string, returns string cents (e.g. "523" for 5.23)
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  return Math.round(num * 100).toString();
};

// Checkout checksum: m_uuid_m_account_uuid_m_tx_id_amountInCents_ZAR_SECURITY
const calculateCheckoutChecksum = ({ m_tx_id, m_tx_amount }) => {
  const amountInCents = toCents(m_tx_amount);
  const pieces = [
    config.merchantUuid,
    config.merchantAccountUuid,
    m_tx_id,
    amountInCents,
    "ZAR",
    config.securityKey,
  ];
  return md5(pieces.join("_"));
};

// ---------- Core: create WebPay V1 POST form ----------
/**
 * Build a hidden POST form (WebPay V1) with all V1 field names.
 * @param {{
 *   amount:number|string,
 *   itemName?:string,
 *   itemDescription?:string,
 *   customerName?:string,
 *   customerSurname?:string,
 *   customerEmail?:string,
 *   customerMobile?:string,
 *   orderNumber?:string,     // optional, we'll generate if not given
 *   transactionId?:string,   // optional, we'll generate if not given (UUID recommended)
 *   merchantSiteName?:string // optional label
 * }} paymentData
 * @returns {HTMLFormElement|Object} form element (browser) or plain object (SSR)
 */
export const createPaymentForm = (paymentData) => {
  // Create V1 transaction identifiers
  const m_tx_id = paymentData.transactionId || `TX-${Date.now()}`;
  // m_tx_order_nr: 3-char merchant routing code + 17 chars unique
  const unique = Date.now().toString().slice(-17); // use timestamp tail as simple unique
  const m_tx_order_nr = paymentData.orderNumber || `${config.merchantShortCode}${unique}`;

  // Build the V1 payload
  const formData = {
    // Merchant
    m_uuid: config.merchantUuid,
    m_account_uuid: config.merchantAccountUuid,
    m_site_name: paymentData.merchantSiteName || "Original Source",

    // Transaction
    m_tx_order_nr,                         // must start with 3-char merchant short code
    m_tx_id,                               // unique transaction id
    m_tx_currency: "ZAR",
    m_tx_amount: Number(paymentData.amount).toFixed(2),
    m_tx_item_name: paymentData.itemName || "Online Purchase",
    m_tx_item_description: paymentData.itemDescription || "Original Source – no description",

    // Payer (optional)
    b_name: paymentData.customerName || "",
    b_surname: paymentData.customerSurname || "",
    b_email: paymentData.customerEmail || "",
    b_mobile: paymentData.customerMobile || "",

    // URLs (optional but recommended)
    m_return_url: config.returnUrl,
    m_notify_url: config.notifyUrl,
    m_process_url: config.processUrl || "",
    m_back2shop_url: config.backToShopUrl,

    // Payment method flags (optional – use strings "true"/"false" as typical for HTML posts)
    m_card_allowed: String(!!config.paymentMethods.card),
    m_ieft_allowed: String(!!config.paymentMethods.instantEft),
    m_chips_allowed: String(!!config.paymentMethods.chips),
    m_trident_allowed: String(!!config.paymentMethods.trident),
    m_mpass_allowed: String(!!config.paymentMethods.scanToPay),
    m_payat_allowed: String(!!config.paymentMethods.payAt),
    m_zapper_allowed: String(!!config.paymentMethods.zapper),
    m_snapscan_allowed: String(!!config.paymentMethods.snapscan),
  };

  // Checksum
  formData.checksum = calculateCheckoutChecksum({
    m_tx_id,
    m_tx_amount: formData.m_tx_amount,
  });

  if (!isBrowser) return formData;

  // Build a real form element for browser submission
  const form = document.createElement("form");
  form.method = "POST";
  form.action = config.testMode
    ? INSTAPAY_WEBPAY_SANDBOX_URL
    : INSTAPAY_WEBPAY_LIVE_URL;
  form.style.display = "none";

  Object.entries(formData).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value != null ? String(value) : "";
    form.appendChild(input);
  });

  return form;
};

// ---------- Initiate from your frontend (same call signature you used) ----------
/**
 * Returns a ready-to-submit HTMLFormElement for WebPay V1.
 * Your existing caller can append it to document.body and submit().
 */
export const initiatePayment = async (paymentData) => {
  // If you still have a server helper that returns formData, you can keep it.
  // But WebPay V1 is just a redirect via POST, so we can do it entirely client-side:
  const form = createPaymentForm(paymentData);
  return { success: true, formData: form };
};

// ---------- Webhook checksum verification (V1) ----------
/**
 * Verify V1 notification checksum.
 * Expected string:
 *   payeeUuid_payeeAccountUuid_payeeRefInfo_requestAmountInCents_requestCurrency_SECURITY
 */
export const verifyNotificationChecksum = (notificationData) => {
  try {
    const amountInCents = toCents(notificationData.requestAmount);
    const pieces = [
      notificationData.payeeUuid,
      notificationData.payeeAccountUuid,
      notificationData.payeeRefInfo,
      amountInCents,
      notificationData.requestCurrency, // should be "ZAR"
      config.securityKey,
    ];
    const expected = md5(pieces.join("_"));
    return expected === notificationData.checksum;
  } catch (e) {
    console.error("Checksum verify error (V1):", e);
    return false;
  }
};

// ---------- Normalize & interpret V1 webhook ----------
/**
 * Process V1 notification.
 * @returns {{
 *   success:boolean,
 *   status:'completed'|'pending'|'cancelled'|'expired'|'failed',
 *   paymentId?:string, amount?:number, reference?:string,
 *   paymentMethod?:string, timestamp?:string, error?:string
 * }}
 */
export const processPaymentNotification = (notificationData) => {
  try {
    // 1) Verify checksum first
    const ok = verifyNotificationChecksum(notificationData);
    if (!ok) {
      return { success: false, status: "failed", error: "Invalid checksum" };
    }

    // 2) (Recommended) Validate static/known values on your side:
    // - payeeUuid === config.merchantUuid
    // - payeeAccountUuid === config.merchantAccountUuid
    // - requestCurrency === "ZAR"
    // - requestAmount equals your original m_tx_amount
    if (
      notificationData.payeeUuid !== config.merchantUuid ||
      notificationData.payeeAccountUuid !== config.merchantAccountUuid ||
      notificationData.requestCurrency !== "ZAR"
    ) {
      return { success: false, status: "failed", error: "Merchant or currency mismatch" };
    }

    // 3) Interpret status
    const statusMap = {
      COMPLETED: "completed",
      PENDING: "pending",
      CANCELLED: "cancelled",
      EXPIRED: "expired",
    };
    const status = statusMap[notificationData.requestStatus] || "failed";

    const out = {
      success: status === "completed" || status === "pending",
      status,
      paymentId: notificationData.paymentSystemReference || undefined,
      amount: notificationData.paymentAmount
        ? Number(notificationData.paymentAmount)
        : Number(notificationData.requestAmount),
      reference: notificationData.payeeRefInfo, // your m_tx_id or m_tx_order_nr (see below)
      paymentMethod: notificationData.paymentMethod || undefined,
      timestamp: notificationData.paymentDateTime || undefined,
    };

    return out;
  } catch (e) {
    console.error("Notification process error (V1):", e);
    return { success: false, status: "failed", error: e.message };
  }
};

const instaPayServiceV1 = {
  updateConfig,
  createPaymentForm,
  initiatePayment,
  verifyNotificationChecksum,
  processPaymentNotification,
};

export default instaPayServiceV1;
