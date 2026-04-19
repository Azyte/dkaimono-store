import { NextRequest, NextResponse } from 'next/server';
import { generateMockUsername } from '@/lib/utils';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { game_id, fields } = body;

    if (!game_id || !fields) {
      return NextResponse.json({
        success: false,
        error: { code: 'MISSING_FIELDS', message: 'game_id and fields are required' },
      }, { status: 400 });
    }

    const supabase = await createAdminSupabaseClient();

    // Get game for validation mode
    const { data: game } = await supabase
      .from('games')
      .select('validation_mode, validation_api_url, name')
      .eq('id', game_id)
      .single();

    if (!game) {
      return NextResponse.json({
        success: false,
        error: { code: 'GAME_NOT_FOUND', message: 'Game not found' },
      }, { status: 404 });
    }

    const startTime = Date.now();
    let result;

    if (game.validation_mode === 'mock') {
      // Mock mode: generate deterministic username from ID
      await new Promise((r) => setTimeout(r, 800)); // Simulate API latency
      
      const userId = fields.user_id || fields[Object.keys(fields)[0]] || '';
      const serverId = fields.server_id || fields[Object.keys(fields)[1]] || '';
      const username = generateMockUsername(userId, serverId);

      result = {
        success: true,
        mode: 'mock',
        username,
        user_id: userId,
        server_id: serverId,
      };
    } else if (game.validation_mode === 'api' && game.validation_api_url) {
      // API mode: call external validation endpoint
      try {
        const apiRes = await fetch(game.validation_api_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fields),
          signal: AbortSignal.timeout(10000), // 10s timeout
        });

        if (apiRes.ok) {
          const apiData = await apiRes.json();
          result = {
            success: true,
            mode: 'api',
            username: apiData.username || apiData.name || 'Unknown',
            user_id: fields.user_id,
          };
        } else {
          result = {
            success: false,
            mode: 'api',
            error: 'External validation failed',
          };
        }
      } catch {
        // Fallback to mock on API failure
        const userId = fields.user_id || Object.values(fields)[0] || '';
        result = {
          success: true,
          mode: 'fallback',
          username: generateMockUsername(String(userId)),
          fallback: true,
          message: 'Validation service temporarily unavailable. Username shown is approximate.',
        };
      }
    } else {
      // Disabled mode
      result = {
        success: true,
        mode: 'disabled',
        username: null,
      };
    }

    const responseTime = Date.now() - startTime;

    // Log validation attempt
    await supabase.from('validation_logs').insert({
      game_id,
      game_user_id: fields.user_id || Object.values(fields)[0] || '',
      game_server_id: fields.server_id || null,
      result: result.success ? 'success' : 'failed',
      username_returned: result.username || null,
      response_time_ms: responseTime,
      validation_mode: game.validation_mode,
      ip_address: request.headers.get('x-forwarded-for') || null,
      raw_response: result,
    } as any);

    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          username: result.username,
          mode: result.mode,
          fallback: result.fallback || false,
          message: result.message || null,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: result.error || 'Account not found' },
      }, { status: 422 });
    }
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({
      success: false,
      error: { code: 'INTERNAL', message: 'Validation service error' },
    }, { status: 500 });
  }
}
