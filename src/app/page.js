'use client'

import { getSpotifyAuthUrl } from '@/lib/auth'

export default function HomePage() {
  const handleLogin = () => {
    const url = getSpotifyAuthUrl()
    // Redirigimos al usuario a Spotify
    window.location.href = url
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-[#181818] rounded-2xl p-8 shadow-lg max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-4">Spotify Taste Mixer</h1>
        <p className="text-sm text-gray-300 mb-6">
          Inicia sesión con tu cuenta de Spotify para generar playlists
          personalizadas.
        </p>
        <button
          onClick={handleLogin}
          className="bg-[#1DB954] hover:bg-[#1ed760] transition-colors text-black font-semibold py-2 px-4 rounded-full w-full"
        >
          Iniciar sesión con Spotify
        </button>
      </div>
    </main>
  )
}
