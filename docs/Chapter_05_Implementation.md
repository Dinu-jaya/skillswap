# CHAPTER 5: IMPLEMENTATION

## 5.1 Development Environment Setup

The project was initialised using Vite's React template with the following command:
```bash
npx -y create-vite@latest skillswap --template react
```

Tailwind CSS v4 was integrated using the dedicated Vite plugin, and Firebase SDK v12 was installed as a runtime dependency. The development server was operated using `npm run dev`, which leverages Vite's Hot Module Replacement for instantaneous feedback during development.

## 5.2 Project Directory Structure

```
skillswap/
├── index.html                    # HTML entry point
├── package.json                  # Dependencies and scripts
├── vite.config.js                # Vite + React + Tailwind configuration
├── firebase.json                 # Firebase Hosting configuration
├── .firebaserc                   # Firebase project alias
├── cors.json                     # CORS configuration for storage
├── storage.rules                 # Firebase Storage security rules
├── src/
│   ├── main.jsx                  # React DOM render entry
│   ├── App.jsx                   # Root component (Router + Providers)
│   ├── styles/
│   │   └── globals.css           # Design system (tokens, typography, surfaces)
│   ├── context/
│   │   ├── AuthContext.jsx       # Authentication state + ban enforcement
│   │   └── NotificationContext.jsx # Notifications + toast system
│   ├── routes/
│   │   └── AppRoutes.jsx         # Route definitions (public + protected)
│   ├── layouts/
│   │   └── DashboardLayout.jsx   # Sidebar + mobile header layout
│   ├── firebase/
│   │   ├── firebase.js           # Firebase app initialisation + providers
│   │   ├── userService.js        # User profile CRUD + backfilling
│   │   ├── skillService.js       # Skill aggregation + trending
│   │   ├── requestService.js     # Exchange request lifecycle
│   │   ├── chatService.js        # Conversations + messages + deletion
│   │   ├── contractService.js    # Contract CRUD + auto-completion
│   │   ├── sessionService.js     # Session CRUD + contract increment
│   │   ├── notificationService.js# Notification CRUD + subscriptions
│   │   ├── moderationService.js  # Admin: users, reports, issues, warnings
│   │   └── banUtils.js           # Ban status check utilities
│   ├── services/
│   │   ├── cloudinaryService.js  # Cloudinary upload API wrapper
│   │   └── uploadService.js      # Upload orchestration + validation
│   ├── hooks/
│   │   ├── useContracts.js       # Contract subscription hook
│   │   ├── useSessions.js        # Session subscription hook
│   │   ├── useToast.js           # Toast state management hook
│   │   └── useFileUpload.js      # File upload state + progress hook
│   ├── utils/
│   │   ├── avatarMap.js          # Avatar preset → image path mapping
│   │   ├── skillUtils.js         # Skill normalisation + category inference
│   │   └── fileValidation.js     # File type/size validation rules
│   ├── components/               # 21 reusable UI components
│   │   ├── Navbar.jsx            # Public route navigation bar
│   │   ├── Sidebar.jsx           # Dashboard navigation sidebar
│   │   ├── ProtectedRoute.jsx    # Auth guard HOC
│   │   ├── AdminRoute.jsx        # Admin role guard HOC
│   │   ├── Avatar.jsx            # Avatar renderer (preset mapping)
│   │   ├── Button.jsx            # Primary + Secondary button variants
│   │   ├── StatCard.jsx          # Dashboard statistics card
│   │   ├── TrendingSkillCard.jsx # Trending skill display card
│   │   ├── RequestCard.jsx       # Exchange request card
│   │   ├── RecommendedUserCard.jsx # User suggestion card
│   │   ├── ActivityTimeline.jsx  # Dashboard activity feed
│   │   ├── ContractCard.jsx      # Exchange contract card
│   │   ├── CreateContractModal.jsx # Contract creation form modal
│   │   ├── SessionCard.jsx       # Session timeline card
│   │   ├── MarkCompleteModal.jsx # Session completion modal
│   │   ├── MessageBubble.jsx     # Chat message renderer
│   │   ├── AttachmentRenderer.jsx # File attachment display
│   │   ├── NotificationDropdown.jsx # Notification panel
│   │   ├── Toast.jsx             # Animated toast stack
│   │   ├── ReportModal.jsx       # User report form
│   │   └── SubmitIssueModal.jsx  # Help request form
│   └── pages/                    # 15 page components
│       ├── Home.jsx              # Landing page
│       ├── Login.jsx             # Email + OAuth login
│       ├── Signup.jsx            # Registration with profile setup
│       ├── Dashboard.jsx         # User dashboard with stats + feeds
│       ├── BrowseSkills.jsx      # Skill discovery + filtering
│       ├── Requests.jsx          # Request management (3 tabs)
│       ├── Chat.jsx              # Real-time messaging interface
│       ├── Profile.jsx           # Profile editing + avatar selection
│       ├── Contracts.jsx         # Contract management (4 tabs)
│       ├── SessionsPage.jsx      # Session tracking + timeline
│       ├── AdminDashboard.jsx    # Admin moderation panel
│       ├── Explore.jsx           # Public explore page
│       ├── HowItWorks.jsx        # How it works guide
│       ├── Community.jsx         # Community page
│       └── About.jsx             # About page
└── dist/                         # Production build output
```

## 5.3 Module-Wise Implementation

### 5.3.1 Authentication Module (AuthContext.jsx)

The authentication module serves as the central authority for user identity management across the application. It is implemented as a React Context Provider that wraps the entire component tree, making authentication state available to every component through the `useAuth()` custom hook.

**Key implementation details:**

- **Multi-Provider Support**: The module supports three authentication providers — email/password via `signInWithEmailAndPassword`, Google OAuth via `signInWithPopup(googleProvider)`, and GitHub OAuth via `signInWithPopup(githubProvider)`. Provider instances are initialised in firebase.js and consumed by AuthContext.

- **Ban Enforcement Pipeline**: A three-stage ban detection mechanism is implemented: (1) pre-login ban check via `checkBanStatus()` before allowing navigation, (2) session-restore ban check within `onAuthStateChanged` before setting `currentUser`, and (3) real-time ban detection through `onSnapshot` on the user's profile document, which triggers `forceBanSignOut()` if `isBanned` becomes true during an active session.

- **Profile Backfilling**: The `ensureUserProfile()` function, called on every authentication event, ensures that user documents contain all required fields. For new users, it creates a complete profile with safe defaults. For existing users, it backfills only missing fields without overwriting existing data, using Firestore's `setDoc` with `merge: true`.

- **Online Status Tracking**: The module updates the user's `online` status and `lastSeen` timestamp in Firestore upon login and logout, enabling real-time presence indicators in the messaging interface.

### 5.3.2 Skill Service Module (skillService.js)

The skill service module manages skill data aggregation and presentation. Its primary function, `subscribeToPublicSkills()`, implements a real-time listener that:

1. Subscribes to the entire `users` collection via `onSnapshot`
2. Iterates through each user's `skillsOffered` array
3. Normalises each skill using `normalizeSkill()` (handles both legacy string format and structured `{name, category, level}` objects)
4. Deduplicates by `uid::normalizedSkillName` key
5. Sorts results by request count descending, then alphabetically
6. Emits the aggregated skill card array to the callback

This approach ensures that the Browse Skills page always reflects the latest skill data from all user profiles without requiring a separate skill registry.

### 5.3.3 Request Service Module (requestService.js)

The exchange request lifecycle is managed through five key functions:

- **sendExchangeRequest()**: Creates a new request document with a built-in duplicate guard. Before creating a request, it queries existing requests between the same sender-receiver pair and blocks creation if a pending or accepted request already exists.

- **subscribeToIncomingRequests()**: Real-time listener for pending requests where the current user is the receiver, with per-sender deduplication.

- **subscribeToAcceptedRequests()**: Uses a dual-query merge pattern — two separate Firestore queries (where user is sender + where user is receiver) are merged client-side with deduplication by document ID and then by peer UID.

- **acceptRequest()**: Updates request status to 'accepted', automatically creates a chat conversation via `startConversationWithUser()`, and sends a notification to the original sender.

- **rejectRequest()**: Updates request status to 'rejected'.

### 5.3.4 Chat Service Module (chatService.js)

The messaging system is implemented using a two-level Firestore structure:

- **Chat documents** (`chats` collection): Store conversation metadata including participant UIDs, participant display details, last message preview, and per-user unread counts.

- **Message sub-collections** (`messages/{chatId}/chatMessages`): Store individual messages ordered by timestamp. Each message carries a type field ('text' or 'attachment'), a text body, and an optional attachment object containing Cloudinary metadata.

The `sendMessage()` function atomically writes the message document and updates the parent chat's `lastMessage`, `lastMessageTime`, and recipient's `unreadCounts` using Firestore's `increment(1)` for atomic counter updates.

### 5.3.5 Contract Service Module (contractService.js)

The contract module implements the complete contract lifecycle:

- **createContract()**: Creates a new contract document with status 'pending' and both parties' skill exchange details.
- **acceptContract()**: Transitions status from 'pending' to 'active' and records `startedAt`.
- **rejectContract()**: Sets status to 'cancelled'.
- **cancelContract()**: Sets status to 'cancelled' with `cancelledAt` timestamp.
- **incrementCompletedSessions()**: Atomically increments `completedSessions` using Firestore's `increment(1)`, then reads the updated document. If `completedSessions >= totalSessions`, it atomically sets `status: 'completed'` and `completedAt`, and creates notifications for both parties.
- **subscribeToUserContracts()**: Uses the dual-query merge pattern (requester OR partner) for real-time contract tracking.

### 5.3.6 Session Service Module (sessionService.js)

Sessions are tracked within the `exchangeSessions` collection, linked to contracts via `contractId`. The `completeSession()` function writes completion data (status, notes, proofUrl) and delegates to `incrementCompletedSessions()` in the contract service, which handles auto-completion logic.

### 5.3.7 Notification System (NotificationContext.jsx + notificationService.js)

The notification system comprises two layers:

- **Persistent Notifications**: Stored as Firestore documents in the `notifications` collection, displayed in the NotificationDropdown component. Support types: request, accept, warning, contract, session, message, profile, connect.

- **Transient Toast Notifications**: In-memory toast state managed by NotificationContext. The toast renderer supports four visual variants (success with emerald, error with red, info with cyan, warning with amber), each with distinct icons, border colours, and accent bars. Toasts auto-dismiss after configurable durations (default 4000ms for general, 5000ms for admin warnings).

### 5.3.8 Moderation Module (moderationService.js + AdminDashboard.jsx)

The admin moderation system provides:

- **User Management**: Real-time user listing with ban/unban toggle. Banning a user sets `isBanned: true` on their Firestore document, which is immediately detected by the AuthContext's real-time listener, triggering forced sign-out.

- **Warning System**: Admins can send warnings that are written to both the `warnings` collection and the `notifications` collection, triggering an immediate toast notification on the recipient's screen.

- **Report Management**: Users can report others through the ReportModal. Reports are stored in a `reports` collection with status tracking (pending → reviewed → resolved).

- **Issue Tracking**: Users can submit help requests through the SubmitIssueModal, stored in an `issues` collection with status tracking (open → in-progress → resolved).

## 5.4 Frontend Implementation

### 5.4.1 Design System (globals.css)

The design system is centralised in a single CSS file that defines:

- **Font Imports**: DM Sans (display headings) and Inter (body text) from Google Fonts
- **Theme Tokens**: CSS custom properties via Tailwind's @theme directive for background (#09090b), surface (#111113), accent (#22d3ee cyan), highlight (#a78bfa violet), and glass/border opacity values
- **Typography Classes**: .hero-title, .page-title, .section-title, .body-text, .muted-text, .small-label, .section-label
- **Surface Classes**: .glass-panel, .glass-card (with hover state transitions)
- **Button Classes**: .btn-primary (cyan pill), .btn-secondary (ghost outline)
- **Input Classes**: .input-field (dark glass with cyan focus ring)
- **Scrollbar Styling**: Ultra-thin (4px) semi-transparent scrollbars
- **Animations**: @keyframes float for ambient UI elements

### 5.4.2 Responsive Design Strategy

The application employs a mobile-first responsive strategy:

- **Mobile (< 1024px)**: Full-width content, hamburger menu triggering a slide-over sidebar, stacked grid layouts
- **Desktop (≥ 1024px)**: Fixed sidebar (220px expanded / 68px collapsed) with smooth width transition, multi-column grid layouts (5-column for dashboard, 3-column for skill cards, 2-column for contracts)

### 5.4.3 Animation Implementation

Framer Motion is used for three categories of animation:

1. **Page-level entrance**: `fadeUp` variants with staggered delays create a cascading entrance effect as page sections become visible
2. **Component transitions**: AnimatePresence enables smooth mount/unmount animations for modals, toasts, and list items
3. **Interactive feedback**: Spring-based animations for progress bars, hover effects on cards, and layout animations for tab indicators using `layoutId`

## 5.5 Deployment

### 5.5.1 Build Process

The production build is generated using:
```bash
npm run build
```

Vite compiles JSX, processes Tailwind CSS (tree-shaking unused utilities), bundles JavaScript with code splitting, and outputs optimised assets to the `dist/` directory.

### 5.5.2 Firebase Hosting Configuration

The `firebase.json` file configures Firebase Hosting:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  }
}
```

The rewrite rule ensures that all URL paths are served by `index.html`, enabling React Router's client-side routing to handle navigation without server-side route matching.

### 5.5.3 Deployment Command

```bash
firebase deploy --only hosting
```

This uploads the `dist/` directory to Firebase's global CDN, making the application accessible at the configured Firebase Hosting domain.
