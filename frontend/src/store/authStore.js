import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { sendResetEmail } from '../utils/sendResetEmail'
import { supabase } from '../lib/supabase'

export const useAuthStore = create(
  persist(
    (set, get) => ({

      // ── STATE ───────────────────────────────────────────────────────────────
      user: null,
      users: [],
      orders: [],
      resetTokens: [],
      reviews: [],
      wishlists: {},

      // ── AUTH ────────────────────────────────────────────────────────────────
      register: async (firstName, lastName, email, password) => {
        const normalEmail = email.toLowerCase().trim()

        const { data: existing } = await supabase
          .from('customers')
          .select('id')
          .eq('email', normalEmail)
          .maybeSingle()

        if (existing) return { success: false, error: 'Există deja un cont cu acest email.' }

        const id = 'u_' + Date.now()
        const { error } = await supabase.from('customers').insert([{
          id,
          first_name: firstName,
          last_name: lastName,
          email: normalEmail,
          password,
        }])

        if (error) return { success: false, error: 'Eroare la creare cont.' }

        const safeUser = { id, firstName, lastName, email: normalEmail, createdAt: new Date().toISOString() }
        // păstrăm și în array-ul local pentru adrese / reset parolă
        set(s => ({ users: [...s.users, { ...safeUser, password }], user: safeUser }))
        return { success: true }
      },

      login: async (email, password) => {
        const normalEmail = email.toLowerCase().trim()

        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .eq('email', normalEmail)
          .eq('password', password)
          .maybeSingle()

        if (error || !data) return { success: false, error: 'Email sau parolă incorectă.' }

        const safeUser = {
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          email: data.email,
          createdAt: data.created_at,
        }
        // sincronizează array-ul local (pentru adrese, etc.)
        set(s => ({
          users: s.users.find(u => u.id === data.id)
            ? s.users
            : [...s.users, { ...safeUser, password: data.password }],
          user: safeUser,
        }))
        return { success: true }
      },

      logout: () => set({ user: null }),

      updateUser: (userId, updates) => {
        set(s => ({
          users: s.users.map(u =>
            u.id === userId ? { ...u, ...updates } : u
          ),
          user: s.user?.id === userId ? { ...s.user, ...updates } : s.user,
        }))
      },

      // ── COMENZI ─────────────────────────────────────────────────────────────
      saveOrder: async (order) => {
        // Salvează în Supabase
        const { error } = await supabase.from('orders').insert([{
          order_number:     order.orderNumber,
          user_id:          order.userId,
          date:             order.date,
          status:           order.status,
          items:            order.items,
          subtotal:         order.subtotal,
          shipping:         order.shipping,
          coupon_saving:    order.couponSaving,
          coupon_code:      order.couponCode || null,
          total:            order.total,
          payment_method:   order.paymentMethod,
          delivery_address: order.deliveryAddress,
          delivery_city:    order.deliveryCity,
          delivery_county:  order.deliveryCounty,
          customer_name:    order.customerName,
          customer_phone:   order.customerPhone,
          customer_email:   order.email || '',
          notes:            order.notes || '',
          status_history:   [],
        }])
        if (error) console.error('Eroare salvare comandă Supabase:', error.message)
        // Păstrează și în store local (pentru TrackOrderPage / AccountPage)
        set(s => ({ orders: [...s.orders, order] }))
      },

      getUserOrders: (userId) => {
        return get().orders.filter(o => o.userId === userId)
      },

      updateOrderStatus: async (orderNumber, newStatus, extraData = {}) => {
        const order = get().orders.find(o => o.orderNumber === orderNumber)
        const statusHistory = [
          ...(order?.statusHistory || [{ status: order?.status || 'Plasată', date: order?.date }]),
          { status: newStatus, date: new Date().toISOString() },
        ]
        const supabaseUpdate = {
          status:         newStatus,
          status_history: statusHistory,
          ...(newStatus === 'Expediată' ? { awb: extraData.awb, courier: extraData.courier } : {}),
        }
        // Actualizează Supabase
        const { error } = await supabase
          .from('orders')
          .update(supabaseUpdate)
          .eq('order_number', orderNumber)
        if (error) console.error('Eroare update status:', error.message)
        // Actualizează store local
        set(s => ({
          orders: s.orders.map(o =>
            o.orderNumber === orderNumber
              ? { ...o, ...supabaseUpdate, statusHistory }
              : o
          ),
        }))
      },

      // ── ADRESE ──────────────────────────────────────────────────────────────
      getSavedAddresses: (userId) => {
        return get().users.find(u => u.id === userId)?.savedAddresses || []
      },

      saveAddress: (userId, address) => {
        const newAddr = {
          id: 'addr_' + Date.now(),
          ...address,
          createdAt: new Date().toISOString(),
        }

        set(s => ({
          users: s.users.map(u =>
            u.id === userId
              ? { ...u, savedAddresses: [...(u.savedAddresses || []), newAddr] }
              : u
          )
        }))

        return newAddr
      },

      deleteAddress: (userId, addressId) => {
        set(s => ({
          users: s.users.map(u =>
            u.id === userId
              ? {
                  ...u,
                  savedAddresses: (u.savedAddresses || []).filter(a => a.id !== addressId)
                }
              : u
          )
        }))
      },

      setDefaultAddress: (userId, addressId) => {
        set(s => ({
          users: s.users.map(u =>
            u.id === userId
              ? {
                  ...u,
                  savedAddresses: (u.savedAddresses || []).map(a => ({
                    ...a,
                    isDefault: a.id === addressId,
                  }))
                }
              : u
          )
        }))
      },

      // ── RESET PAROLĂ + EMAIL 🔥 ─────────────────────────────────────────────
      requestPasswordReset: (email) => {
        const user = get().users.find(
          u => u.email.toLowerCase() === email.toLowerCase()
        )

        if (!user) return { success: true }

        const token = 'rst_' + Date.now() + '_' + Math.random().toString(36).slice(2)
        const expiresAt = Date.now() + 1000 * 60 * 30

        const filteredTokens = get().resetTokens.filter(t => t.userId !== user.id)

        set({
          resetTokens: [
            ...filteredTokens,
            { token, userId: user.id, email: user.email, expiresAt, used: false }
          ]
        })

        // 🔥 TRIMITERE EMAIL REAL
        sendResetEmail(user.email, token)
          .then(res => console.log('📧 Email trimis:', res))
          .catch(err => console.error('❌ Email error:', err))

        return {
          success: true,
          devToken: import.meta.env.DEV ? token : null
        }
      },

      validateResetToken: (token) => {
        const tokenData = get().resetTokens.find(t => t.token === token)

        if (!tokenData) return { valid: false, error: 'Token invalid.' }
        if (tokenData.used) return { valid: false, error: 'Deja utilizat.' }
        if (Date.now() > tokenData.expiresAt) return { valid: false, error: 'Expirat.' }

        return {
          valid: true,
          email: tokenData.email,
          userId: tokenData.userId
        }
      },

      resetPassword: (token, newPassword) => {
        const validation = get().validateResetToken(token)
        if (!validation.valid) return { success: false, error: validation.error }

        const { userId } = validation

        set(s => ({
          users: s.users.map(u =>
            u.id === userId ? { ...u, password: newPassword } : u
          ),
          resetTokens: s.resetTokens.map(t =>
            t.token === token ? { ...t, used: true } : t
          )
        }))

        return { success: true }
      },

      // ── RECENZII ────────────────────────────────────────────────────────────
      getReviews: (productId) => {
        return get().reviews.filter(r => r.productId === productId)
      },

      addReview: (productId, userId, userName, rating, text) => {
        const existing = get().reviews.find(
          r => r.productId === productId && r.userId === userId
        )

        if (existing) return { success: false }

        const review = {
          id: 'rev_' + Date.now(),
          productId,
          userId,
          userName,
          rating,
          text,
          date: new Date().toISOString(),
        }

        set(s => ({ reviews: [...s.reviews, review] }))
        return { success: true }
      },

      deleteReview: (reviewId, userId) => {
        set(s => ({
          reviews: s.reviews.filter(
            r => !(r.id === reviewId && r.userId === userId)
          )
        }))
      },

      // ── WISHLIST ────────────────────────────────────────────────────────────
      getWishlist: (userId) => {
        return get().wishlists[userId] || []
      },

      toggleWishlist: (userId, product) => {
        const current = get().wishlists[userId] || []
        const exists = current.find(p => p.id === product.id)

        set(s => ({
          wishlists: {
            ...s.wishlists,
            [userId]: exists
              ? current.filter(p => p.id !== product.id)
              : [...current, { ...product, savedAt: new Date().toISOString() }]
          }
        }))

        return !exists
      },

      isInWishlist: (userId, productId) => {
        return !!(get().wishlists[userId] || []).find(p => p.id === productId)
      },

    }),
    { name: 'vinyl-auth' }
  )
)