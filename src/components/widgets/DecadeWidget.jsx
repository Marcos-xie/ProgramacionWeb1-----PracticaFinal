// src/components/widgets/DecadeWidget.jsx
// widget para seleccionar una decada musical (a\u00f1os)
'use client'

// rangos de a\u00f1os por decada
const DECADES = [
  { label: '1960s', range: '1960-1969' },
  { label: '1970s', range: '1970-1979' },
  { label: '1980s', range: '1980-1989' },
  { label: '1990s', range: '1990-1999' },
  { label: '2000s', range: '2000-2009' },
  { label: '2010s', range: '2010-2019' },
  { label: '2020s', range: '2020-2029' },
]

export default function DecadeWidget({ selectedDecade, onChange }) {
  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">DecadeWidget</p>

        <button
          onClick={() => onChange('')}  // '' significa sin filtro de decada
          className="text-xs text-gray-400 hover:text-gray-200"
          title="Quitar filtro"
        >
          Limpiar
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {DECADES.map((d) => {
          const active = selectedDecade === d.range

          return (
            <button
              key={d.range}
              onClick={() => onChange(d.range)}
              className={
                'text-xs px-3 py-1 rounded-full border transition-colors ' +
                (active
                  ? 'bg-[#1DB954] text-black border-[#1DB954]'
                  : 'bg-transparent text-gray-200 border-[#2a2a2a] hover:border-gray-400')
              }
            >
              {d.label}
            </button>
          )
        })}
      </div>

      {selectedDecade && (
        <p className="mt-3 text-xs text-gray-400">
          A\u00f1o: {selectedDecade}
        </p>
      )}
    </div>
  )
}
