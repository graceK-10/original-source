// server/controllers/ordersController.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { validatePNumber } from '../utils/jsonValidator.js';
import {
  createOrderRecord,
  findOrderById,
  getNextOrderId,
  getOrdersForUser,
} from '../services/orderStore.js';
import { generateSecureToken, hashToken } from '../utils/tokens.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PRODUCTS_FILE_PATH = path.join(__dirname, '..', 'data', 'products.json');

export async function getMyOrders(req, res) {
  try {
    const user = req.user || {};
    if (!user.pNumber) {
      return res.status(400).json({ error: 'Missing SAHPRA-Number' });
    }

    const orders = await getOrdersForUser(user);
    return res.json({ orders });
  } catch (error) {
    console.error('Error getting my orders:', error);
    return res.status(500).json({ error: 'Server error retrieving orders' });
  }
}

const readProducts = () => {
  try {
    if (!fs.existsSync(PRODUCTS_FILE_PATH)) {
      return [];
    }

    const data = fs.readFileSync(PRODUCTS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading products file:', error);
    return [];
  }
};

// Get products
export const getProducts = (req, res) => {
  try {
    const products = readProducts();
    res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({ error: 'Server error retrieving products' });
  }
};

// Create order
// Create order (drop-in replacement)
export const createOrder = async (req, res) => {
  try {
    // --- helpers (local to this handler) ---
    const norm = (s) =>
      (s ?? "").toString().trim().replace(/\s+/g, " ");
    const normLower = (s) => norm(s).toLowerCase();
    const normP = (p) => norm(p).replace(/[^a-z0-9]/gi, ""); // strip spaces/dashes

    // Validate user from JWT (already done by auth middleware)
    const user = req.user || {};
    const userName  = user.name  || "";
    const userPNRaw = user.pNumber || "";
    const userEmail = user.email || "";
    const userPhone = user.phone || "";

    // Recheck SAHPRA-Number validity (use normalized)
    const userPN = normP(userPNRaw);
    const pNumberValidation = await validatePNumber(userPN);
    if (!pNumberValidation.valid) {
      return res.status(401).json({
        error: pNumberValidation.message || "Your SAHPRA Number has expired",
        expired: true,
      });
    }

    // Validate request body
    const { contact, shipping, onboardingConfirmed, paymentMethod, items } = req.body || {};
    const normalizedPaymentMethod = String(paymentMethod || "").trim().toUpperCase();

    if (!contact || !shipping || onboardingConfirmed === undefined || !paymentMethod || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: "Invalid order data. Missing required fields." });
    }
    if (!contact.email || !contact.phone) {
      return res.status(400).json({ error: "Contact information incomplete." });
    }
    if (!shipping.address1 || !shipping.suburb || !shipping.city || !shipping.postalCode) {
      return res.status(400).json({ error: "Shipping information incomplete." });
    }
    if (!["EFT", "COD", "INSTAPAY"].includes(normalizedPaymentMethod)) {
      console.warn("[createOrder] Invalid paymentMethod received:", paymentMethod);
      return res.status(400).json({ error: `Invalid payment method: ${paymentMethod}` });
    }
    if (!onboardingConfirmed) {
      return res.status(400).json({ error: "Onboarding confirmation is required." });
    }
    if (items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item." });
    }

    // Validate products and calculate totals
    const products = readProducts();
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const { productId, variantId, qty } = item;

      if (!productId || !variantId || !qty || qty <= 0) {
        return res.status(400).json({ error: "Invalid item data." });
      }

      const product = products.find((p) => p.id === productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found: ${productId}` });
      }

      const variant = product.variants.find((v) => v.id === variantId);
      if (!variant) {
        return res.status(400).json({ error: `Variant not found: ${variantId}` });
      }

      const itemTotal = variant.price * qty;
      subtotal += itemTotal;

      validatedItems.push({
        productId,
        variantId,
        productName: product.name,
        variantName: variant.tier,
        price: variant.price,
        currency: variant.currency,
        qty,
        itemTotal,
      });
    }

    // Totals
    const shippingCost = 0; // MVP: free shipping
    const grandTotal = subtotal + shippingCost;

    // Generate order ID
    const orderId = await getNextOrderId();
    const successToken = generateSecureToken(32);
    const successTokenIssuedAt = new Date();
    const successTokenExpiresAt = new Date(successTokenIssuedAt.getTime() + 1000 * 60 * 60);

    // 🔐 Build a stable customer stamp from the authenticated user,
    // with contact data as fallback (never lose the pNumber/email on file)
    const customer = {
      name: norm(userName || contact?.name || ""),
      pNumber: normP(userPN || contact?.pNumber || ""),
      email: normLower(userEmail || contact?.email || ""),
      phone: norm(contact?.phone || userPhone || ""),
    };

    // Create order object
    const order = {
      orderId,
      orderDate: new Date().toISOString(),
      customer,
      shipping: {
        ...shipping,
        shippingCost,
      },
      payment: {
        method: normalizedPaymentMethod,
        status: "pending", // update later when you confirm payment
      },
      items: validatedItems,
      totals: {
        subtotal,
        shipping: shippingCost,
        grandTotal,
        paidGrandTotal: null,
      },
      status: "new",
      notes: [],
      metadata: {
        successTokenHash: hashToken(successToken),
        successTokenIssuedAt: successTokenIssuedAt.toISOString(),
        successTokenExpiresAt: successTokenExpiresAt.toISOString(),
        successTokenUsedAt: null,
        successTokenLastSeenAt: null,
        successPageSeenAt: null,
        successPageConfirmed: false,
      },
    };

    await createOrderRecord(order);

    // (Optional) Send emails here
    // await sendOrderEmails(order);

    // Response
    res.status(201).json({
      success: true,
      orderId,
      successToken,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Server error processing order" });
  }
};


// Get order by ID
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID is required' });
    }
    
    const order = await findOrderById(orderId);
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if the order belongs to the authenticated user
    if (String(order.customer?.pNumber || '') !== String(req.user?.pNumber || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    res.status(500).json({ error: 'Server error retrieving order' });
  }
};

// Send order confirmation emails
export const sendOrderEmails = async (order) => {
  try {
    // Create email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 465),
      secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    
    // Format currency
    const formatCurrency = (amount) => {
      return `R${(amount / 100).toFixed(2)}`;
    };
    
    // Generate items HTML
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.productName} (${item.variantName})</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.qty}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(item.price)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${formatCurrency(item.itemTotal)}</td>
      </tr>
    `).join('');
    
    // Generate EFT instructions if applicable
    let eftInstructions = '';
    if (order.payment.method === 'EFT') {
      eftInstructions = `
        <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 5px;">
          <h3 style="color: #028282; margin-top: 0;">EFT Payment Instructions</h3>
          <p>Please make payment to the following account:</p>
          <ul style="list-style-type: none; padding-left: 0;">
            <li><strong>Bank:</strong> ${process.env.EFT_BANK_NAME}</li>
            <li><strong>Account Name:</strong> ${process.env.EFT_ACCOUNT_NAME}</li>
            <li><strong>Account Number:</strong> ${process.env.EFT_ACCOUNT_NUMBER}</li>
            <li><strong>Branch Code:</strong> ${process.env.EFT_BRANCH_CODE}</li>
            <li><strong>Reference:</strong> ${process.env.EFT_REFERENCE_PREFIX}-${order.orderId}</li>
          </ul>
          <p>Please use the reference number when making your payment.</p>
        </div>
      `;
    }
    
    // Admin email
    await transporter.sendMail({
      from: `"Original Source Orders" <${process.env.FROM_EMAIL}>`,
      to: process.env.ADMIN_ORDER_EMAIL || process.env.TO_EMAIL, 
      subject: `New Order ${order.orderId} - Original Source`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #028282;">New Order: ${order.orderId}</h2>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028282;">Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer.name}</p>
            <p><strong>SAHPRA-Number:</strong> ${order.customer.pNumber}</p>
            <p><strong>Email:</strong> ${order.customer.email}</p>
            <p><strong>Phone:</strong> ${order.customer.phone}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028282;">Shipping Information</h3>
            <p><strong>Address:</strong> ${order.shipping.address1}</p>
            <p><strong>Suburb:</strong> ${order.shipping.suburb}</p>
            <p><strong>City:</strong> ${order.shipping.city}</p>
            <p><strong>Postal Code:</strong> ${order.shipping.postalCode}</p>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028282;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Qty</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Price</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; border-top: 1px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; border-top: 1px solid #ddd;">${formatCurrency(order.totals.subtotal)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 8px;">${formatCurrency(order.totals.shipping)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Grand Total:</strong></td>
                  <td style="padding: 8px;"><strong>${formatCurrency(order.totals.grandTotal)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      `
    });
    
    // Customer email
    await transporter.sendMail({
      from: `"Original Source" <${process.env.FROM_EMAIL}>`,
      to: order.customer.email,
      subject: `Order Confirmation ${order.orderId} - Original Source`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #028282;">Order Confirmation: ${order.orderId}</h2>
          
          <p>Dear ${order.customer.name},</p>
          
          <p>Thank you for your order with Original Source. We're processing your order and will be in touch shortly.</p>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028282;">Order Summary</h3>
            <p><strong>Order ID:</strong> ${order.orderId}</p>
            <p><strong>Date:</strong> ${new Date(order.orderDate).toLocaleString()}</p>
            <p><strong>Payment Method:</strong> ${order.payment.method}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Product</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Qty</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Price</th>
                  <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right; border-top: 1px solid #ddd;"><strong>Subtotal:</strong></td>
                  <td style="padding: 8px; border-top: 1px solid #ddd;">${formatCurrency(order.totals.subtotal)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Shipping:</strong></td>
                  <td style="padding: 8px;">${formatCurrency(order.totals.shipping)}</td>
                </tr>
                <tr>
                  <td colspan="3" style="padding: 8px; text-align: right;"><strong>Grand Total:</strong></td>
                  <td style="padding: 8px;"><strong>${formatCurrency(order.totals.grandTotal)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          <div style="margin-bottom: 20px;">
            <h3 style="color: #028282;">Shipping Information</h3>
            <p><strong>Address:</strong> ${order.shipping.address1}</p>
            <p><strong>Suburb:</strong> ${order.shipping.suburb}</p>
            <p><strong>City:</strong> ${order.shipping.city}</p>
            <p><strong>Postal Code:</strong> ${order.shipping.postalCode}</p>
          </div>
          
          ${eftInstructions}
          
          <div style="margin-top: 20px;">
            <p>If you have any questions about your order, please contact us at <a href="mailto:${process.env.TO_EMAIL}">${process.env.TO_EMAIL}</a>.</p>
            <p>Thank you for choosing Original Source for your medical cannabis needs.</p>
          </div>
        </div>
      `
    });
    
    console.log(`Order emails sent for order ${order.orderId}`);
    return true;
  } catch (error) {
    console.error('Error sending order emails:', error);
    return false;
  }
};

export default {
  getProducts,
  createOrder,
  getOrderById,
  getMyOrders,
};
