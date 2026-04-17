/** Format IDR currency */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format relative time */
export function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Format date */
export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Status label mapping */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pending',
    awaiting_payment: 'Awaiting Payment',
    paid: 'Paid',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
    expired: 'Expired',
    cancelled: 'Cancelled',
    success: 'Success',
  };
  return labels[status] || status;
}

/** Payment method labels */
export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    dana: 'Dana',
    ovo: 'OVO',
    gopay: 'GoPay',
    shopeepay: 'ShopeePay',
    qris: 'QRIS',
    bank_transfer: 'Bank Transfer',
    convenience_store: 'Convenience Store',
    balance: 'Balance',
    mock: 'Test Payment',
  };
  return labels[method] || method;
}

/** Payment method icons (emoji fallback) */
export function getPaymentMethodIcon(method: string): string {
  const icons: Record<string, string> = {
    dana: '💙',
    ovo: '💜',
    gopay: '💚',
    shopeepay: '🧡',
    qris: '📱',
    bank_transfer: '🏦',
    convenience_store: '🏪',
    balance: '💰',
    mock: '🧪',
  };
  return icons[method] || '💳';
}

/** Generate mock username from game ID (deterministic) */
export function generateMockUsername(gameUserId: string, gameServerId?: string): string {
  const combined = gameUserId + (gameServerId || '');
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit int
  }
  
  const prefixes = ['Player', 'Gamer', 'Hero', 'Legend', 'Master', 'Pro', 'Star', 'King', 'Shadow', 'Storm'];
  const suffixes = ['X', 'YT', 'GG', 'ML', 'FF', 'VIP', 'ID', 'JP', 'KR', ''];
  
  const absHash = Math.abs(hash);
  const prefix = prefixes[absHash % prefixes.length];
  const suffix = suffixes[(absHash >> 4) % suffixes.length];
  const num = (absHash % 9000) + 1000;
  
  return `${prefix}${suffix}${num}`;
}

/** Debounce helper */
export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/** Calculate discount */
export function calculateDiscount(
  subtotal: number,
  promoType: 'percentage' | 'fixed_amount',
  promoValue: number,
  maxDiscount?: number | null
): number {
  let discount = 0;
  if (promoType === 'percentage') {
    discount = Math.floor(subtotal * promoValue / 100);
    if (maxDiscount && discount > maxDiscount) {
      discount = maxDiscount;
    }
  } else {
    discount = promoValue;
  }
  return Math.min(discount, subtotal);
}

/** Clamp number */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
