export const SITE_NAME = 'dKaimono';
export const SITE_DESCRIPTION = 'Top up game instan harga termurah. Platform top-up terpercaya, tercepat, dan paling aman di Indonesia.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dkaimono.com';

export const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS', icon: '📱', description: 'Scan QR pakai e-wallet apapun' },
  { id: 'dana', name: 'Dana', icon: '💙', description: 'Bayar pakai Dana' },
  { id: 'ovo', name: 'OVO', icon: '💜', description: 'Bayar pakai OVO' },
  { id: 'gopay', name: 'GoPay', icon: '💚', description: 'Bayar pakai GoPay' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🧡', description: 'Bayar pakai ShopeePay' },
  { id: 'bank_transfer', name: 'Transfer Bank', icon: '🏦', description: 'Transfer via Virtual Account' },
] as const;

export const ORDER_EXPIRY_MINUTES = 60;

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'Semua Game',
  mobile_game: 'Mobile Games',
  pc_game: 'PC Games',
  console_game: 'Console',
  voucher: 'Voucher',
  streaming: 'Streaming',
};

export const CATEGORY_ICONS: Record<string, string> = {
  all: '🎮',
  mobile_game: '📱',
  pc_game: '🖥️',
  console_game: '🎯',
  voucher: '🎫',
  streaming: '📺',
};
