import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: true, trim: true },
    variantId: { type: String, required: true, trim: true },
    productName: { type: String, required: true, trim: true },
    variantName: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    currency: { type: String, default: "ZAR", trim: true },
    qty: { type: Number, required: true, min: 1 },
    itemTotal: { type: Number, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true, trim: true },
    orderDate: { type: Date, default: Date.now, index: true },
    customer: {
      name: { type: String, required: true, trim: true },
      pNumber: { type: String, required: true, trim: true, index: true },
      email: { type: String, default: "", trim: true, lowercase: true, index: true },
      phone: { type: String, default: "", trim: true },
    },
    shipping: {
      address1: { type: String, default: "", trim: true },
      suburb: { type: String, default: "", trim: true },
      city: { type: String, default: "", trim: true },
      postalCode: { type: String, default: "", trim: true },
      shippingCost: { type: Number, default: 0 },
    },
    payment: {
      method: { type: String, default: "INSTAPAY", trim: true },
      status: { type: String, default: "pending", trim: true, index: true },
      transactionRef: { type: String, default: null, trim: true },
      paidAmount: { type: Number, default: null },
      paidAt: { type: Date, default: null },
      recoveredFromInstapay: { type: Boolean, default: false },
    },
    items: {
      type: [orderItemSchema],
      default: [],
    },
    totals: {
      subtotal: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      grandTotal: { type: Number, default: 0 },
      paidGrandTotal: { type: Number, default: null },
    },
    status: { type: String, default: "new", trim: true, index: true },
    notes: {
      type: [String],
      default: [],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;