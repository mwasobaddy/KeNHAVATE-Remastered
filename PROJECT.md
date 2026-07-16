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
- **Services** — Business logic layer (AuthService, OtpService, OnboardingService, GoogleAuthService, PointService, PointAwardService, IdeaService, IdeaCategoryService, AssignmentService, ClassificationService, ChangeRequestService, InvitationService, AuditService)
- **Form Requests** — Validation logic extracted from controllers
- **Models** — Eloquent models with relationships and Spatie permission traits
- **Shared frontend/backend** — Same backend serves both web (Inertia SPA) and mobile (Sanctum API)

Feature controllers are organized in subdirectories by domain:
- `Auth\` — Authentication controllers (web) with `Api\Auth\` mirrors
- `Ideas\` — Idea management, assignments, classifications, review dashboard, change requests, invitations, collaborations with `Api\Ideas\` mirrors (AssignmentController, ClassificationController, ReviewController, ChangeRequestController, CollaborationController, InvitationController)
- `Points\` — Gamification with `Api\Points\` mirrors
- `Audit\` — Audit trail with `Api\Audit\` mirrors

Web controllers live under `App\Http\Controllers\`, API controllers mirror them under `App\Http\Controllers\Api\` with identical method names. Both web (`ReviewController`) and API (`Api\Ideas\ReviewController`) versions serve the review dashboard with permission-gated sections.

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
GET    /leaderboard            → LeaderboardController@index
GET    /audit                  → AuditController@index       (permission: audit.view)
```

**Idea routes (web)** `[auth, verified, onboarding.complete, terms]`:
```
GET    /ideas                                         → IdeaController@index
GET    /ideas/review                                  → ReviewController@index
GET    /ideas/create                                  → IdeaController@create
POST   /ideas                                         → IdeaController@store
GET    /ideas/{slug}                                  → IdeaController@show
GET    /ideas/{slug}/edit                             → IdeaController@edit
PUT    /ideas/{slug}                                  → IdeaController@update
DELETE /ideas/{slug}                                  → IdeaController@destroy
GET    /ideas/{slug}/documents/{document}              → IdeaController@downloadDocument
GET    /ideas/{slug}/ip-documents/{ipDocument}         → IdeaController@downloadIpDocument

GET    /ideas/collaborations/inbox                     → CollaborationRequestController@inbox
GET    /ideas/collaborations/outbox                    → CollaborationRequestController@outbox

GET    /ideas/{slug}/changes                                          → ChangeRequestController@index
GET    /ideas/{slug}/changes/create                                    → ChangeRequestController@create
POST   /ideas/{slug}/changes                                           → ChangeRequestController@store
GET    /ideas/{slug}/changes/{changeRequest}                            → ChangeRequestController@show
POST   /ideas/{slug}/changes/{changeRequest}/approve                    → ChangeRequestController@approve
POST   /ideas/{slug}/changes/{changeRequest}/reject                     → ChangeRequestController@reject

GET    /ideas/{slug}/collaborations                                    → CollaborationController@index
POST   /ideas/{slug}/collaborations                                    → CollaborationController@store
POST   /ideas/{slug}/collaborations/{collaboration}/approve             → CollaborationController@approve
POST   /ideas/{slug}/collaborations/{collaboration}/reject              → CollaborationController@reject
```

**Invitation routes (web)** (no middleware — public + guest):
```
GET    /invitations/{token}     → InvitationController@show
POST   /invitations/accept      → InvitationController@acceptFromLogin
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

**Idea routes (API)** under `auth:sanctum`:
```
GET    api/ideas                                  → Api\Ideas\IdeaController@index
POST   api/ideas                                  → Api\Ideas\IdeaController@store
GET    api/ideas/review                           → Api\Ideas\ReviewController@index
GET    api/ideas/{slug}                           → Api\Ideas\IdeaController@show
PUT    api/ideas/{slug}                           → Api\Ideas\IdeaController@update
DELETE api/ideas/{slug}                           → Api\Ideas\IdeaController@destroy

GET    api/ideas/{slug}/changes                   → Api\Ideas\ChangeRequestController@index
POST   api/ideas/{slug}/changes                   → Api\Ideas\ChangeRequestController@store
GET    api/ideas/{slug}/changes/{changeRequest}    → Api\Ideas\ChangeRequestController@show
POST   api/ideas/{slug}/changes/{changeRequest}/approve → Api\Ideas\ChangeRequestController@approve
POST   api/ideas/{slug}/changes/{changeRequest}/reject  → Api\Ideas\ChangeRequestController@reject

GET    api/ideas/{slug}/collaborations                → Api\Ideas\CollaborationController@index
POST   api/ideas/{slug}/collaborations                → Api\Ideas\CollaborationController@store
POST   api/ideas/{slug}/collaborations/{collaboration}/approve → Api\Ideas\CollaborationController@approve
POST   api/ideas/{slug}/collaborations/{collaboration}/reject  → Api\Ideas\CollaborationController@reject

POST   api/ideas/{slug}/assign                       → Api\Ideas\AssignmentController@store
POST   api/ideas/{slug}/classify                      → Api\Ideas\ClassificationController@store
```

**Invitation routes (API)** (no auth — public):
```
GET    api/invitations/{token}                     → Api\Ideas\InvitationController@show
```

**Invitation routes (API)** under `auth:sanctum`:
```
POST   api/invitations/{token}/accept              → Api\Ideas\InvitationController@accept
```

**Audit routes (API)** under `auth:sanctum`:
```
GET    api/audit                                   → Api\Audit\AuditController@index
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
GET    api/audit                  → Api\Audit\AuditController@index
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
POST   api/auth/logout       → OtpVerificationController@logout
GET    api/user              → OtpVerificationController@user
GET    api/onboarding        → OnboardingController@show
POST   api/onboarding        → OnboardingController@store
GET    api/auth/terms        → TermsController@show
POST   api/auth/terms        → TermsController@store
POST   api/invitations/{token}/accept → InvitationController@accept
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
| `admin` | All permissions | Super administrators (seeded: `kelvinramsiel@gmail.com`) |
| `user` | `idea.create` | All registered users (assigned during onboarding) |

### Per-Idea Roles (team_id = idea.id)

When an idea is created, `Idea::createTeamRoles()` generates three roles scoped to that idea's team:

| Role | Permissions |
|------|-------------|
| `author` | view, edit, delete, propose_changes, approve_changes, manage_contributors |
| `contributor` | view, propose_changes |
| `collaborator` | view, propose_changes |

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

Ideas are the core entity of the application. Each idea acts as a Spatie team for permission scoping, with team invitations, file attachments, and a git-like change request workflow.

### Idea Categories

Categories are seeded via `IdeaCategorySeeder` with 8 categories (Technology & Systems, Process & Operations, etc.). Each idea belongs to one category.

### Models

**`Idea`** — `app/Models/Idea.php`
| Field | Type | Description |
|-------|------|-------------|
| title | string | Idea title |
| slug | string | URL-friendly unique slug |
| description | text | Idea description |
| problem_statement | text | Problem being solved |
| proposed_solution | text | Proposed solution |
| cost_benefit_analysis | text | Cost/benefit breakdown |
| category_id | FK→idea_categories | Category |
| author_id | FK→users | Creator |
| assigned_officer_id | FK→users (nullable) | RI&KM Officer processing this idea |
| assigned_at | timestamp (nullable) | When officer was assigned |
| classification_id | FK→idea_classifications (nullable) | Innovation, Research, Project, or Outside Mandate |
| classified_at | timestamp (nullable) | When classification was recorded |
| collaboration_enabled | boolean | Whether others can request to collaborate (default true) |
| status | string | draft, submitted, assigned, revision_requested, resubmitted, classified, dg_review, approved, declined, deferred, planned, closed, in_progress, completed, implemented |
| deleted_at | timestamp (nullable) | Soft delete support |

On creation, `Idea::booted()` calls `createTeamRoles()` to generate per-idea roles (author, contributor, collaborator).
Relationships: `ipRight()` HasOne → `IdeaIpRight`, `assignedOfficer()` BelongsTo → `User`, `classification()` BelongsTo → `IdeaClassification`, `reviews()` HasMany → `IdeaReview`.

**`IdeaCategory`** — `app/Models/IdeaCategory.php`
| Field | Type | Description |
|-------|------|-------------|
| name | string | Category name |
| slug | string | Unique URL slug |
| description | text (nullable) | Category description |

**`IdeaDocument`** — `app/Models/IdeaDocument.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Parent idea |
| type | string | proposal or supporting |
| file_path | string | Storage path (private/ideas/) |
| original_name | string | Original filename |
| file_size | integer | File size in bytes |
| mime_type | string | e.g. application/pdf |

Documents are append-only (no `updated_at` column). Files are stored privately on the `local` disk at `storage/app/private/ideas/`. Downloaded via `IdeaController::downloadDocument()`.

**`IdeaInvitation`** — `app/Models/IdeaInvitation.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Target idea |
| email | string | Invited email |
| token | string | Unique UUID token for acceptance |
| accepted_at | timestamp (nullable) | When accepted |

Supports two flows: existing users are assigned `contributor` role immediately; non-users receive an email with an acceptance link.

**`ChangeRequest`** — `app/Models/ChangeRequest.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Parent idea |
| user_id | FK→users | Proposer |
| proposed_data | json | Array of `{field, old_value, new_value}` objects |
| notes | text | Optional notes |
| status | string | pending, approved, rejected |
| reviewed_by | FK→users (nullable) | Reviewer |
| feedback | text (nullable) | Review feedback |

**`IdeaIpRight`** — `app/Models/IdeaIpRight.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas (unique) | Parent idea (one IP right per idea) |
| has_ip_protection | boolean | User indicates whether IP is already protected |
| patent_number | string (nullable) | Optional patent/registration number |
| consent_given | boolean | User gave KeNHA consent for IP processing |
| consent_given_at | timestamp (nullable) | When consent was given |
| status | string | pending, in_review, registered, rejected |

On create/update, consent is recorded for all submissions regardless of IP protection status.
The `documents()` HasMany relationship provides access to patent document files.

**`IdeaIpDocument`** — `app/Models/IdeaIpDocument.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_ip_right_id | FK→idea_ip_rights | Parent IP right |
| file_path | string | Storage path (private/ip-documents/) |
| original_name | string | Original filename |
| file_size | integer | File size in bytes |
| mime_type | string | e.g. application/pdf |

Append-only (no `updated_at`). Downloaded via `IdeaController::downloadIpDocument()`.

**`CollaborationRequest`** — `app/Models/CollaborationRequest.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Target idea |
| user_id | FK→users | Requester |
| message | text | Request message |
| status | string | pending, approved, rejected |
| reviewed_by | FK→users (nullable) | Reviewer |
| feedback | text (nullable) | Review feedback |

### Services

**`IdeaService`** — `app/Services/Ideas/IdeaService.php`
- `create(user, data, proposal?, supportDocs?, ipData?, ipDocuments?)` — Creates idea + slug, handles file uploads, sends team invitations, awards 50pts to author and each contributor. Accepts optional IP data (has_ip_protection, patent_number, consent_given) and IP document files
- `update(idea, user, data, proposal?, supportDocs?, ipData?, ipDocuments?)` — Updates idea fields, manages document replacements and IP data
- `delete(idea)` — Soft deletes with audit logging
- `getMyIdeas(user)` — Paginated ideas authored by the user
- `getOpenForCollaboration(user)` — Paginated ideas with collaboration enabled, excluding user's own
- `getMyContributions(user)` — Paginated ideas where user is an invited/accepted contributor
- `getPendingAssignment()` — Paginated submitted ideas with no officer assigned (for DD)
- `getMyAssignments(user)` — Paginated ideas where user is assigned as officer (status: assigned, resubmitted)
- `getPendingDecisions()` — Paginated ideas in dg_review status awaiting DG decision
- `handleIpData(idea, ipData, ipDocuments)` — Creates/updates `IdeaIpRight` record, records consent timestamp, stores/deletes IP documents based on has_ip_protection toggle
- `notifyReviewers(idea)` — Queries users with `idea.receive_new_submission_notifications` permission and emails them a `NewIdeaSubmittedMail` with idea details and link
- Team emails accepted as comma-separated string, split and validated server-side

**`CollaborationRequestService`** — `app/Services/Ideas/CollaborationRequestService.php`
- `request(idea, user, message)` — Create collaboration request (validates: idea exists, collaboration enabled, user not author, no existing pending request)
- `approve(request, reviewer, feedback?)` — Assign `collaborator` role on the idea's team, audit log (`collaboration_approved`)
- `reject(request, reviewer, feedback)` — Mark rejected, send `CollaborationRejectedMail`, audit log (`collaboration_rejected`)
- `getForIdea(idea)` — All requests for an idea (with user + reviewer relations)
- `getPendingForIdea(idea)` — Only pending requests
- `getInbox(user)` — Paginated requests for ideas where user is author (with idea, requester, reviewer relations)
- `getOutbox(user)` — Paginated requests sent by the user (with idea, author, reviewer relations)

**`InvitationService`** — `app/Services/Ideas/InvitationService.php`
- `findByToken(token)` — Look up pending invitation
- `accept(invitation, user)` — Assign `contributor` role, award 50pts, mark accepted
- `getPendingForEmail(email)` — Find all pending invitations for auto-accept

**`ChangeRequestService`** — `app/Services/Ideas/ChangeRequestService.php`
- `propose(idea, user, data)` — Create pending change request, notify author
- `approve(changeRequest, reviewer, feedback?)` — Auto-apply changes to idea, audit log
- `reject(changeRequest, reviewer, feedback)` — Mark rejected with feedback, notify proposer

### Idea Submission Notification Flow

```
[User submits an idea]
    → IdeaService::create() runs all creation logic
    → notifyReviewers() queries users with `idea.receive_new_submission_notifications` permission
    → For each matching user: sends NewIdeaSubmittedMail (title, author, category, link to idea)
```

This permission is assigned to `admin` by default and can be granted directly to any user. It is intentionally **not tied to a specific role** — any user can be granted this permission at any time, making the notification system flexible. To assign it to a user:

```php
$user->givePermissionTo('idea.receive_new_submission_notifications');
```

### Invitation Flow

```
[Idea Created with team_emails]
    → For each email:
        → User exists? → Assign contributor role, award 50pts
        → No user? → Create IdeaInvitation with token, send IdeaInvitationMail
            → User clicks link → GET /invitations/{token}
            → Sees idea title + inviter → "Sign in to Accept"
            → Login (OTP or Google) → OnboardingService::processPendingInvitations()
            → Auto-accepts by email → contributor role + 50pts → Redirect to idea
```

### Change Request Workflow

```
[Contributor proposes changes]
    → GET /ideas/{slug}/changes/create → Select fields to edit, enter new values
    → POST /ideas/{slug}/changes → Proposed data stored as JSON diff
    → Email sent to idea author (ChangeRequestSubmittedMail)
    
[Author reviews]
    → GET /ideas/{slug}/changes/{id} → Side-by-side diff view
    → Approve → Changes auto-applied to idea, proposer notified
    → Reject → Feedback recorded, proposal closed, proposer notified
```

Each change request batches multiple field edits (title, description, problem_statement, proposed_solution, cost_benefit_analysis) with old/new values preserved in `proposed_data` for full history. Rejected requests can be resubmitted as new proposals.

### Collaboration Request Workflow

```
[User requests to collaborate]
    → Idea must have collaboration_enabled = true
    → User must not be the idea author
    → No existing pending request for this user+idea
    → POST /ideas/{slug}/collaborations → Creates pending request
    → Email sent to idea author (CollaborationRequestedMail)

[Author reviews pending requests]
    → GET /ideas/{slug}/collaborations → List of pending requests
    → Approve → Assigns collaborator role, sends CollaborationApprovedMail
    → Reject → Records feedback, sends CollaborationRejectedMail
```

Collaboration requests award no points on approval — points are earned later through actual content contributions (planned future feature). `collaborator` role includes `idea.propose_changes` permission, enabling the collaborator to propose change requests like contributors.

### Intellectual Property Rights

Each idea has an optional one-to-one IP rights record collected during creation/editing:

```
[IP Section in Create/Edit Form]
    → Radio: "Is this idea IP protected?" (Yes / No)
    
    [If Yes]
        → Patent Number (optional text input)
        → Upload Patent Documents (PDF, DOC, DOCX, ≤10MB)
    
    [If No]
        → Warning: "This idea is not currently IP protected. By submitting,
          you give KeNHA consent to proceed with the initialization of
          Intellectual Property for this idea."
    
    [Always — required checkbox]
        → Consent checkbox adapts text based on selection:
            • IP protected: "review and processing of this idea"
            • Not protected: "initialization of Intellectual Property"
        → Validation: `required|accepted` (must be checked)
```

**Storage**: Patent documents stored on `local` disk at `storage/app/private/ip-documents/{idea_id}/`. The `idea_ip_documents` table is append-only (no `updated_at`). Switching from "Yes" to "No" removes existing IP documents.

**Show page**: Displays IP card with status badges (IP Protected / Not Protected), registration status, patent number, document download links, and consent date.

**Download endpoint**: `GET /ideas/{slug}/ip-documents/{ipDocument}` → `IdeaController::downloadIpDocument()`

### Review Workflow

The idea review process follows the KeNHA RI&KM policy (section 2.3.1):

```
[Idea submitted] → status: submitted
    ↓ (appears in "Pending Assignment" on review dashboard)
[DD assigns RI&KM Officer] → status: assigned
    ↓ (appears in officer's "My Assignments" on review dashboard)
    ↓
[Officer reviews, may request revision ↔ author resubmits]
    → revision_requested ↔ resubmitted (loop as needed)
    ↓
[Officer classifies idea] → status: classified, classification_id set
    ↓
[DD action based on type]
    ├── Innovation → DD memo to DG → status: dg_review (appears in "Pending Decisions")
    │   ├── DG approves → status: approved
    │   ├── DG defers → status: deferred
    │   └── DG declines → status: declined
    ├── Research/Project → status: planned (logged for annual planning)
    │   └── Deferred (max 2 cycles) → status: deferred → closed
    └── Outside Mandate → status: closed
    ↓
[After approval] → status: in_progress → completed → implemented
```

Each review action (assignment, classification, revision request, decision) creates an `IdeaReview` record with the stage, action, reviewer, notes, and optional uploaded document. The full trail is visible to the idea author.

### Review Dashboard

A dedicated review dashboard (`/ideas/review`) surfaces ideas at each stage of the review pipeline:

| Section | Shows | Permission |
|---------|-------|------------|
| **Pending Assignment** | Submitted ideas with no officer assigned | `idea.assign_officer` |
| **My Assignments** | Ideas assigned to the current officer (status: assigned, resubmitted) | `idea.classify` |
| **Pending Decisions** | Ideas in dg_review status awaiting DG decision | `idea.dg_decision` |

Ideas **move between views** as they progress through the workflow — a submitted idea appears in Pending Assignment, then moves to My Assignments once assigned, then to Pending Decisions once classified as Innovation. Each section shows the ideas status, author, category, submission date, and assigned officer with a direct link to the idea detail page.

The sidebar has individual navigation links under the **Review** group for each section, each gated by its respective permission. A "Back to Review Dashboard" button appears on the idea show page when the user has any review permission.

**`IdeaClassification`** — `app/Models/IdeaClassification.php`
| Field | Type | Description |
|-------|------|-------------|
| name | string | Display name (Innovation, Research, Project, Outside Mandate) |
| slug | string | Unique URL slug |
| description | text (nullable) | Description of the classification type |

Seeded via `IdeaClassificationSeeder` with the 4 types defined in the RI&KM policy.

**`IdeaReview`** — `app/Models/IdeaReview.php`
| Field | Type | Description |
|-------|------|-------------|
| idea_id | FK→ideas | Parent idea |
| reviewer_id | FK→users | Who performed the review action |
| stage | string | Which step in the workflow (assignment, classification, revision, dg_decision, planning, execution, close) |
| action | string | Specific action taken (assigned, classified, revision_requested, resubmitted, memo_to_dg, approved, declined, etc.) |
| notes | text (nullable) | Internal notes or feedback for author |
| document_path | string (nullable) | Uploaded memo, decision letter, or report |

### Review Permissions

Permissions are assigned directly to users rather than tied to specific global roles. This allows any user to be granted review capabilities regardless of their role.

| Permission | Purpose | Typical Holder |
|-----------|---------|---------------|
| `idea.assign_officer` | Assign an RI&KM Officer to an idea | DD (RI&KM) |
| `idea.classify` | Classify ideas into Innovation/Research/Project/Outside Mandate | RI&KM Officer |
| `idea.dg_decision` | Record approval/deferral/decline decisions | DG |
| `idea.review` | View review dashboard and pending reviews | DD, Officer, DG |

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
| `ideas` | Innovation ideas (each idea is also a Spatie team, soft deletes) |
| `idea_categories` | Pre-seeded categories for classifying ideas |
| `idea_documents` | File attachments (proposals & supporting docs, append-only) |
| `idea_invitations` | Pending team member invitations (token-based) |
| `idea_ip_rights` | One-to-one IP right record per idea (has_ip_protection, patent_number, consent_given, status) |
| `idea_ip_documents` | Patent document files attached to an IP right record |
| `idea_classifications` | Lookup: Innovation, Research, Project, Outside Mandate |
| `idea_reviews` | Structured review decision history (stage, action, notes, document_path) |
| `change_requests` | Proposed changes to ideas (diff-based, full history) |
| `collaboration_requests` | Requests to join/collaborate on ideas |
| `audit_logs` | Structured audit trail for all key actions |
| `otp_codes` | Audit trail for OTP requests (`otp` column encrypted at rest via Eloquent cast) |
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

## Brand Identity

### KeNHA Brand Colors

The application uses KeNHA's official brand colors defined as CSS custom properties in `app.css`:

| Token | Hex | Usage |
|-------|-----|-------|
| `--kenha-black` | `#231F20` | Sidebar background (dark mode), sidebar foreground text (light mode), primary interactive elements |
| `--kenha-gray` | `#9B9EA4` | Sidebar group labels, secondary text in logo area |
| `--kenha-beige` | `#F8EBD5` | Sidebar background (light mode) — warm, approachable, evokes paper/institutional feel |
| `--kenha-yellow` | `#FFF200` | Active nav indicator (3px left border), focus ring, toggle button when collapsed, logo mark background |

### Sidebar Theming

The sidebar uses separate CSS variables in `:root` (light) and `.dark` to map brand colors:

**Light mode** (`--sidebar` variables in `:root`):
- Background: `#F8EBD5` (Beige) — warm, clearly separates nav from white page content
- Foreground: `#231F20` (Black) — maximum contrast on beige  
- Accent (hover/active): `#EDDCC0` — slightly darker beige, keeps palette cohesive
- Active indicator: 3px yellow left border via `::before` pseudo-element
- Group labels: `#9B9EA4` (Gray) — muted secondary text

**Dark mode** (`--sidebar` variables in `.dark`):
- Background: `#231F20` (Black) — brand black as canvas, feels intentional
- Foreground: `#F8EBD5` (Beige) — warm text, reduces eye strain vs pure white
- Accent (hover/active): `#2E2A22` — beige-tinted dark for subtle hover states
- Active indicator: same 3px yellow left border — pops on black
- Group labels: `#9B9EA4` (Gray)

**Logo area** (yellow `#FFF200` square with black "K" letter):
- Acts as the brand anchor at the top of the sidebar
- Below it: "KeNHA" in sidebar foreground color, "Innovation Portal" in brand gray

**Sidebar toggle**: Icon turns yellow (`#FFF200`) when sidebar is collapsed to signal "click to expand"

### Visual Hierarchy in the Sidebar

```
[K  KeNHA                    ← Yellow bg + black "K", KeNHA in black, subtitle in gray
    Innovation Portal]
────────────────────────────────
General                       ← gray group label
  📊 Dashboard                ← black icon + text; active: yellow indicator + accent bg
  💡 Ideas
  🏆 Leaderboard
────────────────────────────────
Review                        ← gray group label
  📋 Assign Officer           ← permission-gated items
  📝 My Assignments
  ... 
────────────────────────────────
Collaboration                 ← gray group label
  📥 Inbox
  📤 Sent Requests
────────────────────────────────
👤 User Name                  ← bordered footer area
   email@kenha.co.ke
```

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
├── points/
│   ├── index.tsx          → Table of point actions with colored icon buttons (Pencil green, Power amber, Trash2 red)
│   ├── create.tsx         → Form to define a new point action
│   ├── edit.tsx           → Edit an existing point action
│   └── transactions.tsx   → Paginated audit log of all point awards
├── ideas/
│   ├── index.tsx          → Paginated table with 3 tabs (My Ideas / Open for Collaboration / My Contributions). Colored action icons with matching borders (Eye blue, Pencil green, RotateCcw amber, Trash2 red, UserPlus teal, FileEdit purple). Tab state via ?tab= query param (default: my-ideas).
│   ├── review.tsx         → Review dashboard with tabbed sections (Pending Assignment, My Assignments, Pending Decisions). Each tab gated by permission (idea.assign_officer, idea.classify, idea.dg_decision). UserPlus teal + Eye blue icon buttons.
│   ├── create.tsx         → Full form with file uploads, category select, team emails input, IP section (radio + conditional fields + required consent checkbox)
│   ├── edit.tsx           → Pre-populated form with existing IP data, document management, consent checkbox
│   ├── show.tsx           → Detail view with grouped documents, IP card (status badges, patent docs, consent info), Collaborations link, Change Requests link, collaboration request dialog. Author-only buttons (Pencil, RotateCcw) show disabled with contextual tooltip when status condition not met; permission-based buttons (Tags, Gavel, ArrowRight, etc.) hidden without permission
│   ├── invitation.tsx     → Invitation acceptance page (idea title, inviter, sign-in prompt)
│   ├── collaborations/
│   │   ├── index.tsx      → Pending collaboration request list with inline approve/reject forms (per-idea)
│   │   └── request/
│   │       ├── inbox.tsx  → Collaboration requests from users wanting to collaborate on MY ideas. Shows requester name, idea title, message, status badge, feedback, reviewer info. Paginated. Links to idea detail page.
│   │       └── outbox.tsx → Collaboration requests I sent. Shows idea title, author, message, status, feedback. Paginated. Quick link to browse open ideas when empty. FileEdit button shows disabled with tooltip when request not yet approved.
│   └── changes/
│       ├── index.tsx      → List of change requests with status badges
│       ├── create.tsx     → Select fields to edit, enter new values against originals
│       └── show.tsx       → Side-by-side diff view + approve/reject forms
└── audit/
    └── index.tsx          → Paginated structured audit log of all key actions
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
| Idea Submission | 50 | Idea creation — awarded to author + each invited contributor (via `IdeaService`) |

### Listener: AwardDailyLoginPoints

Registered in `AppServiceProvider::registerEventListeners()`:
```php
Event::listen(Login::class, AwardDailyLoginPoints::class);
```

On each login event, it:
1. Looks up the "Daily Login" `Point` by name
2. Checks `PointAwardService::hasBeenAwardedToday()` against `point_transactions`
3. If not yet awarded today, calls `award()` to credit the user

### Sidebar Navigation

The sidebar uses `<Sidebar collapsible="icon" variant="inset">` with `defaultOpen={true}` on `<SidebarProvider>`. Hover-to-expand is removed — the toggle button exclusively controls open/close. The sidebar has three groups:

| Group | Items | Access |
|-------|-------|--------|
| **General** | Dashboard, Ideas, Leaderboard | All authenticated users |
| **Review** | Pending Assignment, My Assignments, Pending Decisions, Points, Role Management, User Management, Audit Log | Gated by permission |
| **Collaboration** | Inbox, Sent Requests | All authenticated users |

**Review group** items:
- **Pending Assignment** — `idea.assign_officer` permission (DD)
- **My Assignments** — `idea.classify` permission (Officer)
- **Pending Decisions** — `idea.dg_decision` permission (DG)
- **Points** — `points.view` permission
- **Role Management** — `role.manage` permission
- **User Management** — `user.manage` permission
- **Audit Log** — `audit.view` permission

Each sidebar item links to the review dashboard with a `?tab=` query param to pre-select the relevant section. Items hidden from users without the corresponding permission.

### Search & Filter on Ideas Index

The ideas index page supports search and filtering within the current tab:

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Searches `title` and `description` columns |
| `status` | string | Comma-separated list of statuses to filter by |
| `category_id` | integer | Filter by idea category |
| `date_from` | date | Filter ideas created on or after this date |
| `date_to` | date | Filter ideas created on or before this date |

**Frontend**: The search bar has a `Search` icon with a clear button. The `SlidersHorizontal` button opens a `Popover` with status checkboxes (15 statuses), category `Select`, and date range inputs. All filters are debounced at 300ms and preserve state across tab switches via `preserveState` + `preserveScroll`. The empty state adapts its message when filters are active ("No ideas match your search or filters").

**Backend**: `IdeaService::applySearchAndFilters()` applies all filters to the query builder. All four query methods (`getAll`, `getMyIdeas`, `getOpenForCollaboration`, `getMyContributions`) accept optional `$search` and `$filters` params. `IdeaController@index` extracts query params, splits the comma-separated `status` into an array, and shares `categories`, `filters`, and `search` with the frontend.

### Wayfinder Integration

Points routes generate a barrel file at `resources/js/routes/points/index.ts`:
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

Ideas routes generate a nested barrel at `resources/js/routes/ideas/index.ts`:
```ts
import { ideas } from '@/routes';

// Usage:
ideas.index()                          // GET /ideas
ideas.review()                         // GET /ideas/review
ideas.show(slug)                       // GET /ideas/{slug}
ideas.create()                         // GET /ideas/create
ideas.store()                          // POST /ideas
ideas.collaborations.inbox()             // GET /ideas/collaborations/inbox
ideas.collaborations.outbox()            // GET /ideas/collaborations/outbox
ideas.collaborations.index(slug)         // GET /ideas/{slug}/collaborations
ideas.collaborations.store(slug)         // POST /ideas/{slug}/collaborations
ideas.collaborations.approve(slug, id)   // POST /ideas/{slug}/collaborations/{id}/approve
ideas.collaborations.reject(slug, id)    // POST /ideas/{slug}/collaborations/{id}/reject
ideas.changes.index(slug)              // GET /ideas/{slug}/changes
ideas.changes.create(slug)             // GET /ideas/{slug}/changes/create
ideas.changes.store(slug)              // POST /ideas/{slug}/changes
ideas.changes.show(slug, id)           // GET /ideas/{slug}/changes/{id}
ideas.changes.approve(slug, id)        // POST /ideas/{slug}/changes/{id}/approve
ideas.changes.reject(slug, id)         // POST /ideas/{slug}/changes/{id}/reject
```

Nested route groups (like `changes` under `ideas`) generate nested objects — use dot-chain syntax (`ideas.changes.index(slug)`), not bracket notation (`ideas['changes.index'](slug)`).

## Role & User Management Module

### Wayfinder Integration

Roles and users routes generate barrel files at `resources/js/routes/roles/index.ts` and `resources/js/routes/users/index.ts`:
```ts
import roles from '@/routes/roles';
import users from '@/routes/users';

// Roles:
roles.index()       // GET /roles
roles.create()      // GET /roles/create
roles.store()       // POST /roles
roles.edit(id)      // GET /roles/{id}/edit
roles.update(id)    // PUT /roles/{id}
roles.destroy(id)   // DELETE /roles/{id}

// Users:
users.index()       // GET /users
users.create()      // GET /users/create
users.store()       // POST /users
users.edit(id)      // GET /users/{id}/edit
users.update(id)    // PUT /users/{id}
users.destroy(id)   // DELETE /users/{id}
```

API counterparts use standard `apiResource` at `api/roles` and `api/users`.

### Web Controllers

| Controller | Web Routes | Permissions |
|---|---|---|
| `Roles\RoleController` | `roles.*` (resource) | `role.create`, `role.edit`, `role.delete` |
| `Users\UserController` | `users.*` (resource) | `user.create`, `user.edit`, `user.delete` |

### Frontend Pages

| Page | File | Description |
|------|------|-------------|
| Role List | `roles/index.tsx` | Table with Shield icon, user/permission counts, Protected badge, Pencil green + Trash2 red icon buttons |
| Create Role | `roles/create.tsx` | Form with permission checkboxes grouped by prefix |
| Edit Role | `roles/edit.tsx` | Same form pre-filled; name disabled for protected roles |
| User List | `users/index.tsx` | Table with role badge, staff indicator, Pencil green + Trash2 red icon buttons |
| Create User | `users/create.tsx` | Full form with cascade selects for region→directorate→department |
| Edit User | `users/edit.tsx` | Same form pre-filled with existing data |

### Services

**`RoleService`** — `app/Services/Roles/RoleService.php`
- `getAll()` — List all roles with user count, permission count, and protected flag (admin/user are protected)
- `getFormPermissions()` — All permissions ordered by name (for create/edit form checkboxes)
- `create(string $name, array $permissions)` — Create role with optional permission sync
- `getForEdit(Role $role)` — Load role with permissions, returns data including `is_protected`, `permission_names`
- `update(Role $role, string $name, array $permissions)` — Update name (skipped for protected roles) and sync permissions
- `isProtected(Role $role): bool` — Returns true for `admin` and `user` roles

**`UserService`** — `app/Services/Users/UserService.php`
- `getAll()` — List all users with role and staff indicator
- `getFormData()` — Returns roles, regions (with directorates/departments), and contract types for cascade selects
- `create(array $data)` — Creates user with auto-generated 16-char password if blank, assigns role, optionally creates staff record; returns `['user', 'generated_password']`
- `getForEdit(User $user)` — Load user with roles and staff, returns structured data with nested staff fields
- `update(User $user, array $data)` — Updates user fields, password if provided, syncs role, creates/updates/deletes staff record

---

## Audit Trail Module

### Overview

A structured audit trail that logs all key actions across the application. Logs are stored in the database (not Laravel log files) for easy querying, pagination, and frontend display.

### Architecture

```
Audit/
├── Models
│   └── AuditLog          → Action/actor/target/metadata log entry
└── Services
    └── AuditService      → Logging interface used across all services
```

### Model

**`AuditLog`** — `app/Models/AuditLog.php`
| Field | Type | Description |
|-------|------|-------------|
| action | string | Action name (snake_case, e.g. `idea_created`, `point_awarded`) |
| actor_id | FK→users (nullable) | User who performed the action |
| actor_type | string | User type (e.g. `user`, `system`) |
| target_type | string | Model class of the affected entity |
| target_id | integer | ID of the affected entity |
| description | text (nullable) | Human-readable summary |
| metadata | json (nullable) | Arbitrary data payload |
| ip_address | string (nullable) | Request IP address |

### Logged Actions

| Action | Triggered By |
|--------|-------------|
| `idea_created` | Idea creation |
| `idea_updated` | Idea update |
| `idea_deleted` | Idea soft delete |
| `change_requested` | Change request submitted |
| `change_approved` | Change request approved |
| `change_rejected` | Change request rejected |
| `collaboration_requested` | Collaboration request submitted |
| `collaboration_approved` | Collaboration request approved |
| `collaboration_rejected` | Collaboration request rejected |
| `officer_assigned` | DD assigned RI&KM Officer to idea |
| `idea_classified` | Idea classified (Innovation/Research/Project/Outside Mandate) |
| `revision_requested` | Officer requested author revision |
| `idea_resubmitted` | Author resubmitted after revision |
| `dg_decision_made` | DG decision recorded (approved/deferred/declined) |
| `idea_closed` | Idea closed (outside mandate, expired, or completed) |
| `point_awarded` | Point award |
| `team_member_added` | Invitation auto-accepted via onboarding |
| `team_member_invited` | Invitation email sent to non-user |

### Service

**`AuditService`** — `app/Services/AuditService.php`
- `log(string $action, ...)` — Create an audit log entry
- Called from services (IdeaService, ChangeRequestService, PointAwardService) and controllers (IdeaController)

### Access

- Web: `GET /audit` → `AuditController@index` (permission: `audit.view`)
- API: `GET api/audit` → `Api\Audit\AuditController@index` (auth:sanctum)
- Accessible to roles: `admin` and `board`
- Viewable at `resources/js/pages/audit/index.tsx` — paginated table of all entries

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

### Why Features Are in Subfolders Instead of Flat?

All feature modules follow a consistent folder structure:
```
{Feature}/
├── Services/
│   └── {Feature}Service.php
├── Http/
│   ├── Controllers/
│   │   ├── {Feature}Controller.php        (web)
│   │   └── Api/{Feature}/
│   │       └── {Feature}Controller.php    (API)
│   └── Requests/{Feature}/
│       └── Store{Feature}Request.php
```
This keeps each feature self-contained, avoids the `admin` word, and mirrors the route prefix structure. Example: points → `Points/`, ideas → `Ideas/`, audit → `Audit/`.

### Why Comma-Separated `team_emails` Instead of Array?

- HTML forms send comma-separated values as a single string
- Laravel's `array` validation rule treats each comma-separated item as a single invalid email
- Server-side split and trim is more reliable than JS pre-processing
- Simplifies the form request (validates as `nullable|string`) and defers per-email validation to `IdeaService`

### Why Idea Invitations Use Email + Token Instead of In-App Notification?

- Invited users may not have accounts yet — email is the only communication channel
- Token-based acceptance works without a pre-existing account
- After signup, `OnboardingService::processPendingInvitations()` auto-accepts by matching email
- Existing users get the `contributor` role + points immediately at submission time

### Why Change Requests Use JSON Diffs Instead of Versioned Snapshots?

- Each change request stores only the delta (field, old_value, new_value)
- Approving a change request applies each field update to the idea record
- Multiple edits can be batched in one request (like a PR)
- Full history is preserved even after approval — no data is lost
- Frontend renders a side-by-side diff (old strikethrough red / new green) for review

### Why Audit Logs in the Database Instead of Laravel Log Files?

- Structured data enables filtering, pagination, and frontend display
- Can be queried and exported via API for compliance
- `AuditLog` model stores action, actor, target, metadata, and IP address
- `AuditService` provides a clean interface for logging across all services
- Viewable at `/audit` for authorized roles (admin, board)

### Why Collaboration Requests Award No Points on Approval?

- Points should reflect actual content contributions, not just joining an idea
- The `collaborator` role already grants `propose_changes` permission — the ability to contribute is the reward
- Future feature: award points when a collaborator's change request is approved

### Why Collaborator Role Includes `propose_changes`?

- Symmetry with contributor: both contributor and collaborator can propose changes to the idea
- Previously collaborator only had `view` — this limited their ability to contribute
- The author retains exclusive `approve_changes` and `manage_contributors` permissions

### Why Consent Is Required for All Users Regardless of IP Status?

- When IP is not protected: user consents to KeNHA initiating IP protection
- When IP is already protected: user consents to KeNHA reviewing and processing the idea including its IP
- Two-tier consent text adapts based on the user's IP protection selection
- `required|accepted` validation ensures the checkbox cannot be skipped
- Consent timestamp (`consent_given_at`) is recorded for audit purposes

### Why Separate `idea_ip_rights` and `idea_ip_documents` Tables?

- One-to-one IP right record keeps IP metadata separate from the idea itself
- Documents are append-only (no `updated_at`) following the same pattern as `idea_documents`
- Files stored under `private/ip-documents/{idea_id}/` on the `local` disk
- Switching from IP protected to unprotected deletes existing patent documents
- The `status` field (pending → in_review → registered/rejected) enables a future IP review workflow

### Why Index Page Has Three Tabs Instead of Flat List?

- "All Ideas" removed to focus on user-relevant views
- **My Ideas** (default) — ideas the user authored
- **Open for Collaboration** — ideas seeking collaborators, excluding user's own
- **My Contributions** — ideas where user was invited as contributor
- Tab state stored as `?tab=` query param for shareable/bookmarkable URLs
- `select('ideas.*')` must always precede `selectSub()` to prevent subquery overriding all columns

### Why Dedicated Review Dashboard Instead of an Index Tab?

- **Permission-based structure** — Each review section maps to a specific permission (`idea.assign_officer`, `idea.classify`, `idea.dg_decision`). Users with multiple permissions see all relevant sections in one place without mixing unrelated content
- **Ideas flow between views** — A submitted idea appears in "Pending Assignment", moves to "My Assignments" when the DD assigns an officer, then to "Pending Decisions" when sent to DG. This natural pipeline prevents duplication
- **Sidebar shortcut per section** — Each section gets its own sidebar nav item with a `?tab=` query param for direct access, while the dashboard page keeps all sections discoverable
- **Gated by `idea.review`** — The sidebar items and dashboard respect individual permissions so each user only sees what they can act on

### Why Collaboration Inbox/Outbox Are Separate Pages Instead of Tabs on the Index?

- The ideas index is focused on managing ideas (browsing, filtering, creating)
- Collaboration request management is a distinct workflow — reviewing incoming requests and tracking sent ones
- The inbox/outbox model is familiar (email-like) and works better as standalone pages with their own pagination and filtering
- Keeps the ideas index clean and focused on its core purpose

### Why Action Buttons Use Colored Icons + Matching Borders?

All action icon buttons follow a consistent visual convention across the app:

- **`variant="outline" size="icon"`** — every action button uses the outline variant with matching colored border at `/30` opacity
- **Trash2 (red)** — destructive actions (delete user, role, point action, idea)
- **Eye (blue)** — view/review actions (view idea, review page)
- **Pencil (green)** — edit actions (edit idea, role, user, point action)
- **RotateCcw (amber)** — resubmit/revision actions (resubmit for review, request revision)
- **Power (amber)** — toggle actions (activate/deactivate point action)
- **FileEdit (purple)** — propose changes (change requests)
- **UserPlus / UserCheck (teal)** — collaboration actions (request/manage collaboration)
- **Gavel (amber)** — DG decision actions (record decision)
- **ArrowRight (sky)** — advance status actions (progress idea through pipeline)
- **Disabled buttons** — rendered with same icon color + border but dimmed via `opacity-50`; wrapped in `<span tabIndex={0}>` with a Tooltip explaining why the action is unavailable
- **Permission-based buttons** — remain completely hidden when the user lacks the permission
- Consistent with modern UI patterns and provides instant visual cues for each action type
