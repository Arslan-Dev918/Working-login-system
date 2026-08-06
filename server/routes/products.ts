import { NextFunction, Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { executeQuery } from '../db';
import { verifyToken, AuthRequest } from '../middleware/authMiddleware';

const router = Router();
const uploadDir = path.join(process.cwd(), 'uploads', 'products');
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const PRODUCT_STATUSES = new Set(['Available', 'Out of Stock', 'Hidden']);
const SORT_OPTIONS = new Map([
  ['newest', 'created_at DESC'],
  ['oldest', 'created_at ASC'],
  ['price_low_high', 'price ASC'],
  ['price_high_low', 'price DESC'],
  ['alphabetical', 'name ASC']
]);

fs.mkdirSync(uploadDir, { recursive: true });

export async function ensureProductsTable() {
  await executeQuery(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(120) NOT NULL,
      brand VARCHAR(120) NOT NULL,
      platform VARCHAR(80) NOT NULL,
      genre VARCHAR(80) NOT NULL,
      \`condition\` VARCHAR(80) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      discount_price DECIMAL(10,2) NULL,
      stock INT NOT NULL DEFAULT 0,
      status ENUM('Available', 'Out of Stock', 'Hidden') NOT NULL DEFAULT 'Available',
      description TEXT NOT NULL,
      image VARCHAR(500) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_products_user_id (user_id),
      INDEX idx_products_search (name, category, brand),
      CONSTRAINT fk_products_user_id FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

interface ProductRow extends RowDataPacket {
  id: number;
  user_id: number;
  name: string;
  category: string;
  brand: string;
  platform: string;
  genre: string;
  condition: string;
  price: number;
  discount_price: number | null;
  stock: number;
  status: string;
  description: string;
  image: string | null;
  created_at: string;
  updated_at: string;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!IMAGE_EXTENSIONS.has(ext)) {
      cb(new Error('Only jpg, jpeg, png, and webp images are allowed.'));
      return;
    }
    cb(null, true);
  }
});

function uploadProductImage(req: AuthRequest, res: Response, next: NextFunction) {
  upload.single('image')(req, res, (error) => {
    if (error) {
      const message = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE'
        ? 'Product image must be 5MB or smaller.'
        : error.message || 'Product image upload failed.';
      res.status(400).json({ success: false, message });
      return;
    }
    next();
  });
}

function deleteImage(imagePath?: string | null) {
  if (!imagePath) return;
  const filename = path.basename(imagePath);
  const target = path.join(uploadDir, filename);
  if (target.startsWith(uploadDir) && fs.existsSync(target)) {
    fs.unlinkSync(target);
  }
}

function toProductResponse(product: ProductRow) {
  return {
    ...product,
    price: Number(product.price),
    discount_price: product.discount_price === null ? null : Number(product.discount_price),
    stock: Number(product.stock)
  };
}

function parsePositiveNumber(value: unknown, field: string, required = true): number | null {
  if ((value === undefined || value === null || value === '') && !required) return null;
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue) || numberValue < 0) {
    throw new Error(`${field} must be a valid positive number.`);
  }
  return numberValue;
}

function parseProductBody(body: Record<string, any>, partial = false) {
  const requiredFields = ['name', 'category', 'brand', 'condition', 'platform', 'genre', 'price', 'stock', 'status', 'description'];
  if (!partial) {
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null || String(body[field]).trim() === '') {
        throw new Error(`${field} is required.`);
      }
    }
  }

  const status = body.status ? String(body.status).trim() : undefined;
  if (status && !PRODUCT_STATUSES.has(status)) {
    throw new Error('Invalid product status.');
  }

  const price = body.price !== undefined ? parsePositiveNumber(body.price, 'Price') : undefined;
  const discountPrice = body.discount_price !== undefined
    ? parsePositiveNumber(body.discount_price, 'Discount price', false)
    : undefined;
  const stock = body.stock !== undefined ? parsePositiveNumber(body.stock, 'Stock quantity') : undefined;

  if (stock !== undefined && stock !== null && !Number.isInteger(stock)) {
    throw new Error('Stock quantity must be a whole number.');
  }

  if (price !== undefined && discountPrice !== undefined && discountPrice !== null && price !== null && discountPrice > price) {
    throw new Error('Discount price cannot be greater than price.');
  }

  return {
    name: body.name?.trim(),
    category: body.category?.trim(),
    brand: body.brand?.trim(),
    condition: body.condition?.trim(),
    platform: body.platform?.trim(),
    genre: body.genre?.trim(),
    price,
    discount_price: discountPrice,
    stock,
    status,
    description: body.description?.trim()
  };
}

function buildListQuery(req: AuthRequest, baseWhere: string[] = [], baseParams: any[] = []) {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = 10;
  const offset = (page - 1) * limit;
  const sortKey = String(req.query.sort || 'newest');
  const sortSql = SORT_OPTIONS.get(sortKey) || SORT_OPTIONS.get('newest');
  const where = ['user_id = ?', ...baseWhere];
  const params = [req.user!.id, ...baseParams];

  return {
    page,
    limit,
    offset,
    sortSql,
    whereSql: where.join(' AND '),
    params
  };
}

async function sendProductList(req: AuthRequest, res: Response, where: string[] = [], params: any[] = []) {
  const query = buildListQuery(req, where, params);
  const products = await executeQuery<ProductRow[]>(
    `SELECT * FROM products WHERE ${query.whereSql} ORDER BY ${query.sortSql} LIMIT ? OFFSET ?`,
    [...query.params, query.limit, query.offset]
  );
  const totalRows = await executeQuery<RowDataPacket[]>(
    `SELECT COUNT(*) AS total FROM products WHERE ${query.whereSql}`,
    query.params
  );
  const total = Number(totalRows[0]?.total || 0);

  res.json({
    success: true,
    products: products.map(toProductResponse),
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.ceil(total / query.limit)
    }
  });
}

router.use('/products', verifyToken);

router.get('/products/search', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const term = String(req.query.q || '').trim();
    if (!term) {
      await sendProductList(req, res);
      return;
    }
    const likeTerm = `%${term}%`;
    await sendProductList(req, res, ['(name LIKE ? OR category LIKE ? OR brand LIKE ?)'], [likeTerm, likeTerm, likeTerm]);
  } catch (error) {
    console.error('Product search error:', error);
    res.status(500).json({ success: false, message: 'Product search failed.' });
  }
});

router.get('/products/filter', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const where: string[] = [];
    const params: any[] = [];
    const filters = ['category', 'platform', 'condition', 'status'];

    for (const filter of filters) {
      const value = String(req.query[filter] || '').trim();
      if (value) {
        where.push(`${filter} = ?`);
        params.push(value);
      }
    }

    await sendProductList(req, res, where, params);
  } catch (error) {
    console.error('Product filter error:', error);
    res.status(500).json({ success: false, message: 'Product filtering failed.' });
  }
});

router.get('/products/stats', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const rows = await executeQuery<RowDataPacket[]>(
      `SELECT
        COUNT(*) AS totalProducts,
        SUM(CASE WHEN status = 'Available' THEN 1 ELSE 0 END) AS availableProducts,
        SUM(CASE WHEN status = 'Out of Stock' THEN 1 ELSE 0 END) AS outOfStockProducts,
        SUM(CASE WHEN status = 'Hidden' THEN 1 ELSE 0 END) AS hiddenProducts
       FROM products
       WHERE user_id = ?`,
      [req.user!.id]
    );

    res.json({
      success: true,
      stats: {
        totalProducts: Number(rows[0]?.totalProducts || 0),
        availableProducts: Number(rows[0]?.availableProducts || 0),
        outOfStockProducts: Number(rows[0]?.outOfStockProducts || 0),
        hiddenProducts: Number(rows[0]?.hiddenProducts || 0)
      }
    });
  } catch (error) {
    console.error('Product stats error:', error);
    res.status(500).json({ success: false, message: 'Product stats fetch failed.' });
  }
});

router.get('/products', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await sendProductList(req, res);
  } catch (error) {
    console.error('Product list error:', error);
    res.status(500).json({ success: false, message: 'Products fetch failed.' });
  }
});

router.get('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await executeQuery<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? AND user_id = ? LIMIT 1',
      [req.params.id, req.user!.id]
    );
    if (!products.length) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }
    res.json({ success: true, product: toProductResponse(products[0]) });
  } catch (error) {
    console.error('Product detail error:', error);
    res.status(500).json({ success: false, message: 'Product fetch failed.' });
  }
});

router.post('/products', uploadProductImage, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = parseProductBody(req.body);
    const imagePath = req.file ? `/uploads/products/${req.file.filename}` : null;

    if (!imagePath) {
      res.status(400).json({ success: false, message: 'Product image is required.' });
      return;
    }

    const result = await executeQuery<ResultSetHeader>(
      `INSERT INTO products
        (user_id, name, category, brand, platform, genre, \`condition\`, price, discount_price, stock, status, description, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user!.id,
        data.name,
        data.category,
        data.brand,
        data.platform,
        data.genre,
        data.condition,
        data.price,
        data.discount_price,
        data.stock,
        data.status,
        data.description,
        imagePath
      ]
    );

    res.status(201).json({ success: true, message: 'Product created successfully.', productId: result.insertId });
  } catch (error: any) {
    deleteImage(req.file ? `/uploads/products/${req.file.filename}` : null);
    console.error('Product create error:', error);
    res.status(400).json({ success: false, message: error.message || 'Product create failed.' });
  }
});

router.put('/products/:id', uploadProductImage, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await executeQuery<ProductRow[]>(
      'SELECT * FROM products WHERE id = ? AND user_id = ? LIMIT 1',
      [req.params.id, req.user!.id]
    );
    if (!products.length) {
      deleteImage(req.file ? `/uploads/products/${req.file.filename}` : null);
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const existing = products[0];
    const data = parseProductBody(req.body);
    const nextImage = req.file ? `/uploads/products/${req.file.filename}` : existing.image;

    await executeQuery<ResultSetHeader>(
      `UPDATE products SET
        name = ?, category = ?, brand = ?, platform = ?, genre = ?, \`condition\` = ?,
        price = ?, discount_price = ?, stock = ?, status = ?, description = ?, image = ?
       WHERE id = ? AND user_id = ?`,
      [
        data.name,
        data.category,
        data.brand,
        data.platform,
        data.genre,
        data.condition,
        data.price,
        data.discount_price,
        data.stock,
        data.status,
        data.description,
        nextImage,
        req.params.id,
        req.user!.id
      ]
    );

    if (req.file && existing.image) {
      deleteImage(existing.image);
    }

    res.json({ success: true, message: 'Product updated successfully.' });
  } catch (error: any) {
    deleteImage(req.file ? `/uploads/products/${req.file.filename}` : null);
    console.error('Product update error:', error);
    res.status(400).json({ success: false, message: error.message || 'Product update failed.' });
  }
});

router.delete('/products/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await executeQuery<ProductRow[]>(
      'SELECT image FROM products WHERE id = ? AND user_id = ? LIMIT 1',
      [req.params.id, req.user!.id]
    );
    if (!products.length) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    await executeQuery<ResultSetHeader>(
      'DELETE FROM products WHERE id = ? AND user_id = ?',
      [req.params.id, req.user!.id]
    );
    deleteImage(products[0].image);

    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Product delete error:', error);
    res.status(500).json({ success: false, message: 'Product delete failed.' });
  }
});

export default router;
