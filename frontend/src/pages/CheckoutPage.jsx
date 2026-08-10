import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { useAuthStore } from "../store/authStore"
import { formatPrice, calcDiscountedPrice } from "../utils/format"
import { sendOrderConfirmationEmail } from "../utils/emailService"

const COUPON_CODES = { VINYL10: 10, MUZICA20: 20, RECORD15: 15 }

function InputField({ label, name, type = "text", value, onChange, placeholder, required, error }) {
  return (
    <div>
      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors ${
          error ? "border-red-500" : "border-gray-700 focus:border-red-500"
        }`}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  )
}

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const { user, saveOrder, getSavedAddresses } = useAuthStore()
  const savedAddresses = user ? getSavedAddresses(user.id) : []
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [coupon, setCoupon] = useState("")
  const [couponInput, setCouponInput] = useState("")
  const [couponError, setCouponError] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [payMethod, setPayMethod] = useState("card")
  const [errors, setErrors] = useState({})
  const [placing, setPlacing] = useState(false)
  const [emailSent, setEmailSent] = useState(null)
  const [savedOrder, setSavedOrder] = useState(null)
  const [orderNum] = useState(() => "VV" + Math.floor(100000 + Math.random() * 900000))
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    address: "", city: "", county: "", zip: "", notes: "",
    cardNumber: "", cardName: "", cardExpiry: "", cardCVV: ""
  })

  const subtotal = items.reduce((s, i) => s + calcDiscountedPrice(i.price, i.discount) * i.quantity, 0)
  const shipping = subtotal >= 200 ? 0 : subtotal === 0 ? 0 : 19.99
  const couponSaving = Math.round(subtotal * couponDiscount / 100)
  const total = Math.round((subtotal + shipping - couponSaving) * 100) / 100

  // AUTH GUARD
  if (!user) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="text-5xl">🔒</div>
      <h2 className="text-2xl font-black text-white">Autentifică-te pentru a comanda</h2>
      <p className="text-gray-500 text-sm max-w-sm">Ai nevoie de un cont pentru a plasa o comandă și a primi confirmarea pe email.</p>
      <div className="flex gap-3 mt-2">
        <Link to="/auth" state={{ from: '/checkout' }} className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors">Autentifică-te</Link>
        <Link to="/auth?mode=register" state={{ from: '/checkout' }} className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-6 py-3 rounded-xl transition-colors">Creează cont</Link>
      </div>
      <Link to="/cart" className="text-gray-500 hover:text-gray-300 text-sm mt-2">← Înapoi la coș</Link>
    </div>
  )

  if (items.length === 0 && step !== 3) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🛒</p>
      <p className="text-white font-bold text-xl mb-4">Coșul tău este gol</p>
      <Link to="/catalog" className="text-red-400 hover:text-red-300 font-semibold">← Mergi la catalog</Link>
    </div>
  )

  const handleChange = e => {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
    if (errors[name]) setErrors(err => ({ ...err, [name]: "" }))
  }

  const applyCoupon = () => {
    const code = couponInput.toUpperCase().trim()
    if (COUPON_CODES[code]) {
      setCoupon(code)
      setCouponDiscount(COUPON_CODES[code])
      setCouponError("")
    } else {
      setCouponError("Cod de reducere invalid.")
      setCoupon("")
      setCouponDiscount(0)
    }
  }

  const validateStep1 = () => {
    const req = ["firstName", "lastName", "email", "phone", "address", "city", "county"]
    const e = {}
    req.forEach(f => { if (!form[f].trim()) e[f] = "Câmp obligatoriu" })
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = "Email invalid"
    if (form.phone && !/^(\+4|0)[0-9]{9}$/.test(form.phone.replace(/\s/g, ""))) e.phone = "Număr invalid"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    if (payMethod !== "card") return true
    const e = {}
    if (!form.cardNumber.replace(/\s/g, "").match(/^\d{16}$/)) e.cardNumber = "Număr card invalid (16 cifre)"
    if (!form.cardName.trim()) e.cardName = "Câmp obligatoriu"
    if (!form.cardExpiry.match(/^\d{2}\/\d{2}$/)) e.cardExpiry = "Format: MM/AA"
    if (!form.cardCVV.match(/^\d{3,4}$/)) e.cardCVV = "CVV invalid"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handlePlaceOrder = async () => {
    if (!validateStep2()) return
    setPlacing(true)

    const payLabels = { card: "Card bancar", ramburs: "Ramburs", transfer: "Transfer bancar" }
    const orderItems = items.map(i => ({ ...i, finalPrice: calcDiscountedPrice(i.price, i.discount) }))

    const order = {
      orderNumber: orderNum,
      userId: user.id,
      email: form.email,
      date: new Date().toISOString(),
      status: "Plasată",
      items: orderItems,
      subtotal: Math.round(subtotal),
      shipping: Math.round(shipping * 100) / 100,
      couponSaving,
      couponCode: coupon || null,
      total: Math.round(total),
      paymentMethod: payLabels[payMethod],
      deliveryAddress: form.address,
      deliveryCity: form.city,
      deliveryCounty: form.county,
      customerName: form.firstName + " " + form.lastName,
      customerPhone: form.phone,
      notes: form.notes
    }

    await saveOrder(order)

    // Salvează sumele ÎNAINTE să golești coșul
    setSavedOrder({
      total,
      subtotal,
      shipping,
      couponSaving,
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      address: form.address,
      city: form.city,
    })

    const emailResult = await sendOrderConfirmationEmail({
      orderNumber: orderNum,
      customerName: `${form.firstName} ${form.lastName}`,
      customerEmail: form.email,
      items: orderItems,
      subtotal: Math.round(subtotal),
      shipping: Math.round(shipping * 100) / 100,
      couponDiscount: couponSaving,
      total: Math.round(total),
      deliveryAddress: form.address,
      deliveryCity: form.city,
      deliveryCounty: form.county,
      paymentMethod: payLabels[payMethod]
    })

    setEmailSent(emailResult)
    clearCart()
    setPlacing(false)
    setStep(3)
  }

  const formatCard = val => val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim()
  const formatExpiry = val => {
    const d = val.replace(/\D/g, "").slice(0, 4)
    return d.length >= 3 ? d.slice(0, 2) + "/" + d.slice(2) : d
  }

  // ── STEP 3 — Confirmare ──────────────────────────────────────────────────────
  if (step === 3) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-20 h-20 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-black text-white mb-3">Comandă plasată!</h1>
      <p className="text-gray-400 mb-2">Numărul comenzii tale este</p>
      <p className="text-2xl font-black text-red-400 mb-4">{orderNum}</p>

      {emailSent?.dev ? (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 text-amber-300 text-sm mb-4">
          📧 Dev mode: emailul a fost logat în consolă. Configurează EmailJS pentru emailuri reale.
        </div>
      ) : (
        <div className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-gray-400 text-sm mb-4">
          ✉️ Confirmarea a fost trimisă la <strong className="text-white">{savedOrder?.email}</strong>
        </div>
      )}

      <p className="text-gray-500 text-sm mb-8">
        Estimăm livrarea în <span className="text-white font-semibold">1-3 zile lucrătoare</span>.
      </p>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 text-left mb-8 space-y-2">
        {[
          ["Client", `${savedOrder?.firstName} ${savedOrder?.lastName}`],
          ["Adresă", `${savedOrder?.address}, ${savedOrder?.city}`],
          ["Total plătit", formatPrice(savedOrder?.total ?? 0)],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between text-sm">
            <span className="text-gray-500">{k}</span>
            <span className="text-white font-medium">{v}</span>
          </div>
        ))}
      </div>

      <div className="flex gap-3 justify-center">
        <Link to="/account" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-5 py-3 rounded-xl transition-colors text-sm">
          Comenzile mele
        </Link>
        <Link to="/" className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl transition-colors text-sm">
          Înapoi acasă
        </Link>
      </div>
    </div>
  )

  // ── STEP 1 & 2 ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black text-white mb-2">Finalizare comandă</h1>
      <p className="text-gray-500 text-sm mb-8">
        Autentificat: <span className="text-white font-medium">{user.firstName} {user.lastName}</span> · <span className="text-red-400">{user.email}</span>
      </p>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-10">
        {[["1", "Date livrare"], ["2", "Plată"]].map(([num, label], i) => (
          <div key={num} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step > Number(num) ? "bg-green-500 text-white"
              : step === Number(num) ? "bg-red-500 text-white"
              : "bg-gray-800 text-gray-500"
            }`}>
              {step > Number(num) ? "✓" : num}
            </div>
            <span className={`text-sm font-medium ${step === Number(num) ? "text-white" : "text-gray-500"}`}>{label}</span>
            {i < 1 && <div className="w-12 h-px bg-gray-700 mx-1" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">

          {/* STEP 1 — Date livrare */}
          {step === 1 && (
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-5">
              <h2 className="text-white font-bold text-lg">Date de livrare</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Prenume" name="firstName" value={form.firstName} onChange={handleChange} required error={errors.firstName} />
                <InputField label="Nume" name="lastName" value={form.lastName} onChange={handleChange} required error={errors.lastName} />
              </div>
              <InputField label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemplu.com" required error={errors.email} />
              <InputField label="Telefon" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="07xx xxx xxx" required error={errors.phone} />

              <div className="border-t border-gray-800 pt-5 space-y-4">
                <h3 className="text-white font-semibold">Adresă livrare</h3>

                {/* Selector adrese salvate */}
                {savedAddresses.length > 0 && (
                  <div>
                    <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-2">
                      Adrese salvate
                    </label>
                    <div className="grid gap-2">
                      {savedAddresses.map(addr => (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => setForm(f => ({
                            ...f,
                            address: addr.address,
                            city: addr.city,
                            county: addr.county,
                            phone: addr.phone || f.phone,
                          }))}
                          className={`text-left p-3 rounded-xl border transition-colors ${
                            form.address === addr.address && form.city === addr.city
                              ? 'border-red-500 bg-red-500/10'
                              : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {addr.label && <span className="text-white text-xs font-bold">{addr.label}</span>}
                            {addr.isDefault && <span className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 px-1.5 py-0.5 rounded-full">Implicită</span>}
                          </div>
                          <p className="text-gray-400 text-xs mt-0.5">{addr.address}, {addr.city}, {addr.county}</p>
                        </button>
                      ))}
                      <div className="text-xs text-gray-600 text-center py-1">— sau completează manual —</div>
                    </div>
                  </div>
                )}

                <InputField label="Stradă, număr, bloc" name="address" value={form.address} onChange={handleChange} required error={errors.address} />
                <div className="grid grid-cols-2 gap-4">
                  <InputField label="Oraș" name="city" value={form.city} onChange={handleChange} required error={errors.city} />
                  <InputField label="Județ" name="county" value={form.county} onChange={handleChange} required error={errors.county} />
                </div>
                <InputField label="Cod poștal" name="zip" value={form.zip} onChange={handleChange} placeholder="Opțional" />
                <div>
                  <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">Mențiuni speciale</label>
                  <textarea
                    name="notes" value={form.notes} onChange={handleChange} rows={3}
                    placeholder="Instrucțiuni pentru curier..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors resize-none"
                  />
                </div>
              </div>

              <button
                onClick={() => { if (validateStep1()) setStep(2) }}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors"
              >
                Continuă spre plată →
              </button>
            </div>
          )}

          {/* STEP 2 — Plată */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                <h2 className="text-white font-bold text-lg mb-5">Metodă de plată</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { id: "card", label: "Card bancar", icon: "💳" },
                    { id: "ramburs", label: "Ramburs", icon: "💵" },
                    { id: "transfer", label: "Transfer", icon: "🏦" }
                  ].map(m => (
                    <button key={m.id} onClick={() => setPayMethod(m.id)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        payMethod === m.id ? "border-red-500 bg-red-500/10" : "border-gray-700 hover:border-gray-500"
                      }`}>
                      <div className="text-2xl mb-1">{m.icon}</div>
                      <div className={`text-xs font-semibold ${payMethod === m.id ? "text-red-400" : "text-gray-400"}`}>{m.label}</div>
                    </button>
                  ))}
                </div>

                {payMethod === "card" && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                        Număr card <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.cardNumber}
                        onChange={e => setForm(f => ({ ...f, cardNumber: formatCard(e.target.value) }))}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none transition-colors font-mono ${
                          errors.cardNumber ? "border-red-500" : "border-gray-700 focus:border-red-500"
                        }`}
                      />
                      {errors.cardNumber && <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>}
                    </div>
                    <InputField label="Numele de pe card" name="cardName" value={form.cardName} onChange={handleChange} placeholder="ION POPESCU" required error={errors.cardName} />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                          Expirare <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.cardExpiry}
                          onChange={e => setForm(f => ({ ...f, cardExpiry: formatExpiry(e.target.value) }))}
                          placeholder="MM/AA" maxLength={5}
                          className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none transition-colors ${
                            errors.cardExpiry ? "border-red-500" : "border-gray-700 focus:border-red-500"
                          }`}
                        />
                        {errors.cardExpiry && <p className="text-red-400 text-xs mt-1">{errors.cardExpiry}</p>}
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 font-semibold uppercase tracking-wide mb-1.5">
                          CVV <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.cardCVV}
                          onChange={e => setForm(f => ({ ...f, cardCVV: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          placeholder="•••" maxLength={4}
                          className={`w-full bg-gray-900 border rounded-xl px-4 py-3 text-white text-sm font-mono placeholder-gray-600 focus:outline-none transition-colors ${
                            errors.cardCVV ? "border-red-500" : "border-gray-700 focus:border-red-500"
                          }`}
                        />
                        {errors.cardCVV && <p className="text-red-400 text-xs mt-1">{errors.cardCVV}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">🔒 Date criptate. Nu stocăm informații de plată.</p>
                  </div>
                )}

                {payMethod === "ramburs" && (
                  <div className="bg-amber-950/30 border border-amber-900/40 rounded-xl p-4">
                    <p className="text-amber-300 text-sm font-semibold mb-1">Plată la livrare</p>
                    <p className="text-gray-400 text-xs">Vei plăti curierului la momentul livrării. Taxa de ramburs: 5 RON.</p>
                  </div>
                )}

                {payMethod === "transfer" && (
                  <div className="bg-blue-950/30 border border-blue-900/40 rounded-xl p-4 space-y-1">
                    <p className="text-blue-300 text-sm font-semibold">Transfer bancar</p>
                    <div className="text-xs text-gray-400 font-mono space-y-1">
                      <p>Beneficiar: <span className="text-white">VinylVault SRL</span></p>
                      <p>IBAN: <span className="text-white">RO49 AAAA 1B31 0075 9384 0000</span></p>
                      <p>Ref: <span className="text-white">{orderNum}</span></p>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold py-4 rounded-xl transition-colors">
                  ← Înapoi
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placing}
                  className="flex-grow bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {placing ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Se plasează...
                    </>
                  ) : "Plasează comanda →"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sumar comandă */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-white font-bold mb-4">Sumar ({items.reduce((s, i) => s + i.quantity, 0)} produse)</h2>

            <div className="space-y-3 mb-5 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    <img
                      src={item.images?.[0]} alt=""
                      className="w-full h-full object-cover"
                      onError={e => { e.target.src = "https://placehold.co/40x40/1f2937/6b7280?text=—" }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    <p className="text-gray-500 text-xs">×{item.quantity}</p>
                  </div>
                  <span className="text-white text-xs font-bold">
                    {formatPrice(calcDiscountedPrice(item.price, item.discount) * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            {/* Cod reducere */}
            <div className="mb-5">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">Cod reducere</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={e => { setCouponInput(e.target.value.toUpperCase()); setCouponError("") }}
                  placeholder="ex: VINYL10"
                  className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-red-500 uppercase"
                />
                <button onClick={applyCoupon} className="bg-gray-700 hover:bg-gray-600 text-white text-sm font-bold px-4 rounded-xl transition-colors">
                  Aplică
                </button>
              </div>
              {couponError && <p className="text-red-400 text-xs mt-1">{couponError}</p>}
              {coupon && <p className="text-green-400 text-xs mt-1">✓ {coupon} aplicat — -{couponDiscount}%</p>}
            </div>

            {/* Totaluri */}
            <div className="border-t border-gray-800 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {couponSaving > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400">Cupon {coupon}</span>
                  <span className="text-green-400">-{formatPrice(couponSaving)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Transport</span>
                <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                  {shipping === 0 ? "GRATUIT" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-800">
                <span className="text-white font-bold">Total</span>
                <span className="text-white font-black text-xl">{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}