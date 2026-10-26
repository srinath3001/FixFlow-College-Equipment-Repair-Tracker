// FixFlow - Operations Dashboard Page
// Real-time statistics, Recharts donut & bar charts, recent complaints, and activity feeds.

import React from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  AlertCircle,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Activity,
  Layers,
  FileText,
} from "lucide-react";
import dashboardService from "../services/dashboardService.js";
import { queryKeys } from "../services/queryKeys.js";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import PriorityBadge from "../components/ui/PriorityBadge.jsx";
import { SkeletonCard, SkeletonTable } from "../components/feedback/LoadingSkeleton.jsx";

export function DashboardPage() {
  // Query 1: Overall statistics (polled every 15s for live updates)
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 15000,
  });

  // Query 2: Visual chart distributions
  const { data: chartsData, isLoading: chartsLoading } = useQuery({
    queryKey: queryKeys.dashboard.charts,
    queryFn: () => dashboardService.getCharts(),
    refetchInterval: 15000,
  });

  // Query 3: Recent complaints
  const { data: recentComplaints, isLoading: recentLoading } = useQuery({
    queryKey: queryKeys.dashboard.recent,
    queryFn: () => dashboardService.getRecentComplaints(6),
    refetchInterval: 15000,
  });

  // Query 4: Recent audit activity feed
  const { data: recentActivity, isLoading: activityLoading } = useQuery({
    queryKey: queryKeys.dashboard.activity,
    queryFn: () => dashboardService.getRecentActivity(8),
    refetchInterval: 15000,
  });

  const stats = statsData || {
    totalComplaints: 0,
    pendingComplaints: 0,
    inProgressComplaints: 0,
    completedComplaints: 0,
    highPriorityComplaints: 0,
  };

  const statusChartData = chartsData?.statusChart || [];
  const categoryChartData = chartsData?.categoryChart || [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Welcome Banner with Quick Action */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)",
          borderColor: "rgba(139, 92, 246, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          padding: "24px 28px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "1.45rem", marginBottom: 4 }}>
            FixFlow Campus Repair Operations
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            Real-time monitoring of campus classrooms, laboratories, computer centers, and networking infrastructure.
          </p>
        </div>

        <Link to="/complaints/new" className="btn btn-primary btn-lg">
          <PlusCircle size={18} />
          Report Fault Now
        </Link>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-5">
        {statsLoading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            {/* Total Complaints */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Total Faults
                </span>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(139, 92, 246, 0.15)", color: "var(--accent-primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Layers size={18} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)" }}>
                {stats.totalComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Logged in system
              </div>
            </div>

            {/* Pending Complaints */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Pending
                </span>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(59, 130, 246, 0.15)", color: "#60A5FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Clock size={18} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#60A5FA" }}>
                {stats.pendingComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Open / unassigned
              </div>
            </div>

            {/* In Progress */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  In Progress
                </span>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(245, 158, 11, 0.15)", color: "#FBBF24", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Wrench size={18} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#FBBF24" }}>
                {stats.inProgressComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Active technician repairs
              </div>
            </div>

            {/* Completed */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  Resolved / Closed
                </span>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(16, 185, 129, 0.15)", color: "#34D399", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#34D399" }}>
                {stats.completedComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Repairs completed
              </div>
            </div>

            {/* High & Critical Priority */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                  High / Critical
                </span>
                <div style={{ width: 32, height: 32, borderRadius: "var(--radius-sm)", background: "rgba(239, 68, 68, 0.15)", color: "#F87171", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AlertCircle size={18} />
                </div>
              </div>
              <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--font-heading)", color: "#F87171" }}>
                {stats.highPriorityComplaints}
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: 4 }}>
                Urgent attention needed
              </div>
            </div>
          </>
        )}
      </div>

      {/* Visual Analytics Charts: Donut & Bar Charts */}
      <div className="grid grid-cols-2">
        {/* Chart 1: Donut Chart - Complaints by Status */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Activity size={18} color="var(--accent-primary-light)" />
              Complaints by Status
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Workflow breakdown</span>
          </div>

          <div style={{ height: 260, width: "100%" }}>
            {chartsLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Loading chart...
              </div>
            ) : statusChartData.every((d) => d.value === 0) ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                No complaint records yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121826",
                      borderColor: "#242D3D",
                      borderRadius: 8,
                      color: "#FFFFFF",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center", marginTop: 8 }}>
            {statusChartData.map((item) => (
              <div key={item.status} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.78rem" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: item.color }} />
                <span style={{ color: "var(--text-secondary)" }}>{item.name}:</span>
                <span style={{ fontWeight: 600 }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Complaints by Equipment Category */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <TrendingUp size={18} color="var(--accent-secondary)" />
              Complaints by Equipment Category
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Failure frequencies</span>
          </div>

          <div style={{ height: 260, width: "100%" }}>
            {chartsLoading ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-muted)" }}>
                Loading chart...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#121826",
                      borderColor: "#242D3D",
                      borderRadius: 8,
                      color: "#FFFFFF",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Lower Row: Recent Complaints Table & Real-Time Activity Feed */}
      <div className="grid grid-cols-3">
        {/* Recent Complaints Table (2 Columns) */}
        <div className="card" style={{ gridColumn: "span 2" }}>
          <div className="card-header">
            <div className="card-title">
              <FileText size={18} color="var(--accent-primary-light)" />
              Recent Fault Complaints
            </div>
            <Link to="/complaints" className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {recentLoading ? (
            <SkeletonTable rows={4} cols={5} />
          ) : !recentComplaints || recentComplaints.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FileText size={24} />
              </div>
              <div className="empty-state-title">No complaints reported yet</div>
              <div className="empty-state-desc">
                When equipment faults are reported across campus, they will appear here in real-time.
              </div>
              <Link to="/complaints/new" className="btn btn-primary btn-sm">
                <PlusCircle size={16} /> Report Fault
              </Link>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ref #</th>
                    <th>Equipment / Title</th>
                    <th>Location</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician</th>
                  </tr>
                </thead>
                <tbody>
                  {recentComplaints.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Link
                          to={`/complaints/${c.id}`}
                          style={{
                            fontWeight: 600,
                            fontFamily: "var(--font-mono)",
                            color: "var(--accent-primary-light)",
                          }}
                        >
                          {c.reference}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: "var(--text-main)" }}>
                          {c.title}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {c.equipmentName} ({c.equipmentCategory})
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem" }}>{c.room}</div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {c.building}
                        </div>
                      </td>
                      <td>
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td>
                        <StatusBadge status={c.status} />
                      </td>
                      <td>
                        {c.technician ? (
                          <span style={{ fontSize: "0.85rem", color: "var(--text-main)" }}>
                            {c.technician.name}
                          </span>
                        ) : (
                          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                            Unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Live Activity Feed (1 Column) */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">
              <Clock size={18} color="var(--accent-secondary)" />
              Recent Activity Feed
            </div>
          </div>

          {activityLoading ? (
            <div style={{ padding: 12, color: "var(--text-muted)" }}>Loading feed...</div>
          ) : !recentActivity || recentActivity.length === 0 ? (
            <div style={{ padding: 20, textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem" }}>
              No audit activities recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {recentActivity.map((act) => (
                <div
                  key={act.id}
                  style={{
                    padding: "10px 12px",
                    backgroundColor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "var(--radius-md)",
                    borderLeft: "3px solid var(--accent-primary)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <Link
                      to={`/complaints/${act.complaint?.id}`}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.75rem",
                        color: "var(--accent-primary-light)",
                        fontWeight: 600,
                      }}
                    >
                      {act.complaint?.reference || "Complaint"}
                    </Link>
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>
                      {new Date(act.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.82rem", color: "var(--text-main)", marginBottom: 2 }}>
                    {act.note || `Transitioned to ${act.newStatus}`}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.72rem", color: "var(--text-muted)" }}>
                    <span>By: {act.changedBy || "System"}</span>
                    <span>•</span>
                    <span style={{ color: "var(--accent-secondary)" }}>{act.newStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
