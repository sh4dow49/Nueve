# Nueve Fashion E-commerce Backend

A complete Node.js backend for the Nueve Fashion e-commerce application with MySQL database.

## Features

- **Authentication**: Phone number + OTP based authentication
- **User Management**: Profile management with name, birth date, gender
- **Product Management**: Product catalog with categories, filtering, search
- **Address Management**: Multiple delivery addresses per user
- **Order Management**: Complete order lifecycle with status tracking
- **Wishlist**: Save favorite products
- **Cart**: Persistent shopping cart (optional)

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT tokens
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate limiting

## Database Schema

### Tables

1. **users** - User profiles and authentication
2. **otp_verifications** - OTP storage for phone verification
3. **categories** - Product categories
4. **products** - Product catalog
5. **addresses** - User delivery addresses
6. **orders** - Order information
7. **order_items** - Order line items
8. **wishlist** - User wishlist items
9. **cart** - Persistent cart items (optional)

## Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` - MySQL connection details
- `JWT_SECRET` - Secret key for JWT tokens
- `SMS_API_KEY` - SMS service API key (for OTP)

### 3. Database Setup

Make sure MySQL is running, then initialize the database:

```bash
npm run init-db
```

This will:
- Create the database if it doesn't exist
- Create all required tables
- Insert sample categories and products

### 4. Start the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/send-otp` - Send OTP to phone number
- `POST /api/auth/verify-otp` - Verify OTP and login/register
- `POST /api/auth/complete-profile` - Complete user profile after registration
- `GET /api/auth/me` - Get current user info

### Products
- `GET /api/products` - Get products with filtering and pagination
- `GET /api/products/:id` - Get single product
- `GET /api/products/categories/all` - Get all categories

### Addresses
- `GET /api/addresses` - Get user addresses
- `POST /api/addresses` - Add new address
- `PUT /api/addresses/:id` - Update address
- `DELETE /api/addresses/:id` - Delete address
- `PATCH /api/addresses/:id/default` - Set default address

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PATCH /api/orders/:id/cancel` - Cancel order

### Users
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/wishlist` - Get user wishlist
- `POST /api/users/wishlist` - Add to wishlist
- `DELETE /api/users/wishlist/:productId` - Remove from wishlist
- `GET /api/users/cart` - Get user cart (optional)

## Authentication

The API uses JWT tokens for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "error": "Error message",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend domain
- **Helmet**: Security headers
- **Input Validation**: All inputs validated using express-validator
- **SQL Injection Protection**: Using parameterized queries
- **JWT Expiration**: Tokens expire after 7 days

## Database Indexes

The database includes optimized indexes for:
- User phone numbers
- Product categories and prices
- Order status and dates
- Wishlist and cart lookups

## Sample Data

The initialization script includes:
- 6 product categories
- 2 sample products with images
- Proper JSON structure for sizes, colors, and images

## Production Considerations

1. **SMS Integration**: Replace console.log OTP with actual SMS service
2. **Image Storage**: Implement proper image upload and storage
3. **Payment Gateway**: Integrate payment processing for online payments
4. **Logging**: Add proper logging with Winston or similar
5. **Monitoring**: Add health checks and monitoring
6. **Backup**: Set up database backup strategy
7. **SSL**: Use HTTPS in production
8. **Environment**: Use production-grade MySQL configuration

## Testing

You can test the API using tools like Postman or curl. Start with:

1. Send OTP: `POST /api/auth/send-otp`
2. Verify OTP: `POST /api/auth/verify-otp`
3. Get products: `GET /api/products`
4. Add address: `POST /api/addresses`
5. Create order: `POST /api/orders`

## Support

For issues or questions, please check the error logs and ensure:
- MySQL is running and accessible
- Environment variables are properly set
- Database has been initialized
- Required dependencies are installed