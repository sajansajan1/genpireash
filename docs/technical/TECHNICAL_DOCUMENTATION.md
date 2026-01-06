# Genpire - Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [System Components](#system-components)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Security Implementation](#security-implementation)
7. [Deployment Architecture](#deployment-architecture)
8. [Development Guidelines](#development-guidelines)

## Architecture Overview

### System Architecture

Genpire follows a modern, scalable architecture pattern combining Next.js 15 for the frontend and backend API routes, with Supabase as the Backend-as-a-Service (BaaS) provider.

\`\`\`
┌─────────────────────────────────────────────────────────┐
│ Client Layer │
├─────────────────────────────────────────────────────────┤
│ Next.js 15 App (React 19 + TypeScript) │
│ ├── Pages & Routing │
│ ├── Server Components │
│ └── Client Components │
├─────────────────────────────────────────────────────────┤
│ API Layer │
│ Next.js API Routes + Actions │
├─────────────────────────────────────────────────────────┤
│ External Services │
│ ├── Supabase (Auth, DB, Storage) │
│ ├── OpenAI API (GPT-4, DALL-E) │
│ ├── PayPal API │
│ ├── Email Service (Nodemailer) │
│ └── LogRocket (Monitoring) │
└─────────────────────────────────────────────────────────┘
\`\`\`

### Design Patterns

- **Component-Based Architecture:** Modular React components with clear separation of concerns
- **Server-Side Rendering (SSR):** Leveraging Next.js 15 for optimal SEO and performance
- **State Management:** Zustand for global state, React Hook Form for forms
- **Real-time Updates:** Supabase real-time subscriptions for messaging and notifications
- **Type Safety:** Full TypeScript implementation with strict typing

## Technology Stack

### Frontend Technologies

#### Core Framework

- **Next.js 15.2.4:** React framework with App Router
- **React 19:** Latest React with concurrent features
- **TypeScript 5:** Type-safe development

#### UI & Styling

- **Tailwind CSS 3.4:** Utility-first CSS framework
- **Radix UI:** Accessible component primitives
- **Framer Motion:** Animation library
- **Lucide React:** Icon library
- **React Hook Form:** Form management
- **Zod:** Schema validation

#### State Management

- **Zustand:** Lightweight state management
- **SWR:** Data fetching and caching
- **React Query:** Server state management (via SWR)

### Backend Technologies

#### Database & Auth

- **Supabase:** PostgreSQL database with real-time subscriptions
- **Supabase Auth:** Authentication and authorization
- **Row Level Security (RLS):** Database-level security

#### External APIs

- **OpenAI API:** GPT-4 for text generation, DALL-E 3 for image generation
- **PayPal SDK:** Payment processing
- **Nodemailer:** Email notifications

#### Monitoring & Analytics

- **LogRocket:** Error tracking and session replay
- **Google Analytics:** Usage analytics

### Development Tools

- **pnpm:** Package manager for faster, more efficient dependency management
- **ESLint:** Code linting
- **Prettier:** Code formatting
- **Husky:** Git hooks (planned)

## System Components

### 1. Authentication System

#### Implementation

\`\`\`typescript
// lib/supabase/client.ts
export const supabase = createBrowserClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
\`\`\`

#### Features

- Email/password authentication
- OAuth providers (Google, GitHub - planned)
- Role-based access control (Creator, Supplier, Admin)
- Session management
- Password reset functionality

### 2. Tech Pack Generation Engine

#### Core Process

1. **Input Processing**

   - Text parsing and analysis
   - Image upload and processing
   - Sketch interpretation

2. **AI Generation Pipeline**
   \`\`\`typescript
   // Simplified generation flow
   async function generateTechPack(input: ProductInput) {
   // 1. Analyze input
   const analysis = await analyzeProduct(input)

   // 2. Generate specifications
   const specs = await generateSpecs(analysis)

   // 3. Generate visuals
   const images = await generateImages(specs)

   // 4. Compile tech pack
   return compileTechPack(specs, images)
   }
   \`\`\`

3. **Output Generation**
   - PDF creation with jsPDF
   - Structured JSON for database storage
   - Image generation and optimization

### 3. Supplier Marketplace

#### Components

- **Supplier Profiles:** Manufacturing capabilities, certifications, portfolio
- **RFQ System:** Request for quotation management
- **Matching Algorithm:** AI-powered supplier matching based on product requirements
- **Communication Platform:** Real-time messaging between creators and suppliers

### 4. Dashboard Systems

#### Creator Dashboard

- Tech pack management
- Order tracking
- Analytics and insights
- Supplier communication

#### Supplier Dashboard

- RFQ management
- Quote submission
- Portfolio management
- Manufacturing capabilities

### 5. Payment System

#### PayPal Integration

\`\`\`typescript
// Payment processing flow
async function processPayment(order: Order) {
const paypalOrder = await createPayPalOrder(order)
const approval = await getApproval(paypalOrder)
const capture = await capturePayment(approval)
return updateOrderStatus(order.id, capture)
}
\`\`\`

#### Features

- Secure payment processing
- Order tracking
- Refund management
- Invoice generation

## Database Schema

### Core Tables

#### Users & Profiles

\`\`\`sql
-- User authentication (managed by Supabase Auth)
auth.users

-- User profiles
CREATE TABLE profiles (
id UUID PRIMARY KEY,
user_id UUID REFERENCES auth.users(id),
full_name TEXT,
email TEXT UNIQUE,
role TEXT CHECK (role IN ('creator', 'supplier', 'admin')),
company_name TEXT,
location TEXT,
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP
);
\`\`\`

#### Tech Packs

\`\`\`sql
CREATE TABLE tech_packs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
user_id UUID REFERENCES auth.users(id),
prompt TEXT,
tech_pack JSONB, -- Structured tech pack data
image_data JSONB, -- Generated images metadata
status TEXT DEFAULT 'draft',
created_at TIMESTAMP DEFAULT NOW(),
updated_at TIMESTAMP
);
\`\`\`

#### RFQs and Quotes

\`\`\`sql
CREATE TABLE rfqs (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
creator_id UUID REFERENCES auth.users(id),
techpack_id UUID REFERENCES tech_packs(id),
title TEXT,
product_idea TEXT,
timeline TEXT,
quantity TEXT,
target_price TEXT,
status TEXT DEFAULT 'open',
created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE quotes (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
rfq_id UUID REFERENCES rfqs(id),
supplier_id UUID REFERENCES auth.users(id),
sample_price DECIMAL,
moq INTEGER,
lead_time TEXT,
message TEXT,
status TEXT DEFAULT 'pending',
created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

#### Messages

\`\`\`sql
CREATE TABLE messages (
id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
chat_id UUID,
sender_id UUID REFERENCES auth.users(id),
message TEXT,
created_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Database Security

#### Row Level Security (RLS)

\`\`\`sql
-- Example RLS policy for tech_packs
CREATE POLICY "Users can view own tech packs"
ON tech_packs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create tech packs"
ON tech_packs FOR INSERT
WITH CHECK (auth.uid() = user_id);
\`\`\`

## API Architecture

### API Routes Structure

\`\`\`
app/api/
├── create-order/ # Order creation
├── creator-dashboard/ # Dashboard data
├── get-order-detail/ # Order details
├── getProductIdeas/ # Product ideas listing
├── getUserProfile/ # User profile data
├── payment/ # Payment processing
├── singleTechPack/ # Tech pack details
└── test-email-config/ # Email testing
\`\`\`

### Server Actions

\`\`\`
app/actions/
├── auth.ts # Authentication actions
├── idea-generation.ts # AI generation
├── prompt-improvement.ts # Prompt optimization
├── user.ts # User management
├── admin.ts # Admin functions
├── paypal.ts # Payment actions
└── waitlist.ts # Waitlist management
\`\`\`

### API Design Principles

1. **RESTful Design:** Standard HTTP methods and status codes
2. **Error Handling:** Consistent error response format
3. **Validation:** Zod schemas for request/response validation
4. **Rate Limiting:** Prevent abuse (via Supabase)
5. **Caching:** SWR for client-side caching

## Security Implementation

### Authentication & Authorization

1. **Multi-factor Authentication:** Email verification required
2. **Role-Based Access Control (RBAC):** Creator, Supplier, Admin roles
3. **JWT Tokens:** Secure session management
4. **Password Security:** Bcrypt hashing, password strength requirements

### Data Security

1. **Encryption**

   - TLS/SSL for data in transit
   - Encrypted database at rest (Supabase)
   - Sensitive data encryption

2. **Input Validation**

   - Zod schema validation
   - SQL injection prevention (parameterized queries)
   - XSS protection (React default escaping)

3. **API Security**
   - API key management
   - Rate limiting
   - CORS configuration

### Compliance

- **GDPR Compliance:** Data privacy and user rights
- **PCI DSS:** Payment card security (via PayPal)
- **Data Retention:** Automated data cleanup policies

## Deployment Architecture

### Infrastructure

\`\`\`
Production Environment
├── Vercel (Frontend & API)
│ ├── Edge Functions
│ ├── Static Assets (CDN)
│ └── Serverless Functions
├── Supabase Cloud
│ ├── PostgreSQL Database
│ ├── Auth Service
│ ├── Storage (Images, Files)
│ └── Real-time Engine
└── External Services
├── OpenAI API
├── PayPal API
└── Email Service
\`\`\`

### Environment Configuration

\`\`\`env

# .env.local

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_OPENAI_API_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
EMAIL_SERVER_HOST=
EMAIL_SERVER_PORT=
EMAIL_FROM=
\`\`\`

### CI/CD Pipeline

1. **Development Workflow**

   - Feature branches
   - Pull request reviews
   - Automated testing

2. **Deployment Process**
   - Automatic deployment on main branch
   - Preview deployments for PRs
   - Environment-specific configs

## Development Guidelines

### Code Standards

#### TypeScript Best Practices

\`\`\`typescript
// Use strict typing
interface TechPackInput {
prompt: string
category: ProductCategory
materials?: Material[]
}

// Avoid any types
function processTechPack(input: TechPackInput): TechPack {
// Implementation
}
\`\`\`

#### Component Structure

\`\`\`typescript
// components/tech-pack/TechPackCard.tsx
interface TechPackCardProps {
techPack: TechPack
onEdit?: (id: string) => void
className?: string
}

export function TechPackCard({
techPack,
onEdit,
className
}: TechPackCardProps) {
// Component implementation
}
\`\`\`

### Testing Strategy

1. **Unit Tests:** Component and utility function testing
2. **Integration Tests:** API route testing
3. **E2E Tests:** Critical user flows
4. **Performance Testing:** Load time and optimization

### Performance Optimization

1. **Code Splitting:** Dynamic imports for large components
2. **Image Optimization:** Next.js Image component, WebP format
3. **Caching Strategy:** SWR for data fetching, CDN for static assets
4. **Bundle Size:** Tree shaking, minimal dependencies

### Monitoring & Logging

1. **Error Tracking:** LogRocket integration
2. **Performance Monitoring:** Core Web Vitals tracking
3. **User Analytics:** Google Analytics events
4. **API Monitoring:** Response times and error rates

## API Documentation

### Authentication Endpoints

#### Login

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
"email": "user@example.com",
"password": "password123"
}
\`\`\`

#### Tech Pack Generation

\`\`\`http
POST /api/actions/idea-generation
Content-Type: application/json

{
"prompt": "Minimalist gold bracelet with simple design",
"category": "jewelry",
"preferences": {
"materials": ["gold"],
"style": "minimalist"
}
}
\`\`\`

### Response Format

\`\`\`json
{
"success": true,
"data": {
// Response data
},
"error": null
}
\`\`\`

## Troubleshooting Guide

### Common Issues

1. **Authentication Errors**

   - Verify Supabase credentials
   - Check JWT token expiration
   - Validate CORS settings

2. **Generation Failures**

   - Check OpenAI API limits
   - Validate input format
   - Review error logs

3. **Payment Issues**
   - Verify PayPal credentials
   - Check webhook configuration
   - Review transaction logs

## Maintenance & Updates

### Regular Maintenance

- Database backups (automated daily)
- Security updates (weekly review)
- Performance monitoring (continuous)
- Dependency updates (monthly)

### Scaling Considerations

- Database connection pooling
- Horizontal scaling via Vercel
- CDN optimization
- Caching strategy refinement

---

_Last Updated: January 2025_
_Version: 1.0.0_
