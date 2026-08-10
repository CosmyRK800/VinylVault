import { Link } from 'react-router-dom'

const team = [
  { name: 'Alexandru Ionescu', role: 'Fondator & Curator', emoji: '🎸', bio: 'Colecționar de vinyl de 15 ani. Pasionat de rock progresiv și jazz modal.' },
  { name: 'Maria Constantin', role: 'Customer Experience', emoji: '🎵', bio: 'Se asigură că fiecare comandă ajunge perfect ambalată și la timp.' },
  { name: 'Bogdan Popa', role: 'Achiziții & Logistică', emoji: '🎶', bio: 'Caută presări rare prin Europa. Specialist în vinyl 180g.' },
]

const values = [
  { icon: '🎯', title: 'Calitate autentică', desc: 'Fiecare disc este verificat manual înainte de a intra în stoc. Nu vindem repres ieftine.' },
  { icon: '📦', title: 'Ambalaj profesional', desc: 'Folosim cutii rigide și pernuțe de protecție. Discul tău ajunge intact, garantat.' },
  { icon: '⚡', title: 'Livrare rapidă', desc: 'Procesăm comenzile în aceeași zi lucrătoare. Estimat 1–3 zile în toată România.' },
  { icon: '🔄', title: '14 zile retur', desc: 'Dacă nu ești mulțumit din orice motiv, returnezi gratuit în 14 zile de la primire.' },
]

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-16">

      {/* Hero */}
      <div className="mb-16 text-center">
        <h1 className="text-5xl font-black text-white mb-4">
          Despre <span className="text-red-500">VinylVault</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Nu suntem un simplu magazin online. Suntem o comunitate de oameni care cred că muzica sună mai bine pe disc.
        </p>
      </div>

      {/* Povestea */}
      <div className="grid md:grid-cols-2 gap-10 mb-20 items-center">
        <div>
          <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-3">Povestea noastră</p>
          <h2 className="text-3xl font-black text-white mb-4">De la o colecție personală la un magazin</h2>
          <div className="space-y-4 text-gray-400 leading-relaxed">
            <p>
              VinylVault a început în 2019 dintr-o cameră aglomerată de discuri și ideea că muzica fizică nu a murit — doar a așteptat să fie redescoperită.
            </p>
            <p>
              Am pornit cu 200 de titluri atent selectate, expediate manual din apartament. Azi avem sute de titluri, un depozit în București și livrăm în toată România.
            </p>
            <p>
              Principiul nu s-a schimbat: <span className="text-white font-semibold">fiecare disc pe care îl vindem este unul pe care l-am asculta și noi</span>.
            </p>
          </div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
          <div className="text-8xl mb-4">🎵</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { val: '500+', label: 'Titluri în stoc' },
              { val: '3.000+', label: 'Comenzi livrate' },
              { val: '4.9★', label: 'Rating mediu' },
            ].map(s => (
              <div key={s.label} className="bg-gray-800 rounded-xl p-3">
                <div className="text-2xl font-black text-red-400">{s.val}</div>
                <div className="text-gray-500 text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Valori */}
      <div className="mb-20">
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Ce ne definește</p>
        <h2 className="text-3xl font-black text-white mb-8 text-center">Valorile noastre</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {values.map(v => (
            <div key={v.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 flex gap-4">
              <span className="text-3xl flex-shrink-0">{v.icon}</span>
              <div>
                <h3 className="text-white font-bold mb-1">{v.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Echipa */}
      <div className="mb-20">
        <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2 text-center">Oamenii din spate</p>
        <h2 className="text-3xl font-black text-white mb-8 text-center">Echipa noastră</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {team.map(member => (
            <div key={member.name} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center">
              <div className="text-5xl mb-4">{member.emoji}</div>
              <h3 className="text-white font-bold">{member.name}</h3>
              <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-3">{member.role}</p>
              <p className="text-gray-400 text-sm leading-relaxed">{member.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-red-500/20 to-gray-900 border border-red-500/30 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-black text-white mb-2">Hai să descoperim muzica împreună</h2>
        <p className="text-gray-400 mb-6">Explorează catalogul nostru sau contactează-ne dacă cauți ceva anume.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link to="/catalog" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            🎵 Vezi catalogul
          </Link>
          <Link to="/contact" className="border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors">
            📬 Contactează-ne
          </Link>
        </div>
      </div>
    </div>
  )
}