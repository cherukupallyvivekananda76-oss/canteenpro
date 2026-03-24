import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';

const router = Router();

// GET /api/colleges/:code
router.get('/:code', async (req: Request, res: Response) => {
  const code = req.params.code.toUpperCase();
  const college = await prisma.college.findUnique({
    where: { code },
    select: { id: true, name: true, code: true },
  });

  if (!college) {
    return res.status(404).json({ error: 'College not found.' });
  }

  return res.json(college);
});

export default router;
