const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'TechMart API',
    version: '1.0.0',
    description:
      'RESTful API for the TechMart demo e-commerce store. Session-based auth via cookies.',
  },
  servers: [{ url: 'http://localhost:3000', description: 'Local dev server' }],
  tags: [
    { name: 'Products', description: 'Browse the product catalogue' },
    { name: 'Cart', description: 'Manage the shopping cart' },
    { name: 'Auth', description: 'Register, login & logout' },
    { name: 'Checkout', description: 'Place an order' },
    { name: 'Health', description: 'Service health check' },
  ],
  components: {
    schemas: {
      Product: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Wireless Headphones' },
          price: { type: 'number', format: 'float', example: 79.99 },
          category: { type: 'string', example: 'electronics' },
          image: { type: 'string', example: 'headphones.svg' },
          stock: { type: 'integer', example: 15 },
        },
      },
      CartItem: {
        type: 'object',
        properties: {
          productId: { type: 'integer', example: 1 },
          quantity: { type: 'integer', example: 2 },
          product: { $ref: '#/components/schemas/Product' },
        },
      },
      Cart: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
          total: { type: 'string', example: '159.98' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          email: { type: 'string', example: 'demo@techmart.com' },
          name: { type: 'string', example: 'Demo User' },
        },
      },
      ShippingInfo: {
        type: 'object',
        required: ['address', 'city', 'zip'],
        properties: {
          firstName: { type: 'string', example: 'Jane' },
          lastName: { type: 'string', example: 'Doe' },
          address: { type: 'string', example: '123 Main St' },
          address2: { type: 'string', example: 'Apt 4B' },
          city: { type: 'string', example: 'San Francisco' },
          state: { type: 'string', example: 'CA' },
          zip: { type: 'string', example: '94105' },
          phone: { type: 'string', example: '(555) 123-4567' },
        },
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1711900000000 },
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/CartItem' },
          },
          total: { type: 'string', example: '159.98' },
          shipping: { $ref: '#/components/schemas/ShippingInfo' },
          date: { type: 'string', format: 'date-time' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Something went wrong' },
        },
      },
    },
  },
  paths: {
    // ── Products ────────────────────────────────────────────────────────────
    '/api/products': {
      get: {
        tags: ['Products'],
        summary: 'List products',
        description: 'Returns all products, optionally filtered.',
        parameters: [
          {
            name: 'category',
            in: 'query',
            schema: { type: 'string', enum: ['electronics', 'accessories'] },
            description: 'Filter by category',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string' },
            description: 'Case-insensitive name search',
          },
          {
            name: 'minPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Minimum price filter',
          },
          {
            name: 'maxPrice',
            in: 'query',
            schema: { type: 'number' },
            description: 'Maximum price filter',
          },
        ],
        responses: {
          200: {
            description: 'Array of products',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { $ref: '#/components/schemas/Product' },
                },
              },
            },
          },
        },
      },
    },
    '/api/products/{id}': {
      get: {
        tags: ['Products'],
        summary: 'Get a single product',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'integer' },
          },
        ],
        responses: {
          200: {
            description: 'Product object',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Product' },
              },
            },
          },
          404: {
            description: 'Product not found',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Error' },
              },
            },
          },
        },
      },
    },

    // ── Cart ─────────────────────────────────────────────────────────────────
    '/api/cart': {
      get: {
        tags: ['Cart'],
        summary: 'Get cart contents',
        description: 'Returns the current session cart with product details and total.',
        responses: {
          200: {
            description: 'Cart object',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Cart' },
              },
            },
          },
        },
      },
      post: {
        tags: ['Cart'],
        summary: 'Add item to cart',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['productId'],
                properties: {
                  productId: { type: 'integer', example: 1 },
                  quantity: { type: 'integer', default: 1, example: 1 },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Item added',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    cart: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
                  },
                },
              },
            },
          },
          400: { description: 'Insufficient stock', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Clear the entire cart',
        responses: {
          200: {
            description: 'Cart cleared',
            content: {
              'application/json': {
                schema: { type: 'object', properties: { message: { type: 'string' } } },
              },
            },
          },
        },
      },
    },
    '/api/cart/{productId}': {
      put: {
        tags: ['Cart'],
        summary: 'Update item quantity',
        description: 'Set quantity to 0 or below to remove the item.',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity'],
                properties: { quantity: { type: 'integer', example: 3 } },
              },
            },
          },
        },
        responses: {
          200: { description: 'Cart updated' },
          404: { description: 'Item not in cart', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
      delete: {
        tags: ['Cart'],
        summary: 'Remove item from cart',
        parameters: [
          { name: 'productId', in: 'path', required: true, schema: { type: 'integer' } },
        ],
        responses: {
          200: { description: 'Item removed' },
        },
      },
    },

    // ── Auth ─────────────────────────────────────────────────────────────────
    '/api/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['name', 'email', 'password'],
                properties: {
                  name: { type: 'string', example: 'Jane Doe' },
                  email: { type: 'string', example: 'jane@example.com' },
                  password: { type: 'string', example: 'secret123' },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Registration successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Validation error or email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email & password',
        description: 'Demo credentials — email: `demo@techmart.com` / password: `demo123`',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'demo@techmart.com' },
                  password: { type: 'string', example: 'demo123' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/User' },
                  },
                },
              },
            },
          },
          400: { description: 'Missing fields', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
          401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },
    '/api/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout current user',
        responses: {
          200: { description: 'Logged out' },
        },
      },
    },
    '/api/user': {
      get: {
        tags: ['Auth'],
        summary: 'Get the currently logged-in user',
        responses: {
          200: {
            description: 'Current user',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' },
              },
            },
          },
          401: { description: 'Not logged in', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Checkout ─────────────────────────────────────────────────────────────
    '/api/checkout': {
      post: {
        tags: ['Checkout'],
        summary: 'Place an order',
        description: 'Validates the cart, reduces stock, clears the cart, and returns an order object.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['shipping'],
                properties: {
                  shipping: { $ref: '#/components/schemas/ShippingInfo' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Order placed',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    order: { $ref: '#/components/schemas/Order' },
                  },
                },
              },
            },
          },
          400: { description: 'Empty cart or missing shipping info', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── Health ────────────────────────────────────────────────────────────────
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    timestamp: { type: 'string', format: 'date-time' },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

module.exports = swaggerSpec;
