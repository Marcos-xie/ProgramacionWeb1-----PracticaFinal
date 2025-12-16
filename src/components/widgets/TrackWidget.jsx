// widget para buscar y seleccionar canciones de spotify
// similar a ArtistWidget pero busca tracks
'use client'

import { useEffect, useState } from 'react'
import { spotifyFetch } from '@/lib/spotify'

export default function TrackWidget({ selectedTracks = [], onChange, max = 5 }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // debouncing: esperamos 450ms antes de buscar
  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true)
        const data = await spotifyFetch(`/search?type=track&q=${encodeURIComponent(q)}&limit=6`)
        setResults(data?.tracks?.items || [])
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }, 450)

    return () => clearTimeout(timer)
  }, [query])

  const isSelected = (trackId) => selectedTracks.some((t) => t.id === trackId)

  const toggleTrack = (track) => {
    if (!onChange) return

    if (isSelected(track.id)) {
      onChange(selectedTracks.filter((t) => t.id !== track.id))
      return
    }
    if (selectedTracks.length >= max) return

    onChange([
      ...selectedTracks,
      {
        id: track.id,
        name: track.name,
        artists: track.artists?.map((a) => a.name).join(', ') || '',
        albumImage: track.album?.images?.[2]?.url || track.album?.images?.[1]?.url || '',
        popularity: track.popularity ?? 50,
      },
    ])
  }

  const clear = () => {
    if (onChange) onChange([])
    setQuery('')
    setResults([])
  }

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">TrackWidget</p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{selectedTracks.length}/{max}</span>
          <button onClick={clear} className="text-xs text-gray-400 hover:text-gray-200">
            Limpiar
          </button>
        </div>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar canción..."
        className="w-full bg-transparent border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
      />

      {loading && <p className="text-xs text-gray-400 mt-2">Buscando...</p>}

      <div className="mt-3 space-y-2">
        {results.map((t) => {
          const active = isSelected(t.id)
          const img = t?.album?.images?.[2]?.url || t?.album?.images?.[1]?.url

          return (
            <button
              key={t.id}
              onClick={() => toggleTrack(t)}
              className={
                'w-full flex items-center gap-3 p-2 rounded-lg border text-left transition-colors ' +
                (active
                  ? 'bg-[#1DB954] text-black border-[#1DB954]'
                  : 'bg-transparent text-gray-200 border-[#2a2a2a] hover:border-gray-400')
              }
            >
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                {img ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={img} alt={t.name} className="w-full h-full object-cover" />
                ) : null}
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">{t.name}</p>
                <p className={'text-xs ' + (active ? 'text-black/70' : 'text-gray-400')}>
                  {t.artists?.map((a) => a.name).join(', ')}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {selectedTracks.length > 0 && (
        <p className="mt-3 text-xs text-gray-400">
          Seleccionados: {selectedTracks.map((t) => t.name).join(', ')}
        </p>
      )}
    </div>
  )
}
