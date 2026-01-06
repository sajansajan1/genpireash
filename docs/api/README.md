# 🔌 API Documentation

## Overview

Complete API reference and integration guides for the Genpire platform, including REST endpoints, real-time subscriptions, and authentication.

## 📚 Documentation Files

- **[API Reference](./API_REFERENCE.md)** - Complete endpoint documentation with examples
- **[API Documentation](./API_DOCUMENTATION.md)** - Integration patterns and best practices

## 🚀 Quick Start

### Authentication
\`\`\`typescript
// Initialize Supabase client
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Authenticate user
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
\`\`\`

### Basic API Call
\`\`\`typescript
// Create a tech pack
const response = await fetch('/api/products/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    prompt: 'Modern cotton t-shirt with minimalist design'
  })
});

const techPack = await response.json();
\`\`\`

## 📋 API Endpoints

### Core Endpoints

#### Product Management
- `POST /api/products/create` - Generate tech pack
- `GET /api/products` - List user products
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Image Generation
- `POST /api/images/generate` - Generate product images
- `POST /api/images/edit` - AI-powered image editing
- `GET /api/images/revisions` - Get revision history

#### RFQ System
- `POST /api/rfq/create` - Create RFQ
- `GET /api/rfq` - List RFQs
- `POST /api/rfq/quote` - Submit quote
- `GET /api/rfq/:id/quotes` - Get quotes for RFQ

#### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/credits` - Get credit balance

## 🔄 Real-time Features

### WebSocket Subscriptions
\`\`\`typescript
// Subscribe to product updates
const subscription = supabase
  .channel('product-changes')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'product_ideas'
    },
    (payload) => {
      console.log('Product updated:', payload);
    }
  )
  .subscribe();
\`\`\`

### Presence Tracking
\`\`\`typescript
// Track online users
const channel = supabase.channel('room:lobby');

channel
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    console.log('Online users:', state);
  })
  .subscribe();
\`\`\`

## 🔐 Authentication

### JWT Token Structure
\`\`\`json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "authenticated",
  "iat": 1234567890,
  "exp": 1234567890
}
\`\`\`

### Authorization Headers
\`\`\`http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json
X-API-Version: 1.0
\`\`\`

## ⚠️ Error Handling

### Standard Error Response
\`\`\`json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "The requested product does not exist",
    "details": {
      "product_id": "uuid-here"
    }
  },
  "timestamp": "2025-01-09T12:00:00Z"
}
\`\`\`

### Error Codes
| Code | Description | HTTP Status |
|------|-------------|-------------|
| `UNAUTHORIZED` | Missing or invalid token | 401 |
| `FORBIDDEN` | Insufficient permissions | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid input data | 400 |
| `RATE_LIMITED` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |

## 📊 Rate Limiting

### Limits by Tier
- **Free:** 100 requests/hour
- **Pro:** 1000 requests/hour
- **Enterprise:** Unlimited

### Rate Limit Headers
\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
\`\`\`

## 🧪 Testing

### Test Environment
\`\`\`bash
API_BASE_URL=https://api-test.genpire.com
TEST_API_KEY=test_key_xxx
\`\`\`

### Example Test
\`\`\`typescript
describe('Product API', () => {
  it('should create product', async () => {
    const response = await api.post('/products/create', {
      prompt: 'Test product'
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('id');
  });
});
\`\`\`

## 📈 Performance

### Response Times
- P50: < 200ms
- P95: < 500ms
- P99: < 1000ms

### Optimization Tips
1. Use pagination for large datasets
2. Implement caching on client side
3. Batch related API calls
4. Use WebSocket for real-time data

## 🔗 SDK & Libraries

### JavaScript/TypeScript
\`\`\`bash
npm install @genpire/sdk
\`\`\`

### Python
\`\`\`bash
pip install genpire-sdk
\`\`\`

### Usage Example
\`\`\`typescript
import { GenpireSDK } from '@genpire/sdk';

const sdk = new GenpireSDK({
  apiKey: process.env.GENPIRE_API_KEY
});

const product = await sdk.products.create({
  prompt: 'Modern denim jacket'
});
\`\`\`

## 📚 Additional Resources

- [Database Schema](../db/database-schema.md)
- [API Integration Guide](../db/api-integration-guide.md)
- [Authentication Guide](../technical/TECHNICAL_DOCUMENTATION.md#authentication)

---

*API Version: 1.0 | Last Updated: January 2025*
