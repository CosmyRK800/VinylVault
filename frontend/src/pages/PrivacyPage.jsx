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

function DataRow({ label, value }) {
  return (
    <div className="flex flex-col sm:flex-row sm:gap-4 py-2 border-b border-gray-800 last:border-0">
      <span className="text-gray-500 text-xs sm:w-40 flex-shrink-0 mb-1 sm:mb-0 uppercase tracking-wide font-semibold">{label}</span>
      <span className="text-gray-300 text-sm">{value}</span>
    </div>
  )
}

export default function PrivacyPage() {
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
          <span className="text-4xl">🔒</span>
          <h1 className="text-3xl font-black text-white">Politică de Confidențialitate</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Ultima actualizare: <span className="text-gray-400">1 Ianuarie 2026</span>
        </p>
        <div className="mt-4 bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3">
          <p className="text-blue-300 text-xs">
            ℹ️ Conform Regulamentului (UE) 2016/679 (GDPR), îți prezentăm transparent modul în care prelucrăm datele tale personale.
          </p>
        </div>
      </div>

      <Section title="1. Cine suntem (Operatorul de date)">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 space-y-1">
          <DataRow label="Denumire" value="VinylVault SRL" />
          <DataRow label="Sediu" value="Str. Muzicii nr. 1, București, România" />
          <DataRow label="CUI" value="RO12345678" />
          <DataRow label="Email DPO" value="privacy@vinylvault.ro" />
          <DataRow label="Telefon" value="+40 21 000 0000" />
        </div>
      </Section>

      <Section title="2. Ce date colectăm">
        <p>Colectăm numai datele necesare pentru furnizarea serviciilor noastre:</p>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide">Categorie date</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide">Exemple</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold uppercase tracking-wide">Scop</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                ['Date de identificare', 'Nume, prenume, email', 'Creare cont, comunicări'],
                ['Date de contact', 'Telefon, adresă livrare', 'Procesarea comenzilor'],
                ['Date tranzacționale', 'Istoric comenzi, valori', 'Contabilitate, suport'],
                ['Date tehnice', 'IP, browser, cookies', 'Securitate, analize'],
              ].map(([cat, ex, scop]) => (
                <tr key={cat}>
                  <td className="px-4 py-3 text-white font-medium">{cat}</td>
                  <td className="px-4 py-3 text-gray-400">{ex}</td>
                  <td className="px-4 py-3 text-gray-400">{scop}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="3. Temeiul legal al prelucrării">
        <p>Prelucrăm datele tale pe următoarele baze legale:</p>
        <ul className="space-y-2">
          {[
            ['Executarea contractului (Art. 6(1)(b) GDPR)', 'Pentru procesarea comenzilor și livrarea produselor'],
            ['Obligație legală (Art. 6(1)(c) GDPR)', 'Pentru păstrarea documentelor contabile și fiscale'],
            ['Interes legitim (Art. 6(1)(f) GDPR)', 'Pentru securitatea platformei și prevenirea fraudelor'],
            ['Consimțământ (Art. 6(1)(a) GDPR)', 'Pentru newsletter și cookie-uri non-esențiale'],
          ].map(([baza, descriere]) => (
            <li key={baza} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <p className="text-white font-semibold text-xs mb-1">{baza}</p>
              <p className="text-gray-400 text-xs">{descriere}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="4. Cât timp păstrăm datele">
        <p>Datele sunt păstrate numai atât timp cât este necesar:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white">Date cont:</strong> pe durata existenței contului + 1 an după ștergere</li>
          <li><strong className="text-white">Date comenzi:</strong> 10 ani (obligație fiscală conform Legii contabilității)</li>
          <li><strong className="text-white">Cookie-uri analitice:</strong> 13 luni</li>
          <li><strong className="text-white">Cookie-uri esențiale sesiune:</strong> până la închiderea browser-ului</li>
        </ul>
      </Section>

      <Section title="5. Cui transmitem datele">
        <p>Nu vindem datele tale. Le partajăm doar cu:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white">Curieri</strong> (Fan Courier, DPD etc.) — pentru livrare</li>
          <li><strong className="text-white">Procesatori de plată</strong> — pentru tranzacții card</li>
          <li><strong className="text-white">Servicii email</strong> (EmailJS) — pentru confirmări comenzi</li>
          <li><strong className="text-white">Autorități publice</strong> — când suntem obligați legal</li>
        </ul>
        <p>Toți partenerii noștri sunt obligați contractual să respecte GDPR.</p>
      </Section>

      <Section title="6. Drepturile tale">
        <p>Conform GDPR, ai următoarele drepturi în legătură cu datele tale:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            ['🔍 Dreptul de acces', 'Poți solicita o copie a datelor pe care le deținem despre tine'],
            ['✏️ Dreptul de rectificare', 'Poți solicita corectarea datelor inexacte sau incomplete'],
            ['🗑️ Dreptul la ștergere', 'Poți solicita ștergerea datelor în anumite condiții ("dreptul de a fi uitat")'],
            ['⏸️ Dreptul la restricție', 'Poți limita modul în care îți prelucrăm datele'],
            ['📦 Dreptul la portabilitate', 'Poți primi datele tale într-un format structurat, uzual'],
            ['🚫 Dreptul de opoziție', 'Te poți opune prelucrării bazate pe interesul nostru legitim'],
          ].map(([titlu, descriere]) => (
            <div key={titlu} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <p className="text-white font-semibold text-xs mb-1">{titlu}</p>
              <p className="text-gray-400 text-xs">{descriere}</p>
            </div>
          ))}
        </div>
        <p>
          Pentru a-ți exercita drepturile, contactează-ne la{' '}
          <a href="mailto:privacy@vinylvault.ro" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            privacy@vinylvault.ro
          </a>
          . Răspundem în maxim 30 de zile.
        </p>
        <p>
          Dacă consideri că datele tale sunt prelucrate necorespunzător, ai dreptul să depui o plângere la{' '}
          <strong className="text-white">ANSPDCP</strong> (Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal):{' '}
          <a href="https://www.dataprotection.ro" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            www.dataprotection.ro
          </a>
        </p>
      </Section>

      <Section title="7. Cookie-uri">
        <p>Utilizăm următoarele tipuri de cookie-uri:</p>
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-gray-400 font-semibold">Tip</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold">Descriere</th>
                <th className="text-left px-4 py-3 text-gray-400 font-semibold">Obligatoriu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              <tr>
                <td className="px-4 py-3 text-white font-medium">Esențiale</td>
                <td className="px-4 py-3 text-gray-400">Sesiune, coș de cumpărături, autentificare</td>
                <td className="px-4 py-3 text-green-400 font-semibold">Da</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-white font-medium">Preferințe</td>
                <td className="px-4 py-3 text-gray-400">Setări utilizator, temă, limbă</td>
                <td className="px-4 py-3 text-amber-400">Opțional</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-white font-medium">Analitice</td>
                <td className="px-4 py-3 text-gray-400">Statistici de vizitare (anonimizate)</td>
                <td className="px-4 py-3 text-amber-400">Opțional</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Poți gestiona preferințele de cookie-uri din setările browser-ului tău sau prin opțiunile afișate în banner-ul de cookies.
        </p>
      </Section>

      <Section title="8. Securitatea datelor">
        <p>
          Implementăm măsuri tehnice și organizatorice adecvate pentru a proteja datele tale: criptare SSL/TLS, acces restricționat la date, monitorizare continuă a securității. Cu toate acestea, nicio metodă de transmisie prin internet nu este 100% sigură.
        </p>
      </Section>

      <Section title="9. Modificări ale politicii">
        <p>
          Putem actualiza această politică periodic. Te vom notifica prin email sau printr-un anunț vizibil pe site cu cel puțin 30 de zile înainte de intrarea în vigoare a modificărilor semnificative.
        </p>
      </Section>

      {/* Footer navigation */}
      <div className="border-t border-gray-800 pt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/terms" className="text-red-400 hover:text-red-300 transition-colors">Termeni și Condiții</Link>
        <Link to="/returns" className="text-red-400 hover:text-red-300 transition-colors">Drept de Retur</Link>
        <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors ml-auto">← Acasă</Link>
      </div>
    </div>
  )
}