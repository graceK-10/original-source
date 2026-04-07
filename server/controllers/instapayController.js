import { setOrderStatus } from "../services/ordersService.js";

// NOTE: InstaPay typically POSTs x-www-form-urlencoded
export async function handleInstapayNotify(req, res) {
  try {
    // Map fields EXACTLY as InstaPay sends them back (adjust names if needed)
    const orderId = req.body.m_tx_order_nr || req.body.tx_order_nr || req.body.orderId;
    const gatewayStatus = req.body.m_status || req.body.status || req.body.tx_status;

    console.log("InstaPay notify:", { body: req.body });

    if (!orderId) return res.status(400).json({ error: "Missing order id (m_tx_order_nr)" });

    // (Optional) verify checksum here if you already have verify logic
    // const okChecksum = verifyChecksum(req.body); if (!okChecksum) return res.status(400).json({ error: "Bad checksum" });

    const ok = setOrderStatus(orderId, gatewayStatus);
    if (!ok) return res.status(404).json({ error: "Order not found" });

    return res.json({ ok: true });
  } catch (e) {
    console.error("handleInstapayNotify error:", e);
    return res.status(500).json({ error: "Server error" });
  }
}

// Optional: return URL handler (when user is redirected back to your site)
export async function handleInstapayReturn(req, res) {
  try {
    const orderId = req.query.m_tx_order_nr || req.query.tx_order_nr || req.query.orderId;
    const gatewayStatus = req.query.m_status || req.query.status || req.query.tx_status;

    if (orderId && gatewayStatus) setOrderStatus(orderId, gatewayStatus);
    // Redirect the user to your success page
    return res.redirect(`/order-success/${orderId}`);
  } catch (e) {
    console.error("handleInstapayReturn error:", e);
    return res.redirect(`/order-failed`);
  }
}
