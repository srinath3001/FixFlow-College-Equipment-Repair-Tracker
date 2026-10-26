// FixFlow - Sidebar Navigation Component
// Responsive desktop sidebar and mobile slide-over drawer with role indicator.

import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Wrench,
  Cpu,
  Settings,
  ShieldCheck,
  UserCheck,
  Zap,
  X,
} from "lucide-react";
import { useApp } from "../../context/AppContext.jsx";

export function Sidebar() {
  const { currentRole, sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();

  const navItems = [
    {
      to: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: "/complaints/new",
      label: "Report a Fault",
      icon: PlusCircle,
      highlight: true,
    },
    {
      to: "/complaints",
      label: "All Complaints",
      icon: ClipboardList,
    },
    {
      to: "/technicians",
      label: "Technicians",
      icon: Wrench,
    },
    {
      to: "/equipment",
      label: "Equipment Inventory",
      icon: Cpu,
    },
    {
      to: "/settings",
      label: "Settings & System",
      icon: Settings,
    },
  ];

  const closeSidebarOnMobile = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            backdropFilter: "blur(4px)",
            zIndex: 900,
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar Container */}
      <aside
        style={{
          width: "var(--sidebar-width)",
          backgroundColor: "var(--bg-sidebar)",
          borderRight: "1px solid var(--border-card)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 950,
          transition: "transform var(--transition-normal)",
        }}
        className={`sidebar-nav ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        {/* Brand Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-md)",
                background: "linear-gradient(135deg, var(--accent-primary) 0%, #6366F1 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 16px var(--accent-primary-glow)",
              }}
            >
              <Zap size={22} color="#FFFFFF" />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  color: "#FFFFFF",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                FixFlow
                <span
                  style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "rgba(139, 92, 246, 0.2)",
                    color: "var(--accent-primary-light)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                  }}
                >
                  v1.0
                </span>
              </div>
              <div
                style={{
                  fontSize: "0.72rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.2,
                  marginTop: 2,
                }}
              >
                College Repair Tracker
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="btn btn-ghost mobile-close-btn"
            style={{ padding: 4, display: "none" }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tagline Banner */}
        <div
          style={{
            padding: "12px 24px",
            fontSize: "0.76rem",
            color: "var(--accent-secondary)",
            background: "rgba(6, 182, 212, 0.05)",
            borderBottom: "1px solid var(--border-subtle)",
            fontStyle: "italic",
          }}
        >
          "Every fault tracked. Every repair moving."
        </div>

        {/* Navigation Links */}
        <nav
          style={{
            flex: 1,
            padding: "20px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              padding: "0 12px 8px 12px",
            }}
          >
            Navigation
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.to;

            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={closeSidebarOnMobile}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: "var(--radius-md)",
                  fontSize: "0.9rem",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#FFFFFF" : "var(--text-secondary)",
                  backgroundColor: isActive
                    ? item.highlight
                      ? "rgba(139, 92, 246, 0.25)"
                      : "var(--bg-elevated)"
                    : "transparent",
                  border: isActive
                    ? "1px solid var(--border-accent)"
                    : "1px solid transparent",
                  transition: "all var(--transition-fast)",
                }}
                className={({ isActive }) => (isActive ? "nav-link-active" : "nav-link")}
              >
                <Icon
                  size={19}
                  style={{
                    color: isActive
                      ? "var(--accent-primary-light)"
                      : "var(--text-muted)",
                  }}
                />
                <span style={{ flex: 1 }}>{item.label}</span>

                {item.highlight && !isActive && (
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      backgroundColor: "var(--accent-primary)",
                      boxShadow: "0 0 8px var(--accent-primary)",
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Role Demo Footer Badge */}
        <div
          style={{
            padding: "16px",
            margin: "16px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-card)",
            borderRadius: "var(--radius-lg)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                fontSize: "0.7rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                color: "var(--accent-secondary)",
              }}
            >
              Simulated Role
            </span>
            <span
              style={{
                fontSize: "0.65rem",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: "rgba(245, 158, 11, 0.15)",
                color: "#FBBF24",
                border: "1px solid rgba(245, 158, 11, 0.3)",
              }}
            >
              DEMO ONLY
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "var(--bg-elevated)",
                border: "1px solid var(--border-card)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--accent-primary-light)",
              }}
            >
              {currentRole === "Admin" ? (
                <ShieldCheck size={18} />
              ) : currentRole === "Technician" ? (
                <Wrench size={18} />
              ) : (
                <UserCheck size={18} />
              )}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.88rem", color: "#FFFFFF" }}>
                {currentRole} Mode
              </div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Switch in top bar
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
