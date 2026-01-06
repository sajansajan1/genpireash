# 📚 Genpire Documentation Hub --

> **AI-Powered Fashion Tech Pack Generator** - Transform your product ideas into manufacturing-ready specifications in minutes

## 🏗️ Documentation Structure

Our documentation is organized into specialized categories for easy navigation:

\`\`\`
docs/
├── 🤖 ai/          - AI & Machine Learning Documentation
├── 🔌 api/         - API Reference & Integration Guides  
├── 🗄️ db/          - Database Schema & Queries
├── 📦 product/     - Product Documentation & Features
├── ⚙️ technical/   - Technical Architecture & Development
└── 📖 guides/      - User Guides & Tutorials
\`\`\`

## 🚀 Quick Start

New to Genpire? Start here:

1. **[Getting Started Guide](./guides/USER_GUIDE.md)** - Step-by-step setup and first tech pack
2. **[Database Overview](./db/README.md)** - Understanding our data architecture
3. **[API Quick Reference](./api/API_REFERENCE.md)** - Essential API endpoints

## 📂 Documentation Categories

### 🗄️ Database Documentation (`/db`)

Complete database architecture and integration guides:

- **[Database Schema](./db/database-schema.md)** - All 24 tables, relationships, and constraints
- **[API Integration Guide](./db/api-integration-guide.md)** - Supabase client setup and patterns
- **[Query Examples](./db/database-queries.md)** - 50+ SQL queries for common operations
- **[Database README](./db/README.md)** - Quick reference and overview

**Key Topics:** PostgreSQL, Supabase, Migrations, RLS, Performance Optimization

### 🤖 AI & Image Generation (`/ai`)

Everything about our AI-powered generation system:

- **[AI Workflow Documentation](./ai/AI_WORKFLOW_DOCUMENTATION.md)** - Complete AI integration flows
- **[AI Flows Analysis](./ai/AI_FLOWS_COMPLETE_ANALYSIS.md)** - Comprehensive workflow analysis
- **[Latest AI Flow](./ai/AI_FLOW_LATEST.md)** - Current production AI pipeline
- **[Image Generation](./ai/IMAGE_GENERATION_DOCUMENTATION.md)** - Multi-view image generation
- **[Image Analysis Caching](./ai/IMAGE_ANALYSIS_CACHING.md)** - Performance optimization
- **[Stepped Generation Workflow](./ai/STEPPED_IMAGE_GENERATION_WORKFLOW.md)** - Progressive generation
- **[Stepped Generation Integration](./ai/STEPPED_GENERATION_INTEGRATION.md)** - Implementation guide
- **[Stepped Generation Setup](./ai/SETUP_STEPPED_GENERATION.md)** - Configuration guide
- **[Product Image Prompts](./ai/PRODUCT_IMAGE_PROMPTS.md)** - Prompt engineering guide
- **[Centralized Service](./ai/CENTRALIZED_SERVICE_INTEGRATION.md)** - Unified AI service
- **[Gemini Migration Plan](./ai/GEMINI_MIGRATION_PLAN.md)** - Model migration strategy
- **[Measurement Approach](./ai/MEASUREMENT_APPROACH.md)** - AI metrics and evaluation

**Key Topics:** Gemini AI, GPT-4, Image Generation, Prompt Engineering, Caching

### 🔌 API Documentation (`/api`)

RESTful API and integration documentation:

- **[API Reference](./api/API_REFERENCE.md)** - Complete endpoint documentation
- **[API Documentation](./api/API_DOCUMENTATION.md)** - Integration patterns and examples

**Key Topics:** REST APIs, Authentication, Real-time Subscriptions, Error Handling

### 📦 Product Documentation (`/product`)

Product features and business logic:

- **[Product Documentation](./product/PRODUCT_DOCUMENTATION.md)** - Features, roadmap, and use cases

**Key Topics:** Tech Packs, RFQ System, Supplier Marketplace, Order Management

### ⚙️ Technical Documentation (`/technical`)

Architecture and development resources:

- **[Technical Documentation](./technical/TECHNICAL_DOCUMENTATION.md)** - System architecture
- **[SEO Documentation](./technical/SEO_DOCUMENTATION.md)** - SEO optimization guide

**Key Topics:** Next.js 15, TypeScript, Deployment, Performance, Security

### 📖 User Guides (`/guides`)

Step-by-step tutorials and guides:

- **[User Guide](./guides/USER_GUIDE.md)** - Complete user manual

**Key Topics:** Getting Started, Creating Tech Packs, Managing Orders, Supplier Communication

## 🎯 Common Use Cases

### For Developers

#### Setting Up Development Environment
1. Review [Technical Documentation](./technical/TECHNICAL_DOCUMENTATION.md)
2. Follow [Database Schema](./db/database-schema.md) setup
3. Configure [API Integration](./db/api-integration-guide.md)

#### Implementing New Features
1. Check [Database Queries](./db/database-queries.md) for patterns
2. Review [AI Workflow](./ai/AI_WORKFLOW_DOCUMENTATION.md) for AI features
3. Follow [API Reference](./api/API_REFERENCE.md) for endpoints

#### Performance Optimization
1. Use [Image Analysis Caching](./ai/IMAGE_ANALYSIS_CACHING.md)
2. Apply [Database Query](./db/database-queries.md) optimizations
3. Implement [Stepped Generation](./ai/STEPPED_IMAGE_GENERATION_WORKFLOW.md)

### For Product Managers

#### Understanding Features
- [Product Documentation](./product/PRODUCT_DOCUMENTATION.md) - Complete feature set
- [User Guide](./guides/USER_GUIDE.md) - User workflows
- [AI Flows Analysis](./ai/AI_FLOWS_COMPLETE_ANALYSIS.md) - AI capabilities

#### Planning Roadmap
- [Gemini Migration Plan](./ai/GEMINI_MIGRATION_PLAN.md) - AI evolution
- [Technical Documentation](./technical/TECHNICAL_DOCUMENTATION.md) - Technical constraints

### For Users

#### Getting Started
1. [User Guide](./guides/USER_GUIDE.md) - Complete tutorial
2. [Product Documentation](./product/PRODUCT_DOCUMENTATION.md) - Feature overview

## 🔍 Quick Reference

### Key Technologies
- **Frontend:** Next.js 15, React 19, TypeScript 5, Tailwind CSS
- **Backend:** Supabase (PostgreSQL), Edge Functions
- **AI/ML:** Google Gemini, OpenAI GPT-4, Custom Vision Models
- **Infrastructure:** Vercel, Supabase Cloud

### Important Concepts

#### Database Architecture
- **Multi-view Revisions:** Track all image edits with soft delete
- **Batch Operations:** Group related changes together
- **Cache Strategy:** Reduce AI API calls with intelligent caching

#### AI Generation Pipeline
1. **Prompt Analysis:** Understanding user requirements
2. **Tech Pack Generation:** Creating detailed specifications
3. **Image Generation:** Multi-view product images
4. **Revision Management:** AI-powered editing system

#### API Patterns
- **Authentication:** JWT-based with Supabase Auth
- **Real-time:** WebSocket subscriptions for live updates
- **Error Handling:** Standardized error responses
- **Rate Limiting:** Protect against abuse

## 📊 Documentation Statistics

- **Total Documentation Files:** 22+
- **Database Tables Documented:** 24
- **API Endpoints Documented:** 50+
- **SQL Query Examples:** 50+
- **AI Workflows Documented:** 10+

## 🔄 Recent Updates

### January 2025
- ✅ Complete database documentation restructure
- ✅ Added comprehensive API integration guide
- ✅ Created 50+ SQL query examples
- ✅ Organized documentation into logical categories
- ✅ Added AI workflow analysis documentation

### December 2024
- Added stepped image generation workflow
- Implemented image analysis caching
- Centralized AI service integration
- Gemini migration planning

## 🛠️ Maintenance

### Documentation Standards
- Keep documentation in sync with code
- Include practical examples
- Update version numbers
- Test all code samples

### Contributing to Docs
1. Follow existing structure
2. Include code examples
3. Update the main README
4. Cross-reference related docs

## 🔗 External Resources

### Official Documentation
- [Supabase Docs](https://supabase.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
- [Google AI Docs](https://ai.google.dev/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)

### Community
- [Discord Server](https://discord.gg/genpire)
- [GitHub Issues](https://github.com/genpire/genpire)
- Email: support@genpire.com

## 📈 Documentation Roadmap

### Q1 2025
- [ ] Add video tutorials
- [ ] Create interactive API playground
- [ ] Expand troubleshooting guides
- [ ] Add migration guides

### Q2 2025
- [ ] Internationalization (i18n)
- [ ] Mobile app documentation
- [ ] Advanced AI customization guides
- [ ] Performance tuning handbook

## 💡 Pro Tips

1. **Search Functionality:** Use `Ctrl+F` / `Cmd+F` to search within documents
2. **Quick Navigation:** Use the table of contents in each document
3. **Code Examples:** All code examples are tested and production-ready
4. **Updates:** Check git history for latest changes to docs

---

<div align="center">

**📚 Genpire Documentation** | **Version 2.0** | **Last Updated: January 2025**

*From Idea to Factory in No Time* 🚀

[Website](https://genpire.com) • [GitHub](https://github.com/genpire) • [Support](mailto:support@genpire.com)

</div>
