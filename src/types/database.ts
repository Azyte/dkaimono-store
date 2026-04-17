/* ============================================
   Database Types for dKaimono
   Manually defined to match our Supabase schema
   ============================================ */

export type UserRole = 'user' | 'admin';
export type GameCategory = 'mobile_game' | 'pc_game' | 'console_game' | 'voucher' | 'streaming';
export type ValidationMode = 'mock' | 'api' | 'disabled';
export type OrderStatus = 'pending' | 'awaiting_payment' | 'paid' | 'processing' | 'completed' | 'failed' | 'refunded' | 'expired' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'expired' | 'refunded';
export type TransactionType = 'payment' | 'refund' | 'adjustment';
export type PaymentMethod = 'dana' | 'ovo' | 'gopay' | 'shopeepay' | 'qris' | 'bank_transfer' | 'convenience_store' | 'balance' | 'mock';
export type PromoType = 'percentage' | 'fixed_amount';
export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'promo' | 'order';

export interface ValidationField {
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'select' | 'number';
  required: boolean;
  options?: { value: string; label: string }[];
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  referral_code: string | null;
  referred_by: string | null;
  balance_idr: number;
  total_spent_idr: number;
  order_count: number;
  is_banned: boolean;
  ban_reason: string | null;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  publisher: string;
  description: string | null;
  instructions: string | null;
  icon_url: string | null;
  banner_url: string | null;
  cover_url: string | null;
  category: GameCategory;
  validation_fields: ValidationField[];
  validation_mode: ValidationMode;
  validation_api_url: string | null;
  supplier_code: string | null;
  supplier_api_url: string | null;
  is_popular: boolean;
  is_new: boolean;
  is_active: boolean;
  sort_order: number;
  total_orders: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  game_id: string;
  name: string;
  description: string | null;
  denomination: number;
  unit: string;
  price_idr: number;
  original_price_idr: number | null;
  cost_price_idr: number | null;
  supplier_sku: string | null;
  is_popular: boolean;
  is_active: boolean;
  sort_order: number;
  total_sold: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  game_id: string;
  product_id: string;
  game_user_id: string;
  game_server_id: string | null;
  game_username: string | null;
  quantity: number;
  unit_price_idr: number;
  subtotal_idr: number;
  discount_idr: number;
  total_idr: number;
  promo_id: string | null;
  promo_code: string | null;
  status: OrderStatus;
  payment_method: PaymentMethod | null;
  payment_url: string | null;
  supplier_ref: string | null;
  supplier_status: string | null;
  supplier_response: Record<string, unknown> | null;
  retry_count: number;
  max_retries: number;
  last_retry_at: string | null;
  expires_at: string | null;
  paid_at: string | null;
  processing_at: string | null;
  completed_at: string | null;
  failed_at: string | null;
  cancelled_at: string | null;
  ip_address: string | null;
  user_agent: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  // Joined
  game?: Game;
  product?: Product;
}

export interface Transaction {
  id: string;
  order_id: string;
  type: TransactionType;
  amount_idr: number;
  payment_method: PaymentMethod;
  payment_gateway: string;
  gateway_ref: string | null;
  gateway_response: Record<string, unknown> | null;
  status: PaymentStatus;
  idempotency_key: string;
  verified_at: string | null;
  created_at: string;
}

export interface Promo {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: PromoType;
  value: number;
  min_order_idr: number;
  max_discount_idr: number | null;
  game_id: string | null;
  usage_limit: number | null;
  per_user_limit: number;
  used_count: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string;
  link_url: string | null;
  game_id: string | null;
  sort_order: number;
  is_active: boolean;
  starts_at: string;
  expires_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Supabase Database type helper
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      games: { Row: Game; Insert: Partial<Game>; Update: Partial<Game> };
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> };
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> };
      transactions: { Row: Transaction; Insert: Partial<Transaction>; Update: Partial<Transaction> };
      promos: { Row: Promo; Insert: Partial<Promo>; Update: Partial<Promo> };
      banners: { Row: Banner; Insert: Partial<Banner>; Update: Partial<Banner> };
      notifications: { Row: Notification; Insert: Partial<Notification>; Update: Partial<Notification> };
    };
  };
}
