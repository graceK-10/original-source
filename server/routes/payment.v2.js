import express from "express";
import crypto from "crypto";

const router = express.Router();

// ✅ Step 1: V2 Checksum Function
function generateChecksum({
  m_uuid,
  m_account_uuid,
  m_tx_id,
  m_tx_amount,
  m_tx_currency,
  securityKey,
}) {
  const amountInCents = String(m_tx_amount).replace(/\D/g, ""); // "150.00" → "15000"
  const currency = m_tx_currency.toUpperCase().trim(); 
  console.log("🧾 Received amount (m_tx_amount):", m_tx_amount);

  const stringToHash = `${m_uuid}_${m_account_uuid}_${m_tx_id}_${amountInCents}_${currency}_${securityKey}`;

  console.log("🔐 Final String Used for Checksum:", stringToHash);

  return crypto.createHash("md5").update(stringToHash).digest("hex");
}

// ✅ Step 2: Main WebPay V2 route
router.post("/initiate-payment", async (req, res) => {
  try {
    console.log("🔍 ENV", {
      m_uuid: process.env.INSTAPAY_MERCHANT_UUID,
      m_account_uuid: process.env.INSTAPAY_ACCOUNT_UUID,
      securityKey: process.env.INSTAPAY_SECURITY_KEY,
    });

    const {
      m_tx_id,
      m_tx_amount,
      m_tx_item_name,
      m_tx_item_description,
      b_email,
      b_name,
      b_surname,
      b_mobile,
      m_return_url,
      m_notify_url,
    } = req.body;

    const m_uuid = process.env.INSTAPAY_MERCHANT_UUID;
    const m_account_uuid = process.env.INSTAPAY_ACCOUNT_UUID;
    const securityKey = process.env.INSTAPAY_SECURITY_KEY;

    if (!m_uuid || !m_account_uuid || !securityKey) {
      throw new Error("Missing InstaPay environment config.");
    }

    const checksum = generateChecksum({
      m_uuid,
      m_account_uuid,
      m_tx_id,
      m_tx_amount,
      m_tx_currency: "ZAR",
      securityKey,
    });

    const formData = {
      api_version: "2023-05-01",
      checkout_type: "iframe",

      // 🧾 Merchant Info
      m_site_id: process.env.INSTAPAY_SITE_ID,
      m_uuid,
      m_account_uuid,
      m_site_name: "Original Source",

      // 💳 Transaction Info
      m_tx_id,
      m_tx_order_nr: m_tx_id,
      m_tx_currency: "ZAR",
      m_tx_amount,
      m_tx_item_name,
      m_tx_item_description,

      // 👤 Buyer Info
      b_email,
      b_name: b_name || "Customer",
      b_surname: b_surname || "Name",
      b_mobile: b_mobile || "0821234567",

      // 🌐 Callbacks
      m_return_url,
      m_notify_url,
      m_back2shop_url: process.env.INSTAPAY_SHOP_URL || "http://localhost:3000/products",
      m_email_address: b_email,
      m_process_url: "",
      m_cancel_url: process.env.INSTAPAY_FAILURE_URL || "http://localhost:3000/payment-failed",

      // ✅ Payment Method Flags
      m_card_allowed: "true",
      m_ieft_allowed: "true",
      m_zapper_allowed: "false",
      m_payat_allowed: "false",
      m_chips_allowed: "false",
      m_mpass_allowed: "false",
      m_snapscan_allowed: "false",

      // 🔐 Security
      checksum,
    };

    console.log("📝 formData being sent to InstaPay:", formData);

    return res.json({ success: true, formData });
  } catch (error) {
    console.error("❌ Payment initiation error:", error);
    return res.status(500).json({ 
      success: false, 
      error: error.message || "Payment initiation failed" 
    });
  }
});

// ✅ Step 3: Payment notification webhook
router.post("/notifications", async (req, res) => {
  try {
    console.log("🔔 Payment notification received:", req.body);
    
    // Process the notification
    // You can add your order update logic here
    
    // Always respond with OK to acknowledge receipt
    res.status(200).send("OK");
  } catch (error) {
    console.error("❌ Notification processing error:", error);
    res.status(500).send("ERROR");
  }
});

// ✅ Step 4: Payment proxy for CORS handling
router.post("/proxy", async (req, res) => {
  try {
    const { url, data, headers } = req.body;
    
    // Make the request to InstaPay on behalf of the client
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    res.json(result);
  } catch (error) {
    console.error("❌ Payment proxy error:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Proxy request failed" 
    });
  }
});

export default router;
