import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Convert a military/24-hour time window string to AM/PM format.
 * Handles formats like "09:00 – 09:45", "13:30 – 14:15", etc.
 * @param {string} militaryStr - The time window string in 24-hour format
 * @returns {string} The time window in 12-hour AM/PM format
 */
export function formatTimeWindow(militaryStr) {
  if (!militaryStr) return "";
  return militaryStr.replace(/(\d{1,2}):(\d{2})/g, (_match, h, m) => {
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
  });
}