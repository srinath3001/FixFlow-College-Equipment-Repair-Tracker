// FixFlow - Complaint Custom Hooks
// Wraps TanStack Query for list fetching, single detail, mutations, and optimistic updates.

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../services/queryKeys.js";
import complaintService from "../services/complaintService.js";
import { useApp } from "../context/AppContext.jsx";

/**
 * Hook to fetch paginated & filtered complaints
 * Includes periodic polling (refetchInterval: 15s) for real-time freshness
 */
export function useComplaints(filters = {}, options = {}) {
  return useQuery({
    queryKey: queryKeys.complaints.list(filters),
    queryFn: () => complaintService.getComplaints(filters),
    refetchInterval: options.polling ? 15000 : false, // 15 second polling freshness
    placeholderData: (previousData) => previousData, // Smooth pagination transition without flash
  });
}

/**
 * Hook to fetch single complaint details
 */
export function useComplaint(id) {
  return useQuery({
    queryKey: queryKeys.complaints.detail(id),
    queryFn: () => complaintService.getComplaintById(id),
    enabled: Boolean(id),
  });
}

/**
 * Hook to create a new complaint
 */
export function useCreateComplaint() {
  const queryClient = useQueryClient();
  const { addToast } = useApp();

  return useMutation({
    mutationFn: (payload) => complaintService.createComplaint(payload),
    onSuccess: (newComplaint) => {
      // Invalidate relevant queries so all views refresh
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.charts });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recent });

      addToast({
        type: "success",
        title: "Complaint Lodged",
        message: `Registered as #${newComplaint.reference}. A technician will be assigned shortly.`,
      });
    },
    onError: (error) => {
      addToast({
        type: "error",
        title: "Submission Failed",
        message: error.message || "Failed to create complaint.",
      });
    },
  });
}

/**
 * Hook to update complaint status with OPTIMISTIC UPDATE and automatic rollback on failure
 */
export function useUpdateComplaintStatus() {
  const queryClient = useQueryClient();
  const { addToast } = useApp();

  return useMutation({
    mutationFn: ({ id, status, note, changedBy }) =>
      complaintService.updateStatus(id, { status, note, changedBy }),

    // OPTIMISTIC UPDATE:
    // Update local React Query cache immediately before server responds
    onMutate: async ({ id, status, note }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.complaints.detail(id) });

      // Snapshot previous value for rollback
      const previousComplaint = queryClient.getQueryData(queryKeys.complaints.detail(id));

      if (previousComplaint) {
        queryClient.setQueryData(queryKeys.complaints.detail(id), (old) => ({
          ...old,
          status,
          repairNotes: note || old.repairNotes,
        }));
      }

      return { previousComplaint, id };
    },

    // If server request fails, rollback to previous state
    onError: (err, variables, context) => {
      if (context?.previousComplaint) {
        queryClient.setQueryData(
          queryKeys.complaints.detail(context.id),
          context.previousComplaint
        );
      }
      addToast({
        type: "error",
        title: "Status Update Failed",
        message: err.message || "Could not change status.",
      });
    },

    // Always refetch on settlement to ensure client is in sync with database
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.charts });
    },

    onSuccess: (data, variables) => {
      addToast({
        type: "success",
        title: "Status Updated",
        message: `Complaint marked as ${variables.status}.`,
      });
    },
  });
}

/**
 * Hook to assign technician
 */
export function useAssignTechnician() {
  const queryClient = useQueryClient();
  const { addToast } = useApp();

  return useMutation({
    mutationFn: ({ id, technicianId, note, assignedBy }) =>
      complaintService.assignTechnician(id, { technicianId, note, assignedBy }),

    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.complaints.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.technicians.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });

      addToast({
        type: "success",
        title: "Technician Assigned",
        message: "Work order assigned successfully.",
      });
    },

    onError: (error) => {
      addToast({
        type: "error",
        title: "Assignment Failed",
        message: error.message || "Failed to assign technician.",
      });
    },
  });
}
