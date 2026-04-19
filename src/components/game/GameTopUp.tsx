'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Game, Product } from '@/types/database';
import { formatIDR, generateMockUsername } from '@/lib/utils';
import { PAYMENT_METHODS } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';

interface Props {
  game: Game;
  products: Product[];
}

type Step = 'account' | 'product' | 'payment' | 'confirm';

export function GameTopUp({ game, products }: Props) {
  const router = useRouter();
  const supabase = createClient();

  // Steps
  const [step, setStep] = useState<Step>('account');

  // Account validation
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);
  const [validatedUsername, setValidatedUsername] = useState('');
  const [validationError, setValidationError] = useState('');

  // Product selection
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Payment
  const [selectedPayment, setSelectedPayment] = useState<string>('');

  // Promo
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoError, setPromoError] = useState('');

  // Order
  const [submitting, setSubmitting] = useState(false);

  const fields = game.validation_fields || [];

  const handleValidateAccount = async () => {
    // Check required fields
    for (const field of fields) {
      if (field.required && !fieldValues[field.name]?.trim()) {
        setValidationError(`${field.label} is required`);
        return;
      }
    }

    setValidating(true);
    setValidationError('');
    setValidatedUsername('');

    try {
      const res = await fetch('/api/checker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_slug: game.slug,
          user_id: fieldValues['user_id'] || fieldValues[fields[0]?.name] || fieldValues['riot_id'] || '',
          zone_id: fieldValues['zone_id'] || fieldValues['server_id'] || fieldValues[fields[1]?.name] || '',
        }),
      });
      const data = await res.json();
      
      if (data.success && data.username) {
        setValidatedUsername(data.username);
        setValidated(true);
        setStep('product');
      } else {
        setValidationError(data.error || 'ID atau Server tidak valid.');
      }
    } catch {
      setValidationError('Koneksi ke server validasi gagal. Coba lagi.');
    } finally {
      setValidating(false);
    }
  };

  const handleApplyPromo = async () => {
    if (!promoCode.trim() || !selectedProduct) return;
    setPromoError('');

    try {
      const res = await fetch('/api/promo/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: promoCode.toUpperCase(),
          game_id: game.id,
          amount: selectedProduct.price_idr,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setPromoDiscount(data.data.discount);
      } else {
        setPromoError(data.error?.message || 'Invalid promo code');
        setPromoDiscount(0);
      }
    } catch {
      setPromoError('Failed to validate promo code');
    }
  };

  const handleSubmitOrder = async () => {
    if (!selectedProduct || !selectedPayment) return;
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          game_id: game.id,
          product_id: selectedProduct.id,
          game_user_id: fieldValues['user_id'] || fieldValues[fields[0]?.name] || '',
          game_server_id: fieldValues['server_id'] || fieldValues[fields[1]?.name] || undefined,
          game_username: validatedUsername || undefined,
          payment_method: selectedPayment,
          promo_code: promoCode || undefined,
          user_id: user?.id,
        }),
      });
      const data = await res.json();

      if (data.success) {
        router.push(`/order/${data.data.id}`);
      } else {
        alert(data.error?.message || 'Failed to create order');
      }
    } catch {
      alert('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const subtotal = selectedProduct ? selectedProduct.price_idr : 0;
  const total = subtotal - promoDiscount;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24, maxWidth: 900, margin: '0 auto' }}>
      {/* Game Header */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <img
          src={game.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name)}&size=80&background=6C5CE7&color=fff&bold=true`}
          alt={game.name}
          style={{ width: 72, height: 72, borderRadius: 'var(--radius-lg)', objectFit: 'cover' }}
        />
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{game.name}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{game.publisher}</p>
        </div>
      </div>

      {/* Step Progress */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['account', 'product', 'payment', 'confirm'] as Step[]).map((s, i) => (
          <div key={s} style={{ flex: 1, height: 4, borderRadius: 2,
            background: i <= ['account','product','payment','confirm'].indexOf(step)
              ? 'var(--color-primary)' : 'var(--border-color)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>

      {/* STEP 1: Account Validation */}
      <div className="validator-card" id="account-validator">
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>
          ① Masukkan Data Akun
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {game.instructions || 'Masukkan User ID in-game Anda di bawah ini.'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: fields.length > 1 ? '1fr 1fr' : '1fr', gap: 12 }}>
          {fields.map((field) => (
            <div className="form-group" key={field.name}>
              <label className="form-label">{field.label} {field.required && <span style={{ color: 'var(--color-error)' }}>*</span>}</label>
              {field.type === 'select' && field.options ? (
                <select
                  className="form-select"
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => {
                    setFieldValues({ ...fieldValues, [field.name]: e.target.value });
                    setValidated(false);
                  }}
                  id={`field-${field.name}`}
                >
                  <option value="">Pilih {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder={field.placeholder || `Masukkan ${field.label}`}
                  value={fieldValues[field.name] || ''}
                  onChange={(e) => {
                    setFieldValues({ ...fieldValues, [field.name]: e.target.value });
                    setValidated(false);
                  }}
                  id={`field-${field.name}`}
                />
              )}
            </div>
          ))}
        </div>

        {!validated && (
          <button
            className="btn btn-primary"
            onClick={handleValidateAccount}
            disabled={validating}
            id="validate-btn"
            style={{ marginTop: 8 }}
          >
            {validating ? (
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Mengecek ID...</>
            ) : (
              '🔍 Cek Nickname'
            )}
          </button>
        )}

        {validationError && (
          <div className="validator-error" id="validation-error">
            ❌ {validationError}
            <button className="btn btn-ghost btn-sm" onClick={handleValidateAccount} style={{ marginLeft: 8 }}>
              Coba Lagi
            </button>
          </div>
        )}

        {validated && validatedUsername && (
          <div className="validator-result" id="validation-result">
            <div className="validator-result-icon">✓</div>
            <div>
              <div className="validator-result-name">{validatedUsername}</div>
              <div className="validator-result-id">
                {fieldValues['user_id'] || fieldValues[fields[0]?.name] || fieldValues['riot_id']} 
                {fieldValues['zone_id'] || fieldValues['server_id'] || fieldValues[fields[1]?.name] ? ` (${fieldValues['zone_id'] || fieldValues['server_id'] || fieldValues[fields[1]?.name]})` : ''}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Product Selection */}
      {step !== 'account' && (
        <div className="validator-card scale-in" id="product-selection">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ② Pilih Nominal Top Up
          </h3>
          <div className="product-grid">
            {products.map((product) => (
              <div
                key={product.id}
                className={`product-card ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedProduct(product);
                  setPromoDiscount(0);
                  if (step === 'product') setStep('payment');
                }}
                id={`product-${product.id}`}
              >
                {product.is_popular && <div className="product-badge-popular">Popular</div>}
                <div className="product-denomination">{product.denomination}</div>
                <div className="product-unit">{product.unit}</div>
                <div className="product-price">{formatIDR(product.price_idr)}</div>
                {product.original_price_idr && (
                  <div className="product-original-price">{formatIDR(product.original_price_idr)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Payment Method */}
      {(step === 'payment' || step === 'confirm') && selectedProduct && (
        <div className="validator-card scale-in" id="payment-picker" style={{ animationDelay: '0.1s' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ③ Pilih Pembayaran
          </h3>
          <div className="payment-methods">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`payment-method-card ${selectedPayment === method.id ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPayment(method.id);
                  setStep('confirm');
                }}
                id={`payment-${method.id}`}
              >
                <span style={{ fontSize: '1.5rem' }}>{method.icon}</span>
                <span className="payment-method-name">{method.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Order Summary & Confirm */}
      {step === 'confirm' && selectedProduct && selectedPayment && (
        <div className="checkout-summary scale-in" id="order-summary" style={{ position: 'sticky', bottom: 20, zIndex: 10, animationDelay: '0.2s' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ④ Ringkasan Pesanan
          </h3>

          <div className="checkout-row">
            <span className="checkout-row-label">Game</span>
            <span className="checkout-row-value">{game.name}</span>
          </div>
          <div className="checkout-row">
            <span className="checkout-row-label">Item</span>
            <span className="checkout-row-value">{selectedProduct.name}</span>
          </div>
          {validatedUsername && (
            <div className="checkout-row">
              <span className="checkout-row-label">Nick Tujuan</span>
              <span className="checkout-row-value">{validatedUsername}</span>
            </div>
          )}
          <div className="checkout-row">
            <span className="checkout-row-label">Metode</span>
            <span className="checkout-row-value">
              {PAYMENT_METHODS.find((m) => m.id === selectedPayment)?.name}
            </span>
          </div>

          <div className="checkout-divider" />

          {/* Promo Code */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              className="form-input"
              placeholder="Masukkan Kode Promo"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoDiscount(0); }}
              id="promo-input"
              style={{ flex: 1 }}
            />
            <button className="btn btn-secondary" onClick={handleApplyPromo} id="apply-promo-btn">
              Klaim
            </button>
          </div>
          {promoError && <div className="form-error">{promoError}</div>}

          <div className="checkout-row">
            <span className="checkout-row-label">Subtotal</span>
            <span className="checkout-row-value">{formatIDR(subtotal)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="checkout-row" style={{ color: 'var(--color-success)' }}>
              <span className="checkout-row-label">Diskon Promo</span>
              <span className="checkout-row-value">-{formatIDR(promoDiscount)}</span>
            </div>
          )}
          <div className="checkout-divider" />
          <div className="checkout-row checkout-total">
            <span className="checkout-row-label">Total Pembayaran</span>
            <span className="checkout-row-value">{formatIDR(total)}</span>
          </div>

          <button
            className="btn btn-primary btn-lg"
            onClick={handleSubmitOrder}
            disabled={submitting}
            id="submit-order-btn"
            style={{ width: '100%', marginTop: 16 }}
          >
            {submitting ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Memproses...</>
            ) : (
              `Bayar Sekarang ${formatIDR(total)}`
            )}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
            Dengan memproses, Anda menyetujui Syarat & Ketentuan kami
          </p>
        </div>
      )}
    </div>
  );
}
