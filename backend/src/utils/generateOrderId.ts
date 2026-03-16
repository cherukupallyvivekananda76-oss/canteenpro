import * as fs from 'fs';
import * as path from 'path';

const csvPath = path.join(__dirname, '../../orders.csv');

/**
 * Generates a unique order ID in the format CTN-YYYYMMDD-XXXX
 * Counter resets daily and is derived from existing orders in the CSV.
 */
export function generateOrderId(): string {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20260314
  const todayPrefix = `CTN-${dateStr}`;

  let counter = 1;

  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf-8');
    const lines = content.trim().split('\n').filter((line) => line.trim());
    // Count how many orders exist with today's date prefix (skip header)
    const todayOrders = lines.filter((line) => line.includes(todayPrefix));
    counter = todayOrders.length + 1;
  }

  const paddedCounter = String(counter).padStart(4, '0');
  return `${todayPrefix}-${paddedCounter}`;
}
