import { apiClient } from "./api-client";

export type CatalogPackage = {
  label: string;
  href: string;
};

export type CatalogService = {
  id: string;
  label: string;
  description?: string;
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

type ApiService = {
  service_id?: string;
  label?: string;
  name?: string;
  slug?: string;
  description?: string;
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
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1600&q=80";

const slugify = (value: string) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const normalizeService = (service: ApiService): CatalogService => ({
  id: service.service_id ?? "",
  label: service.label ?? service.name ?? service.slug ?? "Service",
  description: service.description ?? "",
  packages: Array.isArray(service.packages) ? service.packages : [],
});

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
  image: venue.image || defaultVenueImage,
});

export async function loadCatalog() {
  const [venuesResponse, servicesResponse] = await Promise.all([
    apiClient.getVenues(),
    apiClient.getServices(),
  ]);

  return {
    venues: ((venuesResponse as any)?.data?.venues ?? []).map(normalizeVenue) as CatalogVenue[],
    services: ((servicesResponse as any)?.data?.services ?? []).map(normalizeService) as CatalogService[],
  };
}

export const locationLabel = (venues: CatalogVenue[], locationId: string) => {
  const match = venues.find((venue) => venue.locationId === locationId);
  return match?.city || match?.state || locationId;
};

export const venuesByLocation = (venues: CatalogVenue[], locationId: string) =>
  venues.filter((venue) => venue.locationId === locationId);
