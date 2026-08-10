import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useProducts } from "../hooks/useProducts"
import { formatPrice, calcDiscountedPrice, timeLeft } from "../utils/format"
import { useCartStore } from "../store/cartStore"

// ── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const finalPrice = calcDiscountedPrice(product.price, product.discount)

  return (
    <Link to={`/product/${product.id}`} className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 flex flex-col">
      <div className="relative aspect-square overflow-hidden bg-gray-800">
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={e => { e.target.src = "https://placehold.co/400x400/1f2937/6b7280?text=No+Image" }}
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{product.discount}%
          </span>
        )}
        {product.isNew && (
          <span className="absolute top-2 right-2 bg-amber-500 text-black text-xs font-bold px-2 py-1 rounded-md">
            NOU
          </span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-red-400 font-medium mb-1 uppercase tracking-wide">{product.artist}</p>
        <h3 className="text-sm font-semibold text-white leading-tight mb-1 line-clamp-2">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-3">{product.format} · {product.year}</p>

        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <span className="text-white font-bold">{formatPrice(finalPrice)}</span>
            {product.discount > 0 && (
              <span className="text-gray-500 text-xs line-through ml-2">{formatPrice(product.price)}</span>
            )}
          </div>
          <button
            onClick={e => { e.preventDefault(); addItem(product) }}
            className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors"
          >
            + Coș
          </button>
        </div>
      </div>
    </Link>
  )
}

// ── Flash Sale Countdown ──────────────────────────────────────────────────────
function Countdown({ endsAt }) {
  const [time, setTime] = useState(timeLeft(endsAt))
  useEffect(() => {
    const t = setInterval(() => setTime(timeLeft(endsAt)), 1000)
    return () => clearInterval(t)
  }, [endsAt])
  if (!time) return <span className="text-gray-500 text-sm">Expirat</span>
  const pad = n => String(n).padStart(2, "0")
  return (
    <div className="flex items-center gap-1 text-sm font-mono font-bold">
      <span className="bg-gray-900 text-red-400 px-2 py-1 rounded">{pad(time.h)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-gray-900 text-red-400 px-2 py-1 rounded">{pad(time.m)}</span>
      <span className="text-gray-400">:</span>
      <span className="bg-gray-900 text-red-400 px-2 py-1 rounded">{pad(time.s)}</span>
    </div>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/3" />
      </div>
    </div>
  )
}

// ── HomePage ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigate()
  const { products, loading, error } = useProducts()

  const featured     = products.filter(p => p.isFeatured)
  const flashProducts = products.filter(p => p.discount > 0).slice(0, 4)
  const newArrivals  = products.filter(p => p.isNew).slice(0, 4)
  const flashEnd     = new Date(Date.now() + 1000 * 60 * 60 * 5)

  const heroImage = products[0]?.images[0] || "https://placehold.co/400x400/1f2937/6b7280?text=VinylVault"

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 via-gray-950 to-gray-950 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 py-24 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block text-red-500 text-sm font-semibold tracking-widest uppercase mb-4">
              Muzică fizică autentică
            </span>
            <h1 className="text-5xl md:text-6xl font-black text-white leading-tight mb-6">
              Sunetul care<br />
              <span className="text-red-500">nu minte</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8 max-w-md">
              Vinyluri, CD-uri și casete din toată lumea. Colecții rare, presări audiophile, livrare rapidă în România.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <button
                onClick={() => navigate("/catalog")}
                className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Explorează catalogul
              </button>
              {/* <button
                onClick={() => navigate("/catalog?category=vinyl")}
                className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-8 py-4 rounded-xl transition-colors text-base"
              >
                Vinyl nou →
              </button> */}
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-10 justify-center md:justify-start">
              {[["500+", "Titluri"], ["48h", "Livrare"], ["4.9★", "Rating"]].map(([val, label]) => (
                <div key={label}>
                  <div className="text-2xl font-black text-white">{val}</div>
                  <div className="text-xs text-gray-500 uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Hero vinyl visual */}
          <div className="flex-shrink-0 relative w-72 h-72 md:w-96 md:h-96">
            <div className="absolute inset-0 rounded-full bg-gray-900 border-4 border-gray-800 shadow-2xl overflow-hidden">
              <img
                src={heroImage}
                alt="Featured"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
            <div className="absolute inset-0 rounded-full border-8 border-gray-950/60 pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-gray-950 border-2 border-gray-700 z-10" />
          </div>
        </div>
      </section>

      {/* ── CATEGORII ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <h2 className="text-2xl font-black text-white mb-6">Categorii</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { id: "vinyl",     label: "Vinyl",            sub: "LP, EP, Picture Disc",        color: "from-red-950/60 to-gray-900",    border: "border-red-900/40",    icon: "🎵" },
            { id: "cd",        label: "CD",               sub: "Album, Digipack, Box Set",    color: "from-blue-950/60 to-gray-900",   border: "border-blue-900/40",   icon: "💿" },
            { id: "caseta",    label: "Casetă",           sub: "Audio, Demo, Blank",          color: "from-amber-950/60 to-gray-900",  border: "border-amber-900/40",  icon: "📼" },
            { id: "merch",     label: "Merch",            sub: "Tricouri, Hanorace, Postere", color: "from-purple-950/60 to-gray-900", border: "border-purple-900/40", icon: "👕" },
            { id: "accesorii", label: "Accesorii",        sub: "Ace, Slipmats, Curățare",    color: "from-orange-950/60 to-gray-900", border: "border-orange-900/40", icon: "🎧" },
            { id: "audio",     label: "Echipament Audio", sub: "Patefoane, Amplificatoare",  color: "from-cyan-950/60 to-gray-900",   border: "border-cyan-900/40",   icon: "🔊" },
          ].map(cat => (
            <Link
              key={cat.id}
              to={`/catalog?category=${cat.id}`}
              className={`bg-gradient-to-br ${cat.color} border ${cat.border} rounded-xl p-6 hover:scale-[1.02] transition-transform`}
            >
              <div className="text-3xl mb-2">{cat.icon}</div>
              <div className="text-white font-bold text-lg">{cat.label}</div>
              <div className="text-gray-400 text-xs mt-1">{cat.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── ERROR ── */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 pb-6">
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            Eroare la încărcarea produselor: {error}
          </div>
        </div>
      )}

      {/* ── FLASH SALE ── */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">⚡</span>
              <div>
                <h2 className="text-xl font-black text-white">Flash Sale</h2>
                <p className="text-gray-400 text-xs">Oferte limitate în timp real</p>
              </div>
            </div>
            <Countdown endsAt={flashEnd} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : flashProducts.map(p => <ProductCard key={p.id} product={p} />)
            }
          </div>
        </div>
      </section>

      {/* ── FEATURED ── */}
      <section className="max-w-7xl mx-auto px-4 py-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Selecția editorului</h2>
          <Link to="/catalog" className="text-red-400 hover:text-red-300 text-sm font-semibold">
            Vezi toate →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : featured.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* ── NOUTĂȚI ── */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Noutăți</h2>
          <Link to="/catalog?sort=new" className="text-red-400 hover:text-red-300 text-sm font-semibold">
            Vezi toate →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : newArrivals.map(p => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* ── BANNER ── */}
      <section className="max-w-7xl mx-auto px-4 pb-14">
        <div className="bg-gradient-to-r from-red-950/80 to-gray-900 border border-red-900/30 rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-black text-white mb-3">Prima ta comandă?</h2>
          <p className="text-gray-400 mb-6">Folosește codul <span className="text-red-400 font-bold">VINYL10</span> și primești 10% reducere</p>
          <button
            onClick={() => navigate("/catalog")}
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-3 rounded-xl transition-colors"
          >
            Cumpără acum
          </button>
        </div>
      </section>
    </div>
  )
}