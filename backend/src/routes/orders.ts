import { Router, Request, Response } from 'express';
import { generateOrderId } from '../utils/generateOrderId';
import { writeCsv } from '../utils/writeCsv';

const router = Router();

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface PlaceOrderBody {
  studentName: string;
  rollNo: string;
  items: OrderItem[];
  notes?: string;
}

// POST /api/orders
router.post('/', (req: Request, res: Response) => {
  const { studentName, rollNo, items, notes } = req.body as PlaceOrderBody;

  // Validation
  if (!studentName || typeof studentName !== 'string' || !studentName.trim()) {
    return res.status(400).json({ error: 'studentName is required.' });
  }
  if (!rollNo || typeof rollNo !== 'string' || !rollNo.trim()) {
    return res.status(400).json({ error: 'rollNo is required.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'At least one item is required.' });
  }

  const orderId = generateOrderId();
  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const timestamp = new Date().toISOString();

  // Human-readable items string for CSV (e.g. "Veg Thali x2; Tea x1")
  const itemsSummary = items
    .map((i) => `${i.name} x${i.quantity}`)
    .join('; ');

  writeCsv({
    orderId,
    studentName: studentName.trim(),
    rollNo: rollNo.trim(),
    items: itemsSummary,
    totalPrice,
    notes: notes?.trim() ?? '',
    timestamp,
  });

  console.log(`[ORDER] ${orderId} | ${studentName} (${rollNo}) | ₹${totalPrice}`);

  return res.status(201).json({ orderId, totalPrice });
});

export default router;
