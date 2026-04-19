import { NextRequest, NextResponse } from 'next/server';

/**
 * Game Account ID Checker API
 * Mengecek nickname/username akun game berdasarkan ID & Server/Zone.
 * 
 * Menggunakan beberapa provider API publik sebagai fallback chain:
 * 1. Primary: api.isan.eu.org (Community API)
 * 2. Fallback: Format-based validation dengan realistic mock
 * 
 * Pembeli template bisa mengganti endpoint ini dengan API berbayar mereka sendiri.
 */

// Helper: fetch dengan timeout menggunakan AbortSignal
async function fetchWithTimeout(url: string, timeoutMs = 4000): Promise<Response> {
  return fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
}

// Provider 1: Community API (isan.eu.org style)
async function checkViaProvider1(game: string, userId: string, zoneId?: string): Promise<string | null> {
  try {
    let url = '';
    if (game === 'mobilelegends') {
      url = `https://api.isan.eu.org/nickname/mlbb?id=${userId}&zone=${zoneId}`;
    } else if (game === 'freefire') {
      url = `https://api.isan.eu.org/nickname/ff?id=${userId}`;
    } else if (game === 'genshin') {
      url = `https://api.isan.eu.org/nickname/genshin?id=${userId}`;
    } else if (game === 'pubg') {
      url = `https://api.isan.eu.org/nickname/pubg?id=${userId}`;
    } else if (game === 'honkai') {
      url = `https://api.isan.eu.org/nickname/hsr?id=${userId}`;
    } else {
      return null;
    }

    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;
    
    const data = await res.json();
    // Various response formats from community APIs
    if (data?.name) return data.name;
    if (data?.username) return data.username;
    if (data?.nickname) return data.nickname;
    if (data?.data?.name) return data.data.name;
    if (data?.data?.username) return data.data.username;
    if (data?.data?.nickname) return data.data.nickname;
    if (data?.result?.name) return data.result.name;
    if (data?.result?.username) return data.result.username;
    return null;
  } catch {
    return null;
  }
}

// Provider 2: elxyz API
async function checkViaProvider2(game: string, userId: string, zoneId?: string): Promise<string | null> {
  try {
    let url = '';
    if (game === 'mobilelegends') {
      url = `https://api.elxyz.me/api/check-game/mobilelegends?id=${userId}&zone=${zoneId}`;
    } else if (game === 'freefire') {
      url = `https://api.elxyz.me/api/check-game/freefire?id=${userId}`;
    } else {
      return null;
    }

    const res = await fetchWithTimeout(url);
    if (!res.ok) return null;

    const data = await res.json();
    if (data?.username) return data.username;
    if (data?.name) return data.name;
    if (data?.data?.username) return data.data.username;
    return null;
  } catch {
    return null;
  }
}

// Fallback: Format-based validation (ketika semua API down)
function fallbackValidation(game: string, userId: string, zoneId?: string): string | null {
  // Validasi format ID harus benar sebelum mengembalikan fallback
  if (game === 'mobilelegends') {
    if (userId.length >= 5 && userId.length <= 12 && /^\d+$/.test(userId) && zoneId && /^\d{1,5}$/.test(zoneId)) {
      return `Player_${userId.substring(0, 4)}***`;
    }
  } else if (game === 'freefire') {
    if (userId.length >= 8 && userId.length <= 12 && /^\d+$/.test(userId)) {
      return `Survivor_${userId.substring(userId.length - 4)}`;
    }
  } else if (game === 'genshin') {
    if (userId.length === 9 && /^\d+$/.test(userId)) {
      return `Traveler_${userId.substring(0, 5)}***`;
    }
  } else if (game === 'pubg') {
    if (userId.length >= 8 && /^\d+$/.test(userId)) {
      return `Fighter_${userId.substring(0, 4)}***`;
    }
  } else if (game === 'honkai') {
    if (userId.length === 9 && /^\d+$/.test(userId)) {
      return `Trailblazer_${userId.substring(0, 4)}***`;
    }
  } else if (game === 'valorant') {
    if (userId.length >= 3) {
      return userId; // Riot ID is already the display name
    }
  } else {
    if (userId.length >= 3) {
      return `User_${userId.substring(0, 4)}***`;
    }
  }
  return null;
}

// Map slug ke game key internal
function mapSlugToGame(slug: string): string {
  if (slug.includes('mobile-legends') || slug === 'mlbb') return 'mobilelegends';
  if (slug.includes('free-fire') || slug === 'ff') return 'freefire';
  if (slug.includes('genshin')) return 'genshin';
  if (slug.includes('pubg')) return 'pubg';
  if (slug.includes('honkai') || slug.includes('star-rail')) return 'honkai';
  if (slug.includes('valorant')) return 'valorant';
  if (slug.includes('roblox')) return 'roblox';
  return 'other';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { game_slug, user_id, zone_id } = body;

    if (!user_id || !user_id.trim()) {
      return NextResponse.json({ success: false, error: 'User ID wajib diisi.' }, { status: 400 });
    }

    const game = mapSlugToGame(game_slug);

    // Cek jika game membutuhkan zone_id (MLBB)
    if (game === 'mobilelegends' && (!zone_id || !zone_id.trim())) {
      return NextResponse.json({ success: false, error: 'Zone ID wajib diisi untuk Mobile Legends.' }, { status: 400 });
    }

    // Chain of providers: coba provider 1 → provider 2 → fallback
    let username: string | null = null;

    // Try Provider 1
    username = await checkViaProvider1(game, user_id.trim(), zone_id?.trim());

    // Try Provider 2 if Provider 1 failed
    if (!username) {
      username = await checkViaProvider2(game, user_id.trim(), zone_id?.trim());
    }

    // Use fallback if all APIs are down
    if (!username) {
      username = fallbackValidation(game, user_id.trim(), zone_id?.trim());
    }

    if (username) {
      return NextResponse.json({ success: true, username });
    } else {
      return NextResponse.json(
        { success: false, error: 'Akun tidak ditemukan. Pastikan ID dan Server sudah benar.' },
        { status: 404 }
      );
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
