# CHAPTER 4: SYSTEM DESIGN

## 4.1 System Architecture

SkillSwap employs a client-heavy, serverless architecture wherein the React.js frontend communicates directly with Firebase's cloud services. This architecture eliminates the need for a traditional backend server, reducing infrastructure complexity and operational overhead while leveraging Firebase's built-in scalability, security, and real-time synchronisation capabilities.

The architectural pattern can be described as a **Three-Tier Serverless Architecture**:

1. **Presentation Tier** (React.js + Tailwind CSS + Framer Motion): Responsible for rendering the user interface, handling user interactions, managing client-side routing, and orchestrating animations. This tier executes entirely in the user's browser.

2. **Service Tier** (Firebase SDK + Custom Service Modules): A client-side service layer consisting of ten specialised service modules that encapsulate all Firestore operations, authentication flows, and external API calls (Cloudinary). These services provide a clean abstraction over Firebase's SDK, enforcing data validation, error handling, and business logic.

3. **Data Tier** (Cloud Firestore + Firebase Authentication + Cloudinary CDN): Cloud-hosted services providing NoSQL document storage with real-time synchronisation, OAuth-compliant authentication with token management, and distributed media storage with CDN delivery.

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  Pages   │  │Components│  │  Hooks   │  │ Contexts │   │
│  │ (15)     │  │  (21)    │  │  (4)     │  │  (2)     │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
│       └──────────────┴─────────────┴─────────────┘          │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                    SERVICE TIER                               │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌───────────┐  │
│  │contractSvc │ │sessionSvc  │ │ chatSvc  │ │requestSvc │  │
│  │skillSvc    │ │userSvc     │ │ modSvc   │ │notifSvc   │  │
│  │banUtils    │ │cloudSvc    │ │uploadSvc │ │           │  │
│  └────────────┘ └────────────┘ └──────────┘ └───────────┘  │
│                          │                                   │
├──────────────────────────┼───────────────────────────────────┤
│                     DATA TIER                                │
│  ┌─────────────────┐ ┌──────────────┐ ┌────────────────┐   │
│  │ Cloud Firestore │ │Firebase Auth │ │  Cloudinary    │   │
│  │ (8 collections) │ │(3 providers) │ │  (File CDN)    │   │
│  └─────────────────┘ └──────────────┘ └────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 4.2 Data Flow Architecture

### 4.2.1 Authentication Flow

```
User Input → AuthContext.login() / signup() / signInWithSocial()
  → Firebase Auth SDK (signInWithEmailAndPassword / createUserWithEmailAndPassword / signInWithPopup)
    → Firebase Auth Server (token validation)
      → onAuthStateChanged listener fires
        → checkBanStatus() — Firestore read to verify isBanned flag
          → [If banned] forceBanSignOut() → redirect to login with ban message
          → [If safe] setCurrentUser() → ensureUserProfile() (backfill missing fields)
            → onSnapshot(users/{uid}) — real-time profile listener
              → setUserProfile() → setLoading(false) → UI renders
```

### 4.2.2 Skill Exchange Request Flow

```
User clicks "Request Exchange" on BrowseSkills
  → sendExchangeRequest() (requestService)
    → checkExistingRequest() — duplicate guard
      → [If duplicate] Return existing status, show toast
      → [If new] addDoc('exchangeRequests', {...})
        → createNotification(receiverId, 'request', ...)
        → incrementSkillRequestCount(skillId)
  → Receiver sees notification (real-time via onSnapshot)
    → acceptRequest() → updateDoc(status: 'accepted')
      → startConversationWithUser() — creates chat doc
      → createNotification(senderId, 'accept', ...)
```

### 4.2.3 Contract and Session Flow

```
User clicks "Contract" on accepted request
  → CreateContractModal opens
    → getUserProfile(partnerId) — auto-fill partner skills
  → Submit → createContract() (contractService)
    → addDoc('exchangeContracts', { status: 'pending', ... })
  → Partner accepts → acceptContract()
    → updateDoc(status: 'active', startedAt: serverTimestamp())
  → User adds sessions → createSession()
    → addDoc('exchangeSessions', { status: 'pending', ... })
  → User completes session → completeSession()
    → updateDoc(status: 'completed', completedAt, notes, proofUrl)
    → incrementCompletedSessions(contractId)
      → [If completedSessions >= totalSessions]
        → updateDoc(contract, { status: 'completed' })
        → createNotification(requesterId, ...)
        → createNotification(partnerId, ...)
```

## 4.3 Database Design

### 4.3.1 Cloud Firestore Collections Schema

SkillSwap utilises eight primary Firestore collections:

**1. users**
```
Document ID: {uid}
{
  uid: string,
  name: string,
  displayName: string,
  email: string,
  bio: string,
  gender: "male" | "female",
  avatar: string (preset ID),
  avatarType: "preset",
  skillsOffered: [{ name, category, level }],
  skillsWanted: [{ name, category, level }],
  online: boolean,
  lastSeen: Timestamp,
  completedExchanges: number,
  connectionsCount: number,
  isAdmin: boolean,
  isBanned: boolean,
  warningCount: number,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**2. skills**
```
Document ID: auto-generated
{
  title: string,
  category: string,
  level: string,
  tags: string[],
  createdBy: string (uid),
  requestsCount: number,
  createdAt: Timestamp
}
```

**3. exchangeRequests**
```
Document ID: auto-generated
{
  senderId: string,
  senderName: string,
  senderAvatar: string,
  receiverId: string,
  receiverName: string,
  receiverAvatar: string,
  skillId: string | null,
  skillTitle: string,
  status: "pending" | "accepted" | "rejected",
  createdAt: Timestamp,
  acceptedAt: Timestamp | null,
  rejectedAt: Timestamp | null
}
```

**4. exchangeContracts**
```
Document ID: auto-generated
{
  requesterId: string,
  requesterName: string,
  requesterAvatar: string,
  partnerId: string,
  partnerName: string,
  partnerAvatar: string,
  requesterSkillOffered: string,
  requesterSkillWanted: string,
  partnerSkillOffered: string,
  partnerSkillWanted: string,
  durationWeeks: number,
  totalSessions: number,
  completedSessions: number,
  status: "pending" | "active" | "completed" | "cancelled",
  createdAt: Timestamp,
  startedAt: Timestamp | null,
  completedAt: Timestamp | null
}
```

**5. exchangeSessions**
```
Document ID: auto-generated
{
  contractId: string,
  sessionNumber: number,
  topic: string,
  taughtBy: string (uid),
  taughtByName: string,
  scheduledAt: string (ISO datetime),
  completedAt: Timestamp | null,
  status: "pending" | "completed",
  notes: string,
  proofUrl: string,
  createdAt: Timestamp
}
```

**6. chats**
```
Document ID: auto-generated
{
  chatId: string,
  participants: [string, string],
  participantDetails: {
    [uid]: { name, avatar, email }
  },
  lastMessage: string,
  lastMessageTime: Timestamp,
  unreadCounts: { [uid]: number },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**7. messages/{chatId}/chatMessages** (sub-collection)
```
Document ID: auto-generated
{
  type: "text" | "attachment",
  text: string,
  attachment: {
    type: string,
    fileCategory: string,
    mimeType: string,
    url: string,
    publicId: string,
    format: string,
    bytes: number,
    originalName: string
  } | null,
  senderId: string,
  timestamp: Timestamp,
  read: boolean
}
```

**8. notifications**
```
Document ID: auto-generated
{
  userId: string,
  type: "request" | "accept" | "warning" | "contract" | "session" | ...,
  title: string | null,
  message: string,
  senderName: string | null,
  senderAvatar: string | null,
  read: boolean,
  sentByAdmin: boolean | null,
  createdAt: Timestamp
}
```

Additional collections: **warnings**, **reports**, **issues** (used by the admin moderation system).

## 4.4 Module Design

### 4.4.1 Module Dependency Diagram

```
App.jsx
 ├── AuthContext (AuthProvider)
 │    └── firebase.js, userService.js, banUtils.js
 ├── NotificationContext (NotificationProvider)
 │    └── notificationService.js
 └── AppRoutes.jsx
      ├── Public Routes: Home, Login, Signup, Explore, HowItWorks, Community, About
      └── Protected Routes (DashboardLayout)
           ├── Dashboard → skillService, requestService, userService, contractService
           ├── BrowseSkills → skillService, requestService
           ├── Requests → requestService, chatService, contractService
           ├── Chat → chatService, uploadService, cloudinaryService
           ├── Profile → userService
           ├── Contracts → contractService, requestService
           ├── SessionsPage → sessionService, contractService
           └── AdminDashboard → moderationService (admin-only)
```

## 4.5 User Interface Design Principles

The user interface adheres to the following design principles:

1. **Dark-Mode-First Design**: The entire application is built on a dark colour palette (#09090b background, #111113 surfaces) with carefully calibrated contrast ratios ensuring readability while reducing eye strain.

2. **Glassmorphism**: Surface elements employ subtle transparency and border effects (rgba(255,255,255,0.06) borders) creating a layered, premium aesthetic.

3. **Micro-Animations**: Framer Motion is used extensively to provide fade-up entrance animations, spring-based transitions, layout animations for tab indicators, and AnimatePresence for exit animations.

4. **Consistent Design Tokens**: A centralised design system defined in globals.css provides CSS custom properties for colours, typography, spacing, and component classes, ensuring visual consistency across all pages.

5. **Responsive Layout**: The application employs a sidebar-based navigation for desktop viewports (≥1024px) that collapses to a mobile-friendly hamburger menu for smaller screens, with all content areas using responsive grid layouts.

## 4.6 Routing Architecture

The routing system employs React Router v7 with a nested route structure:

- **Public Routes**: Rendered with the Navbar component, accessible without authentication. Includes Home (/), Login (/login), Signup (/signup), Explore (/explore), How It Works (/how-it-works), Community (/community), and About (/about).

- **Protected Routes**: Wrapped in ProtectedRoute (authentication guard) and DashboardLayout (sidebar + mobile header). Includes Dashboard (/dashboard), Browse Skills (/browse), Requests (/requests), Chat (/chat), Profile (/profile), Contracts (/contracts), Sessions (/contracts/:contractId/sessions), and Admin (/admin — additionally guarded by AdminRoute).

- **Fallback Route**: All unmatched paths redirect to the home page via Navigate with replace.
