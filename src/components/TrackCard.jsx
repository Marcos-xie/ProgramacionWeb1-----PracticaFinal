// componente para mostrar una cancion individual con botones de accion
// representa una fila en la lista de la playlist
'use client'

export default function TrackCard({ track, isFavorite, onToggleFavorite, onRemove }) {
  // preparamos el texto de artistas
  // soportamos dos formatos porque unas canciones vienen de spotify (array)
  // y otras las normalizamos nosotros (string)
  // formato spotify: track.artists = [{ name: 'Queen' }, { name: 'David Bowie' }]
  // nuestro formato: track.artists = "Queen, David Bowie"
  const artistText = Array.isArray(track.artists)
    ? track.artists.map((a) => a.name).join(', ')  // si es array, convertimos a string
    : (track.artists || '')  // si ya es string, lo usamos directamente

  // preparamos la url de la imagen del album
  // probamos varias fuentes en orden de prioridad:
  // 1. track.albumImage: nuestro formato normalizado (ya guardamos la url)
  // 2. track.album.images[2]: imagen pequeña de spotify (64x64)
  // 3. track.album.images[1]: imagen mediana de spotify (300x300)
  // 4. track.album.images[0]: imagen grande de spotify (640x640)
  // 5. '': string vacio si no hay ninguna imagen
  const img =
    track?.albumImage ||                    // nuestro formato
    track?.album?.images?.[2]?.url ||       // spotify pequeña
    track?.album?.images?.[1]?.url ||       // spotify mediana
    track?.album?.images?.[0]?.url ||       // spotify grande
    ''                                      // fallback vacio

  return (
    // contenedor principal de la tarjeta de cancion
    // flex para poner imagen+info a la izquierda y botones a la derecha
    <div className="flex items-center justify-between gap-4 bg-[#121212] border border-[#2a2a2a] rounded-xl p-4">
      {/* parte izquierda: imagen + informacion de la cancion */}
      <div className="flex items-center gap-4 min-w-0">
        {/* contenedor de la imagen del album */}
        {/* w-14 h-14 = 56x56 pixels */}
        {/* flex-shrink-0 evita que se comprima si el texto es muy largo */}
        <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
          {/* solo mostramos la imagen si existe */}
          {img ? (
            // eslint-disable-next-line: deshabilitamos warning de next/image
            // usamos img normal porque las urls son externas de spotify
            <img src={img} alt={track.name} className="w-full h-full object-cover" />
          ) : null}
        </div>

        {/* contenedor de texto (nombre y artistas) */}
        {/* min-w-0 permite que truncate funcione correctamente */}
        <div className="min-w-0">
          {/* nombre de la cancion */}
          {/* truncate corta el texto con ... si es muy largo */}
          <p className="text-sm font-semibold truncate">{track.name}</p>
          {/* nombre de los artistas */}
          <p className="text-xs text-gray-400 truncate">{artistText}</p>
        </div>
      </div>

      {/* parte derecha: botones de accion */}
      <div className="flex items-center gap-3">
        {/* boton de favorito (estrella) */}
        <button
          onClick={() => onToggleFavorite(track)}  // pasamos la cancion completa
          className="text-lg"  // tamaño del emoji
          title={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}  // tooltip
        >
          {/* mostramos estrella llena o vacia segun si es favorita */}
          {isFavorite ? '⭐' : '☆'}
        </button>

        {/* boton de eliminar (X) */}
        <button
          onClick={() => onRemove(track.id)}  // solo pasamos el id
          className="text-lg text-gray-400 hover:text-red-400"  // cambia a rojo al pasar el mouse
          title="Eliminar canción"  // tooltip
        >
          ✕
        </button>
      </div>
    </div>
  )
}
