# Development Guide

## Prerequisites

- Node.js >= 18.0.0
- PostgreSQL >= 14
- Docker and Docker Compose (optional)
- Git

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd dreambuild-drive
```

### 2. Environment Setup

Create environment files for both backend and frontend:

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

Edit the `.env` files with your local configuration.

### 3. Database Setup

#### Option A: Using Docker

```bash
docker-compose up -d postgres
```

#### Option B: Local PostgreSQL

Create a database:

```sql
CREATE DATABASE dreambuild_dev;
CREATE USER dreambuild WITH PASSWORD 'changeme';
GRANT ALL PRIVILEGES ON DATABASE dreambuild_dev TO dreambuild;
```

### 4. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 5. Database Migrations

```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: seed with sample data
```

### 6. Start Development Servers

#### Option A: Using npm workspaces (recommended)

```bash
# From project root
npm run dev
```

This will start both backend and frontend concurrently.

#### Option B: Individual servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- API Documentation: http://localhost:3001/api/docs

## Development Workflow

### Code Structure

```
dreambuild-drive/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication & authorization
│   │   ├── tenants/        # Multi-tenant management
│   │   ├── projects/       # Project management
│   │   ├── categories/     # Category system
│   │   ├── parts/          # Parts & cost tracking
│   │   ├── labor/          # Labor & vendor management
│   │   ├── tasks/          # Task management
│   │   ├── media/          # Media & documents
│   │   ├── analytics/      # Analytics & reporting
│   │   ├── common/         # Shared utilities
│   │   └── database/       # Database configuration
│   └── test/               # Tests
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store
│   │   └── hooks/          # Custom hooks
│   └── public/             # Static assets
└── docs/                   # Documentation
```

### Backend Development

#### Creating a New Module

```bash
cd backend
nest generate module <module-name>
nest generate controller <module-name>
nest generate service <module-name>
```

#### Creating Database Entities

All entities should extend `TenantBaseEntity` for multi-tenant support:

```typescript
import { Entity, Column } from 'typeorm';
import { TenantBaseEntity } from '../common/entities/base.entity';

@Entity('table_name')
export class MyEntity extends TenantBaseEntity {
  @Column()
  name: string;
}
```

#### Running Tests

```bash
cd backend
npm test              # Unit tests
npm run test:watch    # Watch mode
npm run test:cov      # Coverage
npm run test:e2e      # End-to-end tests
```

### Frontend Development

#### Creating Components

Use functional components with TypeScript:

```typescript
import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface MyComponentProps {
  title: string;
}

const MyComponent: FC<MyComponentProps> = ({ title }) => {
  return (
    <Box>
      <Typography variant="h5">{title}</Typography>
    </Box>
  );
};

export default MyComponent;
```

#### State Management

Use Redux Toolkit for global state:

```typescript
// Create slice
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'myFeature',
  initialState,
  reducers: {
    myAction: (state, action: PayloadAction<MyType>) => {
      // Update state
    },
  },
});

export const { myAction } = mySlice.actions;
export default mySlice.reducer;
```

#### API Integration

Use React Query for server state:

```typescript
import { useQuery } from '@tanstack/react-query';
import { projectsAPI } from '../services/api';

const { data, isLoading, error } = useQuery({
  queryKey: ['projects'],
  queryFn: () => projectsAPI.getAll(),
});
```

### Linting and Formatting

```bash
# Backend
cd backend
npm run lint
npm run format

# Frontend
cd frontend
npm run lint
npm run format
```

## Docker Development

Start all services with Docker Compose:

```bash
docker-compose up
```

Rebuild after code changes:

```bash
docker-compose up --build
```

Stop all services:

```bash
docker-compose down
```

## Troubleshooting

### Port Already in Use

If ports 3000 or 3001 are in use, you can change them in:
- Backend: `backend/.env` (PORT variable)
- Frontend: `frontend/vite.config.ts` (server.port)

### Database Connection Issues

1. Ensure PostgreSQL is running
2. Verify credentials in `backend/.env`
3. Check if database exists

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Or use Docker to ensure clean environment
docker-compose down -v
docker-compose up --build
```

## Best Practices

1. **Always use TypeScript** - No `any` types without good reason
2. **Write tests** - Aim for >80% coverage
3. **Follow SOLID principles** - Keep code modular and maintainable
4. **Use environment variables** - Never hardcode secrets
5. **Validate input** - Use DTOs and class-validator
6. **Handle errors** - Use try-catch and proper error responses
7. **Document complex logic** - Add comments for non-obvious code
8. **Keep commits atomic** - One logical change per commit
9. **Write meaningful commit messages** - Follow conventional commits

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/my-feature

# Create pull request
```

## Additional Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [React Documentation](https://react.dev/)
- [Material-UI Documentation](https://mui.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
