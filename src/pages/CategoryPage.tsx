import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { loadCatalog, locationLabel, venuesByLocation, type CatalogService, type CatalogVenue } from "@/lib/catalog";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translatePackageLabel, translateServiceLabel, translateSiteText } from "@/lib/site-translations";
import ServiceDetailBySlug from "./service/ServiceDetailBySlug";

interface Props {
  params?: { category?: string; location?: string };
}

type CatalogState = {
  venues: CatalogVenue[];
  services: CatalogService[];
};

export default function CategoryPage({ params }: Props) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const locationId = params?.category ?? "";
  const requestedVenue = params?.location ?? "";
  const [catalog, setCatalog] = useState<CatalogState>({ venues: [], services: [] });
  const [activeVenueId, setActiveVenueId] = useState(requestedVenue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const venues = useMemo(() => venuesByLocation(catalog.venues, locationId), [catalog.venues, locationId]);
  const activeVenue = venues.find((venue) => venue.subVenueId === activeVenueId) ?? venues[0];
  const activeService = catalog.services.find((service) => service.id === locationId);
  const isYashobhoomi = locationId === "yashobhoomi";
  const title = isYashobhoomi ? t("nav.yashobhoomi", "Yashobhoomi") : locationLabel(catalog.venues, locationId);

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (!mounted) return;
        setCatalog(data);
        setError("");
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Failed to load venue services"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeVenueId && venues[0]) setActiveVenueId(venues[0].subVenueId);
  }, [activeVenueId, venues]);

  if (!loading && !error && activeService && !requestedVenue) {
    return <ServiceDetailBySlug service={activeService} venues={catalog.venues} />;
  }

  if (!loading && !error && venues.length === 0 && !isYashobhoomi) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <div className="bg-[linear-gradient(135deg,#0a0f18_0%,#111827_56%,#f97316_112%)] px-8 py-14 text-white">
        <div className="max-w-[1600px] mx-auto">
          <PageBreadcrumb
            items={[
              { label: t("nav.home", "Home"), href: "/" },
              { label: t("nav.booking", "Booking"), href: "/service" },
              { label: title },
              ...(activeVenue ? [{ label: activeVenue.name.split(",")[0] }] : []),
            ]}
            className="mb-5 text-white/72"
          />
          <h1 className="mb-3 text-4xl font-bold">{title}</h1>
          {activeVenue && <p className="text-yellow-300 font-semibold text-lg mb-2">{activeVenue.name}</p>}
          <p className="text-zinc-200 max-w-xl">{t("category.hero.description", "Select a venue below, then choose from available services and packages.")}</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-12">
        {loading && <StateCard title={t("common.loading", "Loading...")} />}
        {error && <StateCard title={t("common.couldNotLoad", "Could not load content")} detail={error} />}

        {!loading && !error && (
          <>
            {!isYashobhoomi && <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 text-sm overflow-x-auto">
                <StepItem n={1} label={t("category.step.locationSelected", "Location Selected")} status="done" />
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                <StepItem n={2} label={t("category.step.selectVenue", "Select Venue")} status="active" />
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                <StepItem n={3} label={t("category.step.selectService", "Select Service")} status="inactive" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">{t("category.venuesIn", "Venues in")} {title}</h3>
              <div className="flex flex-wrap gap-2">
                {venues.map((venue) => (
                  <button key={venue.id} onClick={() => setActiveVenueId(venue.subVenueId)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeVenue?.id === venue.id ? "bg-[#f97316] text-white border-[#f97316] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-[#f97316] hover:text-[#f97316]"}`}>
                    {venue.name.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>}

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">
              {t("category.servicesAt", "Services at")} {activeVenue?.name.split(",")[0] ?? title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {catalog.services.map((service) => (
                <ServiceCard key={service.id} service={service} venueName={activeVenue?.name ?? title} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ServiceCard({ service, venueName }: { service: CatalogService; venueName: string }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const serviceLabel = translateServiceLabel(service.id, language);
  const requirementHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(serviceLabel)}&location=${encodeURIComponent(venueName)}`;
  const locationParam = `?location=${encodeURIComponent(venueName)}`;
  return (
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-lg">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">{serviceLabel}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{service.packages.length} {t("common.packageOptions", "package options")}</p>
      </div>
      <div className="p-5 space-y-2">
        {service.packages.map((pkg, idx) => (
          <Link key={`${service.id}-${idx}`} href={`${pkg.href}${locationParam}`} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 hover:border-[#f97316] hover:bg-orange-50 transition-all group">
            <span className="text-sm text-gray-700 group-hover:text-[#f97316] font-medium">{translatePackageLabel(pkg.label, language)}</span>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Link href={requirementHref} className="flex-1 text-center bg-[#f97316] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#ea580c] transition-colors">{t("common.bookNow", "Book Now")}</Link>
        <Link href={requirementHref} className="flex-1 text-center border border-[#f97316] text-[#f97316] py-2 rounded-lg text-sm font-semibold hover:bg-orange-50 transition-colors">{t("common.requestQuote", "Get Quote")}</Link>
      </div>
    </div>
  );
}

function NotFound() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{t("category.locationNotFound", "Location Not Found")}</h1>
        <Link href="/service" className="text-[#f97316] hover:underline">{t("common.backToBooking", "Back to Booking")}</Link>
      </div>
    </div>
  );
}

function StateCard({ title, detail }: { title: string; detail?: string }) {
  return <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center"><p className="font-semibold text-gray-900">{title}</p>{detail && <p className="text-sm text-gray-500 mt-2">{detail}</p>}</div>;
}

type StepStatus = "active" | "done" | "inactive";

function StepItem({ n, label, status }: { n: number; label: string; status: StepStatus }) {
  const circleClass = status === "active" ? "bg-[#f97316] text-white" : status === "done" ? "bg-[#f97316] text-white opacity-70" : "bg-gray-200 text-gray-500";
  const textClass = status === "active" ? "text-[#f97316] font-semibold" : status === "done" ? "text-[#f97316] font-medium opacity-80" : "text-gray-400";
  return <div className={`flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${textClass}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${circleClass}`}>{n}</span>{label}</div>;
}
