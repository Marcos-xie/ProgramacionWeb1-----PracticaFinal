// widget para seleccionar generos musicales
// permite buscar y seleccionar hasta un maximo de generos
'use client'

import { useMemo, useState } from 'react'

// lista hardcodeada de generos porque el endpoint de spotify esta deprecated
const GENRES = [
  'rock', 'pop', 'hip-hop', 'indie',
  'electronic', 'techno', 'house', 'jazz',
  'classical', 'latin', 'reggaeton', 'metal',
  'blues', 'country', 'disco', 'funk',
]

export default function GenreWidget({
  selectedGenres = [],
  onChange = () => { },
  max = 5,  // maximo de generos que se pueden seleccionar
}) {
  const [query, setQuery] = useState('')  // texto de busqueda

  // filtramos los generos segun lo que escribe el usuario
  // useMemo evita recalcular esto en cada render
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return GENRES  // si no hay busqueda, mostramos todos
    return GENRES.filter((g) => g.includes(q))
  }, [query])

  // a\u00f1ade o quita un genero de la seleccion
  const toggle = (genre) => {
    // si ya esta seleccionado, lo quitamos
    if (selectedGenres.includes(genre)) {
      onChange(selectedGenres.filter((g) => g !== genre))
      return
    }
    // si ya llegamos al maximo, no hacemos nada
    if (selectedGenres.length >= max) return
    // lo a\u00f1adimos
    onChange([...selectedGenres, genre])
  }

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold">GenreWidget</p>
        <span className="text-xs text-gray-400">
          {selectedGenres.length}/{max}
        </span>
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar género..."
        className="w-full bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg px-3 py-2 text-sm outline-none"
      />

      <div className="flex flex-wrap gap-2 mt-4">
        {filtered.map((genre) => {
          const active = selectedGenres.includes(genre)
          return (
            <button
              key={genre}
              onClick={() => toggle(genre)}
              className={
                'px-3 py-1 rounded-full text-sm border transition ' +
                (active
                  ? 'bg-[#1DB954] text-black border-[#1DB954]'
                  : 'border-[#2a2a2a] hover:border-gray-500')
              }
            >
              {genre}
            </button>
          )
        })}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        Seleccionados:{' '}
        {selectedGenres.length ? selectedGenres.join(', ') : 'ninguno'}
      </p>
    </div>
  )
}
