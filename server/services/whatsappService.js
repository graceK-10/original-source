import twilio from "twilio";

const formatCurrency = (amount) => `R${(Number(amount || 0) / 100).toFixed(2)}`;

const buildAddress = (shipping = {}) => {
  return [
    shipping.address1,
    shipping.address2,
    shipping.suburb,
    shipping.city,
    shipping.postalCode,
  ]
    .filter(Boolean)
    .join(", ");
};

const buildItemsSummary = (items = []) => {
  return items
    .map((item, index) => `${index + 1}. ${item.productName} (${item.variantName}) x${item.qty}`)
    .join("\n");
};

const buildReceiptMessage = (order) => {
  const total = order?.totals?.paidGrandTotal ?? order?.totals?.grandTotal ?? 0;

  return [
    "New Paid Order Receipt",
    "",
    `Order ID: ${order.orderId}`,
    `Customer: ${order.customer?.name || "N/A"}`,
    `Phone: ${order.customer?.phone || "N/A"}`,
    `Address: ${buildAddress(order.shipping) || "N/A"}`,
    "",
    "Items:",
    buildItemsSummary(order.items) || "No items found",
    "",
    `Total: ${formatCurrency(total)}`,
    `Payment Method: ${order.payment?.method || "N/A"}`,
  ].join("\n");
};

const buildTemplateVariables = (order) => {
  const total = order?.totals?.paidGrandTotal ?? order?.totals?.grandTotal ?? 0;

  return {
    1: order.customer?.name || "Customer",
    2: order.orderId || "",
    3: formatCurrency(total),
    4: buildAddress(order.shipping) || "No address provided",
    5: buildItemsSummary(order.items) || "No items found",
  };
};

const getTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error("Missing Twilio credentials");
  }

  return twilio(accountSid, authToken);
};

const toWhatsappNumber = (phone) => {
  const raw = String(phone || "").trim();
  if (!raw) return null;

  const normalized = raw.replace(/[^\d+]/g, "");
  if (!normalized) return null;

  if (normalized.startsWith("+")) return `whatsapp:${normalized}`;
  if (normalized.startsWith("27")) return `whatsapp:+${normalized}`;
  if (normalized.startsWith("0")) return `whatsapp:+27${normalized.slice(1)}`;
  return `whatsapp:+${normalized}`;
};

export const sendOrderWhatsappReceipt = async (order) => {
  try {
    const to = toWhatsappNumber(order?.customer?.phone) || process.env.TWILIO_WHATSAPP_TO;
    const from = process.env.TWILIO_WHATSAPP_FROM;
    const contentSid = process.env.TWILIO_CONTENT_SID;

    if (!to || !from) {
      console.warn("[WhatsApp] Missing recipient or TWILIO_WHATSAPP_FROM. Skipping WhatsApp receipt.");
      return false;
    }

    const client = getTwilioClient();

    const payload = {
      from,
      to,
    };

    if (contentSid) {
      payload.contentSid = contentSid;
      payload.contentVariables = JSON.stringify(buildTemplateVariables(order));
    } else {
      payload.body = buildReceiptMessage(order);
    }

    const message = await client.messages.create(payload);
    console.log(`[WhatsApp] Receipt sent for order ${order.orderId}. SID: ${message.sid}`);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send order receipt:", error?.message || error);
    return false;
  }
};

export default {
  sendOrderWhatsappReceipt,
};