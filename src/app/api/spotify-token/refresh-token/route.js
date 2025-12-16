// api route para refrescar (renovar) el access_token cuando caduca
// el access_token de spotify solo dura 1 hora por seguridad
// pero el refresh_token dura mucho mas tiempo (meses/años)
// este endpoint usa el refresh_token para obtener un nuevo access_token
// asi el usuario no tiene que volver a hacer login cada hora

import { NextResponse } from 'next/server'

// esta funcion se ejecuta cuando hacemos POST a /api/refresh-token
// se llama desde lib/spotify.js cuando detectamos que el token expiro
export async function POST(request) {
  try {
    // parseamos el body para obtener el refresh_token
    // este refresh_token lo guardamos en localstorage durante el login inicial
    const { refresh_token } = await request.json()

    // validacion: si no hay refresh_token, devolvemos error
    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh_token' },
        { status: 400 }
      )
    }

    // obtenemos las credenciales (igual que en el login inicial)
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

    // preparamos la autenticacion basic auth (mismo proceso que antes)
    // spotify requiere esto para validar que somos nosotros
    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64')

    // preparamos los parametros para spotify
    // esta vez el grant_type es diferente: "refresh_token"
    // esto le dice a spotify: "dame un nuevo access_token usando este refresh_token"
    const body = new URLSearchParams({
      grant_type: 'refresh_token',  // tipo de operacion: refrescar token
      refresh_token,                // el refresh_token que tenemos guardado
    })

    // hacemos la peticion al mismo endpoint de tokens
    // es el mismo endpoint que para el login, pero con grant_type diferente
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
