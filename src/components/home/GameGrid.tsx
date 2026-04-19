'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Game } from '@/types/database';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/constants';

interface Props {
  games: Game[];
}

export function GameGrid({ games }: Props) {
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const categories = ['all', ...Array.from(new Set(games.map((g) => g.category)))];

  const filtered = games.filter((game) => {
    const matchCat = category === 'all' || game.category === category;
    const matchSearch = !search || game.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <section>
      <div className="section-header">
        <div>
          <h2 className="section-title">🎮 Top Up Game Favoritmu</h2>
          <p className="section-subtitle">Pilih game dan top up sekarang — termurah, tercepat, terpercaya</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-tab ${cat === category ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
            id={`category-tab-${cat}`}
          >
            {CATEGORY_ICONS[cat] ? `${CATEGORY_ICONS[cat]} ` : ''}{CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Cari game..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="game-search-input"
          style={{ maxWidth: 400 }}
        />
      </div>

      {/* Game Grid */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🎮</div>
          <div className="empty-state-title">Game tidak ditemukan</div>
          <div className="empty-state-text">Coba kata kunci lain atau kategori berbeda</div>
        </div>
      ) : (
        <div className="game-grid">
          {filtered.map((game) => (
            <Link href={`/games/${game.slug}`} key={game.id} id={`game-card-${game.slug}`}>
              <div className="game-card card-interactive">
                {game.is_popular && <span className="game-card-badge badge-popular">🔥 Populer</span>}
                {game.is_new && <span className="game-card-badge badge-new">✨ Baru</span>}
                <GameCardImage name={game.name} iconUrl={game.icon_url} />
                <div className="game-card-overlay"></div>
                <div className="game-card-body">
                  <div className="game-card-name" title={game.name}>{game.name}</div>
                  <div className="game-card-publisher">{game.publisher}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

/** Image component with fallback on error */
function GameCardImage({ name, iconUrl }: { name: string; iconUrl: string | null }) {
  const fallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=400&background=6C5CE7&color=fff&bold=true&font-size=0.33`;
  const [src, setSrc] = useState(iconUrl || fallback);

  return (
    <img
      src={src}
      alt={name}
      className="game-card-image"
      loading="lazy"
      onError={() => setSrc(fallback)}
    />
  );
}
