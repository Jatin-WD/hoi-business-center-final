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
    keys: ["home.hero.badge", "home.hero.title", "home.hero.description", "home.hero.focusTitle", "home.hero.focusDesc", "home.services.title", "home.services.description", "home.locations.title", "home.locations.description", "home.locations.body", "home.locations.cardBadge", "home.locations.cardTitle", "home.locations.cardDescription", "home.why.title", "home.why.description", "home.cta.title", "home.cta.description"],
  },
  { id: "service", title: "Booking Page", hint: "Main booking flow headings and package menu labels.", keys: ["service.hero.title", "service.hero.description", "service.overview.title", "service.overview.description"] },
  {
    id: "services",
    title: "Services Page",
    hint: "Public services landing page and service detail headings.",
    keys: [
      "services.page.title",
      "services.page.description",
      "services.page.eyebrow",
      "services.section.eyebrow",
      "services.section.title",
      "services.card.tag",
      "services.card.defaultDesc",
      "services.booth-reservation.title",
      "services.booth-reservation.description",
      "services.booth-reservation.overview",
      "services.booth-reservation.highlights",
      "services.booth-reservation.process",
      "services.booth-reservation.bestFor",
      "services.booth-design.title",
      "services.booth-design.description",
      "services.booth-design.overview",
      "services.booth-design.highlights",
      "services.booth-design.process",
      "services.booth-design.bestFor",
      "services.booth-install-demolition.title",
      "services.booth-install-demolition.description",
      "services.booth-install-demolition.overview",
      "services.booth-install-demolition.highlights",
      "services.booth-install-demolition.process",
      "services.booth-install-demolition.bestFor",
      "services.logistics.title",
      "services.logistics.description",
      "services.logistics.overview",
      "services.logistics.highlights",
      "services.logistics.process",
      "services.logistics.bestFor",
      "services.marketing.title",
      "services.marketing.description",
      "services.marketing.overview",
      "services.marketing.highlights",
      "services.marketing.process",
      "services.marketing.bestFor",
      "services.interpretation-protocol.title",
      "services.interpretation-protocol.description",
      "services.interpretation-protocol.overview",
      "services.interpretation-protocol.highlights",
      "services.interpretation-protocol.process",
      "services.interpretation-protocol.bestFor",
    ],
  },
  { id: "yashobhoomi", title: "Yashobhoomi Page", hint: "Yashobhoomi hero content.", keys: ["yashobhoomi.hero.title", "yashobhoomi.hero.description"] },
  {
    id: "about",
    title: "About Us Page",
    hint: "About page intro content.",
    keys: [
      "about.badge",
      "about.hero.title",
      "about.hero.description",
      "about.whoTitle",
      "about.body1",
      "about.body2",
      "about.body3",
      "about.ourApproach",
      "about.approachTitle",
      "about.approachBody",
      "about.coreValues",
      "about.coreValuesTitle",
      "about.value.excellence",
      "about.value.excellenceDesc",
      "about.value.reliability",
      "about.value.reliabilityDesc",
      "about.value.innovation",
      "about.value.innovationDesc",
      "about.value.partnership",
      "about.value.partnershipDesc",
      "about.servicesOverview",
      "about.currentServices",
    ],
  },
  { id: "contact", title: "Contact Us Page", hint: "Contact page title and description.", keys: ["contact.title", "contact.description"] },
  { id: "manpower", title: "Apply for Manpower", hint: "Manpower page hero title and description.", keys: ["manpower.hero.title", "manpower.hero.description"] },
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


