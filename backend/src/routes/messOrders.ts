import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/mess-orders - Public API for student to place a preorder
router.post('/', async (req: Request, res: Response) => {
  const { collegeCode, studentName, rollNo, date, wantsBreakfast, wantsLunch, wantsDinner, utrNumber, totalPrice } = req.body;

  if (!collegeCode || !studentName || !rollNo || !date) {
    return res.status(400).json({ error: 'Missing required student details or date' });
  }

  if (!wantsBreakfast && !wantsLunch && !wantsDinner) {
    return res.status(400).json({ error: 'Please select at least one meal' });
  }

  if (!utrNumber || utrNumber.length < 12) {
    return res.status(400).json({ error: 'Valid 12-digit UTR Transaction ID is required.' });
  }

  try {
    const college = await prisma.college.findUnique({ where: { code: collegeCode } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    // Generate readable order ID e.g., SIT-MESS-20231024-0001
    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const countToday = await prisma.messOrder.count({
      where: { collegeId: college.id, createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) } },
    });
    const orderId = `${college.code}-MESS-${todayStr}-${String(countToday + 1).padStart(4, '0')}`;

    const order = await prisma.messOrder.create({
      data: {
        orderId,
        collegeId: college.id,
        studentName: studentName.trim(),
        rollNo: rollNo.trim(),
        date,
        wantsBreakfast,
        wantsLunch,
        wantsDinner,
        utrNumber: utrNumber.trim(),
        totalPrice: Number(totalPrice),
      },
    });

    return res.status(201).json({ orderId: order.orderId, totalPrice: order.totalPrice });
  } catch (err) {
    console.error('Error placing mess order:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/mess-orders - Admin API to view orders
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  const collegeId = (req as any).user.collegeId;
  const { date, status } = req.query;

  const whereClause: any = { collegeId };
  if (date) whereClause.date = String(date);
  if (status && status !== 'all') whereClause.status = String(status);

  try {
    const orders = await prisma.messOrder.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ orders });
  } catch (err) {
    console.error('Error fetching mess orders:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PATCH /api/mess-orders/:orderId/status - Admin update status
router.patch('/:orderId/status', authMiddleware, async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { status } = req.body;
  const collegeId = (req as any).user.collegeId;

  if (!status) return res.status(400).json({ error: 'Status is required' });

  try {
    const order = await prisma.messOrder.updateMany({
      where: { orderId, collegeId },
      data: { status },
    });

    if (order.count === 0) return res.status(404).json({ error: 'Order not found' });

    return res.status(200).json({ message: 'Order status updated' });
  } catch (err) {
    console.error('Error updating mess order status:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
