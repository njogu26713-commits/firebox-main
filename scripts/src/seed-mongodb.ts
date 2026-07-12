import { MongoClient } from "mongodb";

const SERVICES = [
  {
    id: "firebox-bot",
    name: "Firebox Bot",
    tagline: "Automate WhatsApp conversations",
    description: "Build and deploy WhatsApp bots that answer, route, and follow up with customers automatically, no code required.",
    category: "Communication",
    status: "Available",
    iconName: "MessageCircle",
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
    iconName: "Film",
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
    iconName: "Handshake",
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
    iconName: "Code2",
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
    iconName: "Terminal",
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
    iconName: "Contact",
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
    iconName: "FileText",
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
    iconName: "KeyRound",
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
    iconName: "QrCode",
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
    iconName: "Store",
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
    iconName: "Radio",
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
    iconName: "CheckSquare",
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
    iconName: "Sparkles",
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
    iconName: "GitBranch",
    keywords: ["ci", "cd", "pipeline", "deploy", "build"],
    popular: false,
    recent: false,
    features: ["Visual pipeline builder", "Parallel test runs", "Native CodeVault integration", "Deploy previews for every branch"],
  },
];

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI required");

  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db();
  const col = db.collection("services");

  const count = await col.countDocuments();
  if (count > 0) {
    console.log(`MongoDB already has ${count} services — skipping seed.`);
    await client.close();
    return;
  }

  await col.insertMany(SERVICES);
  console.log(`Seeded ${SERVICES.length} services into MongoDB.`);
  await client.close();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
