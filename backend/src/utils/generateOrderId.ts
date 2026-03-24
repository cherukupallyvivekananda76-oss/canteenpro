import prisma from '../db/prisma';

/**
 * Generates a unique order ID in the format <COLLEGE_CODE>-YYYYMMDD-XXXX
 * Counter resets daily and is derived from existing orders in the DB.
 */
export async function generateOrderId(collegeId: number, collegeCode: string): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, ''); // e.g. 20260314

  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  const count = await prisma.order.count({
    where: {
      collegeId,
      createdAt: { gte: start, lt: end },
    },
  });

  const paddedCounter = String(count + 1).padStart(4, '0');
  return `${collegeCode}-${dateStr}-${paddedCounter}`;
}
