export interface OrderItemInput {
  productId: number;
  quantity:  number;
  price:     number;
}

export interface CreateOrderBody {
  items:       OrderItemInput[];
  totalAmount: number;
  addressId:   number;
}

export interface ApiResponse<T> {
  success: boolean;
  data:    T | null;
  message: string;
}
