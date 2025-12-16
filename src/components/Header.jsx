// componente de cabecera que muestra el nombre del usuario y boton de logout
'use client'

import { useRouter } from 'next/navigation'

export default function Header({ userName }) {
  const router = useRouter()

  // al hacer logout borramos todos los tokens y volvemos al login
  const handleLogout = () => {
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
    localStorage.removeItem('spotify_token_expiration')
    router.push('/')
  }

  return (
    <header className="bg-[#181818] border-b border-[#2a2a2a]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <h1 className="font-bold text-lg">
          Spotify Taste Mixer
        </h1>

        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-gray-300">
              Hola, {userName}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="text-sm bg-[#1DB954] hover:bg-[#1ed760] text-black font-semibold px-4 py-2 rounded-full transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
