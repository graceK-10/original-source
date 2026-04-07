import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../CartContext";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CartPage = () => {
  const { cartItems, updateQty, removeItem, subtotal, formatPrice } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isUpdating, setIsUpdating] = useState(false);

  // Handle checkout button click
  const handleCheckout = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate("/login", { state: { from: "/checkout" } });
    } else {
      // Proceed to checkout
      navigate("/checkout");
    }
  };

  // Handle quantity change
  const handleQtyChange = (variantId, newQty) => {
    setIsUpdating(true);
    updateQty(variantId, parseInt(newQty, 10));
    setTimeout(() => setIsUpdating(false), 300);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F3EDE2] pt-32 pb-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-[#046A6A] mb-8"></h1>

          {cartItems.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <p className="text-gray-600 mb-6">Your cart is empty.</p>
              <Link
                to="/products"
                className="inline-block px-6 py-2 bg-[#046A6A] text-white rounded-full hover:bg-[#028282] transition-colors"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-[#046A6A] mb-4">
                      Cart Items ({cartItems.length})
                    </h2>

                    <div className="divide-y divide-gray-200">
                      {cartItems.map((item) => (
                        <div
                          key={item.variantId}
                          className="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4"
                        >
                          {/* Product Image */}
                          <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          {/* Product Details */}
                          <div className="flex-grow">
                            <h3 className="text-lg font-medium text-gray-800">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {item.tier} Tier
                            </p>
                            <p className="text-[#046A6A] font-medium">
                              {formatPrice(item.price)}
                            </p>
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleQtyChange(item.variantId, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                              disabled={isUpdating}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) =>
                                handleQtyChange(item.variantId, e.target.value)
                              }
                              className="w-12 h-8 text-center border border-gray-300 rounded-md"
                              disabled={isUpdating}
                            />
                            <button
                              onClick={() => handleQtyChange(item.variantId, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-100"
                              aria-label="Increase quantity"
                              disabled={isUpdating}
                            >
                              +
                            </button>
                          </div>

                          {/* Remove Button */}
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-red-500 hover:text-red-700 text-sm"
                            aria-label="Remove item"
                            disabled={isUpdating}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                  <h2 className="text-xl font-semibold text-[#046A6A] mb-4">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">Free</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span className="text-[#046A6A]">{formatPrice(subtotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleCheckout}
                      className="w-full py-3 bg-[#046A6A] text-white rounded-full hover:bg-[#028282] transition-colors"
                    >
                      Proceed to Checkout
                    </button>
                    <Link
                      to="/products"
                      className="block w-full py-3 text-center border border-[#046A6A] text-[#046A6A] rounded-full hover:bg-[#046A6A]/10 transition-colors"
                    >
                      Continue Shopping
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CartPage;
