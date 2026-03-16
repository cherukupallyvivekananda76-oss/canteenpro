import * as fs from 'fs';
import * as path from 'path';

const csvPath = path.join(__dirname, '../../orders.csv');
const CSV_HEADER = 'order_id,student_name,roll_no,items,total_price,notes,timestamp\n';

export interface OrderRecord {
  orderId: string;
  studentName: string;
  rollNo: string;
  items: string;
  totalPrice: number;
  notes: string;
  timestamp: string;
}

/** Escapes a string value for safe inclusion in a CSV cell. */
function csvEscape(value: string): string {
  // Wrap in double-quotes and escape any existing double-quotes
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * Appends a single order record to orders.csv.
 * Creates the file with a header row if it doesn't exist yet.
 */
export function writeCsv(record: OrderRecord): void {
  if (!fs.existsSync(csvPath)) {
    fs.writeFileSync(csvPath, CSV_HEADER, 'utf-8');
  }

  const line = [
    csvEscape(record.orderId),
    csvEscape(record.studentName),
    csvEscape(record.rollNo),
    csvEscape(record.items),
    record.totalPrice.toFixed(2),
    csvEscape(record.notes),
    csvEscape(record.timestamp),
  ].join(',') + '\n';

  fs.appendFileSync(csvPath, line, 'utf-8');
}
