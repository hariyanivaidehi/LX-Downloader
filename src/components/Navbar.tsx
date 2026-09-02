"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, ChevronDown, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Language list restricted to Indian regional target languages
const languages = [
  { name: "English", code: "en" },
  { name: "हिन्दी", code: "hi" },
  { name: "বাংলা", code: "bn" },
  { name: "తెలుగు", code: "te" },
  { name: "ಕನ್ನಡ", code: "kn" },
  { name: "മലയാളം", code: "ml" },
  { name: "मराठी", code: "mr" }
];

export default function Navbar() {
  const pathname = usePathname();
  
  const [langDropdown, setLangDropdown] = useState(false);
  
  // Client-side query parameters parsing
  const [currentLangCode, setCurrentLangCode] = useState("en");

  useEffect(() => {
    const parseLang = () => {
      const params = new URLSearchParams(window.location.search);
      setCurrentLangCode(params.get("lang") || "en");
    };
    parseLang();
    window.addEventListener("popstate", parseLang);
    return () => window.removeEventListener("popstate", parseLang);
  }, [pathname]);

  // Force exclusively Light Mode
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, []);

  const handleLanguageChange = (langCode: string) => {
    setLangDropdown(false);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", langCode);
    window.history.pushState({}, "", `${pathname}?${params.toString()}`);
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100/90 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href={`/?lang=${currentLangCode}`} className="flex items-center gap-2 sm:gap-2.5 group active:scale-95 transition-all">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform duration-300">
                <Download className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />
              </div>
              <span className="text-lg sm:text-2xl font-black tracking-tight text-slate-900">
                LX-<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Downloader</span>
              </span>
            </Link>
          </div>

          {/* Right Action Utilities (Language Selector) */}
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                onBlur={() => setTimeout(() => setLangDropdown(false), 200)}
                className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-100/80 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer active:scale-95 transition-all duration-150"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="inline sm:inline">Language</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              <AnimatePresence>
                {langDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 sm:w-52 max-h-80 overflow-y-auto rounded-2xl bg-white p-2 shadow-2xl shadow-slate-300/60 border border-slate-100 z-50 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent"
                  >
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={`w-full text-center px-4 py-2 my-0.5 rounded-xl text-xs font-bold transition-all cursor-pointer block ${
                          currentLangCode === lang.code
                            ? "bg-blue-600 text-white font-black shadow-md shadow-blue-500/20"
                            : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
