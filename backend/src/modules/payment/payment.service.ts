import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../../common/config/env';

function makeError(message: string, statusCode: number): Error {
  const err = new Error(message);
  (err as any).statusCode = statusCode;
  return err;
}

function getRazorpayInstance(): Razorpay {
  if (!config.razorpayKeyId || !config.razorpayKeySecret) {
    throw makeError('Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env', 500);
  }
  return new Razorpay({
    key_id:     config.razorpayKeyId,
    key_secret: config.razorpayKeySecret,
  });
}

export async function createPaymentOrder(amountInPaise: number) {
  if (!Number.isInteger(amountInPaise) || amountInPaise <= 0) {
    throw makeError('Invalid amount', 400);
  }

  const razorpay = getRazorpayInstance();
  const order = await razorpay.orders.create({
    amount:   amountInPaise,
    currency: 'INR',
    receipt:  `rcpt_${Date.now()}`,
  });

  return {
    orderId: order.id,
    amount:  Number(order.amount),
    keyId:   config.razorpayKeyId,
  };
}

export function verifySignature(
  razorpayOrderId:   string,
  razorpayPaymentId: string,
  signature:         string,
): boolean {
  if (!config.razorpayKeySecret) return false;
  const body     = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expected = crypto
    .createHmac('sha256', config.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}
