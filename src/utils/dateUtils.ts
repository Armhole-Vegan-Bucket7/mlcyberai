
import { format, subDays, subHours, subWeeks, subMonths, addYears, addMonths } from 'date-fns';

/**
 * Generates a recent date string based on the specified offset from March 2025
 * @param daysAgo Number of days ago (can be fractional for partial days)
 * @param formatStr Optional date format string
 * @returns Formatted date string
 */
export const getRecentDateString = (daysAgo: number, formatStr: string = 'yyyy-MM-dd'): string => {
  // Base date: March 2025
  const baseDate = addYears(addMonths(new Date(), 10), 1); // Current date + 10 months + 1 year points to March 2025
  const date = subDays(baseDate, daysAgo);
  return format(date, formatStr);
};

/**
 * Generates a recent ISO timestamp based on a specified offset from March 2025
 * @param daysAgo Number of days ago
 * @param hoursAgo Additional hours ago
 * @returns ISO timestamp string
 */
export const getRecentTimestamp = (daysAgo: number, hoursAgo: number = 0): string => {
  // Base date: March 2025
  const baseDate = addYears(addMonths(new Date(), 10), 1); // Current date + 10 months + 1 year points to March 2025
  const date = subHours(subDays(baseDate, daysAgo), hoursAgo);
  return date.toISOString();
};

/**
 * Generates an array of sequential dates from a start point within March 2025
 * @param count Number of data points to generate
 * @param intervalDays Days between each data point
 * @param formatStr Optional date format string
 * @returns Array of formatted date strings
 */
export const generateDateSequence = (
  count: number, 
  intervalDays: number = 1, 
  formatStr: string = 'yyyy-MM-dd'
): string[] => {
  // Base date: March 2025
  const baseDate = addYears(addMonths(new Date(), 10), 1); // Current date + 10 months + 1 year points to March 2025
  return Array.from({ length: count }, (_, i) => {
    const date = subDays(baseDate, (count - 1 - i) * intervalDays);
    return format(date, formatStr);
  });
};

/**
 * Formats a timestamp string for display
 * @param timestamp ISO timestamp string
 * @param formatStr Date format string
 * @returns Formatted date string
 */
export const formatTimestamp = (timestamp: string, formatStr: string = 'yyyy-MM-dd HH:mm:ss'): string => {
  return format(new Date(timestamp), formatStr);
};
