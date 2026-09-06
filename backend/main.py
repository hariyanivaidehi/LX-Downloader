import os
import re
import html
import json
import glob
import time
import asyncio
import urllib.parse
import hashlib
import subprocess
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
        elif quality == "480p":
            format_spec = "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]/best"
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


def transcode_video(media_url: str, quality: str = "1080p") -> Optional[str]:
    """Download and scale/convert video into cache using ffmpeg with faststart moov flags."""
    cleanup_cache()
    if not FFMPEG_EXE or not media_url:
        return None

    # Derive stable key from URL and desired quality
    url_hash = hashlib.md5(f"{media_url}_{quality}".encode()).hexdigest()[:16]
    ext = "mp3" if quality == "audio" else "mp4"
    target_path = os.path.join(CACHE_DIR, f"trans_{url_hash}_{quality}.{ext}")

    if os.path.exists(target_path) and os.path.getsize(target_path) > 1024:
        return target_path

    temp_output = target_path + f".tmp.{ext}"
    headers_opt = "Referer: https://www.instagram.com/\r\nUser-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36\r\n"

    if quality == "audio":
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-vn",
            "-c:a", "libmp3lame",
            "-b:a", "192k",
            temp_output
        ]
    elif quality == "1080p":
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-c:v", "copy",
            "-c:a", "copy",
            "-movflags", "+faststart",
            temp_output
        ]
    elif quality == "720p":
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-vf", "scale=-2:'min(720,ih)'",
            "-c:v", "libx264", "-crf", "22", "-preset", "fast",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            temp_output
        ]
    elif quality == "480p":
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-vf", "scale=-2:'min(480,ih)'",
            "-c:v", "libx264", "-crf", "24", "-preset", "fast",
            "-c:a", "aac", "-b:a", "128k",
            "-movflags", "+faststart",
            temp_output
        ]
    elif quality == "360p":
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-vf", "scale=-2:'min(360,ih)'",
            "-c:v", "libx264", "-crf", "26", "-preset", "fast",
            "-c:a", "aac", "-b:a", "96k",
            "-movflags", "+faststart",
            temp_output
        ]
    else:
        cmd = [
            FFMPEG_EXE, "-y",
            "-headers", headers_opt,
            "-i", media_url,
            "-c:v", "copy",
            "-c:a", "copy",
            "-movflags", "+faststart",
            temp_output
        ]

    try:
        proc = subprocess.run(cmd, capture_output=True, timeout=90)
        if proc.returncode == 0 and os.path.exists(temp_output) and os.path.getsize(temp_output) > 1024:
            if os.path.exists(target_path):
                try:
                    os.remove(target_path)
                except Exception:
                    pass
            os.rename(temp_output, target_path)
            return target_path
    except Exception as e:
        if os.path.exists(temp_output):
            try:
                os.remove(temp_output)
            except Exception:
                pass

    return None


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

            # 480p Medium
            download_options.append({
                "id": "480p",
                "label": "Medium Video (480p)",
                "ext": "mp4",
                "url": f"https://www.youtube.com/watch?v={video_id}&quality=480p",
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


def pk_to_shortcode(pk: int) -> str:
    alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
    shortcode = ""
    while pk > 0:
        pk, rem = divmod(pk, 64)
        shortcode = alphabet[rem] + shortcode
    return shortcode


def extract_instagram_user(username: str) -> Dict[str, Any]:
    """Extract an Instagram user profile with Reels, Posts, Stories, Highlights, and DP."""
    clean_user = username.strip().lstrip("@").lower()
    if not clean_user or not re.match(r"^[a-zA-Z0-9._]{1,30}$", clean_user):
        raise HTTPException(status_code=400, detail="Invalid Instagram username format.")

    url = f"https://www.instagram.com/{clean_user}/"
    try:
        resp = requests.get(url, headers=GOOGLEBOT_HEADERS, timeout=12)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Unable to connect to Instagram profile: {str(e)}")

    if resp.status_code == 404:
        raise HTTPException(
            status_code=404,
            detail=f"User not found! No Instagram account exists with username '@{clean_user}'. Please check the username spelling and try again. (આવો કોઈ યુઝર નથી)"
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail=f"Instagram profile returned status {resp.status_code}.")

    raw_html = resp.text
    is_private = "this account is private" in raw_html.lower() or '"is_private":true' in raw_html.replace(" ", "")
    if ("xig_user_by_igid_v2" not in raw_html and "Followers" not in raw_html) or "sorry, this page isn't available" in raw_html.lower() or "page not found" in raw_html.lower():
        raise HTTPException(
            status_code=404,
            detail=f"No such user found! There is no Instagram account with username '@{clean_user}'. Please check the username spelling and try again. (આવો કોઈ યુઝર નથી)"
        )

    og_title = re.findall(r'<meta property="og:title" content="([^"]+)"', raw_html)
    og_desc = re.findall(r'<meta property="og:description" content="([^"]+)"', raw_html)
    og_image = re.findall(r'<meta property="og:image" content="([^"]+)"', raw_html)

    title_str = html.unescape(og_title[0]) if og_title else f"@{clean_user}"
    desc_str = html.unescape(og_desc[0]) if og_desc else ""
    avatar_url = html.unescape(og_image[0]) if og_image else ""
    hd_avatar_url = re.sub(r"s150x150/|s320x320/|s100x100/", "", avatar_url) if avatar_url else ""

    # Parse full name from title_str (e.g. "Full Name (@username) • Instagram...")
    full_name_match = re.match(r"^(.*?)\s*\(@", title_str)
    full_name = full_name_match.group(1).strip() if full_name_match else clean_user

    # Parse followers / following / posts count from desc_str
    followers_match = re.search(r"([0-9.,MKkmb]+)\s+Followers", desc_str, re.IGNORECASE)
    follower_count = followers_match.group(1) if followers_match else ""

    following_match = re.search(r"([0-9.,MKkmb]+)\s+Following", desc_str, re.IGNORECASE)
    following_count = following_match.group(1) if following_match else ""

    posts_match = re.search(r"([0-9.,MKkmb]+)\s+Posts", desc_str, re.IGNORECASE)
    post_count = posts_match.group(1) if posts_match else ""

    user_bio = ""
    latest_reel_media = None
    has_any_clips = False
    highlight_count = None
    is_verified = False

    # Extract deep user attributes from SSR script
    scripts = re.findall(r'<script type="application/json"[^>]*>(.*?)</script>', raw_html, re.DOTALL)
    for s in scripts:
        if "xig_user_by_igid_v2" in s:
            try:
                d = json.loads(s)
                def find_u(obj):
                    if isinstance(obj, dict):
                        if "xig_user_by_igid_v2" in obj:
                            return obj["xig_user_by_igid_v2"]
                        for v in obj.values():
                            res = find_u(v)
                            if res: return res
                    elif isinstance(obj, list):
                        for v in obj:
                            res = find_u(v)
                            if res: return res
                    return None
                u = find_u(d)
                if u:
                    if u.get("is_private") is not None:
                        is_private = bool(u.get("is_private"))
                    if u.get("full_name"):
                        full_name = u.get("full_name")
                    if u.get("biography"):
                        user_bio = u.get("biography")
                    if u.get("is_verified"):
                        is_verified = bool(u.get("is_verified"))
                    if u.get("follower_count") and not follower_count:
                        follower_count = str(u.get("follower_count"))
                    if u.get("following_count") and not following_count:
                        following_count = str(u.get("following_count"))
                    if u.get("latest_reel_media"):
                        latest_reel_media = u.get("latest_reel_media")
                    if u.get("has_any_clips"):
                        has_any_clips = bool(u.get("has_any_clips"))
                    if u.get("highlight_reel_count") is not None:
                        highlight_count = u.get("highlight_reel_count")
                    if u.get("profile_pic_url") and not hd_avatar_url:
                        hd_avatar_url = u.get("profile_pic_url")
            except Exception:
                pass

    items = []

    # 1. Profile Picture item (Always accessible and downloadable for all accounts)
    if hd_avatar_url or avatar_url:
        dl_avatar = hd_avatar_url or avatar_url
        items.append({
            "id": f"dp_{clean_user}",
            "category": "dp",
            "type": "image",
            "title": f"@{clean_user} HD Profile Picture",
            "thumbnail": dl_avatar,
            "download_url": dl_avatar,
            "ext": "jpg",
        })

    # Active 24h Story item if user has an active story
    if latest_reel_media and str(latest_reel_media) != "0":
        items.append({
            "id": f"story_{clean_user}",
            "category": "story",
            "type": "video",
            "title": f"@{clean_user} Active 24-Hour Story",
            "thumbnail": hd_avatar_url or avatar_url,
            "download_url": f"https://www.instagram.com/stories/{clean_user}/",
            "ext": "mp4",
            "timestamp": latest_reel_media,
        })

    # 2. Extract Timeline Media (Reels & Posts) for public accounts
    if not is_private:
        for s in scripts:
            if "polaris_timeline_connection" in s:
                try:
                    d = json.loads(s)
                    def find_edges(obj):
                        if isinstance(obj, dict):
                            if "polaris_timeline_connection" in obj:
                                return obj["polaris_timeline_connection"].get("edges", [])
                            for v in obj.values():
                                res = find_edges(v)
                                if res: return res
                        elif isinstance(obj, list):
                            for v in obj:
                                res = find_edges(v)
                                if res: return res
                        return None

                    edges = find_edges(d)
                    if edges:
                        for edge in edges:
                            node = edge.get("node", {})
                            pk_str = str(node.get("pk") or "")
                            if not pk_str: continue

                            try:
                                shortcode = pk_to_shortcode(int(pk_str))
                            except Exception:
                                shortcode = node.get("code") or pk_str

                            typename = node.get("__typename", "")
                            product_type = node.get("product_type", "")
                            is_video = "Video" in typename or product_type == "clips" or node.get("media_type") == 2
                            category = "reels" if (product_type == "clips" or is_video) else "post"

                            caption_text = ""
                            try:
                                caption_text = node.get("caption", {}).get("text", "")
                            except Exception:
                                pass

                            candidates = node.get("image_versions2", {}).get("candidates", [])
                            thumb = candidates[0].get("url") if candidates else node.get("display_uri")

                            video_versions = node.get("video_versions", [])
                            direct_url = video_versions[0].get("url") if (video_versions and is_video) else (thumb or "")

                            download_link = direct_url or (f"https://www.instagram.com/reel/{shortcode}/" if is_video else (thumb or f"https://www.instagram.com/p/{shortcode}/"))

                            clean_caption = caption_text.split("\n")[0][:70].strip() if caption_text else ""
                            item_title = clean_caption or f"@{clean_user} {category.capitalize()} ({shortcode})"

                            items.append({
                                "id": f"media_{shortcode}",
                                "pk": pk_str,
                                "shortcode": shortcode,
                                "category": category,
                                "type": "video" if is_video else "image",
                                "title": item_title,
                                "thumbnail": thumb,
                                "download_url": download_link,
                                "ext": "mp4" if is_video else "jpg",
                            })
                except Exception:
                    pass

    return {
        "success": True,
        "platform": "instagram",
        "type": "profile",
        "is_private": is_private,
        "is_verified": is_verified,
        "username": clean_user,
        "full_name": full_name,
        "avatar": avatar_url or hd_avatar_url,
        "thumbnail": hd_avatar_url or avatar_url,
        "bio": user_bio or desc_str,
        "follower_count": follower_count,
        "following_count": following_count,
        "post_count": post_count,
        "has_story": bool(latest_reel_media and str(latest_reel_media) != "0"),
        "has_reels": bool(has_any_clips),
        "highlight_count": highlight_count,
        "title": f"@{clean_user}'s Instagram Profile",
        "download_url": hd_avatar_url or avatar_url,
        "items": items,
    }


def extract_instagram(url: str) -> Dict[str, Any]:
    """Extract Instagram Reel, Post, DP, Story, or Highlight details."""
    clean_url = url.split("?")[0].rstrip("/") + "/"
    is_private_detected = False
    
    # Check if this is a profile URL (e.g. instagram.com/username/)
    profile_match = re.search(r"instagram\.com/([a-zA-Z0-9._]+)/?$", clean_url)
    is_not_reserved = profile_match and profile_match.group(1).lower() not in [
        "p", "reel", "reels", "stories", "tv", "explore", "direct"
    ]
    
    if is_not_reserved:
        username = profile_match.group(1)
        try:
            return extract_instagram_user(username)
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
                if v_ext == "mp4":
                    options = [
                        {"id": "1080p", "label": "Full HD (1080p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(video_url)}&quality=1080p"},
                        {"id": "720p", "label": "HD Video (720p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(video_url)}&quality=720p"},
                        {"id": "480p", "label": "Medium Video (480p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(video_url)}&quality=480p"},
                        {"id": "360p", "label": "Standard Video (360p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(video_url)}&quality=360p"},
                        {"id": "audio", "label": "Audio Only (MP3)", "ext": "mp3", "url": f"/api/download?url={urllib.parse.quote(video_url)}&quality=audio"},
                    ]
                else:
                    options.append({
                        "id": "best_media",
                        "label": "Download Photo (JPG)",
                        "ext": "jpg",
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
                fb_options = []
                if is_video:
                    fb_options = [
                        {"id": "1080p", "label": "Full HD (1080p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(media_url)}&quality=1080p"},
                        {"id": "720p", "label": "HD Video (720p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(media_url)}&quality=720p"},
                        {"id": "480p", "label": "Medium Video (480p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(media_url)}&quality=480p"},
                        {"id": "360p", "label": "Standard Video (360p)", "ext": "mp4", "url": f"/api/download?url={urllib.parse.quote(media_url)}&quality=360p"},
                        {"id": "audio", "label": "Audio Only (MP3)", "ext": "mp3", "url": f"/api/download?url={urllib.parse.quote(media_url)}&quality=audio"},
                    ]
                else:
                    fb_options = [{"id": "media", "label": "Direct Photo Download (HD)", "ext": "jpg", "url": media_url}]

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
                    "options": fb_options,
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


@app.get("/")
@app.get("/api/health")
@app.get("/api/py/health")
async def health_check():
    return {
        "status": "online",
        "service": "LX-Downloader API",
        "version": "1.2.0",
        "ffmpeg": bool(FFMPEG_EXE)
    }


@app.get("/api/extract")
@app.get("/api/py/extract")
@app.get("/extract")
async def extract_info(url: str = Query(..., description="Media URL or Instagram username")):
    """Universal metadata extractor for YouTube and Instagram content."""
    trimmed = url.strip()
    if not trimmed:
        raise HTTPException(status_code=400, detail="URL or username parameter is required.")

    # Check for YouTube
    if any(domain in trimmed.lower() for domain in ["youtube.com", "youtu.be"]):
        return extract_youtube(trimmed)

    # Check for Instagram URL
    if "instagram.com" in trimmed.lower():
        return extract_instagram(trimmed)

    # Check if this is an Instagram username (@username or alphanumeric handle)
    clean_handle = trimmed.lstrip("@").strip()
    if re.match(r"^[a-zA-Z0-9._]{1,30}$", clean_handle) and not any(ext in clean_handle for ext in [".com", ".org", ".net", ".io", "http", "/", "watch?"]):
        return extract_instagram_user(clean_handle)
    
    raise HTTPException(
        status_code=400,
        detail="Unsupported link or username. Please provide a valid Instagram or YouTube URL, or an Instagram @username."
    )


@app.get("/api/stream")
@app.get("/api/py/stream")
@app.get("/stream")
async def stream_media(url: str = Query(..., description="Direct media stream URL for preview")):
    """Stream media for in-browser playback and preview with inline disposition and range support."""
    raw_url = url.strip()
    if not raw_url:
        raise HTTPException(status_code=400, detail="Missing stream URL.")
    
    ext = "mp4" if (".mp4" in raw_url or "video" in raw_url) else "jpg"
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Referer": "https://www.instagram.com/" if ("instagram" in raw_url or "fbcdn" in raw_url) else "https://www.google.com/",
    }

    client = httpx.AsyncClient(follow_redirects=True, timeout=httpx.Timeout(None, connect=30.0))
    content_length = None
    try:
        head_resp = await client.head(raw_url, headers=headers)
        content_length = head_resp.headers.get("content-length")
    except Exception:
        pass

    async def stream_gen():
        try:
            async with client.stream("GET", raw_url, headers=headers) as response:
                async for chunk in response.aiter_bytes(chunk_size=65536):
                    yield chunk
        finally:
            await client.aclose()

    media_type = "video/mp4" if ext == "mp4" else "image/jpeg"
    resp_headers = {
        "Content-Disposition": "inline",
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
    }
    if content_length:
        resp_headers["Content-Length"] = content_length

    return StreamingResponse(stream_gen(), media_type=media_type, headers=resp_headers)


@app.get("/api/download")
@app.get("/api/py/download")
@app.get("/download")
async def download_file(
    url: Optional[str] = Query(None, description="Direct media stream URL or YouTube link"),
    video_id: Optional[str] = Query(None, description="YouTube Video ID"),
    quality: Optional[str] = Query(None, description="Desired quality: 1080p, 720p, 480p, 360p, audio"),
    source: Optional[str] = Query(None, description="Platform source: youtube, instagram"),
    filename: Optional[str] = Query("download.mp4", description="Desired filename for saving"),
):
    """
    Download handler with multi-format and resolution support:
    1. For YouTube: downloads and merges video+audio with faststart MP4 flags, served with exact Content-Length.
    2. For Instagram / CDN: scales/transcodes or streams with full connection reliability and exact headers.
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

    # Quality transcoding for video streams if quality requested
    if quality and quality in ["1080p", "720p", "480p", "360p", "audio"]:
        ext = "mp3" if quality == "audio" else "mp4"
        safe_name = sanitize_filename(filename.rsplit(".", 1)[0], ext=ext)
        transcoded_path = await asyncio.to_thread(transcode_video, raw_url, quality)
        if transcoded_path and os.path.exists(transcoded_path):
            media_type = "audio/mpeg" if ext == "mp3" else "video/mp4"
            return FileResponse(
                transcoded_path,
                media_type=media_type,
                filename=safe_name,
                headers={
                    "Cache-Control": "no-cache",
                    "Accept-Ranges": "bytes",
                }
            )

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
