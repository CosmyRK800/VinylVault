import { useState } from 'react'
import { Link } from 'react-router-dom'
import { formatPrice } from '../utils/format'

const ORDER_STEPS = ['Plasată', 'Procesată', 'Expediată', 'Livrată']

const statusColors = {
  'Plasată':   'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Procesată': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Expediată': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Livrată':   'text-green-400 bg-green-400/10 border-green-400/30',
  'Returnată': 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  'Anulată':   'text-red-400 bg-red-400/10 border-red-400/30',
}

const statusIcons = {
  'Plasată': '📋', 'Procesată': '⚙️', 'Expediată': '🚚', 'Livrată': '✅',
  'Returnată': '↩️', 'Anulată': '❌',
}

const statusDescriptions = {
  'Plasată':   'Comanda ta a fost primită și urmează să fie procesată.',
  'Procesată': 'Pregătim comanda ta pentru expediere.',
  'Expediată': 'Comanda este în drum spre tine!',
  'Livrată':   'Comanda a fost livrată cu succes. Bucură-te de muzică!',
  'Returnată': 'Comanda a fost returnată.',
  'Anulată':   'Comanda a fost anulată.',
}

function getStepIndex(status) {
  return ORDER_STEPS.indexOf(status)
}

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState('')
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleTrack = (e) => {
    e.preventDefault()
    setError('')
    setResult(null)

    const num = orderNumber.trim().toUpperCase()
    const em = email.trim().toLowerCase()

    if (!num || !em) { setError('Completează ambele câmpuri.'); return }
    if (!num.startsWith('VV')) { setError('Numărul de comandă trebuie să înceapă cu VV (ex: VV123456).'); return }
    if (!/\S+@\S+\.\S+/.test(em)) { setError('Email invalid.'); return }

    setLoading(true)

    setTimeout(() => {
      try {
        const raw = localStorage.getItem('vinyl-auth')
        if (!raw) { setError('Nu am găsit nicio comandă cu aceste date.'); setLoading(false); return }

        const parsed = JSON.parse(raw)
        const allOrders = parsed?.state?.orders || []

        // Căutăm după număr comandă + email (din users sau din câmpul email)
        const allUsers = parsed?.state?.users || []

        const order = allOrders.find(o => {
          const matchNum = o.orderNumber === num
          if (!matchNum) return false

          // Găsim emailul userului după userId
          const userObj = allUsers.find(u => u.id === o.userId)
          const userEmail = userObj?.email?.toLowerCase() || ''
          // Sau emailul poate fi salvat direct pe comandă
          const directEmail = (o.email || '').toLowerCase()

          return userEmail === em || directEmail === em
        })

        if (!order) {
          setError('Nu am găsit nicio comandă cu numărul și emailul introdus. Verifică datele și încearcă din nou.')
        } else {
          setResult(order)
        }
      } catch {
        setError('A apărut o eroare internă. Încearcă din nou.')
      }
      setLoading(false)
    }, 600)
  }

  const stepIdx = result ? getStepIndex(result.status) : -1
  const isSpecialStatus = result && ['Anulată', 'Returnată'].includes(result.status)

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <div className="text-5xl mb-4">📦</div>
        <h1 className="text-4xl font-black text-white mb-2">Urmărește comanda</h1>
        <p className="text-gray-400 text-sm">Introdu numărul comenzii și emailul cu care ai comandat.</p>
      </div>

      {/* Formular */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <form onSubmit={handleTrack} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
              Număr comandă <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={orderNumber}
              onChange={e => setOrderNumber(e.target.value.toUpperCase())}
              placeholder="ex: VV123456"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors font-mono"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
              Email comandă <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@exemplu.com"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Se caută...
              </>
            ) : '🔍 Caută comanda'}
          </button>
        </form>
      </div>

      {/* Rezultat */}
      {result && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          {/* Header status */}
          <div className={`p-5 border-b border-gray-800 ${isSpecialStatus ? 'bg-gray-800/50' : 'bg-gray-800/30'}`}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Comanda</p>
                <p className="text-white font-black text-xl">{result.orderNumber}</p>
              </div>
              <span className={`text-sm px-3 py-1.5 rounded-full border font-bold ${statusColors[result.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                {statusIcons[result.status]} {result.status}
              </span>
            </div>
            <p className="text-gray-400 text-sm mt-2">{statusDescriptions[result.status]}</p>
          </div>

          {/* Progress bar */}
          {!isSpecialStatus && (
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center justify-between relative">
                {/* Linia de progres */}
                <div className="absolute left-4 right-4 top-4 h-0.5 bg-gray-700 z-0">
                  <div
                    className="h-full bg-red-500 transition-all duration-700"
                    style={{ width: stepIdx < 0 ? '0%' : `${(stepIdx / (ORDER_STEPS.length - 1)) * 100}%` }}
                  />
                </div>

                {ORDER_STEPS.map((step, i) => {
                  const done = i <= stepIdx
                  const current = i === stepIdx
                  return (
                    <div key={step} className="flex flex-col items-center z-10">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'bg-gray-900 border-gray-700 text-gray-600'
                      } ${current ? 'ring-4 ring-red-500/20' : ''}`}>
                        {done ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs font-bold">{i + 1}</span>
                        )}
                      </div>
                      <p className={`text-xs mt-2 font-semibold text-center ${done ? 'text-white' : 'text-gray-600'}`}>
                        {step}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* AWB dacă expediată */}
          {result.awb && (
            <div className="mx-5 mt-4 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <p className="text-purple-400 text-xs font-semibold uppercase tracking-wide mb-2">📦 Detalii expediere</p>
              <div className="space-y-1">
                <p className="text-white text-sm">Curier: <span className="font-semibold">{result.courier}</span></p>
                <p className="text-white text-sm font-mono">AWB: <span className="text-purple-300">{result.awb}</span></p>
              </div>
            </div>
          )}

          {/* Produse */}
          <div className="p-5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Produse ({result.items?.length || 0})</p>
            <div className="space-y-2 mb-5">
              {(result.items || []).map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  {item.images?.[0] && (
                    <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0 bg-gray-800"
                      onError={e => { e.target.style.display = 'none' }} />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">×{item.quantity}</p>
                  </div>
                  <span className="text-white text-sm font-bold">{formatPrice((item.finalPrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Info */}
            <div className="border-t border-gray-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Data plasării</span>
                <span className="text-white">{new Date(result.date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Adresă livrare</span>
                <span className="text-white text-right max-w-[60%]">{result.deliveryAddress}, {result.deliveryCity}</span>
              </div>
              <div className="flex justify-between text-sm font-bold">
                <span className="text-gray-400">Total plătit</span>
                <span className="text-red-400 text-lg">{formatPrice(result.total)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-3 flex-wrap">
            <Link to="/catalog" className="flex-1 text-center border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              🎵 Catalog
            </Link>
            <Link to="/contact" className="flex-1 text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              📬 Contact
            </Link>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 bg-gray-900/50 border border-gray-800 rounded-xl p-4 text-sm text-gray-500">
        <p className="font-semibold text-gray-400 mb-1">💡 Unde găsesc numărul comenzii?</p>
        <p>Numărul comenzii (format VV + 6 cifre) se află în emailul de confirmare primit după plasarea comenzii. Poți găsi și în secțiunea <Link to="/account" className="text-red-400 hover:underline">Contul meu → Comenzi</Link> dacă ești autentificat.</p>
      </div>
    </div>
  )
}