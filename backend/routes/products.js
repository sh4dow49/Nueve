const express = require('express');
const { query } = require('express-validator');
const db = require('../config/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isString().withMessage('Category must be a string'),
  query('minPrice').optional().isFloat({ min: 0 }).withMessage('Min price must be non-negative'),
  query('maxPrice').optional().isFloat({ min: 0 }).withMessage('Max price must be non-negative'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sortBy').optional().isIn(['price_asc', 'price_desc', 'name_asc', 'name_desc', 'rating_desc', 'newest']).withMessage('Invalid sort option')
], optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest'
    } = req.query;

    const offset = (page - 1) * limit;
    let whereConditions = ['p.is_active = TRUE'];
    let queryParams = [];

    // Category filter
    if (category && category !== 'all') {
      whereConditions.push('c.slug = ?');
      queryParams.push(category);
    }

    // Price range filter
    if (minPrice !== undefined) {
      whereConditions.push('p.price >= ?');
      queryParams.push(parseFloat(minPrice));
    }
    if (maxPrice !== undefined) {
      whereConditions.push('p.price <= ?');
      queryParams.push(parseFloat(maxPrice));
    }

    // Search filter
    if (search) {
      whereConditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchTerm = `%${search}%`;
      queryParams.push(searchTerm, searchTerm);
    }

    // Sort options
    let orderBy = 'p.created_at DESC';
    switch (sortBy) {
      case 'price_asc':
        orderBy = 'p.price ASC';
        break;
      case 'price_desc':
        orderBy = 'p.price DESC';
        break;
      case 'name_asc':
        orderBy = 'p.name ASC';
        break;
      case 'name_desc':
        orderBy = 'p.name DESC';
        break;
      case 'rating_desc':
        orderBy = 'p.rating DESC';
        break;
      case 'newest':
      default:
        orderBy = 'p.created_at DESC';
        break;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get products
    const productsQuery = `
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.sizes,
        p.colors,
        p.images,
        p.rating,
        p.review_count,
        p.is_on_sale,
        p.stock_quantity,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
    `;

    const [products] = await db.execute(productsQuery, [...queryParams, parseInt(limit), offset]);

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const [countResult] = await db.execute(countQuery, queryParams);
    const total = countResult[0].total;

    // Parse JSON fields
    const formattedProducts = products.map(product => ({
      ...product,
      sizes: JSON.parse(product.sizes || '[]'),
      colors: JSON.parse(product.colors || '[]'),
      images: JSON.parse(product.images || '[]'),
      category: product.category_slug || 'uncategorized'
    }));

    res.json({
      products: formattedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [products] = await db.execute(`
      SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.original_price,
        p.sizes,
        p.colors,
        p.images,
        p.rating,
        p.review_count,
        p.is_on_sale,
        p.stock_quantity,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.is_active = TRUE
    `, [id]);

    if (products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const product = {
      ...products[0],
      sizes: JSON.parse(products[0].sizes || '[]'),
      colors: JSON.parse(products[0].colors || '[]'),
      images: JSON.parse(products[0].images || '[]'),
      category: products[0].category_slug || 'uncategorized'
    };

    res.json({ product });

  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Get categories
router.get('/categories/all', async (req, res) => {
  try {
    const [categories] = await db.execute(`
      SELECT id, name, slug, description
      FROM categories
      WHERE is_active = TRUE
      ORDER BY name ASC
    `);

    res.json({ categories });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

module.exports = router;