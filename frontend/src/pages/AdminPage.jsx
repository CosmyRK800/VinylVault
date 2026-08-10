import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { formatPrice, calcDiscountedPrice } from '../utils/format'
import { sendShippingEmail } from '../utils/emailService'

// ── Configurare admin (email-uri autorizate) ──────────────────────────────────
const ADMIN_EMAILS = ['admin@vinylvault.ro', 'contact@vinylvault.ro']

const ORDER_STATUSES = ['Plasată', 'Procesată', 'Expediată', 'Livrată', 'Anulată']

const statusColors = {
  'Plasată':   'text-amber-400 bg-amber-400/10 border-amber-400/30',
  'Procesată': 'text-blue-400 bg-blue-400/10 border-blue-400/30',
  'Expediată': 'text-purple-400 bg-purple-400/10 border-purple-400/30',
  'Livrată':   'text-green-400 bg-green-400/10 border-green-400/30',
  'Anulată':   'text-red-400 bg-red-400/10 border-red-400/30',
}

// ── Modal confirmare ──────────────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-sm w-full">
        <p className="text-white font-semibold mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-700 text-gray-300 font-semibold py-2 rounded-xl hover:border-gray-500 transition-colors">
            Anulează
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 rounded-xl transition-colors">
            Confirmă
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Input reutilizabil (TREBUIE să fie în afara ProductForm, altfel React
//    recreează componenta la fiecare re-render și input-ul pierde focus-ul) ───
function FieldInput({ label, value, onChange, error, type = 'text', placeholder, half }) {
  return (
    <div className={half ? '' : 'col-span-2'}>
      <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${
          error ? 'border-red-500' : 'border-gray-700 focus:border-red-500'
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

const FORMATS_BY_CAT = {
  vinyl:     ['LP 12"', 'EP 7"', 'EP 10"', 'Picture Disc', 'Box Set', 'Single'],
  cd:        ['CD', 'CD Dublu', 'Digipack', 'Box Set', 'CD Single'],
  caseta:    ['Casetă Audio', 'Casetă Demo', 'Casetă Blank'],
  merch:     ['Tricou', 'Hanorac', 'Poster', 'Patch', 'Sticker', 'Șapcă', 'Geantă'],
  accesorii: ['Ac pickup', 'Slipmat', 'Perie vinil', 'Curățitor vinil', 'Curea pickup', 'Cutie transport'],
  audio:     ['Patefon', 'Amplificator', 'Boxe', 'Căști', 'Cabluri', 'Mixer', 'Preamplificator'],
}

// ── Formular produs ───────────────────────────────────────────────────────────
function ProductForm({ initial, onSave, onCancel, loading }) {
  const empty = {
    name: '', artist: '', category: 'vinyl', format: 'LP 12"',
    genre: 'Rock', year: new Date().getFullYear(), label: '',
    price: '', original_price: '', discount: 0, stock: 1,
    is_new: false, is_featured: false,
    images: [''], description: '', tags: ''
  }

  const [form, setForm] = useState(initial ? {
    ...initial,
    images: initial.images?.length ? initial.images : [''],
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : (initial.tags || ''),
    original_price: initial.original_price ?? initial.originalPrice ?? '',
    is_new: initial.is_new ?? initial.isNew ?? false,
    is_featured: initial.is_featured ?? initial.isFeatured ?? false,
  } : empty)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const needsArtist = ['vinyl', 'cd', 'caseta'].includes(form.category)

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Obligatoriu'
    if (needsArtist && !form.artist?.trim()) e.artist = 'Obligatoriu'
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0) e.price = 'Preț invalid'
    if (form.stock === '' || form.stock === null || form.stock === undefined ||
        isNaN(form.stock) || Number(form.stock) < 0) e.stock = 'Stoc invalid'
    if (!form.images[0]?.trim()) e.images = 'Cel puțin o imagine'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (!validate()) return
    onSave({
      name:           form.name.trim(),
      artist:         form.artist?.trim() || null,
      category:       form.category,
      format:         form.format,
      genre:          form.genre || null,
      year:           form.year ? Number(form.year) : null,
      label:          form.label?.trim() || null,
      price:          Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      discount:       Number(form.discount) || 0,
      stock:          Number(form.stock),
      is_new:         Boolean(form.is_new),
      is_featured:    Boolean(form.is_featured),
      images:         form.images.filter(i => i.trim()),
      description:    form.description?.trim() || null,
      tags:           form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    })
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      <FieldInput label="Denumire produs *" value={form.name} onChange={e => set('name', e.target.value)} error={errors.name} placeholder="ex: Nirvana — Nevermind" />
      <FieldInput label={needsArtist ? 'Artist *' : 'Artist / Brand'} value={form.artist} onChange={e => set('artist', e.target.value)} error={errors.artist} placeholder="ex: Pink Floyd / Audio-Technica" half />
      <FieldInput label="Label / Producător" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Columbia Records" half />

      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Categorie</label>
        <select
          value={form.category}
          onChange={e => {
            const cat = e.target.value
            set('category', cat)
            set('format', FORMATS_BY_CAT[cat]?.[0] ?? '')
          }}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
        >
          <option value="vinyl">Vinyl</option>
          <option value="cd">CD</option>
          <option value="caseta">Casetă</option>
          <option value="merch">Merch</option>
          <option value="accesorii">Accesorii</option>
          <option value="audio">Echipament Audio</option>
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Format / Tip</label>
        <select value={form.format} onChange={e => set('format', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500">
          {(FORMATS_BY_CAT[form.category] ?? [form.format]).map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Gen</label>
        <select value={form.genre} onChange={e => set('genre', e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500">
          {['Rock','Jazz','Electronic','Hip-Hop','Soul','Alternative','Industrial','Pop','Classical','Metal'].map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <FieldInput label="An" value={form.year} onChange={e => set('year', e.target.value)} type="number" half />
      <FieldInput label="Preț (RON) *" value={form.price} onChange={e => set('price', e.target.value)} error={errors.price} type="number" placeholder="189" half />
      <FieldInput label="Preț original (opțional)" value={form.original_price} onChange={e => set('original_price', e.target.value)} type="number" placeholder="220" half />
      <FieldInput label="Reducere (%)" value={form.discount} onChange={e => set('discount', e.target.value)} type="number" placeholder="0" half />
      <FieldInput label="Stoc *" value={form.stock} onChange={e => set('stock', e.target.value)} error={errors.stock} type="number" placeholder="5" half />

      <div className="col-span-2">
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">URL Imagine principală *</label>
        <input
          type="url" value={form.images[0]} onChange={e => set('images', [e.target.value, ...form.images.slice(1)])}
          placeholder="https://..."
          className={`w-full bg-gray-800 border rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${errors.images ? 'border-red-500' : 'border-gray-700 focus:border-red-500'}`}
        />
        {errors.images && <p className="text-red-400 text-xs mt-1">{errors.images}</p>}
        {form.images[0] && (
          <img src={form.images[0]} alt="" className="w-16 h-16 object-cover rounded-lg mt-2 border border-gray-700"
            onError={e => { e.target.style.display = 'none' }} />
        )}
      </div>

      <div className="col-span-2">
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">URL Imagine 2 (opțional)</label>
        <input
          type="url" value={form.images[1] || ''} onChange={e => set('images', [form.images[0], e.target.value])}
          placeholder="https://..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Descriere</label>
        <textarea
          value={form.description} onChange={e => set('description', e.target.value)}
          rows={3} placeholder="Descriere produs..."
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 resize-none"
        />
      </div>

      <div className="col-span-2">
        <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Tag-uri (separate prin virgulă)</label>
        <input
          value={form.tags} onChange={e => set('tags', e.target.value)}
          placeholder="clasic, must-have, vinyl"
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500"
        />
      </div>

      <div className="col-span-2 flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => set('is_new', !form.is_new)}
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${form.is_new ? 'bg-amber-500 border-amber-500' : 'border-gray-600'}`}
          >
            {form.is_new && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm text-gray-300">Marcat ca NOU</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            onClick={() => set('is_featured', !form.is_featured)}
            className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${form.is_featured ? 'bg-red-500 border-red-500' : 'border-gray-600'}`}
          >
            {form.is_featured && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
          </div>
          <span className="text-sm text-gray-300">Featured (apare pe homepage)</span>
        </label>
      </div>

      <div className="col-span-2 flex gap-3 pt-2 border-t border-gray-800">
        <button onClick={onCancel} className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-300 font-semibold py-3 rounded-xl transition-colors">
          Anulează
        </button>
        <button onClick={handleSubmit} disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-3 rounded-xl transition-colors">
          {loading ? 'Se salvează...' : (initial ? 'Salvează modificările' : 'Adaugă produs')}
        </button>
      </div>
    </div>
  )
}

// ── Pagina principală Admin ───────────────────────────────────────────────────
export default function AdminPage() {
  const { user, updateOrderStatus } = useAuthStore()
  const navigate = useNavigate()

  const [tab, setTab] = useState('orders')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [loadingOrders, setLoadingOrders] = useState(true)
  const [savingProduct, setSavingProduct] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [awbModal, setAwbModal] = useState(null)
  const [awbForm, setAwbForm] = useState({ awb: '', courier: 'Fan Courier', trackingUrl: '' })
  const [awbSending, setAwbSending] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState(null)
  const [toast, setToast] = useState(null)

  // ── Guard ─────────────────────────────────────────────────────────────────
  const isAdmin = user && ADMIN_EMAILS.includes(user.email?.toLowerCase())

  useEffect(() => {
    if (!isAdmin) return
    fetchProducts()
    fetchOrders()
  }, [isAdmin])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Produse ───────────────────────────────────────────────────────────────
  const fetchProducts = async () => {
    setLoadingProducts(true)
    const { data, error } = await supabase.from('products').select('*').order('id')
    if (!error) setProducts(data || [])
    setLoadingProducts(false)
  }

  // ── Comenzi ───────────────────────────────────────────────────────────────
  const normalizeOrder = (o) => ({
    orderNumber:     o.order_number,
    userId:          o.user_id,
    email:           o.customer_email,
    date:            o.date,
    status:          o.status,
    items:           o.items || [],
    subtotal:        o.subtotal,
    shipping:        o.shipping,
    couponSaving:    o.coupon_saving,
    couponCode:      o.coupon_code,
    total:           o.total,
    paymentMethod:   o.payment_method,
    deliveryAddress: o.delivery_address,
    deliveryCity:    o.delivery_city,
    deliveryCounty:  o.delivery_county,
    customerName:    o.customer_name,
    customerPhone:   o.customer_phone,
    notes:           o.notes,
    awb:             o.awb,
    courier:         o.courier,
    statusHistory:   o.status_history || [],
  })

  const fetchOrders = async () => {
    setLoadingOrders(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false })
    if (!error) setOrders((data || []).map(normalizeOrder))
    setLoadingOrders(false)
  }

  const handleSaveProduct = async (payload) => {
    setSavingProduct(true)
    if (editProduct) {
      const { data, error } = await supabase
        .from('products')
        .update(payload)
        .eq('id', editProduct.id)
        .select()
      if (error) {
        showToast('Eroare: ' + error.message, 'error')
      } else if (!data || data.length === 0) {
        showToast('Actualizare blocată — rulează în Supabase: ALTER TABLE products DISABLE ROW LEVEL SECURITY', 'error')
      } else {
        setEditProduct(null)
        setShowProductForm(false)
        await fetchProducts()
        showToast('Produs actualizat!')
      }
    } else {
      const { data, error } = await supabase.from('products').insert([payload]).select()
      if (error) {
        showToast('Eroare: ' + error.message, 'error')
      } else if (!data || data.length === 0) {
        showToast('Adăugare blocată — rulează în Supabase: ALTER TABLE products DISABLE ROW LEVEL SECURITY', 'error')
      } else {
        setShowProductForm(false)
        await fetchProducts()
        showToast('Produs adăugat!')
      }
    }
    setSavingProduct(false)
  }

  const handleDeleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) showToast('Eroare: ' + error.message, 'error')
    else { showToast('Produs șters!'); fetchProducts() }
    setConfirmDelete(null)
  }

  // ── Comenzi ───────────────────────────────────────────────────────────────
  const handleStatusChange = async (order, newStatus) => {
    if (newStatus === 'Expediată') { setAwbModal(order.orderNumber); return }
    setStatusUpdating(order.orderNumber)
    await updateOrderStatus(order.orderNumber, newStatus)
    await fetchOrders()
    setStatusUpdating(null)
    showToast(`Status actualizat: ${newStatus}`)
  }

  const handleSendAWB = async () => {
    if (!awbForm.awb.trim()) return
    setAwbSending(true)
    const order = orders.find(o => o.orderNumber === awbModal)
    if (order) {
      await updateOrderStatus(order.orderNumber, 'Expediată', {
        awb: awbForm.awb,
        courier: awbForm.courier,
      })
      await sendShippingEmail({
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        customerEmail: order.email || '',
        awb: awbForm.awb,
        courier: awbForm.courier,
        trackingUrl: awbForm.trackingUrl,
        items: order.items || [],
        deliveryAddress: order.deliveryAddress,
        deliveryCity: order.deliveryCity,
        deliveryCounty: order.deliveryCounty,
      })
    }
    await fetchOrders()
    setAwbModal(null)
    setAwbForm({ awb: '', courier: 'Fan Courier', trackingUrl: '' })
    setAwbSending(false)
    showToast('Expediat + email trimis!')
  }

  // ── Guard render ──────────────────────────────────────────────────────────
  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl">🔒</p>
      <p className="text-white font-bold text-xl">Autentifică-te pentru acces admin</p>
      <button onClick={() => navigate('/auth')} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">
        Login
      </button>
    </div>
  )

  if (!isAdmin) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <p className="text-5xl">🚫</p>
      <p className="text-white font-bold text-xl">Acces restricționat</p>
      <p className="text-gray-500 text-sm">Nu ai permisiuni de administrator.</p>
      <button onClick={() => navigate('/')} className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors">
        Înapoi acasă
      </button>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl font-semibold text-sm shadow-2xl transition-all ${toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">Bun venit, <span className="text-red-400">{user.firstName}</span></p>
        </div>
        <div className="flex items-center gap-2 bg-gray-900 border border-gray-700 rounded-xl px-3 py-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-xs font-semibold">Admin activ</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Produse', value: products.length, icon: '🎵', color: 'text-red-400' },
          { label: 'Comenzi total', value: orders.length, icon: '📦', color: 'text-blue-400' },
          { label: 'Noi (Plasată)', value: orders.filter(o => o.status === 'Plasată').length, icon: '🔔', color: 'text-amber-400' },
          { label: 'Livrate', value: orders.filter(o => o.status === 'Livrată').length, icon: '✅', color: 'text-green-400' },
        ].map(s => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-8 w-fit">
        {[['orders', '📦 Comenzi'], ['products', '🎵 Produse']].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${tab === id ? 'bg-red-500 text-white' : 'text-gray-400 hover:text-white'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* ── TAB: COMENZI ─────────────────────────────────────────────────── */}
      {tab === 'orders' && (
        <div>
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-white font-bold text-lg">Comenzi ({orders.length})</h2>
            <div className="flex items-center gap-2">
              <select
                id="orderFilter"
                className="bg-gray-900 border border-gray-700 text-white text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500"
                onChange={e => {
                  const val = e.target.value
                  if (!val) fetchOrders()
                  else supabase.from('orders').select('*').eq('status', val)
                    .order('date', { ascending: false })
                    .then(({ data }) => setOrders((data || []).map(normalizeOrder)))
                }}
              >
                <option value="">Toate statusurile</option>
                {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button onClick={fetchOrders} className="text-sm text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded-lg transition-colors">
                ↻ Reîncarcă
              </button>
            </div>
          </div>

          {loadingOrders ? (
            <div className="text-gray-500 text-sm py-8 text-center">Se încarcă comenzile...</div>
          ) : orders.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-3">📭</p>
              <p className="text-gray-400 font-semibold">Nicio comandă încă</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.orderNumber} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                  {/* Row header */}
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => setExpandedOrder(expandedOrder === order.orderNumber ? null : order.orderNumber)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-white font-bold text-sm">{order.orderNumber}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${statusColors[order.status] || 'text-gray-400 bg-gray-400/10 border-gray-400/30'}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 flex gap-3 flex-wrap">
                        <span>👤 {order.customerName}</span>
                        {order.email && <span>✉️ {order.email}</span>}
                        <span>📅 {new Date(order.date).toLocaleDateString('ro-RO')}</span>
                        <span>💰 {formatPrice(order.total)}</span>
                        <span>📦 {order.items?.length || 0} produse</span>
                      </div>
                    </div>

                    {/* Status changer */}
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order, e.target.value)}
                        disabled={statusUpdating === order.orderNumber}
                        className="bg-gray-800 border border-gray-700 text-white text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500"
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <svg className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${expandedOrder === order.orderNumber ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Expanded */}
                  {expandedOrder === order.orderNumber && (
                    <div className="border-t border-gray-800 p-4 space-y-4">
                      {/* Produse */}
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Produse</p>
                        <div className="space-y-2">
                          {(order.items || []).map((item, i) => (
                            <div key={i} className="flex items-center gap-3 bg-gray-800/50 rounded-lg p-2">
                              {item.images?.[0] && (
                                <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{item.name}</p>
                                <p className="text-gray-500 text-xs">×{item.quantity} · {item.format}</p>
                              </div>
                              <span className="text-white text-sm font-bold">{formatPrice((item.finalPrice || item.price) * item.quantity)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Date client</p>
                          <p className="text-white text-sm font-semibold">{order.customerName}</p>
                          <p className="text-gray-400 text-xs">{order.deliveryAddress}, {order.deliveryCity}, {order.deliveryCounty}</p>
                          <p className="text-gray-400 text-xs">📞 {order.customerPhone}</p>
                          <p className="text-gray-400 text-xs">💳 {order.paymentMethod}</p>
                          {order.notes && <p className="text-gray-400 text-xs">📝 {order.notes}</p>}
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-3 space-y-1">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sumar financiar</p>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">Subtotal</span><span className="text-white">{formatPrice(order.subtotal)}</span></div>
                          <div className="flex justify-between text-sm"><span className="text-gray-400">Transport</span><span className="text-white">{order.shipping === 0 ? 'GRATUIT' : formatPrice(order.shipping)}</span></div>
                          {order.couponSaving > 0 && <div className="flex justify-between text-sm"><span className="text-green-400">Cupon</span><span className="text-green-400">-{formatPrice(order.couponSaving)}</span></div>}
                          <div className="flex justify-between text-sm font-bold border-t border-gray-700 pt-1 mt-1"><span className="text-white">TOTAL</span><span className="text-red-400">{formatPrice(order.total)}</span></div>
                        </div>
                      </div>

                      {/* AWB info dacă expediată */}
                      {order.awb && (
                        <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                          <p className="text-purple-400 text-xs font-semibold mb-1">📦 Expediat via {order.courier}</p>
                          <p className="text-white font-mono text-sm">AWB: {order.awb}</p>
                        </div>
                      )}

                      {/* Buton Expediat */}
                      {order.status !== 'Expediată' && order.status !== 'Livrată' && order.status !== 'Anulată' && (
                        <button
                          onClick={() => setAwbModal(order.orderNumber)}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl transition-colors text-sm"
                        >
                          🚚 Marchează ca Expediată + trimite email AWB
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PRODUSE ─────────────────────────────────────────────────── */}
      {tab === 'products' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg">Produse ({products.length})</h2>
            <button
              onClick={() => { setEditProduct(null); setShowProductForm(true) }}
              className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded-xl transition-colors text-sm"
            >
              + Adaugă produs
            </button>
          </div>

          {/* Formular adaugare/editare */}
          {showProductForm && (
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 mb-6">
              <h3 className="text-white font-bold mb-4">{editProduct ? 'Editează produs' : 'Adaugă produs nou'}</h3>
              <ProductForm
                initial={editProduct}
                onSave={handleSaveProduct}
                onCancel={() => { setShowProductForm(false); setEditProduct(null) }}
                loading={savingProduct}
              />
            </div>
          )}

          {loadingProducts ? (
            <div className="text-gray-500 text-sm py-8 text-center">Se încarcă produsele...</div>
          ) : (
            <div className="space-y-2">
              {products.map(product => (
                <div key={product.id} className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                  <img
                    src={product.images?.[0]}
                    alt=""
                    className="w-12 h-12 object-cover rounded-lg flex-shrink-0 bg-gray-800"
                    onError={e => { e.target.src = 'https://placehold.co/48x48/1f2937/6b7280?text=—' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{product.name}</p>
                    <div className="flex gap-3 flex-wrap mt-0.5">
                      <span className="text-gray-500 text-xs">{product.format} · {product.genre} · {product.year}</span>
                      <span className={`text-xs font-semibold ${product.stock > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        Stoc: {product.stock}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-white font-bold text-sm">{formatPrice(calcDiscountedPrice(product.price, product.discount))}</p>
                    {product.discount > 0 && <p className="text-red-400 text-xs">-{product.discount}%</p>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => { setEditProduct(product); setShowProductForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      ✏️ Editează
                    </button>
                    <button
                      onClick={() => setConfirmDelete(product.id)}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border border-red-500/30"
                    >
                      🗑️ Șterge
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal AWB */}
      {awbModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-white font-bold text-lg mb-4">🚚 Detalii expediere</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Curier</label>
                <select
                  value={awbForm.courier}
                  onChange={e => setAwbForm(f => ({ ...f, courier: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                >
                  {['Fan Courier', 'DPD', 'Sameday', 'DHL', 'Cargus', 'GLS'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">Număr AWB *</label>
                <input
                  value={awbForm.awb}
                  onChange={e => setAwbForm(f => ({ ...f, awb: e.target.value }))}
                  placeholder="ex: 1234567890"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase tracking-wide font-semibold mb-1">URL tracking (opțional)</label>
                <input
                  value={awbForm.trackingUrl}
                  onChange={e => setAwbForm(f => ({ ...f, trackingUrl: e.target.value }))}
                  placeholder="https://tracking.fancourier.ro/..."
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setAwbModal(null)} className="flex-1 border border-gray-700 text-gray-300 font-semibold py-3 rounded-xl hover:border-gray-500 transition-colors">
                Anulează
              </button>
              <button onClick={handleSendAWB} disabled={awbSending || !awbForm.awb.trim()}
                className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 text-white font-bold py-3 rounded-xl transition-colors">
                {awbSending ? 'Se trimite...' : '🚚 Expediat + Email'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmare ștergere */}
      {confirmDelete && (
        <ConfirmModal
          message="Ești sigur că vrei să ștergi acest produs? Acțiunea este ireversibilă."
          onConfirm={() => handleDeleteProduct(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}