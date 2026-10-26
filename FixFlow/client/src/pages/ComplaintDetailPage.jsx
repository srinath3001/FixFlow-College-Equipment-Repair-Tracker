// FixFlow - Complaint Details & Audit Trail Page
// Displays complete ticket details, technician assignment, status transition controls, and timeline history.

import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  Laptop,
  Wrench,
  CheckCircle2,
  AlertCircle,
  FileText,
  Trash2,
  UserPlus,
  RefreshCw,
  History,
} from "lucide-react";
import { useComplaint, useUpdateComplaintStatus, useAssignTechnician } from "../hooks/useComplaints.js";
import { useApp, ROLES } from "../context/AppContext.jsx";
import technicianService from "../services/technicianService.js";
import complaintService from "../services/complaintService.js";
import { queryKeys } from "../services/queryKeys.js";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import PriorityBadge from "../components/ui/PriorityBadge.jsx";
import ConfirmDialog from "../components/feedback/ConfirmDialog.jsx";
import { SkeletonDetail } from "../components/feedback/LoadingSkeleton.jsx";

// Permitted workflow state transitions map
const ALLOWED_STATUS_TRANSITIONS = {
  OPEN: ["ASSIGNED", "IN_PROGRESS", "ON_HOLD"],
  ASSIGNED: ["IN_PROGRESS", "ON_HOLD", "OPEN"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"],
  CLOSED: ["OPEN"], // Can only be reopened
};

export function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentRole, addToast } = useApp();

  // Queries
  const { data: complaint, isLoading, isError, error, refetch } = useComplaint(id);

  const { data: technicians } = useQuery({
    queryKey: queryKeys.technicians.list(),
    queryFn: () => technicianService.getTechnicians(),
  });

  // Mutations
  const updateStatusMutation = useUpdateComplaintStatus();
  const assignTechnicianMutation = useAssignTechnician();

  // UI State for Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTechId, setSelectedTechId] = useState("");
  const [assignNote, setAssignNote] = useState("");

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [targetStatus, setTargetStatus] = useState("");
  const [statusNote, setStatusNote] = useState("");

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) return <SkeletonDetail />;

  if (isError || !complaint) {
    return (
      <div className="card" style={{ padding: 40, textAlign: "center", maxWidth: 600, margin: "40px auto" }}>
        <AlertCircle size={40} color="#EF4444" style={{ marginBottom: 16 }} />
        <h2 style={{ marginBottom: 8 }}>Complaint Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
          {error?.message || "The requested repair ticket does not exist or has been removed."}
        </p>
        <Link to="/complaints" className="btn btn-primary">
          <ArrowLeft size={16} /> Back to All Complaints
        </Link>
      </div>
    );
  }

  // Calculate available next transitions
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[complaint.status] || [];

  // Handle Technician Assignment
  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTechId) return;

    await assignTechnicianMutation.mutateAsync({
      id: complaint.id,
      technicianId: selectedTechId,
      note: assignNote || null,
      assignedBy: `${currentRole} User`,
    });

    setShowAssignModal(false);
    setSelectedTechId("");
    setAssignNote("");
  };

  // Handle Status Update (with Optimistic UI)
  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!targetStatus) return;

    await updateStatusMutation.mutateAsync({
      id: complaint.id,
      status: targetStatus,
      note: statusNote || null,
      changedBy: `${currentRole} User`,
    });

    setShowStatusModal(false);
    setTargetStatus("");
    setStatusNote("");
  };

  // Handle Complaint Deletion
  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      await complaintService.deleteComplaint(complaint.id);
      addToast({
        type: "success",
        title: "Complaint Deleted",
        message: `Ticket #${complaint.reference} has been removed.`,
      });
      navigate("/complaints");
    } catch (err) {
      addToast({
        type: "error",
        title: "Deletion Failed",
        message: err.message || "Could not delete complaint.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Check role permissions
  const canAssign = currentRole === ROLES.ADMIN;
  const canUpdateStatus = currentRole === ROLES.ADMIN || currentRole === ROLES.TECHNICIAN;
  const canDelete = currentRole === ROLES.ADMIN;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1100, margin: "0 auto" }}>
      {/* Top Breadcrumb & Actions Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <Link to="/complaints" className="btn btn-secondary btn-sm" style={{ gap: 6 }}>
          <ArrowLeft size={15} /> All Complaints
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {canAssign && (
            <button
              onClick={() => {
                setSelectedTechId(complaint.technicianId || "");
                setShowAssignModal(true);
              }}
              className="btn btn-secondary btn-sm"
            >
              <UserPlus size={15} />
              {complaint.technician ? "Reassign Technician" : "Assign Technician"}
            </button>
          )}

          {canDelete && (
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="btn btn-danger btn-sm"
              title="Delete complaint ticket"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}

          <button onClick={() => refetch()} className="btn btn-ghost btn-sm" title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Ticket Banner Header */}
      <div
        className="card"
        style={{
          background: "linear-gradient(135deg, rgba(18, 24, 38, 0.95) 0%, rgba(26, 34, 53, 0.95) 100%)",
          borderColor: "var(--border-card-hover)",
          padding: 28,
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontWeight: 700,
                  fontSize: "1.2rem",
                  color: "var(--accent-primary-light)",
                  letterSpacing: "0.02em",
                }}
              >
                {complaint.reference}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h2 style={{ fontSize: "1.45rem", marginBottom: 6 }}>{complaint.title}</h2>

            <div style={{ display: "flex", alignItems: "center", gap: 16, color: "var(--text-muted)", fontSize: "0.82rem", flexWrap: "wrap" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Calendar size={14} /> Reported:{" "}
                {new Date(complaint.createdAt).toLocaleString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span>•</span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Clock size={14} /> Updated:{" "}
                {new Date(complaint.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>

          {/* Quick Workflow Action Buttons (Role Based) */}
          {canUpdateStatus && allowedNextStatuses.length > 0 && (
            <div
              style={{
                backgroundColor: "rgba(0, 0, 0, 0.3)",
                padding: "12px 16px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--border-card)",
              }}
            >
              <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 8, fontWeight: 600 }}>
                Workflow Action ({currentRole})
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {allowedNextStatuses.map((st) => (
                  <button
                    key={st}
                    onClick={() => {
                      setTargetStatus(st);
                      setShowStatusModal(true);
                    }}
                    className={`btn btn-sm ${
                      st === "RESOLVED"
                        ? "btn-cyan"
                        : st === "IN_PROGRESS"
                        ? "btn-primary"
                        : "btn-secondary"
                    }`}
                  >
                    Move to {st}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Grid: Details (Left 2 cols) & Sidebar Metadata (Right 1 col) */}
      <div className="grid grid-cols-3">
        {/* Left Column (2 Cols): Problem Description & Timeline */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Fault Description */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <FileText size={18} color="var(--accent-primary-light)" />
                Fault Description
              </div>
            </div>
            <p style={{ color: "var(--text-main)", fontSize: "0.95rem", lineHeight: 1.6, whiteSpace: "pre-line" }}>
              {complaint.description}
            </p>

            {complaint.repairNotes && (
              <div
                style={{
                  marginTop: 20,
                  padding: "14px 18px",
                  borderRadius: "var(--radius-md)",
                  backgroundColor: "rgba(139, 92, 246, 0.08)",
                  borderLeft: "4px solid var(--accent-primary)",
                }}
              >
                <div style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--accent-primary-light)", marginBottom: 4 }}>
                  Latest Technician Repair Notes:
                </div>
                <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
                  {complaint.repairNotes}
                </div>
              </div>
            )}
          </div>

          {/* Status History & Audit Trail */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <History size={18} color="var(--accent-secondary)" />
                Workflow Audit History
              </div>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                {complaint.history?.length || 0} event(s)
              </span>
            </div>

            <div style={{ position: "relative", paddingLeft: 24, paddingTop: 8 }}>
              {/* Vertical line connecting events */}
              <div
                style={{
                  position: "absolute",
                  left: 7,
                  top: 14,
                  bottom: 14,
                  width: 2,
                  backgroundColor: "var(--border-card)",
                }}
              />

              {complaint.history && complaint.history.length > 0 ? (
                complaint.history.map((ev, index) => (
                  <div key={ev.id} style={{ position: "relative", marginBottom: 24 }}>
                    {/* Event Circle Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -24,
                        top: 2,
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        backgroundColor: index === 0 ? "var(--accent-primary)" : "var(--bg-elevated)",
                        border: `2px solid ${index === 0 ? "var(--accent-primary-light)" : "var(--border-card-hover)"}`,
                        boxShadow: index === 0 ? "0 0 10px var(--accent-primary-glow)" : "none",
                      }}
                    />

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StatusBadge status={ev.newStatus} />
                        {ev.oldStatus && (
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                            (from {ev.oldStatus})
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                        {new Date(ev.createdAt).toLocaleString([], {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <div style={{ fontSize: "0.88rem", color: "var(--text-main)", marginTop: 4 }}>
                      {ev.note || "Status change recorded"}
                    </div>

                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>
                      Updated by: <strong style={{ color: "var(--text-secondary)" }}>{ev.changedBy || "System"}</strong>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                  No history records available.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Equipment, Location, Technician & Reporter */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Equipment & Location Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Laptop size={18} color="var(--accent-secondary)" />
                Equipment & Location
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Equipment Model
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  {complaint.equipmentName}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Category
                  </div>
                  <div style={{ fontSize: "0.88rem", color: "var(--accent-secondary)" }}>
                    {complaint.equipmentCategory}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                    Asset Label
                  </div>
                  <div style={{ fontSize: "0.85rem", fontFamily: "var(--font-mono)" }}>
                    {complaint.assetLabel || "N/A"}
                  </div>
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
                  Campus Location
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.9rem" }}>
                  <MapPin size={16} color="var(--accent-primary-light)" />
                  <strong>{complaint.room}</strong>, {complaint.building}
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Technician Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <Wrench size={18} color="#FBBF24" />
                Assigned Technician
              </div>
            </div>

            {complaint.technician ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(245, 158, 11, 0.15)",
                    color: "#FBBF24",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                  }}
                >
                  {complaint.technician.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                    {complaint.technician.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                    {complaint.technician.specialization}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--accent-primary-light)", marginTop: 2 }}>
                    {complaint.technician.email}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "12px 0" }}>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: 10 }}>
                  No technician assigned yet.
                </div>
                {canAssign && (
                  <button
                    onClick={() => setShowAssignModal(true)}
                    className="btn btn-secondary btn-sm"
                  >
                    <UserPlus size={14} /> Assign Now
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Reporter Information Card */}
          <div className="card">
            <div className="card-header">
              <div className="card-title">
                <User size={18} color="var(--accent-primary-light)" />
                Reporter Details
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                  Reported By
                </div>
                <div style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  {complaint.reporterName}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.85rem", color: "var(--accent-primary-light)" }}>
                <Mail size={14} />
                <a href={`mailto:${complaint.reporterEmail}`}>{complaint.reporterEmail}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Assign Technician Modal */}
      {showAssignModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <UserPlus size={18} color="var(--accent-primary-light)" />
                Assign Work Order to Technician
              </h3>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Select Technician <span className="required">*</span>
                  </label>
                  <select
                    className="form-control"
                    value={selectedTechId}
                    onChange={(e) => setSelectedTechId(e.target.value)}
                    required
                  >
                    <option value="" style={{ background: "#121826" }}>
                      -- Choose available staff member --
                    </option>
                    {technicians?.map((tech) => (
                      <option key={tech.id} value={tech.id} style={{ background: "#121826" }}>
                        {tech.name} — {tech.specialization} ({tech.availability ? "Available" : "Busy"} | {tech.openRepairsCount || 0} active)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Assignment Instructions / Notes (Optional)</label>
                  <textarea
                    rows={3}
                    className="form-control"
                    placeholder="e.g. Please bring extra HDMI extension cable and Phillips screwdriver to Lab 3."
                    value={assignNote}
                    onChange={(e) => setAssignNote(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!selectedTechId || assignTechnicianMutation.isPending}
                >
                  {assignTechnicianMutation.isPending ? "Assigning..." : "Confirm Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Update Status Modal */}
      {showStatusModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: 8 }}>
                <CheckCircle2 size={18} color="var(--accent-primary-light)" />
                Advance Repair Status: {targetStatus}
              </h3>
            </div>

            <form onSubmit={handleStatusSubmit}>
              <div className="modal-body">
                <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", marginBottom: 16 }}>
                  You are changing the ticket from <strong>{complaint.status}</strong> to{" "}
                  <strong style={{ color: "var(--accent-primary-light)" }}>{targetStatus}</strong>.
                </p>

                <div className="form-group">
                  <label className="form-label">Repair Progress Notes / Justification</label>
                  <textarea
                    rows={4}
                    className="form-control"
                    placeholder="Describe what work was done, parts replaced, diagnostic findings, or reason for hold..."
                    value={statusNote}
                    onChange={(e) => setStatusNote(e.target.value)}
                    required={targetStatus === "ON_HOLD" || targetStatus === "RESOLVED"}
                  />
                  <div className="form-hint">
                    Required when putting ticket on hold or marking resolved.
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? "Saving..." : "Update Status"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete Complaint */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Repair Ticket"
        message={`Are you sure you want to permanently delete complaint #${complaint.reference}? This action cannot be undone.`}
        confirmLabel="Delete Ticket"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  );
}

export default ComplaintDetailPage;
