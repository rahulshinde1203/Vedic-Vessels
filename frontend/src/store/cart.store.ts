import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateCartId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

// ── Store interface ───────────────────────────────────────────────────────────

interface CartStore {
  cartId: string;
  items: CartItem[];
  addToCart:        (product: Product) => void;
  removeFromCart:   (id: number) => void;
  increaseQty:      (id: number) => void;
  decreaseQty:      (id: number) => void;
  clearCart:        () => void;
  // Called externally when a product's status changes after being carted
  markItemInactive: (id: number) => void;
  updateItemStock:  (id: number, newStock: number) => void;
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cartId: generateCartId(),
      items:  [],

      addToCart: (product) =>
        set((state) => {
          // Inactive or zero-stock products must never enter the cart
          if (!product.isActive || product.stock <= 0) return state;

          const existing = state.items.find((i) => i.id === product.id);

          if (existing) {
            if (existing.quantity >= product.stock) return state; // at cap
            return {
              items: state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                id:           product.id,
                name:         product.name,
                price:        product.price,
                priceInPaise: Math.round(product.price * 100),
                imageUrl:     product.imageUrl,
                stock:        product.stock,
                isActive:     product.isActive,
                quantity:     1,
              },
            ],
          };
        }),

      removeFromCart: (id) =>
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        })),

      increaseQty: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.quantity < i.stock
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        })),

      // Quantity reaching 0 removes the item entirely
      decreaseQty: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;
          if (item.quantity <= 1) {
            return { items: state.items.filter((i) => i.id !== id) };
          }
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity: i.quantity - 1 } : i
            ),
          };
        }),

      // Clears items and issues a fresh cartId for the next order session
      clearCart: () => set({ items: [], cartId: generateCartId() }),

      markItemInactive: (id) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, isActive: false } : i
          ),
        })),

      // Syncs stock snapshot and auto-clamps quantity when stock decreased
      updateItemStock: (id, newStock) =>
        set((state) => ({
          items: state.items.map((i) => {
            if (i.id !== id) return i;
            const quantity = newStock > 0
              ? Math.min(i.quantity, newStock)
              : i.quantity; // keep qty visible so user can see the OOS warning
            return { ...i, stock: newStock, quantity };
          }),
        })),
    }),
    {
      name:    'vedic-vessels-cart',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // Migrate v0 schema (no priceInPaise / isActive / cartId) → v1
      migrate: (persisted: unknown, version: number) => {
        const state = persisted as Record<string, unknown>;
        if (version === 0) {
          const items = (state.items as any[] | undefined) ?? [];
          return {
            ...state,
            cartId: generateCartId(),
            items: items.map((item) => ({
              ...item,
              priceInPaise: item.priceInPaise ?? Math.round((item.price ?? 0) * 100),
              isActive:     item.isActive     ?? true,
            })),
          };
        }
        return state;
      },
    }
  )
);

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectCartTotal = (state: CartStore): number =>
  state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

export const selectCartCount = (state: CartStore): number =>
  state.items.reduce((sum, i) => sum + i.quantity, 0);

/** True only when every item is active, in stock, and within available quantity. */
export const selectIsCartValid = (state: CartStore): boolean =>
  state.items.length > 0 &&
  state.items.every((i) => i.isActive && i.stock > 0 && i.quantity <= i.stock);
