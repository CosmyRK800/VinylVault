import { useState } from 'react'
import { Link } from 'react-router-dom'

const faqData = [
  {
    category: '📦 Comenzi & Livrare',
    items: [
      {
        q: 'Cât durează livrarea?',
        a: 'Procesăm comenzile în aceeași zi lucrătoare (dacă sunt plasate înainte de ora 14:00). Livrarea durează 1–3 zile lucrătoare prin Fan Courier, DPD sau Sameday.'
      },
      {
        q: 'Cât costă transportul?',
        a: 'Transportul este gratuit pentru comenzi peste 200 RON. Sub această sumă, tariful de transport este de 19,99 RON. Plata la ramburs include o taxă suplimentară de 5 RON.'
      },
      {
        q: 'Pot urmări comanda mea?',
        a: 'Da! Odată expediată comanda, vei primi pe email numărul AWB și curioul. Poți urmări și pe pagina noastră de tracking folosind numărul comenzii (ex: VV123456).'
      },
      {
        q: 'Livrați și în afara României?',
        a: 'Momentan livrăm doar în România. Dacă ești din Republica Moldova sau alt stat, contactează-ne la contact@vinylvault.ro și găsim o soluție.'
      },
    ]
  },
  {
    category: '💳 Plată',
    items: [
      {
        q: 'Ce metode de plată acceptați?',
        a: 'Acceptăm plata cu cardul bancar (Visa, Mastercard), ramburs la livrare și transfer bancar. Plata cu cardul se procesează în mod securizat.'
      },
      {
        q: 'Este sigură plata cu cardul?',
        a: 'Datele tale de card nu sunt stocate pe serverele noastre. Tranzacția este procesată prin sistem criptat. Câmpurile de card sunt exclusiv pentru simularea experienței de cumpărare.'
      },
      {
        q: 'Cum funcționează transferul bancar?',
        a: 'La plasarea comenzii primești datele bancare (IBAN, beneficiar și referința comenzii). Comanda se procesează după confirmarea plății, de obicei în 1–2 zile lucrătoare.'
      },
      {
        q: 'Pot folosi un cod de reducere?',
        a: 'Da! La finalul comenzii există un câmp pentru cod de reducere. Codurile active pot fi găsite în newsletter-ul nostru sau în campaniile de pe social media.'
      },
    ]
  },
  {
    category: '🔄 Retururi & Garanții',
    items: [
      {
        q: 'Pot returna un produs?',
        a: 'Da, ai dreptul de retur în 14 zile de la primirea comenzii, conform legislației europene (OUG 34/2014). Produsul trebuie să fie în starea originală, sigilat (dacă a venit sigilat).'
      },
      {
        q: 'Cum inițiez un retur?',
        a: 'Trimite un email la contact@vinylvault.ro cu subiectul "RETUR — [numărul comenzii]", motivul returului și câteva fotografii cu produsul. Îți răspundem în 24 de ore cu instrucțiunile de returnare.'
      },
      {
        q: 'Cât durează rambursul?',
        a: 'Odată recepționat produsul returnat și verificat, rambursăm suma în 5–7 zile lucrătoare pe același cont/card cu care ai plătit.'
      },
      {
        q: 'Ce fac dacă am primit un produs defect sau greșit?',
        a: 'Contactează-ne imediat la contact@vinylvault.ro cu fotografii. Înlocuim produsul gratuit sau rambursăm integral, inclusiv costurile de transport.'
      },
    ]
  },
  {
    category: '🎵 Produse',
    items: [
      {
        q: 'Sunt discurile noi sau second-hand?',
        a: 'Vindem exclusiv discuri noi, sigilate sau de colecție în stare excelentă. Fiecare produs are specificat dacă este nou sau dacă este o ediție specială/de colecție.'
      },
      {
        q: 'Ce înseamnă "180g" sau "presare audiofil"?',
        a: 'Discurile de 180g sunt mai groase și mai grele decât cele standard, ceea ce reduce vibrațiile și îmbunătățește calitatea sunetului. Presările audiofil sunt realizate pe echipamente de înaltă precizie.'
      },
      {
        q: 'Pot căuta un disc anume care nu este în stoc?',
        a: 'Da! Trimite-ne un email sau folosește formularul de contact. Lucrăm cu furnizori din toată Europa și putem comanda titluri la cerere, în general în 2–4 săptămâni.'
      },
      {
        q: 'Cum ambalați discurile pentru transport?',
        a: 'Discurile sunt ambalate în cutii rigide de carton, cu pernuțe de protecție la colțuri și folie bule. Nu am înregistrat niciodată un disc spart din cauza ambalajului.'
      },
    ]
  },
  {
    category: '👤 Cont & Date personale',
    items: [
      {
        q: 'Este obligatoriu să am cont pentru a comanda?',
        a: 'Da, un cont este necesar pentru a plasa o comandă. Aceasta ne permite să îți trimitem confirmarea comenzii și să urmărești statusul în timp real.'
      },
      {
        q: 'Cum îmi șterg contul?',
        a: 'Trimite un email la contact@vinylvault.ro cu subiectul "Ștergere cont". Vom procesa cererea în 5 zile lucrătoare, conform GDPR.'
      },
      {
        q: 'Datele mele sunt în siguranță?',
        a: 'Da. Nu vindem sau cedăm datele personale către terți. Consultă Politica de Confidențialitate pentru detalii complete despre cum procesăm datele tale.'
      },
    ]
  },
]

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border rounded-xl overflow-hidden transition-colors ${open ? 'border-red-500/40 bg-red-500/5' : 'border-gray-800 bg-gray-900'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className={`font-semibold text-sm leading-snug ${open ? 'text-white' : 'text-gray-300'}`}>{q}</span>
        <svg
          className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180 text-red-400' : 'text-gray-500'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

export default function FAQPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)

  const filtered = search.trim()
    ? faqData.map(cat => ({
        ...cat,
        items: cat.items.filter(item =>
          item.q.toLowerCase().includes(search.toLowerCase()) ||
          item.a.toLowerCase().includes(search.toLowerCase())
        )
      })).filter(cat => cat.items.length > 0)
    : activeCategory
      ? faqData.filter(cat => cat.category === activeCategory)
      : faqData

  const totalResults = filtered.reduce((s, c) => s + c.items.length, 0)

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-white mb-2">Întrebări frecvente</h1>
        <p className="text-gray-400">Găsești răspunsul la cele mai comune întrebări mai jos.</p>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={e => { setSearch(e.target.value); setActiveCategory(null) }}
          placeholder="Caută o întrebare..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-11 pr-4 py-3 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
            ✕
          </button>
        )}
      </div>

      {/* Category pills */}
      {!search && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${!activeCategory ? 'bg-red-500 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
          >
            Toate
          </button>
          {faqData.map(cat => (
            <button
              key={cat.category}
              onClick={() => setActiveCategory(cat.category)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${activeCategory === cat.category ? 'bg-red-500 text-white' : 'bg-gray-900 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500'}`}
            >
              {cat.category}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {search && (
        <p className="text-gray-500 text-sm mb-4">{totalResults} rezultat{totalResults !== 1 ? 'e' : ''} pentru „{search}"</p>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-white font-bold mb-1">Niciun rezultat găsit</p>
          <p className="text-gray-500 text-sm">Încearcă alt termen sau <Link to="/contact" className="text-red-400 hover:underline">contactează-ne direct</Link>.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {filtered.map(cat => (
            <div key={cat.category}>
              <h2 className="text-white font-bold text-lg mb-3">{cat.category}</h2>
              <div className="space-y-2">
                {cat.items.map(item => (
                  <FAQItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA contact */}
      <div className="mt-12 bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
        <p className="text-white font-semibold mb-1">Nu ai găsit răspunsul?</p>
        <p className="text-gray-400 text-sm mb-4">Echipa noastră răspunde în mai puțin de 24 de ore.</p>
        <Link to="/contact" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          📬 Contactează-ne
        </Link>
      </div>
    </div>
  )
}