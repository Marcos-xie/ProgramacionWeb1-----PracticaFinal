// api route para refrescar el access_token cuando caduca
// el access_token dura 1 hora, pero el refresh_token dura mucho mas

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // recibimos el refresh_token que guardamos en el login inicial
    const { refresh_token } = await request.json()

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh_token' },
        { status: 400 }
      )
    }

    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    // misma autenticacion basic auth que en el login inicial
    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64')

    // grant_type: refresh_token significa "quiero un nuevo access_token"
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token,
    })

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('Error al refrescar token en Spotify:', errorText)
      return NextResponse.json(
        { error: 'Error refreshing token from Spotify' },
        { status: 500 }
      )
    }

    const data = await res.json()

    // devolvemos solo el nuevo access_token
    // el refresh_token no cambia (por eso no lo devolvemos)
    return NextResponse.json(
      {
        access_token: data.access_token,
        expires_in: data.expires_in,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/refresh-token:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
