import type { OrderItemInput } from '../orders/order.types';

export interface CreatePaymentOrderBody {
  amountInPaise: number;
}

export interface VerifyPaymentBody {
  razorpay_order_id:   string;
  razorpay_payment_id: string;
  razorpay_signature:  string;
  items:               OrderItemInput[];
  totalAmount:         number;
  addressId:           number;
}
