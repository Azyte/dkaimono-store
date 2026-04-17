'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Game } from '@/types/database';
import { CATEGORY_LABELS } from '@/lib/constants';

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
          <h2 className="section-title">🎮 Top Up Games</h2>
          <p className="section-subtitle">Choose your game and top up instantly</p>
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
            {CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </div>

      {/* Search (mobile) */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          className="form-input"
          placeholder="🔍 Search games..."
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
          <div className="empty-state-title">No games found</div>
          <div className="empty-state-text">Try a different search or category</div>
        </div>
      ) : (
        <div className="game-grid">
          {filtered.map((game) => (
            <Link href={`/games/${game.slug}`} key={game.id} id={`game-card-${game.slug}`}>
              <div className="game-card card-interactive">
                {game.is_popular && <span className="game-card-badge badge-popular">🔥 Popular</span>}
                {game.is_new && <span className="game-card-badge badge-new">✨ New</span>}
                <img
                  src={game.icon_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(game.name)}&size=200&background=6C5CE7&color=fff&bold=true`}
                  alt={game.name}
                  className="game-card-image"
                  loading="lazy"
                />
                <div className="game-card-body">
                  <div className="game-card-name">{game.name}</div>
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
