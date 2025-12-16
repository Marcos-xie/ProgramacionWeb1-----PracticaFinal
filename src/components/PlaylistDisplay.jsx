// componente que muestra la playlist generada con botones de gestion
// este componente recibe la lista de canciones y funciones para gestionarlas
import TrackCard from '@/components/TrackCard'

export default function PlaylistDisplay({
  tracks,              // array de canciones generadas
  loading,             // boolean que indica si esta generando
  onRemoveTrack,       // funcion para eliminar una cancion de la lista
  onToggleFavorite,    // funcion para marcar/desmarcar como favorita
  favoriteIds,         // array de ids de canciones favoritas
  onRefresh,           // funcion para regenerar la playlist
  onAddMore,           // funcion para añadir mas canciones
  canGenerate,         // boolean que indica si hay filtros seleccionados
}) {
  return (
    // contenedor principal con fondo oscuro y bordes redondeados
    <section className="bg-[#181818] rounded-2xl p-4 border border-[#2a2a2a]">
      {/* cabecera con titulo y botones de accion */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <h2 className="font-semibold">Playlist generada</h2>

        {/* contenedor de botones */}
        <div className="flex items-center gap-2">
          {/* boton para regenerar la playlist con los mismos filtros */}
          <button
            onClick={onRefresh}              // llama a la funcion para regenerar
            disabled={!canGenerate || loading}  // deshabilitado si no hay filtros o esta cargando
            className="text-xs px-3 py-2 rounded-full border border-[#2a2a2a] text-gray-200 hover:border-gray-400 disabled:opacity-40 disabled:hover:border-[#2a2a2a]"
            title="Regenerar playlist"
          >
            🔄 Refrescar
          </button>

          {/* boton para añadir mas canciones a la playlist actual */}
          <button
            onClick={onAddMore}              // llama a la funcion para añadir mas
            disabled={!canGenerate || loading}  // deshabilitado si no hay filtros o esta cargando
            className="text-xs px-3 py-2 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] disabled:opacity-40"
            title="Añadir más canciones"
          >
            ➕ Añadir más
          </button>
        </div>
      </div>

      {/* mensaje cuando no hay canciones y no esta cargando */}
      {!loading && tracks.length === 0 && (
        <p className="text-sm text-gray-300">
          Selecciona algún género para generar canciones.
        </p>
      )}

      {/* mensaje de carga */}
      {loading && (
        <p className="text-sm text-gray-400 mb-3">Cargando canciones...</p>
      )}

      {/* lista de canciones generadas */}
      {/* space-y-3 añade espacio vertical entre cada TrackCard */}
      <div className="space-y-3">
        {/* iteramos sobre cada cancion y creamos un TrackCard */}
        {tracks.map((t) => (
          <TrackCard
            key={t.id}                           // key unica para react
            track={t}                           // objeto completo de la cancion
            onRemove={onRemoveTrack}            // funcion para eliminar
            onToggleFavorite={onToggleFavorite} // funcion para favoritos
            isFavorite={favoriteIds.includes(t.id)}  // si esta en favoritos
          />
        ))}
      </div>
    </section>
  )
}
