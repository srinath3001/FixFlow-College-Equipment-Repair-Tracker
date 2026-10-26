// FixFlow - Complaint Controller
// Receives HTTP requests, calls complaint service, and sends structured responses.

import * as complaintService from "./complaint.service.js";

export async function listComplaints(req, res, next) {
  try {
    const { page, limit, search, status, priority, category, sort } = req.query;
    const result = await complaintService.listComplaints({
      page,
      limit,
      search,
      status,
      priority,
      category,
      sort,
    });

    return res.status(200).json({
      success: true,
      message: "Complaints retrieved successfully",
      data: result.complaints,
      pagination: result.pagination,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function listComplaintsCursor(req, res, next) {
  try {
    const { limit, cursor } = req.query;
    const result = await complaintService.listComplaintsCursor({ limit, cursor });

    return res.status(200).json({
      success: true,
      message: "Cursor complaints retrieved successfully",
      data: result.complaints,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function getComplaintById(req, res, next) {
  try {
    const { id } = req.params;
    const complaint = await complaintService.getComplaintById(id);

    return res.status(200).json({
      success: true,
      message: "Complaint retrieved successfully",
      data: complaint,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function createComplaint(req, res, next) {
  try {
    const complaint = await complaintService.createComplaint(req.body);

    return res.status(201).json({
      success: true,
      message: "Complaint registered successfully",
      data: complaint,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaint(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await complaintService.updateComplaint(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Complaint updated successfully",
      data: updated,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateComplaintStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, note, changedBy } = req.body;
    const updated = await complaintService.updateComplaintStatus(
      id,
      status,
      note,
      changedBy
    );

    return res.status(200).json({
      success: true,
      message: `Complaint status updated to ${status}`,
      data: updated,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function assignTechnician(req, res, next) {
  try {
    const { id } = req.params;
    const { technicianId, note, assignedBy } = req.body;
    const updated = await complaintService.assignTechnician(
      id,
      technicianId,
      note,
      assignedBy
    );

    return res.status(200).json({
      success: true,
      message: "Technician assigned successfully",
      data: updated,
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteComplaint(req, res, next) {
  try {
    const { id } = req.params;
    await complaintService.deleteComplaint(id);

    return res.status(200).json({
      success: true,
      message: "Complaint deleted successfully",
      requestId: req.id,
    });
  } catch (error) {
    next(error);
  }
}
