# Demaa — Features, Pages & Flows

Demaa is an AI-powered seller operations platform for Arabic e-commerce businesses. It connects to online stores (Shopify, Wuilt, Shantaweb), centralizes order and product management, and lets sellers run their entire operation through a conversational AI assistant.

---

## Pages

### Public / Marketing
| Page | Description |
|------|-------------|
| **Landing** | Hero section, feature highlights, AI chat demo, pricing preview, CTA |
| **Features** | Detailed feature breakdown with screenshots |
| **Platforms** | Supported e-commerce platforms (Shopify, Wuilt, Shantaweb) |
| **Pricing** | Plan comparison table (Starter / Growth / Scale) |
| **Blog** | Articles list |
| **Blog Post** | Individual article view |
| **Changelog** | Product update history |
| **About** | Company story |
| **Careers** | Open positions |
| **Contact** | Contact form |
| **Privacy Policy** | Data privacy terms |
| **Terms of Service** | Legal terms |
| **Security** | Security practices |
| **Cookies** | Cookie policy |

### Auth
| Page | Description |
|------|-------------|
| **Login** | Email + password sign-in, redirect to dashboard |
| **Onboarding** | Connect first store (OAuth flow for Shopify etc.) |

### App (requires login)
| Page | Description |
|------|-------------|
| **Dashboard** | KPI cards (revenue, orders, AOV, conversion), charts, AI chat panel |
| **Orders** | Order list with filters, status badges, accept/reject/ship actions |
| **Products** | Product grid with images, stock badges, add/edit/delete, image upload |
| **Customers** | Customer list, segments (new/VIP/churn), block/unblock |
| **Stores** | Connected store cards, pause/resume/delete, sync status |
| **Connectors** | Third-party app integrations |
| **Reports** | Revenue charts, period comparison, profit breakdown |
| **Insights** | AI-generated business insights and recommendations |
| **Coupons** | Create/manage discount coupons |
| **Team** | Invite/remove team members, role management |
| **Notifications** | System alerts and order events |
| **Activity Log** | Full audit trail of all actions |
| **Settings** | Profile, store config, preferences |
| **Billing** | Current plan, usage meter, upgrade |
| **Subscribe** | Plan selection and checkout |

---

## Core Features

### AI Assistant (Chat)
- Embedded chat panel on the Dashboard
- Understands Arabic natural language (60+ intent patterns)
- Powered by **Groq (Llama 3.3 70B)** when API key is set, falls back to built-in rule engine
- **Voice input** — tap mic to speak, transcribed via Whisper API
- Responds with structured data cards (order tables, charts, product lists)
- Supports markdown in responses (bold, lists, tables)
- Memory — remembers seller preferences across sessions

#### What you can ask the AI
| Category | Example requests |
|----------|-----------------|
| Orders | "Show pending orders", "Accept all orders", "Reject order #123", "Create new order" |
| Shipping | "Ship today's orders", "Track shipment", "Show delayed orders", "Show cash orders" |
| Products | "Low stock products", "Update price of X to 150", "Add new product", "Deactivate product X" |
| Analytics | "Today's revenue", "Compare today vs yesterday", "Sales forecast", "Profit report" |
| Customers | "Show VIP customers", "Block customer X", "Add new customer", "Churned customers" |
| Coupons | "Create 20% coupon", "Show active coupons", "Delete coupon SAVE10" |
| Team | "Who's on my team?", "Invite ahmed@email.com as manager", "Remove team member" |
| Stores | "Show my stores", "Which store is active?" |
| Cash | "Cash on delivery orders", "Mark payment collected for order #456" |

### Order Management
- View all orders across connected stores in one place
- Filter by status: pending / accepted / rejected / shipped / delivered
- Accept, reject (with reason), or ship individual or bulk orders
- Risk scoring — flags suspicious orders automatically
- Cash-on-delivery tracking and collection marking
- Return/refund creation and tracking
- Order detail drawer with full customer and item info
- External order reference (Shopify order ID) linking

### Product Management
- Full product catalog with images, SKU, price, stock, category
- **Image upload** — drag-and-drop or click to upload via Cloudinary (auto-resized 800×800)
- **AI image suggestions** — powered by Pexels API, suggests photos based on product name/category
- **Shopify sync** — products (including images) sync automatically from connected stores
- Create products via chat: "Add product iPhone case, price 99, stock 50"
- Stock alerts with low-stock badges
- Bulk price update via chat
- Activate/deactivate products

### Store Management
- Connect multiple stores (Shopify OAuth, Wuilt, Shantaweb)
- Switch active store from the header dropdown
- Pause/resume store sync
- Delete store
- Real-time sync status indicator

### Customer Management
- Unified customer database across all stores
- Segments: New / Returning / VIP / At-risk / Churned
- Block/unblock customers
- Order history per customer
- Add customers manually or via chat

### Analytics & Reports
- Revenue by day/week/month
- Order count and AOV trends
- Period-over-period comparison
- Profit report (revenue minus costs)
- Sales forecast (AI-powered)
- Inventory report (stock levels, low stock alerts)
- Top products by revenue
- Top customers by spend

### Team Management
- Invite team members by email
- Roles: Admin / Order Manager
- Remove members
- Full activity log per member

### Coupons
- Create percentage or fixed-amount coupons
- Set min order value, max usage, expiry date
- Track usage count
- Active/inactive toggle

### Notifications
- Real-time alerts for new orders, low stock, failed deliveries
- Priority levels: info / warning / critical
- Mark as read

### Billing & Subscriptions
- Plan tiers: Starter / Growth / Scale
- Orders processed usage meter
- Upgrade/downgrade flow
- Payment via Stripe (PaymentCallback handler)

---

## Technical Flows

### Authentication Flow
1. User visits `/login` → enters email + password
2. Server validates, returns JWT token
3. Token stored in `localStorage` as `deema_token`
4. All API calls include `Authorization: Bearer <token>`
5. On 401, user is redirected to `/login`

### Store Connection Flow (Shopify example)
1. User clicks "Connect Store" → goes to `/onboarding`
2. Enters store domain → server generates OAuth state + redirect URL
3. User approves on Shopify → callback hits `/api/oauth/callback`
4. Server exchanges code for access token, saves to DB
5. Product and order sync starts automatically

### Product Image Flow
1. User uploads image → `POST /api/products/:id/image` with multipart form
2. Server receives buffer via Multer, uploads to Cloudinary
3. Cloudinary auto-resizes to 800×800, optimizes quality/format
4. `imageUrl` saved to product in DB
5. Old image deleted from Cloudinary on replace

### AI Chat Flow
1. User sends message → `POST /api/ai/chat`
2. Server checks if GROQ_API_KEY is set:
   - **With Groq**: sends to Llama 3.3 70B with tool definitions, handles tool calls, returns result
   - **Without Groq**: freeEngine matches Arabic intent patterns, executes matching tool
3. Tool executor runs DB queries via Prisma
4. Response streamed back as JSON with content + optional structured data

### Voice Input Flow
1. User taps mic button → browser records audio
2. Audio blob sent to `/api/voice/transcribe`
3. Server forwards to Whisper API (Groq)
4. Transcribed text inserted into chat input automatically

---

## Database (Turso / libsql)

23 tables covering: organizations, users, sessions, team_memberships, stores, orders, order_items, products, customers, shipments, returns, coupons, conversations, messages, ai_memory, notifications, activity_logs, subscriptions, usage_records, webhook_events, connector_states, webhook_registrations, oauth_states.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS |
| Backend | Node.js, Express 5, TypeScript |
| Database | Turso (libsql/SQLite cloud) via Prisma 7 |
| AI | Groq (Llama 3.3 70B) + built-in Arabic rule engine |
| Images | Cloudinary (upload, resize, optimize) |
| Image Search | Pexels API |
| Auth | JWT (localStorage) |
| Deployment | Railway (backend + frontend served as static) |
| Voice | Whisper via Groq API |
