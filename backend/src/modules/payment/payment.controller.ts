import { Request, Response } from 'express';
import * as paymentService from './payment.service';
import * as orderService   from '../orders/order.service';
import type { CreatePaymentOrderBody, VerifyPaymentBody } from './payment.types';

export async function createPaymentOrder(req: Request, res: Response): Promise<void> {
  try {
    const { amountInPaise } = req.body as CreatePaymentOrderBody;
    const result = await paymentService.createPaymentOrder(amountInPaise);
    res.json({ success: true, message: 'Payment order created', data: result });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Failed to create payment order';
    if (status === 500) console.error('[Payment] createOrder error:', err);
    res.status(status).json({ success: false, data: null, message });
  }
}

export async function verifyPayment(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, data: null, message: 'Authentication required' });
    return;
  }
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      items,
      totalAmount,
      addressId,
    } = req.body as VerifyPaymentBody;

    const isValid = paymentService.verifySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );
    if (!isValid) {
      res.status(400).json({ success: false, data: null, message: 'Payment verification failed. Signature mismatch.' });
      return;
    }

    const order = await orderService.createOrder(req.user.id, { items, totalAmount, addressId });
    console.log(`[Payment] verified paymentId=${razorpay_payment_id} → orderId=${order.id}`);

    res.json({ success: true, message: 'Payment verified', data: { orderId: order.id } });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Payment verification failed';
    if (status === 500) console.error('[Payment] verify error:', err);
    res.status(status).json({ success: false, data: null, message });
  }
}
