import { Router, Request, Response } from 'express';
import multer from 'multer';
import Tesseract from 'tesseract.js';
import path from 'path';
import { PDFParse } from 'pdf-parse';
import * as XLSX from 'xlsx';
import prisma from '../db/prisma';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { ParsedMenuItem, parseMenuItemsFromOcrText, parseMenuItemsFromRows, parseMenuItemsFromText } from '../utils/menuImageParser';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function defaultEmojiByCategory(category: string): string {
  if (category === 'beverage') return '🥤';
  if (category === 'snack') return '🥪';
  return '🍽️';
}

function getLowerExt(filename: string): string {
  return path.extname(filename || '').toLowerCase();
}

function isImageFile(mimetype: string, ext: string): boolean {
  return mimetype.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext);
}

function isPdfFile(mimetype: string, ext: string): boolean {
  return mimetype === 'application/pdf' || ext === '.pdf';
}

function isSpreadsheetFile(mimetype: string, ext: string): boolean {
  return [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'application/csv',
  ].includes(mimetype) || ['.xlsx', '.xls', '.csv'].includes(ext);
}

async function parseMenuFromUpload(file: Express.Multer.File): Promise<ParsedMenuItem[]> {
  const ext = getLowerExt(file.originalname);
  const mimetype = (file.mimetype || '').toLowerCase();

  if (isImageFile(mimetype, ext)) {
    const ocr = await Tesseract.recognize(file.buffer, 'eng');
    return parseMenuItemsFromOcrText(ocr.data.text);
  }

  if (isPdfFile(mimetype, ext)) {
    const parser = new PDFParse({ data: file.buffer });
    const parsedPdf = await parser.getText();
    return parseMenuItemsFromText(parsedPdf.text || '');
  }

  if (isSpreadsheetFile(mimetype, ext)) {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const allRows: string[][] = [];

    for (const sheetName of workbook.SheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: '' }) as Array<Array<string | number>>;
      rows.forEach((row) => {
        const normalizedRow = row.map((cell) => String(cell ?? '').trim());
        allRows.push(normalizedRow);
      });
    }

    return parseMenuItemsFromRows(allRows);
  }

  throw new Error('unsupported_file_type');
}

async function createParsedItemsForCollege(collegeId: number, parsedItems: ParsedMenuItem[]) {
  const existingItems = await prisma.menuItem.findMany({
    where: { collegeId },
    select: { name: true },
  });
  const existingNames = new Set(existingItems.map((item) => item.name.trim().toLowerCase()));

  const toCreate = parsedItems.filter((item) => !existingNames.has(item.name.trim().toLowerCase()));

  if (toCreate.length > 0) {
    await prisma.menuItem.createMany({
      data: toCreate.map((item) => ({
        collegeId,
        name: item.name,
        description: `${item.name} freshly prepared by canteen.`,
        price: item.price,
        emoji: item.emoji,
        category: item.category,
        imageUrl: null,
      })),
    });
  }

  return {
    parsedCount: parsedItems.length,
    createdCount: toCreate.length,
    skippedCount: parsedItems.length - toCreate.length,
  };
}

// GET /api/menu/:collegeCode  — public
router.get('/:collegeCode', async (req: Request, res: Response) => {
  const code = req.params.collegeCode.toUpperCase();
  const college = await prisma.college.findUnique({ where: { code } });
  if (!college) {
    return res.status(404).json({ error: 'College not found.' });
  }

  const items = await prisma.menuItem.findMany({
    where: { collegeId: college.id, isAvailable: true },
    orderBy: { createdAt: 'asc' },
  });

  return res.json({ items });
});

// GET /api/menu  — protected (admin sees all items including unavailable)
router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const items = await prisma.menuItem.findMany({
    where: { collegeId: req.user!.collegeId },
    orderBy: { createdAt: 'asc' },
  });
  return res.json({ items });
});

// POST /api/menu/import-file  — protected
router.post('/import-file', authMiddleware, upload.single('menuFile'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'menuFile is required.' });
  }

  try {
    const parsedItems = await parseMenuFromUpload(req.file);

    if (parsedItems.length === 0) {
      return res.status(400).json({ error: 'Could not detect menu items from this file. Please upload a clearer menu file.' });
    }

    const result = await createParsedItemsForCollege(req.user!.collegeId, parsedItems);

    return res.status(201).json({
      message: 'Menu imported successfully.',
      ...result,
    });
  } catch (error) {
    if (error instanceof Error && error.message === 'unsupported_file_type') {
      return res.status(400).json({ error: 'Unsupported file type. Upload image, PDF, Excel, or CSV.' });
    }

    return res.status(500).json({ error: 'Failed to process menu file.' });
  }
});

// POST /api/menu/import-image  — protected (backward compatibility)
router.post('/import-image', authMiddleware, upload.single('menuImage'), async (req: AuthRequest, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: 'menuImage is required.' });
  }

  try {
    const parsedItems = await parseMenuFromUpload(req.file);
    if (parsedItems.length === 0) {
      return res.status(400).json({ error: 'Could not detect menu items from image. Please use a clearer photo.' });
    }

    const result = await createParsedItemsForCollege(req.user!.collegeId, parsedItems);
    return res.status(201).json({ message: 'Menu imported successfully.', ...result });
  } catch {
    return res.status(500).json({ error: 'Failed to process menu image.' });
  }
});

// POST /api/menu  — protected
router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, description, price, emoji, category, imageUrl } = req.body as {
    name: string;
    description?: string;
    price: number;
    emoji?: string;
    category?: string;
    imageUrl?: string;
  };

  if (!name?.trim() || !price) {
    return res.status(400).json({ error: 'name and price are required.' });
  }

  const safeCategory = category?.trim() || 'meal';
  if (!['meal', 'snack', 'beverage'].includes(safeCategory)) {
    return res.status(400).json({ error: 'category must be meal, snack, or beverage.' });
  }

  const item = await prisma.menuItem.create({
    data: {
      collegeId: req.user!.collegeId,
      name: name.trim(),
      description: (description?.trim() || `${name.trim()} freshly prepared by canteen.`),
      price: Number(price),
      emoji: emoji?.trim() || defaultEmojiByCategory(safeCategory),
      category: safeCategory,
      imageUrl: imageUrl?.trim() || null,
    },
  });

  return res.status(201).json({ item });
});

// PUT /api/menu/:id  — protected
router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.menuItem.findUnique({ where: { id } });

  if (!existing || existing.collegeId !== req.user!.collegeId) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const { name, description, price, emoji, category, imageUrl } = req.body as {
    name?: string;
    description?: string;
    price?: number;
    emoji?: string;
    category?: string;
    imageUrl?: string;
  };

  const item = await prisma.menuItem.update({
    where: { id },
    data: {
      ...(name && { name: name.trim() }),
      ...(description !== undefined && { description: description.trim() || `${(name ?? existing.name).trim()} freshly prepared by canteen.` }),
      ...(price !== undefined && { price: Number(price) }),
      ...(emoji !== undefined && { emoji: emoji.trim() || defaultEmojiByCategory(category ?? existing.category) }),
      ...(category && { category }),
      ...(imageUrl !== undefined && { imageUrl: imageUrl?.trim() || null }),
    },
  });

  return res.json({ item });
});

// DELETE /api/menu/:id  — protected
router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.menuItem.findUnique({ where: { id } });

  if (!existing || existing.collegeId !== req.user!.collegeId) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  // Check for references in OrderItem
  const referenced = await prisma.orderItem.findFirst({ where: { menuItemId: id } });
  if (referenced) {
    return res.status(409).json({ error: 'Cannot delete: item is referenced in orders. Mark unavailable instead.' });
  }

  await prisma.menuItem.delete({ where: { id } });
  return res.json({ message: 'Menu item deleted.' });
});

// PATCH /api/menu/:id/availability  — protected
router.patch('/:id/availability', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const existing = await prisma.menuItem.findUnique({ where: { id } });

  if (!existing || existing.collegeId !== req.user!.collegeId) {
    return res.status(404).json({ error: 'Menu item not found.' });
  }

  const { isAvailable } = req.body as { isAvailable: boolean };
  const item = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable },
  });

  return res.json({ item });
});

export default router;
