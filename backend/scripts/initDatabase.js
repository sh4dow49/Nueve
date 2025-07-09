const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  let connection;
  
  try {
    // Connect to MySQL server (without database)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });

    console.log('Connected to MySQL server');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'nueve_ecommerce';
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created or already exists`);

    // Use the database
    await connection.execute(`USE ${dbName}`);

    // Create tables
    const createTables = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        phone VARCHAR(15) UNIQUE NOT NULL,
        name VARCHAR(100),
        birth_date DATE,
        gender ENUM('male', 'female', 'other'),
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_created_at (created_at)
      )`,

      // OTP table for phone verification
      `CREATE TABLE IF NOT EXISTS otp_verifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        phone VARCHAR(15) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_phone_otp (phone, otp),
        INDEX idx_expires_at (expires_at)
      )`,

      // Categories table
      `CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_slug (slug),
        INDEX idx_active (is_active)
      )`,

      // Products table
      `CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        name VARCHAR(200) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2) NOT NULL,
        original_price DECIMAL(10, 2),
        category_id VARCHAR(36),
        sizes JSON,
        colors JSON,
        images JSON,
        rating DECIMAL(3, 2) DEFAULT 0.0,
        review_count INT DEFAULT 0,
        is_on_sale BOOLEAN DEFAULT FALSE,
        stock_quantity INT DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_category (category_id),
        INDEX idx_price (price),
        INDEX idx_active (is_active),
        INDEX idx_sale (is_on_sale),
        INDEX idx_created_at (created_at)
      )`,

      // Addresses table
      `CREATE TABLE IF NOT EXISTS addresses (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        phone VARCHAR(15) NOT NULL,
        address_line1 VARCHAR(255) NOT NULL,
        address_line2 VARCHAR(255),
        city VARCHAR(100) NOT NULL,
        state VARCHAR(100) NOT NULL,
        pincode VARCHAR(10) NOT NULL,
        is_default BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_default (is_default)
      )`,

      // Orders table
      `CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        address_id VARCHAR(36) NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        payment_method ENUM('cod', 'online') NOT NULL,
        payment_status ENUM('pending', 'paid', 'failed') DEFAULT 'pending',
        order_status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        delivery_charge DECIMAL(10, 2) DEFAULT 0.00,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
        INDEX idx_user_id (user_id),
        INDEX idx_status (order_status),
        INDEX idx_created_at (created_at)
      )`,

      // Order items table
      `CREATE TABLE IF NOT EXISTS order_items (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        order_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        selected_size VARCHAR(10),
        selected_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
        INDEX idx_order_id (order_id),
        INDEX idx_product_id (product_id)
      )`,

      // Wishlist table
      `CREATE TABLE IF NOT EXISTS wishlist (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product (user_id, product_id),
        INDEX idx_user_id (user_id),
        INDEX idx_product_id (product_id)
      )`,

      // Cart table (optional - for persistent cart)
      `CREATE TABLE IF NOT EXISTS cart (
        id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
        user_id VARCHAR(36) NOT NULL,
        product_id VARCHAR(36) NOT NULL,
        quantity INT NOT NULL,
        selected_size VARCHAR(10),
        selected_color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_product_variant (user_id, product_id, selected_size, selected_color),
        INDEX idx_user_id (user_id),
        INDEX idx_product_id (product_id)
      )`
    ];

    // Execute table creation queries
    for (const query of createTables) {
      await connection.execute(query);
      console.log('Table created successfully');
    }

    // Insert sample categories
    const categories = [
      ['all', 'All Items', 'All available products'],
      ['hoodies', 'Hoodies', 'Comfortable hoodies and sweatshirts'],
      ['tshirts', 'T-Shirts', 'Casual and stylish t-shirts'],
      ['dresses', 'Dresses', 'Beautiful dresses for all occasions'],
      ['jackets', 'Jackets', 'Stylish jackets and outerwear'],
      ['pants', 'Pants', 'Comfortable pants and trousers']
    ];

    for (const [slug, name, description] of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (slug, name, description) VALUES (?, ?, ?)',
        [slug, name, description]
      );
    }

    console.log('Sample categories inserted');

    // Insert sample products
    const sampleProducts = [
      {
        name: 'Dreamy Cloud Hoodie',
        description: 'Float through your day in this ultra-soft hoodie that feels like wearing a cloud. Made from organic cotton with a cozy fleece lining.',
        price: 68.00,
        original_price: 89.00,
        category: 'hoodies',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Sky Blue', 'Mint Green', 'Lavender']),
        images: JSON.stringify([
          'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/7679721/pexels-photo-7679721.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]),
        rating: 4.8,
        review_count: 124,
        is_on_sale: true,
        stock_quantity: 50
      },
      {
        name: 'Sunset Gradient Tee',
        description: 'Capture the magic of golden hour with this vibrant gradient tee. Perfect for adventures and lazy Sunday mornings.',
        price: 32.00,
        category: 'tshirts',
        sizes: JSON.stringify(['XS', 'S', 'M', 'L', 'XL']),
        colors: JSON.stringify(['Sunset Orange', 'Pink Coral', 'Yellow Bliss']),
        images: JSON.stringify([
          'https://images.pexels.com/photos/7679726/pexels-photo-7679726.jpeg?auto=compress&cs=tinysrgb&w=800',
          'https://images.pexels.com/photos/7679727/pexels-photo-7679727.jpeg?auto=compress&cs=tinysrgb&w=800'
        ]),
        rating: 4.6,
        review_count: 89,
        is_on_sale: false,
        stock_quantity: 75
      }
    ];

    for (const product of sampleProducts) {
      // Get category ID
      const [categoryRows] = await connection.execute(
        'SELECT id FROM categories WHERE slug = ?',
        [product.category]
      );
      
      if (categoryRows.length > 0) {
        await connection.execute(`
          INSERT IGNORE INTO products 
          (name, description, price, original_price, category_id, sizes, colors, images, rating, review_count, is_on_sale, stock_quantity)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          product.name,
          product.description,
          product.price,
          product.original_price || null,
          categoryRows[0].id,
          product.sizes,
          product.colors,
          product.images,
          product.rating,
          product.review_count,
          product.is_on_sale,
          product.stock_quantity
        ]);
      }
    }

    console.log('Sample products inserted');
    console.log('Database initialization completed successfully!');

  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run initialization
initDatabase();