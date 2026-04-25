export interface CreateProductBody {
  name:         string;
  description?: string;
  mrp:          number | string;
  price:        number | string;
  stock:        number | string;
  categoryId:   number | string;
}

export interface UpdateProductBody {
  name?:         string;
  description?:  string;
  mrp?:          number | string;
  price?:        number | string;
  stock?:        number | string;
  categoryId?:   number | string;
  isActive?:     boolean | string;
}

export interface CreateCategoryBody {
  name: string;
}

export type AdminOrderStatus = 'PENDING' | 'SHIPPED' | 'DELIVERED';

export interface UpdateOrderStatusBody {
  status:       AdminOrderStatus;
  trackingId?:  string;
  courierName?: string;
}

export type AdminTicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export interface UpdateTicketStatusBody {
  status: AdminTicketStatus;
}

export interface AddTicketReplyBody {
  message: string;
}
