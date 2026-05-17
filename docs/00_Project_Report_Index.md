# ABSTRACT

SkillSwap is a peer-to-peer skill exchange platform developed as a web application to facilitate reciprocal knowledge transfer among individuals. The platform addresses the absence of a structured, dedicated system for barter-based skill exchange by providing integrated modules for skill discovery, exchange request management, real-time messaging with file sharing, formalised exchange contracts with session-level tracking, and administrative moderation. Built using React.js 19, Firebase (Authentication and Cloud Firestore), Tailwind CSS 4, and Framer Motion, the application follows a serverless architecture with real-time data synchronisation. The system supports multi-provider authentication (Email, Google, GitHub), automated contract lifecycle management with completion detection, and a typed notification system. The platform has been deployed on Firebase Hosting and demonstrates the viability of structured peer-learning exchange as an alternative to traditional paid educational models.

**Keywords**: Peer-to-peer learning, Skill exchange, React.js, Firebase, Cloud Firestore, Real-time web application, Collaborative learning

---

# TABLE OF CONTENTS

1. [Chapter 1: Introduction](./Chapter_01_Introduction.md)
   - 1.1 Project Overview
   - 1.2 Problem Statement
   - 1.3 Objectives
   - 1.4 Scope of the Project
   - 1.5 Motivation
   - 1.6 Organisation of the Report

2. [Chapter 2: Literature Survey](./Chapter_02_Literature_Survey.md)
   - 2.1 Introduction
   - 2.2 Review of Existing Peer Learning Platforms
   - 2.3 Review of Technologies
   - 2.4 Comparison of Existing Systems
   - 2.5 Research Gap
   - 2.6 Summary

3. [Chapter 3: System Analysis](./Chapter_03_System_Analysis.md)
   - 3.1 Existing System
   - 3.2 Proposed System
   - 3.3 Feasibility Study
   - 3.4 System Requirements

4. [Chapter 4: System Design](./Chapter_04_System_Design.md)
   - 4.1 System Architecture
   - 4.2 Data Flow Architecture
   - 4.3 Database Design
   - 4.4 Module Design
   - 4.5 User Interface Design Principles
   - 4.6 Routing Architecture

5. [Chapter 5: Implementation](./Chapter_05_Implementation.md)
   - 5.1 Development Environment Setup
   - 5.2 Project Directory Structure
   - 5.3 Module-Wise Implementation
   - 5.4 Frontend Implementation
   - 5.5 Deployment

6. [Chapter 6-8: Testing, Screenshots, Conclusion](./Chapter_06_07_08_Testing_Conclusion.md)
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
