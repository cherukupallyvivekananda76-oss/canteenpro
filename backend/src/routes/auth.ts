import { Router, Request, Response } from 'express';
import prisma from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { signToken } from '../utils/jwt';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
  const { collegeName, collegeCode, headName, email, password } = req.body as {
    collegeName: string;
    collegeCode: string;
    headName: string;
    email: string;
    password: string;
  };

  if (!collegeName?.trim() || !collegeCode?.trim() || !headName?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const code = collegeCode.trim().toUpperCase();
  if (!/^[A-Z0-9]{3,8}$/.test(code)) {
    return res.status(400).json({ error: 'College code must be 3–8 uppercase letters/numbers.' });
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const existingCollege = await prisma.college.findUnique({ where: { code } });
  if (existingCollege) {
    return res.status(400).json({ error: 'College code is already taken.' });
  }

  const existingHead = await prisma.canteenHead.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (existingHead) {
    return res.status(400).json({ error: 'Email is already registered.' });
  }

  const passwordHash = await hashPassword(password);

  const college = await prisma.college.create({
    data: {
      name: collegeName.trim(),
      code,
      canteenHead: {
        create: {
          name: headName.trim(),
          email: email.trim().toLowerCase(),
          passwordHash,
        },
      },
    },
  });

  return res.status(201).json({ message: 'College registered successfully.', collegeCode: college.code });
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  if (!email?.trim() || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const head = await prisma.canteenHead.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { college: true },
  });

  if (!head) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const valid = await comparePassword(password, head.passwordHash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = signToken({
    canteenHeadId: head.id,
    collegeId: head.collegeId,
    collegeCode: head.college.code,
  });

  return res.json({
    token,
    canteenHead: {
      id: head.id,
      name: head.name,
      email: head.email,
      collegeId: head.collegeId,
      collegeCode: head.college.code,
      collegeName: head.college.name,
    },
  });
});

export default router;
