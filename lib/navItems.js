export const adminNav = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/news", label: "Manage News" },
  { href: "/admin/players", label: "Manage Players" },
  { href: "/admin/parents", label: "Manage Parents" },
  { href: "/admin/coaches", label: "Manage Coaches" },
  { href: "/admin/sessions", label: "Manage Sessions" },
  { href: "/admin/settings", label: "Settings" },
];

export const playerNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/sessions", label: "My Sessions" },
  { href: "/updates", label: "Latest News", id: "latest-news" },
  { href: "/dashboard/play-online", label: "Play Online", id: "play-online" },
  { href: "/dashboard/profile", label: "Profile" },   // ← FIXED
];

export const parentNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/children", label: "My Children" },
  { href: "/dashboard/sessions", label: "Sessions" },
  { href: "/updates", label: "Latest News", id: "latest-news" },
  { href: "/dashboard/profile", label: "Profile" },   // ← FIXED
];

export const coachNav = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/players", label: "My Players" },
  { href: "/dashboard/sessions", label: "Session Notes" },
  { href: "/updates", label: "Latest News", id: "latest-news" },
  { href: "/dashboard/profile", label: "Profile" },   // ← FIXED
];
