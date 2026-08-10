import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product) => {
        const exists = get().items.find((i) => i.id === product.id);
        if (exists) {
          // Nu depăși stocul disponibil
          if (exists.quantity >= product.stock) return;
          set((state) => ({
            items: state.items.map((i) =>
              i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          }));
        } else {
          set((state) => ({
            items: [...state.items, { ...product, quantity: 1 }],
          }));
        }
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        // Găsește produsul și limitează la stocul disponibil
        const item = get().items.find((i) => i.id === id);
        const clampedQty = item ? Math.min(quantity, item.stock) : quantity;
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: clampedQty } : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      getTotal: () =>
        get().items.reduce((sum, i) => {
          const price = i.discount > 0 ? Math.round(i.price * (1 - i.discount / 100)) : i.price;
          return sum + price * i.quantity;
        }, 0),

      getCount: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'vinyl-cart' }
  )
);