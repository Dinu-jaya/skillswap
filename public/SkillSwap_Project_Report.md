# ABSTRACT

SkillSwap is a peer-to-peer skill exchange platform developed as a web application to facilitate reciprocal knowledge transfer among individuals. The platform addresses the absence of a structured, dedicated system for barter-based skill exchange by providing integrated modules for skill discovery, exchange request management, real-time messaging with file sharing, formalised exchange contracts with session-level tracking, and administrative moderation. Built using React.js 19, Firebase (Authentication and Cloud Firestore), Tailwind CSS 4, and Framer Motion, the application follows a serverless architecture with real-time data synchronisation. The system supports multi-provider authentication (Email, Google, GitHub), automated contract lifecycle management with completion detection, and a typed notification system. The platform has been deployed on Firebase Hosting and demonstrates the viability of structured peer-learning exchange as an alternative to traditional paid educational models.

**Keywords**: Peer-to-peer learning, Skill exchange, React.js, Firebase, Cloud Firestore, Real-time web application, Collaborative learning

---

# TABLE OF CONTENTS

1. [Chapter 1: Introduction](#chapter-1-introduction)
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope of the Project
   - 1.5 Motivation
   - 1.6 Organisation of the Report

2. [Chapter 2: Literature Survey](#chapter-2-literature-survey)
   - 2.1 Introduction
   - 2.2 Review of Existing Peer Learning Platforms
   - 2.3 Review of Technologies
   - 2.4 Comparison of Existing Systems
   - 2.5 Research Gap
   - 2.6 Summary

3. [Chapter 3: System Analysis](#chapter-3-system-analysis)
   - 3.1 Existing System
   - 3.2 Proposed System
   - 3.3 Feasibility Study
   - 3.4 System Requirements

4. [Chapter 4: System Design](#chapter-4-system-design)
   - 4.1 System Architecture
   - 4.2 Data Flow Architecture
   - 4.3 Database Design
   - 4.4 Module Design
   - 4.5 User Interface Design Principles
   - 4.6 Routing Architecture

5. [Chapter 5: Implementation](#chapter-5-implementation)
   - 5.1 Development Environment Setup
   - 5.2 Project Directory Structure
   - 5.3 Module-Wise Implementation
   - 5.4 Frontend Implementation
   - 5.5 Deployment

6. [Chapter 6: Testing](#chapter-6-testing)
   - 6.1 Testing Methodology
   - 6.2 Test Cases and Results
   - 6.3 Testing Summary
   - 7.1–7.11 Screenshots and Explanations
   - 8.1 Conclusion
   - 8.2 Future Enhancements
   - References

---

# PROJECT INFORMATION

| Field | Details |
|---|---|
| **Project Title** | SkillSwap – Peer-to-Peer Skill Exchange Platform |
| **Technology Stack** | React.js 19, Firebase 12, Tailwind CSS 4, Vite 8 |
| **Architecture** | Serverless (Client + BaaS) |
| **Database** | Cloud Firestore (NoSQL, 8 collections) |
| **Authentication** | Firebase Auth (Email, Google, GitHub) |
| **File Storage** | Cloudinary CDN |
| **Hosting** | Firebase Hosting |
| **Total Source Files** | 56 (15 pages, 21 components, 10 services, 4 hooks, 2 contexts, 3 utils, 1 layout) |
| **Frontend Framework** | React.js with React Router v7 |
| **Styling** | Tailwind CSS v4 + Custom Design System |
| **Animation** | Framer Motion 12 |
| **Icons** | Lucide React |

---

# CHAPTER 1: INTRODUCTION

## 1.1 Project Overview

"SkillSwap – Peer-to-Peer Skill Exchange Platform" is a modern web application designed to facilitate collaborative learning among individuals by enabling them to exchange skills directly with one another. Unlike traditional online learning platforms that rely on pre-recorded courses or paid tutoring models, SkillSwap introduces a barter-based educational paradigm wherein users offer their expertise in a particular domain in return for gaining knowledge in another. The platform is built upon the premise that every individual possesses a unique skill set that holds value to another, and by connecting these individuals in a structured and secure environment, mutually beneficial learning outcomes can be achieved.

The application has been developed using React.js as the frontend framework, Firebase as the backend-as-a-service (BaaS) provider, and Tailwind CSS as the utility-first styling framework. The architecture follows a component-driven development methodology, employing modular service layers, custom React hooks, and context-based state management to ensure scalability, maintainability, and real-time responsiveness across all user interactions.

## 1.2 Problem Statement

In the contemporary educational landscape, several challenges impede effective peer-to-peer knowledge transfer:

1. **Cost Barriers**: Premium online courses and tutoring sessions impose significant financial burdens on learners, particularly students in developing nations.
2. **Lack of Structured Exchange Mechanisms**: While informal skill-sharing occurs through social networks and forums, there exists no dedicated platform that formalises the process of reciprocal skill exchange with progress tracking and accountability.
3. **Discovery Limitations**: Identifying individuals who possess complementary skill sets remains a manual and inefficient process, often relying on serendipitous encounters rather than systematic matching.
4. **Absence of Accountability**: Informal learning arrangements lack structured session tracking, completion verification, and progress documentation, leading to inconsistent learning outcomes.
5. **Communication Fragmentation**: Learners typically resort to multiple third-party tools for messaging, scheduling, and file sharing, resulting in a fragmented user experience.

## 1.3 Objectives

The primary objectives of this project are:

1. To design and develop a fully functional peer-to-peer skill exchange platform that enables users to post, discover, and exchange skills.
2. To implement a secure multi-provider authentication system supporting Email/Password, Google OAuth, and GitHub OAuth login methods.
3. To develop a real-time messaging system with support for text messages, image attachments, and document sharing via Cloudinary integration.
4. To create a structured exchange contract system with session-level tracking, progress visualisation, and automated completion detection.
5. To implement an administrative moderation dashboard with user management, reporting, warning issuance, and ban enforcement capabilities.
6. To build a responsive, aesthetically premium user interface employing modern design principles including glassmorphism, micro-animations, and dark-mode-first theming.
7. To deploy the application on Firebase Hosting with client-side routing support for production accessibility.

## 1.4 Scope of the Project

The scope of this project encompasses the following functional domains:

- **User Authentication and Profile Management**: Registration, login (email, Google, GitHub), profile customisation with avatar selection, skill declaration with structured metadata (name, category, proficiency level).
- **Skill Discovery and Browsing**: Real-time skill listing aggregated from user profiles, category-based filtering, level-based filtering, search functionality, and skill request initiation.
- **Exchange Request Lifecycle**: Request creation with duplicate detection, acceptance with automatic chat initiation, rejection handling, and connection tracking.
- **Real-Time Messaging**: One-to-one conversations, message sending/receiving with Firestore real-time listeners, file attachment uploads via Cloudinary, message deletion, and unread count tracking.
- **Exchange Contracts and Session Tracking**: Contract proposal with auto-filled partner skills, acceptance/rejection/cancellation workflow, session scheduling with datetime-local inputs, session completion with notes and proof URL documentation, and automatic contract completion upon fulfilling all sessions.
- **Administrative Moderation**: User listing with ban/unban controls, warning issuance with real-time toast notifications, report management, and issue tracking.
- **Notification System**: Real-time Firestore-backed notifications with typed toast alerts (success, error, info, warning), unread badge counts, and notification dropdown with mark-as-read functionality.

## 1.5 Motivation

The motivation for developing SkillSwap stems from the observation that within college campuses and professional communities, a significant amount of knowledge transfer occurs informally—through conversations, study groups, and peer mentoring—yet no dedicated digital platform exists to formalise, track, and incentivise these exchanges. By providing a structured platform for such interactions, SkillSwap aims to democratise access to knowledge by leveraging the collective expertise of its user base, thereby reducing dependency on expensive educational resources and fostering a culture of collaborative learning.

## 1.6 Organisation of the Report

This report is organised into the following chapters:

- **Chapter 1**: Introduction — Provides an overview of the project, problem statement, objectives, and scope.
- **Chapter 2**: Literature Survey — Reviews existing platforms and technologies relevant to peer-to-peer learning.
- **Chapter 3**: System Analysis — Examines the existing system, proposed system, and requirements.
- **Chapter 4**: System Design — Details the architectural design, data flow, and database schema.
- **Chapter 5**: Implementation — Describes the software components, modules, and implementation methodology.
- **Chapter 6**: Testing — Documents the testing strategies, test cases, and results.
- **Chapter 7**: Screenshots and Explanations — Provides visual documentation of the application's user interface.
- **Chapter 8**: Conclusion and Future Enhancements — Summarises findings and proposes future improvements.
- **References** — Lists all sources cited in this report.

---

# CHAPTER 2: LITERATURE SURVEY

## 2.1 Introduction

A comprehensive literature survey was conducted to examine existing platforms and technologies in the domains of peer-to-peer learning, skill exchange, and real-time web application development. This chapter reviews the relevant works, identifies their strengths and limitations, and establishes the academic and technological foundation upon which SkillSwap has been designed.

## 2.2 Review of Existing Peer Learning Platforms

### 2.2.1 Skillshare

Skillshare is a prominent online learning community offering thousands of classes across creative, business, and technology domains. While it provides high-quality video-based instruction, its model is fundamentally one-directional: instructors create content and learners consume it. The platform operates on a subscription model (approximately $13.99/month), creating a financial barrier for students. Critically, Skillshare does not facilitate reciprocal knowledge exchange—a learner cannot offer their own expertise in return for instruction received.

### 2.2.2 Meetup

Meetup is a platform for organising and discovering local events and groups centred around shared interests. While it facilitates in-person skill-sharing through workshops and study groups, it lacks digital tools for structured one-on-one skill exchange, session tracking, or progress documentation. Its primary function is event coordination rather than sustained peer-learning relationships.

### 2.2.3 LinkedIn Learning

LinkedIn Learning (formerly Lynda.com) offers professional development courses across business, technology, and creative fields. Integrated with the LinkedIn professional network, it provides course recommendations based on career profiles. However, it follows a traditional instructor-to-learner model with no mechanism for peer exchange, and its premium pricing ($29.99/month) limits accessibility.

### 2.2.4 Tandem (Language Exchange)

Tandem is a language learning application that pairs users seeking to learn each other's native languages. It represents one of the few successful implementations of the reciprocal exchange model, albeit limited exclusively to language learning. Its matching algorithm and structured conversation tools demonstrate the viability of peer exchange platforms, though it does not generalise to broader skill categories.

### 2.2.5 TimeRepublik

TimeRepublik operates on a time-banking model where users exchange services using time as currency. While conceptually aligned with SkillSwap's objectives, TimeRepublik focuses on service exchange (e.g., plumbing, graphic design tasks) rather than knowledge transfer and learning. It lacks educational features such as session tracking, learning progress documentation, and structured curriculum exchange.

## 2.3 Review of Technologies

### 2.3.1 React.js

React.js, developed and maintained by Meta (formerly Facebook), is an open-source JavaScript library for building user interfaces. It employs a component-based architecture wherein the UI is decomposed into reusable, self-contained components. React's virtual DOM mechanism optimises rendering performance by minimising direct manipulations of the browser's Document Object Model. The introduction of React Hooks (useState, useEffect, useContext, useCallback) in React 16.8 eliminated the need for class-based components, enabling more concise and readable functional component patterns. React 19, used in this project, introduces further performance optimisations and concurrent rendering capabilities.

### 2.3.2 Firebase

Firebase, a Backend-as-a-Service (BaaS) platform by Google, provides a suite of cloud-hosted services including authentication, real-time database (Firestore), file storage, and hosting. Cloud Firestore, the database service used in this project, is a NoSQL document-oriented database that supports real-time data synchronisation through snapshot listeners. This eliminates the need for manual polling and enables instantaneous UI updates when data changes—a critical requirement for messaging and notification systems. Firebase Authentication supports multiple sign-in providers including email/password, Google, GitHub, and others, with built-in security token management.

### 2.3.3 Tailwind CSS

Tailwind CSS is a utility-first CSS framework that provides low-level utility classes for constructing custom designs without writing traditional CSS. Unlike component-based frameworks such as Bootstrap, Tailwind does not impose pre-designed components, granting developers complete control over visual aesthetics. Version 4, used in this project, introduces the @theme directive for CSS custom property-based design tokens and native Vite plugin integration for optimal build performance.

### 2.3.4 Framer Motion

Framer Motion is a production-ready animation library for React that provides a declarative API for creating complex animations and gestures. Its motion component wrapper, AnimatePresence for exit animations, and layout animation system enable smooth transitions and micro-interactions that enhance the perceived quality and responsiveness of the user interface. The library supports spring-based physics animations, staggered children animations, and shared layout animations.

### 2.3.5 Cloudinary

Cloudinary is a cloud-based media management platform providing image and video upload, storage, transformation, and delivery services. In this project, Cloudinary is used as the file upload backend for chat attachments, replacing Firebase Storage to achieve more reliable file handling with built-in transformation capabilities, automatic format optimisation, and CDN-based delivery.

### 2.3.6 Vite

Vite is a next-generation frontend build tool developed by Evan You (creator of Vue.js). It leverages native ES modules for instant development server startup and Hot Module Replacement (HMR), resulting in significantly faster development feedback loops compared to traditional bundlers such as Webpack. Vite uses Rollup for production builds, ensuring optimised bundle sizes and code splitting.

## 2.4 Comparison of Existing Systems

| Feature | Skillshare | Meetup | LinkedIn Learning | Tandem | SkillSwap |
|---|---|---|---|---|---|
| Peer-to-Peer Exchange | No | Partial | No | Yes (language only) | Yes (all skills) |
| Free to Use | No | Partial | No | Yes | Yes |
| Real-Time Messaging | No | No | No | Yes | Yes |
| Session Tracking | No | No | Yes (courses) | No | Yes |
| Contract/Agreement System | No | No | No | No | Yes |
| Admin Moderation | Yes | Yes | Yes | Yes | Yes |
| File Sharing in Chat | No | No | No | Yes | Yes |
| Multi-Provider Auth | Yes | Yes | Yes | Yes | Yes |
| Progress Visualisation | Yes | No | Yes | No | Yes |
| Open Source | No | No | No | No | Yes |

## 2.5 Research Gap

The literature survey reveals that while numerous platforms facilitate online learning and community building, a significant gap exists in the domain of structured, reciprocal skill exchange. Existing platforms either follow a one-directional instructor-to-learner model (Skillshare, LinkedIn Learning), focus exclusively on event coordination (Meetup), or are limited to specific skill categories (Tandem for languages). No existing platform combines the following capabilities in a single integrated solution:

1. Generalised skill exchange across all categories
2. Structured exchange contracts with session-level tracking
3. Integrated real-time messaging with file sharing
4. Automated progress tracking and completion detection
5. Administrative moderation with real-time enforcement

SkillSwap addresses this gap by providing a comprehensive platform that unifies skill discovery, structured exchange agreements, real-time communication, and administrative oversight within a single, cohesive application.

## 2.6 Summary

This chapter has reviewed the existing landscape of peer learning platforms and the technologies employed in the development of SkillSwap. The literature survey confirms the novelty of the reciprocal skill exchange model with integrated contract and session tracking, establishing SkillSwap as a meaningful contribution to the domain of collaborative online learning.

---

# CHAPTER 3: SYSTEM ANALYSIS

## 3.1 Existing System

The existing landscape for peer-to-peer skill exchange is characterised by fragmented, ad-hoc approaches that lack formal structure and digital support. Currently, individuals seeking to exchange knowledge rely upon the following methods:

1. **Social Media Groups**: Facebook groups, Reddit communities, and Discord servers serve as informal hubs where learners post requests for skill exchange. However, these platforms are not purpose-built for structured learning arrangements. Conversations are ephemeral, progress is untracked, and there is no mechanism for accountability or session documentation.

2. **Freelancing Platforms**: Websites such as Fiverr and Upwork facilitate service exchange but operate on a monetary transaction model. They do not support barter-based skill exchange, and their review systems are designed for client-contractor relationships rather than peer learning partnerships.

3. **University Bulletin Boards**: Physical and digital notice boards within educational institutions allow students to post requests for tutoring or study partners. These systems lack real-time communication capabilities, automated matching, and any form of progress tracking.

4. **Direct Personal Networks**: The most common method of skill exchange occurs through personal contacts—friends, colleagues, and acquaintances. While this approach benefits from pre-existing trust, it is severely limited in scale, discovery, and diversity of available skills.

### 3.1.1 Limitations of the Existing System

- No dedicated platform for reciprocal skill exchange
- No structured contract or agreement system for exchanges
- No session-level tracking or completion verification
- Fragmented communication across multiple tools
- No administrative oversight or moderation capabilities
- No real-time notifications for exchange activities
- No standardised skill categorisation or proficiency levels
- No file sharing integrated within the learning context
- Limited discoverability of complementary skill sets

## 3.2 Proposed System

The proposed system, SkillSwap, addresses the limitations identified above by providing an integrated, purpose-built platform for peer-to-peer skill exchange. The system is designed around five core functional pillars:

### 3.2.1 User Management Pillar

The system provides a comprehensive user management module encompassing multi-provider authentication (Email/Password, Google OAuth 2.0, GitHub OAuth), profile creation and editing with structured skill declarations, avatar customisation through a preset avatar selection system, and real-time online status tracking. Each user profile stores two arrays of structured skill objects—skills offered and skills wanted—each containing the skill name, category classification, and proficiency level (Beginner, Intermediate, Advanced, Expert).

### 3.2.2 Skill Discovery Pillar

A dedicated Browse Skills page aggregates skills offered by all users in real-time, presenting them as browsable skill cards with owner information. The system supports filtering by category (Engineering, Design, Science, Languages, Business, Creative), filtering by proficiency level, and text-based search across skill names. A trending skills section on the dashboard highlights the most requested skills based on exchange request counts.

### 3.2.3 Communication Pillar

An integrated real-time messaging system enables one-to-one conversations between connected users. The messaging module supports text messages, image attachments (JPEG, PNG, GIF, WebP), and document attachments (PDF, DOCX) uploaded via Cloudinary. Messages are stored in Firestore sub-collections with real-time snapshot listeners ensuring instantaneous delivery. Unread message counts are tracked per-user per-conversation and displayed as badge indicators.

### 3.2.4 Exchange Management Pillar

The exchange management system introduces two interconnected Firestore collections:
- **Exchange Contracts** (`exchangeContracts`): Formal agreements between two users specifying the skills to be exchanged, duration in weeks, total number of sessions, and lifecycle status (pending → active → completed/cancelled).
- **Exchange Sessions** (`exchangeSessions`): Individual session records within a contract, each documenting the topic, teacher, scheduled time, completion status, notes, and optional proof URL.

The system implements automatic contract completion—when the number of completed sessions equals the total sessions specified in the contract, the contract status is atomically updated to "completed" and both parties are notified.

### 3.2.5 Administration Pillar

An administrative dashboard provides platform moderators with tools for user management (view all users, ban/unban), report management (view user-submitted reports, update status), issue tracking (view help requests, update status), and warning issuance (send warnings with real-time toast notifications to the target user). The admin interface uses role-based access control, with the `isAdmin` flag stored in the user's Firestore document.

### 3.2.3 Advantages of the Proposed System

- Purpose-built platform eliminating the need for multiple tools
- Structured exchange contracts with accountability
- Session-level progress tracking with visual indicators
- Integrated real-time messaging with file sharing
- Automated contract completion detection
- Real-time notification system with typed alerts
- Administrative moderation for platform safety
- Multi-provider authentication for convenience
- Responsive design supporting desktop and mobile devices
- Deployed on Firebase Hosting for global accessibility

## 3.3 Feasibility Study

### 3.3.1 Technical Feasibility

The project employs well-established, production-grade technologies. React.js (v19) is one of the most widely adopted frontend frameworks with extensive community support and documentation. Firebase provides a fully managed backend infrastructure eliminating the need for server provisioning, database administration, and scaling configuration. Tailwind CSS v4 offers a mature styling solution with built-in responsive design utilities. All selected technologies are open-source or offer generous free tiers sufficient for the project's scale.

### 3.3.2 Operational Feasibility

The application requires no specialised training for end users. The user interface follows established web application conventions—standard navigation patterns, form-based inputs, and familiar chat interfaces. The administrative dashboard provides intuitive controls for moderation tasks. The platform is accessible through any modern web browser without requiring software installation.

### 3.3.3 Economic Feasibility

The entire technology stack operates within free-tier limits for development and small-scale deployment. Firebase's Spark plan provides free authentication, 1 GiB Firestore storage, 10 GiB hosting bandwidth, and 50,000 daily read operations. Cloudinary's free tier provides 25 monthly transformation credits and 25 GB storage. Vite and React are fully open-source. The total development cost is limited to developer time, with zero infrastructure expenditure for initial deployment.

## 3.4 System Requirements

### 3.4.1 Hardware Requirements

**Development Environment:**
- Processor: Intel Core i5 or equivalent (minimum)
- RAM: 8 GB (minimum), 16 GB (recommended)
- Storage: 500 MB free disk space for project files
- Display: 1920×1080 resolution (recommended)
- Network: Broadband internet connection

**Deployment Environment:**
- Firebase Hosting (Google Cloud infrastructure)
- No dedicated server hardware required

**Client Environment:**
- Any device with a modern web browser
- Minimum 2 GB RAM
- Internet connectivity

### 3.4.2 Software Requirements

**Development Tools:**
| Software | Version | Purpose |
|---|---|---|
| Node.js | 18.x or higher | JavaScript runtime |
| npm | 9.x or higher | Package manager |
| Visual Studio Code | Latest | Code editor |
| Git | 2.x or higher | Version control |
| Google Chrome / Firefox | Latest | Testing browser |

**Frontend Framework and Libraries:**
| Library | Version | Purpose |
|---|---|---|
| React | 19.2.5 | UI component library |
| React DOM | 19.2.5 | React rendering engine |
| React Router DOM | 7.15.0 | Client-side routing |
| Framer Motion | 12.38.0 | Animation library |
| Lucide React | 1.14.0 | Icon library |
| Tailwind CSS | 4.3.0 | Utility-first CSS framework |
| Axios | 1.16.0 | HTTP client |
| clsx | 2.1.1 | Conditional class names |
| tailwind-merge | 3.5.0 | Tailwind class merging |

**Backend Services:**
| Service | Version | Purpose |
|---|---|---|
| Firebase | 12.13.0 | BaaS (Auth, Firestore, Hosting) |
| Firebase Tools | 15.17.0 | CLI for deployment |
| Cloudinary | Cloud API | File upload and CDN |

**Build Tools:**
| Tool | Version | Purpose |
|---|---|---|
| Vite | 8.0.10 | Build tool and dev server |
| @vitejs/plugin-react | 6.0.1 | React fast refresh |
| @tailwindcss/vite | 4.3.0 | Tailwind CSS Vite plugin |
| ESLint | 10.2.1 | Code linting |
| PostCSS | 8.5.14 | CSS post-processing |
| Autoprefixer | 10.5.0 | CSS vendor prefixing |

### 3.4.3 Functional Requirements

1. **FR-01**: The system shall allow users to register using email/password, Google, or GitHub.
2. **FR-02**: The system shall maintain user profiles with skills offered, skills wanted, bio, and avatar.
3. **FR-03**: The system shall display a browsable catalogue of skills offered by all users.
4. **FR-04**: The system shall support filtering skills by category and proficiency level.
5. **FR-05**: The system shall allow users to send exchange requests to skill owners.
6. **FR-06**: The system shall prevent duplicate exchange requests between the same pair of users.
7. **FR-07**: The system shall allow recipients to accept or reject exchange requests.
8. **FR-08**: Upon acceptance, the system shall automatically create a chat conversation.
9. **FR-09**: The system shall provide real-time one-to-one messaging with file attachments.
10. **FR-10**: The system shall allow users to create exchange contracts with session specifications.
11. **FR-11**: The system shall track individual session completion with notes and proof URLs.
12. **FR-12**: The system shall automatically mark contracts as completed when all sessions are done.
13. **FR-13**: The system shall provide real-time notifications for all significant events.
14. **FR-14**: The system shall allow administrators to ban/unban users and issue warnings.
15. **FR-15**: The system shall enforce bans in real-time, preventing banned users from accessing protected routes.

### 3.4.4 Non-Functional Requirements

1. **NFR-01**: The system shall render pages within 2 seconds under normal network conditions.
2. **NFR-02**: The system shall deliver real-time messages within 500 milliseconds of sending.
3. **NFR-03**: The system shall be responsive across screen sizes from 320px to 2560px.
4. **NFR-04**: The system shall support concurrent usage by at least 100 users.
5. **NFR-05**: The system shall encrypt all authentication tokens using Firebase's built-in security.
6. **NFR-06**: The system shall maintain 99.9% uptime through Firebase Hosting SLA.
7. **NFR-07**: The system shall provide accessible UI elements with appropriate ARIA semantics.

---

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

---

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

---

# CHAPTER 6: TESTING

## 6.1 Testing Methodology

Testing of the SkillSwap platform was conducted using a combination of unit-level functional testing, integration testing across module boundaries, and system-level end-to-end testing. Given the real-time nature of the application and its dependency on Firebase cloud services, testing emphasised functional correctness, data integrity, and user experience validation through manual testing procedures supplemented by browser-based verification.

## 6.2 Test Cases and Results

### 6.2.1 Authentication Module Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-01 | Email/Password Registration | Enter valid email, password, full name → Submit | Account created, redirect to dashboard | Account created, profile initialised, redirected | PASS |
| TC-02 | Duplicate Email Registration | Register with already-used email | Error message displayed | "Email already in use" error shown | PASS |
| TC-03 | Email/Password Login | Enter valid credentials → Submit | Successful login, dashboard loads | Logged in, profile loaded, online status set | PASS |
| TC-04 | Invalid Password Login | Enter valid email, wrong password | Error message displayed | "Invalid credentials" toast shown | PASS |
| TC-05 | Google OAuth Login | Click "Sign in with Google" → Select account | Successful login, profile created if new | Profile created/updated, dashboard loaded | PASS |
| TC-06 | GitHub OAuth Login | Click "Sign in with GitHub" → Authorise | Successful login, profile created if new | Profile created/updated, dashboard loaded | PASS |
| TC-07 | Banned User Login | Login as banned user | Rejection with ban message | Sign-out forced, ban message displayed | PASS |
| TC-08 | Real-time Ban Enforcement | Ban user while they are active | Immediate forced logout | Session terminated, redirected to login | PASS |
| TC-09 | Logout Functionality | Click logout button | Session cleared, redirected | Online status set false, session cleared | PASS |
| TC-10 | Session Persistence | Close and reopen browser tab | Session restored if not expired | Auth state restored, profile loaded | PASS |

### 6.2.2 Skill Management Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-11 | Add Skill to Profile | Profile → Add skill with name, category, level | Skill appears in profile and Browse page | Skill saved, visible in real-time on Browse | PASS |
| TC-12 | Browse Skills Page Loading | Navigate to /browse | All skills from all users displayed | Skills aggregated from user profiles correctly | PASS |
| TC-13 | Category Filter | Select "Engineering" filter | Only engineering skills shown | Filter applied correctly | PASS |
| TC-14 | Level Filter | Select "Advanced" filter | Only advanced-level skills shown | Filter applied correctly | PASS |
| TC-15 | Search Functionality | Type "React" in search box | Skills matching "React" displayed | Search filters correctly in real-time | PASS |
| TC-16 | Send Exchange Request | Click request button on a skill card | Request created, notification sent | Request created, receiver notified | PASS |
| TC-17 | Duplicate Request Prevention | Send request to same user twice | Second request blocked | "Already sent" message shown | PASS |

### 6.2.3 Messaging Module Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-18 | Send Text Message | Type message → Send | Message appears in both users' views | Message delivered in real-time | PASS |
| TC-19 | Send Image Attachment | Click attach → Select image → Send | Image uploaded and displayed inline | Cloudinary upload, thumbnail rendered | PASS |
| TC-20 | Send Document Attachment | Click attach → Select PDF → Send | Document uploaded with download link | PDF uploaded, download link shown | PASS |
| TC-21 | Delete Own Message | Hover message → Click delete → Confirm | Message removed from chat | Message deleted from Firestore | PASS |
| TC-22 | Unread Count Tracking | Receive message while in different chat | Badge shows unread count | Unread count incremented and displayed | PASS |
| TC-23 | Mark Conversation as Read | Click on conversation with unread messages | Unread count resets to 0 | Counter reset on conversation open | PASS |

### 6.2.4 Contract and Session Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-24 | Create Contract | Click "Contract" on accepted request → Fill form | Contract created with "pending" status | Contract saved, partner skills auto-filled | PASS |
| TC-25 | Accept Contract | Partner clicks "Accept" on pending contract | Status changes to "active" | Status updated, startedAt recorded | PASS |
| TC-26 | Reject Contract | Partner clicks "Decline" | Status changes to "cancelled" | Contract cancelled | PASS |
| TC-27 | Add Session | Click "Add Session" → Enter topic, teacher, time | Session created with "pending" status | Session added to timeline | PASS |
| TC-28 | Complete Session | Click "Complete" → Add notes → Submit | Session marked complete, counter incremented | Session completed, progress bar updated | PASS |
| TC-29 | Auto-Complete Contract | Complete all sessions in a contract | Contract status becomes "completed" | Automatic completion with notifications | PASS |
| TC-30 | Progress Bar Accuracy | Complete 3 of 8 sessions | Progress shows 37.5% | Progress bar width matches ratio | PASS |

### 6.2.5 Admin Module Testing

| Test ID | Test Case | Steps | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-31 | View All Users | Navigate to /admin | All users listed with status | User list loaded with ban/warning counts | PASS |
| TC-32 | Ban User | Click "Ban" on a user | User banned, forced logout | isBanned set true, user signed out | PASS |
| TC-33 | Unban User | Click "Unban" on banned user | User can login again | isBanned set false, login successful | PASS |
| TC-34 | Send Warning | Select user → Enter warning → Send | Warning saved, toast shown to user | Warning in Firestore, toast on user's screen | PASS |
| TC-35 | View Reports | Navigate to Reports tab | All user reports displayed | Reports listed with status management | PASS |

### 6.2.6 Responsive Design Testing

| Test ID | Test Case | Resolution | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| TC-36 | Desktop Layout | 1920×1080 | Sidebar visible, multi-column grids | Layout rendered correctly | PASS |
| TC-37 | Tablet Layout | 768×1024 | Sidebar collapsed, 2-column grids | Responsive breakpoints applied | PASS |
| TC-38 | Mobile Layout | 375×667 | Hamburger menu, single-column | Mobile layout with slide-over sidebar | PASS |

## 6.3 Testing Summary

A total of 38 test cases were executed across six modules. All test cases passed successfully, confirming the functional correctness of the authentication system, skill management workflow, real-time messaging, contract lifecycle, administrative moderation, and responsive design implementation.

---

# CHAPTER 7: SCREENSHOTS AND EXPLANATIONS

## 7.1 Landing Page (Home.jsx)

The landing page serves as the entry point for unauthenticated users, featuring a hero section with gradient text, animated statistics counters, a three-step "How It Works" guide, community member previews, a testimonial quote, and a call-to-action footer. The page employs Framer Motion's `whileInView` animations for scroll-triggered entrance effects and a glassmorphic "Active Session" preview panel demonstrating the platform's chat functionality.

## 7.2 Login Page (Login.jsx)

The login page provides three authentication methods: email/password form with validation, Google OAuth button, and GitHub OAuth button. The form employs the glass-panel design with cyan focus rings on input fields. Error messages, including ban notifications, are displayed using the toast notification system. A link to the signup page is provided for new users.

## 7.3 Signup Page (Signup.jsx)

The registration page collects user information (full name, email, password, confirm password, gender selection) and creates both a Firebase Authentication account and a Firestore user profile document. The gender selection determines the default avatar preset. Form validation prevents submission with empty fields, mismatched passwords, or weak passwords.

## 7.4 Dashboard (Dashboard.jsx)

The dashboard presents a comprehensive overview with four stat cards (Skills Offered, Active Requests, Completed Exchanges, Connections), a search bar, a Trending Skills section displaying the four most-requested skills, an Exchange Requests feed showing pending incoming requests, a Suggested People sidebar with connection actions, a Recent Activity Timeline, and an Active Contracts section showing in-progress exchange agreements with progress bars.

## 7.5 Browse Skills Page (BrowseSkills.jsx)

This page aggregates skills from all user profiles into browsable cards. Each card displays the skill title, category badge, proficiency level, owner name, owner avatar, and a "Request Exchange" button. Dual filter dropdowns (Category and Level) and a search input allow refinement. The page employs real-time Firestore listeners, ensuring newly added skills appear without page refresh.

## 7.6 Requests Page (Requests.jsx)

The requests management page features three tabs with animated underline indicators: Pending (incoming requests with Accept/Decline actions), Accepted (established connections with Message and Contract buttons), and Sent (outgoing requests with status badges). Each request row displays the peer's avatar, name, skill title, and relative timestamp.

## 7.7 Chat Page (Chat.jsx)

The messaging interface employs a two-panel layout: a conversation list panel on the left and a message area on the right. The message area includes a scrollable message timeline with alternating bubble alignment (sent right, received left), an attachment upload button with drag-and-drop support, a message input with Enter-to-send functionality, and individual message deletion via hover-reveal trash icons.

## 7.8 Profile Page (Profile.jsx)

The profile page features an editable user card with avatar display, an avatar selection modal with animated preset grid, editable bio text area, and dual skill management sections (Skills Offered and Skills Wanted). Each skill entry uses structured input fields for name, category dropdown, and level dropdown, enabling precise skill metadata.

## 7.9 Contracts Page (Contracts.jsx)

The contract management page features four status tabs (Active, Pending, Completed, Cancelled) with count badges, a search input, and a "New Contract" button. Each ContractCard displays both parties' names, the skills being exchanged (You Teach / You Learn), an animated progress bar, session count, duration, status badge, and contextual action buttons (Accept/Decline for pending, Sessions link for active, Cancel option).

## 7.10 Sessions Page (SessionsPage.jsx)

The session tracking page displays a contract summary header (partner name, status, skills exchange, overall progress bar) followed by a vertical timeline of individual sessions. Each SessionCard shows the session number, topic, teacher name, scheduled date, completion status, notes panel, and proof URL link. An inline "Add Session" form allows scheduling new sessions with topic, teacher selection, and datetime-local input.

## 7.11 Admin Dashboard (AdminDashboard.jsx)

The administrative panel features four tabs: Users (list with ban/unban toggles, warning counts), Reports (user-submitted reports with status management), Issues (help requests with status tracking), and a statistics overview. The admin interface is protected by both ProtectedRoute (authentication) and AdminRoute (isAdmin flag) guards.

---

# CHAPTER 8: CONCLUSION AND FUTURE ENHANCEMENTS

## 8.1 Conclusion

The SkillSwap – Peer-to-Peer Skill Exchange Platform has been successfully designed, developed, and deployed as a comprehensive web application that addresses the identified gap in structured reciprocal skill exchange. The platform enables users to discover complementary skills, initiate exchange requests, communicate through integrated real-time messaging, formalise their learning agreements through structured contracts, track individual session progress, and achieve documented learning outcomes.

The project demonstrates proficiency in modern web development technologies and practices, including React.js component architecture, Firebase serverless backend integration, real-time data synchronisation with Firestore snapshot listeners, multi-provider OAuth authentication, responsive UI design with Tailwind CSS and Framer Motion, and cloud-based file management through Cloudinary.

Key technical achievements of the project include:

1. **Real-time Architecture**: All data-driven views (messages, requests, contracts, sessions, notifications) employ Firestore real-time listeners, eliminating polling and ensuring sub-second data propagation.
2. **Automated Lifecycle Management**: The contract auto-completion system atomically detects when all sessions are fulfilled and transitions the contract to a completed state with bilateral notifications.
3. **Multi-layer Security**: The ban enforcement system operates at three levels (login-time check, session-restore check, real-time profile listener), ensuring banned users cannot access the platform under any circumstance.
4. **Design System Consistency**: A centralised CSS design system with custom properties, typography scales, and component classes ensures visual coherence across 15 pages and 21 components.

The application has been deployed on Firebase Hosting with client-side routing support, making it accessible as a production-grade web application.

## 8.2 Future Enhancements

The following enhancements are proposed for future iterations of the platform:

1. **Video Calling Integration**: Integrate WebRTC-based video calling through services such as Daily.co or Twilio to enable live skill-teaching sessions directly within the platform, eliminating the need for external video conferencing tools.

2. **AI-Powered Skill Matching**: Implement a recommendation engine using natural language processing to analyse user skill profiles and suggest optimal exchange partners based on complementary skill sets, learning goals, and availability patterns.

3. **Rating and Review System**: Introduce a bidirectional rating system allowing users to rate their exchange partners upon contract completion, building a trust-based reputation layer that enhances partner selection confidence.

4. **Google Calendar Integration**: Enable automatic calendar event creation for scheduled sessions, with reminders and rescheduling capabilities, improving session adherence rates.

5. **Progressive Web App (PWA)**: Convert the application to a PWA with service worker caching, offline support, and push notifications for mobile devices, providing a native app-like experience without app store distribution.

6. **Advanced Analytics Dashboard**: Provide users with learning analytics including skills learned over time, session completion rates, hours exchanged, and proficiency growth trajectories visualised through interactive charts.

7. **Group Skill Exchanges**: Extend the platform to support multi-party skill exchange groups where three or more users form a learning circle, each teaching and learning different skills within the same agreement.

8. **Gamification Elements**: Introduce achievement badges, learning streaks, skill mastery levels, and leaderboards to incentivise consistent participation and platform engagement.

9. **Internationalisation (i18n)**: Add multi-language support to enable adoption across non-English-speaking communities, expanding the platform's accessibility and user base.

10. **Mobile Native Application**: Develop dedicated iOS and Android applications using React Native, sharing the existing Firebase backend and service layer while providing optimised mobile interfaces.

---

# REFERENCES

1. React.js Official Documentation, Meta Platforms Inc. Available at: https://react.dev/

2. Firebase Documentation, Google LLC. Available at: https://firebase.google.com/docs

3. Cloud Firestore Documentation, Google LLC. Available at: https://firebase.google.com/docs/firestore

4. Tailwind CSS v4 Documentation. Available at: https://tailwindcss.com/docs

5. Framer Motion Documentation, Framer B.V. Available at: https://motion.dev/

6. Vite Documentation, Evan You. Available at: https://vite.dev/

7. React Router v7 Documentation. Available at: https://reactrouter.com/

8. Cloudinary Documentation. Available at: https://cloudinary.com/documentation

9. Lucide Icons Documentation. Available at: https://lucide.dev/

10. Firebase Authentication Documentation, Google LLC. Available at: https://firebase.google.com/docs/auth

11. Sommerville, I. (2015). "Software Engineering", 10th Edition. Pearson Education Limited.

12. Pressman, R.S. and Maxim, B.R. (2020). "Software Engineering: A Practitioner's Approach", 9th Edition. McGraw-Hill Education.

13. Flanagan, D. (2020). "JavaScript: The Definitive Guide", 7th Edition. O'Reilly Media.

14. Banks, A. and Porcello, E. (2020). "Learning React: Modern Patterns for Developing React Apps", 2nd Edition. O'Reilly Media.

15. Firebase Web SDK API Reference, Google LLC. Available at: https://firebase.google.com/docs/reference/js
