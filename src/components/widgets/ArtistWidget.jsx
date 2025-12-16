// widget para buscar y seleccionar artistas de spotify
// usa debouncing para no hacer una busqueda en cada tecla
'use client'

import { useEffect, useState } from 'react'
import { spotifyFetch } from '@/lib/spotify'

export default function ArtistWidget({ selectedArtists = [], onChange, max = 5 }) {
  const [query, setQuery] = useState('')  // texto de busqueda
  const [results, setResults] = useState([])  // resultados de spotify
  const [loading, setLoading] = useState(false)  // si esta buscando

  // este useEffect se ejecuta cada vez que el usuario escribe
  // pero esperamos 450ms antes de buscar (debouncing)
  useEffect(() => {
    const q = query.trim()
    // si escribe menos de 2 letras, no buscamos
    if (q.length < 2) {
      setResults([])
      return
    }

    // setTimeout espera 450ms, si el usuario sigue escribiendo se cancela y empieza de nuevo
    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const data = await spotifyFetch(`/search?type=artist&q=${encodeURIComponent(q)}&limit=6`)
        setResults(data?.artists?.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 450)

    // cleanup: si el componente se desmonta o query cambia, cancelamos el timer
    return () => clearTimeout(timer)
  }, [query])

  const isSelected = (artistId) => selectedArtists.some((a) => a.id === artistId)

  const toggleArtist = (artist) => {
    if (!onChange) return

    if (isSelected(artist.id)) {
      onChange(selectedArtists.filter((a) => a.id !== artist.id))
      return
    }

    if (selectedArtists.length >= max) return
    onChange([...selectedArtists, { id: artist.id, name: artist.name }])
  }

  const clear = () => {
    if (onChange) onChange([])
    setQuery('')
    setResults([])
  }

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">ArtistWidget</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{selectedArtists.length}/{max}</span>
          <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-200">
            Limpiar
          </button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar artista..."
        className="w-full bg-transparent border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
      />

      {loading && <p className="text-xs text-gray-400 mt-2">Buscando...</p>}

      <div className="mt-3 space-y-2">
        {results.map((a) => {
          const active = isSelected(a.id)
          const img = a?.images?.[2]?.url || a?.images?.[1]?.url || a?.images?.[0]?.url

          return (
            <button
              key={a.id}
              onClick={() => toggleArtist(a)}
              className={
                'w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ' +
                (active
                  ? 'bg-[#1DB954] text-black border-[#1DB954]'
                  : 'bg-transparent text-gray-200 border-[#2a2a2a] hover:border-gray-400')
              }
            >
              <div className="w-10 h-10 rounded-full overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={a.name} className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{a.name}</p>
                <p className={'text-xs ' + (active ? 'text-black/70' : 'text-gray-400')}>
                  {a?.genres?.slice(0, 2).join(', ') || '—'}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedArtists.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Seleccionados: {selectedArtists.map((a) => a.name).join(', ')}
        </p>
      )}
    </div>
  )
}
