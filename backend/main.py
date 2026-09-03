import re
import html
import urllib.parse
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
import httpx
import requests
import yt_dlp

app = FastAPI(
    title="LX-Downloader API",
    description="High-performance backend API for Instagram and YouTube media extraction and streaming downloads.",
    version="1.1.0",
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CRAWLER_HEADERS = {
    "User-Agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

GOOGLEBOT_HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}


def sanitize_filename(name: str, ext: str = "mp4") -> str:
    """Create a clean safe filename for browser downloads."""
    clean = re.sub(r'[\\/*?:"<>|]', "", name).strip()
    clean = clean[:60] if clean else "LX_Downloader_Media"
    clean = clean.replace(" ", "_")
    return f"{clean}.{ext}"


def extract_youtube(url: str) -> Dict[str, Any]:
    """Extract YouTube video or Short details using yt-dlp."""
    # Clean up tracking params
    clean_url = url.strip()
    
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)
            
            title = info.get("title", "YouTube Video")
            author = info.get("uploader", info.get("channel", "YouTube Creator"))
            thumbnail = info.get("thumbnail", "")
            duration = info.get("duration", 0)
            
            formats = info.get("formats", [])
            download_options = []
            direct_download_url = ""
            
            # Find best MP4 with video+audio, or best video stream
            mp4_formats = [f for f in formats if f.get("ext") == "mp4" and f.get("url")]
            
            # 1. Combined formats (both video and audio)
            progressive = [
                f for f in mp4_formats 
                if f.get("vcodec") != "none" and f.get("acodec") != "none"
            ]
            
            if progressive:
                best_prog = progressive[-1]
                direct_download_url = best_prog["url"]
                for f in reversed(progressive):
                    res = f.get("resolution") or f"{f.get('height')}p" or "Standard"
                    download_options.append({
                        "id": f.get("format_id", "mp4"),
                        "label": f"MP4 Video ({res})",
                        "ext": "mp4",
                        "url": f["url"],
                        "filesize": f.get("filesize") or f.get("filesize_approx")
                    })
            else:
                # If only separate streams, grab best available MP4 format
                if mp4_formats:
                    direct_download_url = mp4_formats[-1]["url"]
                    download_options.append({
                        "id": "best_mp4",
                        "label": f"MP4 Video ({mp4_formats[-1].get('resolution') or 'HD'})",
                        "ext": "mp4",
                        "url": mp4_formats[-1]["url"],
                        "filesize": mp4_formats[-1].get("filesize")
                    })

            # Also provide direct audio option if available
            audio_formats = [f for f in formats if f.get("vcodec") == "none" and f.get("url")]
            if audio_formats:
                best_audio = audio_formats[-1]
                download_options.append({
                    "id": "audio",
                    "label": f"Audio ({best_audio.get('ext', 'm4a').upper()})",
                    "ext": best_audio.get("ext", "m4a"),
                    "url": best_audio["url"],
                    "filesize": best_audio.get("filesize")
                })
                
            if not direct_download_url and formats:
                direct_download_url = formats[-1].get("url", "")
                
            video_id = info.get("id") or ""
            if not thumbnail and video_id:
                thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

            return {
                "success": True,
                "platform": "youtube",
                "type": "video",
                "video_id": video_id,
                "title": title,
                "author": author,
                "avatar": thumbnail,
                "thumbnail": thumbnail,
                "duration": duration,
                "download_url": direct_download_url,
                "options": download_options,
            }
    except Exception as e:
        err_msg = str(e).lower()
        if "private video" in err_msg or "sign in" in err_msg:
            raise HTTPException(
                status_code=400,
                detail="This YouTube video is private or restricted. Only public videos can be downloaded."
            )
        raise HTTPException(
            status_code=400,
            detail=f"Unable to extract YouTube media. Please check if the video link is valid and public."
        )


def extract_instagram(url: str) -> Dict[str, Any]:
    """Extract Instagram Reel, Post, DP, Story, or Highlight details."""
    clean_url = url.split("?")[0].rstrip("/") + "/"
    is_private_detected = False
    
    # Check if this is a profile DP URL (e.g. instagram.com/username/)
    profile_match = re.search(r"instagram\.com/([a-zA-Z0-9._]+)/?$", clean_url)
    is_not_reserved = profile_match and profile_match.group(1).lower() not in [
        "p", "reel", "reels", "stories", "tv", "explore", "direct"
    ]
    
    if is_not_reserved:
        username = profile_match.group(1)
        try:
            # Use Googlebot to fetch profile page without rate limits
            resp = requests.get(f"https://www.instagram.com/{username}/", headers=GOOGLEBOT_HEADERS, timeout=10)
            if resp.status_code == 200:
                og_image = re.findall(r'<meta property="og:image" content="([^"]+)"', resp.text)
                og_title = re.findall(r'<meta property="og:title" content="([^"]+)"', resp.text)
                
                if og_image:
                    pic_url = html.unescape(og_image[0])
                    hd_pic_url = re.sub(r"s150x150/|s320x320/|s100x100/", "", pic_url)
                    title = html.unescape(og_title[0]) if og_title else f"@{username}'s Profile Picture"
                    
                    return {
                        "success": True,
                        "platform": "instagram",
                        "type": "image",
                        "title": title,
                        "author": username,
                        "avatar": pic_url,
                        "thumbnail": hd_pic_url,
                        "duration": None,
                        "download_url": hd_pic_url,
                        "options": [
                            {"id": "hd_image", "label": "Full HD Profile Picture (JPG)", "ext": "jpg", "url": hd_pic_url}
                        ],
                    }
        except Exception:
            pass

    # Try yt-dlp first for Reels, Posts, Stories, and Highlights
    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
    }
    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            title = info.get("title") or info.get("description") or "Instagram Media"
            author = info.get("uploader") or info.get("channel") or "Instagram User"
            thumbnail = info.get("thumbnail") or ""
            video_url = info.get("url") or ""
            duration = info.get("duration")
            
            # Carousel or multiple items handling
            entries = info.get("entries")
            options = []
            if entries and len(entries) > 0:
                first = entries[0]
                video_url = first.get("url") or video_url
                thumbnail = first.get("thumbnail") or thumbnail
                title = first.get("title") or title
                
                for idx, entry in enumerate(entries):
                    e_url = entry.get("url")
                    if e_url:
                        e_ext = "jpg" if e_url.endswith((".jpg", ".png", ".webp")) else "mp4"
                        options.append({
                            "id": f"item_{idx+1}",
                            "label": f"Download Item #{idx+1} ({e_ext.upper()})",
                            "ext": e_ext,
                            "url": e_url
                        })

            if not options and video_url:
                v_ext = "jpg" if video_url.endswith((".jpg", ".png", ".webp")) else "mp4"
                options.append({
                    "id": "best_media",
                    "label": f"Download Media ({v_ext.upper()})",
                    "ext": v_ext,
                    "url": video_url
                })

            if video_url:
                is_img = video_url.endswith((".jpg", ".png", ".webp"))
                return {
                    "success": True,
                    "platform": "instagram",
                    "type": "image" if is_img else "video",
                    "title": title[:100],
                    "author": author,
                    "avatar": thumbnail,
                    "thumbnail": thumbnail,
                    "duration": duration,
                    "download_url": video_url,
                    "options": options,
                }
    except Exception as yt_err:
        yt_err_str = str(yt_err).lower()
        if any(term in yt_err_str for term in ["private", "login", "logged-in", "cookies", "restricted", "empty media"]):
            is_private_detected = True

    # Fallback to social crawler extraction (for public posts & stories)
    try:
        resp = requests.get(clean_url, headers=CRAWLER_HEADERS, timeout=10)
        if resp.status_code == 200:
            resp_lower = resp.text.lower()
            if "this account is private" in resp_lower or "accounts/login" in resp.url or "login • instagram" in resp_lower:
                is_private_detected = True
            
            og_video = re.findall(r'<meta property="og:video" content="([^"]+)"', resp.text)
            og_image = re.findall(r'<meta property="og:image" content="([^"]+)"', resp.text)
            og_title = re.findall(r'<meta property="og:title" content="([^"]+)"', resp.text)
            
            media_url = html.unescape(og_video[0]) if og_video else (html.unescape(og_image[0]) if og_image else "")
            thumbnail = html.unescape(og_image[0]) if og_image else ""
            title = html.unescape(og_title[0]) if og_title else "Instagram Media"
            is_video = bool(og_video)
            
            if media_url:
                return {
                    "success": True,
                    "platform": "instagram",
                    "type": "video" if is_video else "image",
                    "title": title[:100],
                    "author": "Instagram Creator",
                    "avatar": thumbnail,
                    "thumbnail": thumbnail,
                    "duration": None,
                    "download_url": media_url,
                    "options": [
                        {
                            "id": "media",
                            "label": "Direct Media Download (HD)",
                            "ext": "mp4" if is_video else "jpg",
                            "url": media_url,
                        }
                    ],
                }
    except Exception:
        pass

    # If it was detected as private or requires login:
    if is_private_detected or "stories" in clean_url or "highlights" in clean_url:
        raise HTTPException(
            status_code=400,
            detail="This account is private or requires login. You can only download Reels, Stories, Posts, and Highlights from public accounts."
        )

    raise HTTPException(
        status_code=400,
        detail="Unable to fetch this Instagram content. Please verify that the post or account is public."
    )


@app.get("/api/health")
def health_check():
    return {"status": "ok", "service": "LX-Downloader Python Backend"}


@app.get("/api/extract")
def extract_media(url: str = Query(..., description="The media URL to extract")):
    if not url or not url.strip():
        raise HTTPException(status_code=400, detail="URL cannot be empty.")
    
    trimmed = url.strip().lower()
    
    if "youtube.com" in trimmed or "youtu.be" in trimmed:
        return extract_youtube(url.strip())
    elif "instagram.com" in trimmed:
        return extract_instagram(url.strip())
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported link. Please provide a valid Instagram or YouTube URL."
        )


@app.get("/api/download")
async def download_file(
    url: str = Query(..., description="Direct media stream URL to proxy download"),
    filename: Optional[str] = Query("download.mp4", description="Desired filename for saving"),
):
    """
    Stream download proxy to bypass CORS and force the browser to trigger
    a native file save dialog with the Content-Disposition attachment header.
    """
    if not url:
        raise HTTPException(status_code=400, detail="Missing download URL.")

    # Determine extension
    ext = "mp4" if ".mp4" in url or filename.endswith(".mp4") else "jpg"
    safe_name = sanitize_filename(filename.rsplit(".", 1)[0], ext=ext)

    async def stream_generator():
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Referer": "https://www.instagram.com/" if "instagram" in url or "fbcdn" in url else "https://www.youtube.com/",
        }
        async with httpx.AsyncClient(follow_redirects=True, timeout=60.0) as client:
            async with client.stream("GET", url, headers=headers) as response:
                if response.status_code >= 400:
                    raise HTTPException(status_code=response.status_code, detail="Failed to fetch media stream from source.")
                async for chunk in response.aiter_bytes(chunk_size=65536):
                    yield chunk

    media_type = "video/mp4" if ext == "mp4" else "image/jpeg"
    
    return StreamingResponse(
        stream_generator(),
        media_type=media_type,
        headers={
            "Content-Disposition": f'attachment; filename="{safe_name}"',
            "Cache-Control": "no-cache",
        },
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
