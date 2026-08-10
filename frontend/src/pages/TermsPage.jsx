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

export default function TermsPage() {
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
          <span className="text-4xl">📄</span>
          <h1 className="text-3xl font-black text-white">Termeni și Condiții</h1>
        </div>
        <p className="text-gray-500 text-sm">
          Ultima actualizare: <span className="text-gray-400">1 Ianuarie 2026</span>
        </p>
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
          <p className="text-red-300 text-xs">
            ⚠️ Aceasta este o aplicație demo realizată în scop educațional. Nu se efectuează tranzacții reale.
          </p>
        </div>
      </div>

      <Section title="1. Despre VinylVault">
        <p>
          VinylVault este un magazin online specializat în muzică fizică — vinyluri, CD-uri și casete.
          Societatea este înregistrată în România și operează în conformitate cu legislația română și europeană aplicabilă comerțului electronic.
        </p>
        <p>
          <strong className="text-white">VinylVault SRL</strong><br />
          Sediu: Str. Muzicii nr. 1, București, România<br />
          Email: contact@vinylvault.ro<br />
          CUI: RO12345678
        </p>
      </Section>

      <Section title="2. Utilizarea platformei">
        <p>Prin accesarea și utilizarea acestui site web, ești de acord să respecți prezentele Termeni și Condiții. Dacă nu ești de acord, te rugăm să nu utilizezi platforma.</p>
        <p>Pentru a plasa o comandă, trebuie să:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Ai vârsta minimă de 18 ani sau acordul unui tutore legal</li>
          <li>Furnizezi informații corecte și actualizate la înregistrare</li>
          <li>Deții o adresă de livrare validă pe teritoriul României</li>
          <li>Dispui de un mijloc de plată valid</li>
        </ul>
      </Section>

      <Section title="3. Produse și prețuri">
        <p>
          Toate prețurile afișate pe platformă sunt exprimate în RON (Lei românești) și includ TVA (19%), conform legislației fiscale române în vigoare.
        </p>
        <p>
          VinylVault își rezervă dreptul de a modifica prețurile în orice moment, fără notificare prealabilă. Prețul aplicabil comenzii tale este cel afișat la momentul confirmării comenzii.
        </p>
        <p>
          Imaginile produselor sunt orientative. Deși facem eforturi pentru a prezenta produsele cât mai fidel, aspectul real poate diferi ușor față de imaginile de pe site.
        </p>
      </Section>

      <Section title="4. Plasarea și confirmarea comenzilor">
        <p>
          O comandă se consideră plasată în momentul în care primești email-ul de confirmare de la noi. VinylVault își rezervă dreptul de a refuza sau anula o comandă în următoarele situații:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Produsul nu mai este disponibil în stoc</li>
          <li>Există o eroare de preț sau descriere pe platformă</li>
          <li>Există suspiciuni de fraudă</li>
          <li>Nu putem verifica datele de livrare furnizate</li>
        </ul>
        <p>
          În cazul anulării unei comenzi deja plătite, suma va fi returnată integral în contul utilizatorului în termen de 14 zile lucrătoare.
        </p>
      </Section>

      <Section title="5. Livrare">
        <p>
          Livrăm pe întreg teritoriul României prin intermediul partenerilor de curierat. Termenul standard de livrare este de <strong className="text-white">1-3 zile lucrătoare</strong> de la confirmarea plății.
        </p>
        <p>
          Transport gratuit pentru comenzi peste <strong className="text-white">200 RON</strong>. Pentru comenzi sub această valoare, tariful de livrare este de <strong className="text-white">19,99 RON</strong>.
        </p>
        <p>
          VinylVault nu răspunde pentru întârzieri cauzate de factori externi (condiții meteorologice, greve, forță majoră etc.).
        </p>
      </Section>

      <Section title="6. Plata">
        <p>Acceptăm următoarele metode de plată:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong className="text-white">Card bancar</strong> — Visa, Mastercard (procesare securizată)</li>
          <li><strong className="text-white">Ramburs</strong> — plata la livrare (taxă suplimentară de 5 RON)</li>
          <li><strong className="text-white">Transfer bancar</strong> — în termen de 3 zile lucrătoare de la plasarea comenzii</li>
        </ul>
        <p>
          Tranzacțiile cu cardul sunt procesate prin sisteme securizate cu criptare SSL. Nu stocăm datele cardului tău pe serverele noastre.
        </p>
      </Section>

      <Section title="7. Drept de retur">
        <p>
          Conform legislației în vigoare (OUG 34/2014), ai dreptul să returnezi produsele în termen de <strong className="text-white">14 zile calendaristice</strong> de la primire, fără a fi necesar să oferi o justificare.
        </p>
        <p>
          Pentru mai multe detalii, consultă pagina noastră dedicată:{' '}
          <Link to="/returns" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            Politică de Retur
          </Link>.
        </p>
      </Section>

      <Section title="8. Proprietate intelectuală">
        <p>
          Toate elementele de pe acest site — logo, design, texte, imagini — sunt proprietatea VinylVault sau sunt utilizate cu permisiunea deținătorilor de drepturi. Este interzisă reproducerea, distribuirea sau utilizarea acestora fără acordul scris al VinylVault.
        </p>
      </Section>

      <Section title="9. Limitarea răspunderii">
        <p>
          VinylVault nu este responsabilă pentru daune indirecte, pierderi de profit sau prejudicii rezultate din utilizarea sau imposibilitatea utilizării platformei. Răspunderea noastră maximă față de tine se limitează la valoarea comenzii afectate.
        </p>
      </Section>

      <Section title="10. Protecția datelor personale">
        <p>
          Ne angajăm să protejăm datele tale personale conform GDPR. Pentru detalii complete, consultă{' '}
          <Link to="/privacy" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            Politica noastră de Confidențialitate
          </Link>.
        </p>
      </Section>

      <Section title="11. Litigii">
        <p>
          Orice neînțelegere va fi soluționată pe cale amiabilă în primul rând. În cazul în care nu se ajunge la o soluție, litigiile vor fi supuse instanțelor judecătorești competente din România.
        </p>
        <p>
          Ai și posibilitatea de a utiliza platforma europeană de soluționare online a litigiilor:{' '}
          <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            ec.europa.eu/consumers/odr
          </a>
        </p>
        <p>
          <strong className="text-white">ANPC</strong> (Autoritatea Națională pentru Protecția Consumatorilor):{' '}
          <a href="https://www.anpc.ro" target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 underline underline-offset-2">
            www.anpc.ro
          </a>
        </p>
      </Section>

      <Section title="12. Modificarea termenilor">
        <p>
          VinylVault își rezervă dreptul de a modifica acești Termeni și Condiții în orice moment. Modificările intră în vigoare la momentul publicării pe site. Îți recomandăm să verifici periodic această pagină.
        </p>
      </Section>

      {/* Footer navigation */}
      <div className="border-t border-gray-800 pt-8 flex flex-wrap gap-4 text-sm">
        <Link to="/privacy" className="text-red-400 hover:text-red-300 transition-colors">Politică Confidențialitate</Link>
        <Link to="/returns" className="text-red-400 hover:text-red-300 transition-colors">Drept de Retur</Link>
        <Link to="/" className="text-gray-500 hover:text-gray-300 transition-colors ml-auto">← Acasă</Link>
      </div>
    </div>
  )
}