import { Link, useNavigate, useLocation } from "react-router-dom"
import { useState, useRef, useEffect, useCallback } from "react"
import { useCartStore } from "../../store/cartStore"
import { useAuthStore } from "../../store/authStore"
import { supabase } from "../../lib/supabase"
import { calcDiscountedPrice, formatPrice } from "../../utils/format"

const ADMIN_EMAILS = ['admin@vinylvault.ro', 'contact@vinylvault.ro']
const SEARCH_LIMIT  = 6   // max sugestii produse
const DEBOUNCE_MS   = 180 // ms după ultimul keystroke

// ── Highlight matched text ────────────────────────────────────────────────────
function Highlight({ text, query = "" }) {
  const safe = String(text ?? '')
  if (!query.trim()) return <span>{safe}</span>
  const idx = safe.toLowerCase().indexOf(query.toLowerCase())
  if (idx === -1) return <span>{safe}</span>
  return (
    <span>
      {safe.slice(0, idx)}
      <mark className="bg-red-500/30 text-white rounded px-0.5">{safe.slice(idx, idx + query.length)}</mark>
      {safe.slice(idx + query.length)}
    </span>
  )
}

// ── Categoria badge ───────────────────────────────────────────────────────────
const categoryLabel = {
  vinyl:     "Vinyl",
  cd:        "CD",
  caseta:    "Casetă",
  merch:     "Merch",
  accesorii: "Accesorii",
  audio:     "Echipament Audio",
}
const categoryColor = {
  vinyl:     "bg-red-500/20 text-red-400",
  cd:        "bg-blue-500/20 text-blue-400",
  caseta:    "bg-amber-500/20 text-amber-400",
  merch:     "bg-purple-500/20 text-purple-400",
  accesorii: "bg-orange-500/20 text-orange-400",
  audio:     "bg-cyan-500/20 text-cyan-400",
}

export default function Navbar() {
  const [query, setQuery]               = useState("")
  const [results, setResults]           = useState([])
  const [loading, setLoading]           = useState(false)
  const [open, setOpen]                 = useState(false)
  const [activeIdx, setActiveIdx]       = useState(-1)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => {
    try { return JSON.parse(localStorage.getItem("vv_recent_searches") || "[]") } catch { return [] }
  })

  const navigate   = useNavigate()
  const location   = useLocation()
  const searchRef  = useRef(null)
  const inputRef   = useRef(null)
  const menuRef    = useRef(null)
  const debounceRef = useRef(null)

  const count   = useCartStore(s => s.items.reduce((sum, i) => sum + i.quantity, 0))
  const { user, logout } = useAuthStore()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase())

  // Închide dropdown-urile la click outside
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setOpen(false)
        setActiveIdx(-1)
      }
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Închide la schimbare rută
  useEffect(() => {
    setOpen(false)
    setQuery("")
    setActiveIdx(-1)
  }, [location.pathname, location.search])

  // Caută în Supabase cu debounce
const doSearch = useCallback(async (q) => {
  if (!q.trim() || q.trim().length < 2) {
    setResults([])
    setLoading(false)
    return
  }
  setLoading(true)

  // Escape doar caracterele speciale pentru Postgres ILIKE (% și _)
  const term = q.trim().replace(/[%_]/g, '\\$&')

  if (!term) {
    setResults([])
    setLoading(false)
    return
  }

  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, artist, category, format, year, price, discount, images, stock")
      .ilike("name", `${term}%`)            // DOAR după name, începe cu term
      .order("is_featured", { ascending: false })
      .limit(SEARCH_LIMIT)

    if (!error) {
      setResults(
        (data || []).map(p => ({ ...p, images: p.images ?? [], discount: p.discount ?? 0 }))
      )
    } else {
      setResults([])
    }
  } catch {
    setResults([])
  }
  setLoading(false)
}, [])

  // Trigger debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current)
    if (query.trim().length >= 2) {
      setLoading(true)
      debounceRef.current = setTimeout(() => doSearch(query), DEBOUNCE_MS)
    } else {
      setResults([])
      setLoading(false)
    }
    setActiveIdx(-1)
    return () => clearTimeout(debounceRef.current)
  }, [query, doSearch])

  // Salvează în istoricul recent
  const saveRecent = (term) => {
    const clean = term.trim()
    if (!clean) return
    const updated = [clean, ...recentSearches.filter(r => r !== clean)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem("vv_recent_searches", JSON.stringify(updated))
  }

  const clearRecent = () => {
    setRecentSearches([])
    localStorage.removeItem("vv_recent_searches")
  }

  // Submit search → mergi la catalog
  const handleSubmit = (e) => {
    e?.preventDefault()
    const term = query.trim()
    if (!term) return
    saveRecent(term)
    navigate(`/catalog?search=${encodeURIComponent(term)}`)
    setOpen(false)
    inputRef.current?.blur()
  }

  // Click pe sugestie produs
  const handleSelectProduct = (product) => {
    saveRecent(product.artist + " " + product.name)
    navigate(`/product/${product.id}`)
    setOpen(false)
    setQuery("")
  }

  // Click pe recent search
  const handleSelectRecent = (term) => {
    setQuery(term)
    navigate(`/catalog?search=${encodeURIComponent(term)}`)
    setOpen(false)
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!open) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIdx(i => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIdx(i => Math.max(i - 1, -1))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (activeIdx >= 0 && results[activeIdx]) {
        handleSelectProduct(results[activeIdx])
      } else {
        handleSubmit()
      }
    } else if (e.key === "Escape") {
      setOpen(false)
      setActiveIdx(-1)
      inputRef.current?.blur()
    }
  }

  const showDropdown = open && (
    query.trim().length >= 2 || recentSearches.length > 0
  )

  const handleLogout = () => {
    logout()
    setUserMenuOpen(false)
    navigate("/")
  }

  return (
    <nav className="bg-gray-950 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-4">

        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-white tracking-tight flex-shrink-0">
          <span className="text-red-500">Vinyl</span>Vault
        </Link>

        {/* Nav links desktop */}
        <div className="hidden md:flex items-center gap-1 flex-shrink-0">
          {/* <Link to="/catalog" className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Catalog
          </Link> */}
          <Link to="/about" className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Despre
          </Link>
          <Link to="/contact" className="text-gray-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Contact
          </Link>
        </div>

        {/* ── Search cu autocomplete ──────────────────────────────────────── */}
        <div ref={searchRef} className="flex-1 max-w-lg relative">
          <form onSubmit={handleSubmit}>
            <div className="relative">
              {/* Icon search / spinner */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {loading ? (
                  <svg className="w-4 h-4 text-gray-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={e => { setQuery(e.target.value); setOpen(true) }}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Caută produse..."
                autoComplete="off"
                className={`w-full bg-gray-900 border rounded-xl pl-10 pr-8 py-2 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200 ${
                  open && showDropdown
                    ? "border-red-500 rounded-b-none"
                    : "border-gray-700 focus:border-red-500"
                }`}
              />

              {/* Clear button */}
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); setResults([]); setOpen(true); inputRef.current?.focus() }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </form>

          {/* ── Dropdown ─────────────────────────────────────────────────── */}
          {showDropdown && (
            <div className="absolute left-0 right-0 top-full bg-gray-900 border border-red-500 border-t-0 rounded-b-xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto">

              {/* Căutări recente (dacă query scurt) */}
              {query.trim().length < 2 && recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-4 pt-3 pb-1">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Căutări recente</span>
                    <button onClick={clearRecent} className="text-xs text-gray-600 hover:text-gray-400 transition-colors">
                      Șterge tot
                    </button>
                  </div>
                  {recentSearches.map(term => (
                    <button
                      key={term}
                      onClick={() => handleSelectRecent(term)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-gray-300 text-sm">{term}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Sugestii produse */}
              {query.trim().length >= 2 && (
                <>
                  {results.length > 0 && (
                    <div>
                      <div className="px-4 pt-3 pb-1">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Produse</span>
                      </div>

                      {results.map((product, idx) => {
                        const finalPrice = calcDiscountedPrice(product.price, product.discount)
                        const isActive   = idx === activeIdx
                        return (
                          <button
                            key={product.id}
                            onClick={() => handleSelectProduct(product)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors text-left ${
                              isActive ? "bg-gray-800" : "hover:bg-gray-800/60"
                            }`}
                          >
                            {/* Imagine */}
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0 border border-gray-700">
                              {product.images?.[0] ? (
                                <img
                                  src={product.images[0]}
                                  alt=""
                                  className="w-full h-full object-cover"
                                  onError={e => { e.target.src = "https://placehold.co/40x40/1f2937/6b7280?text=♫" }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-lg">♫</div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-red-400 font-semibold truncate">
                                <Highlight text={product.artist} query={query} />
                              </p>
                              <p className="text-white text-sm font-medium truncate leading-tight">
                                <Highlight text={product.name} query={query} />
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${categoryColor[product.category] || "bg-gray-600/20 text-gray-400"}`}>
                                  {categoryLabel[product.category] || product.category}
                                </span>
                                <span className="text-gray-600 text-xs">{product.format} · {product.year}</span>
                              </div>
                            </div>

                            {/* Preț + stoc */}
                            <div className="text-right flex-shrink-0">
                              <p className="text-white font-bold text-sm">{formatPrice(finalPrice)}</p>
                              {product.discount > 0 && (
                                <p className="text-red-400 text-xs font-semibold">-{product.discount}%</p>
                              )}
                              {product.stock === 0 && (
                                <p className="text-gray-600 text-xs">Stoc 0</p>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  {/* No results */}
                  {!loading && results.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="text-gray-500 text-sm mb-1">Niciun rezultat pentru</p>
                      <p className="text-white font-semibold text-sm">„{query}"</p>
                    </div>
                  )}

                  {/* Footer dropdown: vezi toate rezultatele */}
                  <div className="border-t border-gray-800 bg-gray-900/80">
                    <button
                      onClick={handleSubmit}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800 transition-colors group"
                    >
                      <span className="text-gray-400 group-hover:text-white text-sm transition-colors">
                        Caută <span className="font-semibold text-white">„{query}"</span> în catalog
                      </span>
                      <svg className="w-4 h-4 text-gray-600 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </>
              )}

              {/* Suggestii rapide când nu ai query */}
              {query.trim().length < 2 && recentSearches.length === 0 && (
                <div className="px-4 py-5">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Categorii</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { label: "Vinyl", id: "vinyl" },
                      { label: "CD", id: "cd" },
                      { label: "Casetă", id: "caseta" },
                      { label: "Merch", id: "merch" },
                      { label: "Accesorii", id: "accesorii" },
                      { label: "Echipament Audio", id: "audio" },
                    ].map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => { navigate(`/catalog?category=${cat.id}`); setOpen(false) }}
                        className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-colors border border-gray-700 hover:border-gray-500"
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {/* ── End search ─────────────────────────────────────────────────── */}

        {/* Right */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Track */}
          <Link to="/track" className="hidden sm:flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors text-sm px-2 py-2 rounded-lg hover:bg-gray-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
            </svg>
            <span className="hidden lg:block text-xs">Tracking</span>
          </Link>

          {/* Cart */}
          <Link to="/cart" className="relative text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 11H4L5 9z"/>
            </svg>
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Link>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen(o => !o)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                user
                  ? "bg-gray-800 hover:bg-gray-700 text-white"
                  : "border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white"
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span className="hidden sm:block">{user ? user.firstName : "Cont"}</span>
              {isAdmin && <span className="hidden sm:block text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-md font-bold">A</span>}
              {user && (
                <svg className={`w-3 h-3 text-gray-400 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              )}
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-white font-semibold text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      {isAdmin && <span className="inline-block mt-1 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-bold">Administrator</span>}
                    </div>
                    <div className="py-1">
                      <Link to="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                        </svg>
                        Contul meu
                      </Link>
                      <Link to="/track" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                        </svg>
                        Urmărește comanda
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors font-semibold">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                          </svg>
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-gray-800 py-1">
                      <button onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors w-full text-left">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Deconectare
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="py-1">
                    <Link to="/auth" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-gray-800 transition-colors">
                      Autentifică-te
                    </Link>
                    <Link to="/auth?mode=register" onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-gray-800 transition-colors font-semibold">
                      Creează cont nou
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}