// FixFlow - Equipment Overview Page
// Campus hardware asset inventory grouped by category with condition badges.

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import {
  Cpu,
  PlusCircle,
  Laptop,
  Projector,
  Printer,
  Monitor,
  Wifi,
  Package,
  MapPin,
  AlertTriangle,
  X,
  Edit2,
  Trash2,
} from "lucide-react";
import equipmentService from "../services/equipmentService.js";
import { queryKeys } from "../services/queryKeys.js";
import { useApp, ROLES } from "../context/AppContext.jsx";
import ConfirmDialog from "../components/feedback/ConfirmDialog.jsx";
import { SkeletonCard } from "../components/feedback/LoadingSkeleton.jsx";

const CATEGORIES = [
  { key: "ALL", label: "All Assets", icon: Cpu },
  { key: "LAPTOP", label: "Laptops", icon: Laptop },
  { key: "PROJECTOR", label: "Projectors", icon: Projector },
  { key: "PRINTER", label: "Printers", icon: Printer },
  { key: "COMPUTER", label: "Workstations", icon: Monitor },
  { key: "ROUTER", label: "Routers / Network", icon: Wifi },
  { key: "OTHER", label: "Other", icon: Package },
];

const CONDITIONS = [
  { value: "EXCELLENT", label: "Excellent Condition", color: "#10B981" },
  { value: "GOOD", label: "Good Working Order", color: "#3B82F6" },
  { value: "FAIR", label: "Fair / Aging", color: "#F59E0B" },
  { value: "POOR", label: "Poor / Degraded", color: "#EF4444" },
  { value: "UNDER_REPAIR", label: "Under Active Repair", color: "#8B5CF6" },
];

export function EquipmentPage() {
  const queryClient = useQueryClient();
  const { currentRole, addToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch equipment list
  const { data: equipmentList, isLoading, isError, error } = useQuery({
    queryKey: queryKeys.equipment.list(selectedCategory),
    queryFn: () => equipmentService.getEquipment(selectedCategory),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      category: "PROJECTOR",
      assetLabel: "",
      building: "Science Block",
      room: "Lab 3",
      condition: "GOOD",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data) => equipmentService.createEquipment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment.all });
      addToast({
        type: "success",
        title: "Asset Registered",
        message: "New equipment added to campus inventory.",
      });
      setShowAddModal(false);
      reset();
    },
    onError: (err) => {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to add equipment.",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => equipmentService.updateEquipment(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment.all });
      addToast({
        type: "success",
        title: "Asset Updated",
        message: "Equipment details updated.",
      });
      setEditingItem(null);
      reset();
    },
    onError: (err) => {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "Failed to update asset.",
      });
    },
  });

  const handleOpenAdd = () => {
    reset({
      name: "",
      category: "PROJECTOR",
      assetLabel: "",
      building: "Science Block",
      room: "Lab 3",
      condition: "GOOD",
    });
    setShowAddModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditingItem(item);
    reset({
      name: item.name,
      category: item.category,
      assetLabel: item.assetLabel,
      building: item.building,
      room: item.room,
      condition: item.condition,
    });
  };

  const onSubmit = async (formData) => {
    if (editingItem) {
      await updateMutation.mutateAsync({
        id: editingItem.id,
        data: formData,
      });
    } else {
      await createMutation.mutateAsync(formData);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await equipmentService.deleteEquipment(deletingItem.id);
      queryClient.invalidateQueries({ queryKey: queryKeys.equipment.all });
      addToast({
        type: "success",
        title: "Asset Deleted",
        message: `Equipment ${deletingItem.assetLabel} removed from database.`,
      });
      setDeletingItem(null);
    } catch (err) {
      addToast({
        type: "error",
        title: "Error",
        message: err.message || "Could not delete equipment.",
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
          <h2 style={{ fontSize: "1.35rem", marginBottom: 4 }}>Campus Equipment Inventory</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>
            Track hardware condition, classroom locations, and historical repair tickets.
          </p>
        </div>

        {isAdmin && (
          <button onClick={handleOpenAdd} className="btn btn-primary">
            <PlusCircle size={16} /> Add Equipment Asset
          </button>
        )}
      </div>

      {/* Category Tabs */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 4,
        }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => setSelectedCategory(cat.key)}
              className={`btn ${isSelected ? "btn-primary" : "btn-secondary"}`}
              style={{
                fontSize: "0.85rem",
                padding: "8px 16px",
                borderRadius: "var(--radius-full)",
              }}
            >
              <Icon size={15} />
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Equipment Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : isError ? (
        <div className="card" style={{ padding: 32, textAlign: "center", color: "#F87171" }}>
          {error?.message || "Failed to load equipment catalog."}
        </div>
      ) : !equipmentList || equipmentList.length === 0 ? (
        <div className="empty-state card">
          <div className="empty-state-icon">
            <Cpu size={24} />
          </div>
          <div className="empty-state-title">No equipment found in this category</div>
          <div className="empty-state-desc">
            No assets match this category filter. Register new campus hardware to track maintenance.
          </div>
          {isAdmin && (
            <button onClick={handleOpenAdd} className="btn btn-primary btn-sm">
              <PlusCircle size={15} /> Add Equipment
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3">
          {equipmentList.map((item) => {
            const conditionObj =
              CONDITIONS.find((c) => c.value === item.condition) || CONDITIONS[1];

            return (
              <div
                key={item.id}
                className="card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  {/* Top Bar: Category & Condition Badge */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 12,
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        padding: "2px 8px",
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "rgba(139, 92, 246, 0.15)",
                        color: "var(--accent-primary-light)",
                        fontWeight: 600,
                      }}
                    >
                      {item.category}
                    </span>

                    <span
                      style={{
                        fontSize: "0.72rem",
                        fontWeight: 600,
                        color: conditionObj.color,
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <span
                        style={{
                          width: 7,
                          height: 7,
                          borderRadius: "50%",
                          backgroundColor: conditionObj.color,
                        }}
                      />
                      {conditionObj.label}
                    </span>
                  </div>

                  {/* Asset Title & Serial Tag */}
                  <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 4 }}>
                    {item.name}
                  </h3>
                  <div
                    style={{
                      fontSize: "0.82rem",
                      fontFamily: "var(--font-mono)",
                      color: "var(--accent-secondary)",
                      marginBottom: 14,
                    }}
                  >
                    Tag: {item.assetLabel}
                  </div>

                  {/* Location & Linked Tickets */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.85rem",
                      color: "var(--text-secondary)",
                      marginBottom: 8,
                    }}
                  >
                    <MapPin size={14} color="var(--accent-primary-light)" />
                    <span>
                      {item.room}, {item.building}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <AlertTriangle size={13} />
                    <span>
                      {item._count?.complaints || item.complaints?.length || 0} repair
                      complaint(s) on record
                    </span>
                  </div>
                </div>

                {/* Admin Actions */}
                {isAdmin && (
                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: 12,
                      marginTop: 16,
                    }}
                  >
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="btn btn-secondary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <Edit2 size={13} /> Edit Asset
                    </button>
                    <button
                      onClick={() => setDeletingItem(item)}
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#F87171" }}
                      title="Delete equipment asset"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Equipment Modal */}
      {(showAddModal || editingItem) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: "1.1rem" }}>
                {editingItem ? "Edit Equipment Asset" : "Register Campus Equipment"}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingItem(null);
                }}
                className="btn btn-ghost"
                style={{ padding: 4 }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Equipment Name & Model <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.name ? "is-invalid" : ""}`}
                    placeholder="e.g. Epson PowerLite X49 or Dell OptiPlex 7090"
                    {...register("name", { required: "Equipment name is required." })}
                  />
                  {errors.name && <div className="form-error">{errors.name.message}</div>}
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">
                      Category <span className="required">*</span>
                    </label>
                    <select className="form-control" {...register("category")}>
                      <option value="LAPTOP" style={{ background: "#121826" }}>Laptop</option>
                      <option value="PROJECTOR" style={{ background: "#121826" }}>Projector</option>
                      <option value="PRINTER" style={{ background: "#121826" }}>Printer</option>
                      <option value="COMPUTER" style={{ background: "#121826" }}>Computer</option>
                      <option value="ROUTER" style={{ background: "#121826" }}>Router / Network</option>
                      <option value="OTHER" style={{ background: "#121826" }}>Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Asset Tag Label <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.assetLabel ? "is-invalid" : ""}`}
                      placeholder="e.g. EQ-PROJ-301"
                      {...register("assetLabel", { required: "Asset label is required." })}
                    />
                    {errors.assetLabel && <div className="form-error">{errors.assetLabel.message}</div>}
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="form-group">
                    <label className="form-label">
                      Building Location <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.building ? "is-invalid" : ""}`}
                      placeholder="e.g. Science Block"
                      {...register("building", { required: "Building is required." })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      Room / Lab <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control ${errors.room ? "is-invalid" : ""}`}
                      placeholder="e.g. Lab 3"
                      {...register("room", { required: "Room is required." })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Current Condition</label>
                  <select className="form-control" {...register("condition")}>
                    {CONDITIONS.map((c) => (
                      <option key={c.value} value={c.value} style={{ background: "#121826" }}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingItem(null);
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
                    : editingItem
                    ? "Save Changes"
                    : "Add Asset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deletingItem)}
        title="Delete Equipment Asset"
        message={`Are you sure you want to remove ${deletingItem?.name} [${deletingItem?.assetLabel}] from inventory?`}
        confirmLabel="Delete Asset"
        confirmVariant="danger"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingItem(null)}
      />
    </div>
  );
}

export default EquipmentPage;
