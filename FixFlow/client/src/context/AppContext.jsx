// FixFlow - Application Global Context
// Manages demo role state, simulated technician identity, global toasts, and sidebar toggling.

import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

export const ROLES = {
  ADMIN: "Admin",
  TECHNICIAN: "Technician",
  REPORTER: "Reporter",
};

export function AppProvider({ children }) {
  // Demo Role state (defaults to Admin for full evaluator exploration)
  const [currentRole, setCurrentRole] = useState(ROLES.ADMIN);

  // Active Technician identity (used when role is Technician)
  const [activeTechnician, setActiveTechnician] = useState({
    id: null,
    name: "Rajesh Kumar",
    specialization: "Projectors & A/V",
  });

  // Mobile sidebar open/close state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ type = "info", title = "", message }) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    const newToast = { id, type, title, message };
    setToasts((prev) => [...prev, newToast]);

    // Automatically remove toast after 4.5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    currentRole,
    setCurrentRole,
    activeTechnician,
    setActiveTechnician,
    sidebarOpen,
    setSidebarOpen,
    toasts,
    addToast,
    removeToast,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
