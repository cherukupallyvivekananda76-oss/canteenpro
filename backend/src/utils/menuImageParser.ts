export type ParsedMenuItem = {
  name: string;
  price: number;
  category: 'meal' | 'snack' | 'beverage';
  emoji: string;
};

const INVALID_NAME_TOKENS = [
  'PLU',
  'BASE PRICE',
  'GST',
  'INCL GST',
  'AWWAS FOOD LLP',
  'KIOSK FOOD MENU',
  'OPTIONAL',
  'MANAGER',
  'MRP',
];

const MENU_SECTION_RULES: Array<{ keywords: string[]; category: ParsedMenuItem['category'] }> = [
  { keywords: ['BEVERAGES'], category: 'beverage' },
  { keywords: ['SNACKS', 'BITES', 'PARATA', 'SANDWICH', 'NOODLE'], category: 'snack' },
  { keywords: ['RICE', 'DOSA', 'CURRY', 'MULTI CUISIN', 'PARTICULARS'], category: 'meal' },
];

const NAME_EMOJI_RULES: Array<{ keywords: string[]; emoji: string }> = [
  { keywords: ['TEA'], emoji: '🍵' },
  { keywords: ['COFFEE'], emoji: '☕' },
  { keywords: ['WATER', 'PEPSI', 'MOUNTAIN DEW', 'TROPICANA'], emoji: '🥤' },
  { keywords: ['DOSA'], emoji: '🥞' },
  { keywords: ['PARATA', 'ROTI', 'PHULKA'], emoji: '🫓' },
  { keywords: ['RICE', 'FRIED RICE'], emoji: '🍚' },
  { keywords: ['NOODLE'], emoji: '🍜' },
  { keywords: ['SANDWICH'], emoji: '🥪' },
  { keywords: ['PANEER', 'MANCHURIAN', 'CHILLI'], emoji: '🍲' },
  { keywords: ['CHICKEN', 'EGG'], emoji: '🍗' },
];

function normalizeText(line: string): string {
  return line
    .replace(/[|]/g, ' ')
    .replace(/[^a-zA-Z0-9.%/\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCategoryFromSection(line: string, current: ParsedMenuItem['category']): ParsedMenuItem['category'] {
  const upper = line.toUpperCase();

  for (const rule of MENU_SECTION_RULES) {
    if (rule.keywords.some((keyword) => upper.includes(keyword))) {
      return rule.category;
    }
  }

  return current;
}

function inferEmoji(name: string, category: ParsedMenuItem['category']): string {
  const upper = name.toUpperCase();

  for (const rule of NAME_EMOJI_RULES) {
    if (rule.keywords.some((keyword) => upper.includes(keyword))) {
      return rule.emoji;
    }
  }

  if (category === 'beverage') return '🥤';
  if (category === 'snack') return '🥪';
  return '🍽️';
}

function shouldSkipLine(line: string): boolean {
  if (!line || line.length < 4) return true;

  const upper = line.toUpperCase();
  if (INVALID_NAME_TOKENS.some((token) => upper.includes(token))) return true;

  if (/^\d+[./-]\d+[./-]\d+$/.test(line)) return true;

  return false;
}

function titleCase(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function stripLeadingCategoryWords(name: string): string {
  return name
    .replace(/^(beverages?|drinks?)\s+/i, '')
    .replace(/^(meals?)\s+/i, '')
    .replace(/^(snacks?)\s+/i, '')
    .trim();
}

function parseLine(line: string, category: ParsedMenuItem['category']): ParsedMenuItem | null {
  const prices = line.match(/\d{1,3}(?:\.\d{1,2})?/g);
  if (!prices || prices.length === 0) return null;

  const maybePrice = Number(prices[prices.length - 1]);
  if (!Number.isFinite(maybePrice) || maybePrice < 5 || maybePrice > 1000) {
    return null;
  }

  const withoutTrailingPrices = line.replace(/(\s+\d{1,3}(?:\.\d{1,2})?)+\s*$/g, '').trim();
  const withoutPlu = withoutTrailingPrices.replace(/^\d+\s+/, '').trim();
  const cleaned = withoutPlu.replace(/\s{2,}/g, ' ');

  if (!cleaned || cleaned.length < 3) return null;
  if (!/[a-zA-Z]/.test(cleaned)) return null;

  const upper = cleaned.toUpperCase();
  if (INVALID_NAME_TOKENS.some((token) => upper.includes(token))) return null;

  const name = stripLeadingCategoryWords(titleCase(cleaned));
  if (!name || name.length < 2) return null;
  const emoji = inferEmoji(name, category);

  return {
    name,
    price: Number(maybePrice.toFixed(2)),
    category,
    emoji,
  };
}

export function parseMenuItemsFromText(text: string): ParsedMenuItem[] {
  const lines = text
    .split('\n')
    .map(normalizeText)
    .filter(Boolean);

  let currentCategory: ParsedMenuItem['category'] = 'meal';
  const parsed: ParsedMenuItem[] = [];
  const seen = new Set<string>();

  for (const line of lines) {
    currentCategory = inferCategoryFromSection(line, currentCategory);

    if (shouldSkipLine(line)) {
      continue;
    }

    const item = parseLine(line, currentCategory);
    if (!item) {
      continue;
    }

    const dedupeKey = `${item.name.toLowerCase()}::${item.price}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    parsed.push(item);
  }

  return parsed;
}

export function parseMenuItemsFromOcrText(text: string): ParsedMenuItem[] {
  return parseMenuItemsFromText(text);
}

export function parseMenuItemsFromRows(rows: string[][]): ParsedMenuItem[] {
  const text = rows
    .map((row) => row.map((cell) => normalizeText(cell)).filter(Boolean).join(' '))
    .filter(Boolean)
    .join('\n');

  return parseMenuItemsFromText(text);
}