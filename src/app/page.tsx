"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { 
  Flame, Link2, Play, Download, RefreshCw, Film, Image as ImageIcon, Compass, UserCheck, Search, X, ChevronDown, AlertCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Custom SVG brand icons
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="currentColor" />
  </svg>
);

// Comprehensive dictionary translating the ENTIRE homepage including steps, FAQs, and tab articles
const VOCABULARY: Record<string, Record<string, any>> = {
  en: { 
    instagramText: "DOWNLOAD ALL INSTAGRAM STUFF HERE!", 
    youtubeText: "DOWNLOAD ALL YOUTUBE VIDEOS & AUDIO HERE!", 
    pastePlaceholder: "Paste valid link here...", 
    searchBtn: "SEARCH", 
    pasteBtn: "Paste", 
    howTo: "How to Save Content in 3 Steps", 
    faqTitle: "Frequently Asked Questions", 
    startDownloadBtn: "START DOWNLOADING", 
    clearBtn: "Clear Result", 
    mirrorBtn: "Mirror Link",
    steps: [
      { num: "01", title: "Copy the Link", desc: "Open Instagram or YouTube, navigate to the story, post, or video you wish to download, and copy its URL link." },
      { num: "02", title: "Paste URL into LX", desc: "Head over to LX-Downloader, click the 'Paste' button to automatically insert and fetch the link." },
      { num: "03", title: "Download HD Content", desc: "Our engine will extract the video automatically. Click the 'START DOWNLOADING' button below the preview." }
    ],
    faqs: [
      { question: "What is Instagram Video Downloader?", answer: "Instagram Video Downloader is a web-based tool that provides you any Instagram Video Downloading absolutely free of cost without providing your log-in details." },
      { question: "How can be download video Instagram?", answer: "First, copy the video link from Instagram. Paste the link in the input box on LX-Downloader, then click Search. The download button will appear below the video preview." },
      { question: "Download Instagram Video in Original Quality.", answer: "Yes! LX-Downloader fetches the direct files from Instagram CDN, allowing you to download in full high definition (1080p, 720p) or original upload resolution." },
      { question: "Instagram Video Downloading Limit?", answer: "There is no downloading limit on LX-Downloader. You can download as many videos, reels, photos, or stories as you want completely free." }
    ],
    tabTexts: {
      reels: {
        title: "Instagram Reels Download",
        text1: "Reels is a short-video sharing platform on Instagram that allows creators to make engaging and fast videos. LX-Downloader helps you download Reels instantly in 1080p.",
        text2: "Just copy the Reels link from the Instagram app, paste it into our search bar, and download. Save your favorite workouts, cooking guides, or dance trends straight to your local library."
      },
      post: {
        title: "Instagram Post & Photo Download",
        text1: "Instagram photos and image posts are hosted in full resolution on Instagram servers. LX-Downloader allows you to extract high-resolution JPG files without any compression artifacts.",
        text2: "Whether it is a single landscape shot or a multi-slide carousel post, our downloader handles and parses the images quickly so you don't lose any detail."
      },
      story: {
        title: "Instagram Story Download",
        text1: "Instagram Stories are temporary posts that disappear after 24 hours. LX-Downloader helps you archive and save stories before they vanish.",
        text2: "Enter the profile username, and you can download all currently active stories anonymously. Keep a copy of memorable events or creator tips forever."
      },
      dp: {
        title: "Instagram Profile DP Download",
        text1: "Want to view a profile picture in full size? Instagram keeps DP images small, but our parser fetches the original high-resolution profile asset.",
        text2: "Just type in the Instagram username or profile link, and LX-Downloader will fetch and display the original display image for immediate saving."
      },
      highlight: {
        title: "Instagram Highlights Download",
        text1: "Instagram Highlights are pinned story categories saved on user profiles. Easily download full highlights sets using LX-Downloader.",
        text2: "No login is needed. Simply copy the profile URL or Highlight URL and our system will extract each slide and present them individually."
      },
      youtubeVideo: {
        title: "YouTube Video Download",
        text1: "Save full YouTube videos in high-definition resolutions from 360p up to 1080p using the LX-Downloader extraction engine.",
        text2: "LX-Downloader extracts the direct clean MP4 stream from YouTube servers, offering you maximum downloading speed and offline media flexibility."
      },
      youtubeShorts: {
        title: "YouTube Shorts Download",
        text1: "Easily download quick, engaging YouTube Shorts videos directly into your local library without watermarks or frame loss.",
        text2: "Just copy the Shorts URL from the YouTube app, paste it into the downloader box, and start saving the files in high quality instantly."
      }
    }
  },
  hi: { 
    instagramText: "यहाँ सभी इंस्टाग्राम सामग्री डाउनलोड करें!", 
    youtubeText: "यहाँ सभी यूट्यूब वीडियो और ऑडियो डाउनलोड करें!", 
    pastePlaceholder: "वैध लिंक यहाँ पेस्ट करें...", 
    searchBtn: "खोजें", 
    pasteBtn: "पेस्ट", 
    howTo: "3 आसान चरणों में डाउनलोड करें", 
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न", 
    startDownloadBtn: "डाउनलोड शुरू करें", 
    clearBtn: "साफ करें", 
    mirrorBtn: "मिरर लिंक",
    steps: [
      { num: "01", title: "लिंक कॉपी करें", desc: "इंस्टाग्राम या यूट्यूब खोलें, उस स्टोरी, पोस्ट या वीडियो पर जाएं जिसे आप डाउनलोड करना चाहते हैं, और उसका यूआरएल कॉपी करें।" },
      { num: "02", title: "LX में पेस्ट करें", desc: "LX-Downloader पर आएं, स्वचालित रूप से लिंक डालने और लोड करने के लिए 'पेस्ट' बटन पर क्लिक करें।" },
      { num: "03", title: "सामग्री डाउनलोड करें", desc: "हमारा सिस्टम लिंक को स्वचालित रूप से लोड करेगा। प्रीव्यू के नीचे 'डाउनलोड शुरू करें' बटन पर क्लिक करें।" }
    ],
    faqs: [
      { question: "इंस्टाग्राम वीडियो डाउनलोडर क्या है?", answer: "इंस्टाग्राम वीडियो डाउनलोडर एक वेब-आधारित टूल है जो आपको बिना लॉगिन विवरण प्रदान किए पूरी तरह से मुफ्त में इंस्टाग्राम वीडियो डाउनलोड करने की सुविधा देता है।" },
      { question: "इंस्टाग्राम वीडियो कैसे डाउनलोड करें?", answer: "सबसे पहले इंस्टाग्राम से वीडियो लिंक कॉपी करें। LX-Downloader के इनपुट बॉक्स में लिंक पेस्ट करें, फिर सर्च पर क्लिक करें। डाउनलोड बटन वीडियो प्रीव्यू के नीचे दिखाई देगा।" },
      { question: "क्या मैं मूल गुणवत्ता में डाउनलोड कर सकता हूँ?", answer: "हाँ! LX-Downloader इंस्टाग्राम सर्वर से सीधे एचडी फाइलों के डायरेक्ट लिंक प्रदान करता है।" },
      { question: "डाउनलोड करने की कोई सीमा है?", answer: "नहीं, आप जितनी चाहें उतनी वीडियो, रील्स या फोटो बिना किसी दैनिक सीमा के बिल्कुल मुफ्त में डाउनलोड कर सकते हैं।" }
    ],
    tabTexts: {
      reels: {
        title: "इंस्टाग्राम रील्स डाउनलोड",
        text1: "रील्स इंस्टाग्राम का एक शॉर्ट-वीडियो शेयरिंग फीचर है। LX-Downloader की मदद से आप रील्स को बिना किसी वॉटरमार्क के 1080p फुल एचडी में सेव कर सकते हैं।",
        text2: "बस रील्स लिंक कॉपी करें, सर्च बॉक्स में पेस्ट करें और सेकंड में अपनी गैलरी में सेव करें।"
      },
      post: {
        title: "इंस्टाग्राम पोस्ट और फोटो डाउनलोड",
        text1: "इंस्टाग्राम फोटो सर्वर पर उच्चतम रिज़ॉल्यूशन में संग्रहीत होते हैं। हमारा टूल बिना किसी गुणवत्ता हानि के उन्हें जेपीजी फॉर्मेट में एक्सट्रैक्ट करता है।",
        text2: "चाहे वह एक फोटो हो या एक से अधिक स्लाइड, हमारा डाउनलोडर तेजी से उन्हें खोजकर डाउनलोड विकल्प प्रस्तुत करता है।"
      },
      story: {
        title: "इंस्टाग्राम स्टोरी डाउनलोड",
        text1: "स्टोरीज़ 24 घंटे के बाद गायब हो जाती हैं। हमारे स्टोरी डाउनलोडर का उपयोग करके उन्हें हमेशा के लिए अपने पास सुरक्षित रखें।",
        text2: "यूज़रनेम डालें और किसी भी सार्वजनिक प्रोफ़ाइल की एक्टिव स्टोरीज़ को गुमनाम रूप से सहेजें।"
      },
      dp: {
        title: "इंस्टाग्राम प्रोफाइल पिक्चर डाउनलोड",
        text1: "क्या आप किसी भी इंस्टाग्राम प्रोफाइल फोटो को उसके पूर्ण मूल आकार में देखना चाहते हैं? हमारा टूल ओरिजिनल एचडी प्रोफाइल पिक्चर डाउनलोड लिंक देता है।",
        text2: "बस यूज़रनेम या प्रोफाइल लिंक पेस्ट करें और प्रोफाइल फोटो डाउनलोड करें।"
      },
      highlight: {
        title: "इंस्टाग्राम हाइलाइट्स डाउनलोड",
        text1: "प्रोफाइल पर पिन की गई हाइलाइट्स को भी बिना लॉगिन के आसानी से एक क्लिक में डाउनलोड किया जा सकता है।",
        text2: "प्रोफाइल लिंक डालें और हमारा सिस्टम सभी हाइलाइट्स मीडिया को एक्सट्रैक्ट करके प्रस्तुत कर देगा।"
      },
      youtubeVideo: {
        title: "यूट्यूब वीडियो डाउनलोड",
        text1: "यूट्यूब के किसी भी वीडियो को सीधे फुल एचडी रिज़ॉल्यूशन में बहुत तेज़ गति से डाउनलोड करें।",
        text2: "हमारा टूल सीधे डायरेक्ट डाउनलोड लिंक प्रस्तुत करता है ताकि आप बिना बफरिंग के वीडियो सेव कर सकें।"
      },
      youtubeShorts: {
        title: "यूट्यूब शॉर्ट्स डाउनलोड",
        text1: "यूट्यूब के लोकप्रिय शॉर्ट्स वीडियो को सीधे अपनी स्थानीय गैलरी में डाउनलोड करें।",
        text2: "लिंक कॉपी करें, यहाँ पेस्ट करें और तुरंत शॉर्ट्स वीडियो सेव करने के विकल्प प्राप्त करें।"
      }
    }
  },
  bn: { 
    instagramText: "এখানে সমস্ত ইনস্টাগ্রাম মিডিয়া ডাউনলোড করুন!", 
    youtubeText: "এখানে সমস্ত ইউটিউব ভিডিও ও অডিও ডাউনলোড করুন!", 
    pastePlaceholder: "সঠিক লিঙ্কটি এখানে পেস্ট করুন...", 
    searchBtn: "অনুসন্ধান", 
    pasteBtn: "পেস্ট", 
    howTo: "৩টি সহজ ধাপে ডাউনলোড করুন", 
    faqTitle: "সচরাচর জিজ্ঞাস্য প্রশ্নাবলী", 
    startDownloadBtn: "ডাউনলোড শুরু করুন", 
    clearBtn: "মুছে ফেলুন", 
    mirrorBtn: "বিকল্প লিঙ্ক",
    steps: [
      { num: "01", title: "লিঙ্ক কপি করুন", desc: "ইনস্টাগ্রাম বা ইউটিউব খুলুন এবং যে ভিডিওটি ডাউনলোড করতে চান তার লিঙ্কটি কপি করুন।" },
      { num: "02", title: "LX-এ লিঙ্ক পেস্ট করুন", desc: "আমাদের সাইটে এসে সরাসরি পেস্ট বাটনে ক্লিক করুন।" },
      { num: "03", title: "ডাউনলোড সম্পন্ন করুন", desc: "আমাদের সিস্টেম ভিডিওটি প্রসেস করবে। প্রিভিউ এর নিচে 'ডাউনলোড শুরু করুন' বাটনে ক্লিক করে ফাইলটি সেভ করুন।" }
    ],
    faqs: [
      { question: "ইনস্টাগ্রাম ভিডিও ডাউনলোডার কি?", answer: "ইনস্টাগ্রাম ভিডিও ডাউনলোডার হলো একটি ওয়েব-ভিত্তিক ফ্রী টুল যার মাধ্যমে কোনো লগইন ছাড়াই ইনস্টাগ্রাম ভিডিও ডাউনলোড করা যায়।" },
      { question: "কিভাবে ইনস্টাগ্রাম ভিডিও ডাউনলোড করব?", answer: "প্রথমে লিঙ্ক কপি করুন। আমাদের সাইটে পেস্ট করে সার্চ বাটনে ক্লিক করুন। নিচে ডাউনলোড বোতামটি আসবে।" },
      { question: "অরিজিনাল কোয়ালিটিতে কি ভিডিও সেভ করা যায়?", answer: "হ্যাঁ, এটি সরাসরি ইনস্টাগ্রাম CDN থেকে অরিজিনাল ফুল এইচডি রেজোলিউশনে ফাইলগুলো ডাউনলোড করে।" },
      { question: "ডাউনলোডের কোনো সীমা আছে কি?", answer: "না, আমাদের ডাউনলোডার দিয়ে আনলিমিটেড ভিডিও এবং ফটো সম্পূর্ণ ফ্রীতে ডাউনলোড করতে পারবেন।" }
    ],
    tabTexts: {
      reels: {
        title: "ইনস্টাগ্রাম রিলস ডাউনলোড",
        text1: "ইনস্টাগ্রাম রিলস হলো ছোট ভিডিও শেয়ারিং ফিচার। LX-Downloader দিয়ে কোনো ওয়াটারমার্ক ছাড়া ১০৮০p এইচডি রেজোলিউশনে রিলস ডাউনলোড করতে পারবেন।",
        text2: "সহজেই রিলসের লিঙ্ক কপি করে পেস্ট করুন এবং গ্যালারিতে সেভ করুন।"
      },
      post: {
        title: "ইনস্টাগ্রাম পোস্ট ও ফটো ডাউনলোড",
        text1: "ইনস্টাগ্রাম ফটো এবং পোস্ট অরিজিনাল কোয়ালিটিতে সেভ করুন কোনো কম্প্রেশন ছাড়া।",
        text2: "ক্যারোসেল বা সিঙ্গেল পোস্টের লিঙ্ক পেস্ট করে সাথে সাথে ছবিগুলো সেভ করতে পারেন।"
      },
      story: {
        title: "ইনস্টাগ্রাম স্টোরি ডাউনলোড",
        text1: "স্টোরি ২৪ ঘণ্টা পর মুছে যায়। মুছে যাওয়ার আগেই যেকোনো পাবলিক প্রোফাইলের স্টোরি বেনামে সেভ করে রাখুন।",
        text2: "প্রোফাইলের ইউজারনেম দিয়ে সহজেই সমস্ত সক্রিয় স্টোরি ডাউনলোড করুন।"
      },
      dp: {
        title: "প্রোফাইল পিকচার ডাউনলোড",
        text1: "যেকোনো অ্যাকাউন্টের প্রোফাইল পিকচার ফুল এইচডি কোয়ালিটিতে দেখতে এবং সেভ করতে পারবেন।",
        text2: "ইউজারনেম বা লিঙ্ক পেস্ট করে সরাসরি অরিজিনাল সাইজে প্রোফাইল ফটো সেভ করুন।"
      },
      highlight: {
        title: "ইনস্টাগ্রাম হাইলাইট ডাউনলোড",
        text1: "প্রোফাইলের হাইলাইট স্টোরিগুলো সরাসরি উচ্চ রেজোলিউশনে সেভ করে নিন।",
        text2: "হাইলাইটের লিঙ্ক দিন এবং সমস্ত ছবি ও ভিডিও একসাথে সেভ করুন।"
      },
      youtubeVideo: {
        title: "ইউটিউব ভিডিও ডাউনলোড",
        text1: "ইউটিউবের যেকোনো ভিডিও এইচডি রেজোলিউশনে সর্বোচ্চ স্পিডে ডাউনলোড করুন।",
        text2: "আমরা ইউটিউব সার্ভার থেকে সরাসরি ভিডিও ডাউনলোড করার ক্লিন এমপি৪ লিঙ্ক প্রদান করি।"
      },
      youtubeShorts: {
        title: "ইউটিউব শর্টস ডাউনলোড",
        text1: "জনপ্রিয় ইউটিউব শর্টস ভিডিওগুলো ওয়াটারমার্ক ছাড়া সরাসরি মোবাইলের গ্যালারিতে সেভ করুন।",
        text2: "শর্টস ভিডিওর লিঙ্ক পেস্ট করে মাত্র এক ক্লিকে ডাউনলোড শুরু করুন।"
      }
    }
  },
  te: { 
    instagramText: "ఇక్కడ అన్ని ఇన్‌స్టాగ్రామ్ మీడియా డౌన్‌లోడ్ చేసుకోండి!", 
    youtubeText: "ఇక్కడ అన్ని యూట్యూబ్ వీడియోలను డౌన్‌లోడ్ చేయండి!", 
    pastePlaceholder: "లింక్ ఇక్కడ అతికించండి...", 
    searchBtn: "శోధించండి", 
    pasteBtn: "అతికించు", 
    howTo: "3 దశల్లో కంటెంట్ సేవ్ చేయండి", 
    faqTitle: "తరచుగా అడిగే ప్రశ్నలు", 
    startDownloadBtn: "డౌన్లోడ్ ప్రారంభించండి", 
    clearBtn: "క్లియర్ చేయి", 
    mirrorBtn: "ప్రత్యామ్నాయ లింక్",
    steps: [
      { num: "01", title: "లింక్ కాపీ చేయండి", desc: "మీరు డౌన్‌లోడ్ చేయాలనుకుంటున్న ఇన్‌స్టాగ్రామ్ లేదా యూట్యూబ్ వీడియో లింక్ కాపీ చేయండి." },
      { num: "02", title: "LX లో పేస్ట్ చేయండి", desc: "LX-Downloader లో 'పేస్ట్' బటన్‌పై క్లిక్ చేసి లింక్‌ను లోడ్ చేయండి." },
      { num: "03", title: "మీడియా డౌన్‌లోడ్ చేయండి", desc: "మా సిస్టమ్ లింక్‌ను శోధించి డౌన్‌లోడ్ బటన్‌ను సిద్ధం చేస్తుంది." }
    ],
    faqs: [
      { question: "ఇన్‌స్టాగ్రామ్ వీడియో డౌన్‌లోడర్ అంటే ఏమిటి?", answer: "ఇన్‌స్టాగ్రామ్ వీడియో డౌన్‌లోడర్ అనేది ఎటువంటి లాగిన్ లేకుండా ఉచితంగా వీడియోలు డౌన్‌లోడ్ చేసుకునే సాధనం." },
      { question: "ఇన్‌స్టాగ్రామ్ వీడియోను ఎలా డౌన్‌లోడ్ చేయాలి?", answer: "లింక్‌ను కాపీ చేసి ఇక్కడ పేస్ట్ చేసి శోధించండి, కింద డౌన్‌లోడ్ ఆప్షన్ వస్తుంది." },
      { question: "అసలైన క్వాలిటీలో డౌన్‌లోడ్ చేసుకోవచ్చా?", answer: "అవును, మా వెబ్ సైట్ ద్వారా అసలైన హెచ్‌డీ క్వాలిటీలో వీడియోలు సేవ్ చేసుకోవచ్చు." },
      { question: "డೌన్‌లోడ్ పరిమితి ఏమైనా ఉందా?", answer: "ఎటువంటి పరిమితులు లేవు, ఉచితంగా అపరిమితంగా డౌన్‌లోడ్ చేసుకోవచ్చు." }
    ],
    tabTexts: {
      reels: {
        title: "ఇన్‌స్టాగ్రామ్ రీల్స్ డౌన్‌లోడ్",
        text1: "ఇన్‌స్టాగ్రామ్ రీల్స్ వీడియోలను ఎటువంటి వాటర్ మార్క్ లేకుండా హెచ్‌డీ క్వాలిటీలో డౌన్‌లోడ్ చేసుకోండి.",
        text2: "రీల్స్ లింక్ కాపీ చేసి ఇక్కడ పేస్ట్ చేయడం ద్వారా నేరుగా మీ గ్యాలరీలోకి సేవ్ చేసుకోండి."
      },
      post: {
        title: "ఇన్‌స్టాగ్రామ్ పోస్ట్ & ఫోటో డౌన్‌లోడ్",
        text1: "పోస్ట్‌ల అసలైన గరిష్ట నాణ్యతలో ఫోటోలను ఎటువంటి క్వాలిటీ తగ్గకుండా సేవ్ చేసుకోండి.",
        text2: "లింక్ పేస్ట్ చేసిన వెంటనే ఫోటోలను డౌన్‌లోడ్ చేసుకునే ఆప్షన్ లభిస్తుంది."
      },
      story: {
        title: "ఇన్‌స్టాగ్రామ్ స్టోరీ డౌన్‌లోడ్",
        text1: "ఇన్‌స్టాగ్రామ్ స్టోరీలను అవి అదృశ్యమయ్యే లోపు సులభంగా సేవ్ చేసుకోండి.",
        text2: "ప్రొఫైల్ యూజర్‌నేమ్ టైప్ చేసి యాక్టివ్ స్టోరీలను సేవ్ చేసుకోండి."
      },
      dp: {
        title: "ప్రొఫైల్ పిక్చర్ డౌన్‌లోడ్",
        text1: "ఏదైనా ప్రొఫైల్ పిక్చర్‌ను పూర్తి అసలు పరిమాణంలో మరియు హెచ్‌డీ క్వాలిటీలో సేవ్ చేసుకోండి.",
        text2: "యూజర్‌నేమ్ పేస్ట్ చేసి ప్రొఫైల్ ఫోటోను డౌన్‌లోడ్ చేసుకోండి."
      },
      highlight: {
        title: "ఇన్‌స్టాగ్రామ్ హైలైట్స్ డౌన్‌లోడ్",
        text1: "హైలైట్స్ స్టోరీలను కూడా ఎటువంటి లాగిన్ లేకుండా సులభంగా డౌన్‌లోడ్ చేసుకోవచ్చు.",
        text2: "లింక్ ఇక్కడ పేస్ట్ చేసి హైలైట్స్ మీడియాను ఎక్స్‌ట్రాక్ట్ చేయండి."
      },
      youtubeVideo: {
        title: "యూట్యూబ్ వీడియో డౌన్‌లోడ్",
        text1: "యూట్యూబ్ నుండి హెచ్‌డీ వీడియోలను వేగంగా డౌన్‌లోడ్ చేసుకోండి.",
        text2: "ఎటువంటి బఫరింగ్ లేకుండా ఎంపీ4 రూపంలో నేరుగా మీ మొబైల్‌లో సేవ్ చేసుకోండి."
      },
      youtubeShorts: {
        title: "యూట్యూబ్ షార్ట్స్ డౌన్‌లోడ్",
        text1: "యూట్యూబ్ షార్ట్స్ వీడియోలను మీ ఫోన్ గ్యాలరీలోకి వేగంగా సేవ్ చేసుకోండి.",
        text2: "లింక్ కాపీ చేసి పేస్ట్ చేయడం ద్వారా కేవలం ఒకే క్లిక్‌తో డౌన్‌లోడ్ ప్రారంభించండి."
      }
    }
  },
  kn: {
    instagramText: "ಇಲ್ಲಿ ಎಲ್ಲಾ ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಮಾಧ್ಯಮಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ!",
    youtubeText: "ಇಲ್ಲಿ ಎಲ್ಲಾ ಯೂಟ್ಯೂಬ್ ವೀಡಿಯೊಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ!",
    pastePlaceholder: "ಲಿಂಕ್ ಅನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...",
    searchBtn: "ಹುಡುಕಿ",
    pasteBtn: "ಅಂಟಿಸಿ",
    howTo: "3 ಸುಲಭ ಹಂತಗಳಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ",
    faqTitle: "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
    startDownloadBtn: "ಡೌನ್‌ಲೋಡ್ ಪ್ರಾರಂಭಿಸಿ",
    clearBtn: "ತೆರವುಗೊಳಿಸಿ",
    mirrorBtn: "ರ್ಯಾಕ್ ಲಿಂಕ್",
    steps: [
      { num: "01", title: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ", desc: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಅಥವಾ ಯೂಟ್ಯೂಬ್ ತೆರೆಯಿರಿ, ನೀವು ಸೇವ್ ಮಾಡಲು ಇಚ್ಛಿಸುವ ವೀಡಿಯೊ ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ." },
      { num: "02", title: "LX ನಲ್ಲಿ ಅಂಟಿಸಿ", desc: "LX-Downloader ಗೆ ಭೇಟಿ ನೀಡಿ, 'ಅಂಟಿಸಿ' ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಲಿಂಕ್ ಅನ್ನು ಲೋಡ್ ಮಾಡಿ." },
      { num: "03", title: "ಮಾಧ್ಯಮ ಸೇವ್ ಮಾಡಿ", desc: "ನಮ್ಮ ಇಂಜಿನ್ ನಿಮ್ಮ ವೀಡಿಯೊವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಪ್ರತ್ಯೇಕ ಲಿಂಕ್ ನೀಡುತ್ತದೆ, ಕೆಳಗಿನ ಬಟನ್ ಬಳಸಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ." }
    ],
    faqs: [
      { question: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್ ಎಂದರೇನು?", answer: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್ ಲಾಗಿನ್ ಇಲ್ಲದೆ ಉಚಿತವಾಗಿ ವೀಡಿಯೊಗಳನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುವ ಒಂದು ವೆಬ್ ಸಾಧನವಾಗಿದೆ." },
      { question: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ವೀಡಿಯೊವನ್ನು ಡೌನ್‌ಲೋಡ್ ಮಾಡುವುದು ಹೇಗೆ?", answer: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ ಇಲ್ಲಿ ಅಂಟಿಸಿ ಹುಡುಕಿ ಕ್ಲಿಕ್ ಮಾಡಿ, ಕೆಳಗೆ ಡೌನ್‌ಲೋಡ್ ಬಟನ್ ಕಾಣಿಸುತ್ತದೆ." },
      { question: "ಮೂಲ ಗುಣಮಟ್ಟದಲ್ಲಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದೇ?", answer: "ಹೌದು, ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಸರ್ವರ್‌ನಿಂದ ನೇರ ಫುಲ್ ಹೆಚ್‌ಡಿ ಲಿಂಕ್‌ಗಳನ್ನು ಪಡೆಯಲು ಸಾಧ್ಯವಿದೆ." },
      { question: "ಡೌನ್‌ಲೋಡ್ ಮಾಡಲು ಮಿತಿ ಇದೆಯೇ?", answer: "ಯಾವುದೇ ಮಿತಿಗಳಿಲ್ಲ, ದಿನವಿಡೀ ಉಚಿತವಾಗಿ ಎಷ್ಟು ಬೇಕಾದರೂ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು." }
    ],
    tabTexts: {
      reels: {
        title: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ರೀಲ್ಸ್ ಡೌನ್‌ಲೋಡ್",
        text1: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ರೀಲ್ಸ್ ವೀಡಿಯೊಗಳನ್ನು ಯಾವುದೇ ವಾಟರ್‌ಮಾರ್ಕ್ ಇಲ್ಲದೆ ಹೆಚ್‌ಡಿ ಗುಣಮಟ್ಟದಲ್ಲಿ ಸೇವ್ ಮಾಡಿ.",
        text2: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ ಅಂಟಿಸಿ ಮತ್ತು ಗ್ಯಾಲರಿಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ."
      },
      post: {
        title: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಪೋಸ್ಟ್ ಡೌನ್‌ಲೋಡ್",
        text1: "ಫೋಟೋಗಳನ್ನು ಯಾವುದೇ ಕಂಪ್ರೆಷನ್ ಇಲ್ಲದೆ ಗರಿಷ್ಠ ಗುಣಮಟ್ಟದಲ್ಲಿ ಉಳಿಸಿಕೊಳ್ಳಿ.",
        text2: "ಪೋಸ್ಟ್ ಲಿಂಕ್ ನೀಡುವ ಮೂಲಕ ಫೋಟೋಗಳನ್ನು ನೇರವಾಗಿ ನಿಮ್ಮ ಸಾಧನಕ್ಕೆ ಸೇವ್ ಮಾಡಿ."
      },
      story: {
        title: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಸ್ಟೋರಿ ಡೌನ್‌ಲೋಡ್",
        text1: "೨೪ ಗಂಟೆಗಳ ನಂತರ ಅಳಿಸಿಹೋಗುವ ಸ್ಟೋರಿಗಳನ್ನು ಮುಂಚಿತವಾಗಿ ಸೇವ್ ಮಾಡಿಟ್ಟುಕೊಳ್ಳಿ.",
        text2: "ಬಳಕೆದಾರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ ಸ್ಟೋರಿಗಳನ್ನು ಅನಾಮಧೇಯವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ."
      },
      dp: {
        title: "ಪ್ರೊಫೈಲ್ ಪಿಕ್ಚರ್ ಡೌನ್‌ಲೋಡ್",
        text1: "ಯಾವುದೇ ಪ್ರೊಫೈಲ್ ಚಿತ್ರವನ್ನು ಪೂರ್ಣ ಗಾತ್ರದಲ್ಲಿ ವೀಕ್ಷಿಸಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
        text2: "ಬಳಕೆದಾರ ಹೆಸರು ಅಥವಾ ಪ್ರೊಫೈಲ್ ಲಿಂಕ್ ಬಳಸಿ ಫೋಟೋ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ."
      },
      highlight: {
        title: "ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್ ಹೈಲೈಟ್ಸ್ ಡೌನ್‌ಲೋಡ್",
        text1: "ಹೈಲೈಟ್ಸ್ ಮಾಧ್ಯಮಗಳನ್ನು ಸಹ ಲಾಗಿನ್ ಇಲ್ಲದೆ ಸುಲಭವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಬಹುದು.",
        text2: "ಲಿಂಕ್ ಬಳಸಿ ಇಡೀ ಹೈಲೈಟ್ಸ್ ಆಲ್ಬಂ ಅನ್ನು ಹೊರತೆಗೆಯಿರಿ."
      },
      youtubeVideo: {
        title: "ಯೂಟ್ಯೂಬ್ ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡ್",
        text1: "ಯೂಟ್ಯೂಬ್ ವೀಡಿಯೊಗಳನ್ನು ಅತ್ಯಂತ ವೇಗವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
        text2: "ನಮ್ಮ ಸಾಧನವು ನೇರ ಡೌನ್‌ಲೋಡ್ ಲಿಂಕ್ ಒದಗಿಸುತ್ತದೆ."
      },
      youtubeShorts: {
        title: "ಯೂಟ್ಯೂಬ್ ಶಾರ್ಟ್ಸ್ ಡೌನ್‌ಲೋಡ್",
        text1: "ಶಾರ್ಟ್ಸ್ ವೀಡಿಯೊಗಳನ್ನು ನೇರವಾಗಿ ಮೊಬೈಲ್ ಗ್ಯಾಲರಿಗೆ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
        text2: "ಲಿಂಕ್ ಕಾಪಿ ಮಾಡಿ ಕೇವಲ ಒಂದು ಕ್ಲಿಕ್ ಮೂಲಕ ಡೌನ್‌ಲೋಡ್ ಪ್ರಾರಂಭಿಸಿ."
      }
    }
  },
  ml: {
    instagramText: "എല്ലാ ഇൻസ്റ്റാഗ്രാം മീഡിയയും ഇവിടെ ഡൗൺലോഡ് ചെയ്യുക!",
    youtubeText: "എല്ലാ യൂറ്റ്യൂബ് വീഡിയോകളും ഇവിടെ ഡൗൺലോഡ് ചെയ്യുക!",
    pastePlaceholder: "ലിങ്ക് ഇവിടെ ഒട്ടിക്കുക...",
    searchBtn: "തിരയുക",
    pasteBtn: "ഒട്ടിക്കുക",
    howTo: "3 ലളിതമായ ഘട്ടങ്ങളിലൂടെ സേവ് ചെയ്യാം",
    faqTitle: "പതിവായി ചോദിക്കുന്ന ചോദ്യങ്ങൾ",
    startDownloadBtn: "ಡೌൺലോഡ് ആരംഭിക്കുക",
    clearBtn: "മായ്ക്കുക",
    mirrorBtn: "മിറർ ലിങ്ക്",
    steps: [
      { num: "01", title: "ലിങ്ക് കോപ്പി ചെയ്യുക", desc: "ഇൻസ്റ്റാഗ്രാം അല്ലെങ്കിൽ യൂട്യൂബ് തുറന്ന് നിങ്ങൾ ഡൗൺലോഡ് ചെയ്യാൻ ആഗ്രഹിക്കുന്ന മീഡിയ ലിങ്ക് കോപ്പി ചെയ്യുക." },
      { num: "02", title: "ഇവിടെ ഒട്ടിക്കുക", desc: "LX-Downloader-ൽ വന്ന് 'ഒട്ടിക്കുക' ബട്ടൺ ക്ലിക്ക് ചെയ്ത് ലിങ്ക് ഇവിടെ നൽകുക." },
      { num: "03", title: "ഡൗൺലോഡ് ചെയ്യുക", desc: "ഞങ്ങളുടെ സിസ്റ്റം വണ്ടി ഫയൽ വിശകലനം ചെയ്ത ശേഷം ലഭിക്കുന്ന ബട്ടൺ ക്ലിക്ക് ചെയ്ത് ഫയൽ ഡൗൺലോഡ് ചെയ്യുക." }
    ],
    faqs: [
      { question: "ഇൻസ്റ്റാഗ്രാം വീഡിയോ ഡൗൺലോഡർ എന്നാൽ എന്താണ്?", answer: "ലോഗിൻ വിവരങ്ങൾ നൽകാതെ തന്നെ ഇൻസ്റ്റാഗ്രാമിൽ നിന്നും വീഡിയോകൾ ഡൗൺലോഡ് ചെയ്യാൻ സഹായിക്കുന്ന സൗജന്യ ടൂളാണിത്." },
      { question: "ഇൻസ്റ്റാഗ്രാം വീഡിയോ എങ്ങനെ ഡൗൺലോഡ് ചെയ്യാം?", answer: "വീഡിയോ ലിങ്ക് കോപ്പി ചെയ്ത് ഇവിടെ ഒട്ടിച്ച് തിരയുക, താഴെ ഡൗൺലോഡ് ബട്ടൺ വരും." },
      { question: "യഥാർത്ഥ ക്വാളിറ്റിയിൽ ഡൗൺലോഡ് ചെയ്യാൻ പറ്റുമോ?", answer: "അതെ, ഫുൾ എച്ച്ഡി ക്വാളിറ്റിയിൽ തന്നെ വീഡിയോകൾ മൊബൈലിൽ സേവ് ചെയ്യാം." },
      { question: "ഡൗൺലോഡ് ചെയ്യാൻ എന്തെങ്കിലും ലിമിറ്റ് ഉണ്ടോ?", answer: "ഒരു ലിമിറ്റും ഇല്ല, എത്ര വീഡിയോകൾ വേണമെങ്കിലും തികച്ചും സൗജന്യമായി ഡൗൺലോഡ് ചെയ്യാം." }
    ],
    tabTexts: {
      reels: {
        title: "ഇൻസ്റ്റാഗ്രാം റീൽസ് ഡൗൺലോഡ്",
        text1: "റീൽസ് വീഡിയോകൾ വാട്ടർമാർക്ക് ഇല്ലാതെ എച്ച്ഡി ക്വാളിറ്റിയിൽ ഡൗൺലോഡ് ചെയ്യുക.",
        text2: "ലിങ്ക് കോപ്പി ചെയ്ത് ഇവിടെ ഒട്ടിച്ച് ഗാലറിയിലേക്ക് നേരിട്ട് സേവ് ചെയ്യാം."
      },
      post: {
        title: "ഇൻസ്റ്റാഗ്രാം പോസ്റ്റ് & ഫോട്ടോ ഡൗൺലോഡ്",
        text1: "ഫോട്ടോകൾ ഒറിജിനൽ റെസല്യൂഷനിൽ യാതൊരു കംപ്രഷനും കൂടാതെ ഡൗൺലോഡ് ചെയ്യാം.",
        text2: "ലിങ്ക് ഒട്ടിച്ചാൽ ഫോട്ടോകൾ ഡൗൺലോഡ് ചെയ്യാനുള്ള ഓപ്ഷൻ റെഡിയാകും."
      },
      story: {
        title: "ഇൻസ്റ്റാഗ്രാം സ്റ്റോറി ഡൗൺലോഡ്",
        text1: "24 മണിക്കൂറിന് ശേഷം അപ്രത്യക്ഷമാകുന്ന സ്റ്റോറികൾ മുൻകൂട്ടി സേവ് ചെയ്യാം.",
        text2: "പ്രൊഫൈൽ യൂസർനെയിം നൽകി സ്റ്റോറികൾ രഹസ്യമായി ഡൗൺലോഡ് ചെയ്യാം."
      },
      dp: {
        title: "പ്രൊഫൈൽ പിക്ചർ ഡൗൺലോഡ്",
        text1: "ഏതൊരു പ്രൊഫൈൽ പിക്ചറും യഥാർത്ഥ വലുപ്പത്തിൽ ഡൗൺലോഡ് ചെയ്യാം.",
        text2: "യൂസർനെയിം നൽകി പ്രൊഫൈൽ ഫോട്ടോ സേവ് ചെയ്യാം."
      },
      highlight: {
        title: "ഇൻസ്റ്റാഗ്രാം ഹൈലൈറ്റ്സ് ഡൗൺലോഡ്",
        text1: "പ്രൊഫൈലിലെ ഹൈലൈറ്റുകൾ ലോഗിൻ ഇല്ലാതെ തന്നെ ഡൗൺലോഡ് ചെയ്യാം.",
        text2: "ഹൈലൈറ്റ് ലിങ്ക് നൽകി അതിലെ ചിത്രങ്ങളും വീഡിയോകളും വേർതിരിച്ചെടുക്കാം."
      },
      youtubeVideo: {
        title: "യൂട്യൂബ് വീഡിയോ ഡൗൺലോഡ്",
        text1: "യൂട്യൂബ് വീഡിയോകൾ വളരെ വേഗത്തിൽ ഡൗൺലോഡ് ചെയ്യാം.",
        text2: "ഞങ്ങളുടെ ഉപകരണം വഴി എംപി4 രൂപത്തിൽ ഫയലുകൾ ഡൗൺലോഡ് ചെയ്യാം."
      },
      youtubeShorts: {
        title: "യൂട്യൂബ് ഷോർട്ട്സ് ഡൗൺലോഡ്",
        text1: "യൂട്യൂബ് ഷോർട്ട്സ് വീഡിയോകൾ ഫോൺ ഗാലറിയിലേക്ക് വേഗത്തിൽ സേവ് ചെയ്യാം.",
        text2: "ലിങ്ക് കോപ്പി ചെയ്ത് ഒട്ടിച്ച് ഒരു ക്ലിക്കിലൂടെ ഡൗൺലോഡ് ചെയ്യാം."
      }
    }
  },
  mr: {
    instagramText: "येथे सर्व इंस्टाग्राम मीडिया डाउनलोड करा!",
    youtubeText: "येथे सर्व यूट्यूब व्हिडिओ डाउनलोड करा!",
    pastePlaceholder: "लिंक येथे पेस्ट करा...",
    searchBtn: "शोधा",
    pasteBtn: "पेस्ट करा",
    howTo: "3 सोप्या पायऱ्यांमध्ये डाउनलोड करा",
    faqTitle: "नेहमी विचारले जाणारे प्रश्न",
    startDownloadBtn: "डाउनलोड सुरू करा",
    clearBtn: "साफ करा",
    mirrorBtn: "पर्यायी लिंक",
    steps: [
      { num: "01", title: "लिंक कॉपी करा", desc: "इंस्टाग्राम किंवा यूट्यूब उघडून ज्या व्हिडिओची लिंक डाउनलोड करायची आहे ती कॉपी करा." },
      { num: "02", title: "LX मध्ये पेस्ट करा", desc: "LX-Downloader वर या आणि 'पेस्ट करा' बटन दाबून लिंक सबमिट करा." },
      { num: "03", title: "मीडिया डाउनलोड करा", desc: "आमचे इंजिन त्वरित व्हिडिओ लिंक तयार करेल, खालील बटनावर क्लिक करून फाईल सेव्ह करा." }
    ],
    faqs: [
      { question: "इंस्टाग्राम व्हिडिओ डाउनलोडर काय आहे?", answer: "लॉगिन तपशील न देता इंस्टाग्रामवरील व्हिडिओ विनामूल्य डाउनलोड करण्याचे हे एक सोपे साधन आहे." },
      { question: "इंस्टाग्राम व्हिडिओ कसा डाउनलोड करायचा?", answer: "व्हिडिओची लिंक कॉपी करून येथे पेस्ट करा, शोध वर क्लिक करा आणि खाली डाउनलोड बटण येईल." },
      { question: "मूळ गुणवत्तेत डाउनलोड करता येईल का?", answer: "होय, थेट इंस्टाग्राम CDN वरून एचडी गुणवत्तेत फाईल सेव्ह करता येते." },
      { question: "डाउनलोड करण्याची मर्यादा आहे का?", answer: "कोणतीही मर्यादा नाही, विनामूल्य अमर्यादित व्हिडिओ डाउनलोड करू शकता." }
    ],
    tabTexts: {
      reels: {
        title: "इंस्टाग्राम रील्स डाउनलोड",
        text1: "रील्स व्हिडिओ वॉटरमार्कशिवाय १०८०p एचडी गुणवत्तेत सेव्ह करा.",
        text2: "लिंक कॉपी करून येथे पेस्ट करा आणि गॅलरीमध्ये सेव्ह करा."
      },
      post: {
        title: "इंस्टाग्राम पोस्ट डाउनलोड",
        text1: "फोटो कोणत्याही गुणवत्तेचे नुकसान न होता मूळ आकारात सेव्ह करा.",
        text2: "लिंक पेस्ट करून पोस्टमधील सर्व फोटो त्वरित डाउनलोड करा."
      },
      story: {
        title: "इंस्टाग्राम स्टोरी डाउनलोड",
        text1: "२४ तासानंतर गायब होणाऱ्या स्टोरीज अगोदरच सेव्ह करून ठेवा.",
        text2: "वापरकर्ता नाव टाकून स्टोरीज निनावीपणे डाउनलोड करा."
      },
      dp: {
        title: "प्रोफाइल पिक्चर डाउनलोड",
        text1: "कोणताही प्रोफाइल फोटो मूळ आकारात पहा आणि डाउनलोड करा.",
        text2: "वापरकर्ता नाव किंवा प्रोफाइल लिंक टाकून फोटो जतन करा."
      },
      highlight: {
        title: "इंस्टाग्राम हायलाइट्स डाउनलोड",
        text1: "हायलाइट्स स्टोरीज देखील लॉगिनशिवाय सहज डाउनलोड करता येतात.",
        text2: "लिंक येथे पेस्ट करा आणि हायलाइट्स मीडिया मिळवा."
      },
      youtubeVideo: {
        title: "यूट्यूब व्हिडिओ डाउनलोड",
        text1: "यूट्यूबवरील व्हिडिओ अत्यंत वेगाने डाउनलोड करा.",
        text2: "थेट डाउनलोड करण्यासाठी एमपी४ फॉरमॅटमध्ये फाईल उपलब्ध होते."
      },
      youtubeShorts: {
        title: "यूट्यूब शॉर्ट्स डाउनलोड",
        text1: "यूट्यूब शॉर्ट्स व्हिडिओ गॅलरीमध्ये जलद सेव्ह करा.",
        text2: "लिंक कॉपी करा, येथे पेस्ट करा आणि एका क्लिकवर डाउनलोड करा."
      }
    }
  }
};

const MOCK_RESULTS = {
  instagram: {
    user: "nomad_traveler",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    type: "Instagram Media",
    items: [
      { id: "1", type: "video", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80", tag: "LX Media Content Clip" }
    ]
  },
  youtube: {
    user: "travel_vlogger",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    type: "YouTube Media",
    items: [
      { id: "1", type: "video", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=80", tag: "10 Places to Visit in Switzerland in 2026" }
    ]
  }
};

export default function Home() {
  const pathname = usePathname();

  // Level 1: Platform Selection (instagram vs youtube)
  const [platform, setPlatform] = useState<"instagram" | "youtube">("instagram");
  
  // Level 2: Sub-tab selection (Instagram: Reels, Post, Story, DP, Highlight; YouTube: Video, Shorts)
  const [subTab, setSubTab] = useState<string>("reels");

  // Reset sub-tab when parent platform changes
  useEffect(() => {
    if (platform === "youtube") {
      setSubTab("youtubeVideo");
    } else {
      setSubTab("reels");
    }
  }, [platform]);

  const [inputUrl, setInputUrl] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Analyzing Link...");
  const [result, setResult] = useState<any>(null);
  
  // Set first FAQ open by default (index 0) matching user screenshot
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const downloaderRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Client-side query parameters parsing (avoids React Suspense bailout)
  const [langCode, setLangCode] = useState("en");

  useEffect(() => {
    const parseLang = () => {
      const params = new URLSearchParams(window.location.search);
      setLangCode(params.get("lang") || "en");
    };
    parseLang();
    window.addEventListener("popstate", parseLang);
    return () => window.removeEventListener("popstate", parseLang);
  }, [pathname]);

  // Clear states when subTab changes
  useEffect(() => {
    setInputUrl("");
    setErrorMsg("");
    setResult(null);
  }, [subTab]);

  // Trigger real search extraction directly against the Python backend
  const triggerSearchDirect = async (url: string) => {
    const trimmed = url.trim();
    if (!trimmed) {
      setErrorMsg("Please paste a valid URL link.");
      return;
    }
    
    // Strict category validation per active tab & subTab
    const lower = trimmed.toLowerCase();

    if (platform === "youtube") {
      if (!lower.includes("youtube.com") && !lower.includes("youtu.be")) {
        setErrorMsg("Please enter a valid YouTube link.");
        return;
      }

      if (subTab === "youtubeShorts") {
        if (!lower.includes("/shorts/")) {
          setErrorMsg("This is a standard YouTube Video link. Please select the 'Video' tab to download regular videos.");
          return;
        }
      } else if (subTab === "youtubeVideo") {
        if (lower.includes("/shorts/")) {
          setErrorMsg("This is a YouTube Shorts link. Please select the 'Shorts' tab to download shorts.");
          return;
        }
      }
    } else {
      // Instagram platform validation
      if (!lower.includes("instagram.com") && lower.includes("http")) {
        setErrorMsg("Please enter a valid Instagram link.");
        return;
      }

      const isReel = lower.includes("/reel/") || lower.includes("/reels/");
      const isPost = lower.includes("/p/");
      const isHighlight = lower.includes("/stories/highlights/") || lower.includes("/highlights/");
      const isStory = lower.includes("/stories/") && !isHighlight;

      if (subTab === "reels") {
        if (isPost) {
          setErrorMsg("This is an Instagram Post link. Please switch to the 'Post' tab to download posts.");
          return;
        }
        if (isStory) {
          setErrorMsg("This is an Instagram Story link. Please switch to the 'Story' tab to download stories.");
          return;
        }
        if (isHighlight) {
          setErrorMsg("This is an Instagram Highlight link. Please switch to the 'Highlight' tab.");
          return;
        }
        if (!isReel) {
          setErrorMsg("Please enter a valid Instagram Reels link (e.g., https://www.instagram.com/reel/...).");
          return;
        }
      } else if (subTab === "post") {
        if (isReel) {
          setErrorMsg("This is an Instagram Reel link. Please switch to the 'Reels' tab to download reels.");
          return;
        }
        if (isStory) {
          setErrorMsg("This is an Instagram Story link. Please switch to the 'Story' tab to download stories.");
          return;
        }
        if (isHighlight) {
          setErrorMsg("This is an Instagram Highlight link. Please switch to the 'Highlight' tab.");
          return;
        }
        if (!isPost) {
          setErrorMsg("Please enter a valid Instagram Post link (e.g., https://www.instagram.com/p/...).");
          return;
        }
      } else if (subTab === "story") {
        if (isReel) {
          setErrorMsg("This is an Instagram Reel link. Please switch to the 'Reels' tab.");
          return;
        }
        if (isPost) {
          setErrorMsg("This is an Instagram Post link. Please switch to the 'Post' tab.");
          return;
        }
        if (isHighlight) {
          setErrorMsg("This is an Instagram Highlight link. Please switch to the 'Highlight' tab.");
          return;
        }
        if (!isStory) {
          setErrorMsg("Please enter a valid Instagram Story link (e.g., https://www.instagram.com/stories/username/...).");
          return;
        }
      } else if (subTab === "highlight") {
        if (isReel) {
          setErrorMsg("This is an Instagram Reel link. Please switch to the 'Reels' tab.");
          return;
        }
        if (isPost) {
          setErrorMsg("This is an Instagram Post link. Please switch to the 'Post' tab.");
          return;
        }
        if (isStory) {
          setErrorMsg("This is an Instagram Story link. Please switch to the 'Story' tab.");
          return;
        }
        if (!isHighlight) {
          setErrorMsg("Please enter a valid Instagram Highlight link (e.g., https://www.instagram.com/stories/highlights/...).");
          return;
        }
      } else if (subTab === "dp") {
        if (isReel || isPost || isStory || isHighlight) {
          setErrorMsg("This is a post/reel/story link. Please enter a profile link (e.g., https://www.instagram.com/username/) to download DP.");
          return;
        }
      }
    }

    setErrorMsg("");
    setLoading(true);
    setProgress(15);
    setResult(null);

    const connectingText = langCode === "hi" ? "सर्वर से कनेक्ट हो रहा है..." : "Connecting to media server...";
    const parsingText = langCode === "hi" ? "मीडिया स्ट्रीम पार्स की जा रही है..." : "Parsing video stream...";
    const fetchingText = langCode === "hi" ? "डाउनलोड विवरण प्राप्त हो रहे हैं..." : "Fetching download details...";

    setLoadingText(connectingText);

    // Smooth progress simulation while backend extracts
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 80) return prev + Math.floor(Math.random() * 12) + 5;
        return prev;
      });
    }, 200);

    try {
      setTimeout(() => setLoadingText(parsingText), 600);
      
      const response = await fetch(`/api/py/extract?url=${encodeURIComponent(trimmed)}`);
      const data = await response.json();

      clearInterval(progressTimer);
      setProgress(95);
      setLoadingText(fetchingText);

      if (!response.ok || !data.success) {
        throw new Error(data.detail || "Unable to extract media from this URL. Please ensure the link is public.");
      }

      setProgress(100);
      setTimeout(() => {
        setLoading(false);
        setResult({
          platform: data.platform || platform,
          video_id: data.video_id || "",
          user: data.author || (platform === "instagram" ? "instagram_creator" : "youtube_creator"),
          avatar: data.avatar || data.thumbnail,
          thumbnail: data.thumbnail || data.avatar || "",
          type: data.type || "video",
          title: data.title,
          download_url: data.download_url,
          options: data.options || [],
          items: [
            {
              id: "1",
              type: data.type,
              url: data.thumbnail || data.avatar,
              tag: data.title,
              download_url: data.download_url,
            }
          ]
        });
      }, 300);

    } catch (err: any) {
      clearInterval(progressTimer);
      setLoading(false);
      setErrorMsg(err.message || "Failed to download media. Please ensure the Python backend is running.");
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text && text.trim()) {
          setInputUrl(text.trim());
          triggerSearchDirect(text.trim());
          return;
        }
      }
    } catch {
      // Gracefully ignore permission rejection and focus input instead of showing alert error
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClear = () => {
    setInputUrl("");
    setErrorMsg("");
    setResult(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleClearResult = () => {
    setResult(null);
    setInputUrl("");
    setErrorMsg("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleDownloadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputUrl.trim()) {
      setErrorMsg("Please paste a valid URL link.");
      return;
    }
    triggerSearchDirect(inputUrl);
  };

  const triggerDownloadAction = (downloadUrl?: string, filename?: string) => {
    const url = downloadUrl || result?.download_url || result?.items?.[0]?.download_url;
    if (!url) {
      alert("Download stream link is currently processing. Please try again.");
      return;
    }
    
    const title = filename || result?.title || result?.items?.[0]?.tag || "LX_Media_Download";
    const ext = url.includes(".jpg") || url.includes(".png") || result?.type?.toLowerCase().includes("image") ? "jpg" : "mp4";
    const cleanFilename = `${title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 50)}.${ext}`;
    
    // Call the Python backend proxy endpoint to force native attachment download
    const proxyDownloadUrl = `/api/py/download?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(cleanFilename)}`;
    
    const link = document.createElement("a");
    link.href = proxyDownloadUrl;
    link.download = cleanFilename;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get active localization vocabulary
  const d = VOCABULARY[langCode] || VOCABULARY.en;
  
  // Get active tab descriptions and details from localized dictionary
  const fallbackTexts = VOCABULARY.en.tabTexts[subTab] || VOCABULARY.en.tabTexts.reels;
  const desc = d.tabTexts ? (d.tabTexts[subTab] || fallbackTexts) : fallbackTexts;

  // Fallback to English steps/faqs if the selected language does not define them
  const steps = d.steps || VOCABULARY.en.steps;
  const faqs = d.faqs || VOCABULARY.en.faqs;

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 overflow-x-clip transition-colors duration-300">
      {/* Downloader Section */}
      <section className="relative pt-6 pb-12 sm:pt-10 sm:pb-16 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 text-center w-full">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[500px] md:w-[600px] h-[300px] sm:h-[500px] md:h-[600px] bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Brand Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/5 text-blue-600 text-[11px] sm:text-xs font-bold mb-6 sm:mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
          100% Free & Unlimited Downloader
        </div>

        {/* Downloader panel box (Completely BORDERLESS, shadow-based card) */}
        <div ref={downloaderRef} id="downloader" className="scroll-mt-20 sm:scroll-mt-24 max-w-5xl mx-auto">
          
          {/* LEVEL 1 PLATFORM TABS: INSTAGRAM vs YOUTUBE */}
          <div className="grid grid-cols-2 bg-white rounded-t-2xl sm:rounded-t-3xl overflow-hidden shadow-xl shadow-slate-100 relative">
            
            {/* Instagram Tab */}
            <button
              onClick={() => setPlatform("instagram")}
              className={`relative py-4 sm:py-5 flex items-center justify-center gap-2 sm:gap-2.5 font-extrabold text-xs sm:text-base tracking-wide transition-all active:scale-[0.98] cursor-pointer outline-none z-10 ${
                platform === "instagram" ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <InstagramIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              INSTAGRAM
              
              {platform === "instagram" && (
                <motion.div
                  layoutId="activePlatform"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* YouTube Tab */}
            <button
              onClick={() => setPlatform("youtube")}
              className={`relative py-4 sm:py-5 flex items-center justify-center gap-2 sm:gap-2.5 font-extrabold text-xs sm:text-base tracking-wide transition-all active:scale-[0.98] cursor-pointer outline-none z-10 ${
                platform === "youtube" ? "text-blue-600" : "text-slate-500"
              }`}
            >
              <YoutubeIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              YOUTUBE

              {platform === "youtube" && (
                <motion.div
                  layoutId="activePlatform"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          </div>

          {/* Level 2 Subpanel (Borderless shadow card) */}
          <div className="bg-slate-100 backdrop-blur-md p-4 sm:p-6 md:p-10 rounded-b-2xl sm:rounded-b-3xl shadow-xl shadow-slate-100/60 relative overflow-hidden transition-colors duration-300">
            {/* Header Text */}
            <span className="block text-[10px] sm:text-xs font-black tracking-widest text-blue-600 mb-4 sm:mb-6 text-center select-none uppercase">
              {platform === "instagram" ? d.instagramText : d.youtubeText}
            </span>

            {/* LEVEL 2 SUBTABS */}
            <div className="mb-6 sm:mb-8">
              <AnimatePresence mode="wait">
                {platform === "instagram" ? (
                  /* Instagram Subtabs: Reels, Post, Story, DP, Highlight */
                  <motion.div
                    key="instagram-tabs"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-in"
                  >
                    {[
                      { id: "reels", label: "Reels", icon: Film },
                      { id: "post", label: "Post", icon: ImageIcon },
                      { id: "story", label: "Story", icon: Compass },
                      { id: "dp", label: "DP", icon: UserCheck },
                      { id: "highlight", label: "Highlight", icon: Download }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSubTab(tab.id)}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-3 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                            subTab === tab.id
                              ? "bg-white text-blue-600 shadow-md"
                              : "bg-white/40 text-slate-650 hover:bg-white"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </motion.div>
                ) : (
                  /* YouTube Subtabs: Video & Shorts only */
                  <motion.div
                    key="youtube-tabs"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 animate-fade-in"
                  >
                    {[
                      { id: "youtubeVideo", label: "Video", icon: Play },
                      { id: "youtubeShorts", label: "Shorts", icon: Film }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setSubTab(tab.id)}
                          className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 px-4 sm:py-3 sm:px-6 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-bold transition-all duration-200 active:scale-95 cursor-pointer ${
                            subTab === tab.id
                              ? "bg-white text-blue-600 shadow-md"
                              : "bg-white/40 text-slate-655 hover:bg-white"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sub-tab Dynamic Title */}
            <h2 className="text-lg sm:text-2xl font-black text-slate-905 mb-4 sm:mb-6">
              {desc.title}
            </h2>

            {/* Downloader Form Area (Borderless input) */}
            <div className="max-w-4xl mx-auto">
              <form
                onSubmit={handleDownloadSubmit}
                className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch"
              >
                <div className="relative flex-1 bg-white rounded-2xl shadow-inner flex items-center px-3.5 py-1 sm:py-0 transition-all border border-slate-200/80 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <div className="text-slate-400 pointer-events-none shrink-0 pr-2">
                    <Link2 className="w-5 h-5 text-blue-600/70" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder={d.pastePlaceholder}
                    className="flex-1 min-w-0 py-3.5 text-xs sm:text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 ring-0 focus:outline-none focus:ring-0"
                  />

                  {/* Context-aware Actions: If link exists, show Clear (X); if empty, show Paste button */}
                  <div className="flex items-center shrink-0 pl-1.5">
                    {inputUrl ? (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
                        title="Clear link"
                        aria-label="Clear link"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handlePaste}
                        className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-all cursor-pointer active:scale-95"
                      >
                        {d.pasteBtn}
                      </button>
                    )}
                  </div>
                </div>

                {/* Searching Trigger Button - Fixed Solid Blue */}
                <button
                  type="submit"
                  disabled={loading}
                  className="py-3.5 px-6 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
                >
                  {loading ? (
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <Search className="w-4.5 h-4.5" />
                  )}
                  {d.searchBtn}
                </button>
              </form>

              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3.5 p-3.5 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-xs sm:text-sm font-semibold flex items-center gap-2.5 text-left shadow-sm max-w-xl mx-auto"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}
            </div>

            {/* Simulated Progress Loader */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-8 py-6 flex flex-col items-center justify-center space-y-4"
                >
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-slate-200 fill-none"
                        strokeWidth="4"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        className="stroke-blue-600 fill-none"
                        strokeWidth="4"
                        strokeDasharray={175.8}
                        strokeDashoffset={175.8 - (175.8 * progress) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-black text-slate-855">{progress}%</span>
                    </div>
                  </div>
                  <h3 className="text-xs font-bold text-slate-650 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    {loadingText}
                  </h3>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Dynamic Results Card Panel - Clean Full Video Player & Solid Blue Download Button */}
            <AnimatePresence>
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="mt-8 p-4 sm:p-6 bg-white rounded-3xl text-center max-w-lg mx-auto shadow-2xl shadow-slate-100 flex flex-col items-center gap-5"
                >
                  {/* Full Playable Video or Full Image Preview */}
                  {result.platform === "youtube" && result.video_id ? (
                    <div className={`w-full ${subTab === "youtubeShorts" ? "max-w-[280px] sm:max-w-[320px] aspect-[9/16]" : "max-w-md aspect-video"} mx-auto rounded-2xl overflow-hidden bg-black shadow-lg relative`}>
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${result.video_id}?rel=0&modestbranding=1`}
                        title={result.title}
                        className="w-full h-full border-0 rounded-2xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-md rounded-2xl overflow-hidden bg-black shadow-lg flex items-center justify-center relative">
                      {result.type === "video" || result.download_url?.includes(".mp4") ? (
                        <video
                          src={result.download_url}
                          poster={result.thumbnail || result.avatar}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-[540px] object-contain mx-auto"
                        />
                      ) : (
                        <img
                          src={result.download_url || result.thumbnail || result.avatar}
                          alt="Media Preview"
                          className="w-full max-h-[540px] object-contain mx-auto"
                        />
                      )}
                    </div>
                  )}

                  {/* Clean Solid Blue Download Now Button */}
                  <div className="w-full max-w-md flex flex-col gap-2.5">
                    <button
                      onClick={() => triggerDownloadAction(result.download_url, result.title)}
                      className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base tracking-wider active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 group"
                    >
                      <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                      DOWNLOAD NOW
                    </button>

                    {/* Carousel Items or Additional Format Options */}
                    {result.options && result.options.length > 1 && (
                      <div className="flex flex-wrap gap-2 pt-1 justify-center">
                        {result.options.map((opt: any) => (
                          <button
                            key={opt.id}
                            onClick={() => triggerDownloadAction(opt.url, (result.title || "Media") + "_" + opt.id)}
                            className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 text-xs font-bold transition-all cursor-pointer active:scale-95 border border-slate-200"
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={handleClearResult}
                      className="text-xs font-bold text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
                    >
                      {d.clearBtn}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Description Info Section with Smooth Scroll-In Motion */}
      <motion.section 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="bg-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-100"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-600 mb-6 text-center sm:text-left">
            {desc.title}
          </h2>
          <div className="space-y-4 text-sm sm:text-base text-slate-600 leading-relaxed">
            <p>{desc.text1}</p>
            <p>{desc.text2}</p>
          </div>
        </div>
      </motion.section>

      {/* Steps Section with Smooth Scroll-In Motion */}
      <motion.section 
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        className="bg-slate-50 border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
              {d.howTo}
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {steps.map((step: any) => (
              <div
                key={step.num}
                className="relative w-full sm:w-[calc(50%-16px)] lg:w-[calc(33.333%-22px)] bg-white p-6 sm:p-8 rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <span className="text-4xl sm:text-5xl font-black text-blue-600/40 absolute top-4 right-6 font-mono select-none">
                  {step.num}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mb-3 mt-1 pr-12">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stacked Accordion FAQs with Smooth Scroll-In Motion */}
      <motion.section 
        initial={{ opacity: 0, y: 45 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-slate-50 border-t border-slate-100 py-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-4">
              {d.faqTitle}
            </h2>
          </div>

          {/* Single stack card layout with dividing thin lines (no borders) */}
          <div className="rounded-3xl bg-white overflow-hidden shadow-2xl shadow-slate-100 divide-y divide-slate-100">
            {faqs.map((faq: any, index: number) => (
              <div key={index} className="transition-colors">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left text-sm sm:text-base font-bold select-none cursor-pointer outline-none active:scale-[0.99] transition-transform"
                >
                  <span className={openFaq === index ? "text-blue-600 font-extrabold" : "text-slate-800"}>
                    {faq.question}
                  </span>
                  <div className={`transition-transform duration-300 text-slate-400 ${openFaq === index ? "rotate-180 text-blue-600" : ""}`}>
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {openFaq === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-500 leading-relaxed border-t border-dashed border-slate-100/40">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
