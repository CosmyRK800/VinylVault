export const formatPrice = (price) =>
  new Intl.NumberFormat("ro-RO", { style: "currency", currency: "RON", maximumFractionDigits: 0 }).format(price)

export const calcDiscountedPrice = (price, discount) =>
  discount > 0 ? Math.round(price * (1 - discount / 100)) : price

export const timeLeft = (endsAt) => {
  const diff = new Date(endsAt) - new Date()
  if (diff <= 0) return null
  const h = Math.floor(diff / 1000 / 60 / 60)
  const m = Math.floor((diff / 1000 / 60) % 60)
  const s = Math.floor((diff / 1000) % 60)
  return { h, m, s }
}