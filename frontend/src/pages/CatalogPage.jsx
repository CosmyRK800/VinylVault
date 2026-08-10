import { useState, useMemo, useEffect } from "react"
import { useSearchParams, Link, useNavigate } from "react-router-dom"
import { useProducts } from "../hooks/useProducts"
import { formatPrice, calcDiscountedPrice } from "../utils/format"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"

const genres = ["Rock", "Jazz", "Electronic", "Hip-Hop", "Soul", "Alternative", "Industrial", "Pop", "Classical", "Metal"]

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 animate-pulse">
      <div className="aspect-square bg-gray-800" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-800 rounded w-1/2" />
        <div className="h-4 bg-gray-800 rounded w-3/4" />
        <div className="h-3 bg-gray-800 rounded w-1/3" />
        <div className="h-8 bg-gray-800 rounded mt-3" />
      </div>
    </div>
  )
}

// ── Product Card ──────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const addItem = useCartStore(s => s.addItem)
  const { user, toggleWishlist, isInWishlist } = useAuthStore()
  const navigate = useNavigate()
  const finalPrice = calcDiscountedPrice(product.price, product.discount)
  const [wishAnim, setWishAnim] = useState(false)
  const wished = user ? isInWishlist(user.id, product.id) : false

  const handleWish = (e) => {
    e.preventDefault()
    if (!user) { navigate('/auth'); return }
    toggleWishlist(user.id, product)
    setWishAnim(true)
    setTimeout(() => setWishAnim(false), 600)
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-red-500/50 transition-all duration-300 flex flex-col"
    >
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
        <button
          onClick={handleWish}
          className={`absolute bottom-2 right-2 w-8 h-8 rounded-full flex items-center justify-center transition-all backdrop-blur-sm ${
            wished ? 'bg-red-500 text-white' : 'bg-black/50 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-white'
          } ${wishAnim ? 'scale-125' : 'scale-100'}`}
          title={wished ? 'Elimină din Wishlist' : 'Adaugă la Wishlist'}
        >
          <svg className="w-4 h-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
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

// ── Checkbox filter item ──────────────────────────────────────────────────────
function FilterCheck({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${
          checked ? "bg-red-500 border-red-500" : "border-gray-600 group-hover:border-gray-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className="text-sm text-gray-400 group-hover:text-white transition-colors">{label}</span>
    </label>
  )
}

// ── CatalogPage ───────────────────────────────────────────────────────────────
export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, loading, error } = useProducts()

  const urlCategory = searchParams.get("category") || ""
  const urlSearch   = searchParams.get("search") || ""
  const urlSort     = searchParams.get("sort") || "default"

  const [selectedCategories, setSelectedCategories] = useState(
    urlCategory ? [urlCategory] : []
  )
  const [selectedGenres, setSelectedGenres] = useState([])
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 5000
    return Math.ceil(Math.max(...products.map(p => p.price)) / 100) * 100
  }, [products])
  const [priceRange, setPriceRange] = useState([0, 5000])
  // Actualizează maximul când se încarcă produsele
  useEffect(() => {
    setPriceRange(prev => [prev[0], maxProductPrice])
  }, [maxProductPrice])
  const [onlyDiscount, setOnlyDiscount]     = useState(false)
  const [onlyNew, setOnlyNew]               = useState(urlSort === "new")
  const [sort, setSort]                     = useState(urlSort === "new" ? "default" : urlSort)
  const [mobileFilters, setMobileFilters]   = useState(false)

  const categoryOptions = [
    { id: "vinyl",     label: "Vinyl" },
    { id: "cd",        label: "CD" },
    { id: "caseta",    label: "Casetă" },
    { id: "merch",     label: "Merch" },
    { id: "accesorii", label: "Accesorii" },
    { id: "audio",     label: "Echipament Audio" },
  ]

  const toggleCategory = (id) =>
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )

  const toggleGenre = (g) =>
    setSelectedGenres(prev =>
      prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]
    )

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedGenres([])
    setPriceRange([0, maxProductPrice])
    setOnlyDiscount(false)
    setOnlyNew(false)
    setSort("default")
  }

  const filtered = useMemo(() => {
    let list = [...products]

    if (urlSearch) {
      const q = urlSearch.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q))
    }

    if (selectedCategories.length > 0)
      list = list.filter(p => selectedCategories.includes(p.category))

    if (selectedGenres.length > 0)
      list = list.filter(p => selectedGenres.includes(p.genre))

    list = list.filter(p => {
      const fp = calcDiscountedPrice(p.price, p.discount)
      return fp >= priceRange[0] && fp <= priceRange[1]
    })

    if (onlyDiscount) list = list.filter(p => p.discount > 0)
    if (onlyNew)      list = list.filter(p => p.isNew)

    if (sort === "price-asc")
      list.sort((a, b) => calcDiscountedPrice(a.price, a.discount) - calcDiscountedPrice(b.price, b.discount))
    else if (sort === "price-desc")
      list.sort((a, b) => calcDiscountedPrice(b.price, b.discount) - calcDiscountedPrice(a.price, a.discount))
    else if (sort === "name")
      list.sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === "discount")
      list.sort((a, b) => b.discount - a.discount)

    return list
  }, [products, selectedCategories, selectedGenres, priceRange, onlyDiscount, onlyNew, sort, urlSearch])

  const Sidebar = () => (
    <div className="space-y-7">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-bold text-base">Filtre</h2>
        <button onClick={resetFilters} className="text-xs text-red-400 hover:text-red-300">
          Resetează
        </button>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Categorie</p>
        <div className="space-y-2">
          {categoryOptions.map(c => (
            <FilterCheck
              key={c.id}
              label={c.label}
              checked={selectedCategories.includes(c.id)}
              onChange={() => toggleCategory(c.id)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Gen muzical</p>
        <div className="space-y-2">
          {genres.map(g => (
            <FilterCheck
              key={g}
              label={g}
              checked={selectedGenres.includes(g)}
              onChange={() => toggleGenre(g)}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">
          Preț maxim — <span className="text-white font-semibold">{formatPrice(priceRange[1])}</span>
        </p>
        <input
          type="range"
          min={0}
          max={maxProductPrice}
          step={maxProductPrice > 1000 ? 50 : 10}
          value={priceRange[1]}
          onChange={e => setPriceRange([0, Number(e.target.value)])}
          className="w-full accent-red-500"
        />
        <div className="flex justify-between text-xs text-gray-600 mt-1">
          <span>0 RON</span>
          <span>{formatPrice(maxProductPrice)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <FilterCheck
          label="Doar cu reducere"
          checked={onlyDiscount}
          onChange={() => setOnlyDiscount(v => !v)}
        />
        <FilterCheck
          label="Doar noutăți"
          checked={onlyNew}
          onChange={() => setOnlyNew(v => !v)}
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-1">
          {urlSearch ? `Rezultate pentru "${urlSearch}"` : "Catalog"}
        </h1>
        <p className="text-gray-500 text-sm">
          {loading ? "Se încarcă..." : `${filtered.length} produse găsite`}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
          Eroare la încărcarea produselor: {error}
        </div>
      )}

      <div className="flex gap-8">
        <aside className="hidden md:block w-56 flex-shrink-0">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 sticky top-24">
            <Sidebar />
          </div>
        </aside>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 gap-3 flex-wrap">
            <button
              onClick={() => setMobileFilters(true)}
              className="md:hidden flex items-center gap-2 text-sm border border-gray-700 rounded-lg px-3 py-2 text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 12h10M11 20h2" />
              </svg>
              Filtre
            </button>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-gray-500 hidden sm:block">Sortează:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value)}
                className="bg-gray-900 border border-gray-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-red-500"
              >
                <option value="default">Recomandate</option>
                <option value="price-asc">Preț crescător</option>
                <option value="price-desc">Preț descrescător</option>
                <option value="name">Alfabetic</option>
                <option value="discount">Cele mai mari reduceri</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <p className="text-5xl mb-4">🎵</p>
              <p className="text-white font-bold text-lg mb-2">Niciun produs găsit</p>
              <p className="text-gray-500 text-sm mb-6">Încearcă să schimbi filtrele sau termenul de căutare.</p>
              <button onClick={resetFilters} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                Resetează filtrele
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/70" onClick={() => setMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-gray-950 border-l border-gray-800 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="text-white font-bold">Filtre</span>
              <button onClick={() => setMobileFilters(false)} className="text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <Sidebar />
            <button
              onClick={() => setMobileFilters(false)}
              className="w-full mt-8 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Aplică filtrele
            </button>
          </div>
        </div>
      )}
    </div>
  )
}