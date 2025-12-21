// src/utils/formatDate.ts
// Centralized date formatting utility
// Safe for API strings, Date objects, and undefined values

import { format, isValid, parseISO } from 'date-fns';

type DateInput = string | number | Date | null | undefined;

/**
 * Format a date into a readable string.
 *
 * @param date - ISO string, timestamp, or Date object
 * @param pattern - date-fns format pattern (default: 'PP')
 * @returns formatted date or '-' if invalid
 */
export function formatDate(
  date: DateInput,
  pattern: string = 'PP'
): string {
  if (!date) return '-';

  let parsedDate: Date;

  if (date instanceof Date) {
    parsedDate = date;
  } else if (typeof date === 'string') {
    parsedDate = parseISO(date);
  } else {
    parsedDate = new Date(date);
  }

  if (!isValid(parsedDate)) return '-';

  return format(parsedDate, pattern);
}
