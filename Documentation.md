# KeNHAVATE System Documentation

## Overview

KeNHAVATE is a Laravel-based innovation management platform that enables employees to submit, collaborate on, and review ideas within the Kenya National Highways Authority (KeNHA). The system implements a multi-stage review workflow involving Deputy Directors and Subject Matter Experts (SMEs).

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Models](#models)
3. [Controllers](#controllers)
4. [Services](#services)
5. [Notifications](#notifications)
6. [Frontend Pages](#frontend-pages)
7. [Authentication System](#authentication-system)
8. [Review Workflows](#review-workflows)
9. [Enhancements & Gaps](#enhancements--gaps)
10. [Unused Code](#unused-code)

---

## Architecture Overview

### Technology Stack

- **Backend**: Laravel 13 + Inertia.js v3
- **Frontend**: React 19 + TypeScript
- **Styling**: TailwindCSS v4
- **Authentication**: Laravel Fortify + OTP-based login
- **Authorization**: Spatie Laravel Permission
- **Database**: MySQL (assumed from conventions)

### Core Modules

| Module | Description |
|--------|-------------|
| Ideas | Core innovation submission and management |
| DD Review | Deputy Director review workflow |
| SME Review | Subject Matter Expert evaluation |
| Collaboration | Multi-user idea collaboration |
| Team Members | Internal team invitations |
| Comments & Likes | Social engagement features |
| Onboarding | Multi-step user registration |
| Settings | Profile and security management |

---

## Models

### User (`app/Models/User.php`)

**Purpose**: Main user model with authentication, roles, and organizational hierarchy

**Key Features**:
- Spatie `HasRoles` trait for RBAC
- TwoFactorAuthenticatable for 2FA
- Work email verification system
- Onboarding flow tracking
- Department-Directorate-Region hierarchy via `hasOneThrough`
- OAuth provider tracking (Google)

**Relationships**:
- `department()` → BelongsTo Department
- `directorate()` → HasOneThrough Directorate
- `region()` → HasOneThrough Region
- `likes()` → MorphMany Like

**Key Methods**:
- `getFullName()` - Returns first_name + other_names
- `getEmailForPasswordReset()` - Smart email selection for password resets
- `needsOnboarding()` - Checks onboarding status
- `isStaffApplicant()` - Identifies staff roles needing onboarding

---

### Idea (`app/Models/Idea.php`)

**Purpose**: Core innovation idea model

**Fields**:
- `idea_title`, `slug`, `thematic_area_id`
- `abstract`, `problem_statement`, `proposed_solution`
- `cost_benefit_analysis`
- `declaration_of_interests`
- `original_idea_disclaimer`
- `collaboration_enabled`, `team_effort`, `comments_enabled`
- `collaboration_deadline`
- `status` (draft → stage 1 review → stage 2 review → dd_approved/rejected)
- `attachment_path`
- `current_revision_number`

**Relationships**:
- `user()` → BelongsTo User
- `thematicArea()` → BelongsTo ThematicArea
- `comments()` → HasMany Comment
- `smeReviews()` → HasMany SmeReview
- `ddReview()` → HasOne DdReview
- `teamMembers()` → HasMany TeamMember
- `collaborators()` → HasMany Collaborator
- `collaborationRequests()` → HasMany CollaborationRequest
- `suggestions()` → HasMany Suggestion
- `likes()` → MorphMany Like

---

### DdReview (`app/Models/DdReview.php`)

**Purpose**: Deputy Director review for ideas

**Fields**:
- `idea_id`, `reviewer_id`
- `status` (pending, approved, rejected, revise)
- `review_comments`
- `decision` (approve, reject)
- `implementation_timeline`
- `budget_implications`
- `is_unlocked` - Whether review is active
- `review_deadline`
- `feedback`, `feedback_sent_at`

**Status Flow**: Idea status synced with DD review decisions

---

### SmeReview (`app/Models/SmeReview.php`)

**Purpose**: Subject Matter Expert evaluation

**Fields**:
- `idea_id`, `reviewer_id`
- `status` (pending, approved, rejected, revise)
- `review_comments`
- `recommendation` (approve, reject, revise)
- `rating` (1-5 scale)

---

### Comment (`app/Models/Comment.php`)

**Purpose**: Nested comments on ideas

**Fields**:
- `idea_id`, `user_id`, `parent_id`
- `content`
- `is_internal` - Private comments between collaborators

**Key Features**:
- Recursive relationship (`parent` / `replies`)
- Broadcasting via Laravel Echo on private channel `idea.{slug}`
- Auto-notification on creation to idea owner and parent comment owner

---

### Like (`app/Like.php`)

**Purpose**: Polymorphic likes for ideas and comments

**Fields**:
- `user_id`, `likeable_id`, `likeable_type`

**Key Features**:
- Polymorphic relationship (`likeable()`)
- Broadcasting like/unlike events
- Auto-notification when liked

---

### TeamMember (`app/Models/TeamMember.php`)

**Purpose**: Internal team collaboration (email-based invitations)

**Fields**:
- `idea_id`, `user_id`, `invitation_id`
- `name`, `email`, `role`
- `permissions` (view, edit)

**Permissions**:
- `view` - Can view the idea
- `edit` - Can edit the idea

---

### Collaborator (`app/Models/Collaborator.php`)

**Purpose**: External collaboration requests

**Fields**:
- `idea_id`, `user_id`
- `name`, `email`, `role`
- `permissions`

---

### CollaborationRequest (`app/Models/CollaborationRequest.php`)

**Purpose**: Pending collaboration requests

**Fields**:
- `user_id`, `idea_id`
- `status` (pending, approved, declined)
- `message`

---

### Suggestion (`app/Models/Suggestion.php`)

**Purpose**: Improvement suggestions on ideas (from collaborators)

**Fields**:
- `idea_id`, `user_id`
- `section` (abstract, problem_statement, proposed_solution, cost_benefit, general, other)
- `content`
- `status` (pending, accepted, rejected)

---

### ThematicArea (`app/Models/ThematicArea.php`)

**Purpose**: Categories for ideas

**Fields**:
- `name`, `slug`, `description`
- `is_active`, `sort_order`

---

### Organization Models

| Model | Purpose |
|-------|---------|
| `Department` | Organizational department |
| `Directorate` | Directorate within region |
| `Region` | Geographic region |

**Hierarchy**: Region → Directorate → Department → User

---

### OTP (`app/Models/Otp.php`)

**Purpose**: One-time password for login

**Fields**:
- `user_id`, `otp`, `type`
- `expires_at`, `used_at`

**Key Methods**:
- `isValid()` - Checks if not expired and not used
- `markAsUsed()` - Marks OTP as used

---

### Supporting Models

| Model | Purpose |
|-------|---------|
| `IdeaRevision` | Tracks field changes to ideas |
| `IdeaVersion` | Stores idea data snapshots |
| `TeamMemberInvitation` | Invitation records with expiry |

---

## Controllers

### IdeaController (`app/Http/Controllers/IdeaController.php`)

**Routes**: `/idea`, `/idea/create`, `/idea/{slug}`, `/idea/{slug}/edit`

**Methods**:
- `index()` - List ideas with tab filtering (mine/team/public/collabo)
- `create()` - Show create form
- `store()` - Create idea + notify Deputy Directors
- `show()` - Display idea details
- `edit()` - Show edit form
- `update()` - Update idea
- `destroy()` - Delete idea

**Features**:
- Tab-based filtering with counts
- Team member management during create/update
- File attachment support

---

### DdReviewController (`app/Http/Controllers/DdReviewController.php`)

**Routes**: `/idea/dd-review/*`

**Methods**:
- `index()` - List DD reviews
- `create()` - Create DD review assignment
- `store()` - Store review
- `show()` - Display review
- `unlock()` - Deputy Director unlocks idea for review
- `addComment()` - Add review comments
- `sendFeedback()` - Send feedback to author
- `approve()` - Approve idea
- `reject()` - Reject idea
- `dashboard()` - Deputy Director/Reviewer dashboard

**Authorization**: Role-based (`deputy_director`, `idea_reviewer`)

---

### SmeReviewController (`app/Http/Controllers/SmeReviewController.php`)

**Routes**: `/idea/sme-review/*`

**Methods**:
- `index()`, `create()`, `store()`, `show()`, `edit()`, `update()`

**Status Flow**: Ideas in `stage 1 review` or `stage 1 revise`

---

### CollaboController (`app/Http/Controllers/CollaboController.php`)

**Routes**: `/idea/{slug}/collabo/*`

**Methods**:
- `index()` - List user's collaborations
- `show()` - Show collaboration page
- `requestCollaboration()` - Request to collaborate
- `cancelRequest()` - Cancel request
- `approveRequest()` - Approve collaborator
- `declineRequest()` - Decline request
- `removeCollaborator()` - Remove collaborator

---

### TeamMemberController (`app/Http/Controllers/TeamMemberController.php`)

**Routes**: `/idea/{idea}/team-members/*`

**Methods**:
- `index()`, `create()`, `store()`, `accept()`

**Purpose**: Internal team invitations via email

---

### CommentController (`app/Http/Controllers/CommentController.php`)

**Routes**: `/idea/{slug}/comments`

**Methods**:
- `index()` - Paginated comments with replies
- `store()` - Create comment/reply

---

### LikeController (`app/Http/Controllers/LikeController.php`)

**Routes**: `/likes`

**Methods**:
- `store()` - Toggle like on idea/comment

---

### SuggestionController (`app/Http/Controllers/SuggestionController.php`)

**Routes**: `/idea/{slug}/suggestions`

**Methods**:
- `store()` - Create suggestion
- `approve()` - Accept suggestion
- `decline()` - Reject suggestion

---

### NotificationController (`app/Http/Controllers/NotificationController.php`)

**Routes**: `/notifications`

**Methods**:
- `index()` - List notifications
- `count()` - Unread count
- `markAsRead()` - Mark single as read
- `markAllAsRead()` - Mark all as read

---

## Controllers - Authentication

### OtpController (`app/Http/Controllers/Auth/OtpController.php`)

**Routes**: `/otp/*`

**Methods**:
- `showVerifyForm()` - Show OTP entry page
- `send()` - Send OTP to email
- `verify()` - Verify OTP and login
- `resend()` - Resend OTP

**Key Features**:
- Google OAuth bypass
- Session-based flow

---

### SocialiteController (`app/Http/Controllers/Auth/SocialiteController.php`)

**Routes**: `/auth/google`, `/auth/google/callback`

**Methods**:
- `redirectToGoogle()` - OAuth redirect
- `handleGoogleCallback()` - JIT user provisioning

---

### WorkEmailVerificationController (`app/Http/Controllers/Auth/WorkEmailVerificationController.php`)

**Routes**: `/work-email/verify/*`

**Methods**:
- `show()` - Verification page
- `verify()` - Verify via signed URL
- `resend()` - Resend verification

---

### OnboardingController (`app/Http/Controllers/Onboarding/OnboardingController.php`)

**Routes**: `/onboarding/*`

**Methods**:
- `start()` - Start page
- `step1()` - Personal info form
- `updateStep1()` - Process step 1
- `step2()` - Security setup form
- `updateStep2()` - Process step 2
- `step3()` - Staff details form
- `updateStep3()` - Process step 3

**Flow**: Step 1 → Step 2 → (optional Step 3)

---

## Controllers - Settings

### ProfileController (`app/Http/Controllers/Settings/ProfileController.php`)

**Routes**: `/profile`, `/profile/edit`

**Methods**:
- `edit()` - Profile settings page
- `update()` - Update profile
- `destroy()` - Delete account

### SecurityController (`app/Http/Controllers/Settings/SecurityController.php`)

**Routes**: `/security`

**Methods**:
- `edit()` - Security settings (2FA)
- `update()` - Update password

---

## Services

### IdeaService (`app/Services/IdeaService.php`)

**Purpose**: Core business logic for ideas

**Methods**:
- `getPaginatedForUser()` - User's ideas
- `getForTeamMember()` - Team member's ideas
- `getPublicIndex()` - Public collaboration ideas
- `create()` - Create with transaction
- `update()` - Update with team sync
- `delete()` - Delete with cleanup
- `findById()` - Find with relations
- `processTeamMembers()` - Handle team invitations
- `storeAttachment()` - File storage

---

### DdReviewService (`app/Services/DdReviewService.php`)

**Purpose**: DD review CRUD operations

---

### SmeReviewService (`app/Services/SmeReviewService.php`)

**Purpose**: SME review CRUD operations

---

### OtpService (`app/Services/Auth/OtpService.php`)

**Purpose**: OTP generation and verification

**Methods**:
- `sendOtp()` - Find/create user, send OTP
- `verifyOtp()` - Verify and login
- `resendOtp()` - Resend if needed
- `checkGoogleOAuth()` - Check OAuth bypass
- `findUserByEmail()` - Find by email or work_email

---

### OnboardingService (`app/Services/Onboarding/OnboardingService.php`)

**Purpose**: Onboarding step handling

**Methods**:
- `updateStep1()` - Profile data
- `updateStep2()` - Security data
- `updateStep3()` - Staff data
- `completeOnboarding()` - Mark complete
- `getStep3Data()` - Region/directorate/department tree
- `sendVerificationNotification()` - Email verification

---

### CommentService (`app/Services/CommentService.php`)

**Purpose**: Comment CRUD

---

### TeamMemberService (`app/Services/TeamMemberService.php`)

**Purpose**: Team member management

---

## Notifications

| Notification | Purpose |
|---------------|---------|
| `NewIdeaSubmitted` | Notify DD of new idea |
| `DdReviewUnlocked` | Notify reviewers of unlocked idea |
| `FeedbackSent` | Send DD feedback to author |
| `IdeaApproved` | Idea approved notification |
| `IdeaRejected` | Idea rejected notification |
| `CollaborationRequestReceived` | New collaboration request |
| `CollaborationRequestApproved` | Request approved |
| `TeamMemberInvitation` | Team invitation |
| `CommentPosted` | New comment notification |
| `CommentLiked` | Like on comment |
| `IdeaLiked` | Like on idea |
| `VerifyWorkEmail` | Work email verification |

---

## Frontend Pages

### Ideas (`resources/js/pages/idea/`)

| Page | Default Export | Purpose |
|------|---------------|----------|
| `index.tsx` | `IdeaIndex` | Ideas list with tabs |
| `create.tsx` | `IdeaCreate` | Create idea form |
| `show.tsx` | `IdeaShow` | Idea details |
| `edit.tsx` | `IdeaEdit` | Edit idea form |
| `comments/show.tsx` | `CommentsShow` | Comments view |
| `comments/index.tsx` | `CommentsIndex` | Comments list |

### DD Review (`resources/js/pages/idea/ddReview/`)

| Page | Purpose |
|------|---------|
| `index.tsx` | Reviews list |
| `create.tsx` | Create review |
| `show.tsx` | Review details |
| `dashboard.tsx` | DD dashboard |
| `reviewer.tsx` | Reviewer view |

### SME Review (`resources/js/pages/idea/smeReview/`)

| Page | Purpose |
|------|---------|
| `index.tsx` | Reviews list |
| `create.tsx` | Create review |
| `show.tsx` | Review details |
| `edit.tsx` | Edit review |

### Collaboration (`resources/js/pages/idea/collabo/`)

| Page | Purpose |
|------|---------|
| `index.tsx` | Collaborations list |
| `show.tsx` | Collaboration page |

### Team Members (`resources/js/pages/idea/team-members/`)

| Page | Purpose |
|------|---------|
| `index.tsx` | Team list |
| `create.tsx` | Add member |
| `show.tsx` | Member details |
| `edit.tsx` | Edit member |

### Authentication (`resources/js/pages/auth/`)

| Page | Purpose |
|------|---------|
| `login.tsx` | Login form |
| `verify-otp.tsx` | OTP verification |
| `verify-email.tsx` | Email verification |
| `verify-work-email.tsx` | Work email verification |
| `two-factor-challenge.tsx` | 2FA challenge |
| `confirm-password.tsx` | Password confirmation |
| `forgot-password.tsx` | Password reset request |
| `reset-password.tsx` | Password reset form |
| `terms.tsx` | Terms acceptance |

### Onboarding (`resources/js/pages/auth/onboarding/`)

| Page | Step |
|------|------|
| `Start.tsx` | Start |
| `Step1.tsx` | Step 1 - Personal info |
| `Step2.tsx` | Step 2 - Security |
| `Step3.tsx` | Step 3 - Staff details |

### Settings (`resources/js/pages/settings/`)

| Page | Purpose |
|------|---------|
| `profile.tsx` | Profile settings |
| `security.tsx` | Security settings |
| `appearance.tsx` | Theme/appearance |

### Other Pages

| Page | Purpose |
|------|---------|
| `dashboard.tsx` | Main dashboard |
| `notifications/index.tsx` | Notifications list |
| `welcome.tsx` | Landing page |

---

## Authentication System

### Login Flow

1. User enters email on login page
2. OTP sent to email via `OtpController::send()`
3. User enters OTP on verification page
4. `OtpService::verifyOtp()` validates and logins user
5. If new user, redirect to onboarding

### Onboarding Flow

1. **Step 1**: Personal info (name, mobile, gender, avatar)
2. **Step 2**: Security (password, is_staff flag)
3. **Step 3** (optional): Staff details (department, work_email, employment_type)
4. Email verification sent based on email type provided

### OAuth

- Google OAuth via Socialite
- JIT user provisioning on first login
- Role assignment based on email domain (@kenha.co.ke → staff)

---

## Review Workflows

### Stage 1: Initial Submission

```
Draft → Deputy Director Review
```

1. User submits idea (status: draft)
2. Deputy Directors notified via `NewIdeaSubmitted`
3. DD can unlock for review or reject

### Stage 2: SME Review

```
DD Unlocks → Idea Reviewers Review → DD Decision
```

1. Deputy Director unlocks idea (status: stage 2 review)
2. Idea reviewers submit comments
3. DD sends feedback or approves/rejects

### Stage 3: Final Decision

```
Approved → Rejected
```

1. DD approves → status: dd_approved
2. DD rejects → status: dd_rejected

---

## Enhancements & Gaps

### 1. Missing Policy Classes

**Issue**: No Laravel Policy classes found (`app/Policies/`)

**Impact**: Authorization checks rely on inline role checks in controllers

**Recommendation**: Create Policy classes for each model:
- `IdeaPolicy` - Authorization for idea operations
- `DdReviewPolicy` - DD review operations
- `SmeReviewPolicy` - SME review operations
- `TeamMemberPolicy` - Team member operations
- `CommentPolicy` - Comment operations

---

### 2. Incomplete Review Status Flow

**Issue**: SME Review status seems disconnected from main workflow

**Current**: SME reviews exist but status (`stage 1 review`, `stage 1 revise`) isn't clearly integrated with DD review flow

**Recommendation**: Define clear status transitions and implement state machine or status helpers

---

### 3. Duplicate Collaboration Models

**Issue**: Both `TeamMember` and `Collaborator` serve similar purposes

| Model | Purpose |
|-------|---------|
| TeamMember | Internal (email-based) |
| Collaborator | External requests |

**Gap**: No clear differentiation in UI or consistent handling

**Recommendation**: Consolidate or document the distinction clearly

---

### 4. Missing Version Control

**Issue**: `IdeaRevision` and `IdeaVersion` models exist but not actively used

**Gap**: No version history UI, no diff viewing, no rollback

**Recommendation**:
- Create version on each significant update
- Add revision history page
- Implement diff viewing

---

### 5. Missing File Validation Rule

**Issue**: `SafePdf` rule exists but not used in requests

**Gap**: PDF upload validation not enforced

---

### 6. Incomplete SME Review Controller

**Issue**: No `destroy()` method in SmeReviewController

**Gap**: Cannot delete SME reviews

---

### 7. Notification Preferences

**Issue**: No user notification preferences (database, email, in-app)

**Gap**: No way to toggle notification channels

---

### 8. Missing API Endpoints

**Issue**: No API routes for mobile apps

**Gap**: REST/GraphQL API needed for mobile, third-party integrations

---

### 9. Missing Activity/audit Log

**Issue**: No comprehensive activity logging

**Gap**: Cannot audit who did what and when

---

### 10. Incomplete 2FA Implementation

**Issue**: SecurityController has 2FA but QR code display not visible in frontend

**Gap**: 2FA enable/disable flow incomplete in UI

---

## Unused Code

### Models

| Model | Status |
|-------|--------|
| `IdeaRevision` | **Unused** - No CRUD, no UI |
| `IdeaVersion` | **Unused** - No CRUD, no UI |
| `TeamMemberInvitation` | **Partially used** - Accept method uses but no full CRUD |

### Services

| Service | Status |
|---------|--------|
| `CommentService` | **Unused** - Controller doesn't use |
| `TeamMemberService` | **Unused** - Controller doesn't use |

### Rules

| Class | Status |
|-------|--------|
| `SafePdf` | **Unused** - Not applied in requests |

### Request Classes

| Class | Status |
|-------|--------|
| `StoreLikeRequest` | **Unused** - Controller uses basic validation |
| `StoreCommentRequest` | **Partially used** - Only uses some fields |
| `UpdateIdeaRequest` | **Unused** - Direct validation in controller |

### Middleware

| Middleware | Status |
|-----------|--------|
| `EnsureEmailsVerified` | **Not registered** - Found but not in Kernel |
| `EnsureOnboardingCompleted` | **Not registered** - Found but not in Kernel |
| `CheckTermsAccepted` | **Not registered** - Found but not in Kernel |

### Actions

| Action | Status |
|--------|--------|
| `UpdateUserPassword` | **Unused** - SecurityController uses direct update |
| `UpdateUserProfileInformation` | **Unused** - ProfileController uses direct update |
| `ResetUserPassword` | **Unused** - Fortify handles |
| `PasswordValidationRules` | **Unused** - Concerns not used |
| `CompleteOnboardingAfterEmailVerification` | **Probably unused** |

### Notifications

All notifications present but may have untested flows

### Frontend Pages

| Page | Status |
|------|--------|
| `welcome.tsx` | **Likely unused** - For unauthenticated users |
| `appearance.tsx` | **Likely incomplete** - Theme handling not evident |

### Mail

| Class | Status |
|-------|--------|
| `SendOtpMail` | Only used in OtpService |

---

## Recommendations Summary

1. **High Priority**:
   - Implement Policy classes for authorization
   - Add API routes for mobile
   - Complete 2FA UI flow

2. **Medium Priority**:
   - Implement version history for ideas
   - Clean up unused code/services
   - Add activity logging
   - Define clear SME → DD workflow integration

3. **Low Priority**:
   - Notification preferences
   - Appearance/theme options
   - Comprehensive test coverage

---

## Database Tables (Inferred)

| Table | Model |
|-------|-------|
| `users` | User |
| `ideas` | Idea |
| `dd_reviews` | DdReview |
| `sme_reviews` | SmeReview |
| `comments` | Comment |
| `likes` | Like |
| `team_members` | TeamMember |
| `collaborators` | Collaborator |
| `collaboration_requests` | CollaborationRequest |
| `suggestions` | Suggestion |
| `thematic_areas` | ThematicArea |
| `departments` | Department |
| `directorates` | Directorate |
| `regions` | Region |
| `otps` | Otp |
| `idea_revisions` | IdeaRevision |
| `idea_versions` | IdeaVersion |
| `team_member_invitations` | TeamMemberInvitation |

---

*Document generated from code review. Some assumptions may need verification against actual database schema.*