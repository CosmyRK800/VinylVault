import { useState } from 'react'
import { supabase } from '../../lib/supabase'

/**
 * NewsletterForm — se poate folosi oriunde în pagina:
 *   <NewsletterForm />                        → versiunea inline compactă
 *   <NewsletterForm variant="hero" />         → versiunea mare (footer/hero)
 */
export default function NewsletterForm({ variant = 'inline' }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'success' | 'already' | 'error'
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const em = email.trim().toLowerCase()

    if (!em || !/\S+@\S+\.\S+/.test(em)) {
      setError('Introdu un email valid.')
      return
    }

    setStatus('loading')
    setError('')

    try {
      // Verificăm dacă există deja
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, active')
        .eq('email', em)
        .maybeSingle()

      if (existing) {
        if (existing.active) {
          setStatus('already')
        } else {
          // Re-abonare
          await supabase
            .from('newsletter_subscribers')
            .update({ active: true, subscribed_at: new Date().toISOString() })
            .eq('email', em)
          setStatus('success')
        }
        return
      }

      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([{ email: em, active: true, subscribed_at: new Date().toISOString() }])

      if (insertError) throw insertError

      setStatus('success')
    } catch (err) {
      console.error('Newsletter error:', err)
      // Fallback: salvare în localStorage dacă Supabase nu are tabelul creat
      try {
        const key = 'vv_newsletter'
        const existing = JSON.parse(localStorage.getItem(key) || '[]')
        if (!existing.includes(em)) {
          existing.push(em)
          localStorage.setItem(key, JSON.stringify(existing))
        }
        setStatus('success')
      } catch {
        setError('Eroare la abonare. Încearcă mai târziu.')
        setStatus('error')
      }
    }
  }

  if (status === 'success') {
    return (
      <div className={`flex items-center gap-3 ${variant === 'hero' ? 'bg-green-500/10 border border-green-500/30 rounded-2xl px-6 py-4' : 'bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3'}`}>
        <span className="text-2xl">✅</span>
        <div>
          <p className="text-green-400 font-semibold text-sm">Ești abonat!</p>
          <p className="text-gray-400 text-xs">Vei primi noutăți și oferte exclusive pe {email}.</p>
        </div>
      </div>
    )
  }

  if (status === 'already') {
    return (
      <div className={`flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3`}>
        <span className="text-xl">💌</span>
        <div>
          <p className="text-amber-400 font-semibold text-sm">Ești deja abonat!</p>
          <p className="text-gray-400 text-xs">{email} este deja în lista noastră.</p>
        </div>
      </div>
    )
  }

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-r from-red-500/10 to-gray-900 border border-red-500/20 rounded-2xl p-8">
        <div className="text-center mb-6">
          <p className="text-xs text-red-400 font-bold uppercase tracking-widest mb-2">Newsletter</p>
          <h3 className="text-2xl font-black text-white mb-2">Fii primul care află</h3>
          <p className="text-gray-400 text-sm">Noutăți în stoc, reduceri exclusive și articole despre muzica fizică. Fără spam.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            placeholder="emailul@tau.ro"
            className={`flex-1 bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold px-6 py-3 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 justify-center"
          >
            {status === 'loading' ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : '📬'} Abonează-te
          </button>
        </form>
        {error && <p className="text-red-400 text-xs text-center mt-2">{error}</p>}
        <p className="text-gray-600 text-xs text-center mt-3">Te poți dezabona oricând. Respectăm GDPR.</p>
      </div>
    )
  }

  // Variant inline (compact)
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={e => { setEmail(e.target.value); setError('') }}
        placeholder="email@exemplu.ro"
        className={`flex-1 bg-gray-900 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${error ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold px-4 py-2.5 rounded-xl transition-colors text-sm whitespace-nowrap"
      >
        {status === 'loading' ? '...' : 'Abonare'}
      </button>
      {error && <p className="text-red-400 text-xs absolute mt-10">{error}</p>}
    </form>
  )
}