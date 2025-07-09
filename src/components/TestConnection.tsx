'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestConnection() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setStatus('loading')
      
      // Test de connexion Supabase
      const { error } = await supabase
        .from('venues')
        .select('count')
        .limit(1)
      
      if (error) {
        throw error
      }
      
      setStatus('success')
      setMessage('✅ Connexion Supabase réussie ! Base de données opérationnelle.')
      
    } catch (error) {
      setStatus('error')
      setMessage(`❌ Erreur de connexion: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/dual')
      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ API Auth fonctionnelle !')
      } else {
        setMessage(`❌ Erreur API Auth: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Erreur API Auth: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  const testWave = async () => {
    try {
      // Test simple de l'endpoint Wave
      const response = await fetch('/api/payments/wave/callback')
      const data = await response.json()
      
      if (response.ok) {
        setMessage('✅ API Wave CI opérationnelle !')
      } else {
        setMessage(`❌ Erreur API Wave: ${data.error}`)
      }
    } catch (error) {
      setMessage(`❌ Erreur API Wave: ${error instanceof Error ? error.message : 'Erreur inconnue'}`)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <p className="text-2xl font-bold text-gray-900 mb-6 text-center">
        🏟️ ARENAPP – Test de Connexion
      </p>
      
      <div className="space-y-4">
        {/* Status de connexion */}
        <div className={`p-4 rounded-lg ${
          status === 'loading' ? 'bg-blue-50 border border-blue-200' :
          status === 'success' ? 'bg-green-50 border border-green-200' :
          'bg-red-50 border border-red-200'
        }`}>
          <p className={`font-medium ${
            status === 'loading' ? 'text-blue-800' :
            status === 'success' ? 'text-green-800' :
            'text-red-800'
          }`}>
            {status === 'loading' ? '⏳ Test de connexion...' : message}
          </p>
        </div>

        {/* Boutons de test */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={testConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🗄️ Test Supabase
          </button>
          
          <button
            onClick={testAuth}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            🔐 Test Auth API
          </button>
          
          <button
            onClick={testWave}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            💳 Test Wave CI
          </button>
        </div>

        {/* Informations système */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">ℹ️ Informations Système</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>Timezone:</strong> Africa/Abidjan</li>
            <li>• <strong>Devise:</strong> FCFA (XOF)</li>
            <li>• <strong>Auth:</strong> Dual (Email/Téléphone)</li>
            <li>• <strong>Paiement:</strong> Wave CI (prioritaire)</li>
            <li>• <strong>Sports:</strong> Padel, Football</li>
          </ul>
        </div>

        {/* Prochaines étapes */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h3 className="font-semibold text-yellow-800 mb-2">🎯 Prochaines Étapes</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Configurer les variables d'environnement (.env.local)</li>
            <li>Appliquer les migrations: <code>npm run db:migrate</code></li>
            <li>Charger les données de test: <code>npm run db:seed</code></li>
            <li>Créer un utilisateur admin via Supabase Dashboard</li>
            <li>Configurer les clés Wave CI pour les paiements</li>
          </ol>
        </div>
      </div>
    </div>
  )
}