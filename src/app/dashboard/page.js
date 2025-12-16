// src/app/dashboard/page.js
// pagina principal de la app donde se muestran los widgets y la playlist generada
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import WidgetPanel from '@/components/WidgetPanel'
import PlaylistDisplay from '@/components/PlaylistDisplay'
import { spotifyFetch } from '@/lib/spotify'

export default function DashboardPage() {
  // estado del usuario de spotify
  const [user, setUser] = useState(null)
  const [error, setError] = useState(null)

  // estados de todos los widgets (los filtros que elige el usuario)
  const [selectedGenres, setSelectedGenres] = useState([])  // generos seleccionados
  const [selectedDecade, setSelectedDecade] = useState('')  // decada seleccionada (ej: "2010-2019")
  const [popularityRange, setPopularityRange] = useState([0, 100])  // rango de popularidad

  const [selectedArtists, setSelectedArtists] = useState([]) // artistas seleccionados
  const [selectedTracks, setSelectedTracks] = useState([])   // canciones seleccionadas manualmente

  // estado del mood widget (caracteristicas de audio)
  // cada una es un rango [min, max] de 0 a 100
  const [mood, setMood] = useState({
    energy: [0, 100],       // energia de la cancion
    valence: [0, 100],      // "felicidad" de la cancion
    danceability: [0, 100], // que tan bailable es
    acousticness: [0, 100], // si es acustica o electronica
  })

  // estado de la playlist generada
  const [tracks, setTracks] = useState([])  // canciones generadas
  const [loadingTracks, setLoadingTracks] = useState(false)  // si esta cargando

  // favoritos guardados en localstorage
  const [favoriteIds, setFavoriteIds] = useState([])  // solo los ids

  const router = useRouter()

  // al cargar la pagina, recuperamos los favoritos del localstorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('favorite_tracks') || '[]')
    setFavoriteIds(stored.map((t) => t.id))
  }, [])

  // comprobamos si el usuario esta logueado y cargamos su perfil
  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token')
    // si no hay token, redirigimos al login
    if (!token) {
      router.push('/')
      return
    }

    // pedimos info del perfil a spotify
    const loadUser = async () => {
      try {
        const data = await spotifyFetch('/me')
        setUser(data)
      } catch (err) {
        console.error(err)
        setError('No se ha podido cargar tu perfil de Spotify.')
      }
    }

    loadUser()
  }, [router])

  // convierte una cancion de spotify a nuestro formato simplificado
  // esto hace mas facil trabajar con las canciones en toda la app
  const normalizeTrack = (t) => ({
    id: t.id,
    name: t.name,
    artists: t.artists?.map((a) => a.name).join(', ') || '',  // convertimos array a string
    albumImage: t.album?.images?.[2]?.url || t.album?.images?.[1]?.url || '',  // imagen pequeña
    popularity: t.popularity ?? 50,  // por defecto 50 si no tiene
  })

  // filtra canciones segun el rango de popularidad elegido
  const filterByPopularity = (list) => {
    const [min, max] = popularityRange
    return list.filter((t) => (t.popularity ?? 50) >= min && (t.popularity ?? 50) <= max)
  }

  // ✅ pedir audio-features y filtrar según mood
  const filterByMood = async (list) => {
    // Si está “abierto” (0-100 en todo), no filtramos para evitar llamadas extra
    const isDefault =
      mood.energy[0] === 0 && mood.energy[1] === 100 &&
      mood.valence[0] === 0 && mood.valence[1] === 100 &&
      mood.danceability[0] === 0 && mood.danceability[1] === 100 &&
      mood.acousticness[0] === 0 && mood.acousticness[1] === 100

    if (isDefault) return list
    if (list.length === 0) return []

    // spotify usa valores 0-1 para mood, nosotros usamos 0-100
    // esta funcion helper convierte de 0-100 a 0-1
    const to01 = (n) => n / 100
    const ranges = {
      energy: [to01(mood.energy[0]), to01(mood.energy[1])],
      valence: [to01(mood.valence[0]), to01(mood.valence[1])],
      danceability: [to01(mood.danceability[0]), to01(mood.danceability[1])],
      acousticness: [to01(mood.acousticness[0]), to01(mood.acousticness[1])],
    }

    // sacamos los ids y limitamos a 100 (maximo que acepta spotify de una vez)
    const ids = list.map((t) => t.id).filter(Boolean).slice(0, 100)
    if (ids.length === 0) return []

    // pedimos las caracteristicas de audio de esas canciones
    let data
    try {
      data = await spotifyFetch(`/audio-features?ids=${ids.join(',')}`)
    } catch (e) {
      // si falla (403), ignoramos el filtro de mood y devolvemos todo
      console.log('Spotify bloqueó /audio-features (403). Ignoro filtro mood para no romper la app.')
      return list
    }

    const features = data?.audio_features || []

    // creamos un mapa id -> features para buscar rapidamente
    const mapById = new Map()
    for (const f of features) {
      if (f && f.id) mapById.set(f.id, f)
    }

    // filtramos las canciones que cumplan TODOS los rangos de mood
    return list.filter((t) => {
      const f = mapById.get(t.id)
      if (!f) return false  // si no tiene features, la descartamos

      // comprobamos que cada caracteristica este en el rango
      const okEnergy = f.energy >= ranges.energy[0] && f.energy <= ranges.energy[1]
      const okValence = f.valence >= ranges.valence[0] && f.valence <= ranges.valence[1]
      const okDance = f.danceability >= ranges.danceability[0] && f.danceability <= ranges.danceability[1]
      const okAcoustic = f.acousticness >= ranges.acousticness[0] && f.acousticness <= ranges.acousticness[1]

      return okEnergy && okValence && okDance && okAcoustic
    })
  }

  // busca canciones por generos seleccionados
  const fetchTracksByGenres = async () => {
    let all = []

    // por cada genero, hacemos una busqueda
    for (const genre of selectedGenres) {
      // si hay decada seleccionada, la incluimos en la busqueda
      const decadePart = selectedDecade ? ` year:${selectedDecade}` : ''
      const q = encodeURIComponent(`genre:${genre}${decadePart}`)

      // offset aleatorio para obtener resultados variados cada vez
      const offset = Math.floor(Math.random() * 120)
      const data = await spotifyFetch(`/search?type=track&q=${q}&limit=15&offset=${offset}`)
      const items = data?.tracks?.items || []
      all.push(...items)
    }

    return all.map(normalizeTrack)
  }

  // busca las canciones mas populares de los artistas seleccionados
  const fetchTracksByArtists = async () => {
    let all = []
    const market = 'ES'  // para que nos de resultados disponibles en españa

    for (const artist of selectedArtists) {
      // spotify tiene un endpoint especifico para top tracks de un artista
      const data = await spotifyFetch(`/artists/${artist.id}/top-tracks?market=${market}`)
      const items = data?.tracks || []
      all.push(...items)
    }

    return all.map(normalizeTrack)
  }

  // funcion principal: genera la playlist basandose en los widgets seleccionados
  // esta funcion se ejecuta cada vez que el usuario cambia algun filtro
  const generatePlaylist = async () => {
    // si no hay nada seleccionado, limpiamos la playlist
    if (
      selectedGenres.length === 0 &&
      selectedArtists.length === 0 &&
      selectedTracks.length === 0
    ) {
      setTracks([])
      return
    }

    setLoadingTracks(true)
    setError(null)

    try {
      // pool es donde juntamos todas las canciones de diferentes fuentes
      let pool = []

      // 1) añadimos las canciones que el usuario eligio manualmente
      pool.push(...selectedTracks)

      // 2) añadimos canciones de los artistas seleccionados
      if (selectedArtists.length > 0) {
        const byArtists = await fetchTracksByArtists()
        pool.push(...byArtists)
      }

      // 3) añadimos canciones de los generos seleccionados
      if (selectedGenres.length > 0) {
        const byGenres = await fetchTracksByGenres()
        pool.push(...byGenres)
      }

      // eliminamos duplicados (canciones que aparecen varias veces)
      // usamos un Set para llevar control de los ids que ya vimos
      const unique = []
      const seen = new Set()
      for (const t of pool) {
        if (!t?.id) continue  // ignoramos canciones sin id
        if (seen.has(t.id)) continue  // si ya la vimos, la saltamos
        seen.add(t.id)  // marcamos que ya la vimos
        unique.push(t)  // la añadimos al resultado
      }

      // aplicamos los filtros (popularidad y mood)
      let filtered = filterByPopularity(unique)
      filtered = await filterByMood(filtered)

      // limitamos a 20 canciones y actualizamos el estado
      setTracks(filtered.slice(0, 20))
    } catch (err) {
      console.error(err)
      setError('No se han podido generar canciones con esos filtros.')
    } finally {
      setLoadingTracks(false)
    }
  }

  // este useEffect observa los cambios en los widgets y regenera la playlist automaticamente
  // cada vez que el usuario cambia un filtro, se vuelve a generar
  useEffect(() => {
    generatePlaylist()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGenres, selectedDecade, popularityRange, selectedArtists, selectedTracks, mood])

  // elimina una cancion de la playlist generada
  const removeTrack = (trackId) => {
    setTracks((prev) => prev.filter((t) => t.id !== trackId))
  }

  // añade o quita una cancion de favoritos
  // los favoritos se guardan en localstorage para que persistan
  const toggleFavorite = (track) => {
    const favorites = JSON.parse(localStorage.getItem('favorite_tracks') || '[]')
    const exists = favorites.find((t) => t.id === track.id)

    let updated = []
    // si ya esta en favoritos, la quitamos
    if (exists) updated = favorites.filter((t) => t.id !== track.id)
    // si no esta, la añadimos
    else updated = [...favorites, track]

    // guardamos en localstorage y actualizamos el estado
    localStorage.setItem('favorite_tracks', JSON.stringify(updated))
    setFavoriteIds(updated.map((t) => t.id))
  }

  // vuelve a generar la playlist con los mismos filtros
  const refreshPlaylist = async () => {
    await generatePlaylist()
  }

  const addMoreTracks = async () => {
    if (
      selectedGenres.length === 0 &&
      selectedArtists.length === 0 &&
      selectedTracks.length === 0
    ) return

    setLoadingTracks(true)
    setError(null)

    try {
      let pool = []

      if (selectedArtists.length > 0) {
        const byArtists = await fetchTracksByArtists()
        pool.push(...byArtists)
      }

      if (selectedGenres.length > 0) {
        const byGenres = await fetchTracksByGenres()
        pool.push(...byGenres)
      }

      let filtered = filterByPopularity(pool)
      filtered = await filterByMood(filtered)

      setTracks((prev) => {
        const seen = new Set(prev.map((t) => t.id))
        const merged = [...prev]

        for (const t of filtered) {
          if (!seen.has(t.id)) {
            seen.add(t.id)
            merged.push(t)
          }
        }

        return merged.slice(0, 40)
      })
    } catch (err) {
      console.error(err)
      setError('No se han podido añadir más canciones.')
    } finally {
      setLoadingTracks(false)
    }
  }

  const canGenerate =
    selectedGenres.length > 0 || selectedArtists.length > 0 || selectedTracks.length > 0

  return (
    <main className="min-h-screen">
      <Header userName={user?.display_name} />

      <div className="max-w-6xl mx-auto px-4 py-6">
        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <WidgetPanel
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
              selectedDecade={selectedDecade}
              onDecadeChange={setSelectedDecade}
              popularityRange={popularityRange}
              onPopularityChange={setPopularityRange}
              selectedArtists={selectedArtists}
              onArtistsChange={setSelectedArtists}
              selectedTracks={selectedTracks}
              onTracksChange={setSelectedTracks}
              mood={mood}
              onMoodChange={setMood}
            />
          </div>

          <div className="lg:col-span-2">
            <PlaylistDisplay
              tracks={tracks}
              loading={loadingTracks}
              onRemoveTrack={removeTrack}
              onToggleFavorite={toggleFavorite}
              favoriteIds={favoriteIds}
              onRefresh={refreshPlaylist}
              onAddMore={addMoreTracks}
              canGenerate={canGenerate}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
