import { Router } from "express";
import { authenticate, requireAdmin, AuthRequest } from "../middlewares/auth.js";
import prisma from "../prisma.js";

const router = Router();
router.use(authenticate, requireAdmin);

router.get("/bookings", async (req, res) => {
  try {
    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.id } });
    const isDemoAdmin = adminUser?.isDemo === true;

    const bookings = await prisma.booking.findMany({
      where: {
        user: {
          isDemo: isDemoAdmin
        }
      },
      include: {
        user: true,
        items: { include: { unit: { include: { inventoryItem: true } } } },
        payments: true,
        penalties: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Optimization: avoid loading unlimited data at once
    });
    
    // Map to old structure with complete details
    const mapped = bookings.map(b => ({
      id: b.id,
      bookingNumber: b.bookingNumber,
      customer_name: b.user.name,
      customer_email: b.user.email,
      start_date: b.startDate,
      end_date: b.endDate,
      total_price: b.totalPrice,
      status: b.status,
      created_at: b.createdAt,
      items: b.items.map(bi => ({
        id: bi.id,
        pricePerDay: bi.pricePerDay,
        unitCode: bi.unit.unitCode,
        itemName: bi.unit.inventoryItem.name,
        unitId: bi.unitId,
        condition: bi.unit.condition,
        status: bi.unit.status
      })),
      payments: b.payments,
      penalties: b.penalties
    }));
    
    res.json({ bookings: mapped });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/bookings/:id/status", async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const booking = await prisma.$transaction(async (tx) => {
      const b = await tx.booking.update({
        where: { id },
        data: { status },
        include: { items: true, user: true }
      });

      // Update unit statuses based on lifecycle
      let unitStatus = null;
      if (status === "ongoing" || status === "borrowed") unitStatus = "borrowed";
      if (status === "completed" || status === "cancelled" || status === "returned") unitStatus = "available";

      if (unitStatus) {
        for (const item of b.items) {
          await tx.inventoryUnit.update({
            where: { id: item.unitId },
            data: { status: unitStatus }
          });
        }
      }

      await tx.notification.create({
        data: {
          userId: b.userId,
          title: "Status Pesanan",
          message: "Pesanan " + b.bookingNumber + " kini berstatus: " + status,
          type: "info"
        }
      });

      return b;
    });

    res.json({ success: true, booking });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/users", async (req, res) => {
  try {
    const adminUser = await prisma.user.findUnique({ where: { id: req.user?.id } });
    const isDemoAdmin = adminUser?.isDemo === true;

    const users = await prisma.user.findMany({
      where: { 
        role: "customer",
        isDemo: isDemoAdmin
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/users/:id/verify", async (req, res) => {
  const { is_verified } = req.body;
  const { id } = req.params;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { isVerified: is_verified }
    });
    
    await prisma.notification.create({
      data: {
        userId: id,
        title: "Verifikasi Identitas",
        message: is_verified ? "Identitas Anda telah disetujui." : "Identitas ditolak, mohon upload ulang.",
        type: is_verified ? "success" : "error"
      }
    });

    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET all inventory items and their units plus maintenance logs
router.get("/inventory", async (req, res) => {
  try {
    const items = await prisma.inventoryItem.findMany({
      include: {
        category: true,
        units: {
          include: {
            maintenanceLogs: {
              orderBy: { createdAt: "desc" }
            }
          }
        }
      }
    });
    res.json({ items });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST to add new inventory item
router.post("/inventory", async (req, res) => {
  const { categoryId, name, description, pricePerDay, icon, unitCodes } = req.body;
  if (!name || !pricePerDay || !categoryId || !unitCodes || !Array.isArray(unitCodes)) {
    return res.status(400).json({ error: "Data inventaris tidak lengkap." });
  }

  try {
    const item = await prisma.inventoryItem.create({
      data: {
        categoryId,
        name,
        description,
        pricePerDay: parseFloat(pricePerDay),
        icon: icon || 'Package',
        units: {
          create: unitCodes.map((code: string) => ({ unitCode: code }))
        }
      }
    });
    res.json({ success: true, item });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST to update unit status manually (available, maintenance, damaged, lost)
router.post("/inventory/units/:unitId/status", async (req, res) => {
  const { unitId } = req.params;
  const { status, condition } = req.body;

  try {
    const unit = await prisma.inventoryUnit.update({
      where: { id: unitId },
      data: { 
        status,
        condition: condition || undefined
      },
      include: { inventoryItem: true }
    });

    res.json({ success: true, unit });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST to insert unit maintenance log
router.post("/inventory/maintenance", async (req, res) => {
  const { unitId, status, notes, cost } = req.body;

  try {
    const log = await prisma.$transaction(async (tx) => {
      const maintenance = await tx.maintenanceLog.create({
        data: {
          unitId,
          status,
          notes,
          cost: cost ? parseFloat(cost) : 0
        },
        include: {
          unit: {
            include: { inventoryItem: true }
          }
        }
      });

      // Update unit status to maintenance
      await tx.inventoryUnit.update({
        where: { id: unitId },
        data: { status: "maintenance" }
      });

      return maintenance;
    });

    res.json({ success: true, log });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST to add manual / delay penalty to a booking
router.post("/bookings/:id/penalty", async (req, res) => {
  const { id } = req.params;
  const { amount, reason } = req.body;

  try {
    const penalty = await prisma.$transaction(async (tx) => {
      const p = await tx.penalty.create({
        data: {
          bookingId: id,
          amount: parseFloat(amount),
          reason,
          status: "unpaid"
        },
        include: {
          booking: {
            include: { user: true }
          }
        }
      });

      // Set booking status to penalty status
      await tx.booking.update({
        where: { id },
        data: { status: "penalty" }
      });

      await tx.notification.create({
        data: {
          userId: p.booking.userId,
          title: "Denda Dikenakan",
          message: `Booking Anda ${p.booking.bookingNumber} dikenakan denda Rp ${parseFloat(amount).toLocaleString()} karena: ${reason}`,
          type: "error"
        }
      });

      return p;
    });

    res.json({ success: true, penalty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST to pay/verify a penalty
router.post("/bookings/:id/penalty/:penaltyId/pay", async (req, res) => {
  const { id, penaltyId } = req.params;

  try {
    const penalty = await prisma.$transaction(async (tx) => {
      const p = await tx.penalty.update({
        where: { id: penaltyId },
        data: { status: "paid" },
        include: {
          booking: {
            include: { user: true }
          }
        }
      });

      // If all penalties for this booking are paid, restore booking state to checking/returned/completed
      const unpaid = await tx.penalty.count({
        where: { bookingId: id, status: "unpaid" }
      });

      if (unpaid === 0) {
        await tx.booking.update({
          where: { id },
          data: { status: "completed" }
        });
      }

      await tx.notification.create({
        data: {
          userId: p.booking.userId,
          title: "Denda Dibayar",
          message: `Denda Anda untuk pesanan ${p.booking.bookingNumber} sebesar Rp ${p.amount.toLocaleString()} telah diverifikasi lunas.`,
          type: "success"
        }
      });

      return p;
    });

    res.json({ success: true, penalty });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
