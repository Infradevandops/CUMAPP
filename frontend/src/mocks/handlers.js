/**
 * @fileoverview Mock Service Worker handlers for API mocking
 * Provides comprehensive API mocking for testing backend integration
 */

import { rest } from 'msw';

// Base API URL - adjust this to match your backend API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Authentication endpoints
export const authHandlers = [
  // Login endpoint
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body;

    // Mock validation
    if (!email || !password) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Email and password are required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: 1,
            email: 'test@example.com',
            name: 'Test User',
            role: 'user'
          },
          token: 'mock-jwt-token-12345',
          refreshToken: 'mock-refresh-token-67890'
        })
      );
    }

    if (email === 'admin@example.com' && password === 'admin123') {
      return res(
        ctx.status(200),
        ctx.json({
          user: {
            id: 2,
            email: 'admin@example.com',
            name: 'Admin User',
            role: 'admin'
          },
          token: 'mock-admin-jwt-token-12345',
          refreshToken: 'mock-admin-refresh-token-67890'
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      })
    );
  }),

  // Register endpoint
  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Email, password, and name are required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    // Check if user already exists
    if (email === 'existing@example.com') {
      return res(
        ctx.status(409),
        ctx.json({
          error: 'User already exists',
          code: 'USER_EXISTS'
        })
      );
    }

    return res(
      ctx.status(201),
      ctx.json({
        user: {
          id: 3,
          email,
          name,
          role: 'user'
        },
        token: 'mock-registration-token-12345',
        refreshToken: 'mock-registration-refresh-token-67890'
      })
    );
  }),

  // Logout endpoint
  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        message: 'Logged out successfully'
      })
    );
  }),

  // Refresh token endpoint
  rest.post(`${API_BASE_URL}/auth/refresh`, (req, res, ctx) => {
    const { refreshToken } = req.body;

    if (!refreshToken || refreshToken === 'invalid-refresh-token') {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'Invalid refresh token',
          code: 'INVALID_REFRESH_TOKEN'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        token: 'new-mock-jwt-token-12345',
        refreshToken: 'new-mock-refresh-token-67890'
      })
    );
  }),

  // Get current user endpoint
  rest.get(`${API_BASE_URL}/auth/me`, (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res(
        ctx.status(401),
        ctx.json({
          error: 'No token provided',
          code: 'NO_TOKEN'
        })
      );
    }

    const token = authHeader.split(' ')[1];

    if (token === 'mock-jwt-token-12345') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        })
      );
    }

    if (token === 'mock-admin-jwt-token-12345') {
      return res(
        ctx.status(200),
        ctx.json({
          id: 2,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        })
      );
    }

    return res(
      ctx.status(401),
      ctx.json({
        error: 'Invalid token',
        code: 'INVALID_TOKEN'
      })
    );
  }),
];

// Communication endpoints
export const communicationHandlers = [
  // Send message endpoint
  rest.post(`${API_BASE_URL}/communication/send`, (req, res, ctx) => {
    const { to, message, type = 'sms' } = req.body;

    if (!to || !message) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Recipient and message are required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: 'msg-123',
        to,
        message,
        type,
        status: 'sent',
        timestamp: new Date().toISOString()
      })
    );
  }),

  // Get messages endpoint
  rest.get(`${API_BASE_URL}/communication/messages`, (req, res, ctx) => {
    const page = parseInt(req.url.searchParams.get('page') || '1');
    const limit = parseInt(req.url.searchParams.get('limit') || '10');

    const mockMessages = [
      {
        id: 'msg-1',
        to: '+1234567890',
        message: 'Hello, this is a test message',
        type: 'sms',
        status: 'delivered',
        timestamp: '2024-01-15T10:30:00Z'
      },
      {
        id: 'msg-2',
        to: '+0987654321',
        message: 'Thank you for your order',
        type: 'sms',
        status: 'sent',
        timestamp: '2024-01-15T11:00:00Z'
      }
    ];

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedMessages = mockMessages.slice(startIndex, endIndex);

    return res(
      ctx.status(200),
      ctx.json({
        messages: paginatedMessages,
        pagination: {
          page,
          limit,
          total: mockMessages.length,
          totalPages: Math.ceil(mockMessages.length / limit)
        }
      })
    );
  }),

  // Get conversation endpoint
  rest.get(`${API_BASE_URL}/communication/conversation/:phoneNumber`, (req, res, ctx) => {
    const { phoneNumber } = req.params;

    const mockConversation = [
      {
        id: 'conv-1',
        from: phoneNumber,
        to: '+1234567890',
        message: 'Hi there!',
        direction: 'inbound',
        timestamp: '2024-01-15T10:00:00Z'
      },
      {
        id: 'conv-2',
        from: '+1234567890',
        to: phoneNumber,
        message: 'Hello! How can I help you?',
        direction: 'outbound',
        timestamp: '2024-01-15T10:05:00Z'
      }
    ];

    return res(
      ctx.status(200),
      ctx.json({
        conversation: mockConversation,
        phoneNumber
      })
    );
  }),
];

// Phone number endpoints
export const phoneNumberHandlers = [
  // Get available numbers endpoint
  rest.get(`${API_BASE_URL}/phone-numbers/available`, (req, res, ctx) => {
    const areaCode = req.url.searchParams.get('areaCode');
    const type = req.url.searchParams.get('type') || 'local';

    const mockNumbers = [
      {
        id: 'num-1',
        number: '+1234567890',
        type: 'local',
        areaCode: '123',
        monthlyCost: 1.25,
        capabilities: ['sms', 'voice']
      },
      {
        id: 'num-2',
        number: '+1234567891',
        type: 'toll-free',
        areaCode: '800',
        monthlyCost: 2.50,
        capabilities: ['sms', 'voice']
      }
    ];

    const filteredNumbers = areaCode
      ? mockNumbers.filter(num => num.areaCode === areaCode)
      : mockNumbers;

    return res(
      ctx.status(200),
      ctx.json({
        numbers: filteredNumbers,
        total: filteredNumbers.length
      })
    );
  }),

  // Purchase number endpoint
  rest.post(`${API_BASE_URL}/phone-numbers/purchase`, (req, res, ctx) => {
    const { numberId } = req.body;

    if (!numberId) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Number ID is required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        id: 'purchase-123',
        numberId,
        status: 'completed',
        purchasedAt: new Date().toISOString()
      })
    );
  }),

  // Get user's numbers endpoint
  rest.get(`${API_BASE_URL}/phone-numbers`, (req, res, ctx) => {
    const mockUserNumbers = [
      {
        id: 'user-num-1',
        number: '+1234567890',
        type: 'local',
        status: 'active',
        purchasedAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 'user-num-2',
        number: '+1234567891',
        type: 'toll-free',
        status: 'active',
        purchasedAt: '2024-01-05T00:00:00Z'
      }
    ];

    return res(
      ctx.status(200),
      ctx.json({
        numbers: mockUserNumbers,
        total: mockUserNumbers.length
      })
    );
  }),
];

// Verification endpoints
export const verificationHandlers = [
  // Request verification endpoint
  rest.post(`${API_BASE_URL}/verification/request`, (req, res, ctx) => {
    const { phoneNumber, method = 'sms' } = req.body;

    if (!phoneNumber) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Phone number is required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.json({
        verificationId: 'ver-123',
        phoneNumber,
        method,
        status: 'pending',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      })
    );
  }),

  // Verify code endpoint
  rest.post(`${API_BASE_URL}/verification/verify`, (req, res, ctx) => {
    const { verificationId, code } = req.body;

    if (!verificationId || !code) {
      return res(
        ctx.status(400),
        ctx.json({
          error: 'Verification ID and code are required',
          code: 'VALIDATION_ERROR'
        })
      );
    }

    // Mock verification codes
    if (code === '123456') {
      return res(
        ctx.status(200),
        ctx.json({
          verificationId,
          status: 'verified',
          verifiedAt: new Date().toISOString()
        })
      );
    }

    return res(
      ctx.status(400),
      ctx.json({
        error: 'Invalid verification code',
        code: 'INVALID_CODE'
      })
    );
  }),

  // Get verification history endpoint
  rest.get(`${API_BASE_URL}/verification/history`, (req, res, ctx) => {
    const mockHistory = [
      {
        id: 'ver-1',
        phoneNumber: '+1234567890',
        method: 'sms',
        status: 'verified',
        requestedAt: '2024-01-15T10:00:00Z',
        verifiedAt: '2024-01-15T10:01:00Z'
      },
      {
        id: 'ver-2',
        phoneNumber: '+0987654321',
        method: 'voice',
        status: 'failed',
        requestedAt: '2024-01-15T11:00:00Z',
        error: 'Invalid phone number'
      }
    ];

    return res(
      ctx.status(200),
      ctx.json({
        history: mockHistory,
        total: mockHistory.length
      })
    );
  }),
];

// Error simulation handlers
export const errorHandlers = [
  // Network error simulation
  rest.get(`${API_BASE_URL}/test/network-error`, (req, res) => {
    return res.networkError('Network error occurred');
  }),

  // Timeout error simulation
  rest.get(`${API_BASE_URL}/test/timeout`, (req, res, ctx) => {
    return res(
      ctx.delay(10000), // 10 second delay
      ctx.status(200),
      ctx.json({ message: 'This should timeout' })
    );
  }),

  // Server error simulation
  rest.get(`${API_BASE_URL}/test/server-error`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({
        error: 'Internal server error',
        code: 'SERVER_ERROR'
      })
    );
  }),

  // Rate limiting simulation
  rest.post(`${API_BASE_URL}/test/rate-limit`, (req, res, ctx) => {
    return res(
      ctx.status(429),
      ctx.json({
        error: 'Too many requests',
        code: 'RATE_LIMITED',
        retryAfter: 60
      })
    );
  }),
];

// Combined handlers for easy import
export const handlers = [
  ...authHandlers,
  ...communicationHandlers,
  ...phoneNumberHandlers,
  ...verificationHandlers,
  ...errorHandlers,
];

// Export individual handler groups for selective testing
export default handlers;