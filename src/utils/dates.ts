/**
 * Date utilities for transactions, recurring subscriptions, and weekly/monthly cuts.
 */

export function formatDateLabel(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return 'Hoy';
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) {
    return 'Ayer';
  }

  const day = date.getDate();
  const monthNames = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];
  const month = monthNames[date.getMonth()];

  return `${day} ${month}`;
}

export function getDaysRemainingInMonth(): number {
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(1, daysInMonth - now.getDate() + 1);
}

export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}
