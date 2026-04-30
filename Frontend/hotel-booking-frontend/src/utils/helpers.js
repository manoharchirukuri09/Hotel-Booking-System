// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Format a date string or Date object to "15 Jun 2025"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format a datetime string to "15 Jun 2025, 10:30 AM"
 */
export function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

/**
 * Calculate number of nights between two date strings
 */
export function calcNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(0, Math.ceil(
    (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60 * 24)
  ));
}

/**
 * Get today's date as YYYY-MM-DD string
 */
export function todayStr() {
  return new Date().toISOString().split('T')[0];
}

/**
 * Get tomorrow's date as YYYY-MM-DD string
 */
export function tomorrowStr() {
  return new Date(Date.now() + 86400000).toISOString().split('T')[0];
}

// ── Currency helpers ──────────────────────────────────────────────────────────

/**
 * Format a number as Indian Rupee: ₹1,23,456
 */
export function formatINR(amount) {
  if (amount == null) return '—';
  return '₹' + Number(amount).toLocaleString('en-IN');
}

// ── Booking status helpers ────────────────────────────────────────────────────

export const STATUS_BADGE = {
  CONFIRMED: 'badge-success',
  PENDING:   'badge-warning',
  CANCELLED: 'badge-danger',
  COMPLETED: 'badge-info',
  NO_SHOW:   'badge-danger',
};

export function getStatusClass(status) {
  return STATUS_BADGE[status] || 'badge-info';
}

// ── String helpers ────────────────────────────────────────────────────────────

/**
 * Split comma-separated amenities/facilities into an array
 */
export function parseCommaList(str) {
  if (Array.isArray(str)) return str.filter(Boolean);
  if (!str) return [];
  return str.split(',').map(s => s.trim()).filter(Boolean);
}

/**
 * Get user initials from full name: "Ravi Kumar" → "RK"
 */
export function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * Truncate text to max length with ellipsis
 */
export function truncate(text, maxLength = 80) {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
}
