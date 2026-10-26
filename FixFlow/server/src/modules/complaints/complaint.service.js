// FixFlow - Complaint Service
// Contains business logic, workflow state transitions, and Prisma transactions.

import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

// Valid workflow transitions map
// OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED (with ON_HOLD flexibility)
const ALLOWED_STATUS_TRANSITIONS = {
  OPEN: ["ASSIGNED", "IN_PROGRESS", "ON_HOLD"],
  ASSIGNED: ["IN_PROGRESS", "ON_HOLD", "OPEN"],
  IN_PROGRESS: ["ON_HOLD", "RESOLVED"],
  ON_HOLD: ["IN_PROGRESS", "RESOLVED", "ASSIGNED"],
  RESOLVED: ["CLOSED", "IN_PROGRESS"], // In case issue resurfaces during student test
  CLOSED: ["OPEN"], // Can only be reopened by Admin
};

/**
 * Generate human-readable reference number: FIX-YYYY-XXXX
 */
async function generateReference() {
  const currentYear = new Date().getFullYear();
  const count = await prisma.complaint.count();
  const sequence = String(count + 1).padStart(4, "0");
  const reference = `FIX-${currentYear}-${sequence}`;

  // Verify uniqueness (in case of previous deletions)
  const existing = await prisma.complaint.findUnique({ where: { reference } });
  if (existing) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `FIX-${currentYear}-${sequence}${randomSuffix}`;
  }

  return reference;
}

/**
 * List complaints with search, filters, sorting, and pagination
 */
export async function listComplaints({
  page = 1,
  limit = 10,
  search = "",
  status,
  priority,
  category,
  sort = "newest",
}) {
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const skip = (pageNum - 1) * limitNum;

  // Build filter object
  const where = {};

  if (status && status !== "ALL") {
    where.status = status;
  }

  if (priority && priority !== "ALL") {
    where.priority = priority;
  }

  if (category && category !== "ALL") {
    where.equipmentCategory = category;
  }

  if (search && search.trim() !== "") {
    const trimmed = search.trim();
    where.OR = [
      { reference: { contains: trimmed, mode: "insensitive" } },
      { title: { contains: trimmed, mode: "insensitive" } },
      { description: { contains: trimmed, mode: "insensitive" } },
      { equipmentName: { contains: trimmed, mode: "insensitive" } },
      { reporterName: { contains: trimmed, mode: "insensitive" } },
      { room: { contains: trimmed, mode: "insensitive" } },
      { building: { contains: trimmed, mode: "insensitive" } },
    ];
  }

  // Determine sort order
  const orderBy =
    sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" };

  // Run count and query in parallel for speed
  const [totalRecords, complaints] = await Promise.all([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip,
      take: limitNum,
      orderBy,
      include: {
        technician: {
          select: {
            id: true,
            name: true,
            email: true,
            specialization: true,
          },
        },
        _count: {
          select: { history: true },
        },
      },
    }),
  ]);

  const totalPages = Math.ceil(totalRecords / limitNum) || 1;

  return {
    complaints,
    pagination: {
      page: pageNum,
      limit: limitNum,
      totalRecords,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

/**
 * Cursor-based pagination demonstration endpoint
 */
export async function listComplaintsCursor({ limit = 10, cursor = null }) {
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 10));

  const complaints = await prisma.complaint.findMany({
    take: limitNum + 1, // Fetch one extra record to detect if next page exists
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: "desc" },
    include: {
      technician: {
        select: { id: true, name: true, specialization: true },
      },
    },
  });

  let nextCursor = null;
  if (complaints.length > limitNum) {
    const nextItem = complaints.pop();
    nextCursor = nextItem.id;
  }

  return {
    complaints,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };
}

/**
 * Get single complaint by ID or Reference with complete history & relations
 */
export async function getComplaintById(idOrRef) {
  // Support searching by either UUID primary key or reference string (e.g. FIX-2026-1001)
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrRef
    );

  const where = isUuid ? { id: idOrRef } : { reference: idOrRef };

  const complaint = await prisma.complaint.findUnique({
    where,
    include: {
      technician: true,
      equipment: true,
      history: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!complaint) {
    throw new AppError("Complaint not found with the provided identifier.", 404);
  }

  return complaint;
}

/**
 * Create a new complaint using a Prisma Transaction
 * Guarantees that Complaint and its initial StatusHistory audit trail are created together.
 */
export async function createComplaint(data) {
  const reference = await generateReference();

  // Check if assetLabel matches existing equipment in inventory
  let matchedEquipmentId = null;
  if (data.assetLabel && data.assetLabel.trim()) {
    const matched = await prisma.equipment.findUnique({
      where: { assetLabel: data.assetLabel.trim() },
    });
    if (matched) {
      matchedEquipmentId = matched.id;
    }
  }

  // PRISMA TRANSACTION:
  // If complaint creation succeeds but status history fails, rollback both.
  const newComplaint = await prisma.$transaction(async (tx) => {
    const complaint = await tx.complaint.create({
      data: {
        reference,
        title: data.title.trim(),
        description: data.description.trim(),
        equipmentName: data.equipmentName.trim(),
        assetLabel: data.assetLabel ? data.assetLabel.trim() : null,
        equipmentCategory: data.equipmentCategory,
        building: data.building.trim(),
        room: data.room.trim(),
        reporterName: data.reporterName.trim(),
        reporterEmail: data.reporterEmail.trim().toLowerCase(),
        priority: data.priority || "MEDIUM",
        status: "OPEN",
        equipmentId: matchedEquipmentId,
      },
    });

    // Record initial status creation in audit history
    await tx.statusHistory.create({
      data: {
        complaintId: complaint.id,
        oldStatus: null,
        newStatus: "OPEN",
        note: "Fault complaint submitted via FixFlow portal.",
        changedBy: `${data.reporterName.trim()} (Reporter)`,
      },
    });

    return complaint;
  });

  return newComplaint;
}

/**
 * Update basic complaint fields
 */
export async function updateComplaint(id, data) {
  // Verify complaint exists
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Complaint not found.", 404);
  }

  // Whitelist editable fields (prevent overwriting id, reference, createdAt)
  const updatePayload = {};
  if (data.title) updatePayload.title = data.title.trim();
  if (data.description) updatePayload.description = data.description.trim();
  if (data.priority) updatePayload.priority = data.priority;
  if (data.building) updatePayload.building = data.building.trim();
  if (data.room) updatePayload.room = data.room.trim();
  if (data.repairNotes !== undefined) updatePayload.repairNotes = data.repairNotes;

  const updated = await prisma.complaint.update({
    where: { id },
    data: updatePayload,
  });

  return updated;
}

/**
 * Update complaint status with workflow enforcement & transaction
 */
export async function updateComplaintStatus(id, newStatus, note = null, changedBy = "Admin") {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    throw new AppError("Complaint not found.", 404);
  }

  const currentStatus = complaint.status;

  if (currentStatus === newStatus) {
    return complaint; // No change needed
  }

  // Enforce workflow rules
  const allowedNext = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowedNext.includes(newStatus)) {
    throw new AppError(
      `Invalid status transition: Cannot transition complaint from "${currentStatus}" to "${newStatus}". A repair must be marked RESOLVED before it can be CLOSED.`,
      400
    );
  }

  // PRISMA TRANSACTION: Update complaint status & insert audit history simultaneously
  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const updated = await tx.complaint.update({
      where: { id },
      data: {
        status: newStatus,
        repairNotes: note ? note : complaint.repairNotes,
      },
      include: {
        technician: true,
      },
    });

    await tx.statusHistory.create({
      data: {
        complaintId: id,
        oldStatus: currentStatus,
        newStatus,
        note: note || `Status changed from ${currentStatus} to ${newStatus}.`,
        changedBy,
      },
    });

    return updated;
  });

  return updatedComplaint;
}

/**
 * Assign a technician to a complaint
 */
export async function assignTechnician(id, technicianId, note = null, assignedBy = "Admin") {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    throw new AppError("Complaint not found.", 404);
  }

  // Verify technician exists
  const technician = await prisma.technician.findUnique({
    where: { id: technicianId },
  });
  if (!technician) {
    throw new AppError("Selected technician does not exist.", 404);
  }

  // If complaint was OPEN, automatically move to ASSIGNED
  const newStatus = complaint.status === "OPEN" ? "ASSIGNED" : complaint.status;

  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const updated = await tx.complaint.update({
      where: { id },
      data: {
        technicianId,
        status: newStatus,
      },
      include: {
        technician: true,
      },
    });

    await tx.statusHistory.create({
      data: {
        complaintId: id,
        oldStatus: complaint.status,
        newStatus,
        note: note || `Assigned to technician ${technician.name} (${technician.specialization}).`,
        changedBy: assignedBy,
      },
    });

    return updated;
  });

  return updatedComplaint;
}

/**
 * Delete a complaint
 */
export async function deleteComplaint(id) {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    throw new AppError("Complaint not found.", 404);
  }

  // Safety policy: Complaints that are currently IN_PROGRESS or ON_HOLD should not be deleted accidentally
  if (complaint.status === "IN_PROGRESS") {
    throw new AppError(
      "Cannot delete a complaint that is actively IN_PROGRESS. Please resolve or close it first.",
      400
    );
  }

  // Delete complaint (cascade will automatically delete StatusHistory due to Prisma schema onDelete: Cascade)
  await prisma.complaint.delete({ where: { id } });
  return true;
}
