# Genpire API Reference

## Base URL

\`\`\`
Production: https://api.genpire.com
Development: http://localhost:3000/api
\`\`\`

## Authentication

All API requests require authentication using Supabase JWT tokens.

### Headers
\`\`\`http
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
\`\`\`

## Endpoints

### Authentication

#### Sign Up
\`\`\`http
POST /api/auth/signup
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "full_name": "John Doe",
  "role": "creator" // "creator" | "supplier"
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "creator"
    },
    "session": {
      "access_token": "jwt_token",
      "refresh_token": "refresh_token"
    }
  }
}
\`\`\`

#### Sign In
\`\`\`http
POST /api/auth/signin
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
\`\`\`

#### Sign Out
\`\`\`http
POST /api/auth/signout
\`\`\`

#### Reset Password
\`\`\`http
POST /api/auth/reset-password
\`\`\`

**Request Body:**
\`\`\`json
{
  "email": "user@example.com"
}
\`\`\`

### Tech Pack Generation

#### Generate Tech Pack
\`\`\`http
POST /api/actions/idea-generation
\`\`\`

**Request Body:**
\`\`\`json
{
  "prompt": "Create a minimalist gold bracelet with simple design and polished finish",
  "category": "jewelry",
  "preferences": {
    "materials": ["gold", "silver"],
    "style": "minimalist",
    "target_price": "50-100",
    "quantity": "100-500"
  },
  "images": {
    "sketch": "base64_encoded_image",
    "reference": ["url1", "url2"]
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "tech_pack_id": "uuid",
    "tech_pack": {
      "productName": "Minimalist Gold Bracelet",
      "productOverview": "A sleek, minimalist gold bracelet...",
      "price": "$75",
      "estimatedLeadTime": "4-6 weeks",
      "materials": [
        {
          "name": "14K Gold",
          "reason": "Durable and hypoallergenic",
          "alternatives": ["18K Gold", "Gold-plated Sterling Silver"],
          "sustainabilityScore": 7,
          "costScore": 8
        }
      ],
      "dimensions": {
        "weight": "4.2g",
        "dimensionDetails": [
          {
            "name": "Length",
            "value": "18cm",
            "reason": "Standard bracelet size"
          }
        ]
      },
      "colors": {
        "primaryColors": [
          {
            "name": "Gold",
            "hex": "#FFD700"
          }
        ]
      },
      "packaging": {
        "materials": ["Recycled cardboard", "Velvet pouch"],
        "dimensions": "10cm x 10cm x 3cm",
        "description": "Eco-friendly packaging with premium feel"
      },
      "constructionDetails": {
        "description": "Hand-crafted with precision soldering",
        "construction": [
          "Cut gold wire to length",
          "Shape into circular form",
          "Solder clasp attachment",
          "Polish to high shine"
        ]
      },
      "qualityStandards": "ISO 9001 certified production",
      "careInstructions": "Clean with soft cloth, avoid chemicals"
    },
    "image_data": {
      "front": {
        "url": "https://storage.genpire.com/images/uuid-front.png",
        "created_at": "2025-01-21T10:00:00Z",
        "prompt_used": "Minimalist gold bracelet, front view",
        "regenerated": false
      }
    }
  }
}
\`\`\`

#### Get Tech Pack
\`\`\`http
GET /api/singleTechPack?id={tech_pack_id}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "user_uuid",
    "tech_pack": { /* Tech pack data */ },
    "image_data": { /* Image URLs and metadata */ },
    "status": "completed",
    "created_at": "2025-01-21T10:00:00Z",
    "updated_at": "2025-01-21T10:00:00Z"
  }
}
\`\`\`

#### List Tech Packs
\`\`\`http
GET /api/getProductIdeas?user_id={user_id}&page=1&limit=10
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "tech_packs": [
      { /* Tech pack object */ }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "total_pages": 3
    }
  }
}
\`\`\`

#### Update Tech Pack
\`\`\`http
PUT /api/singleTechPack
\`\`\`

**Request Body:**
\`\`\`json
{
  "tech_pack_id": "uuid",
  "updates": {
    "tech_pack": { /* Updated fields */ },
    "status": "finalized"
  }
}
\`\`\`

#### Delete Tech Pack
\`\`\`http
DELETE /api/singleTechPack?id={tech_pack_id}
\`\`\`

### RFQ & Supplier Management

#### Create RFQ
\`\`\`http
POST /api/rfq/create
\`\`\`

**Request Body:**
\`\`\`json
{
  "title": "Gold Bracelet Manufacturing",
  "product_idea": "Minimalist gold bracelet production",
  "techpack_id": "uuid",
  "timeline": "6 weeks",
  "quantity": "500",
  "target_price": "$75 per unit",
  "supplier_ids": ["supplier_uuid_1", "supplier_uuid_2"]
}
\`\`\`

#### Get RFQ Details
\`\`\`http
GET /api/rfq/{rfq_id}
\`\`\`

#### Submit Quote (Supplier)
\`\`\`http
POST /api/rfq/quote
\`\`\`

**Request Body:**
\`\`\`json
{
  "rfq_id": "uuid",
  "supplier_id": "supplier_uuid",
  "sample_price": "150",
  "moq": "100",
  "lead_time": "4 weeks",
  "message": "We can meet your requirements with premium quality...",
  "unit_price_tiers": [
    { "quantity": "100-499", "price": "80" },
    { "quantity": "500-999", "price": "75" },
    { "quantity": "1000+", "price": "70" }
  ]
}
\`\`\`

#### Accept Quote
\`\`\`http
POST /api/rfq/accept
\`\`\`

**Request Body:**
\`\`\`json
{
  "rfq_id": "uuid",
  "quote_id": "quote_uuid",
  "supplier_id": "supplier_uuid"
}
\`\`\`

### User Management

#### Get User Profile
\`\`\`http
GET /api/getUserProfile?user_id={user_id}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "creator",
    "company_name": "Doe Designs",
    "location": "New York, USA",
    "bio": "Fashion designer specializing in minimalist jewelry",
    "website_url": "https://doedesigns.com",
    "avatar_url": "https://storage.genpire.com/avatars/uuid.png",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
\`\`\`

#### Update User Profile
\`\`\`http
PUT /api/user/profile
\`\`\`

**Request Body:**
\`\`\`json
{
  "full_name": "John Doe",
  "company_name": "Doe Designs Inc.",
  "location": "New York, USA",
  "bio": "Updated bio",
  "website_url": "https://newsite.com"
}
\`\`\`

### Orders & Payments

#### Create Order
\`\`\`http
POST /api/create-order
\`\`\`

**Request Body:**
\`\`\`json
{
  "tech_pack_id": "uuid",
  "supplier_id": "supplier_uuid",
  "order_details": {
    "quantity": "500",
    "unit_price": "75",
    "total_amount": "37500",
    "delivery_date": "2025-03-01",
    "payment_terms": "50% upfront, 50% on delivery",
    "shipping_address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    }
  }
}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "order_id": "ORD-2025-001",
    "order_number": "ORD-2025-001",
    "status": "pending_payment",
    "payment_url": "https://paypal.com/checkout/..."
  }
}
\`\`\`

#### Process Payment
\`\`\`http
POST /api/payment
\`\`\`

**Request Body:**
\`\`\`json
{
  "order_id": "ORD-2025-001",
  "payment_method": "paypal",
  "payment_details": {
    "payer_id": "paypal_payer_id",
    "payment_id": "paypal_payment_id"
  }
}
\`\`\`

#### Get Order Details
\`\`\`http
GET /api/get-order-detail?order_id={order_id}
\`\`\`

### Messaging

#### Send Message
\`\`\`http
POST /api/messages/send
\`\`\`

**Request Body:**
\`\`\`json
{
  "chat_id": "chat_uuid",
  "message": "Hello, I have a question about the MOQ",
  "recipient_id": "recipient_uuid"
}
\`\`\`

#### Get Messages
\`\`\`http
GET /api/messages?chat_id={chat_id}&limit=50&offset=0
\`\`\`

#### Get Conversations
\`\`\`http
GET /api/messages/conversations?user_id={user_id}
\`\`\`

### Dashboard Analytics

#### Creator Dashboard
\`\`\`http
GET /api/creator-dashboard?user_id={user_id}
\`\`\`

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "stats": {
      "total_tech_packs": 15,
      "active_rfqs": 3,
      "accepted_quotes": 2,
      "total_orders": 5
    },
    "recent_activity": [
      {
        "type": "tech_pack_created",
        "title": "Gold Bracelet Tech Pack",
        "timestamp": "2025-01-21T10:00:00Z"
      }
    ],
    "analytics": {
      "monthly_tech_packs": [
        { "month": "Jan", "count": 5 },
        { "month": "Feb", "count": 8 }
      ]
    }
  }
}
\`\`\`

#### Supplier Dashboard
\`\`\`http
GET /api/supplier-dashboard?supplier_id={supplier_id}
\`\`\`

### File Upload

#### Upload Image
\`\`\`http
POST /api/upload/image
Content-Type: multipart/form-data
\`\`\`

**Form Data:**
- `file`: Image file (PNG, JPG, JPEG)
- `type`: "sketch" | "reference" | "avatar" | "portfolio"

**Response:**
\`\`\`json
{
  "success": true,
  "data": {
    "url": "https://storage.genpire.com/uploads/uuid.png",
    "file_id": "uuid",
    "size": 1024000,
    "mime_type": "image/png"
  }
}
\`\`\`

## Error Responses

All error responses follow this format:

\`\`\`json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { /* Optional additional details */ }
  }
}
\`\`\`

### Common Error Codes

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `AUTH_REQUIRED` | Authentication required | 401 |
| `AUTH_INVALID` | Invalid credentials | 401 |
| `FORBIDDEN` | Access denied | 403 |
| `NOT_FOUND` | Resource not found | 404 |
| `VALIDATION_ERROR` | Invalid request data | 400 |
| `RATE_LIMIT` | Too many requests | 429 |
| `SERVER_ERROR` | Internal server error | 500 |
| `OPENAI_ERROR` | AI generation failed | 503 |
| `PAYMENT_ERROR` | Payment processing failed | 402 |

## Rate Limiting

- **Standard Users:** 100 requests per minute
- **Pro Users:** 500 requests per minute
- **Enterprise:** Unlimited

Rate limit headers:
\`\`\`http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
\`\`\`

## Webhooks

Configure webhooks in your dashboard to receive real-time updates.

### Webhook Events

- `tech_pack.created`
- `tech_pack.updated`
- `rfq.created`
- `rfq.quote_received`
- `order.created`
- `order.paid`
- `order.shipped`
- `message.received`

### Webhook Payload

\`\`\`json
{
  "event": "tech_pack.created",
  "timestamp": "2025-01-21T10:00:00Z",
  "data": {
    /* Event-specific data */
  }
}
\`\`\`

### Webhook Security

Verify webhook signatures using the `X-Genpire-Signature` header:

\`\`\`javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hash = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return hash === signature;
}
\`\`\`

## SDK Examples

### JavaScript/TypeScript

\`\`\`typescript
import { GenpireClient } from '@genpire/sdk';

const client = new GenpireClient({
  apiKey: 'your_api_key',
  environment: 'production'
});

// Generate tech pack
const techPack = await client.techPacks.generate({
  prompt: 'Minimalist gold bracelet',
  category: 'jewelry'
});

// Create RFQ
const rfq = await client.rfqs.create({
  title: 'Gold Bracelet Manufacturing',
  techPackId: techPack.id,
  quantity: '500'
});
\`\`\`

### Python

\`\`\`python
from genpire import GenpireClient

client = GenpireClient(
    api_key='your_api_key',
    environment='production'
)

# Generate tech pack
tech_pack = client.tech_packs.generate(
    prompt='Minimalist gold bracelet',
    category='jewelry'
)

# Create RFQ
rfq = client.rfqs.create(
    title='Gold Bracelet Manufacturing',
    tech_pack_id=tech_pack.id,
    quantity='500'
)
\`\`\`

## Support

For API support, contact:
- Email: api-support@genpire.com
- Documentation: https://docs.genpire.com/api
- Status Page: https://status.genpire.com

---

*API Version: v1.0.0*
*Last Updated: January 2025*
