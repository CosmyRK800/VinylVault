import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function GDPRBanner() {
  const [visible, setVisible] = useState(false)
  const [animOut, setAnimOut] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('gdpr_consent')
    if (!consent) {
      // Mic delay ca să nu apară instant la prima randare
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('gdpr_consent', 'accepted')
    localStorage.setItem('gdpr_consent_date', new Date().toISOString())
    close()
  }

  const handleDecline = () => {
    localStorage.setItem('gdpr_consent', 'declined')
    localStorage.setItem('gdpr_consent_date', new Date().toISOString())
    close()
  }

  const close = () => {
    setAnimOut(true)
    setTimeout(() => setVisible(false), 400)
  }

  if (!visible) return null

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[100] transition-transform duration-400 ease-in-out ${
        animOut ? 'translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Overlay subtle pe mobile */}
      <div className="bg-gradient-to-t from-black/60 to-transparent h-8 pointer-events-none" />

      <div className="bg-gray-950 border-t border-gray-700 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">

            {/* Icon + Text */}
            <div className="flex items-start gap-3 flex-1">
              <span className="text-2xl flex-shrink-0 mt-0.5">🍪</span>
              <div>
                <p className="text-white font-semibold text-sm mb-1">
                  Folosim cookie-uri pentru o experiență mai bună
                </p>
                <p className="text-gray-400 text-xs leading-relaxed">
                  Acest site folosește cookie-uri esențiale pentru funcționare și cookie-uri analitice
                  pentru a îmbunătăți experiența ta. Prin continuarea navigării, ești de acord cu{' '}
                  <Link
                    to="/privacy"
                    className="text-red-400 hover:text-red-300 underline underline-offset-2"
                  >
                    Politica de Confidențialitate
                  </Link>
                  .
                </p>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 rounded-xl transition-colors"
              >
                Refuz
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
              >
                Accept toate
              </button>
            </div>
          </div>

          {/* Links suplimentare */}
          <div className="flex gap-4 mt-3 ml-9">
            <Link to="/terms" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Termeni și Condiții
            </Link>
            <Link to="/returns" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Drept de Retur
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}