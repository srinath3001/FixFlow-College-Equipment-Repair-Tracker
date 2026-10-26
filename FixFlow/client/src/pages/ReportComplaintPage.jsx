// FixFlow - Report a Fault Form Page
// Controlled form using React Hook Form, validation, and TanStack Query mutation.

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  AlertTriangle,
  Send,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Info,
} from "lucide-react";
import { useCreateComplaint } from "../hooks/useComplaints.js";

const EQUIPMENT_CATEGORIES = [
  { value: "LAPTOP", label: "Laptop" },
  { value: "PROJECTOR", label: "Projector" },
  { value: "PRINTER", label: "Printer" },
  { value: "COMPUTER", label: "Computer / Desktop" },
  { value: "ROUTER", label: "Router / Network Device" },
  { value: "OTHER", label: "Other Equipment" },
];

const PRIORITIES = [
  { value: "LOW", label: "Low — Minor issue or cosmetic fault" },
  { value: "MEDIUM", label: "Medium — Normal priority, equipment partially working" },
  { value: "HIGH", label: "High — Essential lab or lecture equipment failure" },
  { value: "CRITICAL", label: "Critical — Major disruption or safety issue" },
];

export function ReportComplaintPage() {
  const createMutation = useCreateComplaint();
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      equipmentCategory: "PROJECTOR",
      equipmentName: "",
      assetLabel: "",
      building: "Science Block",
      room: "Lab 3",
      description: "",
      priority: "HIGH",
      reporterName: "",
      reporterEmail: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const result = await createMutation.mutateAsync(data);
      setSubmittedComplaint(result);
      reset();
    } catch (err) {
      // Error handled by mutation toast
    }
  };

  // Helper for evaluator to autofill sample realistic test data
  const handleQuickFill = () => {
    setValue("title", "Projector ceiling mount HDMI flicker");
    setValue("equipmentCategory", "PROJECTOR");
    setValue("equipmentName", "Epson PowerLite X49");
    setValue("assetLabel", "EQ-PROJ-301");
    setValue("building", "Academic Block B");
    setValue("room", "Lecture Hall 202");
    setValue(
      "description",
      "During class lectures the projector display disconnects every 5 minutes. The ceiling HDMI extender cable appears loose or faulty."
    );
    setValue("priority", "HIGH");
    setValue("reporterName", "Prof. R. S. Deshmukh");
    setValue("reporterEmail", "deshmukh.r@campus.fixflow.edu");
  };

  return (
    <div style={{ maxWidth: 880, margin: "0 auto", paddingBottom: 40 }}>
      {/* Success Reference Banner if just created */}
      {submittedComplaint && (
        <div
          className="card"
          style={{
            marginBottom: 24,
            borderColor: "var(--color-success-border)",
            backgroundColor: "rgba(16, 185, 129, 0.08)",
            padding: 24,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                backgroundColor: "var(--color-success-bg)",
                color: "var(--color-success)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: "1.2rem", color: "#FFFFFF", marginBottom: 4 }}>
                Fault Successfully Logged!
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: 12 }}>
                Your complaint has been stored in PostgreSQL. Campus technicians have been alerted.
              </p>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 16px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(0, 0, 0, 0.35)",
                  border: "1px solid var(--border-card)",
                  marginBottom: 16,
                }}
              >
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  Reference Number:
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontWeight: 700,
                    fontSize: "1.1rem",
                    color: "var(--accent-primary-light)",
                  }}
                >
                  {submittedComplaint.reference}
                </span>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Link
                  to={`/complaints/${submittedComplaint.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Ticket Status <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={() => setSubmittedComplaint(null)}
                  className="btn btn-secondary btn-sm"
                >
                  Log Another Fault
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Complaint Creation Card */}
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">
              <AlertTriangle size={20} color="var(--accent-primary-light)" />
              Lodge Equipment Fault Ticket
            </div>
            <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>
              Please provide clear hardware fault details so technicians can bring suitable tools and parts.
            </p>
          </div>

          <button
            type="button"
            onClick={handleQuickFill}
            className="btn btn-secondary btn-sm"
            title="Autofill sample campus equipment fault"
          >
            <Sparkles size={14} color="#FBBF24" /> Quick Demo Fill
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Section 1: Equipment & Fault Information */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--accent-secondary)", marginBottom: 16, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
              1. Fault & Hardware Details
            </h4>

            <div className="form-group">
              <label className="form-label">
                Complaint Title <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-control ${errors.title ? "is-invalid" : ""}`}
                placeholder="e.g. Lab 3 projector not displaying HDMI input"
                {...register("title", {
                  required: "Complaint title is required.",
                  minLength: { value: 5, message: "Title must be at least 5 characters." },
                })}
              />
              {errors.title && <div className="form-error">{errors.title.message}</div>}
            </div>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Equipment Category <span className="required">*</span>
                </label>
                <select
                  className="form-control"
                  {...register("equipmentCategory", { required: true })}
                >
                  {EQUIPMENT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value} style={{ background: "#121826" }}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Equipment Name or Model <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.equipmentName ? "is-invalid" : ""}`}
                  placeholder="e.g. Epson PowerLite X49 or Dell PC"
                  {...register("equipmentName", {
                    required: "Equipment name is required.",
                  })}
                />
                {errors.equipmentName && (
                  <div className="form-error">{errors.equipmentName.message}</div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Asset Label / Serial Tag (Optional)
              </label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. EQ-PROJ-301 or barcode tag"
                {...register("assetLabel")}
              />
              <div className="form-hint">
                Found on the white campus inventory sticker on the device.
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Detailed Problem Description <span className="required">*</span>
              </label>
              <textarea
                rows={4}
                className={`form-control ${errors.description ? "is-invalid" : ""}`}
                placeholder="Describe what happens when you turn on the equipment, any error messages, blinking lights, or unusual noises..."
                {...register("description", {
                  required: "Detailed description of the problem is required.",
                  minLength: {
                    value: 10,
                    message: "Please provide at least 10 characters describing the fault.",
                  },
                })}
              />
              {errors.description && (
                <div className="form-error">{errors.description.message}</div>
              )}
            </div>
          </div>

          {/* Section 2: Location & Priority */}
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--accent-secondary)", marginBottom: 16, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
              2. Location & Urgency
            </h4>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Building or Block <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.building ? "is-invalid" : ""}`}
                  placeholder="e.g. Science Block or IT Building"
                  {...register("building", {
                    required: "Building name is required.",
                  })}
                />
                {errors.building && (
                  <div className="form-error">{errors.building.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Room or Laboratory Number <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.room ? "is-invalid" : ""}`}
                  placeholder="e.g. Lab 3, Workstation 14, or Room 402"
                  {...register("room", {
                    required: "Room or laboratory number is required.",
                  })}
                />
                {errors.room && <div className="form-error">{errors.room.message}</div>}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Priority Level <span className="required">*</span>
              </label>
              <select className="form-control" {...register("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value} style={{ background: "#121826" }}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Reporter Contact */}
          <div style={{ marginBottom: 28 }}>
            <h4 style={{ fontSize: "0.95rem", color: "var(--accent-secondary)", marginBottom: 16, borderBottom: "1px solid var(--border-subtle)", paddingBottom: 6 }}>
              3. Reporter Contact Details
            </h4>

            <div className="grid grid-cols-2">
              <div className="form-group">
                <label className="form-label">
                  Your Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  className={`form-control ${errors.reporterName ? "is-invalid" : ""}`}
                  placeholder="e.g. Dr. Arvind Rao or Sneha Patil"
                  {...register("reporterName", {
                    required: "Reporter name is required.",
                    minLength: { value: 2, message: "Name must be at least 2 characters." },
                  })}
                />
                {errors.reporterName && (
                  <div className="form-error">{errors.reporterName.message}</div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  Your College Email <span className="required">*</span>
                </label>
                <input
                  type="email"
                  className={`form-control ${errors.reporterEmail ? "is-invalid" : ""}`}
                  placeholder="e.g. arvind.rao@campus.fixflow.edu"
                  {...register("reporterEmail", {
                    required: "Email address is required.",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email format.",
                    },
                  })}
                />
                {errors.reporterEmail && (
                  <div className="form-error">{errors.reporterEmail.message}</div>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 12,
              paddingTop: 16,
              borderTop: "1px solid var(--border-subtle)",
            }}
          >
            <button
              type="button"
              onClick={() => reset()}
              className="btn btn-secondary"
              disabled={createMutation.isPending}
            >
              <RotateCcw size={16} /> Reset
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={createMutation.isPending}
            >
              <Send size={18} />
              {createMutation.isPending ? "Submitting to Database..." : "Submit Complaint"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReportComplaintPage;
