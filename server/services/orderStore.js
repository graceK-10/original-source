import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Order from "../models/Order.js";
import { connectToDatabase } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE_PATH = path.join(__dirname, "..", "data", "orders.json");

const norm = (s) => (s || "").toString().trim().toLowerCase();

function readOrdersFile() {
  try {
    if (!fs.existsSync(ORDERS_FILE_PATH)) return [];
    const raw = fs.readFileSync(ORDERS_FILE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeOrder(order) {
  if (!order) return order;
  const normalized = typeof order.toObject === "function" ? order.toObject() : { ...order };
  normalized.orderDate = normalized.orderDate || new Date().toISOString();
  return normalized;
}

export async function getAllOrders() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ orderDate: -1, createdAt: -1 }).lean();
    if (orders.length > 0) return orders.map(normalizeOrder);
  } catch (error) {
    console.warn("[orderStore] Falling back to file orders:", error?.message || error);
  }

  return readOrdersFile().map(normalizeOrder);
}

export async function findOrderById(orderId) {
  try {
    await connectToDatabase();
    const order = await Order.findOne({ orderId }).lean();
    if (order) return normalizeOrder(order);
  } catch (error) {
    console.warn("[orderStore] findOrderById fallback:", error?.message || error);
  }

  return readOrdersFile().find((o) => o.orderId === orderId) || null;
}

export async function createOrderRecord(order) {
  await connectToDatabase();
  const created = await Order.findOneAndUpdate(
    { orderId: order.orderId },
    { $setOnInsert: order },
    { upsert: true, new: true, lean: true }
  );
  return normalizeOrder(created);
}

export async function updateOrderById(orderId, updateDoc) {
  await connectToDatabase();
  const updated = await Order.findOneAndUpdate({ orderId }, updateDoc, { new: true, lean: true });
  return normalizeOrder(updated);
}

export async function getOrdersForUser(user = {}) {
  const userPN = norm(user.pNumber);
  const userName = norm(user.name);
  const userEmail = norm(user.email);
  const orders = await getAllOrders();

  return orders
    .filter((o) => {
      const p = norm(o?.customer?.pNumber);
      const n = norm(o?.customer?.name);
      const e = norm(o?.customer?.email);

      if (userPN && p && userPN === p) return true;
      if (userName && n && userPN && p && (n.includes(userName) || userName.includes(n)) && (p.startsWith(userPN) || userPN.startsWith(p))) return true;
      if (userEmail && e && userEmail === e) return true;
      return false;
    })
    .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
}

export async function getNextOrderId() {
  const now = new Date();
  const prefix = `OS-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-`;
  const orders = await getAllOrders();
  let maxIncrement = 0;

  for (const order of orders) {
    if (order?.orderId?.startsWith(prefix)) {
      const increment = parseInt(order.orderId.slice(prefix.length), 10);
      if (!Number.isNaN(increment) && increment > maxIncrement) maxIncrement = increment;
    }
  }

  return `${prefix}${String(maxIncrement + 1).padStart(3, "0")}`;
}

export async function recoverDorianneOrder() {
  await connectToDatabase();
  const recoveredOrder = {
    orderId: "OS-20260328-001",
    orderDate: new Date("2026-03-28T18:37:00+02:00"),
    customer: {
      name: "Dorianne Wells Connor",
      pNumber: "S2100024992",
      email: "conordee8@gmail.com",
      phone: "0720488119",
    },
    shipping: {
      address1: "Recovered from InstaPay payment record",
      suburb: "Pending confirmation",
      city: "Pending confirmation",
      postalCode: "0000",
      shippingCost: 100,
    },
    payment: {
      method: "INSTAPAY",
      status: "paid",
      transactionRef: "OS-20260328-001",
      paidAmount: 180100,
      paidAt: new Date("2026-03-28T18:37:00+02:00"),
      recoveredFromInstapay: true,
    },
    items: [
      {
        productId: "FLOWER_ONLY",
        variantId: "FLOWER_ONLY_ECO",
        productName: "Flower Only",
        variantName: "Eco",
        price: 180000,
        currency: "ZAR",
        qty: 1,
        itemTotal: 180000,
      },
    ],
    totals: {
      subtotal: 180000,
      shipping: 100,
      grandTotal: 180100,
      paidGrandTotal: 180100,
    },
    status: "paid",
    notes: [
      "Recovered manually from InstaPay payment reference OS-20260328-001.",
      "Item total is R1,800.00 and paid amount / grand total is R1,801.00.",
    ],
    metadata: {
      recovered: true,
      recoveredFrom: "InstaPay successful payment details",
      displayBreakdown: {
        itemTotal: 180000,
        paidAmount: 180100,
      },
    },
  };

  const saved = await Order.findOneAndUpdate(
    { orderId: recoveredOrder.orderId },
    { $set: recoveredOrder },
    { upsert: true, new: true, lean: true }
  );

  return normalizeOrder(saved);
}