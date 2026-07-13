import React, { useState, useEffect, useRef, createContext, useContext, useMemo } from "react";
import { createPortal } from "react-dom";
import {
  Search, Bell, Home, Compass, LayoutGrid, Layers, Clock, TrendingUp,
  Star, Settings, Menu, X, Sun, Moon, Check, MessageCircle, Film, Handshake,
  Code2, Terminal, Contact, FileText, KeyRound, QrCode, Store, Radio, CheckSquare, GitBranch, Sparkles, ArrowRight,
  Plus, Pencil, Trash2, BarChart2
} from "lucide-react";

import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  useListServices, useGetAdminStats, useCreateService, useUpdateService, useDeleteService,
  getListServicesQueryKey, getGetAdminStatsQueryKey
} from "@workspace/api-client-react";

const queryClient = new QueryClient();

const ICON_MAP: Record<string, React.ElementType> = {
  MessageCircle, Film, Handshake, Code2, Terminal, Contact, FileText,
  KeyRound, QrCode, Store, Radio, CheckSquare, GitBranch, Sparkles,
};

// --- DATA ---
const CATEGORY_COLORS = {
  AI: "#8B5CF6",
  Communication: "#38BDF8",
  Entertainment: "#F472B6",
  Development: "#34D399",
  Business: "#FBBF24",
  Productivity: "#A3E635",
  Utilities: "#94A3B8",
  Media: "#22D3EE",
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const SERVICES = [
  {
    id: "firebox-bot",
    name: "Firebox Bot",
    tagline: "Automate WhatsApp conversations",
    description: "Build and deploy WhatsApp bots that answer, route, and follow up with customers automatically, no code required.",
    category: "Communication",
    status: "Available",
    icon: MessageCircle,
    keywords: ["whatsapp bot", "whatsapp", "chatbot", "automation", "auto reply"],
    popular: true,
    recent: false,
    features: ["Drag-and-drop conversation builder", "Auto-replies with business-hours logic", "Broadcast messages to saved contacts", "Live handover to a human agent"],
  },
  {
    id: "cinevault",
    name: "CineVault",
    tagline: "Stream movies and shows",
    description: "A growing library of movies and series, organized, recommended, and ready to watch across every device.",
    category: "Entertainment",
    status: "Available",
    icon: Film,
    keywords: ["movie", "movies", "streaming", "watch", "film", "tv shows", "series"],
    popular: true,
    recent: false,
    features: ["Continue watching across devices", "Curated collections by mood and genre", "Offline downloads", "Personalized recommendations"],
  },
  {
    id: "bconnect",
    name: "BConnect",
    tagline: "Find partners, clients, and deals",
    description: "A marketplace and networking space for businesses to list services, discover partners, and close deals.",
    category: "Business",
    status: "Available",
    icon: Handshake,
    keywords: ["marketplace", "business", "networking", "partners", "deals", "clients"],
    popular: false,
    recent: false,
    features: ["Verified business profiles", "Direct messaging with partners", "Deal and proposal tracking", "Industry-specific discovery feed"],
  },
  {
    id: "codevault",
    name: "CodeVault",
    tagline: "Host and ship your code",
    description: "Private and public repositories, pull requests, and lightweight CI, built for small teams that move fast.",
    category: "Development",
    status: "Beta",
    icon: Code2,
    keywords: ["code hosting", "git", "repository", "repo", "version control", "ci"],
    popular: false,
    recent: true,
    features: ["Unlimited private repositories", "Built-in code review", "One-click deploy previews", "Issue tracking and boards"],
  },
  {
    id: "commandline-ai",
    name: "Commandline AI",
    tagline: "An AI assistant for your terminal",
    description: "Ask questions, generate scripts, and debug errors without leaving the command line.",
    category: "AI",
    status: "Available",
    icon: Terminal,
    keywords: ["ai assistant", "ai", "chatbot", "terminal ai", "command line", "debug"],
    popular: true,
    recent: true,
    features: ["Natural-language shell commands", "Inline error explanations", "Script generation from a prompt", "Works with your existing shell"],
  },
  {
    id: "vcf-creator",
    name: "VCF Creator",
    tagline: "Turn contact lists into VCF files",
    description: "Upload a spreadsheet of names and numbers and export a ready-to-import VCF contact file in seconds.",
    category: "Utilities",
    status: "Available",
    icon: Contact,
    keywords: ["vcf", "vcf maker", "vcard", "contact file", "contacts export"],
    popular: false,
    recent: false,
    features: ["Import from CSV or Excel", "Merge duplicate contacts", "Custom contact groups", "One-click VCF export"],
  },
  {
    id: "quickresume",
    name: "QuickResume",
    tagline: "Build a resume that gets read",
    description: "Pick a template, fill in your experience, and export a polished resume as a PDF.",
    category: "Productivity",
    status: "Beta",
    icon: FileText,
    keywords: ["resume", "cv", "resume builder", "job application"],
    popular: false,
    recent: true,
    features: ["ATS-friendly templates", "Section-by-section guidance", "One-click PDF export", "Multiple resume versions"],
  },
  {
    id: "keyforge",
    name: "KeyForge",
    tagline: "Generate strong passwords",
    description: "Create strong, unique passwords with custom rules, and check how long they would take to crack.",
    category: "Utilities",
    status: "Available",
    icon: KeyRound,
    keywords: ["password", "password generator", "security", "strong password"],
    popular: false,
    recent: false,
    features: ["Custom length and character rules", "Passphrase mode", "Strength and crack-time estimate", "Bulk generation"],
  },
  {
    id: "quickr",
    name: "QuickR",
    tagline: "Generate QR codes instantly",
    description: "Turn links, text, or contact details into a QR code you can download and share right away.",
    category: "Utilities",
    status: "Available",
    icon: QrCode,
    keywords: ["qr code", "qr generator", "qr"],
    popular: false,
    recent: false,
    features: ["Links, text, and Wi-Fi codes", "Custom colors and logo overlay", "SVG and PNG export", "Scan analytics"],
  },
  {
    id: "markethive",
    name: "MarketHive",
    tagline: "Buy and sell inside Firebox",
    description: "A community marketplace for goods and services, arriving soon to the Firebox ecosystem.",
    category: "Business",
    status: "Coming Soon",
    icon: Store,
    keywords: ["marketplace", "buy", "sell", "store"],
    popular: false,
    recent: false,
    features: ["Local and online listings", "Built-in buyer protection", "In-app messaging", "Seller storefronts"],
  },
  {
    id: "streamcast",
    name: "StreamCast",
    tagline: "Host and publish podcasts",
    description: "Upload episodes, distribute to major platforms, and track listens, all from one dashboard.",
    category: "Media",
    status: "Coming Soon",
    icon: Radio,
    keywords: ["podcast", "audio", "media hosting"],
    popular: false,
    recent: false,
    features: ["One-upload multi-platform distribution", "Episode analytics", "Custom show pages", "Team collaboration"],
  },
  {
    id: "taskflow",
    name: "TaskFlow",
    tagline: "Plan your day, your way",
    description: "Boards, lists, and reminders that adapt to how you like to work, launching soon.",
    category: "Productivity",
    status: "Coming Soon",
    icon: CheckSquare,
    keywords: ["tasks", "todo", "planner", "productivity"],
    popular: false,
    recent: false,
    features: ["Boards, lists, and calendar views", "Smart reminders", "Shared team spaces", "Daily planning view"],
  },
  {
    id: "mindforge",
    name: "MindForge AI",
    tagline: "Your everyday AI assistant",
    description: "A general-purpose AI assistant for writing, research, and everyday questions, coming soon to Firebox.",
    category: "AI",
    status: "Coming Soon",
    icon: Sparkles,
    keywords: ["ai assistant", "chatgpt alternative", "ai chat"],
    popular: false,
    recent: false,
    features: ["Conversational writing help", "Document summaries", "Research with citations", "Custom assistants"],
  },
  {
    id: "devpipe",
    name: "DevPipe",
    tagline: "Continuous integration, simplified",
    description: "Build, test, and deploy pipelines that connect directly to CodeVault, coming soon.",
    category: "Development",
    status: "Coming Soon",
    icon: GitBranch,
    keywords: ["ci", "cd", "pipeline", "deploy", "build"],
    popular: false,
    recent: false,
    features: ["Visual pipeline builder", "Parallel test runs", "Native CodeVault integration", "Deploy previews for every branch"],
  },
];

const NAV_ITEMS = [
  { key: "home", label: "Home", icon: Home },
  { key: "explore", label: "Explore", icon: Compass },
  { key: "categories", label: "Categories", icon: LayoutGrid },
  { key: "all", label: "All Services", icon: Layers },
  { key: "recent", label: "Recently Added", icon: Clock },
  { key: "popular", label: "Popular Services", icon: TrendingUp },
  { key: "favorites", label: "Favorites", icon: Star },
  { key: "comingsoon", label: "Coming Soon", icon: Sparkles },
];

const NAV_TITLES: Record<string, string> = {
  home: "All services",
  explore: "Explore Firebox",
  all: "All services",
  recent: "Recently added",
  popular: "Popular services",
  favorites: "Your favorites",
  comingsoon: "Coming soon",
  categories: "Categories",
  settings: "Settings",
  admin: "Admin Dashboard",
};

const NAV_EMPTY: Record<string, string> = {
  favorites: "Star a service to find it here fast.",
  recent: "Nothing new to show right now — check back soon.",
  popular: "Popularity data is still warming up.",
  comingsoon: "Nothing queued up right now.",
};

const NOTIFICATIONS = [
  { id: 1, text: "CodeVault beta invites are live for waitlisted users." },
  { id: 2, text: "Commandline AI added new script templates." },
  { id: 3, text: "MindForge AI is joining Firebox soon." },
];

// --- THEMING ---
function buildTokens(isDark: boolean) {
  return {
    isDark,
    appBg: isDark ? "bg-[#0B0D10]" : "bg-[#FAFAF8]",
    sidebarBg: isDark ? "bg-[#0E1013]" : "bg-white",
    topbarBg: isDark ? "bg-[#0B0D10]/85" : "bg-[#FAFAF8]/85",
    surface: isDark ? "bg-[#14171B]" : "bg-white",
    surfaceAlt: isDark ? "bg-[#181B20]" : "bg-[#F5F4F1]",
    surfaceHover: isDark ? "hover:bg-[#1C2025]" : "hover:bg-[#F3F2EE]",
    border: isDark ? "border-[#22262B]" : "border-[#E7E5E0]",
    borderStrong: isDark ? "border-[#2C3138]" : "border-[#D8D6CF]",
    text: isDark ? "text-[#F2F1ED]" : "text-[#16181C]",
    textMuted: isDark ? "text-[#8A8F98]" : "text-[#6B6F76]",
    textFaint: isDark ? "text-[#565A61]" : "text-[#9A9DA3]",
    accent: "#FF6B35",
    accentSoft: isDark ? "bg-[#FF6B35]/10" : "bg-[#FF6B35]/10",
  };
}

interface UIContextType {
  theme: "dark" | "light";
  toggleTheme: () => void;
  c: ReturnType<typeof buildTokens>;
}

const UIContext = createContext<UIContextType | null>(null);

function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error("useUI must be used within UIProvider");
  return ctx;
}

// --- COMPONENTS ---

function FireboxMark({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fireboxGradient" x1="4" y1="30" x2="26" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFB347" />
          <stop offset="1" stopColor="#FF5A1F" />
        </linearGradient>
      </defs>
      <path
        d="M16.6 1.5c1 3.4-.6 5.4-2.4 7.4-1.9 2.1-3.9 4.4-3.9 8.1 0 1.2.2 2.2.6 3.1-2-1.1-3.3-3.1-3.3-5.7 0-1 .2-1.9.5-2.8C4.7 14.1 3 17.6 3 21.2 3 27 8 31 15.2 31c7.6 0 13.1-4.7 13.1-11.1 0-6.4-4.2-10.5-7.6-13.6-1.6-1.5-3-2.8-4.1-4.8Z"
        fill="url(#fireboxGradient)"
      />
    </svg>
  );
}

function StatusDot({ color }: { color: string }) {
  return <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; label: string }> = {
    Available: { color: "#34D399", label: "Available" },
    Beta: { color: "#FBBF24", label: "Beta" },
    "Coming Soon": { color: "#94A3B8", label: "Coming Soon" },
  };
  const { color, label } = map[status] || map["Available"];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: color + "1A", color }}
    >
      <StatusDot color={color} />
      {label}
    </span>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || "#94A3B8";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ backgroundColor: color + "1A", color }}
    >
      {category}
    </span>
  );
}

function Sidebar({ activeNav, setActiveNav, mobileOpen, closeMobile }: {
  activeNav: string;
  setActiveNav: (key: string) => void;
  mobileOpen: boolean;
  closeMobile: () => void;
}) {
  const { c } = useUI();
  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fadeIn backdrop-blur-sm"
          onClick={closeMobile}
        />
      )}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r transition-transform duration-300 lg:translate-x-0 ${c.sidebarBg} ${c.border} ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className={`flex items-center gap-2.5 border-b px-5 py-5 ${c.border}`}>
          <FireboxMark size={26} />
          <span className={`font-semibold text-[17px] tracking-tight ${c.text}`}>Firebox</span>
          <button onClick={closeMobile} className={`ml-auto rounded-lg p-1.5 lg:hidden ${c.surfaceHover}`}>
            <X size={18} className={c.textMuted} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-hide">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeNav === item.key;
              return (
                <li key={item.key}>
                  <button
                    onClick={() => { setActiveNav(item.key); closeMobile(); }}
                    className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${active ? "text-white shadow-sm" : `${c.textMuted} ${c.surfaceHover}`}`}
                    style={active ? { backgroundColor: "#FF6B35" } : undefined}
                  >
                    <Icon size={17} strokeWidth={2} className={active ? "text-white" : ""} />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className={`my-4 h-px ${c.border}`} style={{ margin: "16px 0", borderTop: "1px solid currentColor", opacity: 0.15 }} />

          <ul className="space-y-0.5">
            <li>
              <button
                onClick={() => { setActiveNav("settings"); closeMobile(); }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150 ${activeNav === "settings" ? "text-white shadow-sm" : `${c.textMuted} ${c.surfaceHover}`}`}
                style={activeNav === "settings" ? { backgroundColor: "#FF6B35" } : undefined}
              >
                <Settings size={17} strokeWidth={2} />
                Settings
              </button>
            </li>
          </ul>
        </nav>

        <div className={`border-t px-5 py-4 ${c.border}`}>
          <div className="flex items-center gap-2">
            <FireboxMark size={16} />
            <span className={`text-xs font-medium ${c.textMuted}`}>Firebox</span>
          </div>
          <p className={`mt-1 text-[11px] ${c.textFaint}`}>Version 2.4.0</p>
        </div>
      </aside>
    </>
  );
}

function Topbar({ query, setQuery, openMobile, showToast }: {
  query: string;
  setQuery: (q: string) => void;
  openMobile: () => void;
  showToast: (msg: string) => void;
}) {
  const { c, theme, toggleTheme } = useUI();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [unread, setUnread] = useState(NOTIFICATIONS.length);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <header className={`sticky top-0 z-30 flex items-center gap-3 border-b px-4 py-3.5 backdrop-blur-md sm:px-6 ${c.topbarBg} ${c.border}`}>
      <button onClick={openMobile} className={`rounded-lg p-2 lg:hidden ${c.surfaceHover}`}>
        <Menu size={20} className={c.text} />
      </button>

      <div className="relative flex-1 max-w-2xl">
        <Search size={18} className={`pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 ${c.textMuted}`} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need today?"
          className={`w-full rounded-2xl border py-2.5 pl-11 pr-11 text-sm outline-none transition-all duration-200 ${c.surface} ${c.border} ${c.text} placeholder:opacity-50 focus:shadow-[0_0_0_4px_rgba(255,107,53,0.15)] focus:border-[#FF6B35]`}
        />
        {query ? (
          <button onClick={() => setQuery("")} className={`absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 ${c.surfaceHover}`}>
            <X size={14} className={c.textMuted} />
          </button>
        ) : (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
            <FireboxMark size={15} />
          </span>
        )}
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button onClick={toggleTheme} className={`rounded-xl p-2.5 transition-colors ${c.surfaceHover}`}>
          {theme === "dark" ? <Sun size={18} className={c.text} /> : <Moon size={18} className={c.text} />}
        </button>

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen((v) => !v); setUnread(0); }}
            className={`relative rounded-xl p-2.5 transition-colors ${c.surfaceHover}`}
          >
            <Bell size={18} className={c.text} />
            {unread > 0 && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF6B35] shadow-[0_0_0_2px_var(--color-surface)]" />
            )}
          </button>
          {notifOpen && (
            <div className={`absolute right-0 mt-2 w-80 rounded-2xl border p-2 shadow-xl animate-fadeSlide ${c.surface} ${c.border}`}>
              <p className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide ${c.textFaint}`}>Notifications</p>
              <ul className="max-h-80 overflow-y-auto">
                {NOTIFICATIONS.map((n) => (
                  <li key={n.id} className={`rounded-xl px-3 py-2.5 text-sm ${c.text} ${c.surfaceHover} cursor-pointer transition-colors`}>
                    {n.text}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((v) => !v)} className={`rounded-xl p-1.5 transition-colors ${c.surfaceHover}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm`} style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C5A)" }}>
              F
            </div>
          </button>
          {profileOpen && (
            <div className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-xl animate-fadeSlide ${c.surface} ${c.border}`}>
              <div className={`px-3 py-2 border-b ${c.border} mb-2`}>
                <p className={`text-sm font-semibold ${c.text}`}>Firebox User</p>
                <p className={`text-xs ${c.textFaint}`}>user@firebox.app</p>
              </div>
              {["Profile", "Settings", "Help"].map((item) => (
                <button key={item} className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm ${c.textMuted} ${c.surfaceHover} transition-colors`}>
                  {item}
                </button>
              ))}
              <div className={`mt-2 border-t pt-2 ${c.border}`}>
                <button className={`flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-500 hover:bg-red-500/10 transition-colors`}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function ServiceCard({ service, isFavorite, toggleFavorite, onClick }: any) {
  const { c } = useUI();
  const Icon = service.icon;
  const color = CATEGORY_COLORS[service.category as keyof typeof CATEGORY_COLORS] || "#94A3B8";

  return (
    <div 
      onClick={onClick}
      className={`group relative flex flex-col gap-4 rounded-2xl border p-5 transition-all duration-300 cursor-pointer ${c.surface} ${c.border} hover:shadow-lg hover:-translate-y-1 ${c.surfaceHover}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 overflow-hidden" style={{ backgroundColor: color + "1A", color }}>
          {service.iconUrl ? <img src={service.iconUrl} alt={service.name} className="h-full w-full object-cover" /> : <Icon size={24} strokeWidth={2} />}
        </div>
        <button 
          onClick={(e) => { e.stopPropagation(); toggleFavorite(service.id); }}
          className={`p-2 rounded-full transition-colors ${isFavorite ? "text-[#FF6B35]" : c.textMuted} hover:bg-black/5 dark:hover:bg-white/10`}
        >
          <Star size={18} fill={isFavorite ? "#FF6B35" : "none"} />
        </button>
      </div>

      <div>
        <h3 className={`text-lg font-semibold ${c.text}`}>{service.name}</h3>
        <p className={`mt-1 text-sm ${c.textMuted} line-clamp-2`}>{service.tagline}</p>
      </div>

      <div className="mt-auto pt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={service.status} />
        <CategoryBadge category={service.category} />
      </div>
    </div>
  );
}

function ServiceDetailModal({ service, close, isFavorite, toggleFavorite }: any) {
  const { c } = useUI();
  const Icon = service.icon;
  const color = CATEGORY_COLORS[service.category as keyof typeof CATEGORY_COLORS] || "#94A3B8";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={close} />
      
      <div className={`relative w-full max-w-lg overflow-hidden rounded-3xl border shadow-2xl animate-fadeSlide ${c.surface} ${c.border} flex flex-col max-h-[90vh]`}>
        {/* Preview strip */}
        <div className={`px-6 py-4 border-b ${c.border} shrink-0 flex items-center justify-between gap-4`}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: color + "1A", color }}>
              {service.iconUrl ? <img src={service.iconUrl} alt={service.name} className="h-full w-full object-cover" /> : <Icon size={24} strokeWidth={2} />}
            </div>
            <div className="min-w-0">
              <p className={`font-semibold truncate ${c.text}`}>{service.name}</p>
              <p className={`text-sm truncate ${c.textMuted}`}>{service.tagline}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge status={service.status} />
            <CategoryBadge category={service.category} />
            <button onClick={close} className={`ml-1 p-2 rounded-full transition-colors ${c.surfaceHover}`}>
              <X size={18} className={c.textMuted} />
            </button>
          </div>
        </div>

        <div className="relative p-6 sm:p-8 overflow-y-auto">

          <p className={`text-[15px] leading-relaxed mb-8 ${c.textMuted}`}>
            {service.description}
          </p>

          <div className="mb-8">
            <h3 className={`text-sm font-semibold uppercase tracking-wider mb-4 ${c.textFaint}`}>Key Features</h3>
            <ul className="space-y-3">
              {service.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="mt-0.5 flex shrink-0 items-center justify-center h-5 w-5 rounded-full bg-[#FF6B35]/10 text-[#FF6B35]">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  <span className={`text-sm ${c.text}`}>{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex gap-3 mt-8">
            <button 
              onClick={() => service.url && window.open(service.url, "_blank", "noopener,noreferrer")}
              disabled={!service.url}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-3.5 text-sm font-bold text-white shadow-[0_0_0_0_rgba(255,107,53,0)] transition-all hover:bg-[#FF5A1F] hover:shadow-[0_0_20px_rgba(255,107,53,0.3)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {service.status === "Coming Soon" ? "Join Waitlist" : "Open Service"}
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => toggleFavorite(service.id)}
              className={`flex items-center justify-center rounded-xl border px-4 py-3.5 transition-colors ${c.border} ${c.surfaceHover} ${isFavorite ? "text-[#FF6B35]" : c.text}`}
            >
              <Star size={20} fill={isFavorite ? "#FF6B35" : "none"} className={isFavorite ? "text-[#FF6B35]" : ""} />
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// --- MAIN APP ---

function MainApp() {
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("firebox-theme") as "dark" | "light") || "dark"
  );
  
  const [activeNav, setActiveNav] = useState(() =>
    window.location.hash === "#admin" ? "admin" : "home"
  );
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("firebox-favorites");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });

  const [toastMsg, setToastMsg] = useState("");

  const c = useMemo(() => buildTokens(theme === "dark"), [theme]);

  const { data: apiServices = [], isLoading: servicesLoading } = useListServices();
  const services = useMemo(() => apiServices.map(s => ({ ...s, icon: ICON_MAP[s.iconName] ?? Sparkles })), [apiServices]);

  useEffect(() => {
    localStorage.setItem("firebox-theme", theme);
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("firebox-favorites", JSON.stringify([...favorites]));
  }, [favorites]);

  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");
  
  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setToastMsg(favorites.has(id) ? "Removed from favorites" : "Added to favorites");
    setTimeout(() => setToastMsg(""), 3000);
  };

  const displayedServices = useMemo(() => {
    let list = services;
    
    // Apply nav filter
    switch (activeNav) {
      case "recent": list = list.filter(s => s.recent); break;
      case "popular": list = list.filter(s => s.popular); break;
      case "favorites": list = list.filter(s => favorites.has(s.id)); break;
      case "comingsoon": list = list.filter(s => s.status === "Coming Soon"); break;
      default: break;
    }
    
    // If exploring, maybe randomize or keep as is.
    if (activeNav === "explore") {
      // Just showing all for now, we'll feature popular ones separately in the render
    }
    
    // Apply search filter
    if (query.trim()) {
      const q = query.toLowerCase();
      list = services.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.tagline.toLowerCase().includes(q) || 
        s.description.toLowerCase().includes(q) ||
        s.keywords.some(k => k.includes(q))
      );
    }
    
    return list;
  }, [activeNav, query, favorites, services]);

  const selectedService = services.find(s => s.id === selectedServiceId);

  return (
    <UIContext.Provider value={{ theme, toggleTheme, c }}>
      <div className={`min-h-[100dvh] w-full font-sans transition-colors duration-200 ${c.appBg} ${c.text}`}>
        
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav} 
          mobileOpen={mobileOpen} 
          closeMobile={() => setMobileOpen(false)} 
        />
        
        <div className="flex flex-col lg:ml-64 min-h-screen">
          <Topbar 
            query={query} 
            setQuery={setQuery} 
            openMobile={() => setMobileOpen(true)} 
            showToast={(msg) => setToastMsg(msg)} 
          />
          
          <main className="flex-1 px-4 py-8 sm:px-8 sm:py-10 max-w-7xl mx-auto w-full">
            {/* Context Header */}
            {activeNav !== "settings" && activeNav !== "categories" && !query && (
              <div className="mb-10 animate-fadeSlide">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">{NAV_TITLES[activeNav] || "Services"}</h1>
                {activeNav === "explore" && (
                  <p className={`mt-2 text-lg ${c.textMuted}`}>Discover tools and apps to supercharge your workflow.</p>
                )}
                {activeNav === "home" && (
                  <p className={`mt-2 text-lg ${c.textMuted}`}>Welcome back to your workspace.</p>
                )}
              </div>
            )}
            
            {query && (
              <div className="mb-8 animate-fadeSlide">
                <h2 className="text-2xl font-bold">Search results for "{query}"</h2>
                <p className={`mt-1 ${c.textMuted}`}>Found {displayedServices.length} matching services</p>
              </div>
            )}

            {/* Categories View */}
            {activeNav === "admin" && !query ? (
              <AdminView services={services} servicesLoading={servicesLoading} />
            ) : activeNav === "categories" && !query ? (
              <div className="animate-fadeSlide">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">Categories</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {CATEGORIES.map(cat => {
                    const count = services.filter(s => s.category === cat).length;
                    const color = CATEGORY_COLORS[cat as keyof typeof CATEGORY_COLORS];
                    return (
                      <div 
                        key={cat} 
                        onClick={() => {
                          setQuery(cat); // A simple way to filter by category using search
                        }}
                        className={`group relative overflow-hidden rounded-2xl border p-6 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 ${c.surface} ${c.border} ${c.surfaceHover}`}
                      >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500" style={{ color }}>
                          <LayoutGrid size={64} />
                        </div>
                        <h3 className="text-xl font-bold mb-2">{cat}</h3>
                        <p className={`text-sm font-medium ${c.textMuted}`}>{count} {count === 1 ? 'service' : 'services'}</p>
                        <div className="mt-6 h-1.5 w-12 rounded-full transition-all duration-300 group-hover:w-full" style={{ backgroundColor: color }} />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : activeNav === "settings" && !query ? (
              <div className="max-w-2xl animate-fadeSlide">
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">Settings</h1>
                
                <div className={`rounded-2xl border ${c.border} ${c.surface} overflow-hidden mb-6`}>
                  <div className={`p-5 border-b ${c.border}`}>
                    <h3 className="text-lg font-semibold mb-1">Appearance</h3>
                    <p className={`text-sm ${c.textMuted}`}>Customize how Firebox looks on your device.</p>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium">Theme Preference</p>
                      <p className={`text-sm ${c.textMuted}`}>Toggle between Light and Dark mode.</p>
                    </div>
                    <button 
                      onClick={toggleTheme}
                      className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${theme === "dark" ? "bg-[#FF6B35]" : "bg-gray-300 dark:bg-gray-700"}`}
                    >
                      <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === "dark" ? "translate-x-7" : "translate-x-1"}`} />
                    </button>
                  </div>
                </div>

                <div className={`rounded-2xl border ${c.border} ${c.surface} overflow-hidden mb-6`}>
                  <div className={`p-5 border-b ${c.border}`}>
                    <h3 className="text-lg font-semibold mb-1">Account</h3>
                    <p className={`text-sm ${c.textMuted}`}>Manage your profile and authentication.</p>
                  </div>
                  <div className="p-5 flex items-center justify-between border-b border-inherit">
                    <div>
                      <p className="font-medium">Email Address</p>
                      <p className={`text-sm ${c.textMuted}`}>user@firebox.app</p>
                    </div>
                    <button className={`px-4 py-2 rounded-xl text-sm font-medium ${c.surfaceHover} ${c.border} border`}>Change</button>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-red-500">Sign Out</p>
                      <p className={`text-sm ${c.textMuted}`}>Log out of this device.</p>
                    </div>
                    <button className="px-4 py-2 rounded-xl text-sm font-medium text-red-500 hover:bg-red-500/10">Sign Out</button>
                  </div>
                </div>

                <p className={`text-center text-sm ${c.textFaint} mt-8`}>Firebox v2.4.0 • Built with Replit</p>
              </div>
            ) : (
              /* Normal Services Grid View */
              <div className="animate-fadeSlide">
                {activeNav === "explore" && !query && (
                  <div className="mb-12">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <TrendingUp size={20} className="text-[#FF6B35]" />
                      Trending right now
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {servicesLoading ? (
                        [...Array(3)].map((_, i) => <div key={i} className={`h-40 rounded-2xl border ${c.border} animate-pulse bg-black/5 dark:bg-white/5`} />)
                      ) : services.filter(s => s.popular).slice(0, 3).map(service => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          isFavorite={favorites.has(service.id)} 
                          toggleFavorite={toggleFavorite} 
                          onClick={() => setSelectedServiceId(service.id)} 
                        />
                      ))}
                    </div>
                    <div className={`my-12 h-px ${c.border}`} />
                    <h2 className="text-xl font-bold mb-6">Discover more</h2>
                  </div>
                )}

                {servicesLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 mt-4">
                    {[...Array(8)].map((_, i) => <div key={i} className={`h-40 rounded-2xl border ${c.border} animate-pulse bg-black/5 dark:bg-white/5`} />)}
                  </div>
                ) : displayedServices.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                    {displayedServices.map(service => (
                      <ServiceCard 
                        key={service.id} 
                        service={service} 
                        isFavorite={favorites.has(service.id)} 
                        toggleFavorite={toggleFavorite} 
                        onClick={() => setSelectedServiceId(service.id)} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className={`flex flex-col items-center justify-center py-20 text-center rounded-3xl border border-dashed ${c.border} ${c.surfaceAlt}`}>
                    <div className={`mb-4 h-16 w-16 rounded-full flex items-center justify-center ${c.surface} ${c.border} border`}>
                      <Search size={28} className={c.textMuted} />
                    </div>
                    <h3 className="text-xl font-bold">No services found</h3>
                    <p className={`mt-2 max-w-md ${c.textMuted}`}>
                      {query ? `We couldn't find anything matching "${query}". Try different keywords or browse categories.` : (NAV_EMPTY[activeNav] || "There are no services to display here yet.")}
                    </p>
                    {query && (
                      <button 
                        onClick={() => setQuery("")}
                        className="mt-6 px-5 py-2.5 bg-[#FF6B35] text-white font-medium rounded-xl hover:bg-[#FF5A1F] transition-colors"
                      >
                        Clear search
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        {/* Modal Overlay */}
        {selectedService && (
          <ServiceDetailModal 
            service={selectedService} 
            isFavorite={favorites.has(selectedService.id)} 
            toggleFavorite={toggleFavorite} 
            close={() => setSelectedServiceId(null)} 
          />
        )}

        {/* Toast Notification */}
        {toastMsg && (
          <div className="fixed bottom-6 right-6 z-[200] animate-fadeSlide">
            <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 shadow-xl border ${c.surface} ${c.border}`}>
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#34D399]/20 text-[#34D399]">
                <Check size={14} strokeWidth={3} />
              </div>
              <p className={`text-sm font-medium ${c.text}`}>{toastMsg}</p>
            </div>
          </div>
        )}
      </div>
    </UIContext.Provider>
  );
}

function AdminView({ services, servicesLoading }: { services: any[], servicesLoading: boolean }) {
  const { c } = useUI();
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetAdminStats();
  
  const createMutation = useCreateService({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setModalOpen(false);
      }
    }
  });

  const updateMutation = useUpdateService({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
        setModalOpen(false);
      }
    }
  });

  const deleteMutation = useDeleteService({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListServicesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminStatsQueryKey() });
      }
    }
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);
  
  const openAdd = () => {
    setEditingService(null);
    setModalOpen(true);
  };
  
  const openEdit = (service: any) => {
    setEditingService(service);
    setModalOpen(true);
  };
  
  return (
    <div className="animate-fadeSlide">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <button 
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-[#FF6B35] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#FF5A1F] transition-colors"
        >
          <Plus size={18} />
          Add Service
        </button>
      </div>
      
      {/* Stats row */}
      {statsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
           {[...Array(6)].map((_, i) => (
             <div key={i} className={`h-24 rounded-2xl border ${c.border} ${c.surface} animate-pulse bg-black/5 dark:bg-white/5`} />
           ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
           <StatCard title="Total" value={stats.total} icon={BarChart2} color={c.text} />
           <StatCard title="Available" value={stats.available} color="#34D399" dot />
           <StatCard title="Beta" value={stats.beta} color="#FBBF24" dot />
           <StatCard title="Coming Soon" value={stats.comingSoon} color="#94A3B8" dot />
           <StatCard title="Recent" value={stats.recentCount} />
           <StatCard title="Popular" value={stats.popularCount} />
        </div>
      ) : null}

      {/* Services Table */}
      <div className={`rounded-2xl border ${c.border} ${c.surface} overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className={`border-b ${c.border} bg-black/5 dark:bg-white/5`}>
              <tr>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Highlights</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-inherit">
              {servicesLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted">Loading services...</td>
                </tr>
              ) : services.map(service => {
                const Icon = service.icon || Sparkles;
                const color = CATEGORY_COLORS[service.category as keyof typeof CATEGORY_COLORS] || "#94A3B8";
                return (
                  <tr key={service.id} className={`transition-colors ${c.surfaceHover} group`}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: color + "1A", color }}>
                          {service.iconUrl ? <img src={service.iconUrl} alt={service.name} className="h-full w-full object-cover" /> : <Icon size={20} strokeWidth={2} />}
                        </div>
                        <div>
                          <p className="font-semibold">{service.name}</p>
                          <p className={`text-xs ${c.textMuted} line-clamp-1`}>{service.tagline}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><CategoryBadge category={service.category} /></td>
                    <td className="px-5 py-4"><StatusBadge status={service.status} /></td>
                    <td className="px-5 py-4">
                       <div className="flex items-center gap-2">
                         {service.popular && <span className="flex items-center gap-1 text-[11px] font-medium text-[#FF6B35] bg-[#FF6B35]/10 px-2 py-0.5 rounded-full"><TrendingUp size={10} /> Popular</span>}
                         {service.recent && <span className="flex items-center gap-1 text-[11px] font-medium text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full"><Clock size={10} /> Recent</span>}
                       </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                       <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => openEdit(service)} className={`p-1.5 rounded-lg ${c.surfaceHover} text-blue-500`}><Pencil size={16} /></button>
                         <DeleteButton onDelete={() => deleteMutation.mutate({ id: service.id })} c={c} />
                       </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <AdminServiceModal 
          service={editingService} 
          close={() => setModalOpen(false)} 
          onSave={(data: any) => {
            if (editingService) {
              updateMutation.mutate({ id: editingService.id, data });
            } else {
              createMutation.mutate({ data });
            }
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, dot }: any) {
  const { c } = useUI();
  return (
    <div className={`flex flex-col justify-center rounded-2xl border p-4 ${c.surface} ${c.border}`}>
       <div className="flex items-center gap-2 mb-2">
         {Icon && <Icon size={16} color={color || c.textMuted} />}
         {dot && <StatusDot color={color} />}
         <span className={`text-xs font-medium uppercase tracking-wider ${c.textMuted}`}>{title}</span>
       </div>
       <p className="text-2xl font-bold">{value || 0}</p>
    </div>
  );
}

function DeleteButton({ onDelete, c }: { onDelete: () => void; c: any }) {
  const [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (confirm) {
      const t = setTimeout(() => setConfirm(false), 3000);
      return () => clearTimeout(t);
    }
  }, [confirm]);

  if (confirm) {
    return (
      <button onClick={onDelete} className={`px-2 py-1 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors`}>
        Confirm?
      </button>
    );
  }
  return (
    <button onClick={() => setConfirm(true)} className={`p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors`}>
      <Trash2 size={16} />
    </button>
  );
}

function AdminServiceModal({ service, close, onSave }: any) {
  const { c } = useUI();
  const [formData, setFormData] = useState({
    id: service?.id || "",
    name: service?.name || "",
    tagline: service?.tagline || "",
    description: service?.description || "",
    category: service?.category || "Utilities",
    status: service?.status || "Available",
    iconName: service?.iconName || "Sparkles",
    iconUrl: service?.iconUrl || "",
    popular: service?.popular || false,
    recent: service?.recent || false,
    features: service?.features?.join("\n") || "",
    keywords: service?.keywords?.join(", ") || "",
    url: service?.url || "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...formData,
      features: formData.features.split("\n").map((f: string) => f.trim()).filter(Boolean),
      keywords: formData.keywords.split(",").map((k: string) => k.trim()).filter(Boolean),
    };
    onSave(payload);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "unset"; };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fadeIn" onClick={close} />
      
      <div className={`relative w-full max-w-2xl overflow-hidden rounded-3xl border shadow-2xl animate-fadeSlide ${c.surface} ${c.border} flex flex-col max-h-[90vh]`}>
        <div className={`px-6 py-5 border-b ${c.border} flex items-center justify-between shrink-0`}>
          <h2 className="text-xl font-bold">{service ? "Edit Service" : "Add Service"}</h2>
          <button onClick={close} className={`p-2 rounded-full transition-colors ${c.surfaceHover}`}>
            <X size={20} className={c.textMuted} />
          </button>
        </div>

        {/* Live card preview */}
        {(() => {
          const PreviewIcon = ICON_MAP[formData.iconName] ?? Sparkles;
          const previewColor = CATEGORY_COLORS[formData.category as keyof typeof CATEGORY_COLORS] || "#94A3B8";
          return (
            <div className={`px-6 py-4 border-b ${c.border} shrink-0`}>
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${c.textFaint}`}>Preview</p>
              <div className={`flex items-center gap-4 rounded-2xl border p-4 ${c.surface} ${c.border}`}>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl overflow-hidden" style={{ backgroundColor: previewColor + "1A", color: previewColor }}>
                  {formData.iconUrl
                    ? <img src={formData.iconUrl} alt="" className="h-full w-full object-cover" />
                    : <PreviewIcon size={24} strokeWidth={2} />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold truncate ${c.text}`}>{formData.name || <span className={c.textFaint}>Service name</span>}</p>
                  <p className={`text-sm truncate ${c.textMuted}`}>{formData.tagline || <span className={c.textFaint}>Tagline…</span>}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusBadge status={formData.status} />
                  <CategoryBadge category={formData.category} />
                </div>
              </div>
            </div>
          );
        })()}

        <div className="p-6 overflow-y-auto">
          <form id="admin-service-form" onSubmit={handleSubmit} className="space-y-5">
            {!service && (
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>ID (Slug)</label>
                <input required name="id" value={formData.id} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35]`} placeholder="my-service-slug" />
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35]`} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Tagline</label>
                <input required name="tagline" value={formData.tagline} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35]`} />
              </div>
            </div>
            
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Description</label>
              <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] resize-none`} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Category</label>
                <select name="category" value={formData.category} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] appearance-none`}>
                  {CATEGORIES.map(c => <option key={c} value={c} className="text-black dark:text-white">{c}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] appearance-none`}>
                  <option value="Available" className="text-black dark:text-white">Available</option>
                  <option value="Beta" className="text-black dark:text-white">Beta</option>
                  <option value="Coming Soon" className="text-black dark:text-white">Coming Soon</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Icon Name</label>
                <select name="iconName" value={formData.iconName} onChange={handleChange} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] appearance-none`}>
                  {Object.keys(ICON_MAP).map(k => <option key={k} value={k} className="text-black dark:text-white">{k}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Custom Icon Image <span className={`font-normal ${c.textFaint}`}>(overrides Icon Name)</span></label>
              <div className="flex items-center gap-3">
                {formData.iconUrl && (
                  <img src={formData.iconUrl} alt="icon preview" className="h-12 w-12 rounded-xl object-cover shrink-0 border" style={{ borderColor: "rgba(128,128,128,0.3)" }} />
                )}
                <label className={`flex-1 flex items-center gap-2 cursor-pointer rounded-xl border px-4 py-2.5 text-sm transition-colors ${c.border} ${c.surfaceHover}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => setFormData((prev: any) => ({ ...prev, iconUrl: reader.result as string }));
                      reader.readAsDataURL(file);
                    }}
                  />
                  <span className={c.textMuted}>{formData.iconUrl ? "Replace image…" : "Upload image…"}</span>
                </label>
                {formData.iconUrl && (
                  <button type="button" onClick={() => setFormData((prev: any) => ({ ...prev, iconUrl: "" }))} className={`p-2 rounded-xl border transition-colors text-red-500 hover:bg-red-500/10 ${c.border}`}>
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Features (One per line)</label>
                <textarea name="features" value={formData.features} onChange={handleChange} rows={4} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] resize-none`} placeholder="Feature 1\nFeature 2" />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Keywords (Comma separated)</label>
                <textarea name="keywords" value={formData.keywords} onChange={handleChange} rows={4} className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35] resize-none`} placeholder="keyword1, keyword2" />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1.5 ${c.textMuted}`}>Service URL</label>
              <input name="url" value={formData.url} onChange={handleChange} type="url" className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none bg-transparent ${c.border} focus:border-[#FF6B35]`} placeholder="https://example.com" />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="popular" checked={formData.popular} onChange={handleChange} className="w-4 h-4 accent-[#FF6B35]" />
                Popular
              </label>
              <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                <input type="checkbox" name="recent" checked={formData.recent} onChange={handleChange} className="w-4 h-4 accent-[#FF6B35]" />
                Recent
              </label>
            </div>
          </form>
        </div>
        
        <div className={`px-6 py-5 border-t ${c.border} shrink-0 flex justify-end gap-3 bg-black/5 dark:bg-white/5`}>
          <button type="button" onClick={close} className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${c.border} ${c.surfaceHover}`}>Cancel</button>
          <button type="submit" form="admin-service-form" className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-[#FF6B35] hover:bg-[#FF5A1F] transition-colors`}>
            {service ? "Save Changes" : "Create Service"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <MainApp />
    </QueryClientProvider>
  );
}
