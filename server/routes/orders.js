// server/routes/orders.js
import express from "express";
import { auth, requireValidated } from "../middleware/auth.js";
import { createOrder, getOrderById, getMyOrders } from "../controllers/ordersController.js";

const router = express.Router();

// Create a new order
router.post("/orders", auth, requireValidated, createOrder);

// Get a specific order by ID
router.get("/orders/:orderId", auth, getOrderById);

// Get orders for the authenticated user
router.get("/my-orders", auth, getMyOrders);

export default router;
