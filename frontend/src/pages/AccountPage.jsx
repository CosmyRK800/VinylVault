import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { formatPrice } from '../utils/format'
import { sendShippingEmail } from '../utils/emailService'

// Toate statusurile posibile în ordine
const ORDER_STATUSES = ['Plasată', 'Procesată', 'Expediată', 'Livrată', 'Returnată']

const statusColors = {
  'Plasată':   'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Procesată': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Expediată': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Livrată':   'text-green-400 bg-green-400/10 border-green-400/30',
  'Returnată': 'text-gray-400 bg-gray-400/10 border-gray-400/30',
  'Anulată':   'text-red-400 bg-red-400/10 border-red-400/30',
}

const statusIcons = {
  'Plasată': '📋', 'Procesată': '⚙️', 'Expediată': '🚚', 'Livrată': '✅', 'Returnată': '↩️', 'Anulată': '❌',
}

export default function AccountPage() {
  const {
    user, logout, getUserOrders, updateUser,
    updateOrderStatus, getSavedAddresses, saveAddress, deleteAddress, setDefaultAddress,
    getWishlist, toggleWishlist
  } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('orders')
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '' })
  const [saveMsg, setSaveMsg] = useState('')

  // Stare comenzi
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [awbModal, setAwbModal] = useState(null) // orderNumber când e deschis modalul AWB
  const [awbForm, setAwbForm] = useState({ awb: '', courier: 'Fan Courier', trackingUrl: '' })
  const [awbSending, setAwbSending] = useState(false)

  // Stare adrese
  const [showAddrForm, setShowAddrForm] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: '', address: '', city: '', county: '', phone: '' })
  const [addrErrors, setAddrErrors] = useState({})

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-5xl">🔒</p>
        <p className="text-white font-bold text-xl">Trebuie să fii autentificat</p>
        <Link to="/auth" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
          Autentifică-te
        </Link>
      </div>
    )
  }

  const orders = getUserOrders(user.id)
  const savedAddresses = getSavedAddresses(user.id)
  const wishlist = getWishlist(user.id)

  const handleLogout = () => { logout(); navigate('/') }

  const handleSaveProfile = () => {
    updateUser(user.id, { firstName: form.firstName, lastName: form.lastName })
    setSaveMsg('Profil actualizat!')
    setEditMode(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  // ── Schimbare status comandă ─────────────────────────────────────────────
  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === 'Expediată') {
      setAwbModal(order.orderNumber)
      setAwbForm({ awb: '', courier: 'Fan Courier', trackingUrl: '' })
      return
    }
    setStatusUpdating(order.orderNumber)
    await new Promise(r => setTimeout(r, 400))
    updateOrderStatus(order.orderNumber, newStatus)
    setStatusUpdating(null)
  }

  const handleShipWithAwb = async (order) => {
    if (!awbForm.awb.trim()) return
    setAwbSending(true)

    updateOrderStatus(order.orderNumber, 'Expediată', {
      awb: awbForm.awb,
      courier: awbForm.courier,
      trackingUrl: awbForm.trackingUrl,
    })

    // Trimite email expediere
    await sendShippingEmail({
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail || user.email,
      awb: awbForm.awb,
      courier: awbForm.courier,
      trackingUrl: awbForm.trackingUrl,
      items: order.items,
      deliveryAddress: order.deliveryAddress,
      deliveryCity: order.deliveryCity,
      deliveryCounty: order.deliveryCounty,
    })

    setAwbSending(false)
    setAwbModal(null)
  }

  // ── Adrese salvate ────────────────────────────────────────────────────────
  const handleSaveAddress = () => {
    const errs = {}
    if (!addrForm.address.trim()) errs.address = 'Câmp obligatoriu'
    if (!addrForm.city.trim()) errs.city = 'Câmp obligatoriu'
    if (!addrForm.county.trim()) errs.county = 'Câmp obligatoriu'
    if (Object.keys(errs).length) { setAddrErrors(errs); return }

    saveAddress(user.id, addrForm)
    setAddrForm({ label: '', address: '', city: '', county: '', phone: '' })
    setAddrErrors({})
    setShowAddrForm(false)
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Contul meu</h1>
          <p className="text-gray-500 text-sm mt-1">Bun venit, {user.firstName}!</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-sm border border-gray-700 hover:border-red-500 text-gray-400 hover:text-red-400 px-4 py-2 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Deconectare
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-1">
            {[
              { id: 'orders',    label: 'Comenzile mele', icon: '📦' },
              { id: 'addresses', label: 'Adresele mele',  icon: '📍' },
              { id: 'wishlist',  label: 'Wishlist',        icon: '💖' },
              { id: 'profile',   label: 'Profil',         icon: '👤' },
            ].map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                  tab === t.id
                    ? 'bg-red-500/15 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <span>{t.icon}</span>
                {t.label}
              </button>
            ))}
          </div>
        </aside>

        <div className="md:col-span-3">

          {/* ── COMENZI ── */}
          {tab === 'orders' && (
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Comenzile mele</h2>
              {orders.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-white font-bold mb-2">Nu ai nicio comandă încă</p>
                  <p className="text-gray-500 text-sm mb-6">Explorează catalogul nostru de vinyluri, CD-uri și casete.</p>
                  <Link to="/catalog" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                    Mergi la catalog
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {[...orders].reverse().map(order => {
                    const isExpanded = expandedOrder === order.orderNumber
                    const currentStatusIdx = ORDER_STATUSES.indexOf(order.status || 'Plasată')

                    return (
                      <div key={order.orderNumber} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
                        {/* Header comandă */}
                        <div
                          className="flex items-start justify-between p-5 cursor-pointer hover:bg-gray-800/40 transition-colors"
                          onClick={() => setExpandedOrder(isExpanded ? null : order.orderNumber)}
                        >
                          <div>
                            <p className="text-white font-bold">{order.orderNumber}</p>
                            <p className="text-gray-500 text-xs mt-0.5">
                              {new Date(order.date).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                            {order.awb && (
                              <p className="text-purple-400 text-xs mt-1 font-mono">
                                AWB: {order.awb} · {order.courier}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusColors[order.status] || statusColors['Plasată']}`}>
                              {statusIcons[order.status]} {order.status || 'Plasată'}
                            </span>
                            <span className="text-white font-black">{formatPrice(order.total)}</span>
                            <svg
                              className={`w-4 h-4 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="border-t border-gray-800 p-5 space-y-5">

                            {/* Progress bar status */}
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Progres comandă</p>
                              <div className="flex items-center gap-1">
                                {ORDER_STATUSES.filter(s => s !== 'Returnată').map((s, i, arr) => {
                                  const isDone = currentStatusIdx >= ORDER_STATUSES.indexOf(s)
                                  const isReturned = order.status === 'Returnată'
                                  return (
                                    <div key={s} className="flex items-center flex-1">
                                      <div className={`flex flex-col items-center flex-1`}>
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                                          isReturned ? 'bg-gray-800 text-gray-600 border border-gray-700'
                                          : isDone ? 'bg-red-500 text-white'
                                          : 'bg-gray-800 text-gray-600 border border-gray-700'
                                        }`}>
                                          {isDone && !isReturned ? '✓' : i + 1}
                                        </div>
                                        <span className={`text-xs mt-1 text-center leading-tight ${isDone && !isReturned ? 'text-white' : 'text-gray-600'}`}>
                                          {s}
                                        </span>
                                      </div>
                                      {i < arr.length - 1 && (
                                        <div className={`h-0.5 flex-1 mb-5 ${isDone && !isReturned && currentStatusIdx > ORDER_STATUSES.indexOf(s) ? 'bg-red-500' : 'bg-gray-800'}`} />
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                              {order.status === 'Returnată' && (
                                <div className="mt-2 text-center">
                                  <span className="text-xs text-gray-500 bg-gray-800 px-3 py-1 rounded-full">↩️ Comandă returnată</span>
                                </div>
                              )}
                            </div>

                            {/* Produse */}
                            <div className="space-y-2">
                              {order.items.map((item, i) => (
                                <div key={i} className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                                    <img src={item.images?.[0]} alt="" className="w-full h-full object-cover"
                                      onError={e => { e.target.src = 'https://placehold.co/32x32/1f2937/6b7280?text=—' }} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                                    <p className="text-gray-500 text-xs">{item.format} · x{item.quantity}</p>
                                  </div>
                                  <span className="text-gray-400 text-xs flex-shrink-0">{formatPrice(item.finalPrice * item.quantity)}</span>
                                </div>
                              ))}
                            </div>

                            {/* Info livrare */}
                            <div className="bg-gray-950 rounded-xl p-3 text-xs text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
                              <span>📍 {order.deliveryAddress}, {order.deliveryCity}</span>
                              <span>💳 {order.paymentMethod}</span>
                              {order.awb && <span className="text-purple-400 font-mono">AWB: {order.awb}</span>}
                            </div>

                            {/* Istoric statusuri */}
                            {order.statusHistory && order.statusHistory.length > 1 && (
                              <div>
                                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Istoric</p>
                                <div className="space-y-1.5">
                                  {[...order.statusHistory].reverse().map((h, i) => (
                                    <div key={i} className="flex items-center gap-3 text-xs">
                                      <span className={`font-semibold px-2 py-0.5 rounded-full border ${statusColors[h.status] || statusColors['Plasată']}`}>
                                        {statusIcons[h.status]} {h.status}
                                      </span>
                                      <span className="text-gray-600">
                                        {new Date(h.date).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}


                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── ADRESE ── */}
          {tab === 'addresses' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-white font-bold text-lg">Adresele mele</h2>
                {!showAddrForm && (
                  <button
                    onClick={() => setShowAddrForm(true)}
                    className="flex items-center gap-2 text-sm bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Adaugă adresă
                  </button>
                )}
              </div>

              {/* Formular adresă nouă */}
              {showAddrForm && (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 space-y-4">
                  <h3 className="text-white font-semibold">Adresă nouă</h3>
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Etichetă (opțional)</label>
                    <input
                      value={addrForm.label}
                      onChange={e => setAddrForm(f => ({ ...f, label: e.target.value }))}
                      placeholder="ex: Acasă, Birou..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Stradă, număr <span className="text-red-500">*</span></label>
                    <input
                      value={addrForm.address}
                      onChange={e => { setAddrForm(f => ({ ...f, address: e.target.value })); setAddrErrors(err => ({ ...err, address: '' })) }}
                      className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${addrErrors.address ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
                    />
                    {addrErrors.address && <p className="text-red-400 text-xs mt-1">{addrErrors.address}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Oraș <span className="text-red-500">*</span></label>
                      <input
                        value={addrForm.city}
                        onChange={e => { setAddrForm(f => ({ ...f, city: e.target.value })); setAddrErrors(err => ({ ...err, city: '' })) }}
                        className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${addrErrors.city ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
                      />
                      {addrErrors.city && <p className="text-red-400 text-xs mt-1">{addrErrors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Județ <span className="text-red-500">*</span></label>
                      <input
                        value={addrForm.county}
                        onChange={e => { setAddrForm(f => ({ ...f, county: e.target.value })); setAddrErrors(err => ({ ...err, county: '' })) }}
                        className={`w-full bg-gray-800 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-colors ${addrErrors.county ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
                      />
                      {addrErrors.county && <p className="text-red-400 text-xs mt-1">{addrErrors.county}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Telefon livrare</label>
                    <input
                      value={addrForm.phone}
                      onChange={e => setAddrForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="07xx xxx xxx"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleSaveAddress} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                      Salvează adresa
                    </button>
                    <button onClick={() => { setShowAddrForm(false); setAddrErrors({}) }} className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                      Anulează
                    </button>
                  </div>
                </div>
              )}

              {/* Lista adrese */}
              {savedAddresses.length === 0 && !showAddrForm ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">📍</p>
                  <p className="text-white font-bold mb-2">Nicio adresă salvată</p>
                  <p className="text-gray-500 text-sm">Adaugă o adresă pentru a completa mai rapid comenzile.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {savedAddresses.map(addr => (
                    <div key={addr.id} className={`bg-gray-900 border rounded-2xl p-4 flex items-start justify-between gap-4 ${addr.isDefault ? 'border-red-500/40' : 'border-gray-800'}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {addr.label && <span className="text-white font-bold text-sm">{addr.label}</span>}
                          {addr.isDefault && (
                            <span className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full font-semibold">
                              Implicită
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm">{addr.address}</p>
                        <p className="text-gray-500 text-sm">{addr.city}, {addr.county}</p>
                        {addr.phone && <p className="text-gray-600 text-xs mt-1">{addr.phone}</p>}
                      </div>
                      <div className="flex flex-col gap-2 flex-shrink-0">
                        {!addr.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(user.id, addr.id)}
                            className="text-xs text-gray-500 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                          >
                            Setează implicită
                          </button>
                        )}
                        <button
                          onClick={() => deleteAddress(user.id, addr.id)}
                          className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/60 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Șterge
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* ── WISHLIST ── */}
          {tab === 'wishlist' && (
            <div>
              <h2 className="text-white font-bold text-lg mb-4">Wishlist</h2>
              {wishlist.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
                  <p className="text-4xl mb-3">💖</p>
                  <p className="text-white font-bold mb-2">Wishlist-ul tău este gol</p>
                  <p className="text-gray-500 text-sm mb-6">Salvează produsele preferate apăsând iconița ❤️</p>
                  <Link to="/catalog" className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
                    Explorează catalogul
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[...wishlist].reverse().map(product => {
                    const finalPrice = product.discount > 0
                      ? Math.round(product.price * (1 - product.discount / 100))
                      : product.price
                    return (
                      <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden flex flex-col">
                        <Link to={`/product/${product.id}`} className="relative aspect-video overflow-hidden bg-gray-800 block">
                          <img
                            src={product.images?.[0]}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            onError={e => { e.target.src = 'https://placehold.co/400x225/1f2937/6b7280?text=—' }}
                          />
                          {product.discount > 0 && (
                            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">-{product.discount}%</span>
                          )}
                        </Link>
                        <div className="p-4 flex flex-col flex-1">
                          <p className="text-xs text-red-400 font-medium uppercase tracking-wide truncate mb-0.5">{product.artist}</p>
                          <Link to={`/product/${product.id}`} className="text-white font-semibold text-sm leading-tight mb-1 hover:text-red-400 transition-colors line-clamp-2">
                            {product.name}
                          </Link>
                          <p className="text-gray-500 text-xs mb-3">{product.format} · {product.year}</p>
                          <div className="mt-auto flex items-center justify-between gap-2">
                            <div>
                              <span className="text-white font-bold">{finalPrice} RON</span>
                              {product.discount > 0 && <span className="text-gray-600 text-xs line-through ml-2">{product.price} RON</span>}
                            </div>
                            <button
                              onClick={() => toggleWishlist(user.id, product)}
                              className="text-xs text-red-500 hover:text-red-400 border border-red-500/30 hover:border-red-500/60 px-3 py-1.5 rounded-lg transition-colors"
                            >
                              Elimină
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFIL ── */}
          {tab === 'profile' && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white font-bold text-lg">Informații profil</h2>
                {!editMode && (
                  <button onClick={() => setEditMode(true)} className="text-sm text-red-400 hover:text-red-300 font-semibold">
                    Editează
                  </button>
                )}
              </div>

              {saveMsg && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
                  ✓ {saveMsg}
                </div>
              )}

              <div className="space-y-4">
                {editMode ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Prenume</label>
                        <input
                          value={form.firstName}
                          onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Nume</label>
                        <input
                          value={form.lastName}
                          onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Email</label>
                      <input value={form.email} disabled className="w-full bg-gray-800/50 border border-gray-800 rounded-xl px-4 py-3 text-gray-500 text-sm cursor-not-allowed" />
                      <p className="text-xs text-gray-600 mt-1">Emailul nu poate fi modificat.</p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleSaveProfile} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl transition-colors text-sm">
                        Salvează
                      </button>
                      <button onClick={() => { setEditMode(false); setForm({ firstName: user.firstName, lastName: user.lastName, email: user.email }) }} className="border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm">
                        Anulează
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    {[
                      ['Prenume', user.firstName],
                      ['Nume', user.lastName],
                      ['Email', user.email],
                      ['Cont creat', new Date(user.createdAt).toLocaleDateString('ro-RO', { year: 'numeric', month: 'long', day: 'numeric' })],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center border-b border-gray-800 pb-3 last:border-0">
                        <span className="text-gray-500 text-sm w-32">{label}</span>
                        <span className="text-white text-sm font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal AWB ── */}
      {awbModal && (() => {
        const order = orders.find(o => o.orderNumber === awbModal)
        if (!order) return null
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-md">
              <h3 className="text-white font-bold text-lg mb-1">Marchează ca Expediată</h3>
              <p className="text-gray-500 text-sm mb-5">Comandă #{order.orderNumber}</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                    Număr AWB <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={awbForm.awb}
                    onChange={e => setAwbForm(f => ({ ...f, awb: e.target.value }))}
                    placeholder="ex: 1234567890"
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Curier</label>
                  <select
                    value={awbForm.courier}
                    onChange={e => setAwbForm(f => ({ ...f, courier: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-red-500 transition-colors"
                  >
                    {['Fan Courier', 'DPD', 'Sameday', 'DHL', 'Cargus', 'Altul'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                    Link tracking (opțional)
                  </label>
                  <input
                    value={awbForm.trackingUrl}
                    onChange={e => setAwbForm(f => ({ ...f, trackingUrl: e.target.value }))}
                    placeholder="https://..."
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3">
                  <p className="text-purple-300 text-xs">
                    📧 Un email automat cu detaliile expedierii va fi trimis clientului.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setAwbModal(null)}
                  className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white font-semibold py-3 rounded-xl transition-colors text-sm"
                >
                  Anulează
                </button>
                <button
                  onClick={() => handleShipWithAwb(order)}
                  disabled={awbSending || !awbForm.awb.trim()}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/40 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {awbSending ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Se trimite emailul...
                    </>
                  ) : '🚚 Marchează & Trimite email'}
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}