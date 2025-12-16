// widget para configurar el mood/ambiente de las canciones
// cada caracteristica tiene 3 niveles: bajo/medio/alto
'use client'
import { useState } from 'react'

// opciones de rango para cada nivel
const OPTIONS = {
  low: [0, 40],
  mid: [40, 70],
  high: [70, 100],
}

const MoodButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm border transition
      ${active
        ? 'bg-green-600 border-green-600 text-white'
        : 'border-gray-600 text-gray-300 hover:border-gray-400'
      }`}
  >
    {children}
  </button>
)

export default function MoodWidget({ mood, onChange }) {
  // usamos estado local para que no se aplique hasta que el usuario pulse "aplicar"
  const [localMood, setLocalMood] = useState(mood)
  const [dirty, setDirty] = useState(false)  // indica si hay cambios sin aplicar

  const setValue = (key, level) => {
    setDirty(true)
    setLocalMood((prev) => ({
      ...prev,
      [key]: OPTIONS[level],
    }))
  }

  const apply = () => {
    if (typeof onChange !== 'function') return
    onChange(localMood)
    setDirty(false)
  }

  const reset = () => {
    const resetMood = {
      energy: [0, 100],
      valence: [0, 100],
      danceability: [0, 100],
      acousticness: [0, 100],
    }
    setLocalMood(resetMood)
    if (typeof onChange === 'function') onChange(resetMood)
    setDirty(false)
  }

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3 space-y-4">
      <div className="flex justify-between items-center">
        <p className="font-semibold">MoodWidget</p>
        <button
          onClick={reset}
          className="text-xs text-gray-400 hover:text-gray-200"
        >
          Reset
        </button>
      </div>

      {/* ENERGY */}
      <div>
        <p className="text-sm mb-1">⚡ Energy</p>
        <div className="flex gap-2 flex-wrap">
          <MoodButton active={localMood.energy[1] <= 40} onClick={() => setValue('energy', 'low')}>Chill</MoodButton>
          <MoodButton active={localMood.energy[0] >= 40 && localMood.energy[1] <= 70} onClick={() => setValue('energy', 'mid')}>Normal</MoodButton>
          <MoodButton active={localMood.energy[0] >= 70} onClick={() => setValue('energy', 'high')}>Energético</MoodButton>
        </div>
      </div>

      {/* VALENCE */}
      <div>
        <p className="text-sm mb-1">😊 Happy</p>
        <div className="flex gap-2 flex-wrap">
          <MoodButton active={localMood.valence[1] <= 40} onClick={() => setValue('valence', 'low')}>Triste</MoodButton>
          <MoodButton active={localMood.valence[0] >= 40 && localMood.valence[1] <= 70} onClick={() => setValue('valence', 'mid')}>Normal</MoodButton>
          <MoodButton active={localMood.valence[0] >= 70} onClick={() => setValue('valence', 'high')}>Feliz</MoodButton>
        </div>
      </div>

      {/* DANCEABILITY */}
      <div>
        <p className="text-sm mb-1">💃 Danceability</p>
        <div className="flex gap-2 flex-wrap">
          <MoodButton active={localMood.danceability[1] <= 40} onClick={() => setValue('danceability', 'low')}>Poco</MoodButton>
          <MoodButton active={localMood.danceability[0] >= 40 && localMood.danceability[1] <= 70} onClick={() => setValue('danceability', 'mid')}>Normal</MoodButton>
          <MoodButton active={localMood.danceability[0] >= 70} onClick={() => setValue('danceability', 'high')}>Muy bailable</MoodButton>
        </div>
      </div>

      {/* ACOUSTIC */}
      <div>
        <p className="text-sm mb-1">🎸 Acoustic</p>
        <div className="flex gap-2 flex-wrap">
          <MoodButton active={localMood.acousticness[1] <= 40} onClick={() => setValue('acousticness', 'low')}>Electrónica</MoodButton>
          <MoodButton active={localMood.acousticness[0] >= 40 && localMood.acousticness[1] <= 70} onClick={() => setValue('acousticness', 'mid')}>Mixto</MoodButton>
          <MoodButton active={localMood.acousticness[0] >= 70} onClick={() => setValue('acousticness', 'high')}>Acústica</MoodButton>
        </div>
      </div>

      {dirty && (
        <button
          onClick={apply}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-full mt-3"
        >
          Aplicar cambios
        </button>
      )}
    </div>
  )
}
