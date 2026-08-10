import { useState } from 'react'
import emailjs from '@emailjs/browser'

const EMAILJS_SERVICE_ID  = 'service_qlj9f2a'
const EMAILJS_TEMPLATE_ID = 'template_bj79797'
const EMAILJS_PUBLIC_KEY  = '8m53lTyoSDA_t-UTd'

const subjects = [
  'Întrebare despre un produs',
  'Problemă cu o comandă',
  'Retur / Schimb',
  'Reclamație',
  'Colaborare / Parteneriat',
  'Altceva',
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [sendError, setSendError] = useState('')

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }))
    if (errors[k]) setErrors(e => ({ ...e, [k]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Câmp obligatoriu'
    if (!form.email.trim()) e.email = 'Câmp obligatoriu'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email invalid'
    if (!form.subject) e.subject = 'Alege un subiect'
    if (!form.message.trim()) e.message = 'Câmp obligatoriu'
    else if (form.message.trim().length < 20) e.message = 'Minim 20 de caractere'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setSending(true)
    setSendError('')
    try {
      await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: 'contact@vinylvault.ro',
          email_body: `
            <div style="font-family:Arial;background:#111;color:#eee;padding:32px;border-radius:12px;max-width:600px;">
              <h2 style="color:#ef4444;margin-bottom:24px;">📬 Mesaj nou prin formularul de contact</h2>
              <p><strong>Nume:</strong> ${form.name}</p>
              <p><strong>Email:</strong> ${form.email}</p>
              <p><strong>Subiect:</strong> ${form.subject}</p>
              <hr style="border-color:#333;margin:20px 0;" />
              <p style="white-space:pre-wrap;">${form.message}</p>
            </div>
          `,
        },
        EMAILJS_PUBLIC_KEY
      )
      setSent(true)
    } catch (err) {
      console.error(err)
      setSendError('A apărut o eroare la trimitere. Încearcă din nou sau scrie-ne direct la contact@vinylvault.ro')
    }
    setSending(false)
  }

  const Field = ({ label, k, type = 'text', placeholder, required }) => (
    <div>
      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} value={form[k]} onChange={e => set(k, e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${errors[k] ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
      />
      {errors[k] && <p className="text-red-400 text-xs mt-1">{errors[k]}</p>}
    </div>
  )

  if (sent) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <h2 className="text-2xl font-black text-white mb-2">Mesaj trimis!</h2>
      <p className="text-gray-400 mb-1">Îți mulțumim pentru mesaj, <span className="text-white font-semibold">{form.name}</span>.</p>
      <p className="text-gray-500 text-sm mb-8">Vom răspunde în maximum 24 de ore la adresa <span className="text-white">{form.email}</span>.</p>
      <button onClick={() => { setSent(false); setForm({ name: '', email: '', subject: '', message: '' }) }}
        className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Trimite un alt mesaj
      </button>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-black text-white mb-2">Contact</h1>
        <p className="text-gray-400">Avem o echipă mică, dar răspundem rapid. Scrie-ne oricând.</p>
      </div>

      <div className="grid md:grid-cols-5 gap-10">
        {/* Formular */}
        <div className="md:col-span-3">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <h2 className="text-white font-bold text-lg mb-5">Trimite un mesaj</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Nume complet" k="name" placeholder="Ion Popescu" required />
                <Field label="Email" k="email" type="email" placeholder="ion@email.com" required />
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Subiect <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.subject}
                  onChange={e => set('subject', e.target.value)}
                  className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${errors.subject ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
                >
                  <option value="">Alege subiectul...</option>
                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                  Mesaj <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={e => set('message', e.target.value)}
                  rows={5}
                  placeholder="Descrie problema sau întrebarea ta..."
                  className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors resize-none ${errors.message ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                <p className="text-gray-600 text-xs mt-1 text-right">{form.message.length} caractere</p>
              </div>

              {sendError && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
                  {sendError}
                </div>
              )}

              <button
                type="submit"
                disabled={sending}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Se trimite...
                  </>
                ) : '📬 Trimite mesajul'}
              </button>
            </form>
          </div>
        </div>

        {/* Info lateral */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-red-400 font-semibold text-sm uppercase tracking-wide mb-4">Date de contact</p>
            <div className="space-y-3">
              {[
                { icon: '📧', label: 'Email', value: 'contact@vinylvault.ro' },
                { icon: '📍', label: 'Sediu', value: 'Str. Muzicii 12, București, România' },
                { icon: '🕐', label: 'Program', value: 'Luni–Vineri: 09:00–18:00' },
              ].map(item => (
                <div key={item.label} className="flex gap-3">
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wide">{item.label}</p>
                    <p className="text-white text-sm">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-red-400 font-semibold text-sm uppercase tracking-wide mb-3">Timp de răspuns</p>
            <p className="text-gray-400 text-sm">Răspundem la toate mesajele în maximum <span className="text-white font-semibold">24 de ore lucrătoare</span>.</p>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <p className="text-red-400 font-semibold text-sm mb-2">🔄 Vrei să returnezi un produs?</p>
            <p className="text-gray-400 text-sm">Consultă <a href="/returns" className="text-red-400 hover:underline">pagina noastră de retur</a>. Ai 14 zile de la livrare.</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <p className="text-red-400 font-semibold text-sm uppercase tracking-wide mb-3">Urmărește comanda</p>
            <p className="text-gray-400 text-sm mb-3">Ai un număr de comandă? Verifică statusul fără să te autentifici.</p>
            <a href="/track" className="block w-full text-center bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              📦 Urmărește comanda →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}