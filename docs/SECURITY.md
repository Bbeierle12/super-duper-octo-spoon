# Security Guide

## Overview

DreamBuildDrive 2.0 follows security best practices aligned with OWASP standards and modern application security guidelines.

## OWASP Top 10 Compliance

### A01:2021 – Broken Access Control

**Mitigations:**
- Multi-tenant data isolation at database level
- Row-level security with tenantId on all queries
- JWT-based authentication
- Role-based access control (RBAC)
- Server-side authorization checks on all endpoints
- Tenant guard prevents cross-tenant data access

**Implementation:**
```typescript
@UseGuards(AuthGuard('jwt'), TenantGuard)
export class ProjectsController {
  // All methods automatically filtered by tenantId
}
```

### A02:2021 – Cryptographic Failures

**Mitigations:**
- HTTPS/TLS for all communications
- Bcrypt for password hashing (12 rounds in production)
- JWT tokens with strong secrets
- Encryption at rest for sensitive data
- Secure session management
- No sensitive data in URLs

**Configuration:**
```typescript
// Password hashing
const hashedPassword = await bcrypt.hash(password, 12);

// JWT configuration
JWT_SECRET=min-32-character-random-string
JWT_EXPIRES_IN=7d
```

### A03:2021 – Injection

**Mitigations:**
- TypeORM parameterized queries (prevents SQL injection)
- Input validation with class-validator
- DTO validation on all endpoints
- XSS prevention through React automatic escaping
- Content Security Policy headers

**Example:**
```typescript
export class CreateProjectDto {
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  name: string;

  @IsNumber()
  @Min(0)
  totalBudget: number;
}
```

### A04:2021 – Insecure Design

**Mitigations:**
- Secure by design architecture
- Threat modeling during design
- Multi-tenant isolation patterns
- Separation of concerns
- Principle of least privilege
- Defense in depth

### A05:2021 – Security Misconfiguration

**Mitigations:**
- Helmet.js for security headers
- CORS properly configured
- Environment-specific configurations
- No default credentials
- Error messages don't leak sensitive info
- Swagger disabled in production

**Headers:**
```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

### A06:2021 – Vulnerable Components

**Mitigations:**
- Regular dependency updates
- Automated vulnerability scanning (npm audit)
- Lock files for reproducible builds
- Minimal dependencies
- Security-focused package selection

**Commands:**
```bash
npm audit
npm audit fix
npm outdated
```

### A07:2021 – Authentication Failures

**Mitigations:**
- Strong password requirements (min 8 chars)
- Secure password storage (bcrypt)
- JWT token expiration
- No password in logs or URLs
- Account lockout after failed attempts (recommended)
- Password reset with secure tokens

**Password Policy:**
```typescript
@MinLength(8)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
  message: 'Password must contain uppercase, lowercase, and number',
})
password: string;
```

### A08:2021 – Software and Data Integrity Failures

**Mitigations:**
- Signed commits
- CI/CD pipeline validation
- Package integrity verification (package-lock.json)
- Database migrations versioned
- Code review process
- Automated testing

### A09:2021 – Logging and Monitoring

**Mitigations:**
- Comprehensive logging
- Security event logging
- Error tracking (Sentry recommended)
- Audit trails for sensitive operations
- Health check endpoints
- Monitoring and alerting

**Logging:**
```typescript
logger.log('User login', { userId, tenantId, timestamp });
logger.error('Failed authentication', { email, reason });
```

### A10:2021 – Server-Side Request Forgery (SSRF)

**Mitigations:**
- Input validation for URLs
- Whitelist of allowed domains
- Network segmentation
- No user-controlled URLs without validation

## Authentication & Authorization

### JWT Token Security

**Best Practices:**
- Strong secret (min 32 characters)
- Short expiration time (7 days default)
- Secure storage (httpOnly cookies recommended for web)
- Token refresh mechanism
- Logout invalidation

### Multi-Tenant Security

**Data Isolation:**
```typescript
// All queries automatically scoped by tenantId
const projects = await this.projectsRepository.find({
  where: { tenantId },
});

// Middleware ensures tenantId is from authenticated user
request.tenantId = user.tenantId;
```

**Tenant Guard:**
```typescript
@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.tenantId = request.user.tenantId;
    return true;
  }
}
```

## Input Validation

### Backend Validation

All DTOs use class-validator:

```typescript
export class CreatePartDto {
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name: string;

  @IsNumber()
  @Min(0)
  @Max(1000000)
  listPrice: number;

  @IsUUID()
  categoryId: string;
}
```

### Frontend Validation

Use React Hook Form with Zod:

```typescript
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
```

## Rate Limiting

**Configuration:**
```typescript
ThrottlerModule.forRoot({
  ttl: 60,      // 60 seconds
  limit: 100,   // 100 requests per window
}),
```

**Per-route limits:**
```typescript
@Throttle(10, 60)  // 10 requests per minute
@Post('login')
async login() { }
```

## CORS Configuration

```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

## Database Security

### Connection Security

- Use SSL/TLS for database connections
- Secure credentials in environment variables
- Connection pooling with limits
- Read replicas for sensitive operations

### Query Security

```typescript
// ✅ Safe - parameterized query
const user = await this.usersRepository.findOne({
  where: { email },
});

// ❌ Unsafe - never use raw queries with user input
const users = await this.usersRepository.query(
  `SELECT * FROM users WHERE email = '${email}'`
);
```

## File Upload Security

**Validation:**
- File type whitelist
- File size limits
- Virus scanning (recommended)
- Separate storage domain
- Signed URLs for access

```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

if (!ALLOWED_TYPES.includes(file.mimetype)) {
  throw new BadRequestException('Invalid file type');
}

if (file.size > MAX_SIZE) {
  throw new BadRequestException('File too large');
}
```

## Environment Variables

**Security Rules:**
1. Never commit `.env` files
2. Use strong, random values
3. Rotate secrets regularly
4. Different secrets per environment
5. Use secret management (AWS Secrets Manager, etc.)

**Required Security Variables:**
```env
# Strong random string, min 32 characters
JWT_SECRET=

# Strong database password
DB_PASSWORD=

# AWS credentials (use IAM roles if possible)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
```

## Security Headers

```typescript
// Helmet configuration
app.use(helmet());

// Custom headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
```

## Audit Logging

Log security-relevant events:

```typescript
// Authentication events
logger.log('User login', { userId, tenantId, ip, userAgent });
logger.warn('Failed login attempt', { email, ip, reason });

// Authorization events
logger.warn('Unauthorized access attempt', { userId, resource, action });

// Data changes
logger.log('Project created', { userId, projectId, tenantId });
logger.log('Budget updated', { userId, projectId, oldValue, newValue });
```

## Incident Response

### Detection

- Monitor failed authentication attempts
- Alert on unusual patterns
- Track API rate limit violations
- Monitor for SQL injection attempts

### Response

1. Identify the incident
2. Contain the threat
3. Investigate the cause
4. Remediate vulnerabilities
5. Document and learn

## Security Testing

### Automated Testing

```bash
# Dependency vulnerabilities
npm audit

# Security linting
npm run lint

# Unit tests with security focus
npm test
```

### Manual Testing

- Penetration testing (quarterly recommended)
- Code review with security focus
- Threat modeling sessions
- Security configuration review

## Compliance

### Data Protection

- GDPR compliance considerations
- Data retention policies
- User data deletion
- Privacy by design

### Multi-Tenant Compliance

- Data isolation verification
- Tenant-level backup/restore
- Per-tenant data export
- Compliance reporting

## Security Checklist

- [ ] All endpoints require authentication
- [ ] Tenant isolation verified
- [ ] Input validation on all inputs
- [ ] Output encoding/escaping
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Passwords hashed with bcrypt
- [ ] JWT secrets are strong and secret
- [ ] SQL injection prevented (TypeORM)
- [ ] XSS prevented (React)
- [ ] CSRF protection (if using cookies)
- [ ] File upload validation
- [ ] Error messages don't leak info
- [ ] Logging doesn't contain secrets
- [ ] Dependencies up to date
- [ ] Secrets in environment variables
- [ ] Database backups configured
- [ ] Monitoring and alerting set up

## Reporting Security Issues

To report a security vulnerability:
1. **Do not** create a public GitHub issue
2. Email: security@yourdomain.com
3. Include detailed description
4. Include steps to reproduce
5. Allow 90 days for response

We follow responsible disclosure practices and will acknowledge receipt within 48 hours.
