import { Link } from "wouter";
import { ArrowRight, Building2, CheckCircle, MapPin, PackageCheck } from "lucide-react";
import type { CatalogService, CatalogVenue } from "@/lib/catalog";

export function ServiceCard({ service, selectedVenues, selectedLocation }: { service: CatalogService; selectedVenues: CatalogVenue[]; selectedLocation: string }) {
  const location = locationName(selectedLocation, selectedVenues);
  const quoteHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(service.label)}&location=${encodeURIComponent(location)}`;
  return (
    <article className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1a3a8f] hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#1a3a8f]"><PackageCheck size={20} /></div>
        <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500">{location}</span>
      </div>
      <h3 className="text-lg font-bold text-gray-900">{service.label}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-500 line-clamp-3">{service.description || `${service.packages.length} package option${service.packages.length === 1 ? "" : "s"} available`}</p>
      <div className="mt-4 space-y-2">
        {service.packages.slice(0, 3).map((pkg) => <Link key={pkg.href} href={withLocation(pkg.href, location)} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-600 hover:bg-blue-50 hover:text-[#1a3a8f]"><span>{pkg.label}</span><ArrowRight size={13} /></Link>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href={`/service/${service.id}?location=${encodeURIComponent(location)}`} className="rounded-lg border border-[#1a3a8f] px-3 py-2 text-center text-sm font-bold text-[#1a3a8f] hover:bg-blue-50">Packages</Link>
        <Link href={quoteHref} className="rounded-lg bg-[#1a3a8f] px-3 py-2 text-center text-sm font-bold text-white hover:bg-[#152e75]">Get Quote</Link>
      </div>
    </article>
  );
}

export function LocationCard({ locationId, venues, active, onSelect }: { locationId: string; venues: CatalogVenue[]; active: boolean; onSelect: () => void }) {
  const featured = locationId === "yashobhoomi";
  const image = venues[0]?.image;
  return (
    <button type="button" onClick={onSelect} className={`group overflow-hidden rounded-lg border text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? "border-[#1a3a8f] bg-blue-50 ring-2 ring-blue-100" : featured ? "border-yellow-300 bg-white" : "border-gray-100 bg-white hover:border-[#1a3a8f]"}`}>
      <div className="relative h-28 bg-[#1a3a8f]">
        {image ? <img src={image} alt={locationName(locationId, venues)} className="h-full w-full object-cover opacity-80 transition-transform group-hover:scale-105" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2460]/80 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-lg text-white ${featured ? "bg-yellow-500" : "bg-[#1a3a8f]"}`}><MapPin size={16} /></span>
          {featured ? <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-900">Priority Venue</span> : null}
        </div>
        {active ? <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-xs font-bold text-[#1a3a8f]"><CheckCircle size={13} /> Selected</span> : null}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900">{locationName(locationId, venues)}</h3>
        <p className="mt-1 text-sm text-gray-500">{venues.length} venue{venues.length === 1 ? "" : "s"} available</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a3a8f]">{active ? "Selected location" : "Select location"} <ArrowRight size={14} /></p>
      </div>
    </button>
  );
}

export function VenueGroup({ locationId, venues, serviceCount, featured = false }: { locationId: string; venues: CatalogVenue[]; serviceCount: number; featured?: boolean }) {
  return (
    <section className={`overflow-hidden rounded-lg border bg-white shadow-sm ${featured ? "border-yellow-200" : "border-gray-100"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
        <div className="relative min-h-56 bg-[#1a3a8f]">
          {venues[0]?.image ? <img src={venues[0].image} alt={locationName(locationId, venues)} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f2460]/90 via-[#0f2460]/30 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${featured ? "bg-yellow-500" : "bg-[#1a3a8f]"}`}><MapPin size={17} /></span>
              {featured ? <span className="rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-gray-900">Priority Venue</span> : null}
            </div>
            <h3 className="text-2xl font-bold">{locationName(locationId, venues)}</h3>
            <p className="mt-1 text-sm text-blue-100">{featured ? "Primary HOI service location" : `${venues.length} venue${venues.length === 1 ? "" : "s"} available`}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4">
            <h4 className="text-sm font-bold uppercase tracking-wide text-gray-500">Available Venues</h4>
            <p className="mt-1 text-sm text-gray-500">Explore venue details before choosing a package or quote.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {venues.map((venue) => <VenueCard key={venue.id} venue={venue} serviceCount={serviceCount} />)}
          </div>
        </div>
      </div>
    </section>
  );
}

export function VenueCard({ venue, serviceCount }: { venue: CatalogVenue; serviceCount: number }) {
  return (
    <Link href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="block overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm transition-all hover:border-[#1a3a8f] hover:shadow-md">
      <div className="relative h-28 bg-[#1a3a8f]">
        {venue.image ? <img src={venue.image} alt={venue.name} className="h-full w-full object-cover opacity-80" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2460]/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
          <Building2 size={16} className="shrink-0 opacity-90" />
          <h4 className="line-clamp-2 text-sm font-semibold">{venue.name}</h4>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-500">{venue.city}, {venue.state}</p>
        <p className="mt-2 text-xs font-semibold text-gray-400">{serviceCount} services available</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#1a3a8f]">Explore venue <ArrowRight size={14} /></span>
      </div>
    </Link>
  );
}

export function locationName(locationId: string, venues: CatalogVenue[]) {
  if (locationId === "yashobhoomi") return "Yashobhoomi";
  return venues[0]?.city || venues[0]?.state || locationId;
}

function withLocation(href: string, location: string) {
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}location=${encodeURIComponent(location)}`;
}
