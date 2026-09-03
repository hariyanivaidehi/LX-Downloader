import os
import re
import html
import glob
import time
import asyncio
import urllib.parse
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse
import httpx
import requests
import yt_dlp
import imageio_ffmpeg

import tempfile

try:
    FFMPEG_EXE = imageio_ffmpeg.get_ffmpeg_exe()
except Exception:
    FFMPEG_EXE = None

if os.environ.get("VERCEL"):
    CACHE_DIR = os.path.join(tempfile.gettempdir(), "downloads_cache")
else:
    CACHE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads_cache")
os.makedirs(CACHE_DIR, exist_ok=True)


def cleanup_cache(max_age_seconds: int = 3600):
    """Remove cached downloads older than 1 hour to prevent disk bloat."""
    try:
        now = time.time()
        for f in glob.glob(os.path.join(CACHE_DIR, "*")):
            if os.path.isfile(f) and (now - os.path.getmtime(f)) > max_age_seconds:
                try:
                    os.remove(f)
                except Exception:
                    pass
    except Exception:
        pass


def get_ydl_base_opts() -> Dict[str, Any]:
    """Base options for yt-dlp to solve challenges and use local ffmpeg."""
    opts: Dict[str, Any] = {
        "quiet": True,
        "no_warnings": True,
        "remote_components": ["ejs:github"],
        "js_runtimes": {"node": {}},
    }
    if FFMPEG_EXE:
        opts["ffmpeg_location"] = FFMPEG_EXE
    return opts

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


def download_youtube_media(video_id: str, quality: str = "720p") -> str:
    """Download and merge YouTube media into cache, applying faststart moov flags."""
    cleanup_cache()
    ext = "mp3" if quality == "audio" else "mp4"
    target_path = os.path.join(CACHE_DIR, f"{video_id}_{quality}.{ext}")

    # If already cached and valid (>1KB), return it immediately
    if os.path.exists(target_path) and os.path.getsize(target_path) > 1024:
        return target_path

    opts = get_ydl_base_opts()

    if quality == "audio":
        opts.update({
            "format": "bestaudio/best",
            "outtmpl": os.path.join(CACHE_DIR, f"{video_id}_{quality}.%(ext)s"),
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": "mp3",
                "preferredquality": "192",
            }],
        })
    else:
        if quality == "1080p":
            format_spec = "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best"
        elif quality == "360p":
            format_spec = "bestvideo[height<=360][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best[height<=360]/best"
        else:  # 720p or default
            format_spec = "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best"

        opts.update({
            "format": format_spec,
            "outtmpl": os.path.join(CACHE_DIR, f"{video_id}_{quality}.%(ext)s"),
            "merge_output_format": "mp4",
            "postprocessor_args": {"merger": ["-movflags", "+faststart"]},
        })

    with yt_dlp.YoutubeDL(opts) as ydl:
        ydl.download([f"https://www.youtube.com/watch?v={video_id}"])

    if os.path.exists(target_path) and os.path.getsize(target_path) > 0:
        return target_path

    # Fallback search for created file
    matches = glob.glob(os.path.join(CACHE_DIR, f"{video_id}_{quality}.*"))
    for m in matches:
        if not m.endswith(".part") and os.path.getsize(m) > 0:
            return m

    raise RuntimeError("YouTube media download failed to produce a valid output file.")


def extract_youtube(url: str) -> Dict[str, Any]:
    """Extract YouTube video or Short details using yt-dlp."""
    clean_url = url.strip()
    ydl_opts = get_ydl_base_opts()
    ydl_opts["skip_download"] = True

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(clean_url, download=False)

            title = info.get("title", "YouTube Video")
            author = info.get("uploader") or info.get("channel") or "YouTube Creator"
            video_id = info.get("id") or ""
            duration = info.get("duration", 0)

            # High-res thumbnail with reliable fallback
            thumbnail = info.get("thumbnail") or f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
            if video_id and not thumbnail.startswith("http"):
                thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"

            formats = info.get("formats", [])
            heights = set(f.get("height") for f in formats if f.get("height"))

            download_options = []

            # 1080p Full HD
            if any(h and h >= 1080 for h in heights):
                download_options.append({
                    "id": "1080p",
                    "label": "Full HD Video (1080p)",
                    "ext": "mp4",
                    "url": f"https://www.youtube.com/watch?v={video_id}&quality=1080p",
                })

            # 720p HD
            if any(h and h >= 720 for h in heights) or not download_options:
                download_options.append({
                    "id": "720p",
                    "label": "HD Video (720p)",
                    "ext": "mp4",
                    "url": f"https://www.youtube.com/watch?v={video_id}&quality=720p",
                })

            # 360p Standard
            download_options.append({
                "id": "360p",
                "label": "Standard Video (360p)",
                "ext": "mp4",
                "url": f"https://www.youtube.com/watch?v={video_id}&quality=360p",
            })

            # Audio MP3
            download_options.append({
                "id": "audio",
                "label": "High Quality Audio (MP3)",
                "ext": "mp3",
                "url": f"https://www.youtube.com/watch?v={video_id}&quality=audio",
            })

            default_quality = "720p" if any(opt["id"] == "720p" for opt in download_options) else "360p"
            direct_download_url = f"https://www.youtube.com/watch?v={video_id}&quality={default_quality}"

            return {
                "success": True,
                "platform": "youtube",
                "type": "video",
                "video_id": video_id,
                "title": title,
                "author": author,
                "avatar": f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg",
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
    url: Optional[str] = Query(None, description="Direct media stream URL or YouTube link"),
    video_id: Optional[str] = Query(None, description="YouTube Video ID"),
    quality: Optional[str] = Query(None, description="Desired quality: 1080p, 720p, 360p, audio"),
    source: Optional[str] = Query(None, description="Platform source: youtube, instagram"),
    filename: Optional[str] = Query("download.mp4", description="Desired filename for saving"),
):
    """
    Download handler with dual mode:
    1. For YouTube: downloads and merges video+audio with faststart MP4 flags, served with exact Content-Length.
    2. For Instagram / CDN: streams media with full connection reliability and exact headers.
    """
    raw_url = (url or "").strip()
    is_yt = (
        source == "youtube"
        or bool(video_id)
        or "youtube.com" in raw_url.lower()
        or "youtu.be" in raw_url.lower()
        or "googlevideo.com" in raw_url.lower()
    )

    if is_yt:
        target_vid = video_id
        parsed_quality = quality
        if raw_url:
            parsed = urllib.parse.urlparse(raw_url)
            params = urllib.parse.parse_qs(parsed.query)
            if not target_vid:
                if "v" in params:
                    target_vid = params["v"][0]
                elif "/shorts/" in raw_url:
                    target_vid = raw_url.split("/shorts/")[1].split("?")[0].split("/")[0]
                elif "youtu.be/" in raw_url:
                    target_vid = raw_url.split("youtu.be/")[1].split("?")[0].split("/")[0]
                elif "video_id" in params:
                    target_vid = params["video_id"][0]
            if not parsed_quality and "quality" in params:
                parsed_quality = params["quality"][0]

        if not target_vid:
            raise HTTPException(status_code=400, detail="Could not determine YouTube video ID.")

        chosen_quality = (parsed_quality or "720p").lower()
        ext = "mp3" if chosen_quality == "audio" else "mp4"
        safe_name = sanitize_filename(filename.rsplit(".", 1)[0], ext=ext)

        try:
            file_path = await asyncio.to_thread(download_youtube_media, target_vid, chosen_quality)
            media_type = "audio/mpeg" if ext == "mp3" else "video/mp4"
            return FileResponse(
                file_path,
                media_type=media_type,
                filename=safe_name,
                headers={
                    "Cache-Control": "no-cache",
                    "Accept-Ranges": "bytes",
                }
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to process YouTube download: {str(e)}")

    # Handle Instagram / Direct CDN Streams
    if not raw_url:
        raise HTTPException(status_code=400, detail="Missing download URL.")

    ext = "mp4" if ".mp4" in raw_url or filename.endswith(".mp4") else "jpg"
    safe_name = sanitize_filename(filename.rsplit(".", 1)[0], ext=ext)

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://www.instagram.com/" if "instagram" in raw_url or "fbcdn" in raw_url else "https://www.google.com/",
    }

    client = httpx.AsyncClient(follow_redirects=True, timeout=httpx.Timeout(None, connect=30.0))
    content_length = None
    try:
        head_resp = await client.head(raw_url, headers=headers)
        content_length = head_resp.headers.get("content-length")
    except Exception:
        pass

    async def stream_generator():
        try:
            async with client.stream("GET", raw_url, headers=headers) as response:
                if response.status_code >= 400:
                    raise HTTPException(status_code=response.status_code, detail="Failed to fetch media stream from source.")
                async for chunk in response.aiter_bytes(chunk_size=65536):
                    yield chunk
        finally:
            await client.aclose()

    media_type = "video/mp4" if ext == "mp4" else "image/jpeg"
    resp_headers = {
        "Content-Disposition": f'attachment; filename="{safe_name}"',
        "Cache-Control": "no-cache",
        "Accept-Ranges": "bytes",
    }
    if content_length:
        resp_headers["Content-Length"] = content_length

    return StreamingResponse(
        stream_generator(),
        media_type=media_type,
        headers=resp_headers,
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
