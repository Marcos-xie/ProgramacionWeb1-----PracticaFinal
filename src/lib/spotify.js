// src/lib/spotify.js
// funciones para manejar tokens de spotify y hacer peticiones a su api

// comprueba si el token ha caducado
// los tokens de spotify duran 1 hora, por eso guardamos cuando expira
function isTokenExpired() {
  // si estamos en el servidor, no hay localstorage
  if (typeof window === 'undefined') return true

  const exp = localStorage.getItem('spotify_token_expiration')
  if (!exp) return true

  // comparamos la fecha actual con la fecha de expiracion
  return Date.now() > Number(exp)
}

// pide un nuevo token usando el refresh token
// esto lo hacemos cuando el access token caduca (cada hora)
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('spotify_refresh_token')
  if (!refreshToken) return null

  // llamamos a nuestra api route que hace el refresh
  // no podemos hacerlo desde el cliente porque necesitamos el client_secret
  const res = await fetch('/api/refresh-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!res.ok) {
    console.error('Error refrescando token')
    return null
  }

  const data = await res.json()

  // guardamos el nuevo token y calculamos cuando expirara
  localStorage.setItem('spotify_access_token', data.access_token)
  const expirationTime = Date.now() + data.expires_in * 1000
  localStorage.setItem(
    'spotify_token_expiration',
    expirationTime.toString()
  )

  return data.access_token
}

// funcion helper para obtener un token valido
// si esta expirado, lo refresca automaticamente
export async function getValidAccessToken() {
  if (typeof window === 'undefined') return null

  let token = localStorage.getItem('spotify_access_token')
  if (!token) return null

  // antes de devolver el token, comprobamos si ha expirado
  if (isTokenExpired()) {
    token = await refreshAccessToken()
  }

  return token
}

// funcion principal para hacer peticiones a spotify
// maneja automaticamente los tokens y reintentos
export async function spotifyFetch(endpoint, options = {}) {
  const token = await getValidAccessToken()
  if (!token) {
    throw new Error('No hay token de Spotify. Vuelve a iniciar sesión.')
  }

  // hacemos la peticion a la api de spotify con el token en el header
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })

  // si spotify dice que el token no es valido (401)
  // intentamos refrescarlo y reintentar la peticion
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (!newToken) throw new Error('No se pudo refrescar el token.')

    // reintentamos la peticion con el nuevo token
    const retryRes = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${newToken}`,
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    })

    if (!retryRes.ok) {
      const text = await retryRes.text()
      throw new Error(`Error Spotify (retry): ${text}`)
    }

    return retryRes.json()
  }

  // spotify tiene rate limits (maximo numero de peticiones por segundo)
  // si nos pasamos nos devuelve 429 y nos dice cuanto esperar
  if (res.status === 429) {
    const retryAfter = res.headers.get('Retry-After')
    const seconds = retryAfter ? Number(retryAfter) : 2
    throw new Error(`Rate limit (429). Espera ${seconds}s y prueba otra vez.`)
  }

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error Spotify: ${text}`)
  }

  return res.json()
}
