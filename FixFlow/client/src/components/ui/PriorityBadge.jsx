// FixFlow - Priority Badge Component
// Visual badge for complaint priority levels with critical pulsing animation.

import React from "react";
import { AlertCircle, AlertTriangle, ArrowUp, ArrowDown } from "lucide-react";

export function PriorityBadge({ priority }) {
  const normalized = priority ? priority.toUpperCase() : "MEDIUM";

  let Icon = ArrowDown;
  if (normalized === "CRITICAL") Icon = AlertCircle;
  else if (normalized === "HIGH") Icon = ArrowUp;
  else if (normalized === "MEDIUM") Icon = AlertTriangle;

  return (
    <span className={`badge badge-priority-${normalized}`}>
      <Icon size={12} />
      {normalized}
    </span>
  );
}

export default PriorityBadge;
