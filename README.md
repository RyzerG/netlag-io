# 📡 NETLAG.IO — Live Gaming Outage Detector

[![Build Status](https://img.shields.io/badge/build-passing-00ff87?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/)
[![Node Version](https://img.shields.io/badge/node-%3E%3D_18.0.0-38bdf8?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-c5a1ff?style=for-the-badge)](https://opensource.org/licenses/MIT)

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
