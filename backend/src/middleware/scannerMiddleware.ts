import { Request, Response, NextFunction } from 'express';
import prisma from '../db/prisma';

export interface ScannerRequest extends Request {
  scanner?: { id: number; collegeId: number };
}

export async function scannerMiddleware(req: ScannerRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Scanner token required.' });
    return;
  }

  const token = authHeader.slice(7);
  const scanner = await prisma.scanner.findUnique({
    where: { scannerToken: token },
  });

  if (!scanner || !scanner.isActive) {
    res.status(401).json({ error: 'Invalid or inactive scanner token.' });
    return;
  }

  req.scanner = { id: scanner.id, collegeId: scanner.collegeId };
  next();
}
