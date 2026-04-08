import express from "express";
import crypto from "crypto";
import { sendOrderEmails } from "../controllers/ordersController.js";
import { sendOrderWhatsappReceipt } from "../services/whatsappService.js";
import { findOrderById, recoverDorianneOrder, updateOrderById } from "../services/orderStore.js";
import { hashToken } from "../utils/tokens.js";
const router = express.Router();

function mapRequestStatus(requestStatus) {
  const normalized = String(requestStatus || "").trim().toUpperCase();

  switch (normalized) {
    case "COMPLETE":
    case "COMPLETED":
    case "SUCCESS":
    case "SUCCESSFUL":
    case "PAID":
      return { paymentStatus: "paid", orderStatus: "paid" };
    case "PENDING":
    case "PROCESSING":
    case "AWAITING":
      return { paymentStatus: "pending", orderStatus: "pending-payment" };
    case "CANCELLED":
      return { paymentStatus: "cancelled", orderStatus: "failed" };
    case "EXPIRED":
      return { paymentStatus: "expired", orderStatus: "failed" };
    case "FAILED":
      return { paymentStatus: "failed", orderStatus: "failed" };
    default:
      return { paymentStatus: "failed", orderStatus: "failed" };
  }
}

async function markOrderPaidAndNotify(order, paymentDetails = {}) {
  if (!order) return null;

  const paidAmount =
    Math.round(Number(paymentDetails.requestAmount || paymentDetails.paymentAmount || 0) * 100) ||
    order?.payment?.paidAmount ||
    order?.totals?.grandTotal ||
    null;

  const alreadyPaid = String(order?.payment?.status || "").toLowerCase() === "paid";
  const notificationsSent = Boolean(order?.metadata?.notificationsSent);

  const updatedOrder =
    (await updateOrderById(order.orderId, {
      $set: {
        "payment.status": "paid",
        "payment.transactionRef": paymentDetails.paymentSystemReference || order?.payment?.transactionRef || null,
        "payment.method": order?.payment?.method || paymentDetails.paymentMethod || "INSTAPAY",
        "payment.paidAmount": paidAmount,
        "payment.paidAt": paymentDetails.paymentDateTime ? new Date(paymentDetails.paymentDateTime) : (order?.payment?.paidAt || new Date()),
        status: "paid",
        "totals.paidGrandTotal": paidAmount,
      },
    })) || order;

  if (alreadyPaid && notificationsSent) {
    return updatedOrder;
  }

  let emailSent = false;
  let whatsappSent = false;
  const notificationErrors = [];

  try {
    await sendOrderEmails(updatedOrder);
    emailSent = true;
    console.log("✅ Sent paid order emails for", updatedOrder.orderId);
  } catch (e) {
    notificationErrors.push(`email:${e?.message || e}`);
    console.error("❌ Failed sending paid order emails:", e);
  }

  try {
    whatsappSent = await sendOrderWhatsappReceipt(updatedOrder);
    console.log(whatsappSent ? "✅ Sent WhatsApp receipt for" : "⚠️ WhatsApp receipt not sent for", updatedOrder.orderId);
  } catch (e) {
    notificationErrors.push(`whatsapp:${e?.message || e}`);
    console.error("❌ Failed sending WhatsApp receipt:", e);
  }

  return (
    (await updateOrderById(updatedOrder.orderId, {
      $set: {
        "metadata.notificationsSent": true,
        "metadata.notificationsSentAt": new Date(),
        "metadata.emailSent": emailSent,
        "metadata.whatsappSent": whatsappSent,
        "metadata.notificationErrors": notificationErrors,
      },
    })) || updatedOrder
  );
}

async function syncOrderToPaymentState(order, paymentDetails = {}) {
  if (!order) return null;

  const { paymentStatus, orderStatus } = mapRequestStatus(paymentDetails.requestStatus || paymentDetails.paymentStatus);
  const paidAmount =
    Math.round(Number(paymentDetails.requestAmount || paymentDetails.paymentAmount || paymentDetails.amount || 0) * 100) ||
    order?.payment?.paidAmount ||
    order?.totals?.grandTotal ||
    null;

  const updateDoc = {
    $set: {
      "payment.status": paymentStatus,
      "payment.transactionRef": paymentDetails.paymentSystemReference || paymentDetails.paymentId || paymentDetails.transactionId || order?.payment?.transactionRef || null,
      "payment.method": order?.payment?.method || paymentDetails.paymentMethod || "INSTAPAY",
      status: paymentStatus === "paid" ? "paid" : orderStatus,
      "metadata.lastPaymentSyncAt": new Date(),
      "metadata.lastPaymentPayload": paymentDetails,
    },
  };

  if (paymentStatus === "paid") {
    updateDoc.$set["payment.paidAmount"] = paidAmount;
    updateDoc.$set["payment.paidAt"] = paymentDetails.paymentDateTime ? new Date(paymentDetails.paymentDateTime) : (order?.payment?.paidAt || new Date());
    updateDoc.$set["totals.paidGrandTotal"] = paidAmount;
  }

  return (await updateOrderById(order.orderId, updateDoc)) || order;
}

async function markOrderPaymentFailed(order, paymentDetails = {}) {
  if (!order) return null;

  const { paymentStatus, orderStatus } = mapRequestStatus(
    paymentDetails.requestStatus || paymentDetails.paymentStatus || "FAILED"
  );

  return (
    (await updateOrderById(order.orderId, {
      $set: {
        "payment.status": paymentStatus === "paid" ? "failed" : paymentStatus,
        "payment.transactionRef":
          paymentDetails.paymentSystemReference ||
          paymentDetails.paymentId ||
          paymentDetails.transactionId ||
          order?.payment?.transactionRef ||
          null,
        "payment.method": order?.payment?.method || paymentDetails.paymentMethod || "INSTAPAY",
        status: paymentStatus === "paid" ? "failed" : orderStatus,
        "metadata.lastPaymentSyncAt": new Date(),
        "metadata.lastFailedPaymentAt": new Date(),
        "metadata.lastPaymentPayload": paymentDetails,
      },
    })) || order
  );
}

/* ----------------------------- Helpers ----------------------------- */

const toCents = (amt) => {
  const n = typeof amt === "string" ? parseFloat(amt) : Number(amt);
  if (Number.isNaN(n)) return "0";
  return Math.round(n * 100).toString();
};

// ✅ V1 checksum for checkout form
// md5( m_uuid + '_' + m_account_uuid + '_' + m_tx_id + '_' + amount_in_cents + '_' + 'ZAR' + '_' + securityKey )
function generateCheckoutChecksum({ m_uuid, m_account_uuid, m_tx_id, m_tx_amount, securityKey }) {
  const amountInCents = toCents(m_tx_amount);
  const stringToHash = `${m_uuid}_${m_account_uuid}_${m_tx_id}_${amountInCents}_ZAR_${securityKey}`;
  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

// ✅ V1 checksum verify for NOTIFICATIONS
// md5( payeeUuid + '_' + payeeAccountUuid + '_' + payeeRefInfo + '_' + requestAmount_in_cents + '_' + requestCurrency + '_' + securityKey )
function verifyNotificationChecksum(n, securityKey) {
  const amountInCents = toCents(n.requestAmount);
  const str = `${n.payeeUuid}_${n.payeeAccountUuid}_${n.payeeRefInfo}_${amountInCents}_${n.requestCurrency}_${securityKey}`;
  const expected = crypto.createHash("md5").update(str).digest("hex");
  return expected === n.checksum;
}

// Ensure m_tx_order_nr starts with your 3-char routing code (e.g., SWO)
// function buildOrderNr(raw, shortCode = "SWO") {
//   if (raw && typeof raw === "string" && raw.startsWith(shortCode)) return raw.slice(0, 20);
//   // make a 20-char max: 3 letters + up to 17 unique chars
//   const tail = Date.now().toString().slice(-17);
//   return `${shortCode}${tail}`.slice(0, 20);
// }

/* ----------------------------- Routes ------------------------------ */

// ✅ Step 1: Initiate WebPay V1 (build hidden POST form fields for the frontend)
router.post("/initiate-payment", async (req, res) => {
  try {
    const {
      m_tx_id,                 // unique transaction id (you can pass your order id here)
      m_tx_amount,             // "123.45"
      m_tx_item_name,
      m_tx_item_description,
      b_email,
      b_name,
      b_surname,
      b_mobile,
      m_return_url,            // optional override
      m_notify_url,            // optional override
      m_back2shop_url,         // optional override
      m_process_url,           // optional
      m_tx_order_nr,           // optional; we’ll build a compliant one if not passed
    } = req.body;

    const m_uuid         = process.env.INSTAPAY_MERCHANT_UUID;
    const m_account_uuid = process.env.INSTAPAY_ACCOUNT_UUID;
    const securityKey    = process.env.INSTAPAY_SECURITY_KEY;

    if (!m_uuid || !m_account_uuid || !securityKey) {
      throw new Error("Missing InstaPay environment config (UUIDs / SECURITY KEY).");
    }

   if (!m_tx_id || !m_tx_amount) {
      return res.status(400).json({ success: false, error: "m_tx_id and m_tx_amount are required" });
    }

    // Use your real orderId as the reference shown on WebPay
    const orderNr = m_tx_order_nr || m_tx_id;  // e.g. OS-20250922-005
    // Build order number compliant with V1 (must start with 3-char short code)
    // const merchantShortCode = process.env.INSTAPAY_SHORT_CODE || "SWO";
    // const orderNr = buildOrderNr(m_tx_order_nr || m_tx_id, merchantShortCode);



    // Checksum (V1)
    const checksum = generateCheckoutChecksum({
      m_uuid,
      m_account_uuid,
      m_tx_id,
      m_tx_amount,
      securityKey,
    });

    // Build **V1** form payload (NO v2 fields like api_version/checkout_type/m_site_id)
    const formData = {
      // Merchant
      m_uuid,
      m_account_uuid,
      m_site_name: "Original Source",

      // Transaction
      m_tx_id,
      m_tx_order_nr: orderNr,
      m_tx_currency: "ZAR",
      m_tx_amount, // keep "123.45"
      m_tx_item_name,
      m_tx_item_description,

      // Buyer (optional)
      b_email,
      b_name: b_name || "",
      b_surname: b_surname || "",
      b_mobile: b_mobile || "",

      // Callbacks (use overrides if provided, else env/defaults)
      m_return_url: m_return_url || process.env.INSTAPAY_SUCCESS_URL || "http://localhost:4040/checkout/success",
      m_notify_url: m_notify_url || process.env.INSTAPAY_NOTIFICATION_URL || "http://localhost:4040/api/payment/notifications",
      m_back2shop_url: m_back2shop_url || process.env.INSTAPAY_FAILURE_URL || process.env.INSTAPAY_SHOP_URL || "http://localhost:4040/products",
      m_process_url: m_process_url || "",

      // Payment Method Flags (optional — omit to use profile defaults)
      m_card_allowed: "true",
      m_ieft_allowed: "true",
      m_chips_allowed: "false",
      m_trident_allowed: "false",
      m_mpass_allowed: "false",
      m_payat_allowed: "false",
      m_zapper_allowed: "false",
      m_snapscan_allowed: "false",

      // Security
      checksum,
    };

    console.log("📝 [V1] formData:", formData);

    // Frontend will POST these to:
    //   Sandbox: https://webpay-sbox.omnea.co.za/index.php
    //   Live:    https://webpay-live.omnea.co.za/index.php
    return res.json({ success: true, formData });
  } catch (error) {
    console.error("❌ Payment initiation error (V1):", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Payment initiation failed",
    });
  }
});

// ✅ Step 2: Payment notification webhook (V1)
// InstaPay typically posts as application/x-www-form-urlencoded.
// Ensure your top-level app has: app.use(express.urlencoded({ extended: true }));
router.post("/notifications", async (req, res) => {
  try {
    const body = req.body || {};
    console.log("🔔 [V1] Payment notification received:", body);

    const securityKey = process.env.INSTAPAY_SECURITY_KEY;
    const merchantUuid = process.env.INSTAPAY_MERCHANT_UUID;
    const accountUuid  = process.env.INSTAPAY_ACCOUNT_UUID;

    // 1) Verify checksum
    const skipVerification = String(process.env.SKIP_NOTIFICATION_VERIFICATION || "").toLowerCase() === "true";
    const checksumOk = skipVerification ? true : verifyNotificationChecksum(body, securityKey);
    if (!checksumOk) {
      console.warn("⚠️ Invalid checksum on notification");
      return res.status(400).send("bad checksum");
    }

    // 2) Optional IP allow-list (enable if you want to enforce)
    // const allowed = ["41.218.88.17", "26.195.234"]; // From docs (double-check exact IPs)
    // const sourceIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress;
    // if (!allowed.some(ip => (sourceIp || "").includes(ip))) {
    //   console.warn("⚠️ Notification from unexpected IP:", sourceIp);
    //   return res.status(403).send("forbidden");
    // }

    // 3) Validate static/known fields
    if (body.payeeUuid !== merchantUuid || body.payeeAccountUuid !== accountUuid) {
      console.warn("⚠️ Merchant UUID/Account UUID mismatch");
      return res.status(400).send("merchant mismatch");
    }
    if (body.requestCurrency !== "ZAR") {
      console.warn("⚠️ Unexpected currency:", body.requestCurrency);
      return res.status(400).send("currency mismatch");
    }

    // 4) Interpret status & update your order
    const { paymentStatus, orderStatus } = mapRequestStatus(body.requestStatus);

    // payeeRefInfo = your reference (m_tx_id or m_tx_order_nr you posted)
const reference = body.payeeRefInfo;

    if (!reference) {
      console.warn("⚠️ Missing payeeRefInfo on notification payload");
      return res.status(400).send("missing reference");
    }

    const existingOrder = await findOrderById(reference);

    console.log("🔎 [V1] Resolving payment reference:", {
      reference,
      requestStatus: body.requestStatus,
      checksumOk,
      foundOrder: Boolean(existingOrder),
    });

    if (!existingOrder) {
      console.warn("⚠️ Notification received for unknown reference:", reference);
    }

    if (paymentStatus !== "paid" && existingOrder) {
      await syncOrderToPaymentState(existingOrder, body);
    }

 // --- Only on COMPLETED: mark paid + send emails ---
 if (paymentStatus === "paid") {
   let order = existingOrder;

   if (!order && reference === "OS-20260328-001") {
     order = await recoverDorianneOrder();
   }

   if (order) {
       order = await markOrderPaidAndNotify(order, body);
       console.log("✅ [V1] Completed paid workflow for", order?.orderId);
   } else {
     console.warn("⚠️ Completed payment for unknown reference:", reference);
   }
 }



    // TODO: look up your order by `reference`, compare `requestAmount` with your stored amount, then:
    // - if completed: mark paid, store paymentSystemReference, etc.
    // - if pending: keep waiting
    // - if cancelled/expired/failed: handle accordingly

    console.log("✅ Notification OK:", {
      normalizedStatus: paymentStatus,
      orderStatus,
      reference,
      amount: body.paymentAmount || body.requestAmount,
      paymentMethod: body.paymentMethod,
      paymentRef: body.paymentSystemReference,
      when: body.paymentDateTime,
    });

    // Important: reply 200 OK so InstaPay stops retrying
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Notification processing error (V1):", error);
    res.status(500).send("ERROR");
  }
});

router.post("/confirm-success", async (req, res) => {
  try {
    const { orderId, token, paymentStatus, paymentId, transactionId, amount, rawParams } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId is required" });
    }

    let order = await findOrderById(orderId);

    if (!order && orderId === "OS-20260328-001") {
      order = await recoverDorianneOrder();
    }

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const storedTokenHash = order?.metadata?.successTokenHash;
    const storedExpiry = order?.metadata?.successTokenExpiresAt ? new Date(order.metadata.successTokenExpiresAt) : null;
    const tokenAlreadyUsed = Boolean(order?.metadata?.successTokenUsedAt);
    const incomingTokenHash = token ? hashToken(token) : null;
    const tokenMatches = Boolean(token && storedTokenHash && incomingTokenHash === storedTokenHash);
    const tokenExpired = !storedExpiry || Number.isNaN(storedExpiry.getTime()) || storedExpiry.getTime() < Date.now();

    order =
      (await updateOrderById(order.orderId, {
        $set: {
          "metadata.successTokenLastSeenAt": new Date(),
          "metadata.successPageSeenAt": new Date(),
          "metadata.successPageParams": rawParams || {},
        },
      })) || order;

    if (!tokenMatches || tokenExpired || tokenAlreadyUsed) {
      return res.status(403).json({
        success: false,
        error: tokenAlreadyUsed
          ? "This payment success link has already been used."
          : "Invalid or expired payment success link.",
      });
    }

    const normalizedStatus = String(paymentStatus || order?.payment?.status || "pending").trim().toUpperCase();
    const { paymentStatus: mappedPaymentStatus, orderStatus: mappedOrderStatus } = mapRequestStatus(normalizedStatus);
    const hasReturnProof = Boolean(paymentId || transactionId || amount);
    const cameFromSuccessPage = Object.keys(rawParams || {}).length > 0;
    const explicitFailureStatuses = ["FAILED", "CANCELLED", "EXPIRED"];
    const hasExplicitFailure = explicitFailureStatuses.includes(normalizedStatus);
    const looksCompleted =
      mappedPaymentStatus === "paid" ||
      (cameFromSuccessPage && hasReturnProof && !hasExplicitFailure);
    const looksPending = mappedPaymentStatus === "pending";

    if (!looksCompleted) {
      const nextPaymentStatus = looksPending ? "pending" : mappedPaymentStatus;
      const nextOrderStatus = looksPending ? "pending-payment" : mappedOrderStatus;

      const pendingOrder =
        (await updateOrderById(order.orderId, {
          $set: {
            "payment.status": nextPaymentStatus,
            "payment.transactionRef": paymentId || transactionId || order?.payment?.transactionRef || null,
            status: nextOrderStatus,
            "metadata.successPageSeenAt": new Date(),
            "metadata.successPageParams": rawParams || {},
          },
        })) || order;

      return res.json({ success: true, verified: false, status: pendingOrder?.payment?.status || "pending", order: pendingOrder });
    }

    order = await markOrderPaidAndNotify(order, {
      paymentSystemReference: paymentId || transactionId || order?.payment?.transactionRef,
      paymentMethod: order?.payment?.method || "INSTAPAY",
      requestAmount: amount,
      requestStatus: looksCompleted ? "PAID" : normalizedStatus,
      paymentDateTime: new Date().toISOString(),
    });

    order =
      (await updateOrderById(order.orderId, {
        $set: {
          "metadata.successPageConfirmed": true,
          "metadata.successPageConfirmedAt": new Date(),
          "metadata.successPageUsedAsPrimaryConfirmation": true,
          "metadata.successPageParams": rawParams || {},
          "metadata.successTokenUsedAt": new Date(),
        },
        $unset: {
          "metadata.successTokenHash": "",
        },
      })) || order;

    return res.json({ success: true, verified: true, status: order?.payment?.status || "paid", order });
  } catch (error) {
    console.error("❌ Payment success confirmation error:", error);
    return res.status(500).json({ success: false, error: error.message || "Payment confirmation failed" });
  }
});

router.post("/confirm-failure", async (req, res) => {
  try {
    const { orderId, paymentStatus, paymentId, transactionId, rawParams } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId is required" });
    }

    let order = await findOrderById(orderId);

    if (!order && orderId === "OS-20260328-001") {
      order = await recoverDorianneOrder();
    }

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const normalizedStatus = String(paymentStatus || "FAILED").trim().toUpperCase();
    const { paymentStatus: mappedPaymentStatus } = mapRequestStatus(normalizedStatus);
    const finalStatus = mappedPaymentStatus === "pending" ? "FAILED" : normalizedStatus;

    order = await markOrderPaymentFailed(order, {
      paymentStatus: finalStatus,
      paymentId,
      transactionId,
      rawParams: rawParams || {},
    });

    order =
      (await updateOrderById(order.orderId, {
        $set: {
          "metadata.failedReturnSeenAt": new Date(),
          "metadata.failedReturnParams": rawParams || {},
        },
      })) || order;

    return res.json({ success: true, status: order?.payment?.status || "failed", order });
  } catch (error) {
    console.error("❌ Payment failure confirmation error:", error);
    return res.status(500).json({ success: false, error: error.message || "Payment failure confirmation failed" });
  }
});

router.get("/status/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await findOrderById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    return res.json({
      success: true,
      orderId: order.orderId,
      paymentStatus: order?.payment?.status || "pending",
      orderStatus: order?.status || "new",
      notificationsSent: Boolean(order?.metadata?.notificationsSent),
      order,
    });
  } catch (error) {
    console.error("❌ Payment status fetch error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to fetch payment status" });
  }
});

router.post("/resend-notifications", async (req, res) => {
  try {
    const { orderId, markPaid = false, paymentId, transactionId, amount } = req.body || {};

    if (!orderId) {
      return res.status(400).json({ success: false, error: "orderId is required" });
    }

    let order = await findOrderById(orderId);

    if (!order && orderId === "OS-20260328-001") {
      order = await recoverDorianneOrder();
    }

    if (!order) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    const isPaid = String(order?.payment?.status || "").toLowerCase() === "paid";

    if (!isPaid && !markPaid) {
      return res.status(400).json({
        success: false,
        error: 'Order is not marked paid. Pass markPaid=true to mark it paid and send notifications.',
      });
    }

    order = await markOrderPaidAndNotify(order, {
      paymentSystemReference: paymentId || transactionId || order?.payment?.transactionRef,
      paymentMethod: order?.payment?.method || "INSTAPAY",
      requestAmount: amount,
      paymentDateTime: new Date().toISOString(),
    });

    order =
      (await updateOrderById(order.orderId, {
        $set: {
          "metadata.manualNotificationTriggered": true,
          "metadata.manualNotificationTriggeredAt": new Date(),
        },
      })) || order;

    return res.json({
      success: true,
      message: "Notifications processed for paid order.",
      order,
    });
  } catch (error) {
    console.error("❌ Manual notification resend error:", error);
    return res.status(500).json({ success: false, error: error.message || "Failed to resend notifications" });
  }
});

/**
 * (Optional) Step 3: Payment proxy
 * WebPay V1 is a pure POST redirect flow; you usually don't need a server proxy.
 * Keeping this here in case your frontend still calls it. It just passes through JSON.
 */
router.post("/proxy", async (req, res) => {
  try {
    const { url, data, headers } = req.body;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(headers || {}) },
      body: JSON.stringify(data || {}),
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("❌ Payment proxy error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Proxy request failed",
    });
  }
});

export default router;
