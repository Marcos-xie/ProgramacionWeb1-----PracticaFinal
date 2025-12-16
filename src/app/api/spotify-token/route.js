// api route del servidor para intercambiar el codigo de autorizacion por tokens
// IMPORTANTE: esto DEBE ejecutarse en el servidor (no en el navegador)
// razon: necesitamos el client_secret que NUNCA debe exponerse al cliente
// si alguien obtiene el client_secret podria hacer peticiones en nombre de nuestra app

import { NextResponse } from 'next/server'

// esta funcion se ejecuta cuando hacemos POST a /api/spotify-token
// se llama desde /auth/callback despues de que spotify redirija al usuario
export async function POST(request) {
  try {
    // parseamos el body de la peticion para obtener el codigo
    // el codigo es el parametro que spotify nos dio en la url del callback
    const { code } = await request.json()

    // validacion: si no hay codigo, devolvemos error 400 (bad request)
    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },  // mensaje de error
        { status: 400 }  // codigo de estado HTTP
      )
    }

    // obtenemos las credenciales desde las variables de entorno
    // estas variables SOLO existen en el servidor (nunca se envian al cliente)
    const clientId = process.env.SPOTIFY_CLIENT_ID
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI

    // spotify requiere autenticacion "Basic Auth" para este endpoint
    // basic auth formato: "Authorization: Basic base64(clientId:clientSecret)"
    // paso 1: concatenamos clientId y clientSecret con dos puntos
    // paso 2: convertimos a base64
    // ejemplo: si clientId="abc" y clientSecret="xyz", seria base64("abc:xyz")
    const basicAuth = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString('base64')

    // preparamos los parametros para la peticion a spotify
    // usamos URLSearchParams porque spotify espera formato x-www-form-urlencoded
    // (no JSON como en otras apis)
    const body = new URLSearchParams({
      grant_type: 'authorization_code',  // tipo de flujo oauth: intercambio de codigo
      code,                              // el codigo que recibimos de spotify
      redirect_uri: redirectUri,         // mismo redirect_uri que usamos antes (spotify lo valida)
    })

    // hacemos la peticion al endpoint de tokens de spotify
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',  // debe ser POST
      headers: {
        // header de autenticacion con nuestras credenciales en base64
        Authorization: `Basic ${basicAuth}`,
        // spotify requiere este content-type especifico
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      // convertimos URLSearchParams a string
      body: body.toString(),
    })

    // verificamos si la peticion a spotify fue exitosa
    if (!res.ok) {
      // si falla, obtenemos el mensaje de error de spotify
      const errorText = await res.text()
      console.error('Error al pedir el token a Spotify:', errorText)

      // devolvemos error 500 (internal server error) al cliente
      return NextResponse.json(
        { error: 'Error requesting token from Spotify' },
        { status: 500 }
      )
    }

    // si todo fue bien, parseamos la respuesta de spotify
    const data = await res.json()

    // la respuesta de spotify incluye:
    // - access_token: token para hacer peticiones a la api (valido 1 hora)
    // - refresh_token: token para obtener nuevos access_token (valido mucho mas tiempo)
    // - expires_in: segundos hasta que expire el access_token (normalmente 3600 = 1h)
    // - token_type: tipo de token (siempre "Bearer")
    // - scope: permisos que se concedieron

    // devolvemos solo lo que necesitamos al cliente
    return NextResponse.json(
      {
        access_token: data.access_token,     // token para peticiones
        refresh_token: data.refresh_token,   // token para refrescar
        expires_in: data.expires_in,         // tiempo de expiracion en segundos
      },
      { status: 200 }  // codigo de exito
    )
  } catch (err) {
    // si hay algun error inesperado (red, parsing, etc)
    console.error('Error en /api/spotify-token:', err)

    // devolvemos error 500 generico
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
