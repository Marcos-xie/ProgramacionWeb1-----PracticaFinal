// pagina de inicio - primera pantalla que ve el usuario
// esta es la landing page donde el usuario hace login con spotify
'use client'  // necesario porque usamos eventos onclick (interactividad del cliente)

// importamos la funcion que genera la url de autorizacion de spotify
import { getSpotifyAuthUrl } from '@/lib/auth'

export default function HomePage() {
  // funcion que se ejecuta cuando el usuario hace click en "iniciar sesion"
  const handleLogin = () => {
    // paso 1: generamos la url de spotify con todos los parametros necesarios
    // esta url incluye: client_id, redirect_uri, scopes, y state (para seguridad)
    const url = getSpotifyAuthUrl()

    // paso 2: redirigimos al usuario a spotify para que autorice nuestra app
    // spotify mostrara una pantalla pidiendo permisos (leer perfil, crear playlists, etc)
    // despues de autorizar, spotify redirigira al usuario a /auth/callback con un codigo
    window.location.href = url
  }

  return (
    // contenedor principal que ocupa toda la pantalla
    // min-h-screen: altura minima = altura de la ventana (100vh)
    // flex items-center justify-center: centra el contenido vertical y horizontalmente
    <main className="min-h-screen flex items-center justify-center">
      {/* tarjeta central con el formulario de login */}
      {/* bg-[#181818]: fondo gris oscuro spotify */}
      {/* rounded-2xl: bordes muy redondeados */}
      {/* p-8: padding interno de 2rem (32px) */}
      {/* shadow-lg: sombra grande para efecto de profundidad */}
      {/* max-w-md: ancho maximo de 28rem (448px) */}
      {/* w-full: ocupa todo el ancho disponible hasta max-w-md */}
      <div className="bg-[#181818] rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        {/* titulo principal de la aplicacion */}
        {/* text-2xl: tamaño de fuente 1.5rem (24px) */}
        {/* font-bold: texto en negrita */}
        {/* mb-4: margen inferior de 1rem (16px) */}
        <h1 className="text-2xl font-bold mb-4">Spotify Taste Mixer</h1>

        {/* descripcion de la app */}
        {/* text-sm: texto pequeño 0.875rem (14px) */}
        {/* text-gray-300: color gris claro */}
        {/* mb-6: margen inferior de 1.5rem (24px) */}
        <p className="text-sm text-gray-300 mb-6">
          Inicia sesión con tu cuenta de Spotify para generar playlists
          personalizadas.
        </p>

        {/* boton de login */}
        <button
          onClick={handleLogin}  // al hacer click ejecuta handleLogin
          // bg-[#1DB954]: color verde de spotify
          // hover:bg-[#1ed760]: verde mas claro al pasar el mouse
          // transition-colors: animacion suave del cambio de color
          // text-black: texto negro (contrasta con el verde)
          // font-semibold: fuente semi-negrita
          // py-2: padding vertical de 0.5rem (8px)
          // px-4: padding horizontal de 1rem (16px)
          // rounded-full: bordes completamente redondeados (forma de pastilla)
          // w-full: ocupa todo el ancho del contenedor
          className="bg-[#1DB954] hover:bg-[#1ed760] transition-colors text-black font-semibold py-2 px-4 rounded-full w-full"
        >
          Iniciar sesión con Spotify
        </button>
      </div>
    </main>
  )
}
