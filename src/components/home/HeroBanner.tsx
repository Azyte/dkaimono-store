'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Banner } from '@/types/database';

interface Props {
  banners: Banner[];
}

export function HeroBanner({ banners }: Props) {
  const [active, setActive] = useState(0);

  const next = useCallback(() => {
    setActive((prev) => (prev + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next, banners.length]);

  if (banners.length === 0) {
    return (
      <div className="hero-banner" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
        <div className="hero-overlay">
          <h1 className="hero-title">Top Up Games Instantly</h1>
          <p className="hero-subtitle">Cheapest prices, fastest delivery. Your trusted game top-up platform.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-banner" id="hero-banner">
      {banners.map((banner, i) => (
        <div key={banner.id} className={`hero-slide ${i === active ? 'active' : ''}`}>
          <img
            src={banner.image_url}
            alt={banner.title}
            className="hero-slide-img"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
          <div className="hero-overlay">
            <h2 className="hero-title">{banner.title}</h2>
            {banner.subtitle && <p className="hero-subtitle">{banner.subtitle}</p>}
            {banner.link_url && (
              <Link href={banner.link_url} className="btn btn-primary" style={{ marginTop: 16, width: 'fit-content' }}>
                Top Up Now →
              </Link>
            )}
          </div>
        </div>
      ))}
      {banners.length > 1 && (
        <div className="hero-dots">
          {banners.map((_, i) => (
            <button
              key={i}
              className={`hero-dot ${i === active ? 'active' : ''}`}
              onClick={() => setActive(i)}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
