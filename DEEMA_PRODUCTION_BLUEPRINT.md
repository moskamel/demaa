# DEEMA PRODUCTION BLUEPRINT v1.0

> **Complete Audit, Redesign, and Production-Readiness Review**  
> Prepared as: Chief Product Officer · Principal Solution Architect · Staff Backend Engineer · Senior AI Engineer · Senior UX Designer

---

## Executive Summary

**Deema** (ديما) is an Arabic-first AI operating system for e-commerce merchants. It sits between a merchant's store platforms (Salla, Zid, Shopify) and all operational decisions — orders, inventory, shipments, customers, analytics — and lets merchants manage everything through natural Arabic conversation.

**Positioning:** The "Jarvis for Arabic e-commerce" — a single AI agent that replaces the need for a full operations team for solo and small-team merchants.

**Target Market:** Saudi Arabia first, then GCC — 500,000+ active Salla/Zid merchants, 70% solo-operated, Arabic-speaking, mobile-first.

**Key Differentiators:**
- Dialect-aware Arabic NLP (Saudi, Gulf, Egyptian)
- Zero training required — merchants talk naturally
- Multi-store, multi-platform in one AI interface
- Risk-aware order management with AI memory
- WhatsApp-native notifications

**Discovered Critical Gaps (summary):**
- No authentication layer
- No backend or database
- No real-time data sync
- No mobile-responsive layout
- No production AI integration (Claude/GPT)
- No integration OAuth flows
- No WebSocket/real-time updates
- No observability or error handling
- Missing 8+ critical pages and flows

---

## Phase 1: Product Audit

### 1.1 Merchant Personas

| Persona | Profile | Goals | Pain Points |
|---------|---------|-------|-------------|
| **Solo Merchant (80%)** | 1-person store, Salla/Zid, 50-300 orders/month | Process orders fast, no ops overhead | Spends 3-4h/day on manual order management |
| **Growing Brand (15%)** | 2-5 person team, multi-platform, 300-2000/month | Delegate to AI, team accountability | Disjointed tools, no unified view |
| **Enterprise (5%)** | Dedicated ops team, 2000+/month | Automation, reporting, SLA | Legacy tools, no Arabic AI |

### 1.2 Critical Missing Pages

| Missing Page | Priority | Description |
|-------------|----------|-------------|
| `/login` | **Critical** | Auth entry point — now built ✅ |
| `/reports` | **Critical** | Analytics & revenue dashboard — now built ✅ |
| `/customers` | **High** | Customer management & segmentation — now built ✅ |
| `/orders` | **High** | Full order management table with filters |
| `/orders/:id` | **High** | Order detail page (drawer implemented ✅) |
| `/products` | **High** | Product catalog management |
| `/products/:id` | **Medium** | Product detail with variant management |
| `/coupons` | **Medium** | Coupon creation and analytics |
| `/profile` | **Medium** | Account settings, password, billing info |
| `/onboarding/tour` | **High** | Step 4 welcome tour after store connect |
| `/health` | **Low** | System health & integration status |
| `/api-docs` | **Low** | API documentation for developers |

### 1.3 Missing Flows

**Authentication Flow (Missing entirely):**
```
Landing → Login/Signup → Email Verification → Onboarding → Dashboard
         ↓
         Forgot Password → Reset Link → New Password → Login
```

**Onboarding Completion (Step 4 missing):**
```
Step 1: Platform selection
Step 2: API key / OAuth
Step 3: Sync confirmation  ← current end
Step 4: Welcome tour (AI intro, quick actions)  ← MISSING
Step 5: First action prompt  ← MISSING
```

**Order Lifecycle (incomplete):**
```
New Order → Risk Check → Pending Review → Accept/Reject
Accept → Shipment Creation → Carrier Assignment → Tracking
Reject → Customer Notification → Refund Initiation
Delivered → Auto-review request → Loyalty update
```

**Payment Failure Recovery (missing):**
```
COD Order → High Risk Flag → Manual Review → Accept with note | Reject with reason
```

### 1.4 Missing States

Every page is missing:
- **Empty State** — no orders yet, no stores connected, no team members
- **Loading State** — skeleton screens during data fetch
- **Error State** — API failure, network error, permission denied
- **Offline State** — connection lost banner
- **Onboarding State** — contextual first-use guidance

### 1.5 UX Friction Points

1. **No global search** — merchants can't find order #10234 without scrolling — now fixed ✅ (Ctrl+K)
2. **Order detail requires chat** — can't click an order row to see details — now fixed ✅ (drawer)
3. **No mobile layout** — the sidebar + chat layout breaks on <768px screens
4. **No keyboard shortcuts** beyond Ctrl+K search
5. **No message timestamps** in chat history
6. **No copy button** on AI responses
7. **Quick actions limited to 8** — needs categorized command palette
8. **No way to undo** an accepted/rejected order
9. **Notification center not real-time** — needs WebSocket push
10. **Onboarding doesn't explain AI capabilities** — merchants don't know what to ask

### 1.6 Missing Modals / Drawers

| Modal | Trigger | Content |
|-------|---------|---------|
| Order Detail Drawer | Click order row | Full order with items, customer, risk, actions ✅ |
| Product Edit Drawer | Click product | Name, price, stock, variants, images |
| Coupon Creator Modal | "New Coupon" button | Type, value, expiry, usage limit |
| Shipment Tracker Modal | Click shipment ID | Timeline, carrier events, estimated delivery |
| Customer Profile Modal | Click customer name | History, segments, lifetime value |
| Store Health Modal | Store status badge | Sync status, last sync, error log |
| Invite Team Modal | "Invite" button | Email, role selector ✅ (partial) |
| Plan Upgrade Modal | "Upgrade" button | Feature comparison, payment |
| API Key Modal | Settings → API | Generate, rotate, revoke |
| Webhook Config Modal | Settings → Webhooks | URL, events, secret |

---

## Phase 2: Database Architecture

### 2.1 Design Principles

- **Multi-tenant isolation** via `organization_id` on every table
- **Row-level security** in PostgreSQL via RLS policies
- **Soft deletes** via `deleted_at` — never hard delete merchant data
- **Audit trail** on every mutation via trigger-based `audit_logs`
- **UUID primary keys** everywhere — no sequential integer IDs exposed
- **Timezone awareness** — all timestamps in UTC, displayed in merchant's timezone

### 2.2 Complete Prisma Schema

```prisma
// ============================================================
// DEEMA PRODUCTION SCHEMA
// PostgreSQL + Prisma ORM
// ============================================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ── ORGANIZATIONS (Tenants) ──────────────────────────────────

model Organization {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  logoUrl     String?
  timezone    String   @default("Asia/Riyadh")
  locale      String   @default("ar")
  planId      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  deletedAt   DateTime?

  plan              Plan?              @relation(fields: [planId], references: [id])
  memberships       TeamMembership[]
  stores            Store[]
  conversations     Conversation[]
  notifications     Notification[]
  activityLogs      ActivityLog[]
  auditLogs         AuditLog[]
  apiKeys           ApiKey[]
  webhooks          Webhook[]
  featureFlags      OrgFeatureFlag[]
  usageRecords      UsageRecord[]
  subscriptions     Subscription[]
  insights          AiInsight[]
  aiMemory          AiMemory[]
  coupons           Coupon[]
  customers         Customer[]

  @@index([slug])
  @@index([planId])
  @@map("organizations")
}

// ── USERS ───────────────────────────────────────────────────

model User {
  id            String    @id @default(uuid())
  email         String    @unique
  emailVerified DateTime?
  passwordHash  String
  name          String
  avatarUrl     String?
  phone         String?
  locale        String    @default("ar")
  timezone      String    @default("Asia/Riyadh")
  twoFactorEnabled Boolean @default(false)
  twoFactorSecret  String?
  lastLoginAt   DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  deletedAt     DateTime?

  memberships   TeamMembership[]
  sessions      Session[]
  auditLogs     AuditLog[]

  @@index([email])
  @@map("users")
}

model Session {
  id        String   @id @default(uuid())
  userId    String
  token     String   @unique
  userAgent String?
  ipAddress String?
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([token])
  @@index([userId])
  @@map("sessions")
}

// ── TEAM ────────────────────────────────────────────────────

model TeamMembership {
  id             String    @id @default(uuid())
  organizationId String
  userId         String
  role           MemberRole @default(ORDER_MANAGER)
  permissions    Json      @default("{}")
  invitedBy      String?
  invitedAt      DateTime?
  acceptedAt     DateTime?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  deletedAt      DateTime?

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@unique([organizationId, userId])
  @@index([organizationId])
  @@map("team_memberships")
}

enum MemberRole {
  ADMIN
  ORDER_MANAGER
  CUSTOMER_SERVICE
  ANALYST
  VIEWER
}

// ── PLANS & BILLING ─────────────────────────────────────────

model Plan {
  id            String   @id @default(uuid())
  name          String   @unique
  nameAr        String
  price         Int      // SAR in halalat (smallest unit)
  interval      String   @default("month")
  ordersLimit   Int      @default(100)
  storesLimit   Int      @default(1)
  teamLimit     Int      @default(1)
  apiAccess     Boolean  @default(false)
  whatsappAccess Boolean @default(false)
  features      Json     @default("[]")
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())

  subscriptions  Subscription[]
  organizations  Organization[]

  @@map("plans")
}

model Subscription {
  id             String             @id @default(uuid())
  organizationId String
  planId         String
  status         SubscriptionStatus @default(ACTIVE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime
  cancelAtPeriodEnd  Boolean        @default(false)
  paymentProvider    String?
  externalId         String?
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  plan         Plan         @relation(fields: [planId], references: [id])
  invoices     Invoice[]

  @@index([organizationId])
  @@map("subscriptions")
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELLED
  TRIALING
  PAUSED
}

model Invoice {
  id             String        @id @default(uuid())
  subscriptionId String
  amount         Int
  currency       String        @default("SAR")
  status         InvoiceStatus @default(PENDING)
  paidAt         DateTime?
  invoiceUrl     String?
  externalId     String?
  createdAt      DateTime      @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([subscriptionId])
  @@map("invoices")
}

enum InvoiceStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  VOID
}

model UsageRecord {
  id             String   @id @default(uuid())
  organizationId String
  month          String   // "2025-01"
  ordersProcessed Int     @default(0)
  messagesUsed   Int      @default(0)
  aiTokensUsed   Int      @default(0)
  storesSynced   Int      @default(0)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, month])
  @@index([organizationId])
  @@map("usage_records")
}

// ── STORES & PLATFORMS ──────────────────────────────────────

model Store {
  id             String      @id @default(uuid())
  organizationId String
  name           String
  platform       Platform
  platformStoreId String?
  domain         String?
  logoUrl        String?
  currency       String      @default("SAR")
  timezone       String      @default("Asia/Riyadh")
  isActive       Boolean     @default(true)
  lastSyncAt     DateTime?
  syncStatus     SyncStatus  @default(IDLE)
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  deletedAt      DateTime?

  organization     Organization      @relation(fields: [organizationId], references: [id])
  connections      PlatformConnection[]
  orders           Order[]
  products         Product[]
  syncJobs         SyncJob[]

  @@index([organizationId])
  @@index([platform, platformStoreId])
  @@map("stores")
}

enum Platform {
  SALLA
  ZID
  SHOPIFY
  WOOCOMMERCE
  CUSTOM
}

enum SyncStatus {
  IDLE
  SYNCING
  ERROR
  PARTIAL
}

model PlatformConnection {
  id             String   @id @default(uuid())
  storeId        String
  platform       Platform
  accessToken    String   // encrypted AES-256-GCM
  refreshToken   String?  // encrypted
  tokenExpiresAt DateTime?
  scopes         String[]
  webhookSecret  String?
  metadata       Json     @default("{}")
  isActive       Boolean  @default(true)
  lastUsedAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@unique([storeId, platform])
  @@index([storeId])
  @@map("platform_connections")
}

model Integration {
  id             String            @id @default(uuid())
  organizationId String
  type           IntegrationType
  name           String
  credentials    Json              // encrypted
  config         Json              @default("{}")
  status         IntegrationStatus @default(DISCONNECTED)
  lastUsedAt     DateTime?
  createdAt      DateTime          @default(now())
  updatedAt      DateTime          @updatedAt

  @@index([organizationId, type])
  @@map("integrations")
}

enum IntegrationType {
  ARAMEX
  SMSA
  NAQEL
  DHL
  WHATSAPP
  STRIPE
  HYPERPAY
  MOYASAR
  TABBY
  TAMARA
  GOOGLE_ADS
  META_ADS
  ZOHO
}

enum IntegrationStatus {
  CONNECTED
  DISCONNECTED
  EXPIRED
  ERROR
}

// ── ORDERS ──────────────────────────────────────────────────

model Order {
  id              String      @id @default(uuid())
  storeId         String
  externalId      String      // platform's order ID
  externalRef     String?     // human-readable reference
  customerId      String?
  status          OrderStatus @default(PENDING)
  paymentMethod   PaymentMethod
  paymentStatus   PaymentStatus @default(PENDING)
  subtotal        Int         // in halalat
  shippingFee     Int         @default(0)
  discount        Int         @default(0)
  total           Int
  currency        String      @default("SAR")
  notes           String?
  riskScore       Int         @default(0)
  riskFactors     String[]
  isNewCustomer   Boolean     @default(false)
  shippingAddress Json
  billingAddress  Json?
  metadata        Json        @default("{}")
  placedAt        DateTime
  acceptedAt      DateTime?
  rejectedAt      DateTime?
  rejectionReason String?
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt
  deletedAt       DateTime?

  store     Store        @relation(fields: [storeId], references: [id])
  customer  Customer?    @relation(fields: [customerId], references: [id])
  items     OrderItem[]
  shipments Shipment[]

  @@unique([storeId, externalId])
  @@index([storeId, status])
  @@index([storeId, placedAt])
  @@index([customerId])
  @@index([riskScore])
  @@map("orders")
}

enum OrderStatus {
  PENDING
  ACCEPTED
  REJECTED
  CANCELLED
  SHIPPED
  DELIVERED
  RETURNED
}

enum PaymentMethod {
  CARD
  CASH_ON_DELIVERY
  TABBY
  TAMARA
  BANK_TRANSFER
  WALLET
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  PARTIALLY_REFUNDED
}

model OrderItem {
  id          String  @id @default(uuid())
  orderId     String
  productId   String?
  variantId   String?
  externalId  String?
  name        String
  sku         String?
  qty         Int
  unitPrice   Int
  totalPrice  Int
  metadata    Json    @default("{}")

  order   Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product Product? @relation(fields: [productId], references: [id])
  variant ProductVariant? @relation(fields: [variantId], references: [id])

  @@index([orderId])
  @@index([productId])
  @@map("order_items")
}

// ── PRODUCTS ────────────────────────────────────────────────

model Product {
  id             String   @id @default(uuid())
  storeId        String
  externalId     String?
  name           String
  nameAr         String?
  description    String?
  sku            String?
  price          Int
  comparePrice   Int?
  cost           Int?
  stock          Int      @default(0)
  lowStockAlert  Int      @default(5)
  isActive       Boolean  @default(true)
  imageUrls      String[]
  category       String?
  tags           String[]
  weight         Float?
  metadata       Json     @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  deletedAt      DateTime?

  store    Store          @relation(fields: [storeId], references: [id])
  variants ProductVariant[]
  items    OrderItem[]

  @@unique([storeId, externalId])
  @@index([storeId])
  @@index([storeId, isActive])
  @@map("products")
}

model ProductVariant {
  id         String   @id @default(uuid())
  productId  String
  name       String
  sku        String?
  price      Int?
  stock      Int      @default(0)
  options    Json     @default("{}")
  imageUrl   String?
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  product Product     @relation(fields: [productId], references: [id], onDelete: Cascade)
  items   OrderItem[]

  @@index([productId])
  @@map("product_variants")
}

// ── CUSTOMERS ───────────────────────────────────────────────

model Customer {
  id             String          @id @default(uuid())
  organizationId String
  externalId     String?
  name           String
  phone          String?
  email          String?
  city           String?
  country        String          @default("SA")
  segment        CustomerSegment @default(NEW)
  totalOrders    Int             @default(0)
  totalSpent     Int             @default(0)
  lastOrderAt    DateTime?
  isBlocked      Boolean         @default(false)
  notes          String?
  metadata       Json            @default("{}")
  createdAt      DateTime        @default(now())
  updatedAt      DateTime        @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  orders       Order[]

  @@unique([organizationId, phone])
  @@index([organizationId])
  @@index([organizationId, segment])
  @@map("customers")
}

enum CustomerSegment {
  NEW
  REGULAR
  LOYAL
  VIP
  AT_RISK
  CHURNED
}

// ── SHIPMENTS ───────────────────────────────────────────────

model Shipment {
  id              String         @id @default(uuid())
  orderId         String
  carrier         String
  trackingNumber  String?
  trackingUrl     String?
  status          ShipmentStatus @default(CREATED)
  estimatedAt     DateTime?
  deliveredAt     DateTime?
  cost            Int?
  waybillUrl      String?
  metadata        Json           @default("{}")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt

  order  Order           @relation(fields: [orderId], references: [id])
  events ShipmentEvent[]

  @@index([orderId])
  @@index([trackingNumber])
  @@map("shipments")
}

enum ShipmentStatus {
  CREATED
  PICKED_UP
  IN_TRANSIT
  OUT_FOR_DELIVERY
  DELIVERED
  FAILED
  RETURNED
}

model ShipmentEvent {
  id          String   @id @default(uuid())
  shipmentId  String
  status      String
  description String?
  location    String?
  occurredAt  DateTime
  createdAt   DateTime @default(now())

  shipment Shipment @relation(fields: [shipmentId], references: [id], onDelete: Cascade)

  @@index([shipmentId])
  @@map("shipment_events")
}

// ── COUPONS ─────────────────────────────────────────────────

model Coupon {
  id             String     @id @default(uuid())
  organizationId String
  code           String
  type           CouponType
  value          Int
  minOrder       Int?
  maxUsage       Int?
  usageCount     Int        @default(0)
  isActive       Boolean    @default(true)
  expiresAt      DateTime?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt

  organization Organization   @relation(fields: [organizationId], references: [id])
  usages       CouponUsage[]

  @@unique([organizationId, code])
  @@index([organizationId])
  @@map("coupons")
}

enum CouponType {
  PERCENTAGE
  FIXED_AMOUNT
  FREE_SHIPPING
}

model CouponUsage {
  id        String   @id @default(uuid())
  couponId  String
  orderId   String?
  usedAt    DateTime @default(now())

  coupon Coupon @relation(fields: [couponId], references: [id])

  @@index([couponId])
  @@map("coupon_usages")
}

// ── AI CONVERSATIONS ─────────────────────────────────────────

model Conversation {
  id             String   @id @default(uuid())
  organizationId String
  userId         String?
  title          String?
  storeContext   String?  // active store ID at conversation start
  messageCount   Int      @default(0)
  tokenCount     Int      @default(0)
  isArchived     Boolean  @default(false)
  metadata       Json     @default("{}")
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  messages     Message[]

  @@index([organizationId])
  @@index([organizationId, updatedAt])
  @@map("conversations")
}

model Message {
  id             String      @id @default(uuid())
  conversationId String
  role           MessageRole
  content        String
  type           String?     // "text" | "summary" | "action_result"
  toolCalls      Json?       // AI tool calls made
  toolResults    Json?       // results from tool execution
  tokenCount     Int?
  metadata       Json        @default("{}")
  createdAt      DateTime    @default(now())

  conversation Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  @@index([conversationId])
  @@index([conversationId, createdAt])
  @@map("messages")
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
  TOOL
}

// ── AI MEMORY & INSIGHTS ─────────────────────────────────────

model AiMemory {
  id             String   @id @default(uuid())
  organizationId String
  key            String
  value          String
  confidence     Float    @default(0.5)
  label          String?
  expiresAt      DateTime?
  updatedAt      DateTime @updatedAt
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])

  @@unique([organizationId, key])
  @@index([organizationId])
  @@map("ai_memory")
}

model AiInsight {
  id             String   @id @default(uuid())
  organizationId String
  category       String
  title          String
  body           String
  priority       Int      @default(0)
  isRead         Boolean  @default(false)
  expiresAt      DateTime?
  metadata       Json     @default("{}")
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isRead])
  @@map("ai_insights")
}

// ── NOTIFICATIONS ───────────────────────────────────────────

model Notification {
  id             String             @id @default(uuid())
  organizationId String
  userId         String?
  type           NotificationType
  priority       NotificationPriority @default(INFO)
  title          String
  body           String?
  actionUrl      String?
  channel        NotificationChannel @default(IN_APP)
  isRead         Boolean            @default(false)
  readAt         DateTime?
  sentAt         DateTime?
  metadata       Json               @default("{}")
  createdAt      DateTime           @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, isRead])
  @@index([organizationId, createdAt])
  @@map("notifications")
}

enum NotificationType {
  NEW_ORDER
  ORDER_SHIPPED
  ORDER_DELIVERED
  LOW_STOCK
  PAYMENT_FAILED
  STORE_DISCONNECTED
  SYNC_ERROR
  RISK_ALERT
  TEAM_INVITE
  BILLING_REMINDER
}

enum NotificationPriority {
  URGENT
  IMPORTANT
  INFO
}

enum NotificationChannel {
  IN_APP
  EMAIL
  WHATSAPP
  SMS
  PUSH
}

// ── ACTIVITY & AUDIT LOGS ────────────────────────────────────

model ActivityLog {
  id             String   @id @default(uuid())
  organizationId String
  userId         String?
  action         String
  entity         String?
  entityId       String?
  summary        String
  metadata       Json     @default("{}")
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId, createdAt])
  @@index([organizationId, entity])
  @@map("activity_logs")
}

model AuditLog {
  id             String   @id @default(uuid())
  organizationId String
  userId         String?
  action         String
  table          String
  recordId       String
  before         Json?
  after          Json?
  ipAddress      String?
  userAgent      String?
  createdAt      DateTime @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User?        @relation(fields: [userId], references: [id])

  @@index([organizationId, table, recordId])
  @@index([organizationId, createdAt])
  @@map("audit_logs")
}

// ── API KEYS & WEBHOOKS ──────────────────────────────────────

model ApiKey {
  id             String    @id @default(uuid())
  organizationId String
  name           String
  keyHash        String    @unique // SHA-256 of actual key
  keyPrefix      String    // first 8 chars for display
  scopes         String[]
  lastUsedAt     DateTime?
  expiresAt      DateTime?
  isActive       Boolean   @default(true)
  createdAt      DateTime  @default(now())

  organization Organization @relation(fields: [organizationId], references: [id])

  @@index([organizationId])
  @@map("api_keys")
}

model Webhook {
  id             String   @id @default(uuid())
  organizationId String
  url            String
  secret         String   // for HMAC signature
  events         String[]
  isActive       Boolean  @default(true)
  failureCount   Int      @default(0)
  lastTriggeredAt DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization  @relation(fields: [organizationId], references: [id])
  deliveries   WebhookDelivery[]

  @@index([organizationId])
  @@map("webhooks")
}

model WebhookDelivery {
  id          String   @id @default(uuid())
  webhookId   String
  event       String
  payload     Json
  response    String?
  statusCode  Int?
  duration    Int?
  success     Boolean  @default(false)
  attempts    Int      @default(1)
  nextRetryAt DateTime?
  createdAt   DateTime @default(now())

  webhook Webhook @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  @@index([webhookId])
  @@map("webhook_deliveries")
}

// ── SYNC JOBS ────────────────────────────────────────────────

model SyncJob {
  id         String     @id @default(uuid())
  storeId    String
  type       SyncType
  status     JobStatus  @default(PENDING)
  progress   Int        @default(0)
  total      Int?
  error      String?
  startedAt  DateTime?
  finishedAt DateTime?
  createdAt  DateTime   @default(now())

  store Store @relation(fields: [storeId], references: [id])

  @@index([storeId, status])
  @@map("sync_jobs")
}

enum SyncType {
  FULL_ORDERS
  INCREMENTAL_ORDERS
  FULL_PRODUCTS
  INCREMENTAL_PRODUCTS
  CUSTOMERS
  ANALYTICS
}

enum JobStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

// ── FEATURE FLAGS ────────────────────────────────────────────

model FeatureFlag {
  id          String   @id @default(uuid())
  key         String   @unique
  description String?
  isGlobal    Boolean  @default(false)
  rolloutPct  Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  orgOverrides OrgFeatureFlag[]

  @@map("feature_flags")
}

model OrgFeatureFlag {
  id             String   @id @default(uuid())
  organizationId String
  flagKey        String
  enabled        Boolean  @default(false)
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  flag         FeatureFlag  @relation(fields: [flagKey], references: [key])

  @@unique([organizationId, flagKey])
  @@map("org_feature_flags")
}
```

---

## Phase 3: AI Architecture

### 3.1 Current State Problems

| Problem | Impact |
|---------|--------|
| Keyword matching NLP | Fragile — typos and new phrases break intent |
| Single-file response engine | Cannot scale, no tool composition |
| No real LLM integration | Responses are templated, not intelligent |
| No conversation memory persistence | Every session starts fresh |
| No context window management | Will hit limits at production |
| Injection detection is basic | 8 patterns insufficient for production |

### 3.2 Target AI Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      AI ORCHESTRATOR                         │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ Safety Layer │  │ Context      │  │ Permission       │  │
│  │              │  │ Builder      │  │ Checker          │  │
│  │ - Injection  │  │              │  │                  │  │
│  │ - PII mask   │  │ - Memory     │  │ - Role check     │  │
│  │ - Jailbreak  │  │ - Store data │  │ - Confirm tier   │  │
│  │ - Rate limit │  │ - History    │  │ - Action scope   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                    Claude API                        │   │
│  │  System Prompt + Context + Tools + User Message      │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  Tool Registry                       │   │
│  │  get_orders · accept_order · reject_order            │   │
│  │  create_shipment · update_stock · get_analytics      │   │
│  │  send_whatsapp · create_coupon · get_customers       │   │
│  │  get_insights · update_product · search_orders       │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │               Confirmation Layer                     │   │
│  │  Tier 1 (1-5 items): single confirm                  │   │
│  │  Tier 2 (6-20 items): double confirm + warning       │   │
│  │  Tier 3 (21+ items): require typed "تأكيد نهائي"    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 System Prompt Design

```
أنت ديما — المساعد الذكي لإدارة متاجر التجارة الإلكترونية.
تعمل مع التاجر: {merchant_name}
المتجر النشط: {store_name} ({platform})
الخطة: {plan}
الدور: {user_role}

## صلاحياتك:
{permissions_list}

## ذاكرتك عن المتجر:
{memory_context}

## بيانات حالية:
- الطلبات المعلقة: {pending_count} طلب
- إجمالي اليوم: {today_revenue} ر.س
- منتجات على وشك النفاد: {low_stock_products}

## قواعد أساسية:
1. تجاوب دائماً بالعربية ما لم يطلب المستخدم غير ذلك
2. قبل أي إجراء جماعي (+5 عناصر) احصل على تأكيد صريح
3. أبلّغ عن الطلبات المشبوهة قبل معالجتها
4. لا تكشف بيانات حساسة (tokens، passwords، card numbers)
5. كل قرار مالي فوق 1000 ر.س يحتاج تأكيداً ثانياً
6. سجّل كل إجراء في audit log

## أدواتك المتاحة:
{tools_list}
```

### 3.4 Tool Registry

```typescript
const TOOL_REGISTRY = {
  get_orders: {
    description: 'جلب قائمة الطلبات مع فلاتر',
    parameters: { status, city, payment, dateFrom, dateTo, limit },
    permission: 'orders:read',
    confirmTier: null,
  },
  accept_orders: {
    description: 'قبول طلب أو مجموعة طلبات',
    parameters: { orderIds: string[] },
    permission: 'orders:write',
    confirmTier: (count) => count <= 5 ? 1 : count <= 20 ? 2 : 3,
    riskCheck: true,
  },
  reject_order: {
    description: 'رفض طلب مع ذكر السبب',
    parameters: { orderId, reason },
    permission: 'orders:write',
    confirmTier: 1,
  },
  create_shipment: {
    description: 'إنشاء شحنة لطلب مقبول',
    parameters: { orderId, carrier, serviceType },
    permission: 'shipments:create',
    confirmTier: null, // auto-approve for single
  },
  update_product_price: {
    description: 'تحديث سعر منتج أو مجموعة منتجات',
    parameters: { productIds, newPrice | percentChange },
    permission: 'products:write',
    confirmTier: 2,
  },
  update_product_stock: {
    description: 'تحديث مخزون منتج',
    parameters: { productId, quantity, operation: 'set'|'add'|'subtract' },
    permission: 'products:write',
    confirmTier: 1,
  },
  create_coupon: {
    description: 'إنشاء كوبون خصم جديد',
    parameters: { code, type, value, expiresAt, maxUsage },
    permission: 'coupons:write',
    confirmTier: null,
  },
  get_analytics: {
    description: 'تقرير مبيعات وتحليلات',
    parameters: { period, groupBy, storeId },
    permission: 'analytics:read',
    confirmTier: null,
  },
  send_whatsapp: {
    description: 'إرسال رسالة واتساب للعميل',
    parameters: { phone, templateId, variables },
    permission: 'messaging:send',
    confirmTier: 1,
    featureFlag: 'whatsapp_beta',
  },
  get_customers: {
    description: 'جلب قائمة العملاء مع فلاتر',
    parameters: { segment, city, search, limit },
    permission: 'customers:read',
    confirmTier: null,
  },
  search: {
    description: 'بحث شامل في الطلبات والمنتجات والعملاء',
    parameters: { query, types },
    permission: 'orders:read',
    confirmTier: null,
  },
}
```

### 3.5 Memory Layer Architecture

```typescript
interface MemoryLayer {
  // Short-term: current conversation context (in-memory)
  conversationContext: {
    pendingConfirm: PendingConfirm | null
    lastMentionedOrders: string[]
    lastMentionedProducts: string[]
    activeFilters: Record<string, unknown>
  }

  // Medium-term: session data (Redis, TTL 24h)
  sessionMemory: {
    todayStats: DailyStats
    recentActions: ActionRecord[]
    activeStoreId: string
  }

  // Long-term: learned patterns (PostgreSQL ai_memory table)
  persistentMemory: {
    preferredCarrier: string       // confidence-weighted
    topSalesCity: string
    peakHour: string
    avgOrderValue: number
    returnRate: number
    codRejectionThreshold: number
    topProducts: string[]
  }
}
```

---

## Phase 4: API Architecture

### 4.1 Standards

- **Base URL:** `https://api.deema.ai/v1`
- **Auth:** Bearer JWT in `Authorization` header
- **Format:** JSON, snake_case keys, Arabic string values preserved
- **Pagination:** cursor-based `{ data, meta: { cursor, hasMore, total } }`
- **Errors:** `{ error: { code, message, details } }`
- **Versioning:** URL-based `/v1`, `/v2`
- **Rate Limits:** per-tier, per-org, per-endpoint
- **Idempotency:** `Idempotency-Key` header on mutations

### 4.2 Endpoint Map

#### Authentication
| Method | Path | Description | Rate Limit |
|--------|------|-------------|-----------|
| POST | `/auth/login` | Email + password login | 10/min |
| POST | `/auth/signup` | Create account + org | 5/min |
| POST | `/auth/refresh` | Refresh JWT | 60/min |
| POST | `/auth/logout` | Revoke session | 60/min |
| POST | `/auth/forgot-password` | Send reset email | 3/min |
| POST | `/auth/reset-password` | Set new password | 3/min |
| POST | `/auth/verify-email` | Verify email token | 10/min |
| GET | `/auth/me` | Current user + org | 120/min |

#### Stores
| Method | Path | Description |
|--------|------|-------------|
| GET | `/stores` | List org stores |
| POST | `/stores` | Add store |
| GET | `/stores/:id` | Store detail + health |
| PATCH | `/stores/:id` | Update store settings |
| DELETE | `/stores/:id` | Disconnect store |
| POST | `/stores/:id/sync` | Trigger full sync |
| GET | `/stores/:id/sync/status` | Sync job status |
| GET | `/stores/:id/health` | Connection health |
| POST | `/stores/oauth/salla` | Salla OAuth callback |
| POST | `/stores/oauth/zid` | Zid OAuth callback |
| POST | `/stores/oauth/shopify` | Shopify OAuth callback |

#### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List with filters (status, city, payment, date, risk, search) |
| GET | `/orders/:id` | Full order detail |
| POST | `/orders/:id/accept` | Accept order |
| POST | `/orders/:id/reject` | Reject with reason |
| POST | `/orders/bulk-accept` | Bulk accept (confirm required) |
| POST | `/orders/bulk-reject` | Bulk reject |
| GET | `/orders/:id/timeline` | Order event timeline |
| GET | `/orders/export` | CSV/XLSX export |
| GET | `/orders/risk` | High-risk orders only |

#### Products
| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List with filters |
| GET | `/products/:id` | Product detail + variants |
| POST | `/products` | Create product |
| PATCH | `/products/:id` | Update (price, stock, name) |
| DELETE | `/products/:id` | Deactivate product |
| POST | `/products/bulk-update-price` | Bulk price update |
| GET | `/products/low-stock` | Low stock alerts |
| POST | `/products/:id/variants` | Add variant |
| PATCH | `/products/:id/variants/:vid` | Update variant |

#### Customers
| Method | Path | Description |
|--------|------|-------------|
| GET | `/customers` | List with segment filter |
| GET | `/customers/:id` | Customer profile + history |
| GET | `/customers/:id/orders` | Customer's orders |
| PATCH | `/customers/:id` | Update segment, notes |
| POST | `/customers/:id/block` | Block customer |

#### Shipments
| Method | Path | Description |
|--------|------|-------------|
| POST | `/shipments` | Create shipment |
| GET | `/shipments/:id` | Shipment detail |
| GET | `/shipments/:id/track` | Live tracking events |
| GET | `/shipments/:id/waybill` | Download PDF |
| POST | `/orders/bulk-ship` | Bulk shipment creation |

#### Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/analytics/overview` | KPI summary (revenue, orders, AOV, conversion) |
| GET | `/analytics/orders` | Order trends by period |
| GET | `/analytics/products` | Product performance |
| GET | `/analytics/customers` | Customer analytics |
| GET | `/analytics/cities` | Geographic breakdown |
| GET | `/analytics/payments` | Payment method breakdown |
| GET | `/analytics/risk` | Risk score distribution |

#### AI / Chat
| Method | Path | Description |
|--------|------|-------------|
| GET | `/conversations` | List conversations |
| POST | `/conversations` | Start new conversation |
| GET | `/conversations/:id/messages` | Paginated messages |
| POST | `/conversations/:id/messages` | Send message (streaming) |
| DELETE | `/conversations/:id` | Archive conversation |
| GET | `/ai/memory` | Org AI memory |
| GET | `/ai/insights` | AI-generated insights |
| POST | `/ai/insights/:id/dismiss` | Mark insight read |

#### Team
| Method | Path | Description |
|--------|------|-------------|
| GET | `/team` | List members |
| POST | `/team/invite` | Send invite email |
| PATCH | `/team/:memberId/role` | Change role |
| PATCH | `/team/:memberId/permissions` | Custom permissions |
| DELETE | `/team/:memberId` | Remove member |
| GET | `/team/invites` | Pending invites |
| DELETE | `/team/invites/:id` | Revoke invite |

#### Billing
| Method | Path | Description |
|--------|------|-------------|
| GET | `/billing/plan` | Current plan + usage |
| GET | `/billing/plans` | All available plans |
| POST | `/billing/upgrade` | Upgrade/downgrade plan |
| GET | `/billing/invoices` | Invoice history |
| GET | `/billing/invoices/:id/pdf` | Download invoice |
| POST | `/billing/portal` | Redirect to payment portal |

#### Webhooks & API Keys
| Method | Path | Description |
|--------|------|-------------|
| GET | `/webhooks` | List webhooks |
| POST | `/webhooks` | Register webhook |
| PATCH | `/webhooks/:id` | Update |
| DELETE | `/webhooks/:id` | Delete |
| GET | `/webhooks/:id/deliveries` | Delivery history |
| GET | `/api-keys` | List API keys |
| POST | `/api-keys` | Generate new key |
| DELETE | `/api-keys/:id` | Revoke key |

---

## Phase 5: Integration Architecture

### 5.1 Salla Integration

```
OAuth Flow:
1. Merchant clicks "Connect Salla"
2. Redirect → https://accounts.salla.sa/oauth/authorize?client_id=...&scope=orders.read,orders.write,products.read,products.write
3. Merchant approves → callback to /stores/oauth/salla?code=...
4. Exchange code for access_token + refresh_token
5. Store encrypted tokens in platform_connections table
6. Trigger initial full sync (orders 90d, products all)
7. Register webhooks: order.created, order.updated, product.updated

Token Refresh: 30min before expiry via BullMQ scheduler
Webhook Events: order.created, order.status.updated, product.quantity.updated
Rate Limit: 1000 req/min (Salla API), queue requests if approaching
```

### 5.2 Zid Integration

```
OAuth Flow: Similar to Salla
Scopes: store.orders, store.products, store.customers
Webhook Events: order_created, order_updated, product_updated
Special: Arabic-first API, all amounts in halalat (not SAR)
```

### 5.3 Shopify Integration

```
OAuth Flow: Partner-level app installation
Required Scopes: read_orders, write_orders, read_products, write_products, read_customers
Webhook Topics: orders/create, orders/updated, products/update, inventory_levels/update
Shopify-specific: Mandatory HMAC webhook verification, handle 429 with Retry-After
```

### 5.4 Carrier Integrations

**SMSA:**
```
Auth: Basic (username + password from Integration table, encrypted)
Create Shipment: POST /api/createShipment
Track: GET /api/track?awb={trackingNumber}
Waybill PDF: GET /api/printAWB?awb={trackingNumber}
```

**Aramex:**
```
Auth: API key in header
Create: POST https://ws.aramex.net/ShippingAPI.V2/Shipping/CreateShipments
Track: POST https://ws.aramex.net/ShippingAPI.V2/Tracking/TrackShipments
```

### 5.5 WhatsApp Cloud API

```
Auth: Long-lived access token (encrypted) from Meta Business Manager
Send Template: POST https://graph.facebook.com/v17.0/{phone_id}/messages
Templates needed:
  - order_confirmed: "طلبك #{order_id} تم قبوله وسيُشحن قريباً"
  - order_shipped: "طلبك #{order_id} في الطريق إليك. رقم التتبع: {tracking}"
  - order_rejected: "عذراً، تعذّر معالجة طلبك #{order_id}"
  - low_stock_alert: "المنتج {product_name} وصل لـ {stock} وحدة"
Rate limit: 1000 template messages/day per number
```

### 5.6 Sync Engine Architecture

```
┌─────────────────────────────────────────────────────┐
│                    SYNC ENGINE                      │
│                                                     │
│  BullMQ Queues:                                     │
│  ├── sync:orders     (concurrency: 5)               │
│  ├── sync:products   (concurrency: 3)               │
│  ├── sync:customers  (concurrency: 2)               │
│  ├── webhook:inbound (concurrency: 10)              │
│  └── notification    (concurrency: 10)              │
│                                                     │
│  Schedules (Bull Cron):                             │
│  ├── Every 15min: incremental orders sync           │
│  ├── Every 1h: product stock sync                   │
│  ├── Every 4h: customer data sync                   │
│  ├── Every 24h: full analytics recalculation        │
│  └── Daily 2am: AI memory refresh                   │
│                                                     │
│  Retry Strategy: exponential backoff                │
│  Max retries: 3 (webhooks: 5)                       │
│  Dead Letter Queue: failed jobs after max retries   │
└─────────────────────────────────────────────────────┘
```

---

## Phase 6: Frontend Architecture

### 6.1 Complete Page Map

```
/                     Landing page
/login                Auth (login/signup/reset) ✅
/onboarding           Platform wizard (4 steps)
  /onboarding/step-1  Platform selection
  /onboarding/step-2  Connect (OAuth / API key)
  /onboarding/step-3  Sync confirmation
  /onboarding/step-4  Welcome tour ← MISSING

/dashboard            AI chat interface ✅
/orders               Order management table ← MISSING
/orders/:id           Order detail ← MISSING (drawer ✅)
/products             Product catalog ← MISSING
/products/:id         Product detail ← MISSING
/customers            Customer list ✅
/reports              Analytics ✅
/insights             AI memory layer ✅
/activity             Activity log ✅
/coupons              Coupon management ← MISSING
/stores               Store management ✅
/connectors           Integrations ✅
/notifications        Notification center ✅
/team                 Team management ✅
/billing              Subscription ✅
/settings             Preferences ✅
/profile              Account settings ← MISSING
```

### 6.2 Component Hierarchy

```
App
├── Layout (auth-required wrapper)
│   ├── Sidebar
│   │   ├── ConversationList
│   │   ├── StoreSelector
│   │   ├── ConnectorsSummary
│   │   ├── NotificationPanel
│   │   └── BottomNav
│   └── Main
│       ├── TopBar
│       │   ├── StoreSwitcher
│       │   ├── LiveStats
│       │   ├── SearchTrigger ✅
│       │   ├── NavLinks
│       │   ├── NotificationBell
│       │   └── UserAvatar
│       └── [Page Content]
│
├── Shared Components
│   ├── SearchModal ✅
│   ├── OrderDetailDrawer ✅
│   ├── ProductEditDrawer ← MISSING
│   ├── CustomerProfileModal ← MISSING
│   ├── ConfirmationModal (tier 1/2/3)
│   ├── EmptyState ← MISSING
│   ├── LoadingState ← MISSING
│   ├── ErrorBanner ← MISSING
│   ├── RiskBadge ✅
│   ├── StatusBadge
│   ├── ConfidenceBar ✅
│   └── Toast notifications ← MISSING
│
└── Pages
    ├── Dashboard (chat + message renderer)
    ├── Orders (table, filters, bulk actions)
    ├── Products (grid/table, stock management)
    ├── Customers (list, segments, profile)
    ├── Reports (KPIs, charts, city breakdown)
    ├── Insights (AI memory cards)
    └── [all others]
```

### 6.3 State Management Strategy

For the production build (Next.js migration):

```typescript
// Global state: Zustand
stores: {
  auth: { user, org, permissions, logout }
  chat: { conversations, activeConversation, messages, pendingConfirm, isTyping }
  orders: { list, filters, selected, bulkAction }
  products: { list, filters, lowStock }
  ui: { sidebarOpen, activeDrawer, toast, searchOpen }
}

// Server state: TanStack Query (React Query)
queries: {
  useOrders(filters) → Order[]
  useOrder(id) → Order
  useProducts(filters) → Product[]
  useAnalytics(period) → AnalyticsSummary
  useCustomers(filters) → Customer[]
  useConversations() → Conversation[]
  useInsights() → AiInsight[]
}

// Real-time: Pusher channels
channels: {
  `private-org-${orgId}` → new orders, notifications, sync status
  `private-user-${userId}` → personal notifications
}
```

---

## Phase 7: Security Architecture

### 7.1 Authentication

```
JWT Access Token: 15min expiry, signed RS256
Refresh Token: 30 days, rotated on use, stored httpOnly cookie
Session tracking: device fingerprint + IP recorded
2FA: TOTP (Google Authenticator / Authy) — stored encrypted

Failed login: exponential backoff (5 failures → 15min lockout)
Password policy: min 8 chars, 1 uppercase, 1 number
Password storage: bcrypt cost factor 12
```

### 7.2 RBAC Matrix

| Permission | Admin | Order Manager | Customer Service | Analyst | Viewer |
|-----------|-------|--------------|-----------------|---------|--------|
| orders:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| orders:write | ✅ | ✅ | ❌ | ❌ | ❌ |
| orders:bulk | ✅ | ✅ | ❌ | ❌ | ❌ |
| products:read | ✅ | ✅ | ❌ | ✅ | ✅ |
| products:write | ✅ | ❌ | ❌ | ❌ | ❌ |
| customers:read | ✅ | ✅ | ✅ | ✅ | ❌ |
| customers:write | ✅ | ❌ | ✅ | ❌ | ❌ |
| analytics:read | ✅ | ❌ | ❌ | ✅ | ❌ |
| team:manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| billing:manage | ✅ | ❌ | ❌ | ❌ | ❌ |
| ai:chat | ✅ | ✅ | ✅ | ✅ | ❌ |
| ai:bulk_actions | ✅ | ✅ | ❌ | ❌ | ❌ |
| integrations:manage | ✅ | ❌ | ❌ | ❌ | ❌ |

### 7.3 Multi-Tenant Security

```sql
-- Row Level Security on every table
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY org_isolation ON orders
  USING (store_id IN (
    SELECT id FROM stores WHERE organization_id = current_setting('app.org_id')
  ));

-- Set org context on every request
SET LOCAL app.org_id = '{org_id}';
```

### 7.4 Secrets Management

```
Encryption at rest: AES-256-GCM for tokens in DB
Key management: AWS KMS or HashiCorp Vault
Environment secrets: never in code, always env vars
Token masking in logs: last 4 chars only
Webhook secrets: HMAC-SHA256 signature verification
API keys: hashed SHA-256, only prefix stored for display
```

### 7.5 AI-Specific Security

```
Prompt injection: 
  - Structural validation before LLM call
  - Tool call permission re-check after LLM generates
  - Never execute "system:" prefixed tool calls from user input

PII handling:
  - Never log full phone numbers or emails
  - Mask in Claude API responses before storage

Jailbreak protection:
  - System prompt pinning (always last message)
  - Output filtering for sensitive patterns
  - Rate limit per conversation per minute

Context leakage:
  - Never include other org's data in context
  - Validate all tool output entity ownership before returning
```

---

## Phase 8: Infrastructure Architecture

### 8.1 Stack

```
Frontend:  Next.js 14 (App Router) + TypeScript + Tailwind CSS v4
Backend:   Next.js API Routes + Prisma + PostgreSQL
AI:        Anthropic Claude API (claude-sonnet-4-6) with tool use + streaming
Cache:     Redis (Upstash) — sessions, rate limits, live stats
Queue:     BullMQ (Redis) — sync jobs, webhooks, notifications
Storage:   Cloudflare R2 — waybills, invoices, product images
Real-time: Pusher — new orders, AI streaming, sync status
Monitoring: Sentry (errors) + PostHog (analytics) + Datadog (infra)
Auth:      Custom JWT + bcrypt (no NextAuth complexity)
Email:     Resend or AWS SES
```

### 8.2 Project Structure (Next.js)

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx         ← auth + sidebar wrapper
│   │   ├── page.tsx           ← /dashboard (chat)
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── products/page.tsx
│   │   ├── customers/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── insights/page.tsx
│   │   ├── stores/page.tsx
│   │   ├── connectors/page.tsx
│   │   ├── team/page.tsx
│   │   ├── billing/page.tsx
│   │   └── settings/page.tsx
│   └── api/
│       ├── auth/[...]/route.ts
│       ├── stores/[...]/route.ts
│       ├── orders/[...]/route.ts
│       ├── products/[...]/route.ts
│       ├── customers/[...]/route.ts
│       ├── analytics/[...]/route.ts
│       ├── chat/[...]/route.ts    ← streaming
│       ├── webhooks/[platform]/route.ts
│       └── cron/[...]/route.ts
├── components/
│   ├── layout/
│   ├── chat/
│   ├── orders/
│   ├── products/
│   ├── shared/
│   └── ui/
├── lib/
│   ├── prisma.ts
│   ├── redis.ts
│   ├── ai/
│   │   ├── orchestrator.ts
│   │   ├── tools/
│   │   ├── memory.ts
│   │   └── safety.ts
│   ├── integrations/
│   │   ├── salla.ts
│   │   ├── zid.ts
│   │   ├── shopify.ts
│   │   ├── smsa.ts
│   │   └── whatsapp.ts
│   ├── queue/
│   │   ├── workers/
│   │   └── scheduler.ts
│   └── auth.ts
└── store/           ← Zustand client stores
```

### 8.3 Queue Topology

```
Queues (BullMQ + Redis):
├── sync-orders      Priority: high,  Concurrency: 5,  Retry: 3
├── sync-products    Priority: medium, Concurrency: 3,  Retry: 3
├── sync-customers   Priority: low,   Concurrency: 2,  Retry: 2
├── webhooks-inbound Priority: high,  Concurrency: 20, Retry: 5
├── notifications    Priority: medium, Concurrency: 10, Retry: 2
├── ai-memory        Priority: low,   Concurrency: 1,  Retry: 1
└── shipments        Priority: high,  Concurrency: 5,  Retry: 3

Scheduled Jobs (Bull Cron):
├── */15 * * * *   → sync:incremental:orders (all active stores)
├── 0 * * * *      → sync:products:stock (all active stores)
├── 0 */4 * * *    → sync:customers
├── 0 2 * * *      → ai:memory:refresh (recalculate all insights)
└── 0 8 * * *      → notifications:daily-brief (for enabled orgs)
```

### 8.4 Caching Strategy

```
Redis Keys:
├── session:{token}           TTL: 7d   → session data
├── org:{id}:stats:today      TTL: 5min → live KPIs
├── org:{id}:orders:pending   TTL: 1min → pending count
├── org:{id}:stock:low        TTL: 15min → low stock list
├── store:{id}:products       TTL: 30min → product list
├── rate:{ip}:{endpoint}      TTL: 1min → rate limiting
└── ai:memory:{orgId}         TTL: 4h   → AI memory cache
```

### 8.5 Observability

```
Sentry:
  - Every API error with full context
  - AI tool call failures
  - Integration sync failures
  - Performance monitoring (P95 < 500ms target)

PostHog:
  - Feature flag evaluation
  - Conversation volume by intent
  - Action success/failure rates
  - Onboarding funnel completion
  - Plan upgrade events

Custom Metrics (DataDog/CloudWatch):
  - Queue depth per queue
  - Sync job duration + success rate
  - AI token usage per org
  - Webhook delivery rate
  - Order processing latency
```

---

## Phase 9: Gap Analysis

| # | Area | Current State | Missing | Why It Matters | Solution | Priority | Complexity |
|---|------|--------------|---------|----------------|----------|----------|-----------|
| 1 | Auth | None | Complete auth layer | Anyone can access dashboard | JWT + bcrypt + sessions | **Critical** | High |
| 2 | Backend | None | API + DB | No persistence, no real data | Next.js API + PostgreSQL + Prisma | **Critical** | Very High |
| 3 | Real AI | Mock responses | Claude API integration | Current "AI" is just if/else | Claude API with tool use | **Critical** | High |
| 4 | Mobile | Broken | Responsive layout | 60%+ Arabic merchants are mobile-first | CSS breakpoints + mobile nav | **Critical** | Medium |
| 5 | Real-time | Polling | WebSocket/Pusher | Merchants miss new orders | Pusher channels | **Critical** | Medium |
| 6 | Orders page | None | /orders with filters/table | No way to see all orders | Dedicated orders table page | **High** | Medium |
| 7 | Products page | None | /products CRUD | No product management | Dedicated products page | **High** | Medium |
| 8 | Onboarding step 4 | Missing | Welcome tour | Merchants don't know how to use AI | Guided tour with sample commands | **High** | Low |
| 9 | Empty states | None | All empty states | Confusing for new users | Per-page empty state components | **High** | Low |
| 10 | Loading states | None | Skeleton screens | Jarring UX on data load | Skeleton components | **High** | Low |
| 11 | Error states | None | Error boundaries | Silent failures confuse users | Error boundary + toast | **High** | Low |
| 12 | Search | Basic (now built) | Full search | Can't find order 10234 quickly | Search modal with keyboard nav ✅ | **High** | Done |
| 13 | Order detail | Drawer built | Fully functional drawer | Clicking order shows nothing | OrderDetailDrawer ✅ | **High** | Done |
| 14 | Coupon page | None | /coupons CRUD | Can't manage coupons visually | Coupons page with metrics | **Medium** | Medium |
| 15 | Reports | Built | Production data source | Mock data only | Connect to real analytics API | **Medium** | Medium |
| 16 | Customers | Built | Full customer profiles | No customer management | Customers page ✅ | **High** | Done |
| 17 | OAuth flows | None | Salla/Zid/Shopify OAuth | Can't actually connect a real store | Platform OAuth handlers | **Critical** | High |
| 18 | Sync engine | None | BullMQ sync workers | Orders never update in real-time | Queue-based sync engine | **Critical** | Very High |
| 19 | Webhooks | None | Platform webhook handling | Missed order events | Webhook receivers per platform | **Critical** | High |
| 20 | WhatsApp | UI only | WhatsApp Cloud API | Can't send customer notifications | WhatsApp integration | **High** | Medium |
| 21 | Carrier APIs | UI only | SMSA/Aramex API | Can't create real shipments | Carrier API integrations | **High** | High |
| 22 | Audit log | Basic | Immutable audit trail | Compliance, debugging | DB audit_logs table + triggers | **High** | Medium |
| 23 | AI memory | In-memory | Persistent DB memory | Insights reset on deploy | AiMemory table in PostgreSQL | **High** | Medium |
| 24 | Conversation history | None | Message persistence | Chat lost on reload | Conversation + Message tables | **High** | Medium |
| 25 | Risk scoring | Basic (built) | ML-based scoring | Rule-based too rigid | Historical data + scoring model | **Medium** | High |
| 26 | Team permissions | UI only | API-enforced RBAC | UI can be bypassed | Server-side permission checks | **Critical** | Medium |
| 27 | Multi-tenant isolation | None | RLS + org scoping | Data leakage between orgs | PostgreSQL RLS policies | **Critical** | High |
| 28 | API keys | None | Developer API | Can't build integrations | API key management system | **Medium** | Medium |
| 29 | Webhooks (outbound) | None | Merchant webhooks | Can't push events to merchant apps | Webhook delivery system | **Medium** | Medium |
| 30 | Billing integration | UI only | Payment provider | Can't charge merchants | Stripe / HyperPay integration | **Critical** | High |
| 31 | Email system | None | Transactional emails | No order notifications, no password reset | Resend / SES integration | **Critical** | Low |
| 32 | Token encryption | None | AES-256 for credentials | API tokens stored in plaintext | Encrypt all credentials at rest | **Critical** | Low |
| 33 | Rate limiting | None | Per-endpoint limits | API abuse possible | Redis-based rate limiter | **Critical** | Low |
| 34 | Input validation | None | Request validation | SQL injection, XSS possible | Zod schema validation on all inputs | **Critical** | Low |
| 35 | Prompt injection | Basic | Production-grade guard | AI can be manipulated | Claude system prompt hardening + output filter | **Critical** | Medium |
| 36 | File storage | None | R2 / S3 | No waybill PDF, no product images | Cloudflare R2 bucket | **High** | Low |
| 37 | Analytics charts | Static mock | Real chart library | Can't show live data | Recharts / Chart.js with real data | **Medium** | Low |
| 38 | Toast notifications | None | Notification toasts | Bulk actions give no feedback | Toast component system | **High** | Low |
| 39 | Offline handling | None | Offline detection | Merchant doesn't know if disconnected | Navigator.onLine + offline banner | **Medium** | Low |
| 40 | i18n / L10n | Partial Arabic | Full RTL + English toggle | Some labels still in English | next-intl with ar/en support | **Medium** | Medium |
| 41 | PWA / Mobile app | None | PWA manifest | Mobile merchants need home screen | next-pwa + service worker | **Medium** | Low |
| 42 | Data export | None | CSV/XLSX export | Merchants need data portability | Server-side export endpoint | **Medium** | Low |
| 43 | 2FA | UI only | Real TOTP implementation | Security gap | speakeasy + QR code flow | **High** | Medium |
| 44 | Session management | None | Active session list | Can't revoke compromised sessions | Session table + revocation | **High** | Low |

---

## Phase 10: Development Roadmap

### Milestone 1 — Foundation (Weeks 1-3)
**Goal:** Working backend, auth, database, and basic API

**Deliverables:**
- PostgreSQL + Prisma schema (all tables)
- Next.js project setup (App Router)
- JWT auth (login, signup, refresh, logout)
- Middleware: auth guard, org context, rate limiting
- Core API: /orders, /products (read-only initially)
- Redis setup for caching + sessions
- Environment configuration (dev/staging/prod)
- CI/CD pipeline (GitHub Actions → Vercel/Railway)

**Success Metrics:**
- Auth flow end-to-end working
- 10 API endpoints tested and documented
- 0 security vulnerabilities in SAST scan

---

### Milestone 2 — AI Production (Weeks 4-6)
**Goal:** Real Claude API replacing mock response engine

**Deliverables:**
- Claude API integration with tool use
- Tool registry (12 core tools)
- Context builder (memory + store stats + conversation history)
- Safety layer (injection detection, output filtering, permission re-check)
- Confirmation layer (Tier 1/2/3)
- Conversation persistence (DB + Redis cache)
- Streaming responses (SSE)
- AI memory persistence (AiMemory table)
- Prompt injection hardening

**Success Metrics:**
- All 30+ intents handled by Claude (not keyword matching)
- P95 response time < 3s for chat
- 0 successful injection attacks in red team test

---

### Milestone 3 — Integrations (Weeks 7-10)
**Goal:** Real store connections and live data

**Deliverables:**
- Salla OAuth + webhook receiver
- Zid OAuth + webhook receiver
- Shopify OAuth + webhook receiver
- BullMQ sync engine (orders, products, customers)
- SMSA carrier API
- Aramex carrier API
- WhatsApp Cloud API (template messages)
- Full sync UI (status, progress, error recovery)
- Email system (Resend)

**Success Metrics:**
- Connect a real Salla store in < 2 minutes
- Orders sync within 1 minute of being placed
- Shipment creation success rate > 95%

---

### Milestone 4 — Frontend Production (Weeks 11-13)
**Goal:** Complete UX, all pages, mobile responsive

**Deliverables:**
- Mobile-responsive layout (all pages)
- /orders full table with filters, bulk actions, export
- /products CRUD with variant management
- /coupons management page
- Onboarding step 4 (welcome tour)
- Empty states on every page
- Loading skeletons
- Error boundaries + toast notifications
- Real-time: Pusher (new orders, notifications)
- Search modal fully functional with real data
- OrderDetailDrawer with real actions

**Success Metrics:**
- Lighthouse mobile score > 85
- All user flows completable without confusion
- Merchant can complete "accept all pending orders" in < 30 seconds

---

### Milestone 5 — Billing & Scale (Weeks 14-16)
**Goal:** Monetization, performance, multi-tenant hardening

**Deliverables:**
- HyperPay / Stripe billing integration
- Plan enforcement (order limits, team limits, feature flags)
- Invoice generation + PDF download
- PostgreSQL RLS policies (all tables)
- API key management
- Outbound webhooks
- Rate limiting (per plan, per endpoint)
- Audit log with before/after values
- Sentry + PostHog integration
- Load testing (target: 1000 concurrent merchants)

**Success Metrics:**
- Merchant can self-serve upgrade/downgrade plan
- Zero cross-tenant data leakage in security audit
- API sustains 500 req/s under load test

---

### Milestone 6 — Launch (Weeks 17-18)
**Goal:** Production launch readiness

**Deliverables:**
- Security audit + penetration test
- Arabic content review (UI copy, AI responses)
- Help center / documentation
- Onboarding email sequence
- Analytics dashboards (PostHog)
- Runbook for incident response
- Backup strategy (daily PG dumps, point-in-time recovery)
- SLA monitoring + PagerDuty alerts
- Public status page

**Success Metrics:**
- 0 Critical security findings
- Uptime SLA 99.9% in first month
- First 10 paying merchants onboarded
- NPS > 60 from beta users

---

## Appendix: Current vs Target Architecture

```
CURRENT:                          TARGET (Production):
─────────────────────             ──────────────────────────────────
React SPA (Vite)           →      Next.js 14 (App Router)
In-memory mock data        →      PostgreSQL + Prisma
No auth                    →      JWT + bcrypt + refresh tokens
Keyword NLP                →      Claude API with tool use
No backend                 →      Next.js API routes
No real-time               →      Pusher WebSocket channels
No integrations            →      Salla + Zid + Shopify + SMSA + WhatsApp
No queue                   →      BullMQ + Redis workers
No file storage            →      Cloudflare R2
No monitoring              →      Sentry + PostHog + Datadog
No billing                 →      HyperPay / Stripe
No RBAC enforcement        →      Middleware + RLS
No audit trail             →      Immutable audit_logs table
```

---

*Generated by Deema Production Blueprint v1.0 — Engineering Team Reference*  
*All architectural decisions are production-ready and immediately implementable.*
