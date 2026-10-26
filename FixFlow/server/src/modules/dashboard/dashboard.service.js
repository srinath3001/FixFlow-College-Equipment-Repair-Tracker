// FixFlow - Dashboard Service
// Computes real-time statistics, aggregation charts, and activity feeds from PostgreSQL.

import prisma from "../../config/prisma.js";

/**
 * Get core summary statistics
 */
export async function getDashboardStats() {
  const [
    totalComplaints,
    openComplaints,
    assignedComplaints,
    inProgressComplaints,
    onHoldComplaints,
    resolvedComplaints,
    closedComplaints,
    highPriorityComplaints,
    criticalPriorityComplaints,
    totalTechnicians,
    availableTechnicians,
    totalEquipment,
  ] = await Promise.all([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: "OPEN" } }),
    prisma.complaint.count({ where: { status: "ASSIGNED" } }),
    prisma.complaint.count({ where: { status: "IN_PROGRESS" } }),
    prisma.complaint.count({ where: { status: "ON_HOLD" } }),
    prisma.complaint.count({ where: { status: "RESOLVED" } }),
    prisma.complaint.count({ where: { status: "CLOSED" } }),
    prisma.complaint.count({ where: { priority: "HIGH" } }),
    prisma.complaint.count({ where: { priority: "CRITICAL" } }),
    prisma.technician.count(),
    prisma.technician.count({ where: { availability: true } }),
    prisma.equipment.count(),
  ]);

  const pendingComplaints = openComplaints + assignedComplaints;
  const completedComplaints = resolvedComplaints + closedComplaints;
  const highAndCriticalComplaints = highPriorityComplaints + criticalPriorityComplaints;

  return {
    totalComplaints,
    pendingComplaints,
    inProgressComplaints,
    onHoldComplaints,
    completedComplaints,
    highPriorityComplaints: highAndCriticalComplaints,
    breakdown: {
      open: openComplaints,
      assigned: assignedComplaints,
      inProgress: inProgressComplaints,
      onHold: onHoldComplaints,
      resolved: resolvedComplaints,
      closed: closedComplaints,
    },
    technicians: {
      total: totalTechnicians,
      available: availableTechnicians,
    },
    equipment: {
      total: totalEquipment,
    },
  };
}

/**
 * Get grouped chart data for status and category distributions
 */
export async function getDashboardCharts() {
  // Status grouping for Donut Chart
  const statusGrouping = await prisma.complaint.groupBy({
    by: ["status"],
    _count: { _all: true },
  });

  const allStatuses = [
    { status: "OPEN", label: "Open", color: "#3B82F6" },
    { status: "ASSIGNED", label: "Assigned", color: "#8B5CF6" },
    { status: "IN_PROGRESS", label: "In Progress", color: "#F59E0B" },
    { status: "ON_HOLD", label: "On Hold", color: "#EC4899" },
    { status: "RESOLVED", label: "Resolved", color: "#10B981" },
    { status: "CLOSED", label: "Closed", color: "#6B7280" },
  ];

  const statusChartData = allStatuses.map((s) => {
    const found = statusGrouping.find((g) => g.status === s.status);
    return {
      status: s.status,
      name: s.label,
      value: found ? found._count._all : 0,
      color: s.color,
    };
  });

  // Category grouping for Bar Chart
  const categoryGrouping = await prisma.complaint.groupBy({
    by: ["equipmentCategory"],
    _count: { _all: true },
  });

  const allCategories = [
    { category: "LAPTOP", label: "Laptops" },
    { category: "PROJECTOR", label: "Projectors" },
    { category: "PRINTER", label: "Printers" },
    { category: "COMPUTER", label: "Computers" },
    { category: "ROUTER", label: "Routers" },
    { category: "OTHER", label: "Other" },
  ];

  const categoryChartData = allCategories.map((c) => {
    const found = categoryGrouping.find((g) => g.equipmentCategory === c.category);
    return {
      category: c.category,
      name: c.label,
      count: found ? found._count._all : 0,
    };
  });

  return {
    statusChart: statusChartData,
    categoryChart: categoryChartData,
  };
}

/**
 * Get recent complaints for the dashboard overview
 */
export async function getRecentComplaints(limit = 6) {
  const complaints = await prisma.complaint.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      technician: {
        select: { id: true, name: true, specialization: true },
      },
    },
  });

  return complaints;
}

/**
 * Get recent activity feed (audit history events)
 */
export async function getRecentActivity(limit = 10) {
  const activities = await prisma.statusHistory.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    include: {
      complaint: {
        select: {
          id: true,
          reference: true,
          title: true,
          equipmentCategory: true,
        },
      },
    },
  });

  return activities;
}
