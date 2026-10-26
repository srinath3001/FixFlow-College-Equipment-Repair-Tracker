// FixFlow - Top Navigation Bar
// Includes title, database health beacon, demo role switcher, and quick actions.

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Menu,
  Database,
  Shield,
  Wrench,
  User,
  PlusCircle,
  Bell,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApp, ROLES } from "../../context/AppContext.jsx";
import dashboardService from "../../services/dashboardService.js";
import { queryKeys } from "../../services/queryKeys.js";

export function TopNavbar() {
  const { currentRole, setCurrentRole, sidebarOpen, setSidebarOpen, addToast } = useApp();
  const location = useLocation();

  // Real-time backend database connectivity health query
  const { data: healthData, isError } = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => dashboardService.getHealth(),
    refetchInterval: 25000, // Refresh every 25s
    retry: 1,
  });

  const isDbConnected = healthData?.database?.connected;

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return { title: "Operations Dashboard", subtitle: "Live campus maintenance overview" };
    if (path === "/complaints/new") return { title: "Report Equipment Fault", subtitle: "Submit a new repair ticket" };
    if (path.startsWith("/complaints/")) return { title: "Complaint Investigation", subtitle: "Audit history and repair status" };
    if (path === "/complaints") return { title: "Complaint Repository", subtitle: "Search, filter, and assign tickets" };
    if (path === "/technicians") return { title: "Technician Roster", subtitle: "Staff availability and open workloads" };
    if (path === "/equipment") return { title: "Campus Asset Inventory", subtitle: "Classroom and laboratory hardware" };
    if (path === "/settings") return { title: "System & Environment", subtitle: "Database health and configuration" };
    return { title: "FixFlow", subtitle: "Repair Tracker" };
  };

  const { title, subtitle } = getPageTitle();

  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setCurrentRole(newRole);
    addToast({
      type: "info",
      title: "Simulated Role Changed",
      message: `Now viewing FixFlow as ${newRole}. UI permissions updated.`,
    });
  };

  return (
    <header
      style={{
        height: "var(--topbar-height)",
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-card)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 800,
      }}
    >
      {/* Left: Mobile Toggle & Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost hamburger-btn"
          style={{ padding: 8, display: "none" }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div>
          <h1 style={{ fontSize: "1.15rem", fontWeight: 700, lineHeight: 1.2 }}>
            {title}
          </h1>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: DB Health, Demo Role Selector, Quick Report Button */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* Database Connectivity Indicator */}
        <div
          title={
            isDbConnected
              ? `PostgreSQL Connected (${healthData?.database?.latencyMs || 0}ms)`
              : "PostgreSQL Unreachable - Check server/.env password"
          }
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "5px 11px",
            borderRadius: "var(--radius-full)",
            backgroundColor: isDbConnected
              ? "var(--color-success-bg)"
              : "var(--color-warning-bg)",
            border: `1px solid ${
              isDbConnected
                ? "var(--color-success-border)"
                : "var(--color-warning-border)"
            }`,
            fontSize: "0.75rem",
            fontWeight: 600,
            color: isDbConnected ? "var(--color-success)" : "var(--color-warning)",
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: isDbConnected ? "var(--color-success)" : "#F59E0B",
              boxShadow: isDbConnected
                ? "0 0 8px var(--color-success)"
                : "0 0 8px #F59E0B",
            }}
          />
          <Database size={13} />
          <span className="db-health-label">
            {isDbConnected ? "PostgreSQL Active" : "DB Connecting..."}
          </span>
        </div>

        {/* Demo Role Selector Dropdown */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            backgroundColor: "var(--bg-elevated)",
            border: "1px solid var(--border-card)",
            padding: "4px 8px 4px 12px",
            borderRadius: "var(--radius-md)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {currentRole === ROLES.ADMIN ? (
              <Shield size={14} color="var(--accent-primary-light)" />
            ) : currentRole === ROLES.TECHNICIAN ? (
              <Wrench size={14} color="#FBBF24" />
            ) : (
              <User size={14} color="var(--accent-secondary)" />
            )}
            <span
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
              }}
            >
              Role:
            </span>
          </div>

          <select
            value={currentRole}
            onChange={handleRoleChange}
            style={{
              backgroundColor: "transparent",
              border: "none",
              color: "var(--text-main)",
              fontWeight: 600,
              fontSize: "0.85rem",
              cursor: "pointer",
              padding: "2px 4px",
            }}
            aria-label="Select demo user role"
          >
            <option value={ROLES.ADMIN} style={{ background: "#121826" }}>
              Admin (Full Control)
            </option>
            <option value={ROLES.TECHNICIAN} style={{ background: "#121826" }}>
              Technician (Repairs)
            </option>
            <option value={ROLES.REPORTER} style={{ background: "#121826" }}>
              Reporter (Student/Faculty)
            </option>
          </select>
        </div>

        {/* Quick Report Fault Action */}
        <Link to="/complaints/new" className="btn btn-primary btn-sm">
          <PlusCircle size={15} />
          <span className="btn-text">Report Fault</span>
        </Link>
      </div>
    </header>
  );
}

export default TopNavbar;
