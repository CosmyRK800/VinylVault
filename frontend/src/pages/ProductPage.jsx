import { useState, useEffect } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useProduct, useProducts } from "../hooks/useProducts"
import { formatPrice, calcDiscountedPrice } from "../utils/format"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"

// ── SEO Head helper ──────────────────────────────────────────────────────────
function SEOHead({ product, finalPrice }) {
  useEffect(() => {
    if (!product) return
    const title = `${product.name} — ${product.format} | VinylVault`
    const desc = `Cumpără ${product.name} de ${product.artist} (${product.year}, ${product.format}) la ${finalPrice} RON. ${product.description?.slice(0, 100)}...`
    document.title = title

    const setMeta = (sel, val, attr = 'content') => {
      let el = document.querySelector(sel)
      if (!el) { el = document.createElement('meta'); document.head.appendChild(el) }
      el.setAttribute(attr, val)
    }

    setMeta('meta[name="description"]', desc)
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', desc)
    setMeta('meta[property="og:image"]', product.images[0])
    setMeta('meta[property="og:type"]', 'product')
    setMeta('meta[property="og:url"]', window.location.href)
    setMeta('meta[name="twitter:card"]', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', title)
    setMeta('meta[name="twitter:image"]', product.images[0])

    const schemaId = 'product-schema'
    let script = document.getElementById(schemaId)
    if (!script) { script = document.createElement('script'); script.id = schemaId; script.type = 'application/ld+json'; document.head.appendChild(script) }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "description": product.description,
      "image": product.images,
      "brand": { "@type": "Brand", "name": product.artist },
      "offers": {
        "@type": "Offer",
        "priceCurrency": "RON",
        "price": finalPrice,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "url": window.location.href,
        "seller": { "@type": "Organization", "name": "VinylVault" }
      },
      "category": product.format,
      "releaseDate": String(product.year),
    })

    return () => {
      document.title = "VinylVault — Muzică fizică pentru suflete reale"
    }
  }, [product, finalPrice])

  return null
}

// ── Star Rating component ────────────────────────────────────────────────────
function StarRating({ value, onChange, size = "md" }) {
  const [hover, setHover] = useState(0)
  const sz = size === "lg" ? "w-7 h-7" : "w-5 h-5"
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${sz} transition-colors ${onChange ? 'cursor-pointer' : 'cursor-default'}`}
        >
          <svg viewBox="0 0 24 24" className={`${sz} ${(hover || value) >= star ? 'fill-amber-400 text-amber-400' : 'fill-gray-700 text-gray-700'}`}>
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Reviews section ──────────────────────────────────────────────────────────
function ReviewsSection({ productId }) {
  const { user, getReviews, addReview, deleteReview } = useAuthStore()
  const reviews = getReviews(productId)
  const [rating, setRating] = useState(5)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null
  const hasReviewed = user && reviews.find(r => r.userId === user.id)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim()) { setError('Scrie un text pentru recenzie.'); return }
    setSubmitting(true)
    await new Promise(r => setTimeout(r, 400))
    const result = addReview(productId, user.id, `${user.firstName} ${user.lastName}`, rating, text.trim())
    setSubmitting(false)
    if (result.success) { setText(''); setRating(5); setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    else setError(result.error)
  }

  return (
    <section className="mt-16">
      <div className="flex items-center gap-4 mb-6">
        <h2 className="text-2xl font-black text-white">Recenzii</h2>
        {avgRating && (
          <div className="flex items-center gap-2 bg-gray-900 border border-gray-800 rounded-xl px-4 py-2">
            <StarRating value={Math.round(Number(avgRating))} />
            <span className="text-white font-bold">{avgRating}</span>
            <span className="text-gray-500 text-sm">({reviews.length})</span>
          </div>
        )}
      </div>

      {user && !hasReviewed && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
          <h3 className="text-white font-semibold mb-4">Lasă o recenzie</h3>
          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
              ✓ Recenzie publicată!
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">Rating</label>
              <StarRating value={rating} onChange={setRating} size="lg" />
            </div>
            <div>
              <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Recenzia ta</label>
              <textarea
                value={text}
                onChange={e => { setText(e.target.value); setError('') }}
                rows={3}
                placeholder="Cum ți s-a părut produsul?"
                className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors resize-none ${error ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
              />
              {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm flex items-center gap-2"
            >
              {submitting ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Se publică...</>
              ) : 'Publică recenzia'}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6 text-center">
          <p className="text-gray-400 text-sm mb-3">Trebuie să fii autentificat pentru a lăsa o recenzie.</p>
          <Link to="/auth" className="text-red-400 hover:text-red-300 font-semibold text-sm">Autentifică-te →</Link>
        </div>
      )}

      {hasReviewed && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm mb-6">
          ✓ Ai lăsat deja o recenzie pentru acest produs.
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-900 border border-gray-800 rounded-2xl">
          <p className="text-4xl mb-3">⭐</p>
          <p className="text-white font-bold mb-1">Nicio recenzie încă</p>
          <p className="text-gray-500 text-sm">Fii primul care lasă o recenzie!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...reviews].reverse().map(review => (
            <div key={review.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-red-400 font-bold text-xs">{review.userName.charAt(0)}</span>
                    </div>
                    <span className="text-white font-semibold text-sm">{review.userName}</span>
                    <span className="text-gray-600 text-xs">
                      {new Date(review.date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <StarRating value={review.rating} />
                </div>
                {user?.id === review.userId && (
                  <button
                    onClick={() => deleteReview(review.id, user.id)}
                    className="text-xs text-gray-600 hover:text-red-400 transition-colors flex-shrink-0"
                  >
                    Șterge
                  </button>
                )}
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{review.text}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

// ── Skeleton pentru loading ───────────────────────────────────────────────────
function ProductSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-64 mb-8" />
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-gray-800 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="h-8 bg-gray-800 rounded w-3/4" />
          <div className="h-4 bg-gray-800 rounded w-1/2" />
          <div className="h-32 bg-gray-800 rounded-2xl mt-6" />
          <div className="h-12 bg-gray-800 rounded-xl" />
          <div className="h-12 bg-gray-800 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// ── Main ProductPage ─────────────────────────────────────────────────────────
export default function ProductPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Produsul curent
  const { product, loading, error } = useProduct(Number(id))

  // Produse pentru "similare" — filtrăm după ce avem produsul
  const { products: allProducts } = useProducts()

  const { addItem, items } = useCartStore()
  const { user, toggleWishlist, isInWishlist } = useAuthStore()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [activeImg, setActiveImg] = useState(0)
  const [wishToast, setWishToast] = useState(null)

  if (loading) return <ProductSkeleton />

  if (error || !product) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-white gap-4">
      <p className="text-5xl">🎵</p>
      <p className="text-xl font-bold">Produsul nu a fost găsit.</p>
      <Link to="/catalog" className="text-red-400 hover:text-red-300">← Înapoi la catalog</Link>
    </div>
  )

  const finalPrice = calcDiscountedPrice(product.price, product.discount)
  const savings = product.discount > 0 ? product.price - finalPrice : 0
  const inCartQty = items.find(i => i.id === product.id)?.quantity || 0
  const availableToAdd = Math.max(0, product.stock - inCartQty)
  const wished = user ? isInWishlist(user.id, product.id) : false

  const related = allProducts
    .filter(p => p.id !== product.id && (p.genre === product.genre || p.category === product.category))
    .slice(0, 4)

  const handleAddToCart = () => {
    if (availableToAdd === 0) return
    const actualQty = Math.min(qty, availableToAdd)
    for (let i = 0; i < actualQty; i++) addItem(product)
    setQty(1); setAdded(true); setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    const alreadyInCart = items.find(i => i.id === product.id)
    if (!alreadyInCart) { const aq = Math.min(qty, availableToAdd); for (let i = 0; i < aq; i++) addItem(product) }
    navigate("/cart")
  }

  const handleWishlist = () => {
    if (!user) { navigate('/auth'); return }
    const wasAdded = toggleWishlist(user.id, product)
    setWishToast(wasAdded ? 'Adăugat la Wishlist!' : 'Eliminat din Wishlist')
    setTimeout(() => setWishToast(null), 2500)
  }

  const categoryLabel = {
    vinyl: "Vinyl", cd: "CD", caseta: "Casetă",
    merch: "Merch", accesorii: "Accesorii", audio: "Echipament Audio",
  }[product.category] || product.category
  const stockStatus = () => {
    if (product.stock === 0) return { label: "Stoc epuizat", color: "text-red-400", dot: "bg-red-500" }
    if (availableToAdd === 0) return { label: "Ai adăugat tot stocul în coș", color: "text-amber-400", dot: "bg-amber-500" }
    if (product.stock <= 5) return { label: `Ultimele ${product.stock} bucăți (${availableToAdd} disponibile)`, color: "text-amber-400", dot: "bg-amber-500" }
    return { label: "În stoc", color: "text-green-400", dot: "bg-green-500" }
  }
  const stock = stockStatus()

  return (
    <>
      <SEOHead product={product} finalPrice={finalPrice} />

      {wishToast && (
        <div className="fixed top-20 right-4 z-50 bg-gray-800 border border-gray-700 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-2xl animate-pulse">
          {wished ? '💖' : '🤍'} {wishToast}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        <nav className="flex items-center gap-2 text-xs text-gray-500 mb-8">
          <Link to="/" className="hover:text-white transition-colors">Acasă</Link>
          <span>›</span>
          <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
          <span>›</span>
          <Link to={`/catalog?category=${product.category}`} className="hover:text-white transition-colors">{categoryLabel}</Link>
          <span>›</span>
          <span className="text-gray-400 truncate max-w-[200px]">{product.name}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 mb-20">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-900 border border-gray-800">
              <img
                src={product.images[activeImg] || product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={e => { e.target.src = "https://placehold.co/600x600/1f2937/6b7280?text=No+Image" }}
              />
              {product.discount > 0 && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">-{product.discount}%</span>
              )}
              {product.isNew && (
                <span className="absolute top-4 right-4 bg-amber-500 text-black text-sm font-bold px-3 py-1.5 rounded-lg">NOU</span>
              )}
              <button
                onClick={handleWishlist}
                className={`absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm transition-all ${
                  wished ? 'bg-red-500 text-white' : 'bg-black/50 text-gray-300 hover:bg-black/70'
                }`}
                title={wished ? 'Elimină din Wishlist' : 'Adaugă la Wishlist'}
              >
                <svg className="w-5 h-5" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${i === activeImg ? "border-red-500" : "border-gray-700 hover:border-gray-500"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-red-400 text-sm font-semibold uppercase tracking-widest mb-2">{product.artist}</p>
            <h1 className="text-3xl font-black text-white leading-tight mb-2">{product.name}</h1>

            <div className="flex flex-wrap gap-2 mb-6">
              {[product.format, String(product.year), product.genre, product.label].map(b => (
                <span key={b} className="bg-gray-800 text-gray-300 text-xs px-3 py-1 rounded-full">{b}</span>
              ))}
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-6">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-4xl font-black text-white">{formatPrice(finalPrice)}</span>
                {product.discount > 0 && (
                  <span className="text-gray-500 text-lg line-through mb-1">{formatPrice(product.price)}</span>
                )}
              </div>
              {savings > 0 && (
                <p className="text-green-400 text-sm font-semibold">Economisești {formatPrice(savings)} ({product.discount}% reducere)</p>
              )}
              <div className="flex items-center gap-2 mt-3">
                <div className={`w-2 h-2 rounded-full ${stock.dot}`} />
                <span className={`text-xs font-medium ${stock.color}`}>{stock.label}</span>
              </div>
              {inCartQty > 0 && (
                <p className="text-xs text-gray-500 mt-1">Ai deja {inCartQty} {inCartQty === 1 ? 'bucată' : 'bucăți'} în coș.</p>
              )}
            </div>

            <div className="space-y-3 mb-6">
              {availableToAdd > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 w-20">Cantitate</span>
                  <div className="flex items-center bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-4 py-2.5 text-white hover:bg-gray-800 transition-colors text-lg font-bold">−</button>
                    <span className="px-5 py-2.5 text-white font-bold text-sm min-w-[40px] text-center">{qty}</span>
                    <button onClick={() => setQty(q => Math.min(availableToAdd, q + 1))} className="px-4 py-2.5 text-white hover:bg-gray-800 transition-colors text-lg font-bold">+</button>
                  </div>
                  {availableToAdd < product.stock && <span className="text-xs text-amber-400">max {availableToAdd}</span>}
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={availableToAdd === 0}
                className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
                  added ? "bg-green-600 text-white"
                  : availableToAdd === 0 ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white"
                }`}
              >
                {added ? "✓ Adăugat în coș!" : availableToAdd === 0 ? (product.stock === 0 ? "Stoc epuizat" : "Coș complet") : "Adaugă în coș"}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={availableToAdd === 0}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base transition-colors"
              >
                Cumpără acum
              </button>

              <button
                onClick={handleWishlist}
                className={`w-full py-3 rounded-xl font-semibold text-sm border transition-colors flex items-center justify-center gap-2 ${
                  wished
                    ? 'border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white'
                }`}
              >
                <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wished ? 'În Wishlist' : 'Salvează la Wishlist'}
              </button>
            </div>

            <div className="border-t border-gray-800 pt-5">
              <h3 className="text-white font-semibold mb-2">Descriere</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>
            </div>

            {product.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {product.tags.map(tag => (
                  <span key={tag} className="text-xs text-gray-500 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}

            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", title: "Livrare rapidă", sub: "1-3 zile lucrătoare" },
                { icon: "↩️", title: "Retur 14 zile",  sub: "Conform legii" },
                { icon: "🔒", title: "Plată securizată", sub: "Card / Ramburs" },
              ].map(({ icon, title, sub }) => (
                <div key={title} className="bg-gray-900 border border-gray-800 rounded-xl p-3 text-center">
                  <div className="text-xl mb-1">{icon}</div>
                  <div className="text-white text-xs font-semibold">{title}</div>
                  <div className="text-gray-500 text-xs mt-0.5">{sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <ReviewsSection productId={product.id} />

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6">Produse similare</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map(p => {
                const fp = calcDiscountedPrice(p.price, p.discount)
                return (
                  <Link key={p.id} to={`/product/${p.id}`}
                    className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 flex flex-col">
                    <div className="relative aspect-square overflow-hidden bg-gray-800">
                      <img src={p.images[0]} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={e => { e.target.src = "https://placehold.co/400x400/1f2937/6b7280?text=No+Image" }} />
                      {p.discount > 0 && (
                        <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{p.discount}%</span>
                      )}
                    </div>
                    <div className="p-3 flex flex-col flex-1">
                      <p className="text-xs text-red-400 font-medium mb-0.5 uppercase tracking-wide truncate">{p.artist}</p>
                      <h3 className="text-xs font-semibold text-white leading-tight mb-2 line-clamp-2">{p.name}</h3>
                      <div className="mt-auto">
                        <span className="text-white font-bold text-sm">{formatPrice(fp)}</span>
                        {p.discount > 0 && <span className="text-gray-500 text-xs line-through ml-2">{formatPrice(p.price)}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}
      </div>
    </>
  )
}