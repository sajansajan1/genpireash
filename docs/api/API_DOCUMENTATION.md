# Genpire API Documentation

## Overview

The Genpire platform uses a Next.js 14+ App Router architecture with API routes for backend functionality. The API follows RESTful principles and integrates with Supabase for database operations and authentication.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ with App Router
- **API Routes**: Located in `/app/api/` directory
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth + Custom Admin Auth
- **State Management**: Zustand stores for client-side
- **HTTP Client**: Native Fetch API

### API Structure

\`\`\`
app/api/
├── admin/ # Admin-specific endpoints
├── creator/ # Creator management endpoints
├── tech-pack/ # Tech pack CRUD operations
├── notifications/ # Notification system
├── payment/ # Payment processing
├── paypal/ # PayPal integration
└── pdfSender/ # PDF generation and delivery
\`\`\`

## Authentication & Authorization

### 1. User Authentication (Supabase)

- **Method**: JWT tokens via Supabase Auth
- **Storage**: HTTP-only cookies
- **Session Management**: Server-side validation

\`\`\`typescript
// Server-side authentication check
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (!user) {
return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
\`\`\`

### 2. Admin Authentication

- **Method**: Custom JWT implementation
- **Rate Limiting**: 5 attempts per 15 minutes
- **Session**: Server-side token validation

\`\`\`typescript
// Admin login endpoint
POST /api/admin/login
{
"email": "admin@example.com",
"password": "secure_password"
}
\`\`\`

## Client-Server Interaction Pattern

### 1. Client-Side Request Flow

#### Using Zustand Stores

The client primarily interacts with the API through Zustand stores that encapsulate API calls:

\`\`\`typescript
// Example: Fetching tech packs
const useProductIdeasStore = create((set, get) => ({
productIdeas: null,
loadingProductIdeas: false,

fetchProductIdeas: async () => {
set({ loadingProductIdeas: true });

    try {
      const res = await fetch("/api/tech-pack/get-all-techpacks");
      if (!res.ok) throw new Error("Failed to fetch");

      const ideas = await res.json();
      set({ productIdeas: ideas, loadingProductIdeas: false });
    } catch (error) {
      set({ errorProductIdeas: error.message, loadingProductIdeas: false });
    }

}
}));
\`\`\`

#### Direct API Calls from Components

Some components make direct API calls for specific operations:

\`\`\`typescript
// Example: Sending PDF via email
const sendPDF = async (techPack, { email, phone }) => {
const pdfBase64 = await generatePdfBase64({ tech_pack: getTechPack });

await fetch("/api/pdfSender/send-email", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
email,
pdfBuffer: pdfBase64,
fileName: `${techPack.productName}.pdf`
})
});
};
\`\`\`

### 2. Request/Response Patterns

#### Standard Request Structure

\`\`\`typescript
// Headers
{
"Content-Type": "application/json",
// Authentication handled via cookies automatically
}

// Request Body
{
"field1": "value1",
"field2": "value2"
}
\`\`\`

#### Standard Response Structure

\`\`\`typescript
// Success Response
{
"data": { /_ resource data _/ },
"message": "Success message (optional)"
}

// Error Response
{
"error": "Error description",
"details": { /_ optional error details _/ }
}
// HTTP Status codes: 200, 201, 400, 401, 403, 404, 500
\`\`\`

## API Endpoints

### Admin Endpoints

#### Login

\`\`\`
POST /api/admin/login
Body: { email: string, password: string }
Response: { success: boolean }
\`\`\`

#### Get KPIs

\`\`\`
GET /api/admin/kpis
Response: { users: number, creators: number, orders: number, revenue: number }
\`\`\`

#### Get Creators

\`\`\`
GET /api/admin/creators
Response: Array of creator profiles
\`\`\`

### Creator Endpoints

#### Create Creator Profile

\`\`\`
POST /api/creator/create-creator
Body: {
full_name: string,
avatar_url: string,
country: string,
categories: string[],
address: string,
contact: string,
email: string
}
Response: { id: string }
\`\`\`

#### Get Creator Profile

\`\`\`
GET /api/creator/get-creatorProfile
Response: Creator profile object
\`\`\`

#### Update Creator Profile

\`\`\`
PUT /api/creator/update-creator
Body: Partial creator profile fields
Response: Updated creator profile
\`\`\`

### Tech Pack Endpoints

#### Get All Tech Packs

\`\`\`
GET /api/tech-pack/get-all-techpacks
Response: Array of tech pack objects
\`\`\`

#### Get Single Tech Pack

\`\`\`
GET /api/tech-pack/get-techpack?id={techPackId}
Response: Tech pack object
\`\`\`

#### Update Tech Pack

\`\`\`
PUT /api/tech-pack/update-techpack
Body: { id: string, ...techPackFields }
Response: Updated tech pack
\`\`\`

#### Delete Tech Pack

\`\`\`
DELETE /api/tech-pack/delete-techpack
Body: { id: string }
Response: { success: boolean }
\`\`\`

### Notification Endpoints

#### Get Notifications

\`\`\`
GET /api/notifications/get-notifications
Response: Array of notifications
\`\`\`

#### Create Notification

\`\`\`
POST /api/notifications/create-notification
Body: {
title: string,
message: string,
type: string,
recipient_id: string
}
Response: { id: string }
\`\`\`

#### Mark Notification as Read

\`\`\`
PUT /api/notifications/update-notification
Body: { id: string, read: true }
Response: Updated notification
\`\`\`

### Order Management

#### Create Order

\`\`\`
POST /api/create-order
Body: {
product_id: string,
quantity: number,
shipping_address: object,
payment_method: string
}
Response: { order_id: string }
\`\`\`

#### Get Order Details

\`\`\`
GET /api/get-order-detail?id={orderId}
Response: Order object with line items
\`\`\`

## Data Flow Examples

### 1. User Login Flow

\`\`\`mermaid
sequenceDiagram
Client->>Supabase: signInWithPassword(email, password)
Supabase-->>Client: JWT Token + User Data
Client->>API: Request with auth cookie
API->>Supabase: Verify token
Supabase-->>API: User validated
API-->>Client: Protected resource
\`\`\`

### 2. Tech Pack Creation Flow

\`\`\`mermaid
sequenceDiagram
Client->>API: POST /api/generate-techpack-images
API->>AI Service: Generate images
AI Service-->>API: Generated images
API->>Supabase: Store tech pack data
Supabase-->>API: Tech pack ID
API-->>Client: Tech pack created
Client->>Zustand Store: Update local state
\`\`\`

### 3. Real-time Updates Pattern

The application uses a combination of:

- **Polling**: For dashboard metrics
- **Manual Refresh**: Via Zustand store actions
- **Optimistic Updates**: For immediate UI feedback

\`\`\`typescript
// Example: Optimistic update pattern
const updateTechPack = async (id, updates) => {
// Optimistically update UI
set(state => ({
productIdeas: state.productIdeas.map(item =>
item.id === id ? { ...item, ...updates } : item
)
}));

try {
// Make API call
const response = await fetch('/api/tech-pack/update-techpack', {
method: 'PUT',
body: JSON.stringify({ id, ...updates })
});

    if (!response.ok) {
      // Revert on failure
      await get().refreshProductIdeas();
    }

} catch (error) {
// Revert on error
await get().refreshProductIdeas();
}
};
\`\`\`

## Error Handling

### Client-Side Error Handling

\`\`\`typescript
try {
const response = await fetch('/api/endpoint');

if (!response.ok) {
const error = await response.json();
// Handle specific error codes
if (response.status === 401) {
// Redirect to login
} else if (response.status === 429) {
// Show rate limit message
} else {
// Show generic error
}
}
} catch (error) {
// Network or parsing error
console.error('Request failed:', error);
}
\`\`\`

### Server-Side Error Handling

\`\`\`typescript
export async function POST(request: NextRequest) {
try {
// Validate input
const body = await request.json();
if (!body.requiredField) {
return NextResponse.json(
{ error: "Missing required field" },
{ status: 400 }
);
}

    // Process request
    // ...

} catch (error) {
console.error("Server error:", error);
return NextResponse.json(
{ error: "Internal server error" },
{ status: 500 }
);
}
}
\`\`\`

## Security Considerations

### 1. Authentication

- All sensitive endpoints require authentication
- JWT tokens are validated server-side
- Sessions expire and require re-authentication

### 2. Rate Limiting

- Admin login: 5 attempts per 15 minutes
- API endpoints: Consider implementing general rate limiting

### 3. Input Validation

- All user inputs are validated server-side
- SQL injection prevented via Supabase parameterized queries
- XSS prevention through proper data sanitization

### 4. CORS Configuration

- Configured in Next.js middleware
- Restricts API access to allowed origins

## Performance Optimizations

### 1. Caching Strategy

- **Client-Side**: Zustand stores cache fetched data
- **HTTP Caching**: Appropriate cache headers for static resources
- **Database**: Supabase connection pooling

### 2. Pagination

- Large datasets are paginated
- Limit/offset parameters for list endpoints

### 3. Lazy Loading

- Images and heavy components loaded on demand
- Code splitting for route-based chunks

## Development Guidelines

### Adding New Endpoints

1. Create route file in `/app/api/` directory
2. Implement proper authentication checks
3. Validate input data
4. Handle errors gracefully
5. Return consistent response format
6. Update Zustand store if needed
7. Add TypeScript types

### Testing API Endpoints

\`\`\`bash

# Local development

curl -X POST http://localhost:3000/api/endpoint \
 -H "Content-Type: application/json" \
 -d '{"key": "value"}'

# With authentication

curl -X GET http://localhost:3000/api/protected \
 -H "Cookie: supabase-auth-token=..."
\`\`\`

## Deployment Considerations

### Environment Variables

Required environment variables:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD_HASH=
JWT_SECRET=
\`\`\`

### Production Checklist

- [ ] Enable HTTPS only
- [ ] Configure proper CORS
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Configure database connection pooling
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Enable API versioning if needed

## Migration and Maintenance

### Database Migrations

- Managed through Supabase dashboard
- Migration files tracked in version control

### API Versioning Strategy

- Consider URL versioning: `/api/v1/`, `/api/v2/`
- Maintain backward compatibility
- Deprecate old endpoints gradually

### Monitoring

- Track API response times
- Monitor error rates
- Set up alerts for failures
- Log all authentication attempts

---

This documentation provides a comprehensive overview of the Genpire API architecture and implementation. For specific implementation details, refer to the individual route files and Zustand store implementations.
