import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const origin = searchParams.get('origin');
  const destination = searchParams.get('destination');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Store your API key in an environment variable
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch directions');
    }
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
