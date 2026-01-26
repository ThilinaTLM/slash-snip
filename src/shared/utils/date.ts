/**
 * Date formatting utility
 * Supports common date/time format tokens
 */

type TokenReplacer = (date: Date) => string;

const TOKEN_REPLACERS: Record<string, TokenReplacer> = {
  // Year
  YYYY: (d) => d.getFullYear().toString(),
  YY: (d) => d.getFullYear().toString().slice(-2),

  // Month
  MM: (d) => (d.getMonth() + 1).toString().padStart(2, '0'),
  M: (d) => (d.getMonth() + 1).toString(),

  // Day
  DD: (d) => d.getDate().toString().padStart(2, '0'),
  D: (d) => d.getDate().toString(),

  // Hour (24-hour)
  HH: (d) => d.getHours().toString().padStart(2, '0'),
  H: (d) => d.getHours().toString(),

  // Hour (12-hour)
  hh: (d) => {
    const h = d.getHours() % 12;
    return (h === 0 ? 12 : h).toString().padStart(2, '0');
  },
  h: (d) => {
    const h = d.getHours() % 12;
    return (h === 0 ? 12 : h).toString();
  },

  // Minutes
  mm: (d) => d.getMinutes().toString().padStart(2, '0'),
  m: (d) => d.getMinutes().toString(),

  // Seconds
  ss: (d) => d.getSeconds().toString().padStart(2, '0'),
  s: (d) => d.getSeconds().toString(),

  // AM/PM
  A: (d) => (d.getHours() >= 12 ? 'PM' : 'AM'),
  a: (d) => (d.getHours() >= 12 ? 'pm' : 'am'),
};

// Sort tokens by length (longest first) to avoid partial matches
const SORTED_TOKENS = Object.keys(TOKEN_REPLACERS).sort((a, b) => b.length - a.length);

/**
 * Format a date using the specified format string
 * @param date - The date to format
 * @param format - Format string with tokens (YYYY, MM, DD, HH, hh, mm, ss, A, a)
 * @returns Formatted date string
 *
 * @example
 * formatDate(new Date(), 'YYYY-MM-DD') // "2024-01-15"
 * formatDate(new Date(), 'HH:mm:ss') // "14:30:45"
 * formatDate(new Date(), 'hh:mm A') // "02:30 PM"
 */
export function formatDate(date: Date, format: string): string {
  let result = format;

  for (const token of SORTED_TOKENS) {
    if (result.includes(token)) {
      const replacer = TOKEN_REPLACERS[token];
      result = result.split(token).join(replacer(date));
    }
  }

  return result;
}

/**
 * Default format for date placeholder
 */
export const DEFAULT_DATE_FORMAT = 'YYYY-MM-DD';

/**
 * Default format for time placeholder
 */
export const DEFAULT_TIME_FORMAT = 'HH:mm';

/**
 * Default format for datetime placeholder
 */
export const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm';
