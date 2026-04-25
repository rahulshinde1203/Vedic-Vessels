import { Request, Response } from 'express';
import * as adminService from './admin.service';
import type {
  UpdateProductBody,
  CreateCategoryBody,
  UpdateOrderStatusBody,
  UpdateTicketStatusBody,
  AddTicketReplyBody,
} from './admin.types';

function handleError(res: Response, err: unknown): void {
  const e      = err as any;
  const status  = e.statusCode ?? 500;
  const message = e.message   ?? 'Internal server error';
  if (status >= 500) console.error('[Admin]', e);
  res.status(status).json({ success: false, data: null, message });
}

// ── Dashboard ──────────────────────────────────────────────────────────────────

export async function getStats(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getStats();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

// ── Products ───────────────────────────────────────────────────────────────────

export async function getProducts(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminProducts();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const files = (req.files ?? []) as Express.Multer.File[];
    const data  = await adminService.createProduct(req.body, files);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const id    = parseInt(req.params.id, 10);
    const files = (req.files ?? []) as Express.Multer.File[];
    const data  = await adminService.updateProduct(id, req.body as UpdateProductBody, files);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    await adminService.softDeleteProduct(parseInt(req.params.id, 10));
    res.json({ success: true, data: null, message: 'Product deactivated' });
  } catch (err) { handleError(res, err); }
}

// ── Categories ─────────────────────────────────────────────────────────────────

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminCategories();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function createCategory(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.createCategory(req.body as CreateCategoryBody);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

// ── Orders ─────────────────────────────────────────────────────────────────────

export async function getOrders(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminOrders();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function getOrderById(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminOrderById(parseInt(req.params.id, 10));
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function updateOrderStatus(req: Request, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, trackingId, courierName } = req.body as UpdateOrderStatusBody;
    const data = await adminService.updateOrderStatus(id, status, { trackingId, courierName });
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

// ── Admin Support ──────────────────────────────────────────────────────────────

export async function getAdminTickets(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminSupportTickets();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function getAdminTicketById(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminTicketById(parseInt(req.params.id, 10));
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function updateTicketStatus(req: Request, res: Response): Promise<void> {
  try {
    const id       = parseInt(req.params.id, 10);
    const { status } = req.body as UpdateTicketStatusBody;
    const data     = await adminService.updateTicketStatus(id, status);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function addAdminTicketReply(req: Request, res: Response): Promise<void> {
  try {
    const id      = parseInt(req.params.id, 10);
    const { message } = req.body as AddTicketReplyBody;
    const data    = await adminService.addAdminReply(id, message);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

// ── Users ──────────────────────────────────────────────────────────────────────

export async function getUsers(req: Request, res: Response): Promise<void> {
  try {
    const data = await adminService.getAdminUsers();
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}
