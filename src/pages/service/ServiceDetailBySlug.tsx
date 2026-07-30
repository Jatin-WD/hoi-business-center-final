import { Link } from "wouter";
import { ArrowRight, ChevronRight, MapPin } from "lucide-react";
import { type CatalogService, type CatalogVenue } from "@/lib/catalog";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translatePackageLabel, translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function ServiceDetailBySlug({ service, venues }: { service: CatalogService; venues: CatalogVenue[] }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const selectedLocation = new URLSearchParams(window.location.search).get("location") ?? "";
  const locationParam = selectedLocation ? `?location=${encodeURIComponent(selectedLocation)}` : "";
  const serviceLabel = translateServiceLabel(service.id, language);
  const selectedLocationLabel = selectedLocation === "Yashobhoomi" ? t("nav.yashobhoomi", "Yashobhoomi") : selectedLocation;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316] px-8 py-14 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-zinc-200">
            <Link href="/" className="hover:text-white">{t("nav.home", "Home")}</Link>
            <ChevronRight size={14} />
            <Link href="/service" className="hover:text-white">{t("nav.booking", "Booking")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{serviceLabel}</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold">{serviceLabel}</h1>
          <p className="max-w-2xl text-zinc-200">
            {service.description || t("service.explorePackages", "Explore package options and choose a venue where this service can be arranged.")}
          </p>
          {selectedLocation ? (
            <p className="mt-4 inline-flex rounded-lg bg-white px-3 py-1.5 text-sm font-bold text-[#111111]">
              {t("service.selectedLocation", "Selected location")}: {selectedLocationLabel}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] space-y-10 px-8 py-12">
        <section>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">{t("common.packages", "Packages")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {service.packages.map((pkg) => (
              <Link key={pkg.href} href={`${pkg.href}${locationParam}`} className="group rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#f97316] hover:shadow-lg">
                <p className="font-semibold text-gray-900 group-hover:text-[#f97316]">{translatePackageLabel(pkg.label, language)}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#f97316]">
                  {t("service.viewPackage", "View package")} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
            {!service.packages.length && <EmptyCard message={t("service.noPackageLinks", "No package links are stored for this service yet, but the service record is available.")} />}
          </div>
        </section>

        <section>
          <h2 className="mb-5 text-2xl font-bold text-gray-900">{t("service.availableVenues", "Available Venues")}</h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {venues.map((venue) => (
              <Link key={venue.id} href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="rounded-2xl border border-gray-100 bg-white p-5 transition-all hover:border-[#f97316] hover:shadow-lg">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 text-[#f97316]">
                  <MapPin size={18} />
                </div>
                <p className="font-semibold text-gray-900">{venue.name}</p>
                <p className="mt-1 text-sm text-gray-500">{venue.city}, {venue.state}</p>
              </Link>
            ))}
            {!venues.length && <EmptyCard message={t("service.noVenues", "No venues are available yet.")} />}
          </div>
        </section>

        <div className="rounded-2xl bg-[#111111] p-7 text-white">
          <h2 className="text-xl font-bold">{t("service.needThisTitle", "Need this service for your exhibition?")}</h2>
          <p className="mt-2 text-zinc-200">{t("service.needThisBody", "Send a requirement and the team will respond with pricing, availability, and next steps.")}</p>
          <Link href={`/contact?type=Service%20Requirement&service=${encodeURIComponent(serviceLabel)}${selectedLocation ? `&location=${encodeURIComponent(selectedLocation)}` : ""}`} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
            {t("common.requestQuote", "Get Quote")} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyCard({ message }: { message: string }) {
  return <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500">{message}</div>;
}
