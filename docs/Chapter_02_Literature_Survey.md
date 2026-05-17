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
