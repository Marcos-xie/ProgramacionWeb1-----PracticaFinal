// widget para configurar el rango de popularidad de las canciones
// 0 = canciones desconocidas/underground, 100 = canciones muy famosas/mainstream
// usa un patron de "estado local" con boton "aplicar"
'use client'  // necesario porque usamos hooks

import { useEffect, useState } from 'react'

export default function PopularityWidget({ popularityRange = [0, 100], onChange }) {
  // estado local: los cambios NO se aplican inmediatamente
  // esto permite al usuario mover los sliders sin regenerar la playlist en cada movimiento
  // solo se aplica cuando pulse "aplicar filtro"
  const [localMin, setLocalMin] = useState(popularityRange[0])  // valor minimo local
  const [localMax, setLocalMax] = useState(popularityRange[1])  // valor maximo local
  const [dirty, setDirty] = useState(false)  // indica si hay cambios sin aplicar

  // cuando el padre cambia popularityRange (ej: reset), actualizamos nuestro estado local
  useEffect(() => {
    setLocalMin(popularityRange[0])
    setLocalMax(popularityRange[1])
    setDirty(false)  // ya no hay cambios pendientes
  }, [popularityRange])  // se ejecuta cuando popularityRange cambia

  // aplica los cambios locales y notifica al componente padre
  const apply = () => {
    if (!onChange) return  // si no hay funcion onChange, no hacemos nada
    onChange([localMin, localMax])  // llamamos al padre con los nuevos valores
    setDirty(false)  // marcamos como "aplicado"
  }

  // resetea los valores a 0-100 (sin filtro)
  const reset = () => {
    setLocalMin(0)
    setLocalMax(100)
    if (onChange) onChange([0, 100])  // notificamos al padre inmediatamente
    setDirty(false)  // no hay cambios pendientes
  }

  // maneja el cambio del slider de minimo
  const onMinChange = (value) => {
    const v = Number(value)  // convertimos string a numero
    // el minimo no puede ser mayor que el maximo
    // Math.min devuelve el menor de los dos valores
    const fixed = Math.min(v, localMax)
    setLocalMin(fixed)
    setDirty(true)  // marcamos que hay cambios sin aplicar
  }

  // maneja el cambio del slider de maximo
  const onMaxChange = (value) => {
    const v = Number(value)  // convertimos string a numero
    // el maximo no puede ser menor que el minimo
    // Math.max devuelve el mayor de los dos valores
    const fixed = Math.max(v, localMin)
    setLocalMax(fixed)
    setDirty(true)  // marcamos que hay cambios sin aplicar
  }

  return (
    <div className="bg-[#121212] border border-[#2a2a2a] rounded-xl p-3">
      {/* cabecera con titulo y boton reset */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold">PopularityWidget</p>

        {/* boton para resetear a 0-100 */}
        <button
          onClick={reset}  // llama a la funcion reset
          className="text-xs text-gray-400 hover:text-gray-200"
          title="Reset"
        >
          Reset
        </button>
      </div>

      {/* muestra el rango actual y si hay cambios sin aplicar */}
      <p className="text-xs text-gray-400 mb-3">
        Rango: <span className="text-gray-200">{localMin}</span> -{' '}
        <span className="text-gray-200">{localMax}</span>
        {/* solo mostramos el aviso si dirty es true */}
        {dirty && <span className="ml-2 text-yellow-400">*sin aplicar</span>}
      </p>

      {/* contenedor de sliders y boton */}
      <div className="space-y-3">
        {/* slider de minimo */}
        <div>
          <label className="text-xs text-gray-400">Mínimo</label>
          <input
            type="range"      // input tipo slider
            min="0"           // valor minimo posible
            max="100"         // valor maximo posible
            value={localMin}  // valor actual
            onChange={(e) => onMinChange(e.target.value)}  // al cambiar, llamamos onMinChange
            className="w-full"
          />
        </div>

        {/* slider de maximo */}
        <div>
          <label className="text-xs text-gray-400">Máximo</label>
          <input
            type="range"
            min="0"
            max="100"
            value={localMax}  // valor actual
            onChange={(e) => onMaxChange(e.target.value)}  // al cambiar, llamamos onMaxChange
            className="w-full"
          />
        </div>

        {/* boton para aplicar los cambios */}
        <button
          onClick={apply}     // al hacer click, llamamos apply
          disabled={!dirty}   // deshabilitado si no hay cambios (dirty=false)
          className="w-full text-xs px-3 py-2 rounded-full bg-[#1DB954] text-black font-semibold hover:bg-[#1ed760] disabled:opacity-40 disabled:hover:bg-[#1DB954]"
        >
          Aplicar filtro
        </button>
      </div>
    </div>
  )
}
