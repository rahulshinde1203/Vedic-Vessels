import { Request, Response } from 'express';
import * as productService from './product.service';
import type { ApiResponse, ProductWithCategory } from './product.types';

export async function getProducts(_req: Request, res: Response): Promise<void> {
  try {
    const products = await productService.getAllProducts();
    const response: ApiResponse<ProductWithCategory[]> = {
      success: true,
      data: products,
      message: 'Products fetched successfully',
    };
    res.json(response);
  } catch {
    res.status(500).json({ success: false, data: null, message: 'Failed to fetch products' });
  }
}

export async function getProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ success: false, data: null, message: 'Invalid product ID' });
      return;
    }

    const product = await productService.getProductById(id);
    const response: ApiResponse<ProductWithCategory> = {
      success: true,
      data: product,
      message: 'Product fetched successfully',
    };
    res.json(response);
  } catch (err: any) {
    const status = err?.statusCode === 404 ? 404 : 500;
    const message = status === 404 ? 'Product not found' : 'Failed to fetch product';
    res.status(status).json({ success: false, data: null, message });
  }
}
