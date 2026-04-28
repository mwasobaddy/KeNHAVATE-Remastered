# KeNHAVATE Platform Documentation

---

## 1. Login & Authentication Module

### Overview
The authentication system uses **Laravel Fortify** as the headless backend, with **Laravel Socialite** for Google OAuth, and a custom **OTP (One-Time Password)** system for email verification. The platform supports dual email system: `email` (personal) and `work_email` (@kenha.co.ke domain).

---

### Architecture

#### Backend Components

**Config:**
- `config/fortify.php` - Fortify features: reset passwords, email verification, profile updates, 2FA
- `config/auth.php` - Guards, providers, passwords configuration

**Service Provider:**
- `app/Providers/FortifyServiceProvider.php`
  - Registers custom actions: `CreateNewUser`, `UpdateUserProfileInformation`, `UpdateUserPasswords`, `ResetUserPasswords`
  - Configures Inertia views for login, password confirmation, 2FA challenge, email verification
  - Rate limiting: 5 attempts/minute for login, 2FA

**Actions (Fortify):**
- `app/Actions/Fortify/CreateNewUser.php`
  - Validates email and password
  - Creates user with `onboarding_completed = false`
  - Auto-assigns role: `staff` for @kenha.co.ke emails, `user` for others

- `app/Actions/Fortify/UpdateUserProfileInformation.php`
  - Validates and updates name and email
  - Handles email verification re-sending for verified users

**Controllers:**
- `app/Http/Controllers/Auth/SocialiteController.php`
  - `redirectToGoogle()` - Redirects to Google OAuth
  - `handleGoogleCallback()` - JIT (Just-In-Time) provisioning:
    - Links Google account to existing user by email
    - Creates new user with Google data (name, avatar, provider_id)
    - Auto-verifies email (Google verified)
    - Assigns role based on email domain

- `app/Http/Controllers/Auth/WorkEmailVerificationController.php`
  - `show()` - Shows work email verification page
  - `verify()` - Verifies work email via signed URL (accessed from email link)
  - `resend()` - Resends work email verification notification

- `app/Http/Controllers/Auth/OtpController.php`
  - `showVerifyForm()` - Shows OTP input form
  - `send()` - Generates and sends OTP via email
  - `verify()` - Verifies OTP and logs user in
  - `resend()` - Resends OTP if not expired

**Services:**
- `app/Services/Auth/OtpService.php`
  - `sendOtp()` - Finds/creates user, generates 6-digit OTP, sends via email
  - `verifyOtp()` - Validates OTP, marks email as verified
  - `resendOtp()` - Resends existing valid OTP or generates new one
  - `checkGoogleOAuth()` - Checks if user is Google OAuth user (skips OTP)
  - `findOrCreateUser()` - Creates user based on email type (KenHA vs external)
  - `markEmailAsVerified()` - Marks appropriate email field as verified

**Notifications:**
- `app/Notifications/VerifyWorkEmail.php`
  - Sent when user needs to verify their work email
  - Contains signed verification URL

- `app/Mail/Auth/SendOtpMail.php`
  - Mailable for sending OTP via email

**Models:**
- `app/Models/User.php`
  - Fields: `first_name`, `other_names`, `mobile_number`, `gender`, `email`, `work_email`, `password`, `provider`, `provider_id`, `avatar`, `onboarding_completed`, `email_verified_at`, `work_email_verified_at`
  - Relationships: `department()`, `directorate()`, `region()`, `likes()`, `notifications()`
  - Methods: `getFullName()`, `getLoginEmail()`, `getEmailForVerification()`, `usesGoogleOAuth()`, `hasVerifiedWorkEmail()`, `needsOnboarding()`, `isStaffApplicant()`
  - Uses `HasRoles` (Spatie Permission) for role management

---

### Frontend Components

#### Pages

**Login (`resources/js/pages/auth/login.tsx`)**
- Email input with OTP sending
- Google OAuth button (`/auth/google/redirect`)
- Shows success status after OTP sent

**Verify Work Email (`resources/js/pages/auth/verify-work-email.tsx`)**
- Displays work email being verified
- Resend button with 60-second cooldown countdown
- Shows success message when link is sent

**OTP Verification (`resources/js/pages/auth/verify-otp.tsx`)**
- 6-digit OTP input
- Auto-submits when all digits entered
- Resend functionality

**Onboarding (`resources/js/pages/onboarding/`)**
- Step 1: Complete profile (department, mobile, gender)
- Step 2: Accept terms and conditions
- Step 3: Final confirmation

#### Routes
- `routes/web.php` - Defines auth routes, Google OAuth, OTP, work email verification, onboarding

---

### Authentication Flow

#### Standard Email Login:
1. User enters email on login page
2. System sends OTP via `OtpService::sendOtp()`
3. User receives 6-digit code via email
4. User enters OTP on verification page
5. System verifies via `OtpService::verifyOtp()`
6. User logged in, redirected to dashboard

#### Google OAuth Login:
1. User clicks "Continue with Google"
2. Redirected to Google for authentication
3. Google callback handled by `SocialiteController::handleGoogleCallback()`
4. JIT provisioning:
   - If existing user with Google provider_id → log them in
   - If email exists but no Google → link accounts
   - New user → create with Google data, auto-verify email
5. Role assigned based on email domain (@kenha.co.ke = staff)
6. Redirected to dashboard/onboarding

#### Work Email Verification:
1. User registers with @kenha.co.ke email
2. `work_email_verified_at` is null initially
3. `VerifyWorkEmail` notification sent with signed URL
4. User clicks link in email
5. `WorkEmailVerificationController::verify()` marks as verified
6. User logged in, redirected to dashboard

---

### Security Features

- **OTP Rate Limiting**: 5 attempts/minute per email+IP
- **2FA Support**: Fortify's TOTP with QR code, recovery codes, confirmation
- **Google OAuth**: Secure JIT provisioning with account linking
- **Signed URLs**: Work email verification uses signed URLs (expires)
- **OTP Expiration**: 30-minute expiry, single-use
- **Role Assignment**: Automatic based on email domain (@kenha.co.ke = staff)
- **Onboarding Guard**: Users with `onboarding_completed = false` redirected to onboarding

---

### Key Workflows

#### First-Time Staff User (@kenha.co.ke email):
1. Register with work email → auto-assigned `staff` role
2. Work email verification sent (signed URL)
3. Click email link → verified → redirected to onboarding
4. Complete onboarding steps (profile, terms)
5. Access dashboard

#### External User (non-@kenha.co.ke email):
1. Register with personal email → auto-assigned `user` role
2. Email auto-verified by OTP
3. Complete onboarding
4. Access dashboard

#### Google User:
1. Click "Continue with Google"
2. JIT provisioning creates account
3. Email auto-verified (Google verified)
4. Complete onboarding (if first time)
5. Access dashboard

---

## 2. Idea Module

### Overview
The Idea module is the core feature of the KeNHAVATE platform, enabling users to submit, manage, and collaborate on innovative ideas. It supports team collaboration, real-time interactions (likes/comments), and a multi-stage review process.

---

### Architecture

#### Models

- **Idea** (`app/Models/Idea.php`)
  - Core model with fields: `idea_title`, `slug`, `abstract`, `problem_statement`, `proposed_solution`, `cost_benefit_analysis`, `declaration_of_interests`, `status`, `collaboration_enabled`, `team_effort`, `comments_enabled`
  - Supports polymorphic likes via `likes()` relationship
  - Has relationships: `thematicArea()`, `user()`, `comments()`, `teamMembers()`, `smeReviews()`, `ddReviews()`
  - Auto-generates unique slug from title on creation

- **Comment** (`app/Models/Comment.php`)
  - Nested comments support via `parent_id` (self-referential relationship)
  - Fields: `idea_id`, `user_id`, `parent_id`, `content`, `is_internal`
  - Relationships: `idea()`, `user()`, `parent()`, `replies()`, `likes()`
  - Broadcasts real-time events on creation/deletion

- **Like** (`app/Models/Like.php`)
  - Polymorphic model working with Ideas and Comments
  - Fields: `user_id`, `likeable_id`, `likeable_type`
  - Broadcasts `like.added` and `like.removed` events
  - Notifies content owner (except when liking own content)

- **TeamMember** (`app/Models/TeamMember.php`)
  - Links users to ideas with specific roles and permissions
  - Fields: `idea_id`, `user_id`, `name`, `email`, `role`, `permissions`
  - Permissions: `view` or `edit`

#### Services

- **IdeaService** (`app/Services/IdeaService.php`)
  - `getPaginatedForUser()` - Paginated ideas for a user with likes/comments counts
  - `getForTeamMember()` - Ideas where user is a team member
  - `getPublicIndex()` - Public ideas with `collaboration_enabled=true`
  - `create()` - Creates idea with team members in a transaction
  - `update()` - Updates idea and syncs team members
  - `delete()` - Deletes idea and attachment

#### Controllers

- **IdeaController** (`app/Http/Controllers/IdeaController.php`)
  - `index()` - Lists ideas with tab filtering (mine/team/public)
  - `create()` - Shows idea creation form with thematic areas
  - `store()` - Creates new idea (validates via `StoreIdeaRequest`)
  - `show()` - Displays single idea with team members
  - `edit()` - Shows edit form for idea
  - `update()` - Updates idea (validates via `UpdateIdeaRequest`)
  - `destroy()` - Deletes idea

- **CommentController** (`app/Http/Controllers/CommentController.php`)
  - `index()` - Shows comments page for an idea
  - `store()` - Creates new comment/reply, broadcasts events, sends notifications

- **LikeController** (`app/Http/Controllers/LikeController.php`)
  - `store()` - Toggles like/unlike on ideas or comments (returns JSON)

- **NotificationController** (`app/Http/Controllers/NotificationController.php`)
  - `index()` - Lists user's notifications
  - `markAsRead()` - Marks a notification as read
  - `markAllAsRead()` - Marks all notifications as read

#### Requests (Validation)

- **StoreIdeaRequest** (`app/Http/Requests/Idea/StoreIdeaRequest.php`)
  - Validates: `idea_title`, `thematic_area_id`, `abstract`, `problem_statement`, etc.
  - Custom validation: Ensures user adds themselves as team member with correct name/permission
  - Validates team_members array and individual member data

- **UpdateIdeaRequest** (`app/Http/Requests/Idea/UpdateIdeaRequest.php`)
  - Similar to store, but with `sometimes` for partial updates
  - Same team member validation logic

- **StoreCommentRequest** (`app/Http/Requests/StoreCommentRequest.php`)
  - Validates: `idea_id`, `parent_id` (nullable), `content`, `is_internal`

- **StoreLikeRequest** (`app/Http/Requests/StoreLikeRequest.php`)
  - Validates: `likeable_type` (idea/comment), `likeable_id`

#### Notifications

- **IdeaLiked** (`app/Notifications/IdeaLiked.php`)
  - Sent when someone likes an idea (except owner liking own idea)
  - Broadcast via `database` and `broadcast` channels
  - Payload: `idea_id`, `idea_slug`, `user_name`, `message`

- **CommentPosted** (`app/Notifications/CommentPosted.php`)
  - Sent when someone comments on an idea or replys to a comment
  - Notifies idea owner and parent comment owner (if reply)

- **CommentLiked** (`app/Notifications/CommentLiked.php`)
  - Sent when someone likes a comment (except owner)

---

### Frontend Components

#### Pages

**Idea Index (`resources/js/pages/idea/index.tsx`)**
- **Tabs**: Mine (user's ideas), Team (ideas where user is team member), Public (collaboration-enabled ideas)
- **Features**:
  - Like button with heart icon (toggles without page refresh via axios)
  - Comment button with counter
  - Real-time like count updates
  - Tab-specific idea counts

**Idea Create (`resources/js/pages/idea/create.tsx`)**
- **Features**:
  - Auto-adds current user as "Author" with "edit" permission when "team effort" is checked
  - Validates team member details (name must match user's full name)
  - Prevents removing current user from team
  - Drag-and-drop file attachment
  - Real-time validation errors per team member

**Idea Edit (`resources/js/pages/idea/edit.tsx`)**
- Similar to create with pre-filled data
- Same auto-add and validation logic for team members

**Idea Show (`resources/js/pages/idea/show.tsx`)**
- Displays full idea details
- Shows team members with roles/permissions
- Comment section with real-time updates

**Comments Show (`resources/js/pages/idea/comments/show.tsx`)**
- Lists comments and replies for an idea
- Supports nested replies
- Real-time comment/reply additions

**Notifications Index (`resources/js/pages/notifications/index.tsx`)**
- Lists all notifications for the user
- "Mark as read" functionality
- Filters by notification type (idea_liked, comment_posted, etc.)

---

### Real-Time Features (Laravel Reverb)

#### Configuration
- **Package**: `laravel/reverb` (v1.10.0)
- **Config**: `config/reverb.php`
- **Broadcasting**: Configured via `config/broadcasting.php`
- **Channels**:
  - `idea.{slug}` - Private channel for idea-related updates
  - `comment.{id}` - Private channel for comment-related updates

#### Events Broadcasted
1. **Like Events**:
   - `like.added` - When someone likes content
   - Payload: `type`, `likeable_id`, `likeable_type`, `user_id`, `user_name`
   - `like.removed` - When someone unlikes content

2. **Comment Events**:
   - `comment.added` - When a comment/reply is posted
   - `comment.removed` - When a comment is deleted

#### Notifications (App-Based)
- Stored in `notifications` table (not sent via email)
- Broadcast via Reverb for real-time updates
- Types: `idea_liked`, `comment_posted`, `comment_liked`

---

### Database Schema

#### Tables

**`ideas`**
- `id`, `idea_title`, `slug`, `thematic_area_id`, `abstract`, `problem_statement`, `proposed_solution`, `cost_benefit_analysis`, `declaration_of_interests`
- `original_idea_disclaimer`, `collaboration_enabled`, `team_effort`, `comments_enabled`
- `current_revision_number`, `collaboration_deadline`, `status`
- `attachment` (binary), `attachment_filename`, `attachment_mime`, `attachment_size`
- `path`, `user_id`, timestamps, `deleted_at`

**`comments`**
- `id`, `idea_id`, `user_id`, `parent_id` (self-referential), `content`, `is_internal`
- timestamps, `deleted_at`

**`likes` (Polymorphic)**
- `id`, `user_id`, `likeable_id`, `likeable_type`, timestamps
- Unique constraint: `[user_id, likeable_id, likeable_type]`

**`team_members`**
- `id`, `idea_id`, `user_id`, `name`, `email`, `role`, `permissions`
- timestamps

**`notifications`**
- `id` (UUID), `type`, `notifiable_type`, `notifiable_id`, `data` (JSON), `read_at`
- timestamps

**`users`**
- `id`, `first_name`, `other_names`, `mobile_number`, `gender`
- `email`, `work_email`, `password`
- `provider`, `provider_id`, `avatar`
- `department_id`, `employment_type`
- `onboarding_completed`, `email_verified_at`, `work_email_verified_at`
- `remember_token`, timestamps

---

### Key Workflows

#### Submitting an Idea
1. User clicks "Create Idea"
2. Fills in title, thematic area, abstract, problem statement, solution, cost-benefit analysis
3. If team effort: Checks "This is a team effort" → auto-adds user as "Author" with "edit" permission
4. Adds additional team members (validates email/name/permission)
5. Uploads attachment (PDF, max 10MB)
6. Submits → validated by `StoreIdeaRequest` → created via `IdeaService`

#### Liking Content
1. User clicks heart icon on idea in index page
2. Frontend sends axios POST to `/likes` with `likeable_type` and `likeable_id`
3. Backend toggles like (creates or deletes `Like` record)
4. Broadcasts `like.added` or `like.removed` via Reverb
5. Notifies content owner (if not own content)
6. UI updates like count without page refresh

#### Commenting
1. User clicks comment icon on idea index
2. Redirected to `/idea/{slug}/comments`
3. Types comment and submits
4. Backend creates `Comment` record
5. Broadcasts `comment.added` event
6. Notifies idea owner and parent comment owner (if reply)
7. Real-time update via Reverb

---

### Security & Validation

#### Team Member Validation
- User must add themselves as a team member when "team effort" is checked
- Name must match user's full name when using their email
- User cannot have "view" permission on their own idea (must be "edit")
- Prevents removing current user from team members list

#### Idea Visibility
- **Mine tab**: Ideas where `user_id = auth()->id()`
- **Team tab**: Ideas where user is a team member
- **Public tab**: Ideas with `collaboration_enabled = true` (regardless of status)

#### Permissions
- Team members with "edit" permission can edit the idea
- Team members with "view" permission can only view
- Idea owner always has full access

#### Authentication Security
- OTP Rate Limiting: 5 attempts/minute per email+IP
- 2FA Support: Fortify's TOTP with QR code, recovery codes
- Google OAuth: Secure JIT provisioning with account linking
- Signed URLs: Work email verification uses signed URLs (expires)
- OTP Expiration: 30-minute expiry, single-use

---

### Testing

#### Test Coverage
- Idea creation with team members
- Idea update with team member sync
- Like/unlike toggle
- Comment creation with notifications
- Real-time event broadcasting
- Tab filtering (mine/team/public)
- OTP sending and verification
- Google OAuth JIT provisioning
- Work email verification

#### Running Tests
```bash
php artisan test --compact --filter=Idea
php artisan test --compact --filter=Auth
```

---

### Deployment Notes

#### Environment Variables (.env)
```bash
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=your_app_id
REVERB_APP_KEY=your_app_key
REVERB_APP_SECRET=your_app_secret
REVERB_HOST=localhost
REVERB_PORT=8080
REVERB_SCHEME=http
```

#### Starting Reverb Server
```bash
php artisan reverb:start
```

#### Production Considerations
- Use SSL/TLS in production (`REVERB_SCHEME=https`, `REVERB_PORT=443`)
- Configure Redis for Reverb scaling if needed
- Run `npm run build` for frontend assets
- Ensure notifications table is migrated
- Set `BROADCAST_CONNECTION=reverb` in production
- Configure proper email provider for OTP and work email verification

---

### File Structure

```
app/
├── Http/Controllers/
│   ├── Auth/
│   │   ├── SocialiteController.php
│   │   ├── WorkEmailVerificationController.php
│   │   └── OtpController.php
│   ├── IdeaController.php
│   ├── CommentController.php
│   ├── LikeController.php
│   └── NotificationController.php
├── Http/Requests/
│   ├── Auth/
│   │   ├── SendOtpRequest.php
│   │   └── VerifyOtpRequest.php
│   └── Idea/
│       ├── StoreIdeaRequest.php
│       └── UpdateIdeaRequest.php
├── Actions/Fortify/
│   ├── CreateNewUser.php
│   ├── UpdateUserProfileInformation.php
│   ├── UpdateUserPasswords.php
│   └── ResetUserPasswords.php
├── Services/
│   ├── Auth/
│   │   └── OtpService.php
│   └── IdeaService.php
├── Models/
│   ├── User.php
│   ├── Idea.php
│   ├── Comment.php
│   ├── Like.php
│   └── TeamMember.php
└── Notifications/
    ├── VerifyWorkEmail.php
    ├── IdeaLiked.php
    ├── CommentPosted.php
    └── CommentLiked.php

resources/js/pages/
├── auth/
│   ├── login.tsx
│   ├── verify-otp.tsx
│   └── verify-work-email.tsx
├── onboarding/
│   ├── step1.tsx
│   ├── step2.tsx
│   └── step3.tsx
├── idea/
│   ├── index.tsx
│   ├── create.tsx
│   ├── edit.tsx
│   ├── show.tsx
│   └── comments/
│       └── show.tsx
└── notifications/
    └── index.tsx

routes/
├── web.php
├── idea.php
└── settings.php

config/
├── fortify.php
├── broadcasting.php
└── reverb.php
```

---

### Recent Updates (April 2026)

#### Authentication Module
1. **OTP-Based Login System**
   - Custom OTP service with 6-digit codes
   - Email verification via OTP (not Laravel's default)
   - Google OAuth with JIT provisioning
   - Work email verification with signed URLs

2. **Role-Based Access Control**
   - Auto-assigns role based on email domain
   - @kenha.co.ke emails → `staff` role
   - Other emails → `user` role
   - Uses Spatie Laravel Permission

3. **Onboarding Flow**
   - Three-step onboarding process
   - Profile completion, terms acceptance
   - Guards routes for incomplete onboarding

#### Idea Module
1. **Hardened Idea Submission**
   - Validated team effort requires at least one member
   - Auto-added current user as "Author" with "edit" permission
   - Prevented self-notifications for likes/comments

2. **Real-Time Features**
   - Installed Laravel Reverb for WebSocket connections
   - Added polymorphic likes system (works with ideas, comments)
   - Created notification classes for real-time alerts
   - Added like/comment icons with counters on idea index

3. **Frontend Improvements**
   - Like toggle without page refresh (axios + Inertia reload)
   - Proper route generation using Wayfinder
   - ESLint/TypeScript fixes for cleaner code

4. **Documentation**
   - Created comprehensive module documentation
   - Added inline code comments for complex logic
