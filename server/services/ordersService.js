// server/services/ordersService.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const ORDERS_PATH = path.resolve(__dirname, "..", "data", "orders.json"); // << stable

export function readOrders() {
  return JSON.parse(fs.readFileSync(ORDERS_PATH, "utf8"));
}
export function writeOrders(orders) {
  fs.writeFileSync(ORDERS_PATH, JSON.stringify(orders, null, 2));
}
export function setOrderStatus(orderId, gatewayStatus) {
  const orders = readOrders();
  const i = orders.findIndex(o => o.orderId === orderId);
  if (i === -1) return false;

  const g = String(gatewayStatus || "").trim().toUpperCase();
  let mapped = "pending";
  if (["PAID","SUCCESS","OK","APPROVED","COMPLETE","COMPLETED"].includes(g)) mapped = "paid";
  if (["FAILED","FAIL","DECLINED","CANCELLED","CANCELED","ERROR"].includes(g)) mapped = "cancelled";

  orders[i].payment = { ...(orders[i].payment || {}), status: mapped };
  orders[i].status = mapped;
  writeOrders(orders);
  return true;
}