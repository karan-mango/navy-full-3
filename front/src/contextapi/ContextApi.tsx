import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// Create context
export const MyContext = createContext();

// Export the context provider
export default function ContextApi({ children }) {
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true); // For showing loading state while checking auth status

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Verify token when the app loads
      axios
        .get("http://localhost:3002/verify_token", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          setIsAuth(true); // Set authenticated if token is valid
        })
        .catch(() => {
          // Token is invalid, clear it
          localStorage.removeItem("token");
          setIsAuth(false);
        })
        .finally(() => {
          setLoading(false); // End loading state after check
        });
    } else {
      setLoading(false); // No token, no need to load
    }
  }, []);

  const data = {
    isAuth,
    setIsAuth,
    loading, // Add loading state to context so components can use it
  };

  return (
    <MyContext.Provider value={data}>
      {children}
    </MyContext.Provider>
  );
}

// Create a custom hook for using context
export const useAuth = () => useContext(MyContext);
