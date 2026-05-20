import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarCheck, MapPin, PackageCheck } from "lucide-react";
import HeroSection from "@/components/common/HeroSection";
import CTABanner from "@/components/common/CTABanner";
import { loadCatalog, type CatalogVenue } from "@/lib/catalog";
import { LocationCard, ServiceCard, VenueGroup, locationName } from "./service/ServiceCards";

export default function ServicePage() {
  const [selectedLocation, setSelectedLocation] = useState("");
  const { data: catalog = { venues: [], services: [] }, isLoading, error, refetch } = useQuery({
    queryKey: ["service-catalog"],
    queryFn: loadCatalog,
  });

  const groupedVenues = useMemo(() => groupVenues(catalog.venues), [catalog.venues]);
  const venueGroups = useMemo(() => prioritizedVenueGroups(groupedVenues), [groupedVenues]);
  const selectedVenues = selectedLocation ? groupedVenues[selectedLocation] ?? [] : [];
  const packageCount = catalog.services.reduce((total, service) => total + service.packages.length, 0);

  useEffect(() => {
    if (!selectedLocation && groupedVenues.yashobhoomi?.length) setSelectedLocation("yashobhoomi");
  }, [groupedVenues, selectedLocation]);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection breadcrumbs={[{ label: "Home", href: "/" }, { label: "Service" }]} title="Exhibition Services" description="Explore booth, logistics, marketing, interpretation, and manpower support loaded from the database.">
        <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
          <Stat icon={PackageCheck} label="Services" value={catalog.services.length} />
          <Stat icon={CalendarCheck} label="Packages" value={packageCount} />
          <Stat icon={MapPin} label="Venues" value={catalog.venues.length} />
        </div>
      </HeroSection>

      <main className="mx-auto max-w-[1600px] space-y-10 px-6 py-12 sm:px-8">
        {isLoading ? <StateCard title="Loading services..." detail="Fetching the latest service catalog from the database." /> : null}
        {error ? <StateCard title="Could not load services" detail={error instanceof Error ? error.message : "Failed to load services"} onRetry={() => refetch()} /> : null}

        {!isLoading && !error ? (
          <>
            <section>
              <SectionHeader eyebrow="Step 1" title="Choose Your Exhibition Location" description="Yashobhoomi is preselected as the primary HOI venue. Change the location to see services and quote links for another venue." />
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {venueGroups.map(([locationId, venues]) => (
                  <LocationCard key={locationId} locationId={locationId} venues={venues} active={selectedLocation === locationId} onSelect={() => setSelectedLocation(locationId)} />
                ))}
              </div>
            </section>

            {selectedLocation ? (
              <>
                <VenueGroup locationId={selectedLocation} venues={selectedVenues} serviceCount={catalog.services.length} featured={selectedLocation === "yashobhoomi"} />
                <section>
                  <SectionHeader eyebrow="Step 2" title={`Services at ${locationName(selectedLocation, selectedVenues)}`} description="Choose a service or package. Every quote and package link will continue with this selected location." />
                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {catalog.services.map((service) => <ServiceCard key={service.id} service={service} selectedVenues={selectedVenues} selectedLocation={selectedLocation} />)}
                    {!catalog.services.length ? <StateCard title="No services found" detail="Seed the database to show service packages here." /> : null}
                  </div>
                </section>
              </>
            ) : (
              <StateCard title="Select a location to view services" detail="Yashobhoomi is listed first because it is the primary HOI service location." />
            )}

            <CTABanner title="Need a custom exhibition requirement?" description="Share your service, package, venue, and timeline. The HOI team will respond with pricing and next steps." primaryLabel="Request Quote" primaryHref={selectedLocation ? `/contact?location=${encodeURIComponent(locationName(selectedLocation, selectedVenues))}` : "/contact"} secondaryLabel="Apply for Man Power" secondaryHref="/manpower" />
          </>
        ) : null}
      </main>
    </div>
  );
}

function SectionHeader({ eyebrow, title, description }: { eyebrow?: string; title: string; description: string }) {
  return (
    <div className="mb-6">
      {eyebrow ? <p className="mb-2 text-xs font-bold uppercase tracking-wide text-[#1a3a8f]">{eyebrow}</p> : null}
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-gray-500">{description}</p>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof PackageCheck; label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/20 bg-white/10 px-4 py-3">
      <div className="flex items-center gap-2 text-blue-100"><Icon size={16} /> <span className="text-xs font-semibold uppercase tracking-wide">{label}</span></div>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function StateCard({ title, detail, onRetry }: { title: string; detail?: string; onRetry?: () => void }) {
  return <div className="rounded-lg border border-gray-100 bg-white p-8 text-center"><p className="font-semibold text-gray-900">{title}</p>{detail ? <p className="mt-2 text-sm text-gray-500">{detail}</p> : null}{onRetry ? <button type="button" onClick={onRetry} className="mt-4 rounded-lg bg-[#1a3a8f] px-4 py-2 text-sm font-semibold text-white">Retry</button> : null}</div>;
}

function groupVenues(venues: CatalogVenue[]) {
  return venues.reduce<Record<string, CatalogVenue[]>>((groups, venue) => {
    const key = venue.locationId || venue.city || "venues";
    groups[key] = [...(groups[key] ?? []), venue];
    return groups;
  }, {});
}

function prioritizedVenueGroups(groups: Record<string, CatalogVenue[]>) {
  return Object.entries(groups).sort(([a], [b]) => {
    if (a === "yashobhoomi") return -1;
    if (b === "yashobhoomi") return 1;
    return a.localeCompare(b);
  });
}
