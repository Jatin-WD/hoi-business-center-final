import { CalendarDays, FileText, LayoutDashboard, Settings, type LucideIcon } from "lucide-react";

export type Row = Record<string, any>;
export type DashboardData = {
  admin: Row;
  adminUsers: Row[];
  users: Row[];
  inquiries: Row[];
  manpower: Row[];
  bookings: Row[];
  content: Row[];
  services: Row[];
  packages: Row[];
  venues: Row[];
  events: Row[];
  replies: Row[];
  notifications: Row[];
  unreadNotifications: number;
  report?: Row;
};

export type ResourceKey = "services" | "packages" | "venues" | "events";

export const EMPTY_DASHBOARD_DATA: DashboardData = {
  admin: {},
  adminUsers: [],
  users: [],
  inquiries: [],
  manpower: [],
  bookings: [],
  content: [],
  services: [],
  packages: [],
  venues: [],
  events: [],
  replies: [],
  notifications: [],
  unreadNotifications: 0,
  report: undefined,
};

export function normalizeDashboardData(data: Partial<DashboardData> | undefined): DashboardData {
  return {
    ...EMPTY_DASHBOARD_DATA,
    ...(data ?? {}),
    admin: data?.admin ?? {},
    adminUsers: Array.isArray(data?.adminUsers) ? data.adminUsers : [],
    users: Array.isArray(data?.users) ? data.users : [],
    inquiries: Array.isArray(data?.inquiries) ? data.inquiries : [],
    manpower: Array.isArray(data?.manpower) ? data.manpower : [],
    bookings: Array.isArray(data?.bookings) ? data.bookings : [],
    content: Array.isArray(data?.content) ? data.content : [],
    services: Array.isArray(data?.services) ? data.services : [],
    packages: Array.isArray(data?.packages) ? data.packages : [],
    venues: Array.isArray(data?.venues) ? data.venues : [],
    events: Array.isArray(data?.events) ? data.events : [],
    replies: Array.isArray(data?.replies) ? data.replies : [],
    notifications: Array.isArray(data?.notifications) ? data.notifications : [],
    unreadNotifications: Number(data?.unreadNotifications || 0),
  };
}

export const PAGE_GROUPS = [
  {
    id: "home",
    title: "Home Page",
    hint: "Hero, services section, locations, why choose us, CTA.",
    keys: ["home.hero.badge", "home.hero.title", "home.hero.description", "home.services.title", "home.services.description", "home.locations.title", "home.locations.description", "home.why.title", "home.why.description", "home.cta.title", "home.cta.description"],
  },
  { id: "service", title: "Service Page", hint: "Main service listing page headings.", keys: ["service.hero.title", "service.hero.description", "service.overview.title", "service.overview.description"] },
  { id: "yashobhoomi", title: "Yashobhoomi Page", hint: "Yashobhoomi hero content.", keys: ["yashobhoomi.hero.title", "yashobhoomi.hero.description"] },
  { id: "about", title: "About Us Page", hint: "About page intro content.", keys: ["about.hero.title", "about.hero.description"] },
  { id: "contact", title: "Contact Us Page", hint: "Contact page title and description.", keys: ["contact.title", "contact.description"] },
  { id: "events", title: "Event Calendar Page", hint: "Event calendar intro copy.", keys: ["events.hero.title", "events.hero.description"] },
];

export const RESOURCE_FIELDS: Record<ResourceKey, string[]> = {
  services: ["service_id", "label", "packages"],
  packages: ["category", "subcategory", "title", "subtitle", "price", "price_note", "description", "includes", "not_includes", "duration"],
  venues: ["location_id", "sub_venue_id", "name", "address", "city", "state", "description", "about", "total_area", "halls", "capacity", "established", "website", "specialities", "image"],
  events: ["name", "date", "venue", "location_id", "category", "status"],
};

export const RESOURCE_LABELS: Record<ResourceKey, { title: string; hint: string; icon: LucideIcon }> = {
  services: { title: "Services", hint: "Manage service menu items. Package links are shown in a readable preview.", icon: Settings },
  packages: { title: "Packages", hint: "Manage service package detail pages. List fields can use comma-separated text or JSON arrays.", icon: FileText },
  venues: { title: "Venues / Yashobhoomi", hint: "All venues, city pages, Yashobhoomi areas, images and stats.", icon: LayoutDashboard },
  events: { title: "Event Calendar", hint: "Manage upcoming event cards. Date text appears on the website exactly as entered.", icon: CalendarDays },
};

export const THEME_PRESETS = [
  { name: "Orange Noir", primary: "#f97316", primaryDark: "#111111", accent: "#f59e0b", accentText: "#111111" },
  { name: "Charcoal Luxe", primary: "#111111", primaryDark: "#030712", accent: "#f97316", accentText: "#ffffff" },
  { name: "Warm Minimal", primary: "#ea580c", primaryDark: "#1c1917", accent: "#fafaf9", accentText: "#111111" },
];

export const DEFAULT_THEME = THEME_PRESETS[0];
export const blankResource = (key: ResourceKey) => Object.fromEntries(RESOURCE_FIELDS[key].map((field) => [field, ""]));


