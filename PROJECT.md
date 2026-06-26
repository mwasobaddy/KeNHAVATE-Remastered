# KeNHA Innovation Portal

A Laravel + Inertia React application for submitting, managing, and collaborating on innovation ideas at the Kenya National Highways Authority (KeNHA).

---

## Architecture

```
Laravel 13 + PHP 8.5   (Backend API + Inertia server)
├── Inertia React 19    (Frontend SPA)
├── SQLite              (Database)
├── Spatie Permission   (Roles & permissions with teams)
├── Laravel Sanctum     (Mobile API tokens)
├── Laravel Fortify     (2FA, password confirmation)
└── Laravel Socialite   (Google OAuth)
```

The application follows a **service-oriented architecture**:

- **Controllers** — Thin HTTP handlers that delegate to services
- **Services** — Business logic layer (AuthService, OtpService, OnboardingService, GoogleAuthService, PointService, PointAwardService)
- **Form Requests** — Validation logic extracted from controllers
- **Models** — Eloquent models with relationships and Spatie permission traits
- **Shared frontend/backend** — Same backend serves both web (Inertia SPA) and mobile (Sanctum API)

Web controllers live under `App\Http\Controllers\Auth\`, API controllers mirror them under `App\Http\Controllers\Api\Auth\` with identical method names.

---

## Authentication Module

### Overview

Two authentication methods:
1. **OTP-based** — Users enter their email, receive a 6-digit code, and verify. No password needed to log in.
2. **Google OAuth** — Users sign in with their Google account, skipping OTP entirely.

Both flows end at the same post-login pipeline: onboarding → terms → dashboard.

### OTP Flow

```
[Email Input] → POST /auth/email → [OTP Sent] → GET /auth/otp
    → [Enter 6-digit Code] → POST /auth/otp/verify
    → [Verified] → [Onboarding?] → /onboarding or /dashboard
```

### Google OAuth Flow

```
[Click "Sign in with Google"] → GET /auth/google → [Google OAuth]
    → GET /auth/google/callback → [User found/created] → [Logged in]
    → [Onboarding?] → /onboarding or /dashboard
```

Google users skip OTP entirely. The callback:
1. Looks up user by `google_id`, then by `email`, then by `work_email`
2. If found, links `google_id` to the existing account
3. If not found, creates a new user with `email_verified_at = now()`
4. Kenha email detection (`@kenha.co.ke`) applies the same as OTP flow

### Key Components

| Layer | Web | API |
|-------|-----|-----|
| **OTP Initiate** | `Auth\EmailLoginController::__invoke` → `POST /auth/email` | `Api\Auth\EmailLoginController::__invoke` → `POST api/auth/email` |
| **OTP Verify** | `Auth\OtpVerificationController::store` → `POST /auth/otp/verify` | `Api\Auth\OtpVerificationController::store` → `POST api/auth/otp/verify` |
| **OTP Resend** | `Auth\OtpVerificationController::resend` → `POST /auth/otp/resend` | `Api\Auth\OtpVerificationController::resend` → `POST api/auth/otp/resend` |
| **Google Redirect** | `Auth\GoogleAuthController::redirect` → `GET /auth/google` | `Api\Auth\GoogleAuthController::redirect` → `GET api/auth/google` |
| **Google Callback** | `Auth\GoogleAuthController::callback` → `GET /auth/google/callback` | `Api\Auth\GoogleAuthController::callback` → `GET api/auth/google/callback` |

### Services

**`AuthService`** — `app/Services/AuthService.php`
- `initiateOtpLogin(email)` — Creates user if new, generates OTP, sends email
- `verifyOtpLogin(email, otp)` — Verifies OTP, sets email_verified_at, logs user in
- `resendOtp(email)` — Re-sends existing OTP if still valid, otherwise generates new

**`OtpService`** — `app/Services/OtpService.php`
- OTP stored in **cache** (10 min TTL) for fast runtime checks
- Max **5 attempts** before OTP is invalidated
- **60s cooldown** between resend requests per email, with live countdown timer on frontend
- OTP codes logged to `otp_codes` table for audit trail

**`GoogleAuthService`** — `app/Services/GoogleAuthService.php`
- `findOrCreateUser(SocialiteUser)` — Shared logic for both web and API controllers
- Finds user by google_id → email → work_email, then links or creates

### Kenha Email Detection

Emails ending in `@kenha.co.ke` are automatically detected:
- Stored in `work_email` field instead of `email`
- `email` field stays null
- `work_email_verified_at` is set on OTP verification (and email_verified_at for Google)
- Login lookup searches both `email` and `work_email` columns via composite index

### Routes

**Guest routes (web):**
```
GET    /auth/google           → GoogleAuthController@redirect
GET    /auth/google/callback  → GoogleAuthController@callback
POST   /auth/email            → EmailLoginController
GET    /auth/otp              → OtpVerificationController@create
POST   /auth/otp/verify       → OtpVerificationController@store
POST   /auth/otp/resend       → OtpVerificationController@resend
```

**Auth routes (web):**
```
GET    /auth/terms            → TermsController@create
POST   /auth/terms            → TermsController@store
GET    /onboarding            → OnboardingController@create
POST   /onboarding            → OnboardingController@store
```

**Protected routes (web)** `[auth, verified, onboarding.complete, terms]`:
```
GET    /dashboard
GET    /settings/profile
GET    /settings/security
GET    /settings/appearance
DELETE /settings/profile
```

**Gamification routes (web)** `[auth, verified, onboarding.complete, terms, permission]`:
```
GET    /points                 → PointController@index        (permission: points.view)
GET    /points/create          → PointController@create       (permission: points.create)
POST   /points                 → PointController@store        (permission: points.create)
GET    /points/{point}/edit    → PointController@edit         (permission: points.edit)
PUT    /points/{point}         → PointController@update       (permission: points.edit)
DELETE /points/{point}         → PointController@destroy      (permission: points.delete)
POST   /points/{point}/toggle  → PointController@toggle       (permission: points.edit)
GET    /points/transactions    → TransactionController@index  (permission: points.view)
GET    /leaderboard            → LeaderboardController@index
```

**Gamification routes (API)** under `auth:sanctum`:
```
GET    api/points                 → Api\Points\PointController@index
POST   api/points                 → Api\Points\PointController@store
GET    api/points/{point}         → Api\Points\PointController@show
PUT    api/points/{point}         → Api\Points\PointController@update
DELETE api/points/{point}         → Api\Points\PointController@destroy
POST   api/points/{point}/toggle  → Api\Points\PointController@toggle
GET    api/points/transactions    → Api\Points\TransactionController@index
GET    api/leaderboard            → Api\Points\LeaderboardController@index
```

**Guest routes (api):**
```
GET    api/auth/google           → Api\Auth\GoogleAuthController@redirect
GET    api/auth/google/callback  → Api\Auth\GoogleAuthController@callback
POST   api/auth/email            → Api\Auth\EmailLoginController
POST   api/auth/otp/verify       → Api\Auth\OtpVerificationController@store
POST   api/auth/otp/resend       → Api\Auth\OtpVerificationController@resend
```

**Authenticated API routes (Sanctum):**
```
POST   api/auth/logout     → OtpVerificationController@logout
GET    api/user            → OtpVerificationController@user
GET    api/onboarding      → OnboardingController@show
POST   api/onboarding      → OnboardingController@store
GET    api/auth/terms      → TermsController@show
POST   api/auth/terms      → TermsController@store
```

---

## Onboarding Module

### Overview

After first-time login (OTP or Google), users are redirected to `/onboarding` to complete their profile. This is a one-time flow tracked by `onboarding_completed_at` on the `users` table.

### Flow

```
[First Login] → Redirect to /onboarding
    → [Dialog: "Are you a KeNHA Staff?"] (skipped for @kenha.co.ke)
    → [Personal Info: name, mobile, gender, email, password]
    → [Staff Info: region, directorate, department, contract type, designation]
    → [Submit] → user role assigned → redirected to /dashboard
    → (terms middleware catches if not accepted) → /auth/terms
```

### Key Components

- **Controller**: `Auth\OnboardingController` (web), `Api\Auth\OnboardingController` (API)
- **Service**: `OnboardingService` — `complete(user, data)` handles all logic
- **Request**: `OnboardingRequest` — validates all fields with `required_if` for staff fields
- **Middleware**: `EnsureOnboardingComplete` — registered as `onboarding.complete` alias, redirects to `/onboarding` if incomplete
- **Frontend**: `resources/js/pages/auth/onboarding.tsx` — cascading selects for region → directorate → department

### What Happens

1. User's `name` is set from `first_name + other_names`
2. `mobile_number`, `gender`, `password` are saved
3. Email input: for **normal users**, their login email is shown as disabled (can't be changed); for **kenha users**, it's an editable optional personal email field
4. `email_verified_at` stays null for personal emails set during onboarding (not used for login)
5. If staff: a `Staff` record is created with region/directorate/department/contract/designation
6. `setPermissionsTeamId(null)` is called, then the `user` role is assigned
7. `onboarding_completed_at` is set to now

### Middleware Stack for Protected Routes

```
auth → verified → onboarding.complete → terms
```

Protected routes (dashboard, settings) require all four. The order ensures:
1. User must be logged in
2. Email must be verified
3. Onboarding must be completed
4. Terms & conditions must be accepted

---

## Terms & Conditions Module

### Overview

After onboarding, users must accept the terms and conditions before accessing the application. This is a one-time acceptance tracked by `terms_accepted` on the `users` table.

### Flow

```
[Onboarding complete] → Redirect to /dashboard
    → [terms middleware catches] → Redirect to /auth/terms
    → [Scrollable terms text + Accept button]
    → [Accept] → terms_accepted = true → Redirect to /dashboard
```

### Key Components

- **Controller**: `Auth\TermsController` (web), `Api\Auth\TermsController` (API)
- **Middleware**: `EnsureTermsAccepted` — registered as `terms` alias, redirects to `/auth/terms` if `terms_accepted` is false (skips if already on `terms*` routes)
- **Config**: `config/terms.php` — configurable title and text via env or inline default
- **Frontend**: `resources/js/pages/auth/terms.tsx` — scrollable terms box with accept button

### Routes

```
GET  /auth/terms   → TermsController@create (web) / TermsController@show (API)
POST /auth/terms   → TermsController@store
```

Terms routes are protected by `auth` middleware only (not by `terms` itself to avoid circular redirects).

---

## Staff Hierarchy Module

### Overview

A three-level geographic/administrative hierarchy that mirrors KeNHA's organizational structure. Used to assign staff members to their work location and department.

### Structure

```
Region (5)
├── code: NRB, CST, RV, WST, NYZ
├── hasMany → Directorates
│
├── Directorate (17 total)
│   ├── code: NRB-IP, NRB-RD, NRB-UR, NRB-CS, CST-IP, etc.
│   ├── belongsTo → Region
│   ├── hasMany → Departments
│   │
│   └── Department (33 total)
│       ├── code: NRB-IP-PP, NRB-IP-DE, NRB-RD-CN, etc.
│       └── belongsTo → Directorate
└── ...
```

### Models

| Model | Table | Key Relationships |
|-------|-------|-------------------|
| `Region` | `regions` | hasMany Directorates, belongsTo User (created_by) |
| `Directorate` | `directorates` | belongsTo Region, hasMany Departments, belongsTo User (created_by) |
| `Department` | `departments` | belongsTo Directorate, belongsTo User (created_by) |
| `ContractType` | `contract_types` | belongsTo User (created_by) |
| `Staff` | `staff` | belongsTo User, Region, Directorate, Department, ContractType |

### Seeders

- `RegionSeeder` — 5 regions (Nairobi, Coast, Rift Valley, Western, Nyanza) with unique codes
- `DirectorateSeeder` — 17 directorates spread across regions (Infrastructure Planning, Road Development, etc.)
- `DepartmentSeeder` — 33 departments nested under directorates (Project Planning, Design & Engineering, etc.)
- `ContractTypeSeeder` — 5 types (Permanent & Pensionable, Contract, Secondment, Internship, Attachment)

### Staff Record

A `Staff` record links a user to their organizational unit:
```php
staff {
    user_id, region_id, directorate_id, department_id,
    contract_type_id, designation
}
```

---

## Permissions & Roles Module

### Overview

Uses `spatie/laravel-permission` v6 with **teams enabled**. Each idea is a Spatie team, allowing per-idea role assignments.

### Global Roles (team_id = null)

| Role | Permissions | Assigned To |
|------|-------------|-------------|
| `admin` | All permissions + `points.create`, `points.edit`, `points.delete`, `points.view` | Super administrators (seeded: `kelvinramsiel@gmail.com`) |
| `board` | `idea.view`, `idea.approve_changes`, `points.view` | Board members who review and approve |
| `user` | `idea.create` | All registered users (assigned during onboarding) |

### Per-Idea Roles (team_id = idea.id)

When an idea is created, `Idea::createTeamRoles()` generates three roles scoped to that idea's team:

| Role | Permissions |
|------|-------------|
| `author` | view, edit, delete, propose_changes, approve_changes, manage_contributors |
| `contributor` | view, propose_changes |
| `collaborator` | view |

### How Teams Work

The `team_id` column on `model_has_roles` and `model_has_permissions` tables scopes role/permission assignments to a specific idea. The `roles` table also has `team_id = null` for global roles.

**Key pattern** — every permission check within an idea context:
```php
$previous = app(PermissionRegistrar::class)->setPermissionsTeamId($idea->id);
$user->refresh(); // Clear cached role relations
$result = $user->can('idea.edit'); // Scoped to this idea
app(PermissionRegistrar::class)->setPermissionsTeamId($previous);
```

This save/restore pattern prevents cross-idea permission leaks.

### Column Nullability

The `team_id` columns in `model_has_roles` and `model_has_permissions` are **nullable** to support global role assignments (where `team_id = null`).

---

## Idea Management Module

### Overview

Ideas are the core entity of the application. Each idea acts as a Spatie team for permission scoping, with collaboration and change request workflows.

### Models

**`Idea`** — `app/Models/Idea.php`
| Field | Type | Description |
|-------|------|-------------|
| title | string | Idea title |
| description | text | Idea description |
| author_id | FK→users | Creator |
| status | string | e.g. draft, submitted, approved |

On creation, `Idea::booted()` calls `createTeamRoles()` to generate per-idea roles.

**`ChangeRequest`** — `app/Models/ChangeRequest.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Parent idea |
| user_id | FK→users | Proposer |
| proposed_data | json | Proposed changes |
| notes | text | Optional notes |
| status | string | pending, approved, rejected |
| reviewed_by | FK→users (nullable) | Reviewer |
| feedback | text (nullable) | Review feedback |

**`CollaborationRequest`** — `app/Models/CollaborationRequest.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Target idea |
| user_id | FK→users | Requester |
| message | text | Request message |
| status | string | pending, approved, rejected |
| reviewed_by | FK→users (nullable) | Reviewer |
| feedback | text (nullable) | Review feedback |

### Workflow

1. User submits an idea → becomes `author`
2. Other users request collaboration → `CollaborationRequest`
3. Author approves → collaborator gets `collaborator` role on that idea
4. Contributors propose changes → `ChangeRequest`
5. Author approves/rejects → change auto-applied or rejected with feedback

---

## API Module

### Overview

The same business logic serves both the web SPA and mobile clients. Mobile clients authenticate via **Sanctum** tokens instead of session cookies.

### Google OAuth

```
GET  api/auth/google           → 200 { url: "https://accounts.google.com/..." }
GET  api/auth/google/callback  → 200 { token, user }
```

The callback uses `stateless()` to avoid session state issues in API contexts.

### OTP Authentication

```
POST api/auth/email          → Send OTP → 200 { message, cooldown_remaining }
POST api/auth/otp/verify     → Verify OTP → 200 { token, user }
POST api/auth/otp/resend     → Resend OTP → 200 { message, cooldown_remaining }
```

### Authenticated Endpoints

```
GET  api/user                → Current user with roles + terms_accepted
POST api/auth/logout         → Revoke current token
GET  api/onboarding          → Onboarding form data (regions, contract types, auto_staff)
POST api/onboarding          → Complete onboarding
GET  api/auth/terms          → Terms text + accepted status
POST api/auth/terms          → Accept terms
```

All authenticated endpoints require `Authorization: Bearer <token>` header.

### Key Differences from Web

- API returns JSON responses instead of redirects
- On successful OTP verify, API returns a `plainTextToken` instead of logging into session
- API uses `auth:sanctum` guard instead of session-based `auth`
- Onboarding uses `GET /api/onboarding` (show) instead of `GET /onboarding` (Inertia page)
- Google OAuth callback uses `stateless()` to avoid session dependency

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with dual email support (email + work_email) + google_id |
| `password_reset_tokens` | Laravel default |
| `sessions` | Session storage |
| `cache` + `cache_locks` | Cache storage |
| `jobs` + `job_batches` + `failed_jobs` | Queue system |
| `personal_access_tokens` | Sanctum API tokens |
| `permissions` | Spatie: all permissions |
| `roles` | Spatie: all roles (global: team_id=null, per-idea: team_id=idea.id) |
| `model_has_permissions` | Spatie: direct user-permission assignments |
| `model_has_roles` | Spatie: user-role assignments (scoped by team_id) |
| `role_has_permissions` | Spatie: role-permission associations |
| `ideas` | Innovation ideas (each idea is also a Spatie team) |
| `change_requests` | Proposed changes to ideas |
| `collaboration_requests` | Requests to join/collaborate on ideas |
| `otp_codes` | Audit trail for OTP requests |
| `regions` | KeNHA geographic regions |
| `directorates` | Directorates within regions |
| `departments` | Departments within directorates |
| `contract_types` | Employment contract types |
| `staff` | Staff information linked to users |
| `points` | Point/action definitions (name, description, point value, is_active, soft deletes) |
| `point_transactions` | Audit log of point awards (user, point, points, timestamp) |

### Key Indexes

- `users`: composite index on `(email, work_email)` for login lookup
- `users`: unique indexes on `email`, `work_email`, `mobile_number`, `google_id`
- `regions/directorates/departments`: unique indexes on `code`
- `model_has_roles`: composite primary key `(team_id, role_id, model_id, model_type)`

---

## Frontend Structure

### Pages

```
resources/js/pages/
├── auth/
│   ├── login.tsx          → Google OAuth + email input, POST to /auth/email
│   ├── otp.tsx            → 6-digit OTP input with countdown timer
│   ├── onboarding.tsx     → Personal info + staff hierarchy form
│   └── terms.tsx          → Scrollable terms text + accept button
├── dashboard.tsx          → Points balance, stats, recent transactions, leaderboard link
├── leaderboard.tsx        → Ranked user leaderboard with avatar + stats sidebar
├── welcome.tsx
├── settings/
│   ├── profile.tsx
│   ├── security.tsx       → 2FA management
│   └── appearance.tsx
└── points/
    ├── index.tsx          → Table of point actions with status/toggle/edit/delete
    ├── create.tsx         → Form to define a new point action
    ├── edit.tsx           → Edit an existing point action
    └── transactions.tsx   → Paginated audit log of all point awards
```

### Auth Flow Components

**`login.tsx`**
- Google Sign-in button at top (redirects to `/auth/google`)
- Divider between OAuth and email sections
- Email input + Continue button below
- Submits to `POST /auth/email`

**`otp.tsx`**
- 6-digit input using `input-otp` library with digit-only pattern
- Live 60-second countdown timer for resend button
- Formats cooldown as `m:ss`
- Submits to `POST /auth/otp/verify`
- "Use a different email" link back to login

**`onboarding.tsx`**
- Staff dialog (skipped for `auto_staff` users with `@kenha.co.ke` emails)
- **Email input**: disabled with login email pre-filled for normal users (can't be changed), editable optional field for kenha users
- Personal info section: first name, other names, mobile, gender, password, confirm password
- Staff info section (conditionally shown): region → directorate → department cascading selects, contract type, designation
- Uses hidden inputs for Shadcn Select values
- Submits to `POST /onboarding`

**`terms.tsx`**
- Scrollable terms text in a bordered container with muted background
- "Accept Terms & Conditions" button
- Submits to `POST /auth/terms`

### Layouts

- `layouts/app-layout.tsx` — Authenticated app shell with sidebar navigation, includes `<Toaster />` for notifications
- `layouts/auth-layout.tsx` — Auth pages shell, includes `<Toaster />`
- `layouts/auth/auth-split-layout.tsx` — Split screen layout for login/OTP
- `layouts/auth/auth-card-layout.tsx` — Centered card layout for onboarding and terms

### Components

- `components/user-info.tsx` — User avatar + name/email display (uses `useInitials()` for avatar fallback)
- `components/ui/` — Shadcn UI component library

### Body Pointer-Events Cleanup

When mobile sidebar (Radix UI Sheet) is open and the user navigates away (e.g., logout), `react-remove-scroll` can leave `pointer-events: none` stuck on the body. A global Inertia navigation listener in `app.tsx` cleans this up:

```ts
router.on('navigate', () => {
    document.body.style.removeProperty('pointer-events');
});
```

---

## Gamification / Points Module

### Overview

A gamification system that awards points to users for completing actions. Point actions are configurable via a management UI, and all awards are recorded in an audit-trail transaction log.

### Architecture

```
Points/
├── Models
│   ├── Point             → Immutable action definition (name, description, points, is_active)
│   └── PointTransaction  → Audit log (user_id, point_id, points, created_at)
├── Services
│   ├── PointService      → CRUD for Point definitions (create, update, delete, toggle, restore)
│   └── PointAwardService → Awarding, balance, leaderboard, daily login check, system stats
├── Controllers
│   ├── Points/
│   │   ├── PointController      → Web CRUD + toggle for point actions
│   │   ├── TransactionController → Web paginated transaction log
│   │   └── LeaderboardController → Web ranked leaderboard
│   └── Api/Points/
│       ├── PointController      → API JSON CRUD + toggle
│       ├── TransactionController → API JSON paginated transactions
│       └── LeaderboardController → API JSON leaderboard
├── Requests/Points/
│   ├── StorePointRequest   → validates name (unique), description, points (min:1); auth: points.create
│   └── UpdatePointRequest → same but name unique ignoring self; auth: points.edit
└── Listener/
    └── AwardDailyLoginPoints → Login event listener, awards "Daily Login" once per day
```

### Models

**`Point`** — `app/Models/Point.php`
| Field | Type | Description |
|-------|------|-------------|
| name | string | Unique action name (e.g. "New Account") |
| description | text (nullable) | Human-readable description |
| points | integer | Point value awarded |
| is_active | boolean | Whether this action is currently awardable |
| created_by | FK→users (nullable) | Admin who created this action |
| deleted_at | timestamp (nullable) | Soft delete support |

**`PointTransaction`** — `app/Models/PointTransaction.php`
| Field | Type | Description |
|-------|------|-------------|
| user_id | FK→users (cascade) | Recipient |
| point_id | FK→points (nullable, nullOnDelete) | Source action definition |
| points | integer | Denormalized point value at time of award |
| created_at | timestamp | Award time (no updated_at — immutable after award) |

### User Model Addition

The `users` table has a `points_balance` column (integer, default 0) shared globally via `HandleInertiaRequests.php` for seamless frontend access.

### Services

**`PointService`** — `app/Services/Points/PointService.php`
- `list(bool $withTrashed = false)` — All active points (or including soft-deleted)
- `create(array $data)` — Create a new point action
- `update(Point $point, array $data)` — Update with name uniqueness check
- `delete(Point $point)` — Soft delete
- `toggleActive(Point $point)` — Toggle is_active
- `restore(Point $point)` — Restore soft-deleted point

**`PointAwardService`** — `app/Services/Points/PointAwardService.php`
- `award(User $user, Point $point)` — Creates transaction, increments user balance
- `getBalance(User $user)` — Returns `points_balance` (null-safe fallback to 0)
- `getRecentTransactions(User $user, int $limit = 5)` — User's recent awards
- `hasBeenAwardedToday(User $user, Point $point)` — Checks `point_transactions` for today
- `getLeaderboard(int $perPage = 10)` — Users ranked by points balance
- `getSystemStats()` — Total awarded, active actions, users with ≥1 point

### Dashboard Integration

The dashboard has three permission tiers for progressive disclosure:

1. **Normal user** — Own `points_balance`, recent 5 transactions
2. **Has `points.view`** — Also sees system-wide stats (total awarded, active actions, users with points) and leaderboard link
3. **Has `points.create`/`edit`/`delete`** — Also sees management quick-links to point actions and transaction log

### Points Seeded Actions

| Action | Point Value | Awarded When |
|--------|-------------|-------------|
| New Account | 100 | Onboarding completion (via `OnboardingService`) |
| Daily Login | 10 | First login each day (via `AwardDailyLoginPoints` listener) |

### Listener: AwardDailyLoginPoints

Registered in `AppServiceProvider::registerEventListeners()`:
```php
Event::listen(Login::class, AwardDailyLoginPoints::class);
```

On each login event, it:
1. Looks up the "Daily Login" `Point` by name
2. Checks `PointAwardService::hasBeenAwardedToday()` against `point_transactions`
3. If not yet awarded today, calls `award()` to credit the user

### Wayfinder Integration

Points routes generate a separate barrel file at `resources/js/routes/points/index.ts`:
```ts
import points from '@/routes/points';

// Usage:
points.index()       // GET /points
points.create()      // GET /points/create
points.edit(id)      // GET /points/{id}/edit
points.store()       // POST /points
points.update(id)    // PUT /points/{id}
points.destroy(id)   // DELETE /points/{id}
points.toggle(id)    // POST /points/{id}/toggle
points.transactions() // GET /points/transactions
```

This follows the Wayfinder v0.1.16 barrel pattern — each route group gets its own file, not re-exported from the main `routes/index.ts`.

---

## Key Decisions & Patterns

### Why OTP Instead of Password?

- Eliminates password reset flows
- Works well for both web and mobile
- Kenha email auto-detection enables seamless staff onboarding
- Rate-limited (60s cooldown, 5 attempt max) prevents abuse

### Why Each Idea Is a Spatie Team?

- Enables per-idea role assignments (author, contributor, collaborator)
- Permission checks are naturally scoped to the current idea
- Prevents users from accessing ideas they don't belong to
- `save/restore` pattern prevents stale cache across ideas

### Why Dual Email Fields?

- `email` — Personal email (can be added during onboarding, unverified unless used for login)
- `work_email` — Kenha corporate email (auto-detected, verified during OTP)
- `email_verified_at` — Only set if the user logged in with that email
- Login searches both fields via a composite index

### Why Nullable team_id?

- Global roles (admin, board, user) have `team_id = null`
- The `model_has_roles` pivot table must accept null team_id for these global assignments
- Per-idea roles use the idea's ID as team_id

### Why Terms After Onboarding?

- User completes profile first, then reads and accepts terms
- Clean separation: onboarding collects user data, terms capture legal consent
- The middleware stack enforces the order: auth → verified → onboarding.complete → terms

### Why GoogleAuthService?

- Both web and API Google controllers share identical find-or-create logic
- Extracting to `GoogleAuthService` eliminates duplication
- Follows the project's service-oriented pattern (AuthService, OtpService, OnboardingService)

### Why Points Folder Structure Instead of Admin?

- All gamification code lives under `Points/` subdirectories (Controllers, Api/Points, Services/Points, Requests/Points)
- Avoids the `admin` word entirely — this is a management concern, not an admin panel
- Consistent naming: `Point` model → `PointService` → `PointController` → `Points/` routes prefix

### Why Two Services Instead of One?

- `PointService` handles CRUD for point action definitions (admin tasks)
- `PointAwardService` handles runtime awarding, balance, and leaderboard (user-facing tasks)
- Separation of concerns: one manages the catalog, the other manages the economy

### Why Denormalized `points` on Transactions?

- `PointTransaction.points` stores the numeric value at award time (not a FK to `Point.points`)
- If a point action's value is later changed, historical awards retain their original value
- The `point_id` FK is nullable with `nullOnDelete` so deleting a point definition doesn't destroy history

### Why Daily Login Check on Transactions Table?

- No extra column needed on the `users` table
- Single source of truth: `point_transactions` records everything
- Query: `where('user_id', $user->id)->where('point_id', $point->id)->whereDate('created_at', today())->exists()`

### Why Dashboard Has Three Permission Tiers?

- Progressive disclosure: normal users see their own data, authorized users see system stats, managers see admin links
- Avoids an empty dashboard for users without gamification permissions
- Uses a single controller with conditional prop passing instead of separate endpoints
