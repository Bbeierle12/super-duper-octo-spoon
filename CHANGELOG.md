# Changelog

All notable changes to DreamBuildDrive 2.0 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-13

### Added - Initial MVP Release

#### Core Features
- **Multi-tenant SaaS architecture** with strict tenant isolation
- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Owner, Admin, Member, Viewer)
  - User registration and login
  - Secure password hashing with bcrypt (12 rounds)

- **Projects Module**
  - CRUD operations for automotive build projects
  - Vehicle information tracking (year, make, model, VIN)
  - Build goals and status tracking
  - Budget management (vehicle purchase + build costs)
  - Project statistics and analytics

- **Categories System**
  - 13 default category templates (chassis, suspension, engine, drivetrain, etc.)
  - Custom category creation
  - Budget allocation per category
  - Cost rollup and variance tracking

- **Parts Management**
  - Detailed part information (manufacturer, part number, fitment)
  - Cost tracking (projected vs actual)
  - Vendor and purchase tracking
  - Status management (planned, ordered, installed)
  - Critical path flagging

- **Labor & Vendor Module**
  - Labor item tracking separate from parts
  - Vendor management at tenant level
  - Multiple billing types (hourly, fixed, time & materials)
  - Cost estimation and actual tracking

- **Tasks Module**
  - Task creation linked to projects
  - Status tracking (backlog, in progress, blocked, completed)
  - Priority levels
  - Due dates and assignment
  - Dependencies (optional)

- **Media & Documents**
  - Media asset management for photos and documents
  - Support for images (JPEG, PNG, GIF, WebP) and PDFs
  - Tagging and categorization
  - Linking to projects, categories, parts, and tasks
  - Signed URL upload workflow (development mode)

- **Analytics & Reporting**
  - Dashboard with key metrics
  - Cost breakdown by category
  - Budget vs actual analysis
  - Variance reporting
  - CSV export for parts and costs
  - JSON export for project summary

#### Infrastructure
- **Health Check Endpoints**
  - `/health` - General health status
  - `/health/ready` - Readiness probe
  - `/health/live` - Liveness probe

- **Activity Logging**
  - Audit trail for all major actions
  - User action tracking
  - Change history
  - Security event logging

- **Docker Support**
  - Multi-stage production builds
  - Docker Compose for local development
  - Health checks in containers
  - PostgreSQL database container

- **Security Features**
  - OWASP Top 10 compliance
  - Helmet.js security headers
  - Rate limiting (100 req/min default)
  - CORS configuration
  - Input validation on all endpoints
  - SQL injection prevention (TypeORM)
  - XSS prevention (React)

#### Frontend
- **React SPA** with TypeScript
- **Material-UI** design system
- **Redux Toolkit** state management
- **React Query** for server state
- **Core Pages**
  - Authentication (Login/Register)
  - Dashboard with metrics
  - Projects list with budget tracking
  - Project detail with tabs (overview, categories, parts, timeline)
- **Responsive design** for desktop and tablet

#### API
- **RESTful API** with OpenAPI/Swagger documentation
- **Versioned endpoints** under `/api` prefix
- **Tenant-scoped** operations
- **Pagination support** for list endpoints
- **Export endpoints**
  - `GET /projects/:id/export/csv` - CSV export
  - `GET /projects/:id/export/summary` - JSON summary

#### Documentation
- **Development Guide** - Setup, workflow, best practices
- **API Documentation** - Comprehensive endpoint reference
- **Deployment Guide** - Production deployment instructions
- **Security Guide** - OWASP compliance and security practices
- **Contributing Guide** - Contribution guidelines

### Technical Details

#### Backend Stack
- NestJS 10.3
- TypeORM 0.3.19
- PostgreSQL 15+
- Passport.js with JWT
- Helmet, bcrypt, rate limiting

#### Frontend Stack
- React 18.2
- Material-UI 5.15
- Redux Toolkit 2.0
- React Query 5.17
- Vite 5.0

#### Database Schema
- 11 core entities
- Multi-tenant with tenant ID on all records
- Soft delete support
- Timestamps and audit fields

### Security
- Transport encryption (HTTPS)
- Encryption at rest support
- JWT token expiration (7 days default)
- Rate limiting per IP
- Input validation with class-validator
- Role-based authorization
- Activity logging for security events

### Deployment
- Cloud-ready architecture
- Docker and Docker Compose
- Environment-based configuration
- Health check endpoints
- Horizontal scaling support

## [Unreleased]

### Planned for Phase 2
- Disassembly workflow with step-by-step photos
- Client-facing portal for shops
- Enhanced collaboration features
- Calendar view for tasks and milestones
- Email notifications
- User invitations and team management
- Public build pages (optional)
- Advanced analytics and benchmarking

### Planned for Phase 3
- Parts catalog integrations
- Accounting system integrations (QuickBooks, Xero)
- Cloud storage integrations (Drive, Dropbox)
- Mobile app (iOS/Android)
- Advanced scheduling and resource planning
- Build templates
- Community features

## Notes

### Breaking Changes
None - this is the initial release.

### Migration Notes
- First release - no migrations needed
- See DEVELOPMENT.md for initial setup

### Known Issues
- Media upload uses mock signed URLs (production requires AWS S3 configuration)
- No email notifications yet
- Limited mobile optimization

### Contributors
Thanks to all contributors who made this release possible!

---

For detailed upgrade instructions, see [DEPLOYMENT.md](docs/DEPLOYMENT.md)
For development setup, see [DEVELOPMENT.md](docs/DEVELOPMENT.md)
