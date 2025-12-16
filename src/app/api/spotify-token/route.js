// api route del servidor para intercambiar el codigo por tokens
// esto DEBE hacerse en el servidor porque necesitamos el client_secret
// si lo hicieramos en el cliente, cualquiera podria ver nuestro secret

import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // recibimos el codigo que spotify nos dio en el callback
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      )
    }

    // estas variables de entorno solo estan disponibles en el servidor
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI

    // spotify requiere autenticacion "basic auth"
    // esto significa enviar clientId:clientSecret en base64 en el header
    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64')

    // preparamos los datos para spotify
    // grant_type: authorization_code significa "quiero intercambiar un codigo por tokens"
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
    })

    // hacemos la peticion al endpoint de tokens de spotify
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
      console.error('Error al pedir el token a Spotify:', errorText)
      return NextResponse.json(
        { error: 'Error requesting token from Spotify' },
        { status: 500 }
      )
    }

    const data = await res.json()

    // devolvemos los tokens al cliente
    // access_token: para hacer peticiones (dura 1 hora)
    // refresh_token: para pedir nuevos access_token cuando caduquen
    // expires_in: cuantos segundos dura el access_token (normalmente 3600 = 1h)
    return NextResponse.json(
      {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      },
      { status: 200 }
    )
  } catch (err) {
    console.error('Error en /api/spotify-token:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
