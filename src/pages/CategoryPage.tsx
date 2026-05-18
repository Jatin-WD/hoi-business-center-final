import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight } from "lucide-react";
import { loadCatalog, locationLabel, venuesByLocation, type CatalogService, type CatalogVenue } from "@/lib/catalog";
import ServiceDetailBySlug from "./service/ServiceDetailBySlug";

interface Props {
  params?: { category?: string; location?: string };
}

type CatalogState = {
  venues: CatalogVenue[];
  services: CatalogService[];
};

export default function CategoryPage({ params }: Props) {
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
  const title = isYashobhoomi ? "Yashobhoomi" : locationLabel(catalog.venues, locationId);

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-14 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link href="/service" className="hover:text-white">Service</Link>
            <ChevronRight size={14} />
            <span className="text-white">{title}</span>
            {activeVenue && <><ChevronRight size={14} /><span>{activeVenue.name.split(",")[0]}</span></>}
          </div>
          <h1 className="text-4xl font-bold mb-3">{title}</h1>
          {activeVenue && <p className="text-yellow-300 font-semibold text-lg mb-2">{activeVenue.name}</p>}
          <p className="text-blue-200 max-w-xl">Select a venue below, then choose from available services and packages.</p>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-12">
        {loading && <StateCard title="Loading services..." />}
        {error && <StateCard title="Could not load services" detail={error} />}

        {!loading && !error && (
          <>
            {!isYashobhoomi && <div className="mb-10">
              <div className="flex items-center gap-3 mb-6 text-sm overflow-x-auto">
                <StepItem n={1} label="Location Selected" status="done" />
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                <StepItem n={2} label="Select Venue" status="active" />
                <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
                <StepItem n={3} label="Select Service" status="inactive" />
              </div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Venues in {title}</h3>
              <div className="flex flex-wrap gap-2">
                {venues.map((venue) => (
                  <button key={venue.id} onClick={() => setActiveVenueId(venue.subVenueId)} className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${activeVenue?.id === venue.id ? "bg-[#1a3a8f] text-white border-[#1a3a8f] shadow-md" : "bg-white text-gray-700 border-gray-200 hover:border-[#1a3a8f] hover:text-[#1a3a8f]"}`}>
                    {venue.name.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>}

            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-5">
              Services at {activeVenue?.name.split(",")[0] ?? title}
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
  const requirementHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(service.label)}&location=${encodeURIComponent(venueName)}`;
  const locationParam = `?location=${encodeURIComponent(venueName)}`;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all">
      <div className="p-5 border-b border-gray-100">
        <h2 className="font-bold text-gray-900">{service.label}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{service.packages.length} package options</p>
      </div>
      <div className="p-5 space-y-2">
        {service.packages.map((pkg, idx) => (
          <Link key={`${service.id}-${idx}`} href={`${pkg.href}${locationParam}`} className="flex items-center justify-between px-4 py-2.5 rounded-xl border border-gray-100 hover:border-[#1a3a8f] hover:bg-blue-50 transition-all group">
            <span className="text-sm text-gray-700 group-hover:text-[#1a3a8f] font-medium">{pkg.label}</span>
            <ArrowRight size={14} className="text-gray-300 group-hover:text-[#1a3a8f] transition-colors flex-shrink-0" />
          </Link>
        ))}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <Link href={requirementHref} className="flex-1 text-center bg-[#1a3a8f] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#152e75] transition-colors">Book Now</Link>
        <Link href={requirementHref} className="flex-1 text-center border border-[#1a3a8f] text-[#1a3a8f] py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors">Get Quote</Link>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Location Not Found</h1>
        <Link href="/service" className="text-[#1a3a8f] hover:underline">Back to Services</Link>
      </div>
    </div>
  );
}

function StateCard({ title, detail }: { title: string; detail?: string }) {
  return <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center"><p className="font-semibold text-gray-900">{title}</p>{detail && <p className="text-sm text-gray-500 mt-2">{detail}</p>}</div>;
}

type StepStatus = "active" | "done" | "inactive";

function StepItem({ n, label, status }: { n: number; label: string; status: StepStatus }) {
  const circleClass = status === "active" ? "bg-[#1a3a8f] text-white" : status === "done" ? "bg-[#1a3a8f] text-white opacity-70" : "bg-gray-200 text-gray-500";
  const textClass = status === "active" ? "text-[#1a3a8f] font-semibold" : status === "done" ? "text-[#1a3a8f] font-medium opacity-80" : "text-gray-400";
  return <div className={`flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${textClass}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${circleClass}`}>{n}</span>{label}</div>;
}
