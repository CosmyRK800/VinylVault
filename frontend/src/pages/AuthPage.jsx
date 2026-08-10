import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'

import { useAuthStore } from '../store/authStore'

function InputField({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
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
          autoComplete={autoComplete}
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

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuthStore()

  // ?mode=register pentru a deschide direct tab-ul de înregistrare
  const defaultTab = new URLSearchParams(location.search).get('mode') === 'register' ? 'register' : 'login'
  const [tab, setTab] = useState(defaultTab)
  const from = location.state?.from || '/'

  // Login state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors] = useState({})
  const [loginLoading, setLoginLoading] = useState(false)

  // Register state
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' })
  const [regErrors, setRegErrors] = useState({})
  const [regLoading, setRegLoading] = useState(false)
  const [regSuccess, setRegSuccess] = useState(false)

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!loginForm.email.trim()) errors.email = 'Câmp obligatoriu'
    if (!loginForm.password) errors.password = 'Câmp obligatoriu'
    if (Object.keys(errors).length) { setLoginErrors(errors); return }

    setLoginLoading(true)
    const result = await login(loginForm.email, loginForm.password)
    setLoginLoading(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setLoginErrors({ general: result.error })
    }
  }

  /* ── REGISTER ── */
  const handleRegister = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!regForm.firstName.trim()) errors.firstName = 'Câmp obligatoriu'
    if (!regForm.lastName.trim()) errors.lastName = 'Câmp obligatoriu'
    if (!regForm.email.trim()) errors.email = 'Câmp obligatoriu'
    else if (!/\S+@\S+\.\S+/.test(regForm.email)) errors.email = 'Email invalid'
    if (!regForm.password) errors.password = 'Câmp obligatoriu'
    else if (regForm.password.length < 6) errors.password = 'Minim 6 caractere'
    if (regForm.password !== regForm.confirm) errors.confirm = 'Parolele nu coincid'
    if (Object.keys(errors).length) { setRegErrors(errors); return }

    setRegLoading(true)
    const result = await register(regForm.firstName, regForm.lastName, regForm.email, regForm.password)
    setRegLoading(false)

    if (result.success) {
      setRegSuccess(true)
      setTimeout(() => navigate(from, { replace: true }), 1500)
    } else {
      setRegErrors({ general: result.error })
    }
  }

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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            {[['login', 'Autentificare'], ['register', 'Cont nou']].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-1 py-4 text-sm font-bold transition-colors ${
                  tab === id
                    ? 'text-white border-b-2 border-red-500 -mb-px'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-6">

            {/* ── LOGIN FORM ── */}
            {tab === 'login' && (
              <form onSubmit={handleLogin} className="space-y-4">
                {loginErrors.general && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                    {loginErrors.general}
                  </div>
                )}
                <InputField
                  label="Email"
                  type="email"
                  value={loginForm.email}
                  onChange={e => { setLoginForm(f => ({ ...f, email: e.target.value })); setLoginErrors(err => ({ ...err, email: '', general: '' })) }}
                  placeholder="email@exemplu.com"
                  error={loginErrors.email}
                  autoComplete="email"
                />
                <div>
                  <InputField
                    label="Parolă"
                    type="password"
                    value={loginForm.password}
                    onChange={e => { setLoginForm(f => ({ ...f, password: e.target.value })); setLoginErrors(err => ({ ...err, password: '', general: '' })) }}
                    placeholder="••••••••"
                    error={loginErrors.password}
                    autoComplete="current-password"
                  />
                  <div className="text-right mt-1.5">
                    <Link
                      to="/reset-password"
                      className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    >
                      Am uitat parola
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Se autentifică...
                    </>
                  ) : 'Autentifică-te'}
                </button>

                <p className="text-center text-xs text-gray-500">
                  Nu ai cont?{' '}
                  <button type="button" onClick={() => setTab('register')} className="text-red-400 hover:text-red-300 font-semibold">
                    Creează unul acum
                  </button>
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
            {tab === 'register' && (
              <>
                {regSuccess ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-white font-bold text-lg mb-1">Cont creat cu succes!</p>
                    <p className="text-gray-500 text-sm">Ești autentificat. Redirecționare...</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    {regErrors.general && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                        {regErrors.general}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <InputField
                        label="Prenume"
                        value={regForm.firstName}
                        onChange={e => { setRegForm(f => ({ ...f, firstName: e.target.value })); setRegErrors(err => ({ ...err, firstName: '' })) }}
                        error={regErrors.firstName}
                        autoComplete="given-name"
                      />
                      <InputField
                        label="Nume"
                        value={regForm.lastName}
                        onChange={e => { setRegForm(f => ({ ...f, lastName: e.target.value })); setRegErrors(err => ({ ...err, lastName: '' })) }}
                        error={regErrors.lastName}
                        autoComplete="family-name"
                      />
                    </div>
                    <InputField
                      label="Email"
                      type="email"
                      value={regForm.email}
                      onChange={e => { setRegForm(f => ({ ...f, email: e.target.value })); setRegErrors(err => ({ ...err, email: '', general: '' })) }}
                      placeholder="email@exemplu.com"
                      error={regErrors.email}
                      autoComplete="email"
                    />
                    <InputField
                      label="Parolă"
                      type="password"
                      value={regForm.password}
                      onChange={e => { setRegForm(f => ({ ...f, password: e.target.value })); setRegErrors(err => ({ ...err, password: '' })) }}
                      placeholder="Minim 6 caractere"
                      error={regErrors.password}
                      autoComplete="new-password"
                    />
                    <InputField
                      label="Confirmă parola"
                      type="password"
                      value={regForm.confirm}
                      onChange={e => { setRegForm(f => ({ ...f, confirm: e.target.value })); setRegErrors(err => ({ ...err, confirm: '' })) }}
                      placeholder="Repetă parola"
                      error={regErrors.confirm}
                      autoComplete="new-password"
                    />

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      {regLoading ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Se creează contul...
                        </>
                      ) : 'Creează cont'}
                    </button>

                    <p className="text-center text-xs text-gray-500">
                      Ai deja cont?{' '}
                      <button type="button" onClick={() => setTab('login')} className="text-red-400 hover:text-red-300 font-semibold">
                        Autentifică-te
                      </button>
                    </p>
                  </form>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}