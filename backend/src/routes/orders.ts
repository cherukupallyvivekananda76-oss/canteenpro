import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { generateOrderId } from '../utils/generateOrderId';

const router = Router();

// POST /api/orders  — public (student places order)
router.post('/', async (req: Request, res: Response) => {
  const { collegeCode, studentName, rollNo, pickupTime, utrNumber, items, notes } = req.body as {
    collegeCode: string;
    studentName: string;
    rollNo: string;
    pickupTime?: string;
    utrNumber?: string;
    items: Array<{ menuItemId: number; quantity: number }>;
    notes?: string;
  };

  if (!collegeCode?.trim()) {
    return res.status(400).json({ error: 'collegeCode is required.' });
  }
  if (!studentName?.trim()) {
    return res.status(400).json({ error: 'studentName is required.' });
  }
  if (!rollNo?.trim()) {
    return res.status(400).json({ error: 'rollNo is required.' });
  }
  if (!pickupTime?.trim()) {
    return res.status(400).json({ error: 'pickupTime is required.' });
  }
  if (!utrNumber?.trim() || utrNumber.length < 12) {
    return res.status(400).json({ error: 'Valid 12-digit UTR Transaction ID is required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required.' });
  }

  const college = await prisma.college.findUnique({
    where: { code: collegeCode.trim().toUpperCase() },
  });
  if (!college) {
    return res.status(404).json({ error: 'College not found.' });
  }

  // Fetch authoritative prices from DB (never trust frontend prices)
  const menuItems = await prisma.menuItem.findMany({
    where: {
      id: { in: items.map((i) => i.menuItemId) },
      collegeId: college.id,
      isAvailable: true,
    },
  });

  const menuMap = new Map(menuItems.map((m) => [m.id, m]));

  for (const item of items) {
    if (!menuMap.has(item.menuItemId)) {
      return res.status(400).json({ error: `Menu item ${item.menuItemId} not found or unavailable.` });
    }
  }

  const orderId = await generateOrderId(college.id, college.code);
  const orderItems = items.map((item) => {
    const menuItem = menuMap.get(item.menuItemId)!;
    return {
      menuItemId: item.menuItemId,
      itemName: menuItem.name,
      itemPrice: menuItem.price,
      quantity: item.quantity,
    };
  });

  const totalPrice = orderItems.reduce((sum, i) => sum + i.itemPrice * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      orderId,
      collegeId: college.id,
      studentName: studentName.trim(),
      rollNo: rollNo.trim(),
      pickupTime: pickupTime.trim(),
      utrNumber: utrNumber.trim(),
      notes: notes?.trim() ?? '',
      totalPrice,
      items: { create: orderItems },
    },
  });

  console.log(`[ORDER] ${orderId} | ${studentName} (${rollNo}) | Pickup: ${pickupTime} | UTR: ${utrNumber} | ₹${totalPrice}`);
  return res.status(201).json({ orderId: order.orderId, totalPrice: order.totalPrice });
});

// GET /api/orders  — protected (admin sees their college's orders)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { status, limit = '50', offset = '0' } = req.query as {
    status?: string;
    limit?: string;
    offset?: string;
  };

  const where: Record<string, unknown> = { collegeId: req.user!.collegeId };
  if (status) where.status = status;

  const orders = await prisma.order.findMany({
    where,
    include: { items: true },
    orderBy: { createdAt: 'desc' },
    take: parseInt(limit),
    skip: parseInt(offset),
  });

  return res.json({ orders });
});

// PATCH /api/orders/:orderId/status  — protected
router.patch('/:orderId/status', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body as { status: string };

  const validStatuses = ['pending', 'preparing', 'ready', 'picked_up'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status.' });
  }

  const order = await prisma.order.findUnique({ where: { orderId } });
  if (!order || order.collegeId !== req.user!.collegeId) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  const updated = await prisma.order.update({ where: { orderId }, data: { status } });
  return res.json({ order: updated });
});

export default router;
