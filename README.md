# 🚀 LX-Downloader

<div align="center">

  <img src="https://raw.githubusercontent.com/hariyanivaidehi/LX-Downloader/main/src/app/icon.svg" alt="LX-Downloader Logo" width="90" height="90" />

  <h3>The Ultimate High-Performance Media Downloader</h3>
  <p>Download HD Videos, Reels, Stories, Photos & Audio from <b>Instagram</b> and <b>YouTube</b> with instant server-side muxing, zero quality loss, and 100% free unlimited access.</p>

  <p>
    <a href="https://lx-downloader.vercel.app" target="_blank">
      <img src="https://img.shields.io/badge/🚀%20Live%20Demo-lx--downloader.vercel.app-0070F3?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo" />
    </a>
  </p>

  <p>
    <a href="https://github.com/hariyanivaidehi/LX-Downloader/stargazers"><img src="https://img.shields.io/github/stars/hariyanivaidehi/LX-Downloader?style=flat-square&color=blue" alt="Stars" /></a>
    <a href="https://github.com/hariyanivaidehi/LX-Downloader/network/members"><img src="https://img.shields.io/github/forks/hariyanivaidehi/LX-Downloader?style=flat-square&color=blue" alt="Forks" /></a>
    <a href="https://github.com/hariyanivaidehi/LX-Downloader/issues"><img src="https://img.shields.io/github/issues/hariyanivaidehi/LX-Downloader?style=flat-square&color=emerald" alt="Issues" /></a>
    <a href="https://github.com/hariyanivaidehi/LX-Downloader/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License" /></a>
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome" />
  </p>

</div>

---

## 📑 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [Instagram Downloader](#-instagram-downloader)
  - [YouTube Downloader](#-youtube-downloader)
  - [User Experience & UI](#-user-experience--ui)
- [Architecture & Tech Stack](#-architecture--tech-stack)
- [Live Demo](#-live-demo)
- [Quick Start](#-quick-start)
  - [Prerequisites](#prerequisites)
  - [One-Click Windows Start](#1-one-click-start-windows)
  - [Manual Development Setup](#2-manual-setup)
- [API Reference](#-api-reference)
- [Authors & Core Contributors](#-authors--core-contributors)
- [Disclaimer](#-disclaimer)

---

## 🌟 Overview

**LX-Downloader** is a modern, responsive full-stack web application designed to eliminate common frustrations with online media downloaders—such as broken audio/video streams, rate-throttling, deceptive redirects, and corrupted preview metadata.

Built with **Next.js 16 (Turbopack)** and a robust **Python FastAPI** backend powered by `yt-dlp` and `ffmpeg`, LX-Downloader merges separate high-definition video and audio streams server-side and embeds the `moov` atom at the beginning of MP4 files (`-movflags +faststart`). This ensures that downloaded videos play seamlessly across all devices and media players with instant thumbnail previews in Windows Explorer and mobile galleries.

---

## ✨ Key Features

### 📸 Instagram Downloader
- **Username Media Explorer**: Search any public Instagram `@username` or handle to view full profile stats, HD profile picture (DP), and browse categorized media tabs (**Reels, Posts, Stories, Highlights**) with one-click direct downloads.
- **Reels Downloader**: Save trending Reels in maximum available bitrate (1080p / 720p MP4).
- **Post & Photo Saver**: Download single images, multi-image carousel albums, and video posts.
- **Story & Highlight Saver**: Fetch public Instagram Stories and Highlights with metadata.
- **Profile Picture (DP) Viewer**: View and download full-resolution profile avatars.

### 🎥 YouTube Downloader
- **Multi-Format Selection**: Choose between **Full HD (1080p)**, **HD (720p)**, **Standard (360p)**, or **MP3 Audio (320kbps)**.
- **YouTube Shorts**: First-class support for vertical 9:16 Shorts with adaptive player sizing.
- **Server-Side FFmpeg Muxing**: Automatically solves YouTube's separate DASH audio/video streams, merging them into a unified, synchronous MP4 file.
- **Faststart MP4 Processing**: Places the MP4 `moov` atom in the first 4KB of the file for instant seeking and native Windows/Android thumbnail generation.
- **n-sig Challenge Solver**: Integrates Node.js runtime challenge solver into `yt-dlp` to bypass YouTube rate-limiting (50 KB/s throttle).

### 🎨 User Experience & UI
- **Real-Time Download Feedback**:
  - Live in-place warning banner: `⏳ Downloading video... Please wait, do not leave this page!`
  - Animated progress bar and percentage tracking.
  - Success banner upon completion: `✅ Download Completed! Video has been saved to your device.`
  - Dynamic button switching to **`DOWNLOAD AGAIN`** after completion.
  - Prominent, easy-to-use **`Clear Result`** action button.
- **Rich Media Preview Card**:
  - HD thumbnail cover with video duration badge and channel info.
  - One-click glowing play button overlay to switch to the interactive player.
  - Adaptive aspect ratio: 9:16 for Shorts and 16:9 for standard videos.
- **100% Fully Responsive Layout**: Tailored for mobile smartphones (iPhone, Android), tablets, and desktops with zero horizontal overflow.
- **Multi-Language Regional Localization**: Real-time client-side switching with zero page refresh across 7 regional Indian languages:
  - English 🇬🇧 | हिन्दी (Hindi) 🇮🇳 | বাংলা (Bengali) 🇮🇳 | తెలుగు (Telugu) 🇮🇳 | ಕನ್ನಡ (Kannada) 🇮🇳 | മലയാളം (Malayalam) 🇮🇳 | मराठी (Marathi) 🇮🇳
- **Smart Link Auto-Detection**: Pasting a YouTube link or Instagram link automatically switches to the correct platform and sub-tab without throwing validation errors.
- **Interactive FAQ & Step-by-Step Guide**: Accordion-style help center and intuitive 3-step walkthrough customized for each media type.
- **Sticky Glassmorphic Navbar**: Always-accessible header with blur backdrop and quick language switcher.
- **One-Tap Social Sharing**: Share tools on WhatsApp, Telegram, Facebook, and Instagram directly from the footer.

---

## 🛠️ Architecture & Tech Stack

```
LX-Downloader/
├── src/                      # Next.js 16 App Router (React 19, Tailwind CSS, Framer Motion)
│   ├── app/                  # Application routes, layout, and global styling
│   └── components/           # Modular Navbar, Footer, and UI elements
├── backend/                  # Python FastAPI Backend Engine
│   ├── main.py               # Core extractors, downloader proxy, and cache manager
│   ├── requirements.txt      # Python dependencies (fastapi, yt-dlp, imageio-ffmpeg)
│   └── run.py                # Uvicorn production server runner
├── api/                      # Serverless Python Entrypoint for Vercel Deployment
│   └── index.py              # Serverless bridge exporting FastAPI app
└── next.config.ts            # Proxy rewrites routing frontend API calls to FastAPI
```

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (Turbopack, App Router), [React 19](https://react.dev/) |
| **Styling & Icons** | [Tailwind CSS](https://tailwindcss.com/), [Lucide React](https://lucide.dev/) |
| **Motion & Animations** | [Framer Motion](https://www.framer.com/motion/) |
| **Backend Framework** | [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+), [Uvicorn](https://www.uvicorn.org/) |
| **Extraction & Media** | [yt-dlp](https://github.com/yt-dlp/yt-dlp), [imageio-ffmpeg](https://github.com/imageio/imageio-ffmpeg), [HTTPX](https://www.python-httpx.org/) |
| **Cloud Deployment** | [Vercel](https://vercel.com/) (Edge Serverless Functions) |

---

## 🌐 Live Demo

The production application is continuously deployed on Vercel:

👉 **[https://lx-downloader.vercel.app](https://lx-downloader.vercel.app)**

---

## ⚙️ Quick Start

### Prerequisites
- **Node.js**: v18.17+ or v20+ / v22+
- **Python**: 3.10, 3.11, 3.12, or 3.13
- **Git**: Installed and available in your terminal

### 1. One-Click Start (Windows)
Double-click `start.bat` in the root folder. It launches both the Python FastAPI backend on port `8000` and the Next.js dev server on port `3000`.

### 2. Manual Setup

#### Step 1: Clone the repository
```bash
git clone https://github.com/hariyanivaidehi/LX-Downloader.git
cd LX-Downloader
```

#### Step 2: Set up and start the Python Backend
```bash
# Create a virtual environment (optional but recommended)
python -m venv venv
venv\Scripts\activate   # On Windows
# source venv/bin/activate # On macOS / Linux

# Install backend dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on http://127.0.0.1:8000
python backend/run.py
```

#### Step 3: Set up and start the Next.js Frontend
In a new terminal window:
```bash
# Install frontend dependencies
npm install

# Start Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔌 API Reference

The backend provides high-performance endpoints accessible directly or via Next.js proxy rewrites (`/api/py/*`):

### `GET /api/extract`
Extracts metadata and downloadable URLs from a given media link.

**Query Parameters:**
- `url` (string, required): Full YouTube or Instagram link.

**Response Example:**
```json
{
  "success": true,
  "platform": "youtube",
  "type": "video",
  "video_id": "jNQXAC9IVRw",
  "title": "Me at the zoo",
  "author": "jawed",
  "thumbnail": "https://i.ytimg.com/vi/jNQXAC9IVRw/hqdefault.jpg",
  "duration": 19,
  "download_url": "https://www.youtube.com/watch?v=jNQXAC9IVRw&quality=720p",
  "options": [
    { "id": "720p", "label": "HD Video (720p)", "ext": "mp4", "url": "..." },
    { "id": "360p", "label": "Standard Video (360p)", "ext": "mp4", "url": "..." },
    { "id": "audio", "label": "High Quality Audio (MP3)", "ext": "mp3", "url": "..." }
  ]
}
```

### `GET /api/download`
Streams media to the client with `Content-Disposition: attachment` to trigger a native download.

**Query Parameters:**
- `url` (string): Direct media URL or YouTube URL.
- `video_id` (string, optional): YouTube video ID.
- `quality` (string, optional): `1080p`, `720p`, `360p`, or `audio`.
- `filename` (string, optional): File save name.

---

## 👥 Authors & Core Contributors

This platform is proudly engineered and maintained by:

<table align="center">
  <tr>
    <td align="center" width="250">
      <a href="https://github.com/YAGNIKHARIYANI">
        <img src="https://github.com/YAGNIKHARIYANI.png" width="100" style="border-radius: 50%" alt="Yagnik Hariyani" /><br />
        <b>Yagnik Hariyani</b>
      </a>
      <br />
      <a href="https://github.com/YAGNIKHARIYANI">GitHub</a> • <a href="https://www.linkedin.com/in/yagnik-hariyani-318620297">LinkedIn</a>
    </td>
    <td align="center" width="250">
      <a href="https://github.com/hariyanivaidehi">
        <img src="https://github.com/hariyanivaidehi.png" width="100" style="border-radius: 50%" alt="Vaidehi Hariyani" /><br />
        <b>Vaidehi Hariyani</b>
      </a>
      <br />
      <a href="https://github.com/hariyanivaidehi">GitHub</a> • <a href="https://www.linkedin.com/in/vaidehi-hariyani-15b0a4381">LinkedIn</a>
    </td>
  </tr>
</table>

---

## ⚖️ Disclaimer

**LX-Downloader** is an independent open-source utility created strictly for educational and personal archival purposes. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with **Instagram**, **Meta Platforms Inc.**, or **YouTube (Google LLC)**.

All media assets downloaded via this utility remain hosted on the original platforms' CDN servers and belong entirely to their respective copyright holders. Users are responsible for complying with the terms of service of each respective platform.

---

<div align="center">
  <sub>Built with ❤️ by Yagnik Hariyani & Vaidehi Hariyani • © 2026 LX-Downloader</sub>
</div>
