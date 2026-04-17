export const SITE_NAME = 'dKaimono';
export const SITE_DESCRIPTION = 'Top up game credits instantly. Cheapest, fastest, and most reliable digital top-up platform in Indonesia.';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://dkaimono.com';

export const PAYMENT_METHODS = [
  { id: 'qris', name: 'QRIS', icon: '📱', description: 'Scan QR code with any e-wallet' },
  { id: 'dana', name: 'Dana', icon: '💙', description: 'Pay with Dana e-wallet' },
  { id: 'ovo', name: 'OVO', icon: '💜', description: 'Pay with OVO e-wallet' },
  { id: 'gopay', name: 'GoPay', icon: '💚', description: 'Pay with GoPay e-wallet' },
  { id: 'shopeepay', name: 'ShopeePay', icon: '🧡', description: 'Pay with ShopeePay' },
  { id: 'bank_transfer', name: 'Bank Transfer', icon: '🏦', description: 'Transfer via virtual account' },
] as const;

export const ORDER_EXPIRY_MINUTES = 60;

export const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Games',
  mobile_game: 'Mobile Games',
  pc_game: 'PC Games',
  console_game: 'Console',
  voucher: 'Vouchers',
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
