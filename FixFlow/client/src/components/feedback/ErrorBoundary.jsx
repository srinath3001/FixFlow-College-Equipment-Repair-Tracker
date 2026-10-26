// FixFlow - Reusable React Error Boundary
// Catches JavaScript errors in child components and displays an informative recovery screen.

import React, { Component } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/dashboard";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "70vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "560px",
              width: "100%",
              textAlign: "center",
              padding: "36px 28px",
              borderColor: "var(--color-critical-border)",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "50%",
                backgroundColor: "var(--color-critical-bg)",
                color: "#F87171",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "20px",
              }}
            >
              <AlertOctagon size={32} />
            </div>

            <h2 style={{ fontSize: "1.4rem", marginBottom: "8px" }}>
              Something Went Wrong
            </h2>

            <p style={{ color: "var(--text-secondary)", marginBottom: "20px" }}>
              An unexpected error occurred in this view. You can reload the page or navigate back to the dashboard.
            </p>

            {this.state.error && (
              <div
                style={{
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid var(--border-card)",
                  borderRadius: "var(--radius-md)",
                  padding: "12px",
                  fontSize: "0.8rem",
                  fontFamily: "var(--font-mono)",
                  color: "#FCA5A5",
                  textAlign: "left",
                  marginBottom: "24px",
                  maxHeight: "120px",
                  overflowY: "auto",
                }}
              >
                {this.state.error.toString()}
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button onClick={this.handleReset} className="btn btn-primary">
                <RotateCcw size={16} /> Reload Component
              </button>
              <button onClick={this.handleGoHome} className="btn btn-secondary">
                <Home size={16} /> Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
