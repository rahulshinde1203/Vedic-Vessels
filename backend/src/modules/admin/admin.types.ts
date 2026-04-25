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
  status: AdminOrderStatus;
}
