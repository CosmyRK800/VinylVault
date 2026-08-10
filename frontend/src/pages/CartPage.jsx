import { Link, useNavigate } from "react-router-dom"
import { useCartStore } from "../store/cartStore"
import { formatPrice, calcDiscountedPrice } from "../utils/format"

function CartItem({ item, updateQty, removeItem }) {
  const finalPrice = calcDiscountedPrice(item.price, item.discount)

  return (
    <div className="flex gap-4 p-4 bg-gray-900 border border-gray-800 rounded-xl">
      {/* Image */}
      <Link to={`/product/${item.id}`} className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-800">
        <img
          src={item.images?.[0]}
          alt={item.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform"
          onError={e => { e.target.src = "https://placehold.co/80x80/1f2937/6b7280?text=—" }}
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-red-400 text-xs font-semibold uppercase tracking-wide mb-0.5 truncate">{item.artist}</p>
        <Link to={`/product/${item.id}`} className="text-white text-sm font-semibold leading-tight hover:text-red-400 transition-colors line-clamp-2 block">
          {item.name}
        </Link>
        <p className="text-gray-500 text-xs mt-1">{item.format} · {item.year}</p>
      </div>

      {/* Price + qty */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeItem(item.id)}
          className="text-gray-600 hover:text-red-400 transition-colors"
          title="Șterge"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

      <div className="flex items-center bg-gray-800 border border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => updateQty(item.id, item.quantity - 1)}
          className="px-2.5 py-1.5 text-white hover:bg-gray-700 transition-colors text-sm font-bold"
        >−</button>
        <span className="px-3 text-white text-sm font-bold min-w-[28px] text-center">{item.quantity}</span>
        <button
          onClick={() => updateQty(item.id, Math.min(item.stock, item.quantity + 1))}
          disabled={item.quantity >= item.stock}
          className="px-2.5 py-1.5 text-white hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-sm font-bold"
        >+</button>
      </div>

        <div className="text-right">
          <div className="text-white font-bold text-sm">{formatPrice(finalPrice * item.quantity)}</div>
          {item.discount > 0 && (
            <div className="text-gray-500 text-xs line-through">{formatPrice(item.price * item.quantity)}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CartPage() {
  const { items, updateQty, removeItem, clearCart } = useCartStore()
  const navigate = useNavigate()

  const subtotal = items.reduce((sum, i) => sum + calcDiscountedPrice(i.price, i.discount) * i.quantity, 0)
  const originalTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const totalSavings = originalTotal - subtotal
  const shipping = subtotal === 0 ? 0 : subtotal >= 200 ? 0 : 19.99
  const total = subtotal + shipping

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <div className="text-6xl mb-6">🛒</div>
      <h1 className="text-2xl font-black text-white mb-3">Coșul tău este gol</h1>
      <p className="text-gray-500 mb-8">Descoperă colecția noastră de vinyluri, CD-uri și casete.</p>
      <Link
        to="/catalog"
        className="inline-block bg-red-500 hover:bg-red-600 text-white font-bold px-8 py-4 rounded-xl transition-colors"
      >
        Explorează catalogul
      </Link>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white">Coșul meu</h1>
          <p className="text-gray-500 text-sm mt-1">{items.reduce((s, i) => s + i.quantity, 0)} produse</p>
        </div>
        <button
          onClick={clearCart}
          className="text-sm text-gray-500 hover:text-red-400 transition-colors"
        >
          Golește coșul
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map(item => (
            <CartItem key={item.id} item={item} updateQty={updateQty} removeItem={removeItem} />
          ))}

          <Link
            to="/catalog"
            className="flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold mt-4 transition-colors"
          >
            ← Continuă cumpărăturile
          </Link>
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 sticky top-24">
            <h2 className="text-white font-bold text-lg mb-5">Sumar comandă</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-white">{formatPrice(subtotal)}</span>
              </div>
              {totalSavings > 0 && (
                <div className="flex justify-between">
                  <span className="text-green-400">Economii</span>
                  <span className="text-green-400">-{formatPrice(totalSavings)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Transport</span>
                <span className={shipping === 0 ? "text-green-400" : "text-white"}>
                  {shipping === 0 ? "GRATUIT" : formatPrice(shipping)}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-600">Transport gratuit la comenzi peste 200 RON</p>
              )}
            </div>

            <div className="border-t border-gray-800 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-white font-bold text-base">Total</span>
                <span className="text-white font-black text-2xl">{formatPrice(total)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl transition-colors text-base"
            >
              Finalizează comanda →
            </button>

            {/* Trust signals */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-600">
              <span>🔒 Plată securizată</span>
              <span>·</span>
              <span>↩️ Retur 30 zile</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}