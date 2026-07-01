# Al Madina Ittar — Backend Technical Documentation

Official backend technical documentation for the **Al Madina Ittar** platform — a
production-ready REST API for a luxury Arabian perfume (ittar) eCommerce
experience. This document describes the **current** implementation and is kept
in sync with the codebase; where documentation and code ever disagree, the code
is authoritative.

---

## 1. Overview

Al Madina is a REST API powering a mobile-first luxury perfume storefront. It
serves a customer-facing catalogue (products, categories, collections, search,
reviews), account features (auth, wishlist, orders, notifications, preferences),
guest checkout, a contact form, and a role-gated admin panel (catalogue CRUD,
order management, customer management, dashboards, broadcasts, uploads).

### Technology Stack

| Concern            | Technology                                       |
| ------------------ | ------------------------------------------------ |
| Runtime            | Node.js ≥ 20                                      |
| Language           | TypeScript 5 (strict)                            |
| Web framework      | Express 4                                        |
| Database           | MongoDB                                          |
| ODM                | Mongoose 8                                        |
| Cache / queue back | Redis (via ioredis)                             |
| Background jobs    | BullMQ                                            |
| Auth               | JWT access tokens + opaque hashed refresh tokens |
| Password hashing   | bcrypt                                           |
| Validation         | Zod                                              |
| File storage       | Cloudinary (via Multer in-memory buffers)        |
| Email              | Nodemailer (SMTP)                               |
| Logging            | Pino (+ pino-http, morgan in dev)                |
| Security           | Helmet, CORS, express-rate-limit, sanitize-html  |
| API docs           | swagger-jsdoc + swagger-ui-express               |
| Testing            | Jest, Supertest, mongodb-memory-server           |

### Architecture Summary

The API follows a **layered, modular monolith** design:

```
Route → Middleware (auth / validation / rate-limit) → Controller → Service → Repository → Mongoose Model → MongoDB
```

- **Feature modules** under `src/modules/*` each own their routes, controller,
  service, repository, and Zod schemas.
- **Cross-cutting infrastructure** (config, database, redis, logging, jobs,
  storage, emails, middleware, utilities) lives outside the modules and is
  shared.
- **Background work** (emails, push notifications, in-app notifications) is
  offloaded to BullMQ queues backed by Redis and never blocks a request.
- **Caching** of hot read paths (catalogue rails, categories, collections,
  product detail, search) uses Redis with best-effort semantics.

---

## 2. Project Structure

```
al-madina-api/
├── src/
│   ├── app.ts                     # Express app assembly (middleware, routes, docs, error handling)
│   ├── server.ts                  # HTTP bootstrap, worker startup, graceful shutdown
│   ├── config/
│   │   ├── index.ts               # Zod-validated env → typed `config` object
│   │   ├── database.ts            # Mongoose connection (bounded retry)
│   │   ├── redis.ts               # Shared ioredis client + BullMQ connection options
│   │   ├── logger.ts              # Pino logger with redaction
│   │   └── cloudinary.ts          # Cloudinary SDK configuration
│   ├── constants/
│   │   ├── business.ts            # Enums, pricing rules, pagination, upload limits
│   │   ├── cache-keys.ts          # Redis key templates + TTLs
│   │   └── error-codes.ts         # Machine-readable error codes
│   ├── database/
│   │   ├── models/                # Mongoose models (one file per collection)
│   │   └── seed.ts                # Database seeder (`npm run seed`)
│   ├── docs/
│   │   └── swagger.ts             # OpenAPI spec (Swagger UI at /docs)
│   ├── emails/
│   │   ├── mailer.ts              # Nodemailer SMTP transport
│   │   └── templates.ts           # HTML email templates
│   ├── jobs/
│   │   ├── index.ts               # BullMQ worker startup/shutdown
│   │   ├── queue-factory.ts       # Queue creation + best-effort enqueue
│   │   ├── queues/                # Typed producers (email, push, notification)
│   │   └── processors/            # Job consumers (email, push, notification)
│   ├── middlewares/
│   │   ├── auth.middleware.ts     # requireAuth / authOptional / requireRole / requireAdmin
│   │   ├── validate.middleware.ts # Zod request validation
│   │   ├── error.middleware.ts    # 404 + centralised error handler
│   │   ├── rate-limit.middleware.ts # Named rate limiters
│   │   ├── upload.middleware.ts   # Multer in-memory upload
│   │   └── audit.middleware.ts    # Admin mutation audit logging
│   ├── modules/                   # Feature modules (see §7)
│   │   ├── auth/ products/ categories/ collections/ wishlist/
│   │   ├── orders/ notifications/ users/ reviews/ search/
│   │   ├── admin/ cart/ contact/
│   ├── routes/
│   │   └── index.ts               # Root /v1 router mounting all modules
│   ├── storage/
│   │   └── upload.ts              # Cloudinary upload with per-type presets
│   ├── types/
│   │   ├── api.types.ts           # Response envelopes, token payloads, AuthUser
│   │   └── express.d.ts           # `req.user` augmentation
│   └── utils/                     # jwt, hash, cache, paginate, serialize, api-error, etc.
├── tests/                         # Jest unit + Supertest integration tests
├── docs/                          # This documentation
├── Dockerfile / docker-compose.yml
├── .env.example
└── package.json / tsconfig.json / jest.config.js
```

> Note: `src/providers/` and `src/emails/templates/` exist as directories, but the
> email templates are currently implemented in `src/emails/templates.ts`.

### Folder Responsibilities

| Folder               | Responsibility                                                             |
| -------------------- | ------------------------------------------------------------------------- |
| `config/`            | Boot-time configuration: env validation, DB/Redis/Cloudinary, logging.    |
| `constants/`         | Single source of truth for enums, business rules, cache keys, error codes.|
| `database/models/`   | Mongoose schemas & models — one per collection.                           |
| `middlewares/`       | Reusable Express middleware (auth, validation, rate limiting, errors).    |
| `modules/`           | Vertical feature slices (routes → controller → service → repository).     |
| `routes/`            | Composition root wiring feature routers under `/v1`.                       |
| `jobs/`              | BullMQ queues, workers, and processors for async work.                    |
| `emails/`            | SMTP transport and HTML templates.                                        |
| `storage/`           | Cloudinary image upload helpers.                                          |
| `utils/`             | Framework-agnostic helpers (JWT, hashing, pagination, caching, errors).   |
| `types/`             | Shared TypeScript types and Express type augmentation.                    |

---

## 3. Request Lifecycle

```
Client Request
      ↓
Express app (helmet, cors, compression, json/urlencoded, cookie-parser, pino-http)
      ↓
Global rate limiter (mounted on /v1)
      ↓
Feature router (/v1/<module>)
      ↓
Route-level middleware  →  auth (requireAuth / authOptional / requireRole)
                        →  per-route rate limiter (where applicable)
                        →  validate({ body, query, params }) via Zod
                        →  upload (Multer) for multipart routes
                        →  audit log (admin routes)
      ↓
Controller (asyncHandler-wrapped)  — HTTP concerns, calls service
      ↓
Service                            — business logic, orchestration, caching, queueing
      ↓
Repository                         — Mongoose queries
      ↓
Mongoose Model → MongoDB
      ↓
serialize() → success envelope { data, message? }
      ↓
Response  (errors flow to the centralised error handler → error envelope)
```

Every controller is wrapped in `asyncHandler`, so thrown errors and rejected
promises are forwarded to the centralised `errorHandler`.

---

## 4. Configuration & Environment Variables

Environment variables are validated **once at boot** by a Zod schema in
`src/config/index.ts`. If any required variable is missing or malformed, the
process logs the field errors and exits immediately, so the rest of the codebase
can treat `config` as fully typed and guaranteed-present.

| Variable              | Purpose                                            | Required | Default / Example                          |
| --------------------- | -------------------------------------------------- | :------: | ------------------------------------------ |
| `NODE_ENV`            | Runtime environment                                | No       | `development` (`production` / `test`)      |
| `PORT`                | HTTP listen port                                   | No       | `5000`                                     |
| `MONGO_URI`           | MongoDB connection string                          | **Yes**  | `mongodb://localhost:27017/al-madina`      |
| `REDIS_URL`           | Redis connection string (cache + BullMQ)           | **Yes**  | `redis://localhost:6379`                   |
| `JWT_ACCESS_SECRET`   | Secret for signing access tokens (min 16 chars)    | **Yes**  | `change_me_access_secret_min_32_chars`     |
| `JWT_REFRESH_SECRET`  | Secret associated with refresh tokens (min 16)     | **Yes**  | `change_me_refresh_secret_min_32_chars`    |
| `JWT_ACCESS_EXPIRY`   | Access token lifetime                              | No       | `15m`                                      |
| `JWT_REFRESH_EXPIRY`  | Refresh token lifetime                             | No       | `30d`                                      |
| `BCRYPT_ROUNDS`       | bcrypt cost factor (8–15)                          | No       | `12`                                       |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name                            | No*      | `your_cloud_name`                          |
| `CLOUDINARY_API_KEY`  | Cloudinary API key                                 | No*      | `your_api_key`                             |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret                            | No*      | `your_api_secret`                          |
| `SMTP_HOST`           | SMTP server host                                   | No*      | `smtp.gmail.com`                           |
| `SMTP_PORT`           | SMTP server port                                   | No       | `587`                                      |
| `SMTP_SECURE`         | Use TLS (`true`/`false`)                           | No       | `false`                                    |
| `SMTP_USER`           | SMTP username                                      | No*      | `your_smtp_user@gmail.com`                 |
| `SMTP_PASS`           | SMTP password / app password                       | No*      | `your_smtp_app_password`                   |
| `EMAIL_FROM`          | Default From header                                | No       | `Al Madina <noreply@almadina.com>`         |
| `ADMIN_EMAIL`         | Concierge address for contact notifications        | No       | `concierge@almadina.com`                   |
| `CLIENT_URL`          | Frontend base URL (used in email links)            | No       | `http://localhost:3000`                    |
| `RATE_LIMIT_WINDOW_MS`| Default rate-limit window (ms)                     | No       | `900000` (15 min)                          |
| `CORS_ORIGINS`        | Comma-separated allowed origins                    | No       | `http://localhost:3000,http://localhost:19006` |
| `LOG_LEVEL`           | Pino log level                                     | No       | `info`                                     |

\* **Cloudinary** and **SMTP** are optional. When their variables are absent the
feature gracefully degrades: image uploads are disabled (upload endpoints return
an internal error), and emails are logged rather than sent. This is controlled by
`config.cloudinary.enabled` / `config.smtp.enabled`, which are true only when all
required sub-keys are present.

---

## 5. Data Models

All models use Mongoose with a shared `baseSchemaOptions` (`src/database/models/base.ts`):

- **Timestamps** — `createdAt` / `updatedAt` on every document.
- **Serialization transform** — on `toJSON`/`toObject`, `_id` becomes a string
  `id`, and `__v` is removed. API contracts expose `id`, never `_id`.

Mongoose maps a model name to a lowercased, pluralized collection (e.g. `User` →
`users`).

### 5.1 User — `users`

Registered account holder.

| Field             | Type      | Required | Default   | Notes                                        |
| ----------------- | --------- | :------: | --------- | -------------------------------------------- |
| `fullName`        | String    | Yes      | —         | Trimmed, min length 2                        |
| `email`           | String    | Yes      | —         | Unique, lowercased, trimmed, indexed         |
| `passwordHash`    | String    | Yes      | —         | `select: false`; stripped on serialization   |
| `avatar`          | String    | No       | —         | Image URL                                    |
| `role`            | Enum      | No       | `user`    | `user` \| `manager` \| `admin` (indexed)     |
| `tier`            | Enum      | No       | `Member`  | `Member` \| `Connoisseur` \| `Maison Elite`  |
| `memberSince`     | Date      | No       | `now`     |                                              |
| `isEmailVerified` | Boolean   | No       | `false`   |                                              |
| `isActive`        | Boolean   | No       | `true`    | Indexed; deactivation flag                   |

A custom transform defensively deletes `passwordHash` on serialization even if it
was explicitly selected.

### 5.2 Product — `products`

| Field           | Type       | Required | Default     | Notes                                          |
| --------------- | ---------- | :------: | ----------- | ---------------------------------------------- |
| `name`          | String     | Yes      | —           | Trimmed                                        |
| `nameAr`        | String     | No       | —           | Arabic name                                    |
| `brand`         | String     | Yes      | `Al Madina` | Trimmed                                        |
| `categoryId`    | ObjectId   | Yes      | —           | Ref → `Category` (indexed)                     |
| `description`   | String     | Yes      | —           |                                                |
| `notes`         | [String]   | No       | `[]`        | Fragrance notes                                |
| `scentFamily`   | Enum       | Yes      | —           | `oud` `floral` `amber` `musk` `woody` `citrus` `spicy` (indexed) |
| `volumeMl`      | Number     | Yes      | —           | ≥ 0                                            |
| `price`         | Number     | Yes      | —           | ≥ 0                                            |
| `originalPrice` | Number     | No       | —           | For strike-through pricing                     |
| `currency`      | String     | No       | `AED`       | Max length 3                                   |
| `images`        | [String]   | No       | `[]`        | Cloudinary URLs                                |
| `rating`        | Number     | No       | `0`         | 0–5                                            |
| `reviewCount`   | Number     | No       | `0`         | Denormalized                                   |
| `inStock`       | Boolean    | No       | `true`      | Indexed                                        |
| `badge`         | Enum       | No       | —           | `new` \| `bestseller` \| `limited` \| `exclusive` |
| `isFeatured`    | Boolean    | No       | `false`     | Home rail flag                                 |
| `isNewArrival`  | Boolean    | No       | `false`     | Home rail flag                                 |
| `isBestSeller`  | Boolean    | No       | `false`     | Home rail flag                                 |
| `isSignature`   | Boolean    | No       | `false`     | Home rail flag                                 |
| `isSeasonal`    | Boolean    | No       | `false`     | Home rail flag                                 |
| `deletedAt`     | Date       | No       | `null`      | Soft-delete marker (indexed)                   |

**Indexes:** compound index on the five home-rail flags; a weighted **text
index** (`name` 10, `brand` 5, `notes` 3, `description` 1) named
`product_text_search` powering full-text search.

### 5.3 Category — `categories`

| Field          | Type   | Required | Default | Notes            |
| -------------- | ------ | :------: | ------- | ---------------- |
| `name`         | String | Yes      | —       | Trimmed          |
| `tagline`      | String | No       | —       | Trimmed          |
| `image`        | String | Yes      | —       | Image URL        |
| `productCount` | Number | No       | `0`     | Denormalized     |
| `sortOrder`    | Number | No       | `0`     | Indexed          |

### 5.4 Collection — `collections`

Curated product groupings. The former `collection_products` junction table is
modelled as an ordered array of product references (`productIds`), idiomatic for
MongoDB.

| Field          | Type        | Required | Default | Notes                                   |
| -------------- | ----------- | :------: | ------- | --------------------------------------- |
| `title`        | String      | Yes      | —       | Trimmed                                 |
| `subtitle`     | String      | Yes      | —       | Trimmed                                 |
| `image`        | String      | Yes      | —       | Image URL                               |
| `accent`       | Enum        | Yes      | —       | `gold` \| `emerald` \| `burgundy`       |
| `productIds`   | [ObjectId]  | No       | `[]`    | Refs → `Product` (indexed)              |
| `productCount` | Number      | No       | `0`     | Kept in sync via `pre('save')` hook     |
| `sortOrder`    | Number      | No       | `0`     | Indexed                                 |

### 5.5 Review — `reviews`

| Field       | Type     | Required | Default | Notes                                            |
| ----------- | -------- | :------: | ------- | ------------------------------------------------ |
| `productId` | ObjectId | Yes      | —       | Ref → `Product` (indexed)                        |
| `userId`    | ObjectId | No       | `null`  | Ref → `User`; nullable (preserved if user removed) |
| `author`    | String   | Yes      | —       | Trimmed                                          |
| `avatar`    | String   | No       | —       |                                                  |
| `rating`    | Number   | Yes      | —       | 1–5                                              |
| `title`     | String   | Yes      | —       | Trimmed                                          |
| `body`      | String   | Yes      | —       |                                                  |
| `date`      | Date     | No       | `now`   |                                                  |
| `verified`  | Boolean  | No       | `false` | Verified purchase flag                           |
| `deletedAt` | Date     | No       | `null`  | Soft-delete marker (indexed)                     |

### 5.6 WishlistItem — `wishlistitems`

| Field       | Type     | Required | Notes                                    |
| ----------- | -------- | :------: | ---------------------------------------- |
| `userId`    | ObjectId | Yes      | Ref → `User` (indexed)                   |
| `productId` | ObjectId | Yes      | Ref → `Product`                          |

**Index:** unique compound `{ userId, productId }` — prevents duplicate entries.

### 5.7 Order — `orders`

Orders embed line-item and shipping-address snapshots (no live joins at read
time), preserving purchase-time values.

| Field             | Type              | Required | Default        | Notes                                    |
| ----------------- | ----------------- | :------: | -------------- | ---------------------------------------- |
| `reference`       | String            | Yes      | —              | Unique, indexed (e.g. `AM-10293`)        |
| `userId`          | ObjectId          | No       | `null`         | Ref → `User`; null for guests (indexed)  |
| `guestEmail`      | String            | No       | —              | Lowercased; for guest checkout           |
| `status`          | Enum              | No       | `processing`   | `processing` `shipped` `delivered` `cancelled` (indexed) |
| `shippingAddress` | Sub-document      | Yes      | —              | `{ fullName, phone, address, city }`     |
| `deliveryMethod`  | Enum              | Yes      | —              | `standard` \| `express`                  |
| `paymentMethod`   | Enum              | Yes      | —              | `card` \| `wallet` \| `cod`              |
| `items`           | [OrderItem]       | Yes      | —              | Non-empty (validated)                    |
| `subtotal`        | Number            | Yes      | —              | ≥ 0, server-computed                     |
| `shipping`        | Number            | Yes      | —              | ≥ 0, server-computed                     |
| `total`           | Number            | Yes      | —              | ≥ 0, server-computed                     |
| `currency`        | String            | No       | `AED`          | Max length 3                             |
| `placedAt`        | Date              | No       | `now`          |                                          |
| `deletedAt`       | Date              | No       | `null`         | Soft-delete marker (indexed)             |

**Embedded `OrderItem`** (`_id: false`): `productId` (ref), `productName`,
`productImage`, `price`, `quantity` (≥ 1), `volumeMl`.

### 5.8 Notification — `notifications`

| Field      | Type     | Required | Default | Notes                                      |
| ---------- | -------- | :------: | ------- | ------------------------------------------ |
| `userId`   | ObjectId | Yes      | —       | Ref → `User` (indexed)                     |
| `kind`     | Enum     | Yes      | —       | `order` \| `promo` \| `system` \| `wishlist` |
| `title`    | String   | Yes      | —       |                                            |
| `body`     | String   | Yes      | —       |                                            |
| `read`     | Boolean  | No       | `false` |                                            |
| `date`     | Date     | No       | `now`   |                                            |
| `metadata` | Mixed    | No       | —       | Arbitrary payload                          |

**Index:** compound `{ userId, read }` for unread counts and per-user filtering.

### 5.9 RefreshToken — `refreshtokens`

| Field       | Type     | Required | Notes                                        |
| ----------- | -------- | :------: | -------------------------------------------- |
| `userId`    | ObjectId | Yes      | Ref → `User` (indexed)                       |
| `token`     | String   | Yes      | SHA-256 hash of the opaque token (unique)    |
| `expiresAt` | Date     | Yes      | **TTL index** — expired tokens auto-purged   |
| `revokedAt` | Date     | No       | Set on sign-out / rotation                   |

### 5.10 PasswordResetToken — `passwordresettokens`

| Field       | Type     | Required | Notes                                       |
| ----------- | -------- | :------: | ------------------------------------------- |
| `userId`    | ObjectId | Yes      | Ref → `User` (indexed)                      |
| `token`     | String   | Yes      | SHA-256 hash of reset token (unique)        |
| `expiresAt` | Date     | Yes      | **TTL index** — auto-purged (1-hour window) |

### 5.11 UserPreference — `userpreferences`

| Field                  | Type    | Required | Default   | Notes                       |
| ---------------------- | ------- | :------: | --------- | --------------------------- |
| `userId`               | ObjectId| Yes      | —         | Ref → `User` (unique, indexed) |
| `themeMode`            | Enum    | No       | `system`  | `light` \| `dark` \| `system` |
| `promosEnabled`        | Boolean | No       | `true`    |                             |
| `orderUpdatesEnabled`  | Boolean | No       | `true`    |                             |
| `currency`             | String  | No       | `AED`     | Max length 3                |
| `language`             | String  | No       | `en`      | Max length 5                |

### 5.12 PushToken — `pushtokens`

| Field      | Type     | Required | Notes                              |
| ---------- | -------- | :------: | ---------------------------------- |
| `userId`   | ObjectId | Yes      | Ref → `User` (indexed)             |
| `token`    | String   | Yes      | Device token (unique, indexed)     |
| `platform` | Enum     | Yes      | `ios` \| `android`                 |

### 5.13 ContactSubmission — `contactsubmissions`

| Field     | Type   | Required | Notes                         |
| --------- | ------ | :------: | ----------------------------- |
| `name`    | String | Yes      | Trimmed                       |
| `email`   | String | Yes      | Lowercased, trimmed           |
| `message` | String | Yes      | HTML-stripped before storage  |

**Index:** `{ createdAt: -1 }`.

### 5.14 AuditLog — `auditlogs`

Records admin/manager mutations for accountability, written by the audit
middleware after the response finishes.

| Field        | Type     | Required | Notes                                  |
| ------------ | -------- | :------: | -------------------------------------- |
| `actorId`    | ObjectId | No       | Ref → `User` (indexed)                 |
| `actorEmail` | String   | No       |                                        |
| `action`     | String   | Yes      | e.g. `POST /admin/products`            |
| `method`     | String   | Yes      |                                        |
| `path`       | String   | Yes      |                                        |
| `ip`         | String   | No       |                                        |
| `statusCode` | Number   | No       | Captured on response finish            |
| `metadata`   | Mixed    | No       | `{ params, query }`                    |

**Index:** `{ createdAt: -1 }`.

---

## 6. Authentication & Authorization

### Token Model

- **Access token** — a short-lived JWT (default `15m`) signed with
  `JWT_ACCESS_SECRET`. Payload: `{ sub, email, tier, role, iat, exp }`.
- **Refresh token** — an **opaque random string** returned to the client; only
  its **SHA-256 hash** is stored (in `refreshtokens`) with an `expiresAt` TTL.
  Refresh tokens rotate on use and can be revoked on sign-out.

Passwords are hashed with **bcrypt** (`BCRYPT_ROUNDS`, default 12). Reset tokens
are opaque, stored hashed, and expire after 1 hour.

### Authentication Flow

1. **Sign-up / Sign-in** → issues an access token + refresh token; the user
   object (without `passwordHash`) is returned.
2. Client sends `Authorization: Bearer <accessToken>` on protected routes.
3. When the access token expires, the client calls **`POST /auth/refresh`** with
   the refresh token to obtain a rotated pair.
4. **Sign-out** revokes the presented refresh token.
5. **Forgot / reset password** issues a hashed, 1-hour reset token and emails a
   reset link built from `CLIENT_URL`.

### Middleware

| Middleware      | Behaviour                                                                 |
| --------------- | ------------------------------------------------------------------------- |
| `requireAuth`   | Requires a valid Bearer access token; attaches `req.user` or throws 401.  |
| `authOptional`  | Attaches `req.user` if a valid token is present; otherwise continues as guest. |
| `requireRole(...roles)` | Requires one of the given roles; `admin` implicitly satisfies any check. |
| `requireAdmin`  | Shorthand for `requireRole('admin')`.                                     |

### Roles

`user` (default) · `manager` · `admin`. Admin routes require `admin` **or**
`manager`, and `admin` is treated as a superset of every role.

---

## 7. Business Modules & API Reference

**Base URL:** `/v1` (mounted behind the global rate limiter).

**Success envelope:**

```json
{ "data": <payload>, "message": "optional message" }
```

Payloads are passed through `serialize()` so documents expose string `id` (not
`_id`) and internal fields are stripped. Paginated payloads use:

```json
{ "items": [], "page": 1, "pageSize": 20, "total": 137, "hasMore": true }
```

**Error envelope:**

```json
{ "status": 404, "message": "Order not found", "code": "ORDER_NOT_FOUND", "details": {} }
```

`details` is present only when applicable (e.g. validation issues). In
production, 500 messages are replaced with a generic string.

**Pagination:** `page` (default 1) and `limit` (default 20, **max 50**) are
clamped server-side.

---

### 7.1 Auth — `/v1/auth`

| Method | Endpoint            | Auth | Description                       | Rate limit          |
| ------ | ------------------- | ---- | --------------------------------- | ------------------- |
| POST   | `/sign-up`          | —    | Register; returns user + tokens   | 10 / hour           |
| POST   | `/sign-in`          | —    | Authenticate; returns user + tokens | 5 / 15 min        |
| POST   | `/sign-out`         | Bearer | Revoke the given refresh token  | —                   |
| POST   | `/refresh`          | —    | Rotate tokens from a refresh token| —                   |
| GET    | `/me`               | Bearer | Current user profile            | —                   |
| POST   | `/forgot-password`  | —    | Send a password reset link        | 3 / hour            |
| POST   | `/reset-password`   | —    | Set a new password via reset token| —                   |

Bodies:
- `sign-up`: `{ fullName (≥2), email, password (≥6) }`
- `sign-in`: `{ email, password }`
- `sign-out` / `refresh`: `{ refreshToken }`
- `forgot-password`: `{ email }`
- `reset-password`: `{ token, password (≥6) }`

### 7.2 Products — `/v1/products`

| Method | Endpoint            | Auth   | Description                                    |
| ------ | ------------------- | ------ | ---------------------------------------------- |
| GET    | `/`                 | —      | List/filter products (supports `?ids=` hydration) |
| GET    | `/search`           | —      | Full-text search (cached 5 min)                |
| GET    | `/suggest`          | —      | Prefix autocomplete (name suggestions)         |
| GET    | `/featured`         | —      | Featured rail (cached)                          |
| GET    | `/new-arrivals`     | —      | New arrivals rail (cached)                      |
| GET    | `/best-sellers`     | —      | Best sellers rail (cached)                      |
| GET    | `/signature`        | —      | Signature rail (cached)                         |
| GET    | `/seasonal`         | —      | Seasonal rail (cached)                          |
| GET    | `/:id`              | —      | Product detail (cached 30 min)                 |
| GET    | `/:id/reviews`      | —      | Paginated product reviews                      |
| POST   | `/:id/reviews`      | Bearer | Create a review for the product                |

**`GET /` query:** `page`, `limit`, `categoryId`, `family` (scent family), `q`,
`sort` (`featured` \| `price_asc` \| `price_desc` \| `rating` \| `newest`),
`badge`, `inStock`, `minPrice`, `maxPrice`, `isFeatured`, `isNewArrival`,
`isBestSeller`, `isSignature`, `isSeasonal`, `ids` (comma-separated).

**`GET /search` query:** `q` (required), `page`, `limit`. **`/suggest`:** `q`
(required), `limit` (≤ 10, default 5). **`/search` and `/suggest`** are rate
limited to 60 / minute.

**`POST /:id/reviews` body:** `{ rating (1–5), title, body }`.

### 7.3 Categories — `/v1/categories`

| Method | Endpoint          | Auth | Description                       |
| ------ | ----------------- | ---- | --------------------------------- |
| GET    | `/`               | —    | All categories (cached 24 h)      |
| GET    | `/:id/products`   | —    | Paginated products in a category  |

### 7.4 Collections — `/v1/collections`

| Method | Endpoint          | Auth | Description                        |
| ------ | ----------------- | ---- | ---------------------------------- |
| GET    | `/`               | —    | All collections (cached 24 h)      |
| GET    | `/:id/products`   | —    | Products within a collection       |

### 7.5 Wishlist — `/v1/wishlist` (protected)

| Method | Endpoint        | Auth   | Description                    |
| ------ | --------------- | ------ | ----------------------------- |
| GET    | `/`             | Bearer | List wishlist items           |
| POST   | `/`             | Bearer | Add a product (`{ productId }`) |
| DELETE | `/:productId`   | Bearer | Remove a product              |

Adding a duplicate returns `ALREADY_IN_WISHLIST`; removing a missing item returns
`NOT_IN_WISHLIST`.

### 7.6 Orders — `/v1/orders`

| Method | Endpoint | Auth        | Description                                     |
| ------ | -------- | ----------- | ----------------------------------------------- |
| POST   | `/`      | Optional    | Place an order (guest or authenticated)         |
| GET    | `/`      | Bearer      | Authenticated user's order history (paginated)  |
| GET    | `/:id`   | Optional    | Order by id (owner, or guest via email match)   |

**`POST /` body:** `{ items: [{ productId, quantity, volumeMl }], shippingAddress:
{ fullName, phone, address, city }, deliveryMethod, paymentMethod, guestEmail? }`.
Guest checkout requires `guestEmail`. Rate limited to 10 / hour (keyed per user
when authenticated, else per IP).

Order creation validates each product exists and is in stock, **snapshots
price/name/image at purchase time**, and computes `subtotal`, `shipping`, and
`total` server-side (client prices are never trusted). On success it queues an
order-confirmation email and, for authenticated users, an in-app notification.

### 7.7 Notifications — `/v1/notifications` (protected)

| Method | Endpoint        | Auth   | Description                       |
| ------ | --------------- | ------ | --------------------------------- |
| GET    | `/`             | Bearer | Paginated notifications           |
| PATCH  | `/read-all`     | Bearer | Mark all as read                  |
| PATCH  | `/:id/read`     | Bearer | Mark one as read                  |

### 7.8 Users — `/v1/users/me` (protected)

| Method | Endpoint            | Auth   | Description                       |
| ------ | ------------------- | ------ | --------------------------------- |
| PATCH  | `/me`               | Bearer | Update profile (`fullName`, `avatar`) |
| PATCH  | `/me/preferences`   | Bearer | Update preferences                |
| POST   | `/me/push-token`    | Bearer | Register a device push token      |

**Preferences body:** any of `themeMode`, `promosEnabled`, `orderUpdatesEnabled`,
`currency` (3 chars), `language` (2–5 chars). **Push token body:** `{ token,
platform: 'ios' | 'android' }`.

### 7.9 Search — `/v1/search`

| Method | Endpoint      | Auth | Description                          |
| ------ | ------------- | ---- | ------------------------------------ |
| GET    | `/trending`   | —    | Hardcoded trending search terms      |

(Product full-text search and suggestions live under `/v1/products/search` and
`/v1/products/suggest`.)

### 7.10 Contact — `/v1/contact`

| Method | Endpoint | Auth | Description                          | Rate limit |
| ------ | -------- | ---- | ------------------------------------ | ---------- |
| POST   | `/`      | —    | Submit the contact form              | 3 / hour   |

**Body:** `{ name (≥2), email, message (10–2000) }`. Input is HTML-stripped
before storage; concierge notification and auto-reply emails are queued.

### 7.11 Cart — `/v1/cart` (protected)

| Method | Endpoint   | Auth   | Description                                          |
| ------ | ---------- | ------ | --------------------------------------------------- |
| POST   | `/sync`    | Bearer | Reconcile a client cart for multi-device use        |

The cart is primarily client-side. `POST /sync` validates posted items, drops
those that no longer exist or are out of stock, and recomputes server-trusted
totals. **Body:** `{ items: [{ productId, quantity, volumeMl? }] }`.

### 7.12 Admin — `/v1/admin` (role: admin or manager)

All admin routes require authentication, an `admin`/`manager` role, and are
**audited** — mutations are recorded in `auditlogs`.

**Dashboard & stats**

| Method | Endpoint            | Description                                                     |
| ------ | ------------------- | -------------------------------------------------------------- |
| GET    | `/dashboard`        | Revenue (today/week/month), order counts by status, product totals, customer count, recent orders, top products |
| GET    | `/orders/stats`     | Orders by status, all-time revenue and order count             |

**Products**

| Method | Endpoint                | Description                          |
| ------ | ----------------------- | ------------------------------------ |
| POST   | `/products`             | Create a product                     |
| PATCH  | `/products/:id`         | Update a product                     |
| DELETE | `/products/:id`         | Delete (soft) a product              |
| POST   | `/products/:id/images`  | Upload gallery images (multipart `files`) |

**Categories**

| Method | Endpoint            | Description        |
| ------ | ------------------- | ------------------ |
| POST   | `/categories`       | Create a category  |
| PATCH  | `/categories/:id`   | Update a category  |
| DELETE | `/categories/:id`   | Delete a category  |

**Collections**

| Method | Endpoint                                | Description                       |
| ------ | --------------------------------------- | --------------------------------- |
| POST   | `/collections`                          | Create a collection               |
| PATCH  | `/collections/:id`                      | Update a collection               |
| DELETE | `/collections/:id`                      | Delete a collection               |
| POST   | `/collections/:id/products`             | Add a product (`{ productId }`)   |
| DELETE | `/collections/:id/products/:productId`  | Remove a product                  |

**Orders**

| Method | Endpoint                 | Description                              |
| ------ | ------------------------ | --------------------------------------- |
| GET    | `/orders`                | List orders (filter by `status`, `from`, `to`) |
| PATCH  | `/orders/:id/status`     | Update order status                     |

**Customers**

| Method | Endpoint             | Description                         |
| ------ | -------------------- | ----------------------------------- |
| GET    | `/users`             | List customers (filter by `tier`)   |
| GET    | `/users/:id`         | Customer detail + recent orders     |
| PATCH  | `/users/:id/tier`    | Update loyalty tier                 |
| DELETE | `/users/:id`         | Deactivate a customer               |

**Reviews / Broadcast / Upload**

| Method | Endpoint          | Description                                     |
| ------ | ----------------- | ----------------------------------------------- |
| GET    | `/reviews`        | List reviews (filter by `rating`)               |
| DELETE | `/reviews/:id`    | Delete a review                                 |
| POST   | `/notifications`  | Broadcast a notification (optionally by `tier`) |
| POST   | `/upload`         | Upload a single image (`?type=product\|avatar\|category\|collection`) |

---

## 8. Validation

Request validation uses **Zod** via the `validate({ body, query, params })`
middleware. On success, parsed (coerced/defaulted) values replace the originals
so controllers consume typed, trusted input. On failure a **422
`VALIDATION_ERROR`** is returned with field-level `details.issues`.

Schemas live per-module (`*.schema.ts`) plus shared helpers in
`utils/common.schema.ts` (`paginationQuerySchema`, `objectIdParam`). Path IDs are
validated as well-formed Mongo ObjectIds.

---

## 9. Error Handling

The centralised `errorHandler` (`src/middlewares/error.middleware.ts`) maps every
error to the standard envelope:

| Source                                   | Status | Code                |
| ---------------------------------------- | ------ | ------------------- |
| `ApiError` (thrown deliberately)         | its own | its own            |
| Zod error                                | 422    | `VALIDATION_ERROR`  |
| Mongoose `ValidationError`               | 400    | `VALIDATION_ERROR`  |
| Mongoose `CastError`                     | 400    | `BAD_REQUEST`       |
| Duplicate key (Mongo `11000`)            | 409    | `BAD_REQUEST`       |
| Unhandled                                | 500    | `INTERNAL_ERROR`    |

Unmatched routes hit `notFoundHandler` (404). Server errors (≥ 500) are logged
with full context; client errors log at debug level. Machine-readable codes are
enumerated in `src/constants/error-codes.ts` (e.g. `INVALID_CREDENTIALS`,
`EMAIL_TAKEN`, `TOKEN_EXPIRED`, `PRODUCT_OUT_OF_STOCK`, `ORDER_NOT_FOUND`,
`ALREADY_IN_WISHLIST`, `RATE_LIMITED`).

---

## 10. Security

- **Helmet** — secure HTTP headers.
- **CORS** — restricted to `CORS_ORIGINS`, credentials enabled, methods `GET,
  POST, PATCH, PUT, DELETE`.
- **Rate limiting** — a global limiter plus named per-route limiters:

  | Limiter               | Window   | Limit | Applied to               |
  | --------------------- | -------- | ----- | ------------------------ |
  | `globalLimiter`       | 15 min   | 300   | all `/v1`                |
  | `signInLimiter`       | 15 min   | 5     | `POST /auth/sign-in`     |
  | `signUpLimiter`       | 1 hour   | 10    | `POST /auth/sign-up`     |
  | `forgotPasswordLimiter` | 1 hour | 3     | `POST /auth/forgot-password` |
  | `searchLimiter`       | 1 min    | 60    | product search / suggest |
  | `ordersLimiter`       | 1 hour   | 10    | `POST /orders` (per user) |
  | `contactLimiter`      | 1 hour   | 3     | `POST /contact`          |

- **Input sanitization** — contact submissions are HTML-stripped
  (`sanitize-html`) before persistence.
- **Body limits** — JSON and urlencoded bodies capped at 1 MB.
- **Secrets & PII redaction** — the logger redacts `authorization`/`cookie`
  headers, passwords, hashes, and tokens.
- **Password/token storage** — bcrypt-hashed passwords; refresh and reset tokens
  stored only as SHA-256 hashes with TTL expiry.
- **`trust proxy`** set to 1 for correct client IPs behind a load balancer.

---

## 11. Caching

Redis-backed caching (`src/utils/cache.ts`) with **best-effort** semantics —
every cache operation swallows and logs failures, so Redis being briefly
unavailable never breaks a request. Keys and TTLs are centralised in
`src/constants/cache-keys.ts`:

| Cached data     | TTL     |
| --------------- | ------- |
| Categories      | 24 h    |
| Collections     | 24 h    |
| Product rails   | 1 h     |
| Product detail  | 30 min  |
| Search results  | 5 min   |

Invalidation uses stable prefixes and `SCAN`-based pattern deletion (avoiding the
blocking `KEYS` command).

---

## 12. Background Jobs (BullMQ)

Three Redis-backed queues process async work off the request path. Producers are
typed (`src/jobs/queues/*`) and `enqueue()` is best-effort — if Redis is
unavailable the failure is logged and the originating request still succeeds.
Workers start in-process from `server.ts` (concurrency 5, 3 retries with
exponential backoff).

| Queue          | Jobs                                                                             | Processor                       |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------- |
| `email`        | `welcome`, `password-reset`, `order-confirmation`, `shipping-update`, `contact-auto-reply`, `contact-admin-notify` | Renders a template, sends via SMTP |
| `push`         | `order-update`, `promo-broadcast`, `back-in-stock`                               | Resolves device tokens; Expo/FCM dispatch is stubbed |
| `notification` | `create-in-app-notification`                                                     | Persists an in-app `Notification` |

Emails degrade gracefully: when SMTP is not configured the message is logged
instead of sent.

---

## 13. File Uploads

Uploads use **Multer in-memory storage** (no filesystem writes) and stream
buffers directly to **Cloudinary**. Allowed MIME types: `image/jpeg`,
`image/png`, `image/webp`. Per-type presets (folder, transformation, byte
limit) are defined in `src/storage/upload.ts`:

| Type        | Folder                 | Max size | Transformation                          |
| ----------- | ---------------------- | -------- | --------------------------------------- |
| `product`   | `almadina/products`    | 10 MB    | auto quality/format                     |
| `avatar`    | `almadina/users`       | 5 MB     | 300×300 face-cropped thumbnail          |
| `category`  | `almadina/categories`  | 10 MB    | 800×600 fill                            |
| `collection`| `almadina/collections` | 10 MB    | 800×600 fill                            |

When Cloudinary is not configured, upload endpoints return an internal error and
image uploads are disabled.

---

## 14. Logging & Observability

- **Pino** structured logging; pretty-printed in development, raw JSON in
  production (for aggregators).
- **pino-http** logs every request; **morgan** (`dev`) adds concise console lines
  in development.
- Sensitive fields are redacted (see §10).
- **Health check:** `GET /health` → `{ status, uptime, timestamp, env }`.
- **API docs:** Swagger UI at `GET /docs`; raw spec at `GET /docs.json`.

---

## 15. Business Rules

Centralised in `src/constants/business.ts`:

- **Shipping** — free when subtotal ≥ **250 AED** (or 0); otherwise a **20 AED**
  flat fee. **Express** delivery adds **30 AED** on top.
- **Currency** — default `AED`.
- **Pagination** — default page size 20, maximum 50.
- **Order reference** — human-readable `AM-#####`, generated with collision
  retry against the unique index.
- **Loyalty tiers** — `Member`, `Connoisseur`, `Maison Elite`.
- **Order lifecycle** — `processing` → `shipped` → `delivered` (or `cancelled`).
- **Trending terms** — Oud, Rose, Amber, Saffron, Musk (hardcoded in v1).

---

## 16. Application Lifecycle

`src/server.ts` orchestrates startup and shutdown:

1. **Boot** — connect to MongoDB (bounded retry) before accepting traffic; build
   the Express app; start background workers; listen on `PORT`.
2. **Graceful shutdown** — on `SIGTERM`/`SIGINT`: stop accepting connections,
   stop workers, close queues, disconnect MongoDB and Redis, with a 10-second
   forced-exit guard.
3. **Safety nets** — `unhandledRejection` logged; `uncaughtException` logged as
   fatal and exits.

---

## 17. Development, Testing & Deployment

### Scripts (`package.json`)

| Script              | Purpose                                    |
| ------------------- | ------------------------------------------ |
| `npm run dev`       | Run with hot reload (`tsx watch`)          |
| `npm run build`     | Compile TypeScript to `dist/`              |
| `npm start`         | Run compiled server (`dist/server.js`)     |
| `npm run seed`      | Seed the database                          |
| `npm run lint`      | ESLint                                     |
| `npm test`          | Jest (unit + integration, serial)          |
| `npm run test:coverage` | Jest with coverage                     |
| `npm run typecheck` | Type-check without emit                    |

### Testing

- **Jest** with **ts-jest**. Integration tests use **Supertest** against the app
  built by `createApp()`, and **mongodb-memory-server** for an in-memory MongoDB.
- Suites cover auth, orders, products, wishlist (integration) and shipping /
  utility logic (unit).

### Deployment

A **Dockerfile** and **docker-compose.yml** are provided (app + MongoDB + Redis).
The app requires reachable MongoDB and Redis instances and the environment
variables in §4.

---

## 18. Summary

The Al Madina Ittar backend is a TypeScript + Express REST API built on
**MongoDB/Mongoose**, structured as a modular monolith with clear
route → controller → service → repository layering. It provides JWT-based
authentication with rotating hashed refresh tokens, role-based authorization,
Zod validation, Redis caching, BullMQ background jobs, Cloudinary uploads,
structured logging, and comprehensive security middleware — all designed for
long-term maintainability.
