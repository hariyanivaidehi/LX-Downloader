# LX-Downloader 🚀

**LX-Downloader** is a lightning-fast, secure, and completely free single-page web application with a high-performance **Python FastAPI** backend to download media assets from **Instagram** and **YouTube** in high definition.

---

## ✨ Features

- **Instagram Downloader**: Extract and save **Reels**, **Posts & Photos**, **Stories**, and **Profile DP** in original resolution.
- **YouTube Downloader**: Extract and save **HD Videos** and **Shorts** directly into downloadable MP4 formats.
- **Native Browser Downloads**: Python streaming proxy endpoint (`/api/download`) ensures files save directly to the device rather than playing in browser tabs.
- **Instant Language Transitions (No Page Refresh)**: Dynamic client-side query language switching with zero network reload delay. Fully supports regional Indian languages:
  - English 🇬🇧
  - हिन्दी (Hindi) 🇮🇳
  - বাংলা (Bengali) 🇮🇳
  - తెలుగు (Telugu) 🇮🇳
  - ಕನ್ನಡ (Kannada) 🇮🇳
  - മലയാളം (Malayalam) 🇮🇳
  - मराठी (Marathi) 🇮🇳
- **Modern Minimalist UI**: Clean, borderless layout with shadow-based cards, styled in Light Mode with high-contrast text metrics.
- **Fluid Scroll Motion**: Powered by Framer Motion, all sections fade and slide up smoothly as they enter the user's viewport on scroll.

---

## 🛠️ Tech Stack

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Backend**: [Python 3.10+](https://www.python.org/), [FastAPI](https://fastapi.tiangolo.com/), [Uvicorn](https://www.uvicorn.org/), [yt-dlp](https://github.com/yt-dlp/yt-dlp), [HTTPX](https://www.python-httpx.org/)

---

## ⚙️ Quick Start

### Option 1: One-Click Launch (Windows)
Double-click `start.bat` in the project root to start both the Python backend and Next.js frontend automatically!

### Option 2: Manual Start

1. **Clone repository**:
   ```bash
   git clone https://github.com/hariyanivaidehi/LX-Downloader.git
   cd LX-Downloader
   ```

2. **Start Python Backend**:
   ```bash
   pip install -r backend/requirements.txt
   python backend/run.py
   ```
   *Runs on `http://127.0.0.1:8000`*

3. **Start Next.js Frontend**:
   ```bash
   npm install
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 👥 Authors & Developers

This platform is proudly designed and developed by:
- **Yagnik Hariyani** ([GitHub](https://github.com/YAGNIKHARIYANI) | [LinkedIn](https://linkedin.com/in/yagnikhariyani))
- **Vaidehi Hariyani** ([GitHub](https://github.com/hariyanivaidehi) | [LinkedIn](https://linkedin.com/in/vaidehihariyani))

---

## ⚖️ Disclaimer

LX-Downloader is an independent utility tool and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms Inc., or YouTube. All downloaded media files belong to their respective owners and remain hosted on the original platforms' CDN servers.
