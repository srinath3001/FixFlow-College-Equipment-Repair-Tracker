// FixFlow - Reusable Confirmation Dialog
// Modal prompt before executing irreversible or destructive operations.

import React from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message = "Are you sure you want to proceed with this operation?",
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content" style={{ maxWidth: "440px" }}>
        <div className="modal-header">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor:
                  confirmVariant === "danger"
                    ? "var(--color-critical-bg)"
                    : "var(--accent-primary-bg)",
                color:
                  confirmVariant === "danger"
                    ? "#F87171"
                    : "var(--accent-primary-light)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AlertTriangle size={18} />
            </div>
            <h3 style={{ fontSize: "1.1rem" }}>{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="btn btn-ghost"
            style={{ padding: 4 }}
            disabled={isLoading}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            {message}
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`btn ${confirmVariant === "danger" ? "btn-danger" : "btn-primary"}`}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
