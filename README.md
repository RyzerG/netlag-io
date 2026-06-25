# 📡 NETLAG.IO — Live Gaming Outage Detector

[![Build Status](https://img.shields.io/badge/build-passing-00ff87?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D_18.0.0-38bdf8?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/STATUS-PROPRIETARY-c5a1ff?style=for-the-badge)](https://github.com/)

A real-time, responsive gaming telemetry dashboard built with Node.js and vanilla web stack elements. The platform features an active backend state machine that polls industry-standard corporate Statuspage APIs (including Epic Games and Discord) every 5 minutes to deliver true server connectivity logs, live global regional breakdowns, and interactive crowdsourced incident report telemetry.

---

## 🗺️ Table of Contents

- [🚀 Architecture & Live Core Loop](#-architecture--live-core-loop)
- [✨ Key Features](#-key-features)
- [🛠️ Tech Stack](#️-tech-stack)
- [📦 Directory Structure](#-directory-structure)
- [💻 Local Installation & Setup](#-local-installation--setup)
- [🌐 Cloud Deployment Guide (Render)](#-cloud-deployment-guide-render)
- [📜 License](#-license)

---

## 🚀 Architecture & Live Core Loop

Unlike basic static portfolio pages, NETLAG.IO uses a fully operational **Hybrid Polling Architecture** to combine public state telemetry with live crowd data:

```text
[ Epic Games / Discord APIs ] ──( 5 Min HTTPS Poll )──┐
                                                      ▼
[ Interactive User Browser  ] ──( POST /api/report )──┼─► [ Node.js Express Server ]
                                                      │           │
[ Major Platform Networks   ] ──( Live Fallback )─────┘           ▼
                                                          ( Returns Unified JSON Matrix )
                                                                  │
                                                                  ▼
                                                      [ Custom Frontend UI Render ]
                                                      • Glowing Inline SVG Sparklines
                                                      • Distributed Region Pills
```

1. Automated Polling Stacks: The Node.js backend initializes an automated asynchronous timer (setInterval) that hits public ecosystem API status vectors every 300,000ms.

2. True Historical State Tracing: Rather than randomizing layout animations on the frontend, the backend maintains a scrolling memory buffer (capped at 15 intervals) tracking exact system stress variables.

3. Crowdsourced Event Telemetry: When users encounter game instability and click "REPORT ISSUES", a structural client payload triggers a POST interaction back to the runtime server. The backend processes the outcry, alters localized indicators instantly, and computes distributed routing failure simulations across regional zones (US, EU, ASIA).

## ✨ Key Features
- Live API Synchronization: Actively aggregates infrastructure states from enterprise production platforms (Fortnite, Rocket League, Discord).
- Unified Network Grid: Dedicated status strip pinned to the crown header displaying real-time connectivity status bars for Steam, PlayStation, Xbox, and Discord.
- Procedural Inline SVG Sparklines: Renders mathematical canvas layouts natively on the frontend via customized scaling vectors that adapt instantly to system load spikes without relying on bulky external graph dependencies.
- Global Server Matrix Separation: Visualizes target stability context utilizing regional nodes, mapping micro-states dynamically between global endpoints to simulate true distributed cloud topology.
- Cyber-Gaming Aesthetics: Polished, responsive dark layout designed with responsive CSS Grid layouts, variable glow tokens, unified badge boundaries, and crisp Font Awesome vector icons.

## 🛠️ Tech Stack
- Backend Interface: Node.js, Express Framework
- Network Communications: Native Node HTTPS Protocol (API Polling Context)
- Frontend Foundations: HTML5 Semantic Layout, Vanilla ECMAScript Core (JavaScript)
- Styling Architecture: Modern CSS3 (Custom Grid Layouts, Dynamic Flex Elements, Native Variables, Web Animations)
- Visual Vector Assets: Font Awesome Core Iconography, Pure SVG Line Matrix Canvas Graph Generators

## 📦 Directory Structure
```text
netlag-io/
├── server.js              # Node.js/Express Backend & API Polling Loop
├── package.json           # Active Project Manifest & NPM Package Rules
├── package-lock.json      # Hardlocked Module Dependency Trees
└── public/                # Static Web Assets Serving Folder
    ├── index.html         # Application Skeleton Layout
    ├── style.css          # Cyberpunk Theme Layout, Layout Tokens, & Responsive Grids
    └── app.js             # Core UI Engine, SVG Math Graphs, & Fetch Polling Logic
```

## 💻 Local Installation & Setup
Follow these quick commands to spin up the platform on your local desktop machine environment:

1. Clone the repository:

```Bash
git clone https://github.com/RyzerG/netlag-io.git
cd netlag-io
```

2. Install project dependencies:

```Bash
npm install
```

3. Boot the localized development engine:

```Bash
npm start
```

4. Access the application:
Open your preferred browser engine and point your active tab to: http://localhost:3000

## 📜 License
This project is currently private and not open-source. All rights reserved to the original author. Unauthorized distribution or reproduction of this software is strictly prohibited. You may use this software for personal educational purposes only. For commercial use or collaboration inquiries, please contact the author directly.