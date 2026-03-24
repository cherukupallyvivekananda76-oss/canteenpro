import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/mess/:date - Public/Student API to get the menu for a specific date
router.get('/:date', async (req: Request, res: Response) => {
  const { date } = req.params;
  const collegeCode = req.query.collegeCode as string;

  if (!collegeCode) {
    return res.status(400).json({ error: 'collegeCode is required' });
  }

  try {
    const college = await prisma.college.findUnique({ where: { code: collegeCode } });
    if (!college) return res.status(404).json({ error: 'College not found' });

    const menu = await prisma.messMenu.findUnique({
      where: {
        collegeId_date: { collegeId: college.id, date },
      },
    });

    if (!menu) {
      // Return a 200 with null indicating no menu set yet
      return res.status(200).json({ menu: null });
    }

    return res.status(200).json({ menu });
  } catch (err) {
    console.error('Error fetching mess menu:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/mess - Admin API to create/update mess menu for a date
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  const { date, breakfastItems, breakfastPrice, lunchItems, lunchPrice, dinnerItems, dinnerPrice } = req.body;
  const collegeId = (req as any).user.collegeId;

  if (!date || !breakfastItems || !lunchItems || !dinnerItems) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const menu = await prisma.messMenu.upsert({
      where: {
        collegeId_date: { collegeId, date },
      },
      update: {
        breakfastItems,
        breakfastPrice: Number(breakfastPrice),
        lunchItems,
        lunchPrice: Number(lunchPrice),
        dinnerItems,
        dinnerPrice: Number(dinnerPrice),
      },
      create: {
        collegeId,
        date,
        breakfastItems,
        breakfastPrice: Number(breakfastPrice),
        lunchItems,
        lunchPrice: Number(lunchPrice),
        dinnerItems,
        dinnerPrice: Number(dinnerPrice),
      },
    });

    return res.status(200).json({ message: 'Menu saved successfully', menu });
  } catch (err) {
    console.error('Error saving mess menu:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
