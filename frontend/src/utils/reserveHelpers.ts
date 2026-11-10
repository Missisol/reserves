import type { Reserve } from '@/@types/reserve'

/**
 * Format an ISO date string (YYYY-MM-DD) to Russian display format (DD.MM.YYYY).
 * Returns empty string for null/undefined.
 */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length !== 3) return isoDate
  const [year, month, day] = parts
  return `${day}.${month}.${year}`
}

/**
 * Format an ISO datetime string to DD.MM.YYYY.
 */
export function formatDateTime(isoDateTime: string): string {
  const datePart = isoDateTime.slice(0, 10)
  return formatDate(datePart)
}

/**
 * Format a quantity with its unit, e.g. "2 кг" or "1.5 л".
 * Strips trailing zeros from float values.
 */
export function formatQuantity(reserve: Pick<Reserve, 'quantity' | 'unit'>): string {
  const qty = reserve.quantity
  if (qty == null) return ''
  // Remove unnecessary trailing zeros: 2.0 → "2", 1.50 → "1.5"
  const formatted = Number(qty.toFixed(3)).toString()
  const unit = reserve.unit ? ` ${reserve.unit}` : ''
  return `${formatted}${unit}`
}

/**
 * Return the display label for a reserve status.
 */
export function getStatusLabel(isActive: boolean): string {
  return isActive ? 'Активна' : 'Неактивна'
}

/**
 * Return a short label for the toggle button.
 */
export function getToggleLabel(isActive: boolean): string {
  return isActive ? 'Использовано' : 'Вернуть'
}

/**
 * Convert an ISO date string to a YYYY-MM-DD format for HTML date inputs.
 */
export function toInputDate(isoDate: string | null | undefined): string {
  if (!isoDate) return ''
  return isoDate.slice(0, 10)
}
