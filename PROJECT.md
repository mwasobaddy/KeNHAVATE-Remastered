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
└── Laravel Fortify     (2FA, password confirmation)
```

The application follows a **service-oriented architecture**:

- **Controllers** — Thin HTTP handlers that delegate to services
- **Services** — Business logic layer (AuthService, OtpService, OnboardingService)
- **Form Requests** — Validation logic extracted from controllers
- **Models** — Eloquent models with relationships and Spatie permission traits
- **Shared frontend/backend** — Same backend serves both web (Inertia SPA) and mobile (Sanctum API)

Web controllers live under `App\Http\Controllers\Auth\`, API controllers mirror them under `App\Http\Controllers\Api\Auth\` with identical method names.

---

## Authentication Module

### Overview

Passwordless OTP-based authentication. Users enter their email, receive a 6-digit code, and verify. No password is needed to log in — passwords are set during onboarding only.

### Flow

```
[Email Input] → POST /auth/email → [OTP Sent] → GET /auth/otp
    → [Enter 6-digit Code] → POST /auth/otp/verify
    → [Verified] → [Onboarding?] → /onboarding or /dashboard
```

### Key Components

| Layer | Web | API |
|-------|-----|-----|
| **Initiate** | `Auth\EmailLoginController::__invoke` → `POST /auth/email` | `Api\Auth\EmailLoginController::__invoke` → `POST api/auth/email` |
| **Verify** | `Auth\OtpVerificationController::store` → `POST /auth/otp/verify` | `Api\Auth\OtpVerificationController::store` → `POST api/auth/otp/verify` |
| **Resend** | `Auth\OtpVerificationController::resend` → `POST /auth/otp/resend` | `Api\Auth\OtpVerificationController::resend` → `POST api/auth/otp/resend` |

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

### Kenha Email Detection

Emails ending in `@kenha.co.ke` are automatically detected:
- Stored in `work_email` field instead of `email`
- `email` field stays null
- `work_email_verified_at` is set on OTP verification
- Login lookup searches both `email` and `work_email` columns via composite index

### Routes

**Guest routes (web):**
```
POST   /auth/email        → EmailLoginController
GET    /auth/otp          → OtpVerificationController@create
POST   /auth/otp/verify   → OtpVerificationController@store
POST   /auth/otp/resend   → OtpVerificationController@resend
```

**Guest routes (api):**
```
POST   api/auth/email        → Api\Auth\EmailLoginController
POST   api/auth/otp/verify   → Api\Auth\OtpVerificationController@store
POST   api/auth/otp/resend   → Api\Auth\OtpVerificationController@resend
```

**Authenticated API routes (Sanctum):**
```
POST   api/auth/logout   → OtpVerificationController@logout
GET    api/user          → OtpVerificationController@user
```

---

## Onboarding Module

### Overview

After first-time OTP login, users are redirected to `/onboarding` to complete their profile. This is a one-time flow tracked by `onboarding_completed_at` on the `users` table.

### Flow

```
[First Login] → Redirect to /onboarding
    → [Dialog: "Are you a KeNHA Staff?"] (skipped for @kenha.co.ke)
    → [Personal Info: name, mobile, gender, personal email, password]
    → [Staff Info: region, directorate, department, contract type, designation]
    → [Submit] → user role assigned → redirected to /dashboard
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
3. Optional `email` field stores a personal email (rejected if it matches `work_email`)
4. `email_verified_at` stays null for personal emails set during onboarding (not used for login)
5. If staff: a `Staff` record is created with region/directorate/department/contract/designation
6. `setPermissionsTeamId(null)` is called, then the `user` role is assigned
7. `onboarding_completed_at` is set to now

### Middleware Stack for Protected Routes

```
auth → verified → onboarding.complete
```

Protected routes (dashboard, settings) require all three.

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
| `admin` | All permissions | Super administrators (seeded: `kelvinramsiel@gmail.com`) |
| `board` | `idea.view`, `idea.approve_changes` | Board members who review and approve |
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

### Authentication

```
POST api/auth/email          → Send OTP → 200 { message, cooldown_remaining }
POST api/auth/otp/verify     → Verify OTP → 200 { token, user }
POST api/auth/otp/resend     → Resend OTP → 200 { message, cooldown_remaining }
```

### Authenticated Endpoints

```
GET  api/user                → Current user with roles
POST api/auth/logout         → Revoke current token
GET  api/onboarding          → Onboarding form data (regions, contract types, auto_staff)
POST api/onboarding          → Complete onboarding
```

All authenticated endpoints require `Authorization: Bearer <token>` header.

### Key Differences from Web

- API returns JSON responses instead of redirects
- On successful OTP verify, API returns a `plainTextToken` instead of logging into session
- API uses `auth:sanctum` guard instead of session-based `auth`
- Onboarding uses `GET /api/onboarding` (show) instead of `GET /onboarding` (Inertia page)

---

## Database Schema

### Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts with dual email support (email + work_email) |
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

### Key Indexes

- `users`: composite index on `(email, work_email)` for login lookup
- `users`: unique indexes on `email`, `work_email`, `mobile_number`
- `regions/directorates/departments`: unique indexes on `code`
- `model_has_roles`: composite primary key `(team_id, role_id, model_id, model_type)`

---

## Frontend Structure

### Pages

```
resources/js/pages/
├── auth/
│   ├── login.tsx          → Email-only input, POST to /auth/email
│   ├── otp.tsx            → 6-digit OTP input with countdown timer
│   └── onboarding.tsx     → Personal info + staff hierarchy form
├── dashboard.tsx
├── welcome.tsx
└── settings/
    ├── profile.tsx
    ├── security.tsx       → 2FA management
    └── appearance.tsx
```

### Auth Flow Components

**`login.tsx`**
- Single email input field
- Submits to `POST /auth/email`
- Displays `processing` state as "Sending OTP..."
- On success, redirects to OTP page
- Shows flash status messages

**`otp.tsx`**
- 6-digit input using `input-otp` library with digit-only pattern
- Live 60-second countdown timer for resend button
- Formats cooldown as `m:ss`
- Submits to `POST /auth/otp/verify`
- "Use a different email" link back to login

**`onboarding.tsx`**
- Staff dialog (skipped for `auto_staff` users with `@kenha.co.ke` emails)
- Personal info section: first name, other names, mobile, gender, personal email, password, confirm password
- Staff info section (conditionally shown): region → directorate → department cascading selects, contract type, designation
- Uses hidden inputs for Shadcn Select values
- Submits to `POST /onboarding`

### Layouts

- `layouts/app-layout.tsx` — Authenticated app shell with sidebar navigation, includes `<Toaster />` for notifications
- `layouts/auth-layout.tsx` — Auth pages shell, includes `<Toaster />`
- `layouts/auth/auth-split-layout.tsx` — Split screen layout for login/OTP
- `layouts/auth/auth-card-layout.tsx` — Centered card layout for onboarding

### Components

- `components/user-info.tsx` — User avatar + name/email display (uses `useInitials()` for avatar fallback)
- `components/ui/` — Shadcn UI component library

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
