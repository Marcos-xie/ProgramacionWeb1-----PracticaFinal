// layout raiz - envuelve TODAS las paginas de la aplicacion
// este componente se ejecuta una sola vez y contiene elementos comunes (html, body, etc)
import './globals.css'  // importamos los estilos globales (tailwind + variables de tema)

// metadata para SEO (search engine optimization)
// next.js usa esto para generar las etiquetas <meta> en el <head>
export const metadata = {
  title: 'Spotify Taste Mixer',  // titulo que aparece en la pestaña del navegador
  description: 'Generador de playlists personalizadas con Spotify',  // descripcion para buscadores
}

// componente raiz que envuelve toda la aplicacion
// { children } representa el contenido de cada pagina (page.js, dashboard/page.js, etc)
export default function RootLayout({ children }) {
  return (
    // etiqueta html raiz
    // lang="es": define español como idioma del sitio (importante para accesibilidad)
    <html lang="es">
      {/* body contiene todo el contenido visible */}
      {/* bg-[#121212]: fondo negro-gris oscuro (color de spotify) */}
      {/* text-white: texto blanco por defecto */}
      {/* min-h-screen: altura minima = altura de la pantalla (evita espacios vacios) */}
      <body className="bg-[#121212] text-white min-h-screen">
        {/* aqui se renderiza el contenido de cada pagina */}
        {/* puede ser: HomePage, DashboardPage, AuthCallbackPage, etc */}
        {children}
      </body>
    </html>
  )
}
