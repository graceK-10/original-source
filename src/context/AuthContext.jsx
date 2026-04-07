import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AuthContext, { useAuth } from "./authUtils";
import { apiFetch, attemptSilentAuth, ensureFreshToken } from "../lib/api";

// Re-export the useAuth hook for convenience
export { useAuth };

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasPaidOrders, setHasPaidOrders] = useState(false);

  // Check if user is already logged in with silent authentication
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const userData = localStorage.getItem("userData");
        
        if (token && userData) {
          console.log("[Auth] Found existing auth data in localStorage");
          const user = JSON.parse(userData);
          setCurrentUser(user);
          
          // Attempt to refresh the token silently in the background
          // This ensures we have a fresh token for future API calls
          try {
            console.log("[Auth] Attempting silent token refresh");
            await ensureFreshToken();
            console.log("[Auth] Silent token refresh successful");
          } catch (refreshErr) {
            console.warn("[Auth] Silent token refresh failed:", refreshErr.message);
            // We'll keep using the current token for now
          }
          
          // Check if user has paid orders
          if (user) {
            checkUserPaidOrders();
          }
        } else {
          // No stored credentials, try silent authentication
          // This helps when the refresh token cookie is still valid but localStorage was cleared
          console.log("[Auth] No stored credentials, attempting silent auth");
          try {
            const success = await attemptSilentAuth();
            if (success) {
              console.log("[Auth] Silent auth successful, retrieving user data");
              // Token refreshed successfully, now get the user data
              await refreshUserData();
            } else {
              console.log("[Auth] Silent auth failed - user needs to log in");
            }
          } catch (silentAuthErr) {
            console.warn("[Auth] Silent auth error:", silentAuthErr.message);
          }
        }
      } catch (err) {
        console.error("[Auth] Authentication error:", err);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userData");
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Login with name and P number
  const login = async (name, pNumber) => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the same environment variable (VITE_API_BASE) as the rest of the app
      // This ensures consistency between API calls
      const base = (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) || "";
      console.log("[Auth] Using API base:", base);
      const response = await fetch(`${base}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, pNumber }),
        credentials: "include",
      });
      
      // const data = await response.json();
           const ct = response.headers.get("content-type") || "";
     let data;
     if (ct.includes("application/json")) {
       data = await response.json();
     } else {
       const text = await response.text();
       if (!response.ok) {
         throw new Error(text || `HTTP ${response.status} ${response.statusText}`);
       }
       // If it somehow *is* ok but not JSON, force a helpful error:
       throw new Error("Server returned non-JSON response.");
     }
      
      if (!response.ok) {
        const error = new Error(data.error || "Login failed");
        error.status = response.status;
        error.expired = Boolean(data?.expired);
        error.expiryDate = data?.expiryDate || null;
        error.nameFromServer = data?.name || name;
        throw error;
      }
      
      // ⚡️ Ensure email + phone are included in the user object
      const userWithContact = {
        ...data.user,
        email: data.user.email || "",   // filled from pnumbers.csv via backend
        phone: data.user.phone || "",   // filled from pnumbers.csv via backend
      };

      // Store in localStorage
      localStorage.setItem("authToken", data.accessToken);
      localStorage.setItem("userData", JSON.stringify(userWithContact));
      
      setCurrentUser(userWithContact);
      return { ...data, user: userWithContact };
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint to invalidate the refresh token
      // Use the same environment variable (VITE_API_BASE) as the rest of the app
      const base = (import.meta.env && (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE)) || "";
      await fetch(`${base}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // Important to include cookies
      });
    } catch (err) {
      console.error("[Auth] Error during logout:", err.message);
      // Continue with local logout even if server logout fails
    }
    
    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    
    // Update state
    setCurrentUser(null);
    setHasPaidOrders(false);
    console.log("[Auth] User logged out successfully");
  };
  
  // Check if user has any paid orders
  const checkUserPaidOrders = async () => {
    if (!currentUser) return false;
    
    try {
      const res = await apiFetch("/api/my-orders");
      if (!res.ok) {
        return false;
      }
      
      const data = await res.json();
      const orders = Array.isArray(data.orders) ? data.orders : [];
      
      // Check if any order has payment.status === "paid" or status === "paid"
      const hasPaid = orders.some(order => 
        order.payment?.status === "paid" || order.status === "paid"
      );
      
      setHasPaidOrders(hasPaid);
      return hasPaid;
    } catch (err) {
      console.error("Error checking paid orders:", err);
      return false;
    }
  };

  const validatePNumber = async (pNumber) => {
    try {
      const response = await fetch(`/api/auth/validate-pnumber?pNumber=${pNumber}`);
      // const data = await response.json();
     const ct = response.headers.get("content-type") || "";
     let data;
     if (ct.includes("application/json")) {
       data = await response.json();
     } else {
       const text = await response.text();
       if (!response.ok) {
         throw new Error(text || `HTTP ${response.status} ${response.statusText}`);
       }
       // If it somehow *is* ok but not JSON, force a helpful error:
       throw new Error("Server returned non-JSON response.");
     }      
      
      if (!response.ok) {
        throw new Error(data.error || "Validation failed");
      }
      
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Refresh user data from the server
   * Uses our enhanced apiFetch which handles token refreshing automatically
   */
  const refreshUserData = async () => {
    if (!localStorage.getItem("authToken")) return null;
    
    try {
      console.log("[Auth] Refreshing user data from server");
      const response = await apiFetch("/api/auth/user");
      
      if (!response.ok) {
        console.error("[Auth] Failed to fetch user data:", response.status);
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await response.json();

      // Make sure email + phone are always included
      const updatedUser = {
        ...userData,
        email: userData.email || "",
        phone: userData.phone || "",
      };

      console.log("[Auth] User data refreshed successfully");
      setCurrentUser(updatedUser);
      localStorage.setItem("userData", JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (err) {
      console.error("[Auth] Error refreshing user data:", err.message);
      if (err.message.includes("authentication") || 
          err.message.includes("token") || 
          err.message.includes("401") ||
          err.message.includes("403")) {
        console.log("[Auth] Auth error during refresh, logging out");
        logout();
      }
      return null;
    }
  };
  
  /**
   * Force token refresh
   * This can be called when you know the token needs refreshing
   */
  const refreshToken = async () => {
    try {
      console.log("[Auth] Manually refreshing token");
      await ensureFreshToken();
      return true;
    } catch (err) {
      console.error("[Auth] Manual token refresh failed:", err.message);
      return false;
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    hasPaidOrders,
    login,
    logout,
    validatePNumber,
    refreshUserData,
    checkUserPaidOrders,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};



AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
