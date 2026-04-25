export interface CreateTicketBody {
  subject:  string;
  message:  string;
  orderId?: number | string;
}

export interface AddReplyBody {
  message: string;
}
