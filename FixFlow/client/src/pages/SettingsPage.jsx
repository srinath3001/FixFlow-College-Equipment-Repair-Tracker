// FixFlow - Settings & System Diagnostics Page
// Real health-check ping against GET /api/health, workflow diagrams, and architecture information.

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Database,
  Activity,
  Layers,
  Shield,
  Wrench,
  User,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Server,
  Code2,
} from "lucide-react";
import dashboardService from "../services/dashboardService.js";
import { queryKeys } from "../services/queryKeys.js";
import { useApp } from "../context/AppContext.jsx";

export function SettingsPage() {
  const { currentRole, setCurrentRole } = useApp();

  // Real backend health check query
  const { data: health, isLoading, isRefetching, refetch } = useQuery({
    queryKey: queryKeys.health,
    queryFn: () => dashboardService.getHealth(),
    refetchInterval: 30000,
  });

  const isConnected = health?.database?.connected;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000, margin: "0 auto" }}>
      {/* System Information Header */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
          borderColor: "rgba(139, 92, 246, 0.3)",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "var(--radius-lg)",
              background: "linear-gradient(135deg, var(--accent-primary) 0%, #6366F1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px var(--accent-primary-glow)",
              flexShrink: 0,
            }}
          >
            <Zap size={28} color="#FFFFFF" />
          </div>

          <div>
            <h2 style={{ fontSize: "1.45rem", marginBottom: 2 }}>
              FixFlow — College Equipment Repair Tracker
            </h2>
            <div style={{ fontSize: "0.9rem", color: "var(--accent-secondary)", fontStyle: "italic", marginBottom: 6 }}>
              "Every fault tracked. Every repair moving."
            </div>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
              A full-stack campus maintenance management application built with React, Node.js, Express, PostgreSQL, and Prisma ORM 6.19.0.
            </p>
          </div>
        </div>
      </div>

      {/* Real-time System & Database Connectivity Ping */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Server size={18} color="var(--accent-primary-light)" />
            PostgreSQL & Express API Health
          </div>
          <button
            onClick={() => refetch()}
            className="btn btn-secondary btn-sm"
            disabled={isRefetching}
            style={{ gap: 6 }}
          >
            <RefreshCw size={14} className={isRefetching ? "status-dot-pulse" : ""} />
            {isRefetching ? "Testing Connection..." : "Ping Now"}
          </button>
        </div>

        <div className="grid grid-cols-2">
          {/* PostgreSQL Connectivity Card */}
          <div
            style={{
              padding: 20,
              borderRadius: "var(--radius-md)",
              backgroundColor: isConnected ? "rgba(16, 185, 129, 0.08)" : "rgba(245, 158, 11, 0.08)",
              border: `1px solid ${isConnected ? "var(--color-success-border)" : "var(--color-warning-border)"}`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Database size={18} color={isConnected ? "var(--color-success)" : "#F59E0B"} />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>PostgreSQL Database</span>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: isConnected ? "var(--color-success-bg)" : "var(--color-warning-bg)",
                  color: isConnected ? "var(--color-success)" : "#F59E0B",
                  border: `1px solid ${isConnected ? "var(--color-success-border)" : "var(--color-warning-border)"}`,
                }}
              >
                {isConnected ? "CONNECTED" : "UNREACHABLE"}
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 12 }}>
              {isConnected ? (
                <div>
                  Database query ping executed successfully in <strong>{health?.database?.latencyMs}ms</strong> via PrismaClient.
                </div>
              ) : (
                <div style={{ color: "#FBBF24" }}>
                  {health?.database?.error || "Cannot authenticate or reach PostgreSQL. Please verify your password in server/.env."}
                </div>
              )}
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              Prisma ORM Version: <strong style={{ color: "var(--accent-primary-light)" }}>6.19.0</strong>
            </div>
          </div>

          {/* Express API Server Card */}
          <div
            style={{
              padding: 20,
              borderRadius: "var(--radius-md)",
              backgroundColor: "rgba(139, 92, 246, 0.08)",
              border: "1px solid var(--border-accent)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Server size={18} color="var(--accent-primary-light)" />
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>Express Backend API</span>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: "var(--accent-primary-bg)",
                  color: "var(--accent-primary-light)",
                  border: "1px solid var(--border-accent)",
                }}
              >
                OPERATIONAL
              </span>
            </div>

            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              Server uptime: <strong>{health?.uptimeSeconds || 0} seconds</strong>. Listening for client requests.
            </div>

            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              API Base URL: <strong style={{ color: "var(--accent-secondary)" }}>http://localhost:3001/api</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Repair Status Workflow Diagram */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={18} color="var(--accent-secondary)" />
            Complaint Status Workflow Lifecycle
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Server-side validated transitions</span>
        </div>

        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 20 }}>
          FixFlow strictly prevents incomplete repair skips. For example, a ticket cannot be marked <strong>CLOSED</strong> before being <strong>RESOLVED</strong>.
        </p>

        {/* Visual Workflow Steps */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            padding: "18px 20px",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <span className="badge badge-status-OPEN" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              1. OPEN
            </span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>Submitted</div>
          </div>

          <div style={{ color: "var(--text-muted)" }}>➔</div>

          <div style={{ textAlign: "center" }}>
            <span className="badge badge-status-ASSIGNED" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              2. ASSIGNED
            </span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>Staff allocated</div>
          </div>

          <div style={{ color: "var(--text-muted)" }}>➔</div>

          <div style={{ textAlign: "center" }}>
            <span className="badge badge-status-IN_PROGRESS" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              3. IN_PROGRESS
            </span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>Diagnosing / tools</div>
          </div>

          <div style={{ color: "var(--text-muted)" }}>➔</div>

          <div style={{ textAlign: "center" }}>
            <span className="badge badge-status-RESOLVED" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              4. RESOLVED
            </span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>Hardware fixed</div>
          </div>

          <div style={{ color: "var(--text-muted)" }}>➔</div>

          <div style={{ textAlign: "center" }}>
            <span className="badge badge-status-CLOSED" style={{ fontSize: "0.8rem", padding: "6px 14px" }}>
              5. CLOSED
            </span>
            <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: 6 }}>Reporter verified</div>
          </div>
        </div>

        <div style={{ marginTop: 14, fontSize: "0.8rem", color: "var(--text-muted)" }}>
          <strong style={{ color: "#EC4899" }}>ON_HOLD</strong> state is available from IN_PROGRESS or ASSIGNED when waiting for spare parts from stores.
        </div>
      </div>

      {/* Role Permission Matrix */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <Shield size={18} color="var(--accent-primary-light)" />
            Role Permissions Matrix (Demo Evaluator Controls)
          </div>
          <span className="badge" style={{ backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#FBBF24" }}>
            DEMO ONLY
          </span>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Capability / Action</th>
                <th>Admin</th>
                <th>Technician</th>
                <th>Reporter (Student / Faculty)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Lodge New Fault Complaint</td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
              </tr>
              <tr>
                <td>View All Complaints & Filter</td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
              </tr>
              <tr>
                <td>Assign / Reassign Technicians</td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><span style={{ color: "var(--text-muted)" }}>—</span></td>
                <td><span style={{ color: "var(--text-muted)" }}>—</span></td>
              </tr>
              <tr>
                <td>Update Progress & Add Repair Notes</td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><span style={{ color: "var(--text-muted)" }}>—</span></td>
              </tr>
              <tr>
                <td>Manage Staff Roster & Delete Records</td>
                <td><CheckCircle2 size={16} color="var(--color-success)" /></td>
                <td><span style={{ color: "var(--text-muted)" }}>—</span></td>
                <td><span style={{ color: "var(--text-muted)" }}>—</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;
