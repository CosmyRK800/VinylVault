import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function InputField({ label, type = 'text', value, onChange, placeholder, error }) {
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  return (
    <div>
      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${
            error ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
          >
            {show ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

// ── Sub-pagina 1: Cerere resetare ────────────────────────────────────────────
function RequestResetForm() {
  const { requestPasswordReset } = useAuthStore()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [devToken, setDevToken] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) { setError('Câmp obligatoriu'); return }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Email invalid'); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 800)) // simulăm delay server
    const result = requestPasswordReset(email)
    setLoading(false)

    setSent(true)
    if (result.devToken) setDevToken(result.devToken)
  }

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Email trimis!</h2>
        <p className="text-gray-400 text-sm mb-4">
          Dacă adresa <strong className="text-white">{email}</strong> este înregistrată, vei primi un link de resetare în câteva minute.
        </p>
        <p className="text-gray-500 text-xs mb-4">Verifică și folderul Spam dacă nu găsești emailul.</p>



        <Link
          to="/auth"
          className="text-red-400 hover:text-red-300 text-sm font-semibold"
        >
          ← Înapoi la autentificare
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <div className="text-4xl mb-3">🔑</div>
        <h2 className="text-white font-bold text-lg">Ai uitat parola?</h2>
        <p className="text-gray-500 text-sm mt-1">
          Introdu emailul contului tău și îți trimitem un link de resetare.
        </p>
      </div>

      <InputField
        label="Email"
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        placeholder="email@exemplu.com"
        error={error}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Se trimite...
          </>
        ) : 'Trimite link de resetare'}
      </button>

      <p className="text-center text-xs text-gray-500">
        Ți-ai amintit parola?{' '}
        <Link to="/auth" className="text-red-400 hover:text-red-300 font-semibold">
          Autentifică-te
        </Link>
      </p>
    </form>
  )
}

// ── Sub-pagina 2: Resetare cu token ─────────────────────────────────────────
function ResetWithTokenForm({ token }) {
  const { validateResetToken, resetPassword } = useAuthStore()
  const navigate = useNavigate()

  const [form, setForm] = useState({ password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [tokenError, setTokenError] = useState(null)

  // Validăm token-ul la montare
  useEffect(() => {
    const validation = validateResetToken(token)
    if (!validation.valid) {
      setTokenError(validation.error)
    }
  }, [token])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = {}
    if (!form.password) errs.password = 'Câmp obligatoriu'
    else if (form.password.length < 6) errs.password = 'Minim 6 caractere'
    if (form.password !== form.confirm) errs.confirm = 'Parolele nu coincid'
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    const result = resetPassword(token, form.password)
    setLoading(false)

    if (result.success) {
      setDone(true)
      setTimeout(() => navigate('/auth'), 2500)
    } else {
      setTokenError(result.error)
    }
  }

  if (tokenError) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 border-2 border-red-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Link invalid</h2>
        <p className="text-gray-400 text-sm mb-6">{tokenError}</p>
        <Link
          to="/reset-password"
          className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm"
        >
          Solicită un link nou
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-white font-bold text-lg mb-2">Parolă schimbată!</h2>
        <p className="text-gray-400 text-sm">Ești redirecționat la pagina de autentificare...</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-2">
        <div className="text-4xl mb-3">🔐</div>
        <h2 className="text-white font-bold text-lg">Setează parola nouă</h2>
        <p className="text-gray-500 text-sm mt-1">Alege o parolă nouă pentru contul tău.</p>
      </div>

      <InputField
        label="Parolă nouă"
        type="password"
        value={form.password}
        onChange={e => { setForm(f => ({ ...f, password: e.target.value })); setErrors(err => ({ ...err, password: '' })) }}
        placeholder="Minim 6 caractere"
        error={errors.password}
      />
      <InputField
        label="Confirmă parola nouă"
        type="password"
        value={form.confirm}
        onChange={e => { setForm(f => ({ ...f, confirm: e.target.value })); setErrors(err => ({ ...err, confirm: '' })) }}
        placeholder="Repetă parola"
        error={errors.confirm}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Se salvează...
          </>
        ) : 'Salvează parola nouă'}
      </button>
    </form>
  )
}

// ── Pagina principală ────────────────────────────────────────────────────────
export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-black">
            <span className="text-red-500">Vinyl</span><span className="text-white">Vault</span>
          </Link>
          <p className="text-gray-500 text-sm mt-2">Muzică fizică pentru suflete reale</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          {token ? (
            <ResetWithTokenForm token={token} />
          ) : (
            <RequestResetForm />
          )}
        </div>
      </div>
    </div>
  )
}