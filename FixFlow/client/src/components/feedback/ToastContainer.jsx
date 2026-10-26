// FixFlow - Toast Notification Container
// Displays interactive, self-dismissing toast messages.

import React from "react";
import { useApp } from "../../context/AppContext.jsx";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((toast) => {
        let Icon = Info;
        let toastClass = "toast-info";

        if (toast.type === "success") {
          Icon = CheckCircle2;
          toastClass = "toast-success";
        } else if (toast.type === "error") {
          Icon = AlertCircle;
          toastClass = "toast-error";
        } else if (toast.type === "warning") {
          Icon = AlertTriangle;
          toastClass = "toast-warning";
        }

        return (
          <div key={toast.id} className={`toast ${toastClass}`} role="alert">
            <Icon
              size={20}
              style={{
                flexShrink: 0,
                marginTop: 2,
                color:
                  toast.type === "success"
                    ? "var(--color-success)"
                    : toast.type === "error"
                    ? "var(--color-critical)"
                    : toast.type === "warning"
                    ? "var(--color-warning)"
                    : "var(--accent-primary-light)",
              }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              {toast.title && (
                <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: 2 }}>
                  {toast.title}
                </div>
              )}
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                {toast.message}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="btn btn-ghost"
              style={{ padding: 4, margin: -4, alignSelf: "flex-start" }}
              aria-label="Dismiss notification"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default ToastContainer;
