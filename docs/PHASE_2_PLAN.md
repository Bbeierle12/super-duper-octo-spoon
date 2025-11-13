# DreamBuildDrive 2.0 - Phase 2 Implementation Plan

## Overview

Phase 2 transforms the MVP into a fully-featured, multi-user SaaS platform with enhanced collaboration, client portals, and production-grade workflows.

**Timeline:** Phase 2 Release
**Status:** In Progress
**Goal:** Enable shops to manage multiple team members, invite clients, and provide professional client-facing features.

---

## Phase 2 Feature Set

### 1. Member Management (High Priority) ✅ STARTING

**User Stories:**
- As a shop owner, I can invite team members to join my garage
- As an admin, I can change member roles and manage access
- As a member, I can accept invitations via email
- As an owner, I can remove members who no longer need access

**Features:**
- Member invitation system with email notifications
- Role management (promote/demote members)
- Invitation acceptance flow
- Member removal with confirmation
- Member activity tracking

**Endpoints:**
```
POST   /tenants/:id/members/invite
GET    /tenants/:id/members
PATCH  /tenants/:id/members/:memberId/role
DELETE /tenants/:id/members/:memberId
POST   /invitations/:token/accept
```

**Entities:**
- ✅ Membership (already created)
- Invitation (new)

---

### 2. Password Reset (High Priority) ✅ STARTING

**User Stories:**
- As a user, I can request a password reset via email
- As a user, I receive a secure reset link
- As a user, I can set a new password using the reset token

**Features:**
- Password reset request endpoint
- Email with secure reset token (30-minute expiration)
- Token validation
- New password setting

**Endpoints:**
```
POST /auth/request-password-reset
POST /auth/reset-password
```

**Entities:**
- PasswordResetToken (new)

---

### 3. Email Notifications (High Priority) ✅ STARTING

**User Stories:**
- As a user, I receive email when invited to a garage
- As a user, I receive password reset emails
- As a user, I can configure notification preferences (Phase 2.1)

**Features:**
- Email service abstraction (SendGrid/SES compatible)
- Email templates for:
  - Member invitation
  - Password reset
  - Welcome email
  - Project updates (optional)

**Implementation:**
- EmailService with template rendering
- Queue-based sending (optional background jobs)
- Environment-based SMTP/API configuration

---

### 4. Permission Enforcement (High Priority) ✅ STARTING

**User Stories:**
- As a viewer, I cannot modify projects or parts
- As a member, I cannot manage billing or delete projects
- As an admin, I can manage projects but not billing

**Features:**
- Apply @RequirePermissions decorator to all sensitive endpoints
- Return 403 Forbidden for unauthorized actions
- Consistent error messages

**Endpoints to Protect:**
- Projects: CREATE, EDIT, DELETE, ARCHIVE
- Parts: ADD, EDIT, DELETE, EDIT_COSTS
- Categories: MANAGE
- Labor: MANAGE
- Tasks: MANAGE, ASSIGN
- Media: UPLOAD, DELETE
- Tenant: EDIT, MANAGE_MEMBERS, BILLING

---

### 5. Client Portal (Medium Priority)

**User Stories:**
- As a shop, I can give clients read-only access to their project
- As a client, I can view project progress and costs
- As a client, I can approve change orders (Phase 2.1)

**Features:**
- Client role (read-only, project-specific)
- Client invitation flow
- Simplified client view (no editing)
- Optional: Change order approval workflow

**Endpoints:**
```
POST   /projects/:id/invite-client
GET    /client-portal/projects/:id
```

---

### 6. Enhanced UI Components (Medium Priority)

**Features:**
- **Parts Tab Enhancement:**
  - Left-side category selector with filtering
  - Parts table with inline editing
  - Item detail side drawer with photos
  - Cost variance highlighting

- **Task Calendar:**
  - Month/week view with react-big-calendar
  - Drag-and-drop task scheduling
  - Task status updates from calendar
  - Filter by category/assignee

- **Media Gallery:**
  - Grid/list toggle
  - Lightbox preview
  - Drag-and-drop upload
  - Tagging and search

**Components:**
```
frontend/src/components/
├── parts/
│   ├── CategorySidebar.tsx
│   ├── PartsTable.tsx
│   └── ItemDetailDrawer.tsx
├── tasks/
│   ├── TaskCalendar.tsx
│   └── TaskListView.tsx
└── media/
    ├── MediaGrid.tsx
    ├── MediaList.tsx
    └── MediaLightbox.tsx
```

---

### 7. Multi-Tenant per User (Medium Priority)

**User Stories:**
- As a user, I can be a member of multiple garages
- As a user, I can switch between garages
- As a user, I see a tenant selector in the header

**Features:**
- User can belong to multiple tenants
- Tenant switcher in UI
- Current tenant stored in local storage
- API accepts tenant context per request

**Changes:**
- User-Membership relationship (already exists)
- GET /auth/me returns list of tenants
- Frontend tenant switcher component

---

## Implementation Order

### Week 1: Backend Core Features
1. ✅ Member management endpoints
2. ✅ Password reset flow
3. ✅ Email service infrastructure
4. ✅ Permission enforcement on all endpoints

### Week 2: Client Portal & Multi-Tenancy
5. Client portal endpoints
6. Client invitation flow
7. Multi-tenant user support
8. Tenant switcher API

### Week 3: Frontend Enhancements
9. Member management UI
10. Parts tab with category sidebar
11. Item detail drawer
12. Task calendar view

### Week 4: Polish & Testing
13. Media gallery enhancements
14. Email template design
15. Integration testing
16. Documentation updates

---

## Technical Architecture

### Email Service
```typescript
@Injectable()
export class EmailService {
  async sendInvitation(email: string, inviteToken: string): Promise<void>
  async sendPasswordReset(email: string, resetToken: string): Promise<void>
  async sendWelcome(email: string, name: string): Promise<void>
}
```

### Invitation Flow
```
1. Owner clicks "Invite Member"
2. POST /tenants/:id/members/invite { email, role }
3. System creates Invitation with token
4. Email sent with invitation link
5. User clicks link, redirected to /invitations/:token
6. If no account: Register + accept invitation
7. If has account: Accept invitation
8. Membership created
```

### Permission Enforcement Pattern
```typescript
@Post()
@RequirePermissions(Permission.CREATE_PROJECT)
create(@CurrentUser() user, @Body() dto) {
  // Only users with CREATE_PROJECT permission can access
}
```

---

## Database Changes

### New Tables

**invitations**
- id (UUID)
- tenant_id (UUID) → tenants
- email (string)
- role (enum)
- token (string, unique)
- expires_at (timestamp)
- accepted_at (timestamp, nullable)
- invited_by_user_id (UUID) → users
- created_at (timestamp)

**password_reset_tokens**
- id (UUID)
- user_id (UUID) → users
- token (string, unique)
- expires_at (timestamp)
- used_at (timestamp, nullable)
- created_at (timestamp)

### Modified Tables

**users**
- Add: email_verified (boolean, default false)
- Add: notification_preferences (jsonb, nullable)

---

## API Additions

### Member Management
```
POST   /tenants/:tenantId/members/invite
       Body: { email, role }
       Returns: { invitation }

GET    /tenants/:tenantId/members
       Returns: [{ user, role, membership }]

PATCH  /tenants/:tenantId/members/:membershipId/role
       Body: { role }
       Returns: { membership }

DELETE /tenants/:tenantId/members/:membershipId
       Returns: { success }
```

### Invitations
```
GET    /invitations/:token
       Returns: { invitation details }

POST   /invitations/:token/accept
       Body: { } or { password, name } if new user
       Returns: { user, token }
```

### Password Reset
```
POST   /auth/request-password-reset
       Body: { email }
       Returns: { success: true }

POST   /auth/reset-password
       Body: { token, newPassword }
       Returns: { success: true }
```

---

## Security Considerations

1. **Invitation Tokens**
   - Cryptographically secure random tokens
   - 7-day expiration
   - One-time use only
   - Email verification

2. **Password Reset Tokens**
   - 30-minute expiration
   - One-time use only
   - Invalidate all sessions on password change

3. **Permission Enforcement**
   - Server-side validation on every endpoint
   - No client-side permission bypass
   - Audit log for permission denials

4. **Email Security**
   - Rate limiting on email sends
   - SPF/DKIM configured
   - Unsubscribe links (future)

---

## Testing Strategy

### Unit Tests
- Permission service logic
- Email template rendering
- Token generation and validation
- Invitation acceptance flow

### Integration Tests
- Complete invitation workflow
- Password reset end-to-end
- Member management operations
- Permission enforcement on endpoints

### E2E Tests
- Shop owner invites member
- Member accepts and logs in
- Viewer cannot edit projects
- Client views project

---

## Deployment Considerations

1. **Environment Variables**
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=your-api-key
   FROM_EMAIL=noreply@dreambuildrive.com
   FRONTEND_URL=https://app.dreambuildrive.com
   ```

2. **Email Templates**
   - HTML + plain text versions
   - Responsive design
   - Brand colors and logo

3. **Background Jobs**
   - Optional: Bull queue for emails
   - Retry logic for failed sends
   - Email delivery monitoring

---

## Success Metrics

**Phase 2 Goals:**
- ✅ 100% permission enforcement coverage
- ✅ Email delivery success rate > 95%
- ✅ Invitation acceptance rate > 80%
- ✅ Zero unauthorized access incidents
- ✅ Client portal adoption by 50% of shops
- ✅ Average team size: 3-5 members per shop

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Email deliverability issues | High | Use reputable ESP (SendGrid/SES), configure SPF/DKIM |
| Permission bypass vulnerabilities | Critical | Comprehensive testing, security audit |
| Invitation token leaks | Medium | Short expiration, one-time use, secure generation |
| UI complexity increase | Medium | User testing, simplified workflows |

---

## Phase 2 Completion Criteria

- ✅ All high-priority features implemented and tested
- ✅ Permission enforcement on 100% of sensitive endpoints
- ✅ Email notifications working in production
- ✅ Member management fully functional
- ✅ Client portal operational
- ✅ UI enhancements deployed
- ✅ Documentation updated
- ✅ Security audit passed
- ✅ Performance testing completed

---

## Next Steps

1. Implement invitation system
2. Add password reset flow
3. Create email service
4. Enforce permissions on all endpoints
5. Build client portal
6. Enhance frontend UI
7. Test and deploy

**Estimated Completion:** 4 weeks from start
**Current Progress:** Starting Phase 2 implementation
