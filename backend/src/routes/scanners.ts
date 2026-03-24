import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../db/prisma';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { scannerMiddleware, ScannerRequest } from '../middleware/scannerMiddleware';

const router = Router();

// GET /api/scanners/validate  — scanner auth (called by ScannerPage on mount)
router.get('/validate', scannerMiddleware, async (req: ScannerRequest, res: Response) => {
  const college = await prisma.college.findUnique({
    where: { id: req.scanner!.collegeId },
    select: { name: true, code: true },
  });
  return res.json({ valid: true, college });
});

// POST /api/scanners/scan  — scanner auth (scan student QR to mark picked_up)
router.post('/scan', scannerMiddleware, async (req: ScannerRequest, res: Response) => {
  const { orderId } = req.body as { orderId: string };

  if (!orderId?.trim()) {
    return res.status(400).json({ error: 'orderId is required.' });
  }

  const order = await prisma.order.findUnique({
    where: { orderId: orderId.trim() },
    include: { items: true },
  });

  if (!order || order.collegeId !== req.scanner!.collegeId) {
    return res.status(404).json({ error: 'Order not found.' });
  }

  if (order.status === 'picked_up') {
    return res.status(409).json({ error: 'Order has already been picked up.' });
  }

  await prisma.order.update({ where: { orderId: orderId.trim() }, data: { status: 'picked_up' } });

  return res.json({
    order: {
      orderId: order.orderId,
      studentName: order.studentName,
      items: order.items,
      totalPrice: order.totalPrice,
    },
  });
});

// GET /api/scanners  — protected (admin)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const scanners = await prisma.scanner.findMany({
    where: { collegeId: req.user!.collegeId },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ scanners });
});

// POST /api/scanners  — protected (admin creates scanner)
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name } = req.body as { name: string };
  if (!name?.trim()) {
    return res.status(400).json({ error: 'Scanner name is required.' });
  }

  const scanner = await prisma.scanner.create({
    data: {
      collegeId: req.user!.collegeId,
      name: name.trim(),
      scannerToken: uuidv4(),
    },
  });

  return res.status(201).json({ scanner });
});

// DELETE /api/scanners/:id  — protected
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const scanner = await prisma.scanner.findUnique({ where: { id } });

  if (!scanner || scanner.collegeId !== req.user!.collegeId) {
    return res.status(404).json({ error: 'Scanner not found.' });
  }

  await prisma.scanner.update({ where: { id }, data: { isActive: false } });
  return res.json({ message: 'Scanner deactivated.' });
});

export default router;
