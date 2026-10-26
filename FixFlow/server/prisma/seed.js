// FixFlow - Database Seed Script
// Inserts initial technicians, equipment inventory, sample complaints, and status history.

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting FixFlow database seeding...");

  // 1. Clean existing records in reverse dependency order (safe for repeated runs)
  await prisma.statusHistory.deleteMany();
  await prisma.complaint.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.technician.deleteMany();

  console.log("🧹 Cleaned old records.");

  // 2. Create Technicians
  const rajesh = await prisma.technician.create({
    data: {
      name: "Rajesh Kumar",
      email: "rajesh.k@campus.fixflow.edu",
      specialization: "Projectors & A/V Systems",
      availability: true,
    },
  });

  const anita = await prisma.technician.create({
    data: {
      name: "Anita Sharma",
      email: "anita.s@campus.fixflow.edu",
      specialization: "Computer Hardware & OS",
      availability: true,
    },
  });

  const vikram = await prisma.technician.create({
    data: {
      name: "Vikram Malhotra",
      email: "vikram.m@campus.fixflow.edu",
      specialization: "Campus Networking & Routers",
      availability: false, // Busy working on campus backbone
    },
  });

  const suresh = await prisma.technician.create({
    data: {
      name: "Suresh Patel",
      email: "suresh.p@campus.fixflow.edu",
      specialization: "Printers & Peripherals",
      availability: true,
    },
  });

  console.log("✅ Seeded 4 technicians.");

  // 3. Create Campus Equipment Assets
  const projLab3 = await prisma.equipment.create({
    data: {
      name: "Epson PowerLite X49",
      category: "PROJECTOR",
      assetLabel: "EQ-PROJ-301",
      building: "Science Block",
      room: "Lab 3",
      condition: "UNDER_REPAIR",
    },
  });

  const pcLab2 = await prisma.equipment.create({
    data: {
      name: "Dell OptiPlex 7090",
      category: "COMPUTER",
      assetLabel: "EQ-PC-204",
      building: "IT & Computer Block",
      room: "Lab 2 (Workstation 14)",
      condition: "POOR",
    },
  });

  const printLib = await prisma.equipment.create({
    data: {
      name: "HP LaserJet Enterprise M608",
      category: "PRINTER",
      assetLabel: "EQ-PRN-102",
      building: "Central Library",
      room: "Ground Floor Printing Room",
      condition: "FAIR",
    },
  });

  const routerHall = await prisma.equipment.create({
    data: {
      name: "Cisco Catalyst 9120AX",
      category: "ROUTER",
      assetLabel: "EQ-RTR-055",
      building: "Academic Block A",
      room: "Seminar Hall 1",
      condition: "GOOD",
    },
  });

  const lapProf = await prisma.equipment.create({
    data: {
      name: "Lenovo ThinkPad E14",
      category: "LAPTOP",
      assetLabel: "EQ-LAP-412",
      building: "Faculty Tower",
      room: "Room 304 (Prof. Gupta)",
      condition: "GOOD",
    },
  });

  const switchServer = await prisma.equipment.create({
    data: {
      name: "D-Link 24-Port Gigabit Switch",
      category: "OTHER",
      assetLabel: "EQ-NET-019",
      building: "Admin Block",
      room: "Server Room B1",
      condition: "EXCELLENT",
    },
  });

  console.log("✅ Seeded 6 equipment assets.");

  // 4. Create Complaints and their StatusHistory audit trail
  // Complaint 1: CRITICAL - Projector Lab 3 (IN_PROGRESS)
  const c1 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1001",
      title: "Projector in Lab 3 is not displaying anything",
      description: "During morning lectures the projector power LED turns blue, but the lamp does not strike and no HDMI signal displays. Multiple faculty members were unable to present.",
      equipmentName: projLab3.name,
      assetLabel: projLab3.assetLabel,
      equipmentCategory: "PROJECTOR",
      building: "Science Block",
      room: "Lab 3",
      reporterName: "Dr. Arvind Rao",
      reporterEmail: "arvind.rao@campus.fixflow.edu",
      priority: "CRITICAL",
      status: "IN_PROGRESS",
      technicianId: rajesh.id,
      equipmentId: projLab3.id,
      repairNotes: "Opened projector housing. Lamp module filament has burned out. Replacement lamp unit requested from stores.",
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Complaint submitted by Dr. Arvind Rao.",
            changedBy: "Dr. Arvind Rao (Reporter)",
          },
          {
            oldStatus: "OPEN",
            newStatus: "ASSIGNED",
            note: "Assigned to Rajesh Kumar (A/V Specialist) due to critical lecture room priority.",
            changedBy: "Admin",
          },
          {
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            note: "Inspected hardware on site in Lab 3. Diagnosed lamp failure.",
            changedBy: "Rajesh Kumar (Technician)",
          },
        ],
      },
    },
  });

  // Complaint 2: HIGH - Computer Lab 2 (ASSIGNED)
  const c2 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1002",
      title: "Lab computer workstation 14 is not starting",
      description: "When pressing power button, power LED blinks amber 2 times then 1 time. System does not POST. Internal fans spin for 3 seconds then stop.",
      equipmentName: pcLab2.name,
      assetLabel: pcLab2.assetLabel,
      equipmentCategory: "COMPUTER",
      building: "IT & Computer Block",
      room: "Lab 2 (Workstation 14)",
      reporterName: "Sneha Patil (Lab Assistant)",
      reporterEmail: "sneha.p@campus.fixflow.edu",
      priority: "HIGH",
      status: "ASSIGNED",
      technicianId: anita.id,
      equipmentId: pcLab2.id,
      repairNotes: "Scheduled for motherboard and SMPS power check this afternoon.",
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Complaint lodged after student practicals.",
            changedBy: "Sneha Patil (Reporter)",
          },
          {
            oldStatus: "OPEN",
            newStatus: "ASSIGNED",
            note: "Assigned to Anita Sharma for desktop diagnostic.",
            changedBy: "Admin",
          },
        ],
      },
    },
  });

  // Complaint 3: MEDIUM - Printer Library (OPEN)
  const c3 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1003",
      title: "Library printer is producing completely blank pages",
      description: "Students trying to print project reports get blank pages with faint vertical lines. Toner level indicates 40% but roller appears jammed or drum unit is damaged.",
      equipmentName: printLib.name,
      assetLabel: printLib.assetLabel,
      equipmentCategory: "PRINTER",
      building: "Central Library",
      room: "Ground Floor Printing Room",
      reporterName: "Rohan Varma (Student)",
      reporterEmail: "rohan.v@student.fixflow.edu",
      priority: "MEDIUM",
      status: "OPEN",
      equipmentId: printLib.id,
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Complaint submitted via student portal.",
            changedBy: "Rohan Varma (Reporter)",
          },
        ],
      },
    },
  });

  // Complaint 4: HIGH - Router Seminar Hall (ON_HOLD)
  const c4 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1004",
      title: "Seminar hall Wi-Fi router has no internet connection",
      description: "The access point in Seminar Hall 1 has a solid red indicator LED. DHCP does not allocate IP addresses to laptops in the hall.",
      equipmentName: routerHall.name,
      assetLabel: routerHall.assetLabel,
      equipmentCategory: "ROUTER",
      building: "Academic Block A",
      room: "Seminar Hall 1",
      reporterName: "Prof. Sunita Deshmukh",
      reporterEmail: "sunita.d@campus.fixflow.edu",
      priority: "HIGH",
      status: "ON_HOLD",
      technicianId: vikram.id,
      equipmentId: routerHall.id,
      repairNotes: "Uplink ethernet cable crimp in ceiling conduit is severed. Awaiting ladder and cable puller equipment tomorrow.",
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Reported before seminar conference.",
            changedBy: "Prof. Sunita Deshmukh (Reporter)",
          },
          {
            oldStatus: "OPEN",
            newStatus: "ASSIGNED",
            note: "Assigned to Vikram Malhotra.",
            changedBy: "Admin",
          },
          {
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            note: "Tested switch port, traced issue to ceiling cat6 cable.",
            changedBy: "Vikram Malhotra (Technician)",
          },
          {
            oldStatus: "IN_PROGRESS",
            newStatus: "ON_HOLD",
            note: "On hold waiting for maintenance team ladder and cabling gear.",
            changedBy: "Vikram Malhotra (Technician)",
          },
        ],
      },
    },
  });

  // Complaint 5: LOW - Laptop Battery (RESOLVED)
  const c5 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1005",
      title: "Faculty laptop battery drains completely in 15 minutes",
      description: "Laptop turns off instantly when unplugged from AC adapter. Battery health diagnostics show critical wear cycle count.",
      equipmentName: lapProf.name,
      assetLabel: lapProf.assetLabel,
      equipmentCategory: "LAPTOP",
      building: "Faculty Tower",
      room: "Room 304",
      reporterName: "Prof. N. K. Gupta",
      reporterEmail: "nk.gupta@campus.fixflow.edu",
      priority: "LOW",
      status: "RESOLVED",
      technicianId: anita.id,
      equipmentId: lapProf.id,
      repairNotes: "Replaced 45Wh internal battery with genuine Lenovo part. Calibrated battery charge cycle to 100%. Tested unplugged for 4 hours without issue.",
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Complaint submitted.",
            changedBy: "Prof. N. K. Gupta (Reporter)",
          },
          {
            oldStatus: "OPEN",
            newStatus: "ASSIGNED",
            note: "Assigned to Anita Sharma.",
            changedBy: "Admin",
          },
          {
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            note: "Battery replacement part ordered and received.",
            changedBy: "Anita Sharma (Technician)",
          },
          {
            oldStatus: "IN_PROGRESS",
            newStatus: "RESOLVED",
            note: "New battery installed and verified healthy.",
            changedBy: "Anita Sharma (Technician)",
          },
        ],
      },
    },
  });

  // Complaint 6: LOW - Server room switch patch cord (CLOSED)
  const c6 = await prisma.complaint.create({
    data: {
      reference: "FIX-2026-1006",
      title: "Server room patch panel port loose connection",
      description: "Port 7 on patch panel has broken retaining clip and slips out when cleaning staff dusts the rack.",
      equipmentName: switchServer.name,
      assetLabel: switchServer.assetLabel,
      equipmentCategory: "OTHER",
      building: "Admin Block",
      room: "Server Room B1",
      reporterName: "Karan Johar (SysAdmin)",
      reporterEmail: "karan.j@campus.fixflow.edu",
      priority: "LOW",
      status: "CLOSED",
      technicianId: vikram.id,
      equipmentId: switchServer.id,
      repairNotes: "Replaced snagged RJ45 boot with new Cat6 patch cord. Secured cable management arm.",
      history: {
        create: [
          {
            oldStatus: null,
            newStatus: "OPEN",
            note: "Reported by SysAdmin.",
            changedBy: "Karan Johar (Reporter)",
          },
          {
            oldStatus: "OPEN",
            newStatus: "ASSIGNED",
            note: "Assigned to Vikram.",
            changedBy: "Admin",
          },
          {
            oldStatus: "ASSIGNED",
            newStatus: "IN_PROGRESS",
            note: "Cable replacement ongoing.",
            changedBy: "Vikram Malhotra (Technician)",
          },
          {
            oldStatus: "IN_PROGRESS",
            newStatus: "RESOLVED",
            note: "Patch cable replaced and link speed verified 1Gbps.",
            changedBy: "Vikram Malhotra (Technician)",
          },
          {
            oldStatus: "RESOLVED",
            newStatus: "CLOSED",
            note: "Reporter verified and signed off closure.",
            changedBy: "Admin",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded 6 complaints with complete status audit histories.");
  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
