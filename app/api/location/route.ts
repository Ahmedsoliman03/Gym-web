import { NextRequest, NextResponse } from 'next/server';

/**
 * /api/location
 * Proxies Nominatim reverse-geocoding so the browser never touches
 * Nominatim directly (avoids CORS and User-Agent restrictions).
 *
 * Query params:
 *   lat  – latitude  (required)
 *   lon  – longitude (required)
 *   lang – "ar" | "en"  (optional, default "en")
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');
  const lang = searchParams.get('lang') ?? 'en';

  if (!lat || !lon) {
    return NextResponse.json(
      { error: 'lat and lon are required' },
      { status: 400 }
    );
  }

  try {
    const nominatimUrl = new URL(
      'https://nominatim.openstreetmap.org/reverse'
    );
    nominatimUrl.searchParams.set('lat', lat);
    nominatimUrl.searchParams.set('lon', lon);
    nominatimUrl.searchParams.set('format', 'json');
    nominatimUrl.searchParams.set('addressdetails', '1');
    nominatimUrl.searchParams.set('accept-language', lang);

    const nominatimRes = await fetch(nominatimUrl.toString(), {
      headers: {
        'User-Agent': 'GymSpot/1.0 (https://gymspot.app)',
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!nominatimRes.ok) {
      return NextResponse.json(
        { error: 'Nominatim request failed', status: nominatimRes.status },
        { status: 502 }
      );
    }

    const data = await nominatimRes.json();
    const addr = data?.address ?? {};

    /*
     * governorate → county / state_district / state  (e.g. "Giza")
     * city        → city / town / village             (e.g. "6th of October")
     * area        → suburb / neighbourhood / quarter  (e.g. "12th District")
     */
    const result = {
      governorate:
        addr.county ??
        addr.state_district ??
        addr.state ??
        '',
      city:
        addr.city ??
        addr.town ??
        addr.village ??
        '',
      area:
        addr.suburb ??
        addr.neighbourhood ??
        addr.quarter ??
        '',
      road: addr.road ?? addr.pedestrian ?? '',
      building: addr.house_number ?? '',
      postcode: addr.postcode ?? '',
      country: addr.country ?? '',
      country_code: addr.country_code ?? '',
      display_name: data.display_name ?? '',
      raw: data,
    };

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
