// FixFlow - Status Badge Component
// Renders colored badge with pulsing dot micro-animation for active states.

import React from "react";

const STATUS_LABELS = {
  OPEN: "Open",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  ON_HOLD: "On Hold",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

export function StatusBadge({ status }) {
  const normalized = status ? status.toUpperCase() : "OPEN";
  const label = STATUS_LABELS[normalized] || normalized;

  // Dot color matching the status
  let dotColor = "#60A5FA";
  let isPulsing = false;

  if (normalized === "IN_PROGRESS") {
    dotColor = "#F59E0B";
    isPulsing = true;
  } else if (normalized === "ASSIGNED") {
    dotColor = "#A78BFA";
    isPulsing = true;
  } else if (normalized === "RESOLVED") {
    dotColor = "#10B981";
  } else if (normalized === "ON_HOLD") {
    dotColor = "#EC4899";
  } else if (normalized === "CLOSED") {
    dotColor = "#64748B";
  }

  return (
    <span className={`badge badge-status-${normalized}`}>
      <span
        className={`status-dot ${isPulsing ? "status-dot-pulse" : ""}`}
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </span>
  );
}

export default StatusBadge;
