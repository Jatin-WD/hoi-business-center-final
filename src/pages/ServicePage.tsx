import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MapPin, PackageCheck } from "lucide-react";
import HeroSection from "@/components/common/HeroSection";
import CTABanner from "@/components/common/CTABanner";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog } from "@/lib/catalog";
import { ServiceCard, VenueGroup } from "./service/ServiceCards";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

export default function ServicePage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "service.hero.title": "Exhibition Services",
    "service.hero.description": "All six HOI services are centered on Yashobhoomi, our primary exhibition venue in Dwarka, New Delhi.",
    "service.overview.title": "Services at Yashobhoomi",
    "service.overview.description": "All six services are available through Yashobhoomi with package links and quote flows attached to this venue.",
  });
  const { data: catalog = { venues: [], services: [] }, isLoading, error, refetch } = useQuery({
    queryKey: ["service-catalog"],
    queryFn: loadCatalog,
  });

  const yashobhoomiVenue =
    catalog.venues.find((venue) => venue.locationId === "yashobhoomi")
    ?? catalog.venues[0]
    ?? null;
  const selectedVenues = yashobhoomiVenue ? [yashobhoomiVenue] : [];
  const packageCount = catalog.services.reduce((total, service) => total + service.packages.length, 0);

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <HeroSection breadcrumbs={[{ label: t("nav.home", "Home"), href: "/" }, { label: t("nav.booking", "Booking") }]} title={cms("service.hero.title")} description={cms("service.hero.description")}>
        <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={PackageCheck} label={t("common.servicesOverview", "Services")} value={catalog.services.length} />
          <Stat icon={CalendarCheck} label={t("common.packages", "Packages")} value={packageCount} />
          <Stat icon={MapPin} label={t("common.venueFocus", "Venue")} value={yashobhoomiVenue ? 1 : 0} />
        </div>
      </HeroSection>

      <main className="mx-auto max-w-[1600px] space-y-10 px-6 py-12 sm:px-8">
        {isLoading ? <StateCard title={t("service.loading", "Loading services...")} detail={t("service.loadingDetail", "Fetching the latest service catalog from the database.")} /> : null}
        {error ? <StateCard title={t("service.loadError", "Could not load services")} detail={error instanceof Error ? error.message : t("service.loadErrorDetail", "Failed to load services")} onRetry={() => refetch()} /> : null}
        {!isLoading && !error && !yashobhoomiVenue ? <StateCard title={t("service.yashNotFound", "Yashobhoomi not found")} detail={t("service.yashMissing", "The venue data is missing, but the service catalog is still available.")} /> : null}

        {!isLoading && !error ? (
          <>
            <section>
            <SectionHeader eyebrow={t("nav.yashobhoomi", "Yashobhoomi")} title={t("service.primaryVenue", "Our Primary Exhibition Venue")} description={t("service.primaryVenueDesc", "HOI Business Center is built around Yashobhoomi. Every service, package, and execution plan revolves around this venue.")} />
              {yashobhoomiVenue ? <VenueGroup locationId="yashobhoomi" venues={selectedVenues} serviceCount={catalog.services.length} featured /> : null}
            </section>

            <section>
              <SectionHeader eyebrow={t("nav.services", "Services")} title={cms("service.overview.title")} description={cms("service.overview.description")} />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                {catalog.services.map((service) => <ServiceCard key={service.id} service={service} selectedVenues={selectedVenues} selectedLocation="yashobhoomi" />)}
                {!catalog.services.length ? <StateCard title="No services found" detail="Seed the database to show service packages here." /> : null}
              </div>
            </section>

            <CTABanner title={t("service.cta.title", "Need a Yashobhoomi exhibition requirement?")} description={t("service.cta.description", "Share your service, package, and timeline. The HOI team will respond with pricing and next steps.")} primaryLabel={t("common.requestQuote", "Request Quote")} primaryHref="/contact?location=Yashobhoomi" secondaryLabel={t("nav.yashobhoomi", "View Yashobhoomi")} secondaryHref="/yashobhoomi" />
          </>
        ) : null}
      </main>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#f97316]">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof PackageCheck; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
      <div className="flex items-center gap-2 text-orange-100"><Icon size={16} /> <span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StateCard({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return <div className="rounded-lg border border-gray-100 bg-white p-8 text-center"><p className="font-semibold text-gray-900">{title}</p>{detail ? <p className="mt-2 text-sm text-gray-500">{detail}</p> : null}{onRetry ? <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#f97316] px-4 py-2 text-sm font-semibold text-white">Retry</button> : null}</div>;
}
