import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { GameTopUp } from '@/components/game/GameTopUp';
import type { Game, Product } from '@/types/database';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: game } = await supabase
    .from('games')
    .select('name, description')
    .eq('slug', slug)
    .single();

  if (!game) return { title: 'Game Not Found' };

  return {
    title: `Top Up ${game.name}`,
    description: game.description || `Top up ${game.name} instantly at dKaimono`,
  };
}

export default async function GameDetailPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createServerSupabaseClient();

  const [{ data: game }, { data: products }] = await Promise.all([
    supabase.from('games').select('*').eq('slug', slug).eq('is_active', true).single(),
    supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  if (!game) notFound();

  // Filter products for this game after fetching
  const gameProducts = (products || []).filter((p: Product) => p.game_id === game.id);

  return (
    <div className="page-content">
      <div className="container">
        <GameTopUp game={game as Game} products={gameProducts as Product[]} />
      </div>
    </div>
  );
}
