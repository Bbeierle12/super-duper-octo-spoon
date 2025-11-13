# DreamBuildDrive 2.0

Modern, cloud-based project planning platform for automotive builds and restorations.

## Mission

Help enthusiasts and shops plan, budget, and document vehicle builds in a way that's:
- **Realistic** (true cost & timeline visibility)
- **Collaborative** (builders, shops, and owners aligned)
- **Searchable & reusable** (lessons and setups you can reapply to future builds)

## Target Audience

- **Primary**: DIY gearheads doing full restorations, restomods, pro-touring, off-road and drift builds
- **Secondary**: Small to mid-size specialty shops, content creators, education programs

## Technology Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with TypeORM
- **Authentication**: Passport.js with JWT
- **Storage**: S3-compatible object storage
- **Security**: OWASP-aligned (Helmet, bcrypt, rate limiting)

### Frontend
- **Framework**: React (TypeScript)
- **UI Library**: Material-UI
- **State Management**: Redux Toolkit
- **Data Fetching**: React Query
- **Routing**: React Router

### Infrastructure
- **Containerization**: Docker
- **Development**: Docker Compose
- **Cloud-Ready**: AWS/GCP/Azure compatible

## Project Structure

```
dreambuild-drive/
├── backend/           # NestJS API server
│   ├── src/
│   │   ├── auth/      # Authentication & authorization
│   │   ├── projects/  # Project management
│   │   ├── parts/     # Parts & cost tracking
│   │   ├── media/     # Media & document management
│   │   ├── analytics/ # Analytics & reporting
│   │   └── common/    # Shared utilities
│   └── test/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── public/
└── docker/            # Docker configuration
```

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- PostgreSQL >= 14
- Docker (optional, for containerized development)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd dreambuild-drive
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your configuration
```

4. Set up the database:
```bash
npm run db:migrate --workspace=backend
npm run db:seed --workspace=backend
```

5. Start development servers:
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Building for Production
```bash
npm run build
```

## Security

This application follows OWASP security best practices:
- OWASP Top 10 risk mitigation
- Application Security Verification Standard (ASVS) compliance
- Transport encryption (HTTPS)
- Encryption at rest for sensitive data
- Multi-tenant data isolation
- Role-based access control (RBAC)

## Roadmap

- **Phase 1 (MVP)**: Planning & budgeting, basic cost tracking, photo uploads
- **Phase 2**: Multi-tenant SaaS, collaboration, advanced reporting
- **Phase 3**: Labor & vendor modules, scheduling, benchmarking
- **Phase 4**: Integrations, public build pages, microservice extraction

## License

Proprietary - All rights reserved

## Support

For issues and feature requests, please contact support or open an issue in the repository.
