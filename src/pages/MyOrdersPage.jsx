// src/pages/MyOrdersPage.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useCart } from "../CartContext";
import { useAuth } from "../context/AuthContext";
import { apiFetch } from "../lib/api";

const statusStyles = (status) => {
  const s = String(status || "pending").toLowerCase();
  const map = {
    paid: "bg-green-100 text-green-700",
    processing: "bg-blue-100 text-blue-700",
    pending: "bg-yellow-100 text-yellow-700",
    "pending-payment": "bg-yellow-100 text-yellow-700",
    cancelled: "bg-red-100 text-red-700",
    canceled: "bg-red-100 text-red-700",
    new: "bg-gray-100 text-gray-700",
    failed: "bg-red-100 text-red-700",
  };
  return map[s] || "bg-gray-100 text-gray-700";
};

const properCase = (s) => {
  if (!s) return "Pending";
  const t = String(s).toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Match orders to the current user by pNumber (primary) or email (fallback)
const isMe = (order, user) =>
  order?.customer?.pNumber?.toLowerCase() === user?.pNumber?.toLowerCase() ||
  order?.customer?.email?.toLowerCase() === user?.email?.toLowerCase();

const isPaidOrder = (order) => {
  const paymentStatus = String(order?.payment?.status || "").toLowerCase();
  const orderStatus = String(order?.status || "").toLowerCase();
  return paymentStatus === "paid" || orderStatus === "paid";
};

const getDisplayTotal = (order) => {
  return (
    order?.totals?.paidGrandTotal ??
    order?.payment?.paidAmount ??
    order?.metadata?.displayBreakdown?.paidAmount ??
    order?.totals?.grandTotal ??
    0
  );
};

const getDisplayItemTotal = (order, item) => {
  return (
    item?.displayItemTotal ??
    order?.metadata?.displayBreakdown?.itemTotal ??
    item?.itemTotal ??
    (item?.price ?? 0) * (item?.qty ?? 1)
  );
};

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { formatPrice } = useCart();
  const { currentUser, checkUserPaidOrders } = useAuth();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");

  const authMissing = useMemo(() => {
    // Treat missing token OR missing currentUser as unauthenticated
    const token = localStorage.getItem("authToken");
    return !token || !currentUser;
  }, [currentUser]);

  useEffect(() => {
    const load = async () => {
      try {
        if (authMissing) {
          throw new Error("Not authenticated");
        }

        const res = await apiFetch("/api/my-orders"); // should return all orders or the user's orders
        if (!res.ok) {
          if (res.status === 401) {
            localStorage.removeItem("authToken");
            localStorage.removeItem("userData");
            navigate("/login", {
              replace: true,
              state: {
                sessionExpired: true,
                from: "/my-orders",
              },
            });
            return;
          }

          const txt = await res.text().catch(() => "");
          throw new Error(`Failed to load orders (${res.status}): ${txt}`);
        }
        const data = await res.json();

        // Normalize to array
        const allOrders = Array.isArray(data.orders) ? data.orders : [];

        // Keep this user's orders, including pending ones, so payment updates are visible
        const mine = allOrders.filter((o) => isMe(o, currentUser));

        // Newest first
        mine.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        setOrders(mine);

        // Optional: keep your navbar logic for showing a special state if any order is paid
        if (mine.some((o) => (o.payment?.status || o.status) === "paid")) {
          checkUserPaidOrders?.();
        }
      } catch (e) {
        setError(e.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [authMissing, currentUser, checkUserPaidOrders, navigate]);

  // Optional: redirect unauthenticated users to login
  useEffect(() => {
    if (!loading && authMissing) {
      // Adjust route as needed
      navigate("/login");
    }
  }, [loading, authMissing, navigate]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3F0071] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders…</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-[#3F0071] mb-6"></h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!error && orders.length === 0 && (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              <p className="text-gray-600 mb-4">
                Hi {currentUser?.name || currentUser?.email || "there"}, you don’t have any orders yet.
              </p>
              <Link
                to="/products"
                className="inline-block px-6 py-3 bg-[#3F0071] text-white rounded-full hover:bg-[#52207a]"
              >
                Shop Products
              </Link>
            </div>
          )}

          {!error && orders.length > 0 && (
            <div className="space-y-4">
              {orders.map((o) => {
                const status = o.payment?.status || o.status || "pending";
                return (
                  <div key={o.orderId} className="bg-white rounded-xl shadow p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Placed on {o.orderDate ? new Date(o.orderDate).toLocaleString() : "-"}
                        </p>
                        <h2 className="text-xl font-semibold text-[#028282]">
                          Order {o.orderId}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {o.items?.length || 0} item{o.items?.length !== 1 ? "s" : ""} • Total{" "}
                          <span className="font-medium">{formatPrice(getDisplayTotal(o))}</span>
                        </p>
                        <div className="mt-1">
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${statusStyles(status)}`}>
                            {properCase(status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          to={`/order-success/${o.orderId}`}
                          className="px-4 py-2 bg-[#028282] text-white rounded-full hover:bg-[#08B2B2]"
                        >
                          View
                        </Link>
                      </div>
                    </div>

                    {Array.isArray(o.items) && o.items.length > 0 && (
                      <div className="mt-4 grid sm:grid-cols-2 gap-2 text-sm text-gray-700">
                        {o.items.slice(0, 4).map((it, i) => (
                          <div key={`${o.orderId}-${it.variantId || it.productId || i}`} className="flex justify-between">
                            <span>
                              {it.productName} {it.variantName ? `(${it.variantName})` : ""} × {it.qty}
                            </span>
                            <span className="font-medium">
                              {formatPrice(getDisplayItemTotal(o, it))}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default MyOrdersPage;
