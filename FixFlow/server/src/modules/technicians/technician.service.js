// FixFlow - Technician Service
// Business logic for technician management, workload calculation, and assignment validation.

import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

/**
 * List all technicians with open repair counts and completed repair counts
 */
export async function listTechnicians() {
  const technicians = await prisma.technician.findMany({
    orderBy: { name: "asc" },
    include: {
      complaints: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  });

  // Calculate open and completed repairs for each technician
  const formatted = technicians.map((tech) => {
    const openRepairs = tech.complaints.filter((c) =>
      ["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"].includes(c.status)
    ).length;

    const completedRepairs = tech.complaints.filter((c) =>
      ["RESOLVED", "CLOSED"].includes(c.status)
    ).length;

    return {
      id: tech.id,
      name: tech.name,
      email: tech.email,
      specialization: tech.specialization,
      availability: tech.availability,
      openRepairsCount: openRepairs,
      completedRepairsCount: completedRepairs,
      totalAssignedCount: tech.complaints.length,
      createdAt: tech.createdAt,
      updatedAt: tech.updatedAt,
    };
  });

  return formatted;
}

/**
 * Get technician by ID with their active and past complaints
 */
export async function getTechnicianById(id) {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      complaints: {
        orderBy: { createdAt: "desc" },
        include: {
          history: {
            take: 3,
            orderBy: { createdAt: "desc" },
          },
        },
      },
    },
  });

  if (!technician) {
    throw new AppError("Technician not found.", 404);
  }

  const openRepairs = technician.complaints.filter((c) =>
    ["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"].includes(c.status)
  ).length;

  const completedRepairs = technician.complaints.filter((c) =>
    ["RESOLVED", "CLOSED"].includes(c.status)
  ).length;

  return {
    ...technician,
    openRepairsCount: openRepairs,
    completedRepairsCount: completedRepairs,
  };
}

/**
 * Create a new technician
 */
export async function createTechnician(data) {
  const existing = await prisma.technician.findUnique({
    where: { email: data.email.trim().toLowerCase() },
  });

  if (existing) {
    throw new AppError("A technician with this email address already exists.", 409);
  }

  const technician = await prisma.technician.create({
    data: {
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      specialization: data.specialization.trim(),
      availability: data.availability !== undefined ? Boolean(data.availability) : true,
    },
  });

  return technician;
}

/**
 * Update an existing technician
 */
export async function updateTechnician(id, data) {
  const existing = await prisma.technician.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Technician not found.", 404);
  }

  // If email is changing, verify it is not taken by another technician
  if (data.email && data.email.trim().toLowerCase() !== existing.email) {
    const emailConflict = await prisma.technician.findUnique({
      where: { email: data.email.trim().toLowerCase() },
    });
    if (emailConflict) {
      throw new AppError("A technician with this email address already exists.", 409);
    }
  }

  const updatePayload = {};
  if (data.name) updatePayload.name = data.name.trim();
  if (data.email) updatePayload.email = data.email.trim().toLowerCase();
  if (data.specialization) updatePayload.specialization = data.specialization.trim();
  if (data.availability !== undefined) updatePayload.availability = Boolean(data.availability);

  const updated = await prisma.technician.update({
    where: { id },
    data: updatePayload,
  });

  return updated;
}

/**
 * Delete a technician
 * Enforces safety rule: Cannot delete technician with active open repairs!
 */
export async function deleteTechnician(id) {
  const technician = await prisma.technician.findUnique({
    where: { id },
    include: {
      complaints: {
        where: {
          status: { in: ["OPEN", "ASSIGNED", "IN_PROGRESS", "ON_HOLD"] },
        },
      },
    },
  });

  if (!technician) {
    throw new AppError("Technician not found.", 404);
  }

  if (technician.complaints.length > 0) {
    throw new AppError(
      `Cannot delete technician "${technician.name}". They currently have ${technician.complaints.length} active open repair(s) assigned. Reassign those complaints before deleting.`,
      400
    );
  }

  await prisma.technician.delete({ where: { id } });
  return true;
}
