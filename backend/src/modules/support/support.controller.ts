import { Request, Response } from 'express';
import * as supportService from './support.service';
import type { CreateTicketBody, AddReplyBody } from './support.types';

function handleError(res: Response, err: unknown): void {
  const e       = err as any;
  const status  = e.statusCode ?? 500;
  const message = e.message   ?? 'Internal server error';
  if (status >= 500) console.error('[Support]', e);
  res.status(status).json({ success: false, data: null, message });
}

export async function createTicket(req: Request, res: Response): Promise<void> {
  try {
    const data = await supportService.createTicket(req.user!.id, req.body as CreateTicketBody);
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function getMyTickets(req: Request, res: Response): Promise<void> {
  try {
    const data = await supportService.getMyTickets(req.user!.id);
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function getTicketById(req: Request, res: Response): Promise<void> {
  try {
    const data = await supportService.getTicketById(
      req.user!.id,
      parseInt(req.params.id, 10),
    );
    res.json({ success: true, data });
  } catch (err) { handleError(res, err); }
}

export async function addReply(req: Request, res: Response): Promise<void> {
  try {
    const { message } = req.body as AddReplyBody;
    const data = await supportService.addReply(
      req.user!.id,
      parseInt(req.params.id, 10),
      message,
    );
    res.status(201).json({ success: true, data });
  } catch (err) { handleError(res, err); }
}
