// FixFlow - Technician Management Page
// Renders technician roster, workload stats, add/edit modals, and deletion safety guards.

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Wrench,
  UserPlus,
  Mail,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  AlertCircle,
  Briefcase,
  X,
} from "lucide-react";
import technicianService from "../services/technicianService.js";
import { queryKeys } from "../services/queryKeys.js";
import { useApp, ROLES } from "../context/AppContext.jsx";
import ConfirmDialog from "../components/feedback/ConfirmDialog.jsx";
import { SkeletonCard } from "../components/feedback/LoadingSkeleton.jsx";

export function TechniciansPage() {
  const queryClient = useQueryClient();
  const { currentRole, addToast } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTechnician, setEditingTechnician] = useState(null);
  const [deletingTech, setDeletingTech] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch technicians
  const { data: technicians, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.technicians.list(),
    queryFn: () => technicianService.getTechnicians(),
  });

  // React Hook Form for Add / Edit
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      specialization: "",
      availability: true,
    },
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: (data) => technicianService.createTechnician(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      addToast({
        type: "success",
        title: "Technician Added",
        message: "New technician staff member registered successfully.",
      });
      setShowAddModal(false);
      reset();
    },
    onError: (err) => {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to add technician.",
      });
    },
  });

  // Update Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => technicianService.updateTechnician(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      addToast({
        type: "success",
        title: "Technician Updated",
        message: "Staff profile details updated.",
      });
      setEditingTechnician(null);
      reset();
    },
    onError: (err) => {
      addToast({
        type: "error",
        title: "Update Failed",
        message: err.message || "Failed to update technician.",
      });
    },
  });

  const handleOpenAdd = () => {
    reset({
      name: "",
      email: "",
      specialization: "",
      availability: true,
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (tech) => {
    setEditingTechnician(tech);
    reset({
      name: tech.name,
      email: tech.email,
      specialization: tech.specialization,
      availability: tech.availability,
    });
  };

  const onSubmit = async (formData) => {
    if (editingTechnician) {
      await updateMutation.mutateAsync({
        id: editingTechnician.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTech) return;
    setIsDeleting(true);
    try {
      await technicianService.deleteTechnician(deletingTech.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      addToast({
        type: "success",
        title: "Technician Removed",
        message: `${deletingTech.name} has been removed from the roster.`,
      });
      setDeletingTech(null);
    } catch (err) {
      addToast({
        type: "error",
        title: "Cannot Delete",
        message: err.message || "Technician has active repairs and cannot be deleted.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const isAdmin = currentRole === ROLES.ADMIN;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Page Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h2 style={{ fontSize: "1.35rem", marginBottom: 4 }}>Campus Maintenance Team</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Assign repair work orders and track individual workload distributions.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <UserPlus size={16} /> Add Technician
          </button>
        )}
      </div>

      {/* Technicians Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "#F87171" }}>
          {error?.message || "Failed to load technician roster."}
        </div>
      ) : !technicians || technicians.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Wrench size={24} />
          </div>
          <div className="empty-state-title">No technicians on record</div>
          <div className="empty-state-desc">
            Add support staff to start assigning hardware complaints.
          </div>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <UserPlus size={16} /> Add First Technician
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {technicians.map((tech) => (
            <div key={tech.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                {/* Card Top: Avatar, Name, Availability */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "var(--radius-md)",
                        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(6, 182, 212, 0.2) 100%)",
                        color: "var(--accent-primary-light)",
                        border: "1px solid var(--border-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                      }}
                    >
                      {tech.name.charAt(0)}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "1.05rem", fontWeight: 600 }}>{tech.name}</h3>
                      <div style={{ fontSize: "0.78rem", color: "var(--accent-secondary)", display: "flex", alignItems: "center", gap: 4 }}>
                        <Briefcase size={12} /> {tech.specialization}
                      </div>
                    </div>
                  </div>

                  <span
                    className="badge"
                    style={{
                      backgroundColor: tech.availability ? "var(--color-success-bg)" : "rgba(245, 158, 11, 0.15)",
                      color: tech.availability ? "var(--color-success)" : "#FBBF24",
                      border: `1px solid ${tech.availability ? "var(--color-success-border)" : "rgba(245, 158, 11, 0.3)"}`,
                      fontSize: "0.7rem",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        backgroundColor: tech.availability ? "var(--color-success)" : "#FBBF24",
                      }}
                    />
                    {tech.availability ? "Available" : "Busy / On-Site"}
                  </span>
                </div>

                {/* Contact Email */}
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: 16 }}>
                  <Mail size={13} />
                  <span>{tech.email}</span>
                </div>

                {/* Workload Metric Pills */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                    padding: "12px",
                    borderRadius: "var(--radius-md)",
                    backgroundColor: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid var(--border-subtle)",
                    marginBottom: 16,
                  }}
                >
                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Active Repairs
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#FBBF24" }}>
                      {tech.openRepairsCount || 0}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Completed
                    </div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#34D399" }}>
                      {tech.completedRepairsCount || 0}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Admins */}
              {isAdmin && (
                <div style={{ display: "flex", gap: 8, borderTop: "1px solid var(--border-subtle)", paddingTop: 12 }}>
                  <button
                    onClick={() => handleOpenEdit(tech)}
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                  >
                    <Edit2 size={13} /> Edit Profile
                  </button>
                  <button
                    onClick={() => setDeletingTech(tech)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: "#F87171" }}
                    title="Delete technician"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add or Edit Technician */}
      {(showAddModal || editingTechnician) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>
                {editingTechnician ? "Edit Technician Details" : "Register New Technician"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingTechnician(null);
                }}
                className="btn btn-ghost"
                style={{ padding: 4 }}
                aria-label="Close modal"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Vikram Malhotra"
                    {...register("name", { required: "Name is required." })}
                  />
                  {errors.name && <div className="form-error">{errors.name.message}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    College Email Address <span className="required">*</span>
                  </label>
                  <input
                    type="email"
                    className={`form-control ${errors.email ? "is-invalid" : ""}`}
                    placeholder="e.g. vikram.m@campus.fixflow.edu"
                    {...register("email", {
                      required: "Email is required.",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address format.",
                      },
                    })}
                  />
                  {errors.email && <div className="form-error">{errors.email.message}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Primary Specialization <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.specialization ? "is-invalid" : ""}`}
                    placeholder="e.g. Campus Networking & Routers or Projectors & A/V"
                    {...register("specialization", {
                      required: "Specialization is required.",
                    })}
                  />
                  {errors.specialization && (
                    <div className="form-error">{errors.specialization.message}</div>
                  )}
                </div>

                <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
                  <input
                    type="checkbox"
                    id="availabilityCheck"
                    style={{ width: 18, height: 18, accentColor: "var(--accent-primary)" }}
                    {...register("availability")}
                  />
                  <label htmlFor="availabilityCheck" style={{ cursor: "pointer", fontSize: "0.9rem" }}>
                    Currently Available for Work Order Assignments
                  </label>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingTechnician(null);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingTechnician
                    ? "Save Changes"
                    : "Add Technician"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog: Delete Technician */}
      <ConfirmDialog
        isOpen={Boolean(deletingTech)}
        title="Remove Technician"
        message={`Are you sure you want to remove ${deletingTech?.name} from the technician roster? You cannot remove staff who have active open repairs.`}
        confirmLabel="Remove Technician"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingTech(null)}
      />
    </div>
  );
}

export default TechniciansPage;
