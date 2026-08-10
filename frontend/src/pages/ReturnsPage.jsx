import { Link } from 'react-router-dom'

function Section({ title, children }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
        {title}
      </h2>
      <div className="text-gray-400 text-sm leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function StepCard({ number, title, description }) {
  return (
    <div className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="w-9 h-9 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0">
        <span className="text-red-400 font-black text-sm">{number}</span>
      </div>
      <div>
        <p className="text-white font-semibold text-sm mb-1">{title}</p>
        <p className="text-gray-400 text-xs leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function ReturnsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <Link to="/" className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1 mb-6 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Înapoi la pagina principală
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">↩️</span>
          <h1 className="text-3xl font-black text-white">Drept de Retur</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Ultima actualizare: <span className="text-gray-400">1 Ianuarie 2026</span>
        </p>

        {/* Highlight box */}
        <div className="mt-6 bg-green-500/10 border border-green-500/30 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">✅</span>
            <p className="text-green-300 font-black text-xl">14 zile retur gratuit</p>
          </div>
          <p className="text-gray-400 text-sm">
            Conform <strong className="text-white">OUG 34/2014</strong> privind drepturile consumatorilor,
            ai dreptul să returnezi orice produs în termen de 14 zile calendaristice de la livrare,
            fără a fi nevoie să oferi o justificare.
          </p>
        </div>
      </div>

      <Section title="1. Condiții de retur">
        <p>Pentru a beneficia de dreptul de retur, produsul trebuie să îndeplinească următoarele condiții:</p>
        <div className="grid gap-3">
          {[
            ['✅ Stare originală', 'Produsul nu a fost deschis, utilizat sau deteriorat de tine'],
            ['✅ Ambalaj intact', 'Ambalajul original este prezent și neatins'],
            ['✅ Documente incluse', 'Factura sau dovada de cumpărare este inclusă în colet'],
            ['✅ Termen respectat', 'Solicitarea este transmisă în cel mult 14 zile de la primire'],
          ].map(([stare, desc]) => (
            <div key={stare} className="flex gap-3 items-start">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0" />
              <p><strong className="text-white">{stare.replace('✅ ', '')}</strong> — {desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 mt-2">
          <p className="text-amber-300 font-semibold text-sm mb-2">⚠️ Produse excluse de la retur</p>
          <ul className="text-amber-200/70 text-xs space-y-1">
            <li>• Produse cu sigiliu rupt sau ambalaj deschis (vinyluri, CD-uri sigilate)</li>
            <li>• Produse deteriorate din vina cumpărătorului</li>
            <li>• Produse cu personalizare specială la comandă</li>
          </ul>
        </div>
      </Section>

      <Section title="2. Cum inițiezi un retur">
        <div className="space-y-3">
          <StepCard
            number="1"
            title="Contactează-ne"
            description="Trimite un email la retururi@vinylvault.ro cu subiectul 'Retur #NUMĂR_COMANDĂ'. Include motivul returului (opțional) și dacă dorești înlocuirea produsului sau restituirea banilor."
          />
          <StepCard
            number="2"
            title="Primești confirmare"
            description="În maxim 2 zile lucrătoare îți trimitem un email de confirmare cu instrucțiunile de ambalare și eticheta de retur (dacă este cazul)."
          />
          <StepCard
            number="3"
            title="Trimite coletul"
            description="Ambalează produsul în ambalajul original, împreună cu factura. Predă coletul curierului menționat în emailul de confirmare."
          />
          <StepCard
            number="4"
            title="Rambursarea"
            description="După recepționarea și verificarea produsului (1-3 zile lucrătoare), procesăm rambursarea. Suma ajunge în contul tău în maxim 14 zile."
          />
        </div>
      </Section>

      <Section title="3. Rambursarea">
        <p>
          Rambursăm <strong className="text-white">integral</strong> prețul produsului, inclusiv costurile de livrare inițiale (cu excepția metodei expres, dacă ai ales-o tu). Costul returului este suportat de noi dacă produsul este defect sau a fost trimis din greșeală.
        </p>
        <p>
          Rambursarea se face prin aceeași metodă folosită la plată:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white">Card bancar:</strong> 3-7 zile bancare</li>
          <li><strong className="text-white">Ramburs/Transfer:</strong> prin OP bancar, maxim 14 zile</li>
        </ul>
      </Section>

      <Section title="4. Produse defecte sau greșite">
        <p>
          Dacă ai primit un produs defect sau diferit față de ce ai comandat, contactează-ne în termen de <strong className="text-white">48 de ore</strong> de la livrare la{' '}
          <a href="mailto:suport@vinylvault.ro" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            suport@vinylvault.ro
          </a>
          , cu fotografii relevante.
        </p>
        <p>
          În acest caz, suportăm integral costurile de retur și înlocuim produsul fără costuri suplimentare sau rambursăm integral suma plătită, la alegerea ta.
        </p>
      </Section>

      <Section title="5. Garanție">
        <p>
          Conform Legii 449/2003 privind vânzarea produselor și garanțiile asociate acestora, produsele beneficiază de o garanție legală de <strong className="text-white">2 ani</strong> de la data cumpărării.
        </p>
        <p>
          Garanția acoperă defectele de fabricație. Nu acoperă deteriorările cauzate de utilizarea necorespunzătoare.
        </p>
      </Section>

      <Section title="6. Contact pentru retur">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-red-400">📧</span>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Email retur</p>
              <a href="mailto:retururi@vinylvault.ro" className="text-white font-semibold text-sm hover:text-red-400 transition-colors">
                retururi@vinylvault.ro
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-400">📞</span>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Telefon suport</p>
              <p className="text-white font-semibold text-sm">+40 21 000 0000</p>
              <p className="text-gray-500 text-xs">Lun-Vin, 09:00 - 18:00</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-400">📍</span>
            <div>
              <p className="text-gray-500 text-xs uppercase tracking-wide">Adresă corespondenţă</p>
              <p className="text-white font-semibold text-sm">VinylVault SRL</p>
              <p className="text-gray-400 text-xs">Str. Muzicii nr. 1, București, 010000, România</p>
            </div>
          </div>
        </div>
      </Section>

      {/* ANPC */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-8">
        <p className="text-blue-300 text-sm font-semibold mb-1">Autoritatea Națională pentru Protecția Consumatorilor</p>
        <p className="text-gray-400 text-xs mb-2">
          Dacă consideri că drepturile tale nu au fost respectate, poți sesiza ANPC:
        </p>
        <a
          href="https://www.anpc.ro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 text-sm font-semibold underline underline-offset-2"
        >
          www.anpc.ro →
        </a>
      </div>

      {/* Footer navigation */}
      <div className="border-t border-gray-800 pt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/terms" className="text-red-400 hover:text-red-300 transition-colors">Termeni și Condiții</Link>
        <Link to="/privacy" className="text-red-400 hover:text-red-300 transition-colors">Politică Confidențialitate</Link>
        <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors ml-auto">← Acasă</Link>
      </div>
    </div>
  )
}