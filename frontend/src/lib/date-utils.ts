import { format, parseISO } from 'date-fns'

/**
 * Format date for display (e.g., "Jan 15, 2024")
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string or "—" if invalid/undefined
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—'
  try {
    return format(new Date(dateString), 'MMM d, yyyy')
  } catch {
    return dateString
  }
}

/**
 * Format date for HTML date input (YYYY-MM-DD)
 * @param dateString - ISO date string or undefined
 * @returns Formatted date string for input or empty string if invalid/undefined
 */
export function formatDateForInput(dateString: string | undefined): string {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    // Check if date is valid
    if (isNaN(date.getTime())) return ''
    // Return YYYY-MM-DD format
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  } catch {
    return ''
  }
}

/**
 * Format timestamp for display with time (e.g., "Jan 15, 2024 2:30 PM")
 * Handles timezone-aware and naive timestamps
 * @param timestamp - ISO timestamp string
 * @returns Formatted timestamp string or original string if invalid
 */
export function formatTimestamp(timestamp: string): string {
  try {
    // Parse the ISO timestamp - parseISO handles timezone-aware dates correctly
    // If the timestamp has timezone info, it will be parsed correctly
    // If it's naive (no timezone), parseISO treats it as local time
    // To ensure UTC timestamps are handled correctly, check if it needs timezone info
    let date: Date
    
    // If timestamp doesn't have timezone indicator (Z or +/- offset), 
    // assume it's UTC and append Z
    if (timestamp && !timestamp.includes('Z') && !timestamp.match(/[+-]\d{2}:\d{2}$/)) {
      // Treat naive datetime as UTC
      date = parseISO(timestamp + 'Z')
    } else {
      date = parseISO(timestamp)
    }
    
    // format uses the date's local time representation automatically
    return format(date, 'MMM d, yyyy h:mm a')
  } catch {
    return timestamp
  }
}
