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
      // Simulate API delay
      await new Promise((r) => setTimeout(r, 1200));

      if (game.validation_mode === 'mock') {
        const username = generateMockUsername(
          fieldValues['user_id'] || fieldValues[fields[0]?.name] || '',
          fieldValues['server_id'] || fieldValues[fields[1]?.name] || ''
        );
        setValidatedUsername(username);
        setValidated(true);
        setStep('product');
      } else if (game.validation_mode === 'disabled') {
        setValidated(true);
        setStep('product');
      } else {
        // API mode — call validation endpoint
        const res = await fetch('/api/validate-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            game_id: game.id,
            fields: fieldValues,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setValidatedUsername(data.data.username);
          setValidated(true);
          setStep('product');
        } else {
          setValidationError(data.error?.message || 'Account not found');
        }
      }
    } catch {
      setValidationError('Validation failed. Please try again.');
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
          ① Enter Account Details
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
          {game.instructions || 'Enter your in-game account details below.'}
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
                  <option value="">Select {field.label}</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-input"
                  placeholder={field.placeholder || `Enter ${field.label}`}
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
              <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Validating...</>
            ) : (
              '🔍 Validate Account'
            )}
          </button>
        )}

        {validationError && (
          <div className="validator-error" id="validation-error">
            ❌ {validationError}
            <button className="btn btn-ghost btn-sm" onClick={handleValidateAccount} style={{ marginLeft: 8 }}>
              Retry
            </button>
          </div>
        )}

        {validated && validatedUsername && (
          <div className="validator-result" id="validation-result">
            <div className="validator-result-icon">✓</div>
            <div>
              <div className="validator-result-name">{validatedUsername}</div>
              <div className="validator-result-id">
                {Object.entries(fieldValues).map(([k, v]) => `${k}: ${v}`).join(' • ')}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STEP 2: Product Selection */}
      {step !== 'account' && (
        <div className="validator-card" id="product-picker">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ② Select Package
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
        <div className="validator-card" id="payment-picker">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ③ Select Payment Method
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
        <div className="checkout-summary" id="order-summary">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>
            ④ Order Summary
          </h3>

          <div className="checkout-row">
            <span className="checkout-row-label">Game</span>
            <span className="checkout-row-value">{game.name}</span>
          </div>
          <div className="checkout-row">
            <span className="checkout-row-label">Package</span>
            <span className="checkout-row-value">{selectedProduct.name}</span>
          </div>
          {validatedUsername && (
            <div className="checkout-row">
              <span className="checkout-row-label">Account</span>
              <span className="checkout-row-value">{validatedUsername}</span>
            </div>
          )}
          <div className="checkout-row">
            <span className="checkout-row-label">Payment</span>
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
              placeholder="Promo code"
              value={promoCode}
              onChange={(e) => { setPromoCode(e.target.value.toUpperCase()); setPromoError(''); setPromoDiscount(0); }}
              id="promo-input"
              style={{ flex: 1 }}
            />
            <button className="btn btn-secondary" onClick={handleApplyPromo} id="apply-promo-btn">
              Apply
            </button>
          </div>
          {promoError && <div className="form-error">{promoError}</div>}

          <div className="checkout-row">
            <span className="checkout-row-label">Subtotal</span>
            <span className="checkout-row-value">{formatIDR(subtotal)}</span>
          </div>
          {promoDiscount > 0 && (
            <div className="checkout-row" style={{ color: 'var(--color-success)' }}>
              <span className="checkout-row-label">Discount</span>
              <span className="checkout-row-value">-{formatIDR(promoDiscount)}</span>
            </div>
          )}
          <div className="checkout-divider" />
          <div className="checkout-row checkout-total">
            <span className="checkout-row-label">Total</span>
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
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Processing...</>
            ) : (
              `Pay ${formatIDR(total)}`
            )}
          </button>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
            By proceeding, you agree to our Terms of Service
          </p>
        </div>
      )}
    </div>
  );
}
