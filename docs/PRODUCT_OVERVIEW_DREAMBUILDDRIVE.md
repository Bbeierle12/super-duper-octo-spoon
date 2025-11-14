# DreamBuildDrive 2.0 – Product & Website Overview

This document describes the intended behavior, structure, and major screens/tabs of the DreamBuildDrive 2.0 web application. It is meant to act as an authoritative, implementation‑agnostic product spec for engineering, design, and stakeholders.

---

## 1. Product Summary

**DreamBuildDrive** is a multi‑tenant SaaS platform for managing custom automotive builds and shop projects. It helps shops and serious builders manage:

- Projects and vehicles
- Budgets and costs (parts + labor)
- Tasks, schedules, and timelines
- Vendors and purchase orders
- Media and documentation
- Client collaboration and approvals
- Analytics, reporting, and (future) intelligent assistance

The primary users are:

- **Shop Owners / Garage Owners** – manage projects, team, and clients
- **Admins / Managers** – oversee budgets, schedules, and operations
- **Team Members / Technicians** – execute tasks, log time, update progress
- **Viewers** – read‑only internal stakeholders
- **Clients** – external, project‑limited, read‑only or approval‑only users


---

## 2. Global App Structure & Navigation

DreamBuildDrive runs as a single‑page application with:

- **App Shell / Layout** containing:
  - Top header with logo, tenant selector, and user menu
  - Left navigation (or top navigation tabs) for high‑level areas
  - Main content area showing the current page/tab
  - Contextual right‑hand drawers/panels for details

### 2.1 Top Header

The global header appears on all authenticated pages and includes:

- **Logo & Product Name** – links to the Garage Dashboard.
- **Tenant/Garage Selector** (Phase 2):
  - Shows current tenant/garage name.
  - Dropdown listing all tenants the user is a member of.
  - On change, the app switches context and reloads tenant‑scoped data.
- **Global Navigation (high‑level)**:
  - `Dashboard`
  - `Projects`
  - `Vendors` (Phase 3)
  - `Analytics` / `Reports`
  - `Settings`
- **User Menu**:
  - `My Profile`
  - `Sign Out`
  - Future: Notification preferences, language, theme.

### 2.2 Left Navigation / Secondary Navigation

Depending on the current area, a sidebar or tab strip provides secondary navigation:

- On **Projects**: list view vs board (future), search filters.
- On a **Project Detail** page: inner tabs such as Overview, Parts & Costs, Labor & Vendors, Tasks, Media, Activity, Change Orders.
- On **Settings**: sections such as Tenant, Members, Billing, Integrations, Localization.

### 2.3 Authentication & Public Pages

#### 2.3.1 Public / Marketing (High‑Level Concept)

While not fully specified in the repo, the marketing site will typically include:

- Landing page explaining DreamBuildDrive value props.
- Pricing and plan tiers.
- Feature overview and screenshots.
- Signup CTA linking into the app’s registration.

This document focuses on the authenticated app.

#### 2.3.2 Auth Screens

- **Login Page**
  - Email and password form.
  - Link to password reset.
- **Register Page**
  - Email, name, password.
  - Optional: tenant/garage name on signup.
- **Password Reset Flow** (Phase 2)
  - `Request Reset` page: user enters email, receives reset link.
  - `Reset Password` page: user enters new password using token from email.

Authentication is JWT‑based; logout is handled by clearing tokens client‑side.


---

## 3. Primary Top‑Level Areas (Tabs / Sections)

For authenticated users, the main navigation includes:

1. **Garage Dashboard (Home)**
2. **Projects**
   - Project list
   - Project detail with inner tabs:
     - Overview
     - Parts & Costs
     - Labor & Vendors
     - Tasks & Calendar
     - Media & Documents
     - Activity (Audit Log & Comments)
     - Change Orders (Phase 3)
3. **Vendors & Purchase Orders** (Phase 3)
4. **Analytics & Reporting**
5. **Labor & Time Tracking** (Phase 3)
6. **Client Portal** (external, project‑specific, Phase 2)
7. **Tenant / Garage Settings**
8. **Integrations & Workflows** (Phase 4)
9. **Marketplace & Community** (Phase 4)
10. **Admin / Security / Localization** (Phase 3–4, esp. enterprise)

Each area is detailed below.


---

## 4. Garage Dashboard (Home)

**Purpose:** Portfolio‑level overview of the tenant/garage: key metrics, project list, and recent activity.

### 4.1 Key Components

- **Header / Action Bar:**
  - Current tenant/garage name.
  - Primary CTA: `New Project`.
- **Metric Cards / Widgets:**
  - Total projects.
  - Active vs completed projects.
  - Total budget vs total spend (sum across projects).
  - Open tasks count (pending full calculation).
  - Budget health indicator (green/yellow/red based on thresholds, Phase 3).
- **Project List/Table:**
  - Columns: project name, vehicle, status, budget vs spent, target completion.
  - Filters: status (Active, Completed, On Hold, Archived), date range, budget status (over/under).
  - Sorting: created date, due date, budget, status.
- **Portfolio Analytics (Phase 3):**
  - Monthly spend trend chart (parts vs labor).
  - Projects over/under budget summary.
  - Task completion rate overview.
  - Labor vs parts cost breakdown.
- **Recent Activity Panel:**
  - List of recent actions across all projects.
  - Each entry links to the underlying project/entity.


---

## 5. Projects Area

### 5.1 Projects List Page

**Purpose:** View and manage all projects within the current tenant.

**Contents:**

- **Project List/Table or Cards:**
  - Data shown per project:
    - Project name
    - Vehicle info: make, model, year, trim (trim planned)
    - Project goal(s)
    - Status (planned, active, on hold, completed, archived)
    - Budget vs spent, variance (absolute and %)
    - Start date, target completion date
  - Visual indicators: progress bar, overdue flag.
- **Filters and Search:**
  - Search by name, vehicle, client.
  - Filter by status, date range, budget health, tags.
- **Actions:**
  - `New Project` button to open a creation form.
  - Bulk archive (future).

### 5.2 Project Detail Page Structure

Each project detail page includes a header and a series of inner tabs.

#### 5.2.1 Project Header

- **Primary fields:**
  - Project name
  - Vehicle details: make, model, year, trim (once implemented)
  - Project status
- **Key metrics:**
  - Total budget vs total spent
  - Remaining budget
  - Change order count and net adjustment (Phase 3)
  - Task summary (open/total)
- **Actions:**
  - Edit project details
  - Archive/Restore project
  - Invite client (client portal, Phase 2)
  - Export (CSV, summary PDF – Phase 3)

#### 5.2.2 Project Tabs Overview

Tabs within a project:

1. Overview
2. Parts & Costs
3. Labor & Vendors
4. Tasks & Calendar
5. Media & Documents
6. Activity (Audit Log & Comments)
7. Change Orders (Phase 3)

Each tab has a distinct purpose but shares navigation, filters, and layout conventions.


---

## 6. Project Tab: Overview

**Purpose:** Provide a concise but rich summary of project budget, schedule, and status.

### 6.1 Budget Summary

- Cards showing:
  - Planned budget
  - Actual spent
  - Remaining budget
  - Variance amount and percentage
  - Parts vs labor cost breakdown

### 6.2 Cost by Category

- Chart (bar or donut) showing:
  - Each project category (Body, Engine, Suspension, Interior, etc.)
  - Planned vs actual cost per category
  - Simple color coding for over/under budget

### 6.3 Schedule Snapshot

- Key dates:
  - Project start date
  - Target completion date
  - Important milestones
- Schedule health:
  - On track / at risk / delayed status
- Summary of upcoming due tasks.

### 6.4 Project Details

- Vehicle details (make, model, year, trim, VIN optionally).
- Goals array (e.g., horsepower target, build purpose).
- Client information (if attached).
- Notes and custom fields.

### 6.5 Recent Activity

- Last N activities across all entities in the project.
- Click‑through into Activity tab for full history.


---

## 7. Project Tab: Parts & Costs

**Purpose:** Central hub for all parts/items and their costs within a project.

### 7.1 Layout

- **Left‑Side Category Selector** (planned):
  - Displays categories with:
    - Name
    - Budget allocated
    - Actual spent
    - Remaining budget and variance indicator
  - Clicking a category filters the main parts table.

- **Main Parts Table:**
  - Columns (from `Part` entity and spec):
    - Name
    - Description
    - Category
    - Manufacturer
    - Part number
    - Vendor name
    - Vendor URL
    - Quantity
    - Unit (spec’d but not yet implemented field)
    - Projected unit cost
    - Actual unit cost
    - Estimated shipping
    - Actual shipping
    - Tax
    - Total projected cost (computed)
    - Total actual cost (computed)
    - Status (planned, ordered, received, installed)
    - Purchased date
    - Installed date
    - Critical path flag
  - Features:
    - Sorting and filtering by category, vendor, status.
    - Inline editing for critical fields (costs, quantity, status) in Phase 2.
    - Bulk actions (change status, assign vendor, export subset).

### 7.2 Item Detail Drawer (Planned)

- Opens on row click in the table.
- Shows:
  - Full part details and notes.
  - Associated media (photos, manuals, install instructions).
  - Linked tasks (work to install or verify the part).
  - Linked purchase orders and vendor details.
  - Change history for costs and status.
- Allows editing and linking/unlinking related items.

### 7.3 Category Budget Summary

- For selected category:
  - Budget allocated, actual spent, remaining budget, variance.
  - Small chart or bar showing usage.
- Optional aggregated metrics:
  - Number of parts, average variance per part.


---

## 8. Project Tab: Labor & Vendors

**Purpose:** Manage labor items and their costs, plus per‑project vendor involvement.

### 8.1 Labor Items Table

- Columns:
  - Description
  - Type (mechanical, body, paint, tuning, etc.)
  - Vendor or internal resource
  - Pricing model (hourly, fixed, mixed)
  - Estimated hours
  - Actual hours
  - Hourly rate
  - Estimated labor cost
  - Actual labor cost
  - Status
  - Scheduled start and end dates

### 8.2 Time Tracking Summary (Phase 3)

- Aggregated view of `TimeEntry` records per labor item/task:
  - Total hours logged
  - Total cost from logged time
- Drill‑down to individual time entries (user, date, notes).

### 8.3 Vendor Associations

- Vendors involved in this project:
  - Name, contact info
  - Total spend on this project
  - Number of POs and average delivery time
- Links to vendor detail pages in the Vendors area.

### 8.4 Labor Analytics (Phase 3)

- Labor vs parts cost comparison for this project.
- Labor cost variance vs initial estimates.
- Technician utilization metrics for this project.


---

## 9. Project Tab: Tasks & Calendar

**Purpose:** Track work to be done, who is doing it, and when.

### 9.1 Task List View (Planned)

- Columns:
  - Title
  - Description (optional preview)
  - Status (todo, in progress, blocked, done)
  - Priority
  - Due date
  - Assigned user
  - Related category and/or part
- Filters:
  - Status
  - Priority
  - Due date range
  - Assignee
  - Category
- Quick actions:
  - Change status
  - Assign/unassign
  - Edit title/description inline

### 9.2 Calendar View (Planned)

- Month/week calendar using a library such as `react-big-calendar`.
- Tasks displayed as events on their due dates.
- Drag‑and‑drop to update due dates.
- Filters by assignee and category.

### 9.3 Dependencies & Critical Path (Phase 3)

- Tasks can depend on other tasks (`dependsOnTaskId`).
- Visual indicators when a task is blocked.
- Integration with timeline/Gantt view for critical path.

### 9.4 Time Tracking Integration (Phase 3)

- Start/stop timer from a task card.
- Show accumulated hours for each task.
- Link to the Labor & Time Tracking summaries.


---

## 10. Project Tab: Media & Documents

**Purpose:** Centralized library of images, videos, and files for a project.

### 10.1 Filters and Search

- Filter by:
  - Type (image, video, document, other)
  - Tags (teardown, paint, dyno, etc.)
  - Category (body, engine, etc.)
  - Uploader
- Search by filename, tags, or description.

### 10.2 Views

- **Grid View:**
  - Thumbnails for images and key metadata on hover.
  - Infinite scroll or pagination.
- **List View:**
  - Rows with filename, type, tags, category, upload date, uploader.

### 10.3 Upload Flow

- Drag‑and‑drop area and file picker.
- Signed URL upload to S3‑compatible storage.
- Option to assign tags, category, and linked entities (project, task, part) at upload time.

### 10.4 Detail / Preview Panel

- For selected media:
  - Large preview where possible (image, some docs).
  - File metadata (size, type, upload date, uploader).
  - Linked entities (project, task, part, category).
  - Actions: rename, retag, reassign, delete.

### 10.5 Document Management Enhancements (Phase 3+)

- Document categories: manuals, receipts, invoices, wiring diagrams, dyno sheets, etc.
- Folder‑like grouping or virtual folders via tags.
- Improved document search (by type, tag, text – later via OCR).


---

## 11. Project Tab: Activity (Audit Log & Comments)

**Purpose:** Provide a complete history and conversation thread for the project.

### 11.1 Activity Feed

- Chronological list of actions:
  - Projects created/updated
  - Parts added/changed
  - Tasks created/updated/completed
  - Media uploads
  - Change orders created/approved/rejected
  - Permission or member changes (where relevant)
- Each activity shows:
  - Timestamp
  - Actor (user)
  - Action type and target entity
  - Short description / summary

### 11.2 Comments System (Phase 3)

- Threaded comments on:
  - Projects
  - Tasks
  - Parts
  - Change orders
- Features:
  - @mention team members
  - Rich text (basic formatting)
  - Attachments on comments
  - Notifications for mentions (via email/in‑app)


---

## 12. Project Tab: Change Orders (Phase 3)

**Purpose:** Track and approve changes to scope, budget, and timeline.

### 12.1 Change Order List

- Columns:
  - Change order ID
  - Title/summary
  - Type (scope addition, scope reduction, cost adjustment)
  - Status (draft, submitted, approved, rejected)
  - Created date
  - Approval date
  - Cost impact (delta in currency)

### 12.2 Change Order Detail View

- Contents:
  - Description of the change
  - Line items linking to parts/labor that are affected
  - Impact on budget and timeline
  - Comments and discussion
- Workflow actions:
  - Save as draft
  - Submit for internal approval
  - Client/owner approve or reject (if client portal enabled)
- Audit trail:
  - Who created/edited/approved
  - Timestamps and status changes

### 12.3 Integration with Project Metrics

- Aggregated metrics:
  - Count of approved change orders
  - Total net change in budget
  - Visualization of original vs revised budget over time


---

## 13. Vendors & Purchase Orders (Phase 3)

**Purpose:** Provide a centralized vendor directory and purchase order tracking system.

### 13.1 Vendors List Page

- List of all vendors for the tenant:
  - Name
  - Contact name, email, phone
  - Website
  - Specialties (e.g., paint, machine shop)
  - Rating
  - Total spend and count of POs
- Filters and search by name, specialty, rating, and location.

### 13.2 Vendor Detail Page

- Vendor profile:
  - All contact info
  - Specialties and notes
  - Tags (preferred, local, online, etc.)
- Linked data:
  - Parts purchased from this vendor
  - Purchase orders (with status and amounts)
- Metrics:
  - Total spend
  - Average delivery time
  - Order accuracy rate
  - Rating history

### 13.3 Purchase Orders Page

- PO list:
  - PO number
  - Vendor
  - Related project (optional)
  - Status (draft, pending, ordered, partially received, received, cancelled)
  - Order date
  - Expected delivery date
  - Actual delivery date
  - Total amount
- PO detail view:
  - Line items linked to parts
  - Notes field
  - Status transitions (with timestamps)


---

## 14. Analytics & Reporting

**Purpose:** Offer data‑driven insight at portfolio and project levels.

### 14.1 Analytics Dashboard

- Portfolio‑level metrics:
  - Total and active projects
  - Aggregate budget vs actual spend
  - Budget health overview (on/over/under)
- Charts:
  - Budget variance by project
  - Monthly spend trends (stacked by parts/labor)
  - Vendor performance summary (once vendor module is live)
  - Task completion rates over time

### 14.2 Project‑Level Analytics

- Budget variance:
  - Planned vs actual values
  - Category breakdown
  - Over‑budget items list
- Timeline analysis:
  - On‑time vs delayed tasks
  - Critical path information (Phase 3)

### 14.3 Reporting & Exports

- Export options per project:
  - CSV of parts, tasks, media metadata
  - Summary CSV (merged data)
  - Summary PDF report (Phase 3):
    - Photos, budget breakdown, milestones, change orders
- Advanced exports (Phase 3):
  - Excel workbook with tabs
  - Accounting exports (QuickBooks, etc.)
- Custom report builder (Phase 3+):
  - Form to select data range, filters, and fields
  - Save as reusable report template
  - Option to schedule recurring report emails


---

## 15. Labor & Time Tracking (Phase 3)

**Purpose:** Measure labor effort and cost across tasks and projects.

### 15.1 Labor Rates Setup

- Page to manage `LaborRate` definitions:
  - Name (e.g., "Standard Mechanic", "Paint Work")
  - Hourly rate
  - Effective start and end date
  - Active/inactive flag

### 15.2 Time Entry Logging

- UI to log time against tasks:
  - Choose task
  - Start/stop timer or manual duration entry
  - Select labor rate
  - Optional notes
- Permissions control over editing/deleting time entries.

### 15.3 Labor Summary

- Per project:
  - Total estimated vs actual hours
  - Labor cost variance
  - Breakdown by category and by user
- Per user (optional view):
  - Hours logged by time period
  - Distribution across projects and categories


---

## 16. Client Portal (Phase 2)

**Purpose:** Provide clients with a clean, read‑only view of their build, plus approvals.

### 16.1 Client Access

- Clients are invited to specific projects.
- Client role is restricted to read‑only data within those projects and specific approval actions.

### 16.2 Client‑Facing Project Summary

- Simplified page showing:
  - Project name and vehicle info
  - Status and key dates
  - High‑level budget summary
  - Progress summary (e.g., percentage completed, milestones)
- Optional timeline or milestone list.

### 16.3 Read‑Only Tabs

- View‑only versions of:
  - Tasks/progress summary
  - Selected media/photos
  - Approved change orders

### 16.4 Approvals

- Change order approval workflow (Phase 2.1):
  - List of change orders awaiting client approval
  - Approve/reject actions with optional notes


---

## 17. Tenant / Garage Settings

**Purpose:** Manage global configuration and membership for a tenant.

### 17.1 Tenant Profile

- Fields:
  - Tenant/garage name
  - Logo
  - Contact email and phone
  - Plan (FREE, PRO, SHOP, ENTERPRISE)
  - Status (active/inactive)
  - Basic configuration flags and limits

### 17.2 Members & Roles (Phase 2)

- Member list:
  - Name, email
  - Role (Owner, Admin, Member, Viewer, Client)
  - Status (active, invited, deactivated)
- Actions:
  - Invite member (email + role)
  - Change role
  - Remove/deactivate member
- Invitation flow:
  - Owner/Admin invites → invitation record created → email sent → user registers or accepts → membership created.

### 17.3 Subscription & Billing (Phase 2+)

- Plan details and current limits.
- Billing history and invoices.
- Payment method management.
- Upgrade/downgrade plan actions.

### 17.4 Notification Settings (Future)

- Tenant‑wide defaults for notifications.
- Per‑user overrides (potentially under user profile instead).


---

## 18. Integrations & Workflow Automation (Phase 4)

**Purpose:** Connect DreamBuildDrive to external services and automate repetitive work.

### 18.1 Integrations Page

- List of available integrations:
  - Parts suppliers (Summit Racing, Jegs, RockAuto, etc.)
  - Accounting (QuickBooks Online, Xero)
  - Communication (Slack, Teams, Twilio)
  - Storage (S3, Google Drive, Dropbox)
  - Calendar (Google, Outlook)
  - Automation (Zapier, IFTTT)
- For each integration:
  - Status: connected/disconnected
  - Connect or disconnect button
  - Basic configuration (e.g., default account, sync options)

### 18.2 Supplier Integrations

- Search supplier catalogs from within the parts UI.
- Import supplier parts directly into a project’s Parts & Costs.
- Pull live pricing and stock where possible.

### 18.3 Accounting Integrations

- Sync project financials to accounting systems.
- Create invoices/income records based on project data.

### 18.4 Workflow Automation

- Visual designer or configuration UI for workflows:
  - Triggers: project created, budget exceeded, timeline delay, task completed, etc.
  - Actions: create task, send email/Slack message, call webhook, update status.
  - Conditions: simple rules on project/task attributes.
- Workflow list:
  - Name, trigger, enabled flag, last run time.
- Execution logs for debugging.


---

## 19. Marketplace & Community (Phase 4)

**Purpose:** Extend beyond internal tooling into a community and commerce platform.

### 19.1 Shop Marketplace

- Public or semi‑public directory of shops:
  - Shop profile pages with services, pricing, location, and specialties.
  - Reviews and ratings.
- Search and filters:
  - Location, specialties, rating, price range.

### 19.2 Build Templates

- Library of project templates:
  - Pre‑defined parts lists and estimated costs.
  - Metadata: vehicle type, target goals, difficulty.
- Template actions:
  - Apply template to create a new project.
  - Purchase premium templates (monetized).

### 19.3 Inspiration Gallery

- Public build showcases:
  - Before/after photos
  - Cost ranges
  - Build summaries
  - Social features (likes, shares)

### 19.4 Community Features

- Forums or Q&A by category.
- Build logs as long‑form posts.
- Reputation system for contributors.


---

## 20. Admin / Security / Localization (Phase 3–4)

**Purpose:** Support enterprise‑grade security, compliance, and internationalization.

### 20.1 Security & Admin Center

- Admin tools:
  - Manage sessions/devices
  - Enforce password policies
  - Enable/require two‑factor authentication
  - View and export audit logs
- Rate limiting and API usage monitoring.

### 20.2 Localization & Currency

- Language selection (English, Spanish, French, German, etc.).
- Unit system toggle (imperial vs metric).
- Currency per tenant with automatic conversions.
- Region‑appropriate date and number formatting.


---

## 21. AI‑Powered Features (Phase 4)

**Purpose:** Provide intelligent assistance and predictive insights.

### 21.1 AI Assistant Panel

- Sidebar or chat widget available from the app shell.
- Capabilities:
  - Answer questions about projects, costs, and timelines.
  - Suggest parts based on build goals and existing items.
  - Summarize project status for non‑technical stakeholders.

### 21.2 Risk & Insight Cards

- On project Overview:
  - Budget risk assessment (low/medium/high).
  - Timeline risk assessment.
  - Recommendations for mitigating overruns or delays.

### 21.3 Part Recommendations

- In Parts & Costs:
  - Suggest alternative or complementary parts.
  - Take into account budget, performance goals, and supplier data.

### 21.4 Image‑Based Workflows

- From Media & Documents:
  - Identify parts from photos.
  - Extract invoice/receipt data via OCR.


---

## 22. Roles & Permissions (High‑Level)

**Roles:** Owner, Admin, Member, Viewer, Client (plus potential custom roles in enterprise tiers).

**Principles:**

- All sensitive operations (creating/editing/deleting projects, parts, labor, tasks, media, change orders, members, billing) are protected by server‑side permission checks.
- Viewer/Client roles are read‑only except for explicitly allowed actions (such as change order approvals).

A detailed permissions matrix should be maintained separately and enforced in the backend (e.g., via a `PermissionsService` and decorators).


---

## 23. Status Summary (Concept vs Implementation)

- The document above describes the **intended** product and website.
- The current implementation is an MVP that:
  - Already includes the core data model, API, and some UI (Dashboard, Projects, basic tabs).
  - Is progressively adding Phase 2–4 capabilities (member management, client portal, advanced analytics, vendors, time tracking, AI, integrations).

This spec should be treated as a living document and updated as design decisions are finalized and features are shipped.
