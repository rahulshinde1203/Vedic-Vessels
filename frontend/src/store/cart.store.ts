import { create } from 'zustand';

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
    stock: number;
  };
}

interface CartState {
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  getTotalItems: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
  getTotalPrice: () => get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
}));
