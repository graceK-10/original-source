// src/CartContext.jsx

import { createContext, useState, useContext, useEffect } from "react";
import PropTypes from "prop-types";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialize cart from localStorage if available
  const [cartItems, setCartItems] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  // Sync cart with localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Calculate cart count (total quantity of all items)
  const cartCount = cartItems.reduce((total, item) => total + item.qty, 0);

  // Calculate subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

  // Add item to cart
  const addItem = (item) => {
    setCartItems(prevItems => {
      // Check if item already exists in cart by variantId
      const existingItemIndex = prevItems.findIndex(i => i.variantId === item.variantId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          qty: updatedItems[existingItemIndex].qty + item.qty
        };
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, item];
      }
    });
  };

  // Update item quantity
  const updateQty = (variantId, qty) => {
    if (qty <= 0) {
      removeItem(variantId);
      return;
    }
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.variantId === variantId ? { ...item, qty } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (variantId) => {
    setCartItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Format price for display (ZAR)
  const formatPrice = (price) => {
    return `R${(price / 100).toFixed(2)}`;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        subtotal,
        addItem,
        updateQty,
        removeItem,
        clearCart,
        formatPrice
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

// PropTypes validation
CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};
