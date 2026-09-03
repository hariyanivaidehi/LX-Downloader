"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Share2 } from "lucide-react";
import { motion } from "framer-motion";

// Local Custom Brand Icon SVGs (Original Logos)
const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

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
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const WhatsappIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
  >
    <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.761.461 3.479 1.336 5.001L2 22l5.161-1.353a9.928 9.928 0 004.851 1.258c5.506 0 9.988-4.482 9.988-9.988S17.518 2 12.012 2zm6.657 14.15c-.273.76-1.572 1.393-2.154 1.46-.576.066-1.152.099-3.794-.972-3.379-1.371-5.556-4.805-5.722-5.025-.165-.22-1.336-1.781-1.336-3.398 0-1.617.842-2.409 1.142-2.723.303-.314.66-.39.882-.39.223 0 .446.002.639.01.2.009.472-.076.739.566.273.66.936 2.278 1.018 2.443.085.165.14.359.031.576-.11.217-.165.348-.33.543-.165.195-.349.435-.498.583-.165.165-.337.348-.146.678.192.33.855 1.409 1.83 2.278.855.76 1.572 1.023 1.902 1.188.33.165.528.14.72-.083.195-.22.842-.98.1.066-1.12.839-1.516.924-2.228.085-.712-.132-2.82-.94-5.111-2.986-1.761-1.583-2.946-2.399-4.225-2.399-.576 0-1.152.073-1.657.435z" />
  </svg>
);

const TelegramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className={props.className}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .24z" />
  </svg>
);

const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

// Footer Localized Translation Dictionary (English, Hindi, Bengali, Telugu, Kannada, Malayalam, Marathi)
const translations: Record<string, any> = {
  en: {
    shareText: "Share LX-Downloader:",
    disclaimer: "Disclaimer: LX-Downloader is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Instagram, Meta Platforms Inc., or YouTube. We do not host or store any copyright media on our servers. All videos, images, and content downloaded via this tool belong to their respective owners.",
    developedBy: "Developed by Yagnik Hariyani & Vaidehi Hariyani"
  },
  hi: {
    shareText: "LX-Downloader साझा करें:",
    disclaimer: "अस्वीकरण: LX-Downloader किसी भी तरह से इंस्टाग्राम, या यूट्यूब से संबद्ध, जुड़े, अधिकृत या समर्थित नहीं है। हम अपने सर्वर पर कोई कॉपीराइट मीडिया होस्ट या स्टोर नहीं करते हैं।",
    developedBy: "याज्ञिक हरियाणी और वैदेही हरियाणी द्वारा विकसित"
  },
  bn: {
    shareText: "LX-Downloader শেয়ার করুন:",
    disclaimer: "দাবিত্যাগ: LX-Downloader কোনোভাবেই ইনস্টাগ্রাম বা ইউটিউবের সাথে যুক্ত বা অনুমোদিত নয়। আমরা আমাদের সার্ভারে কোনো মিডিয়া ফাইল রাখি না।",
    developedBy: "যাজ্ঞিক হারিয়ানি এবং বৈদেহী হারিয়ানি দ্বারা বিকাশকৃত"
  },
  te: {
    shareText: "LX-Downloader షేర్ చేయండి:",
    disclaimer: "నిరాకరణ: LX-Downloader ఏ విధంగానూ ఇన్‌స్టాగ్రామ్, లేదా యూట్యూబ్‌తో అనుబంధించబడలేదు. మేము మా సర్వర్లలో ఎటువంటి మీడియాను హోస్ట్ చేయము.",
    developedBy: "యాగ్నిక్ హరియాణి & వైదేహి హరియాణి చేత అభివృద్ధి చేయబడింది"
  },
  kn: {
    shareText: "LX-Downloader ಅನ್ನು ಹಂಚಿಕೊಳ್ಳಿ:",
    disclaimer: "ಹಕ್ಕುತ್ಯಾಗ: LX-Downloader ಯಾವುದೇ ರೀತಿಯಲ್ಲಿ ಇನ್‌ಸ್ಟಾಗ್ರಾಮ್, ಅಥವಾ ಯೂಟ್ಯೂಬ್‌ನೊಂದಿಗೆ ಅಧಿಕೃತವಾಗಿ ಸಂಯೋಜನೆ ಹೊಂದಿಲ್ಲ. ನಾವು ನಮ್ಮ ಸರ್ವರ್‌ಗಳಲ್ಲಿ ಯಾವುದೇ ಹಕ್ಕುಸ್ವಾಮ್ಯ ಮಾಧ್ಯಮವನ್ನು ಹೋสต์ ಮಾಡುವುದಿಲ್ಲ.",
    developedBy: "ಯಾಗ್ನಿಕ್ ಹರಿಯಾಣಿ ಮತ್ತು ವೈದೇಹಿ ಹರಿಯಾಣಿ ಅವರಿಂದ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾಗಿದೆ"
  },
  ml: {
    shareText: "LX-Downloader പങ്കിടുക:",
    disclaimer: "നിരാകരണം: LX-Downloader ഏതെങ്കിലും തരത്തിൽ ഇൻസ്റ്റാഗ്രാം, അല്ലെങ്കിൽ യൂറ്റ്യൂബുമായി ബന്ധപ്പെട്ടിട്ടുള്ളതല്ല. ഞങ്ങളുടെ സെർവറുകളിൽ ഞങ്ങൾ ഒരു മാധ്യമവും സംഭരിക്കുന്നില്ല.",
    developedBy: "യാഗ്നിക് ഹരിയാനിയും വൈദേഹി ഹരിയാനിയും വികസിപ്പിച്ചത്"
  },
  mr: {
    shareText: "LX-Downloader शेअर करा:",
    disclaimer: "अस्वीकरण: LX-Downloader कोणत्याही प्रकारे इंस्टाग्राम, किंवा यूट्यूबशी संबंधित नाही. आम्ही आमच्या सर्व्हरवर कोणतीही मीडिया फाईल होस्ट किंवा स्टोअर करत नाही.",
    developedBy: "याज्ञिक हरियाणी आणि वैदेही हरियाणी यांनी विकसित केले"
  }
};

export default function Footer() {
  const [currentLang, setCurrentLang] = useState("en");

  // Hydration-safe listener to support instant language query parameter changes
  useEffect(() => {
    const parseLang = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentLang(params.get("lang") || "en");
    };
    parseLang();
    window.addEventListener("popstate", parseLang);
    return () => window.removeEventListener("popstate", parseLang);
  }, []);

  const handleShare = (platform: string) => {
    const url = typeof window !== "undefined" ? window.location.origin : "https://lx-downloader.com";
    const text = "Check out LX-Downloader - The ultimate Instagram Story, Reels, and Photo Saver!";
    
    let shareUrl = "";
    if (platform === "facebook") {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === "whatsapp") {
      shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text + " " + url)}`;
    } else if (platform === "telegram") {
      shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    } else if (platform === "instagram") {
      // Fallback action for Instagram: Copy link to clipboard
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(url);
        alert("LX-Downloader link copied to clipboard! Share it on your Instagram Story or DM.");
        return;
      }
    }
    
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const t = translations[currentLang] || translations.en;

  return (
    <footer className="bg-slate-50 text-slate-500 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-8">
        
        {/* Brand Logo */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center"
        >
          <Link href={`/?lang=${currentLang}`} className="flex items-center gap-2 group active:scale-95 transition-all inline-flex">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-900/10">
              <Download className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              LX-<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Downloader</span>
            </span>
          </Link>
        </motion.div>

        {/* Share Buttons */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-200/40"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-700">{t.shareText}</span>
            <div className="flex items-center gap-2.5 ml-1">
              <button
                onClick={() => handleShare("facebook")}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:bg-blue-600/15 hover:text-blue-600 flex items-center justify-center transition-all duration-200 hover:shadow active:scale-90 cursor-pointer"
                aria-label="Share on Facebook"
              >
                <FacebookIcon className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => handleShare("whatsapp")}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:bg-emerald-600/15 hover:text-emerald-600 flex items-center justify-center transition-all duration-200 hover:shadow active:scale-90 cursor-pointer"
                aria-label="Share on WhatsApp"
              >
                <WhatsappIcon className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => handleShare("telegram")}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:bg-sky-500/15 hover:text-sky-500 flex items-center justify-center transition-all duration-200 hover:shadow active:scale-90 cursor-pointer"
                aria-label="Share on Telegram"
              >
                <TelegramIcon className="w-4.5 h-4.5" />
              </button>
              <button
                onClick={() => handleShare("instagram")}
                className="w-8 h-8 rounded-lg bg-white text-slate-500 hover:bg-pink-600/15 hover:text-pink-600 flex items-center justify-center transition-all duration-200 hover:shadow active:scale-90 cursor-pointer"
                aria-label="Share on Instagram"
              >
                <InstagramIcon className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="bg-slate-100 p-4 rounded-2xl shadow-inner text-left"
        >
          <p className="text-[11px] text-slate-500 leading-normal">
            <strong>Disclaimer:</strong> {t.disclaimer}
          </p>
        </motion.div>

        {/* Dynamic Developer Credit & Copyright bottom line */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="pt-4 flex flex-col items-center gap-4"
        >
          <span className="text-xs text-slate-400">&copy; {new Date().getFullYear()} LX-Downloader. All rights reserved.</span>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 mt-2">
            {/* Yagnik Hariyani profile links */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-sm font-black text-slate-800">Yagnik Hariyani</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/YAGNIKHARIYANI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <span className="text-slate-300">|</span>
                <a 
                  href="https://linkedin.com/in/yagnikhariyani" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Vertical divider line for desktop */}
            <div className="hidden sm:block h-8 w-px bg-slate-200" />

            {/* Vaidehi Hariyani profile links */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-sm font-black text-slate-800">Vaidehi Hariyani</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://github.com/hariyanivaidehi" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  GitHub
                </a>
                <span className="text-slate-300">|</span>
                <a 
                  href="https://linkedin.com/in/vaidehihariyani" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 font-bold transition-colors"
                >
                  <LinkedinIcon className="w-3.5 h-3.5" />
                  LinkedIn
                </a>
              </div>
            </div>
          </div>

          <span className="text-xs text-blue-600 font-extrabold tracking-wide mt-2 block">
            {t.developedBy}
          </span>
        </motion.div>

      </div>
    </footer>
  );
}
