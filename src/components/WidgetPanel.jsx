// panel que contiene todos los widgets de filtros
// recibe los estados y funciones onChange del dashboard y se los pasa a cada widget
'use client'

import GenreWidget from '@/components/widgets/GenreWidget'
import DecadeWidget from '@/components/widgets/DecadeWidget'
import PopularityWidget from '@/components/widgets/PopularityWidget'
import ArtistWidget from '@/components/widgets/ArtistWidget'
import TrackWidget from '@/components/widgets/TrackWidget'
import MoodWidget from '@/components/widgets/MoodWidget'

export default function WidgetPanel({
  selectedGenres,
  onGenresChange,

  selectedDecade,
  onDecadeChange,

  popularityRange,
  onPopularityChange,

  selectedArtists,
  onArtistsChange,

  selectedTracks,
  onTracksChange,

  mood,
  onMoodChange,
}) {
  return (
    <section className="bg-[#181818] rounded-2xl p-4 border border-[#2a2a2a]">
      <h2 className="font-semibold mb-2">Widgets</h2>
      <p className="text-sm text-gray-300 mb-4">
        Elige tus preferencias para generar la playlist.
      </p>

      <div className="space-y-3">
        <GenreWidget selectedGenres={selectedGenres} onChange={onGenresChange} max={5} />

        <DecadeWidget selectedDecade={selectedDecade} onChange={onDecadeChange} />

        <PopularityWidget popularityRange={popularityRange} onChange={onPopularityChange} />

        <ArtistWidget selectedArtists={selectedArtists} onChange={onArtistsChange} max={5} />

        <TrackWidget selectedTracks={selectedTracks} onChange={onTracksChange} max={5} />

        <MoodWidget mood={mood} onChange={onMoodChange} />
      </div>
    </section>
  )
}
