import { Request, Response } from 'express';
import * as orderService from './order.service';
import type { CreateOrderBody } from './order.types';

function handleError(res: Response, err: unknown): void {
  const e       = err as any;
  const status  = e.statusCode ?? 500;
  const message = e.message   ?? 'Internal server error';
  if (status >= 500) console.error('[Order]', e);
  res.status(status).json({ success: false, data: null, message });
}

export async function createOrder(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, data: null, message: 'Authentication required' });
    return;
  }
  try {
    const body  = req.body as CreateOrderBody;
    const order = await orderService.createOrder(req.user.id, body);
    console.log(`[Order] created id=${order.id} userId=${order.userId} total=${order.totalAmount}`);
    res.status(201).json({ success: true, message: 'Order placed successfully', data: order });
  } catch (err: any) {
    const status  = err?.statusCode ?? 500;
    const message = err?.message   ?? 'Failed to create order';
    if (status === 500) console.error('[Order] unexpected error:', err);
    res.status(status).json({ success: false, data: null, message });
  }
}

export async function getMyOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await orderService.getMyOrders(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function getMyOrderById(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parseInt(req.params.id, 10);
    const data    = await orderService.getMyOrderById(req.user!.id, orderId);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function trackOrder(req: Request, res: Response): Promise<void> {
  try {
    const orderId = parseInt(req.params.id, 10);
    const data    = await orderService.getOrderTracking(req.user!.id, orderId);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}
