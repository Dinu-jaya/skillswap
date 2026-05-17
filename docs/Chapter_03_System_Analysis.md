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
