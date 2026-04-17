import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HeroBanner } from '@/components/home/HeroBanner';
import { GameGrid } from '@/components/home/GameGrid';
import type { Game, Banner } from '@/types/database';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: games }, { data: banners }] = await Promise.all([
    supabase
      .from('games')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ]);

  return (
    <div className="page-content">
      <div className="container">
        <HeroBanner banners={(banners as Banner[]) || []} />
        <GameGrid games={(games as Game[]) || []} />
      </div>
    </div>
  );
}
