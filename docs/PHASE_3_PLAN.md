# DreamBuildDrive 2.0 - Phase 3 Implementation Plan

## Overview

Phase 3 elevates DreamBuildDrive from a collaboration platform to a comprehensive automotive build management suite with advanced analytics, vendor management, labor tracking, and professional reporting capabilities.

**Timeline:** Phase 3 Release
**Status:** Starting
**Goal:** Provide shops with professional-grade analytics, vendor management, labor tracking, and advanced reporting to run their business efficiently.

---

## Phase 3 Feature Set

### 1. Advanced Analytics Dashboard (High Priority)

**User Stories:**
- As a shop owner, I can view real-time budget health across all projects
- As a manager, I can identify projects over budget at a glance
- As an analyst, I can generate cost variance reports
- As a user, I can see project timeline progress and delays

**Features:**
- **Dashboard Widgets:**
  - Budget health scorecard (green/yellow/red status)
  - Projects over/under budget summary
  - Monthly spend trends
  - Labor vs parts cost breakdown
  - Task completion rates
  - Timeline adherence metrics

- **Analytics Endpoints:**
  - Portfolio-level analytics (all projects)
  - Project-level detailed analytics
  - Category-level cost analysis
  - Vendor spending analysis
  - Time-based trend data

**Endpoints:**
```
GET /analytics/dashboard                    # Portfolio overview
GET /analytics/projects/:id/budget-variance # Detailed budget analysis
GET /analytics/projects/:id/timeline        # Timeline analysis
GET /analytics/spending-trends              # Historical spend data
GET /analytics/vendor-performance           # Vendor metrics
```

**Implementation:**
- Create `AnalyticsService` with complex aggregation queries
- Add computed metrics to project responses
- Implement caching for expensive analytics queries
- Create analytics DTOs for different report types

---

### 2. Vendor Management System (High Priority)

**User Stories:**
- As a shop, I can maintain a directory of preferred vendors
- As a purchaser, I can track orders by vendor
- As a manager, I can see vendor performance metrics
- As a user, I can link parts to their vendors

**Features:**
- **Vendor Directory:**
  - Vendor profile with contact info
  - Specialties and categories
  - Rating system (1-5 stars)
  - Notes and communication history

- **Purchase Order Tracking:**
  - Create PO from parts list
  - Track PO status (pending, ordered, received, cancelled)
  - Link PO to parts
  - Expected delivery dates

- **Vendor Metrics:**
  - Total spend per vendor
  - Average delivery time
  - Order accuracy rate
  - Price competitiveness

**Endpoints:**
```
POST   /vendors                    # Create vendor
GET    /vendors                    # List all vendors
GET    /vendors/:id                # Get vendor details
PATCH  /vendors/:id                # Update vendor
DELETE /vendors/:id                # Delete vendor

POST   /purchase-orders            # Create PO
GET    /purchase-orders            # List POs
GET    /purchase-orders/:id        # Get PO details
PATCH  /purchase-orders/:id/status # Update PO status
```

**Entities:**
- `Vendor` - Vendor profile and contact information
- `PurchaseOrder` - Purchase order header
- `PurchaseOrderItem` - Line items linking to parts

---

### 3. Labor & Time Tracking (High Priority)

**User Stories:**
- As a technician, I can log time against tasks
- As a manager, I can track labor costs vs estimates
- As an owner, I can see labor efficiency metrics
- As a user, I can set different labor rates by role

**Features:**
- **Labor Rates:**
  - Configure shop labor rates (standard, premium, specialty)
  - Role-based rates (mechanic, body work, paint, etc.)
  - Date-effective rate changes

- **Time Tracking:**
  - Log time entries against tasks
  - Start/stop timer
  - Manual time entry
  - Edit time entries

- **Labor Analytics:**
  - Actual vs estimated labor hours
  - Labor cost variance
  - Utilization reports
  - Labor by category/task type

**Endpoints:**
```
GET    /labor-rates                # Get current rates
POST   /labor-rates                # Add new rate
PATCH  /labor-rates/:id            # Update rate

POST   /time-entries               # Log time
GET    /time-entries               # List time entries
PATCH  /time-entries/:id           # Update entry
DELETE /time-entries/:id           # Delete entry

GET    /tasks/:id/time-summary     # Time summary for task
GET    /projects/:id/labor-summary # Labor summary for project
```

**Entities:**
- `LaborRate` - Labor rate configuration
- `TimeEntry` - Individual time log entries
- Update `LaborItem` to link to time entries

---

### 4. Change Order Management (Medium Priority)

**User Stories:**
- As a shop, I can document scope changes
- As a client, I can approve/reject change orders
- As a manager, I can track budget impact of changes
- As an owner, I can require approval for budget increases

**Features:**
- **Change Order Workflow:**
  - Create change order with description and cost impact
  - Submit for approval
  - Client/manager approval
  - Automatic budget adjustment on approval

- **Change Order Types:**
  - Scope addition (new parts/labor)
  - Scope reduction (credits)
  - Cost adjustment (price changes)

- **Approval Workflow:**
  - Configurable approval thresholds
  - Email notifications
  - Approval history and audit trail

**Endpoints:**
```
POST   /projects/:id/change-orders        # Create change order
GET    /projects/:id/change-orders        # List change orders
GET    /change-orders/:id                 # Get details
POST   /change-orders/:id/submit          # Submit for approval
POST   /change-orders/:id/approve         # Approve
POST   /change-orders/:id/reject          # Reject
```

**Entities:**
- `ChangeOrder` - Change order header
- `ChangeOrderItem` - Line items (parts/labor changes)

---

### 5. Notes & Comments System (Medium Priority)

**User Stories:**
- As a team member, I can add notes to projects/tasks/parts
- As a user, I can @mention team members in comments
- As a client, I can comment on project progress
- As a manager, I can review communication history

**Features:**
- **Commenting:**
  - Add comments to projects, tasks, parts, categories
  - @mention notifications
  - Rich text formatting
  - File attachments

- **Activity Feed:**
  - Chronological feed of all project activity
  - Filter by type (comments, changes, media uploads)
  - Mentions and notifications

**Endpoints:**
```
POST   /comments                   # Add comment
GET    /projects/:id/comments      # Get project comments
GET    /tasks/:id/comments         # Get task comments
PATCH  /comments/:id               # Edit comment
DELETE /comments/:id               # Delete comment
```

**Entities:**
- `Comment` - Polymorphic comments (project, task, part, etc.)

---

### 6. Advanced Reporting & Export (Medium Priority)

**User Stories:**
- As a shop owner, I can generate PDF reports for clients
- As an accountant, I can export data to QuickBooks format
- As a manager, I can create custom reports
- As a user, I can schedule recurring reports

**Features:**
- **PDF Reports:**
  - Project summary with photos
  - Budget breakdown with variance
  - Timeline with milestones
  - Parts manifest
  - Labor summary

- **Export Formats:**
  - Enhanced CSV with all fields
  - Excel workbook (multiple sheets)
  - QuickBooks IIF format
  - JSON API exports

- **Custom Reports:**
  - Report builder UI
  - Save report templates
  - Schedule email delivery

**Endpoints:**
```
GET    /projects/:id/reports/summary.pdf       # PDF summary
GET    /projects/:id/reports/detailed.pdf      # Detailed PDF
GET    /projects/:id/exports/quickbooks        # QB export
GET    /analytics/custom-reports               # List saved reports
POST   /analytics/custom-reports               # Create report
POST   /analytics/custom-reports/:id/generate  # Run report
```

---

### 7. Build Timeline Visualization (Medium Priority)

**User Stories:**
- As a project manager, I can see a Gantt chart of tasks
- As a team member, I can see task dependencies
- As a shop owner, I can identify critical path
- As a user, I can drag tasks to reschedule

**Features:**
- **Timeline View:**
  - Gantt chart visualization
  - Task dependencies (start-to-start, finish-to-start)
  - Critical path highlighting
  - Milestone markers

- **Task Scheduling:**
  - Estimated duration
  - Actual start/end dates
  - % complete tracking
  - Drag-and-drop rescheduling

**Implementation:**
- Frontend: react-gantt-chart or dhtmlx-gantt
- Backend: Task dependency relationships
- Critical path calculation algorithm

---

### 8. Document Management (Low Priority)

**User Stories:**
- As a user, I can upload and categorize documents
- As a shop, I can store receipts and invoices
- As a technician, I can access service manuals
- As an owner, I can organize build documentation

**Features:**
- **Document Categories:**
  - Manuals (service, parts)
  - Receipts and invoices
  - Wiring diagrams
  - Dyno sheets
  - Alignment specs
  - Build photos

- **Document Organization:**
  - Folder structure
  - Tagging and search
  - Version control
  - OCR for searchability (future)

**Enhancement to Media:**
- Add `documentType` field (already exists)
- Add folder/category grouping
- Enhanced search and filtering

---

## Implementation Order

### Week 1: Analytics Foundation
1. Create AnalyticsService with core metrics
2. Implement budget variance calculations
3. Add timeline analysis
4. Create analytics endpoints
5. Build dashboard data aggregation

### Week 2: Vendor Management
6. Create Vendor entity and service
7. Implement vendor CRUD endpoints
8. Create PurchaseOrder entity
9. Implement PO tracking
10. Link vendors to parts

### Week 3: Labor & Time Tracking
11. Create LaborRate entity
12. Create TimeEntry entity
13. Implement time tracking endpoints
14. Add labor analytics
15. Integrate with tasks

### Week 4: Change Orders & Comments
16. Create ChangeOrder entity
17. Implement approval workflow
18. Create Comment entity
19. Add polymorphic commenting
20. Build activity feed

### Week 5: Reporting & Visualization
21. PDF report generation (PDFKit)
22. Enhanced export formats
23. Timeline visualization backend
24. Task dependency model
25. Critical path calculation

### Week 6: Polish & Integration
26. Document management enhancements
27. Frontend analytics dashboard
28. Gantt chart UI
29. Integration testing
30. Documentation updates

---

## Technical Architecture

### Analytics Service Architecture

```typescript
@Injectable()
export class AnalyticsService {
  // Portfolio-level analytics
  async getPortfolioMetrics(tenantId: string): Promise<PortfolioMetrics> {
    // Total projects, active projects, budget health, etc.
  }

  // Project-level analytics
  async getProjectBudgetVariance(tenantId: string, projectId: string): Promise<BudgetVariance> {
    // Planned vs actual, variance %, overbudget items
  }

  async getProjectTimelineAnalysis(tenantId: string, projectId: string): Promise<TimelineAnalysis> {
    // On-time %, delayed tasks, critical path
  }

  // Trend analysis
  async getSpendingTrends(tenantId: string, dateRange: DateRange): Promise<TrendData[]> {
    // Monthly/weekly spend trends
  }

  // Vendor analytics
  async getVendorPerformance(tenantId: string): Promise<VendorMetrics[]> {
    // Spend, delivery time, order count per vendor
  }
}
```

### Vendor Management Schema

```typescript
@Entity('vendors')
export class Vendor extends TenantBaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  website: string;

  @Column({ type: 'simple-array', nullable: true })
  specialties: string[];

  @Column({ type: 'decimal', precision: 2, scale: 1, default: 0 })
  rating: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => Part, part => part.vendor)
  parts: Part[];

  @OneToMany(() => PurchaseOrder, po => po.vendor)
  purchaseOrders: PurchaseOrder[];
}

@Entity('purchase_orders')
export class PurchaseOrder extends TenantBaseEntity {
  @Column()
  poNumber: string; // Generated PO number

  @Column('uuid')
  vendorId: string;

  @Column('uuid', { nullable: true })
  projectId: string;

  @Column({ type: 'enum', enum: POStatus })
  status: POStatus;

  @Column({ type: 'date', nullable: true })
  orderDate: Date;

  @Column({ type: 'date', nullable: true })
  expectedDelivery: Date;

  @Column({ type: 'date', nullable: true })
  actualDelivery: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Vendor)
  @JoinColumn({ name: 'vendor_id' })
  vendor: Vendor;

  @OneToMany(() => PurchaseOrderItem, item => item.purchaseOrder)
  items: PurchaseOrderItem[];
}

export enum POStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ORDERED = 'ordered',
  PARTIALLY_RECEIVED = 'partially_received',
  RECEIVED = 'received',
  CANCELLED = 'cancelled',
}
```

### Time Tracking Schema

```typescript
@Entity('labor_rates')
export class LaborRate extends TenantBaseEntity {
  @Column()
  name: string; // e.g., "Standard Mechanic", "Paint Work"

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ type: 'date' })
  effectiveDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;
}

@Entity('time_entries')
export class TimeEntry extends TenantBaseEntity {
  @Column('uuid')
  taskId: string;

  @Column('uuid')
  userId: string;

  @Column('uuid', { nullable: true })
  laborRateId: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp', nullable: true })
  endTime: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hours: number; // Calculated or manual entry

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost: number; // hours * rate

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Task)
  @JoinColumn({ name: 'task_id' })
  task: Task;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
```

---

## Database Migrations

### New Tables
- `vendors`
- `purchase_orders`
- `purchase_order_items`
- `labor_rates`
- `time_entries`
- `change_orders`
- `change_order_items`
- `comments`

### Modified Tables
- `parts` - Add `vendor_id` foreign key
- `tasks` - Add `estimated_hours`, `dependencies` fields
- `projects` - Add `change_order_count`, `total_change_amount` fields

---

## API Additions

### Analytics Endpoints
```
GET /analytics/dashboard
    Returns: {
      totalProjects, activeProjects, totalBudget, totalSpent,
      budgetHealth: { onBudget, overBudget, underBudget },
      recentActivity: []
    }

GET /analytics/projects/:id/budget-variance
    Returns: {
      plannedBudget, actualSpent, variance, variancePercent,
      categoryBreakdown: [{ category, planned, actual, variance }],
      overBudgetItems: []
    }

GET /analytics/spending-trends?period=monthly&months=6
    Returns: [{ month, parts, labor, total }, ...]

GET /analytics/vendor-performance
    Returns: [{ vendor, totalSpent, orderCount, avgDeliveryDays, rating }, ...]
```

### Vendor Management Endpoints
```
POST   /vendors                    Body: { name, contact, email, ... }
GET    /vendors?search=...         Returns: [vendors]
GET    /vendors/:id                Returns: { vendor, metrics }
PATCH  /vendors/:id                Body: { updates }
DELETE /vendors/:id

POST   /purchase-orders            Body: { vendorId, items: [], ... }
GET    /purchase-orders?status=... Returns: [purchase orders]
GET    /purchase-orders/:id        Returns: { po, items, vendor }
PATCH  /purchase-orders/:id/status Body: { status, notes }
```

---

## Frontend Enhancements

### Analytics Dashboard Page
```
/dashboard
├── Portfolio Overview Card
│   ├── Project count, active, completed
│   ├── Total budget vs spent
│   └── Budget health indicator
├── Budget Variance Chart (bar chart)
├── Spending Trends Chart (line chart)
├── Recent Activity Feed
└── Quick Actions (Create Project, etc.)
```

### Vendor Management Page
```
/vendors
├── Vendor List Table
│   ├── Search and filter
│   ├── Rating display
│   └── Quick actions
├── Vendor Detail Modal
│   ├── Contact info
│   ├── Purchase order history
│   ├── Parts from vendor
│   └── Performance metrics
└── Create/Edit Vendor Form
```

### Time Tracking UI
```
/projects/:id/labor
├── Active Timer Widget
├── Time Entry List
│   ├── Task breakdown
│   ├── User breakdown
│   └── Date range filter
├── Labor Summary Card
│   ├── Estimated vs actual hours
│   ├── Labor cost variance
│   └── Utilization %
└── Quick Time Entry Form
```

---

## Security Considerations

1. **Analytics Access**
   - Portfolio analytics: Owner/Admin only
   - Project analytics: Based on project permissions
   - Vendor metrics: MANAGE_VENDORS permission

2. **Vendor Management**
   - MANAGE_VENDORS permission required
   - Vendor data isolated per tenant
   - Audit log for vendor changes

3. **Time Tracking**
   - Users can only log time for themselves
   - Managers can edit all time entries
   - Time approval workflow (optional)

4. **Change Orders**
   - EDIT_PROJECT permission to create
   - Configurable approval thresholds
   - Email notifications for approvals
   - Audit trail for all changes

---

## Performance Optimization

1. **Analytics Caching**
   - Cache dashboard metrics (5 min TTL)
   - Invalidate cache on data changes
   - Redis for distributed caching

2. **Query Optimization**
   - Add indexes for analytics queries
   - Denormalize common metrics
   - Use materialized views for complex aggregations

3. **Report Generation**
   - Background job queue for PDF generation
   - Pre-generate common reports
   - Streaming for large exports

---

## Testing Strategy

### Unit Tests
- Analytics calculation accuracy
- Budget variance formulas
- Timeline calculations
- Vendor metrics
- Time entry cost calculations

### Integration Tests
- Complete PO workflow
- Change order approval flow
- Time tracking end-to-end
- Report generation
- Data export formats

### E2E Tests
- Shop creates vendor and PO
- Team member logs time
- Manager reviews analytics
- Client approves change order
- User generates PDF report

---

## Success Metrics

**Phase 3 Goals:**
- 80% of shops use vendor management
- Average 10+ vendors per tenant
- 90% of shops use time tracking
- Analytics dashboard accessed daily
- Change order approval <24 hours
- PDF report generation <5 seconds
- Export success rate >99%

---

## Phase 3 Completion Criteria

- ✅ Analytics dashboard fully functional
- ✅ Vendor management operational
- ✅ Time tracking integrated with tasks
- ✅ Change order workflow complete
- ✅ Comments and activity feed working
- ✅ PDF reports generating correctly
- ✅ All exports working (CSV, Excel, QB)
- ✅ Timeline visualization implemented
- ✅ Performance targets met
- ✅ Documentation complete

---

## Next Steps

1. Start with analytics foundation
2. Build vendor management system
3. Implement time tracking
4. Add change order workflow
5. Create commenting system
6. Build reporting engine
7. Add timeline visualization
8. Test and optimize
9. Deploy to production

**Estimated Completion:** 6 weeks from start
**Current Status:** Ready to begin Phase 3
