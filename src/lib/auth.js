// funciones para manejar la autenticacion oauth con spotify

// genera una cadena aleatoria para protegernos de ataques csrf
// csrf = cross-site request forgery
// es un ataque donde alguien podria intentar hacer login en nuestra app sin nuestro permiso
function generateRandomString(length = 16) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''

  // creamos una cadena aleatoria caracter por caracter
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// construye la url de autorizacion de spotify
// esta url es donde redirigimos al usuario para que haga login
export function getSpotifyAuthUrl() {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
  const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI

  // generamos un state aleatorio para validar luego en el callback
  const state = generateRandomString(16)

  // guardamos el state en sessionstorage (no localstorage)
  // sessionstorage se borra al cerrar la pestaña, es mas seguro para esto
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('spotify_auth_state', state)
  }

  // estos son los permisos que le pedimos a spotify
  // necesitamos estos scopes para leer el perfil, crear playlists, etc
  const scope = [
    'user-read-email',        // leer email del usuario
    'user-read-private',      // leer nombre e info basica
    'user-top-read',          // leer artistas y canciones favoritas
    'playlist-modify-private',// crear playlists privadas
    'playlist-modify-public', // crear playlists publicas
  ].join(' ')


  // construimos los parametros de la url de autorizacion
  const params = new URLSearchParams({
    response_type: 'code',  // queremos un codigo (no un token directo)
    client_id: clientId,
    scope,
    redirect_uri: redirectUri,
    state,  // incluimos el state para verificar luego
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}
