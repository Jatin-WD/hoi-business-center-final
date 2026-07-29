import { apiClient } from "./api-client";

export type CatalogPackage = {
  label: string;
  href: string;
};

export type CatalogService = {
  id: string;
  label: string;
  description?: string;
  price?: string;
  durationType?: string;
  durationValue?: string;
  features?: string[];
  images?: string[];
  packages: CatalogPackage[];
};

export type CatalogVenue = {
  id: number;
  locationId: string;
  subVenueId: string;
  name: string;
  address: string;
  city: string;
  state: string;
  description: string;
  about: string;
  totalArea: string;
  halls: string;
  capacity: string;
  established: string;
  website: string;
  specialities: string[];
  image: string;
};

export const CANONICAL_SERVICE_IDS = [
  "booth-reservation",
  "booth-design",
  "booth-install-demolition",
  "logistics",
  "marketing",
  "interpretation-protocol",
] as const;

const CANONICAL_SERVICE_CATALOG: Record<(typeof CANONICAL_SERVICE_IDS)[number], { label: string; packages: CatalogPackage[] }> = {
  "booth-reservation": {
    label: "Booth Reservation",
    packages: [
      { label: "Compact Size 6' x 6' ft (36 sq ft)", href: "/packages/booth-reservation/compact" },
      { label: "Standard Size 6' x 9' ft (54 sq ft)", href: "/packages/booth-reservation/standard" },
      { label: "Premium Size 10' x 10' ft (100 sq ft)", href: "/packages/booth-reservation/premium" },
      { label: "Executive 16' x 20' ft (380 sq ft)", href: "/packages/booth-reservation/executive" },
      { label: "Custom Size", href: "/packages/booth-reservation/custom" },
    ],
  },
  "booth-design": {
    label: "Booth Design",
    packages: [
      { label: "Essential Design", href: "/packages/booth-design/essential" },
      { label: "Professional Design", href: "/packages/booth-design/professional" },
      { label: "Premium Design", href: "/packages/booth-design/premium" },
      { label: "Luxury Design", href: "/packages/booth-design/luxury" },
      { label: "Custom Design", href: "/packages/booth-design/custom" },
    ],
  },
  "booth-install-demolition": {
    label: "Booth Install & Demolition",
    packages: [
      { label: "Basic Installation", href: "/packages/booth-install-demolition/basic" },
      { label: "Standard Installation", href: "/packages/booth-install-demolition/standard" },
      { label: "Premium Installation", href: "/packages/booth-install-demolition/premium" },
      { label: "Deluxe Installation", href: "/packages/booth-install-demolition/deluxe" },
    ],
  },
  "logistics": {
    label: "Logistics Services",
    packages: [
      { label: "Basic Logistics Package", href: "/packages/logistics/basic" },
      { label: "Standard Logistics Package", href: "/packages/logistics/standard" },
      { label: "Premium Logistics Package", href: "/packages/logistics/premium" },
      { label: "Full Freight Management", href: "/packages/logistics/freight" },
    ],
  },
  "marketing": {
    label: "Marketing Services",
    packages: [
      { label: "Basic Marketing Package", href: "/packages/marketing/basic" },
      { label: "Digital Marketing Package", href: "/packages/marketing/digital" },
      { label: "Premium Marketing Package", href: "/packages/marketing/premium" },
      { label: "Full Marketing Campaign", href: "/packages/marketing/campaign" },
    ],
  },
  "interpretation-protocol": {
    label: "Interpretation & Protocol",
    packages: [
      { label: "Basic Interpretation", href: "/packages/interpretation-protocol/basic" },
      { label: "Professional Interpretation", href: "/packages/interpretation-protocol/professional" },
      { label: "VIP Protocol Services", href: "/packages/interpretation-protocol/vip" },
      { label: "Full Protocol Management", href: "/packages/interpretation-protocol/management" },
    ],
  },
};

const CANONICAL_SERVICE_SET = new Set<string>(CANONICAL_SERVICE_IDS);

type ApiService = {
  service_id?: string;
  label?: string;
  name?: string;
  slug?: string;
  description?: string;
  price?: string;
  duration_type?: string;
  durationType?: string;
  duration_value?: string;
  durationValue?: string;
  features?: string[] | string;
  images?: string[] | string;
  packages?: CatalogPackage[];
};

type ApiVenue = {
  id: number;
  location_id?: string;
  sub_venue_id?: string;
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  description?: string;
  about?: string;
  total_area?: string;
  halls?: string;
  capacity?: string;
  established?: string;
  website?: string;
  specialities?: string[];
  image?: string;
};

const defaultVenueImage =
  "/assets/yashobhoomi.png";

const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const parseArray = (value: string[] | string | undefined) => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const normalizeService = (service: ApiService): CatalogService => ({
  id: service.service_id ?? "",
  label: service.label ?? service.name ?? service.slug ?? "Service",
  description: service.description ?? "",
  price: service.price ?? "",
  durationType: service.duration_type ?? service.durationType ?? "",
  durationValue: service.duration_value ?? service.durationValue ?? "",
  features: parseArray(service.features),
  images: parseArray(service.images),
  packages: Array.isArray(service.packages) ? service.packages : [],
});

function mergeCanonicalServices(services: CatalogService[]) {
  const rowsById = new Map(services.map((service) => [service.id, service]));
  return CANONICAL_SERVICE_IDS.map((serviceId) => {
    const fallback = CANONICAL_SERVICE_CATALOG[serviceId];
    const existing = rowsById.get(serviceId);
    return {
      id: serviceId,
      label: existing?.label || fallback.label,
      description: existing?.description || "",
      price: existing?.price || "",
      durationType: existing?.durationType || "",
      durationValue: existing?.durationValue || "",
      features: existing?.features || [],
      images: existing?.images || [],
      packages: existing?.packages?.length ? existing.packages : fallback.packages,
    } satisfies CatalogService;
  });
}

export const normalizeVenue = (venue: ApiVenue): CatalogVenue => ({
  id: venue.id,
  locationId: venue.location_id || slugify(venue.city || venue.state || venue.name || `venue-${venue.id}`),
  subVenueId: venue.sub_venue_id || slugify(venue.name || venue.address || `venue-${venue.id}`),
  name: venue.name ?? "Venue",
  address: venue.address ?? "",
  city: venue.city ?? "",
  state: venue.state ?? "",
  description: venue.description ?? "",
  about: venue.about ?? "",
  totalArea: venue.total_area ?? "",
  halls: venue.halls ?? "",
  capacity: venue.capacity ?? "",
  established: venue.established ?? "",
  website: venue.website ?? "",
  specialities: Array.isArray(venue.specialities) ? venue.specialities : [],
  image: (venue.location_id === "yashobhoomi" ? "/assets/yashobhoomi.png" : venue.image) || defaultVenueImage,
});

export async function loadCatalog() {
  const [venuesResponse, servicesResponse] = await Promise.all([
    apiClient.getVenues(),
    apiClient.getServices(),
  ]);

  const services = mergeCanonicalServices(
    ((servicesResponse as any)?.data?.services ?? [])
      .map(normalizeService)
      .filter((service: CatalogService) => CANONICAL_SERVICE_SET.has(service.id))
  );

  return {
    venues: ((venuesResponse as any)?.data?.venues ?? [])
      .map(normalizeVenue)
      .filter((venue: CatalogVenue) => venue.locationId === "yashobhoomi") as CatalogVenue[],
    services,
  };
}

export const locationLabel = (venues: CatalogVenue[], locationId: string) => {
  const match = venues.find((venue) => venue.locationId === locationId);
  return match?.city || match?.state || locationId;
};

export const venuesByLocation = (venues: CatalogVenue[], locationId: string) =>
  venues.filter((venue) => venue.locationId === locationId);
