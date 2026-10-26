// FixFlow - Equipment Service
// Asset inventory management, category grouping, and condition tracking.

import prisma from "../../config/prisma.js";
import { AppError } from "../../middleware/errorHandler.js";

/**
 * List all equipment assets with active complaint counts
 */
export async function listEquipment({ category = null }) {
  const where = {};
  if (category && category !== "ALL") {
    where.category = category;
  }

  const items = await prisma.equipment.findMany({
    where,
    orderBy: [{ category: "asc" }, { name: "asc" }],
    include: {
      complaints: {
        select: {
          id: true,
          reference: true,
          status: true,
          priority: true,
        },
      },
      _count: {
        select: { complaints: true },
      },
    },
  });

  return items;
}

/**
 * Get equipment by ID or Asset Label
 */
export async function getEquipmentById(idOrLabel) {
  const isUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      idOrLabel
    );

  const where = isUuid ? { id: idOrLabel } : { assetLabel: idOrLabel };

  const equipment = await prisma.equipment.findUnique({
    where,
    include: {
      complaints: {
        orderBy: { createdAt: "desc" },
        include: {
          technician: true,
        },
      },
    },
  });

  if (!equipment) {
    throw new AppError("Equipment asset not found.", 404);
  }

  return equipment;
}

/**
 * Add a new equipment asset
 */
export async function createEquipment(data) {
  const existing = await prisma.equipment.findUnique({
    where: { assetLabel: data.assetLabel.trim() },
  });

  if (existing) {
    throw new AppError(
      `An equipment asset with label "${data.assetLabel.trim()}" already exists.`,
      409
    );
  }

  const equipment = await prisma.equipment.create({
    data: {
      name: data.name.trim(),
      category: data.category,
      assetLabel: data.assetLabel.trim(),
      building: data.building.trim(),
      room: data.room.trim(),
      condition: data.condition || "GOOD",
    },
  });

  return equipment;
}

/**
 * Update an existing equipment asset
 */
export async function updateEquipment(id, data) {
  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Equipment asset not found.", 404);
  }

  // If assetLabel changed, check uniqueness
  if (data.assetLabel && data.assetLabel.trim() !== existing.assetLabel) {
    const conflict = await prisma.equipment.findUnique({
      where: { assetLabel: data.assetLabel.trim() },
    });
    if (conflict) {
      throw new AppError(
        `Asset label "${data.assetLabel.trim()}" is already assigned to another item.`,
        409
      );
    }
  }

  const updatePayload = {};
  if (data.name) updatePayload.name = data.name.trim();
  if (data.category) updatePayload.category = data.category;
  if (data.assetLabel) updatePayload.assetLabel = data.assetLabel.trim();
  if (data.building) updatePayload.building = data.building.trim();
  if (data.room) updatePayload.room = data.room.trim();
  if (data.condition) updatePayload.condition = data.condition;

  const updated = await prisma.equipment.update({
    where: { id },
    data: updatePayload,
  });

  return updated;
}

/**
 * Delete equipment
 */
export async function deleteEquipment(id) {
  const existing = await prisma.equipment.findUnique({ where: { id } });
  if (!existing) {
    throw new AppError("Equipment asset not found.", 404);
  }

  await prisma.equipment.delete({ where: { id } });
  return true;
}
