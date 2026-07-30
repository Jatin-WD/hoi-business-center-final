import { Link } from "wouter";
import { ArrowRight, Building2, CheckCircle, MapPin, PackageCheck } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import type { CatalogService, CatalogVenue } from "@/lib/catalog";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translatePackageLabel, translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export function ServiceCard({ service, selectedVenues, selectedLocation }: { service: CatalogService; selectedVenues: CatalogVenue[]; selectedLocation: string }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({ [`services.${service.id}.description`]: service.description || "" });
  const location = locationName(selectedLocation, selectedVenues);
  const serviceLabel = translateServiceLabel(service.id, language);
  const quoteHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(serviceLabel)}&location=${encodeURIComponent(location)}`;
  return (
    <article className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-[0_12px_32px_rgba(17,17,17,0.05)] transition-all hover:-translate-y-0.5 hover:border-[color:var(--hoi-primary)]/40 hover:shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--hoi-primary)]/10 text-[color:var(--hoi-primary)] ring-1 ring-[color:var(--hoi-primary)]/10">
          <PackageCheck size={20} />
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{location}</span>
      </div>
      <h3 className="hoi-display text-lg font-black text-slate-900">{serviceLabel}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-3">{cms(`services.${service.id}.description`) || t("service.packageCount", `${service.packages.length} package option${service.packages.length === 1 ? "" : "s"} available`)}</p>
      <div className="mt-4 space-y-2">
        {service.packages.slice(0, 3).map((pkg) => <Link key={pkg.href} href={withLocation(pkg.href, location)} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-[color:var(--hoi-primary)]/8 hover:text-[color:var(--hoi-primary)]"><span className="line-clamp-1">{translatePackageLabel(pkg.label, language)}</span><ArrowRight size={13} /></Link>)}
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Link href={`/service/${service.id}?location=${encodeURIComponent(location)}`} className="rounded-xl border border-[color:var(--hoi-primary)]/20 px-3 py-2.5 text-center text-sm font-bold text-[color:var(--hoi-primary)] transition-colors hover:bg-[color:var(--hoi-primary)]/8">{t("common.packages", "Packages")}</Link>
        <Link href={quoteHref} className="rounded-xl bg-[color:var(--hoi-primary)] px-3 py-2.5 text-center text-sm font-bold text-white transition-colors hover:opacity-95">{t("common.requestQuote", "Get Quote")}</Link>
      </div>
    </article>
  );
}

export function LocationCard({ locationId, venues, active, onSelect }: { locationId: string; venues: CatalogVenue[]; active: boolean; onSelect: () => void }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const featured = locationId === "yashobhoomi";
  const image = venues[0]?.image;
  return (
    <button type="button" onClick={onSelect} className={`group overflow-hidden rounded-[1.35rem] border text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${active ? "border-[color:var(--hoi-primary)]/40 bg-orange-50 ring-2 ring-orange-100" : featured ? "border-amber-200 bg-white" : "border-gray-100 bg-white hover:border-[color:var(--hoi-primary)]/30"}`}>
      <div className="relative h-28 bg-[#111111]">
        {image ? <img src={image} alt={locationName(locationId, venues)} className="h-full w-full object-cover opacity-80 transition-transform group-hover:scale-105" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-sm ${featured ? "bg-amber-500" : "bg-[color:var(--hoi-primary)]"}`}><MapPin size={16} /></span>
          {featured ? <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-900">{t("service.priorityVenue", "Priority Venue")}</span> : null}
        </div>
        {active ? <span className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[11px] font-bold text-[color:var(--hoi-primary)]"><CheckCircle size={13} /> {t("common.selected", "Selected")}</span> : null}
      </div>
      <div className="p-4">
        <h3 className="font-black text-slate-900">{locationName(locationId, venues)}</h3>
        <p className="mt-1 text-sm text-slate-500">{venues.length} {t("service.venuesAvailable", `venue${venues.length === 1 ? "" : "s"} available`)}</p>
        <p className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--hoi-primary)]">{active ? t("service.selectedLocation", "Selected location") : t("service.selectLocation", "Select location")} <ArrowRight size={14} /></p>
      </div>
    </button>
  );
}

export function VenueGroup({ locationId, venues, serviceCount, featured = false }: { locationId: string; venues: CatalogVenue[]; serviceCount: number; featured?: boolean }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  return (
    <section className={`overflow-hidden rounded-[1.75rem] border bg-white shadow-sm ${featured ? "border-amber-200" : "border-gray-100"}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
        <div className="relative min-h-56 bg-[#111111]">
          {venues[0]?.image ? <img src={venues[0].image} alt={locationName(locationId, venues)} className="absolute inset-0 h-full w-full object-cover" /> : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${featured ? "bg-amber-500" : "bg-[color:var(--hoi-primary)]"}`}><MapPin size={17} /></span>
              {featured ? <span className="rounded-full bg-white/90 px-2 py-1 text-[11px] font-bold text-slate-900">{t("service.priorityVenue", "Priority Venue")}</span> : null}
            </div>
        <h3 className="hoi-display text-2xl font-bold">{locationName(locationId, venues)}</h3>
            <p className="mt-1 text-sm text-white/80">{featured ? t("service.primaryLocation", "Primary HOI service location") : `${venues.length} ${t("service.venuesAvailable", `venue${venues.length === 1 ? "" : "s"} available`)}`}</p>
          </div>
        </div>
        <div className="p-5">
          <div className="mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-500">{t("service.availableVenues", "Available Venues")}</h4>
            <p className="mt-1 text-sm text-slate-500">{t("service.exploreVenues", "Explore venue details before choosing a package or quote.")}</p>
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
    <Link href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="block overflow-hidden rounded-[1.35rem] border border-gray-100 bg-white shadow-sm transition-all hover:border-[color:var(--hoi-primary)]/30 hover:shadow-md">
      <div className="relative h-28 bg-[#111111]">
        {venue.image ? <img src={venue.image} alt={venue.name} className="h-full w-full object-cover opacity-80" /> : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 text-white">
          <Building2 size={16} className="shrink-0 opacity-90" />
          <h4 className="hoi-display line-clamp-2 text-sm font-semibold">{venue.name}</h4>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-500">{venue.city}, {venue.state}</p>
        <p className="mt-2 text-xs font-semibold text-slate-400">{serviceCount} {t("service.servicesAvailable", "services available")}</p>
        <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[color:var(--hoi-primary)]">{t("service.exploreVenue", "Explore venue")} <ArrowRight size={14} /></span>
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
