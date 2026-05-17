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
