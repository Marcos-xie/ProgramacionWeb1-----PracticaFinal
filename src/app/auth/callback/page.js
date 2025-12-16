'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function AuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [error, setError] = useState(null)

  useEffect(() => {
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    if (!code) {
      setError('No se ha recibido el código de autorización.')
      return
    }

    // Validamos el state (CSRF)
    const savedState = sessionStorage.getItem('spotify_auth_state')
    if (!state || state !== savedState) {
      setError('CSRF validation failed (state no coincide).')
      return
    }

    const exchangeCode = async () => {
      try {
        const res = await fetch('/api/spotify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        })

        if (!res.ok) {
          setError('Error al intercambiar el código por el token.')
          return
        }

        const data = await res.json()

        // Guardamos tokens en localStorage
        localStorage.setItem('spotify_access_token', data.access_token)
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token)
        }
        const expirationTime = Date.now() + data.expires_in * 1000
        localStorage.setItem(
          'spotify_token_expiration',
          expirationTime.toString()
        )

        // Limpiamos el state
        sessionStorage.removeItem('spotify_auth_state')

        // Redirigimos al dashboard
        router.push('/dashboard')
      } catch (err) {
        console.error(err)
        setError('Ha ocurrido un error durante el proceso de login.')
      }
    }

    exchangeCode()
  }, [router, searchParams])

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="bg-[#181818] p-6 rounded-lg max-w-md w-full text-center">
          <h1 className="text-xl font-bold mb-4">Error de autenticación</h1>
          <p className="mb-4 text-sm text-red-400">{error}</p>
          <button
            className="bg-[#1DB954] text-black px-4 py-2 rounded-full"
            onClick={() => router.push('/')}
          >
            Volver al inicio
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-gray-300">
        Conectando con Spotify, un segundo...
      </p>
    </main>
  )
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-gray-300">Cargando...</p>
      </main>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}
