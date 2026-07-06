import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, Building2, ChevronRight, Info, MapPin } from "lucide-react";
import { loadCatalog, type CatalogService, type CatalogVenue } from "@/lib/catalog";

interface Props {
  onClose: () => void;
}

type CatalogState = {
  venues: CatalogVenue[];
  services: CatalogService[];
};

const YASHOBHOOMI_LOCATION = { id: "yashobhoomi", label: "Yashobhoomi", state: "Delhi / NCR" };

export default function ServiceMegaMenu({ onClose }: Props) {
  const [catalog, setCatalog] = useState<CatalogState>({ venues: [], services: [] });
  const [activeLocation, setActiveLocation] = useState("");
  const [activeVenueId, setActiveVenueId] = useState("");
  const [activeServiceId, setActiveServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const locations = useMemo(() => {
    const map = new Map<string, { id: string; label: string; state: string }>();
    catalog.venues.forEach((venue) => {
      if (!venue.locationId) return;
      map.set(venue.locationId, { id: venue.locationId, label: venue.city || venue.state || venue.locationId, state: venue.state });
    });
    map.set(YASHOBHOOMI_LOCATION.id, map.get(YASHOBHOOMI_LOCATION.id) ?? YASHOBHOOMI_LOCATION);
    return [YASHOBHOOMI_LOCATION, ...[...map.values()].filter((location) => location.id !== YASHOBHOOMI_LOCATION.id)];
  }, [catalog.venues]);

  const venues = catalog.venues.filter((venue) => venue.locationId === activeLocation);
  const activeVenue = venues.find((venue) => venue.subVenueId === activeVenueId) ?? venues[0];
  const activeService = catalog.services.find((service) => service.id === activeServiceId) ?? catalog.services[0];
  const isYashobhoomi = activeLocation === YASHOBHOOMI_LOCATION.id;
  const selectedLocationName = isYashobhoomi ? "Yashobhoomi" : activeVenue?.name || activeVenue?.city || "";
  const selectedServiceName = activeService?.label || "";
  const requirementHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(selectedServiceName)}&location=${encodeURIComponent(selectedLocationName)}`;

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (!mounted) return;
        setCatalog(data);
        setActiveLocation(YASHOBHOOMI_LOCATION.id);
        setActiveVenueId(data.venues[0]?.subVenueId ?? "");
        setActiveServiceId(data.services[0]?.id ?? "");
        setError("");
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Failed to load menu"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const selectLocation = (locationId: string) => {
    const firstVenue = catalog.venues.find((venue) => venue.locationId === locationId);
    setActiveLocation(locationId);
    setActiveVenueId(firstVenue?.subVenueId ?? "");
  };

  return (
    <div className="w-full bg-white border-t-2 border-[#f97316]" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}>
      <div className="mx-auto w-full max-w-[1600px] px-5">
        <div className="flex items-center gap-0 py-3 border-b border-gray-100 overflow-x-auto">
          <StepBadge n={1} label="Select Location" status="active" />
          <StepArrow />
          <StepBadge n={2} label="Select Venue" status={activeVenue ? "active" : "inactive"} />
          <StepArrow />
          <StepBadge n={3} label="Select Service" status={activeService ? "active" : "inactive"} />
          <StepArrow />
          <StepBadge n={4} label="Select Package" status={activeService ? "active" : "inactive"} />
          <div className="ml-auto pl-6 text-xs text-gray-400 hidden xl:flex items-center gap-1.5 whitespace-nowrap"><MapPin size={11} /><span className="font-semibold text-[#f97316]">{isYashobhoomi ? "Yashobhoomi" : activeVenue?.city}</span>{activeVenue && <><span>/</span><span>{activeVenue.name.split(",")[0]}</span></>}</div>
        </div>

        {loading && <MenuState title="Loading services..." />}
        {error && <MenuState title="Could not load menu" detail={error} />}
        {!loading && !error && (
          <div
            className={`grid min-h-[420px] ${isYashobhoomi ? "grid-cols-[250px_280px_minmax(280px,1fr)_180px]" : "grid-cols-[250px_300px_280px_minmax(280px,1fr)_180px]"}`}
          >
            <Panel title="Location" icon={<MapPin size={9} className="inline mr-1" />}>
              {locations.map((location) => (
                <button key={location.id} onMouseEnter={() => selectLocation(location.id)} onClick={() => selectLocation(location.id)} className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${activeLocation === location.id ? "bg-[#f97316] text-white shadow-sm" : "text-gray-700 hover:bg-[#fff7ed] hover:text-[#f97316]"}`}>
                  <span><span className="block leading-tight">{location.label}</span><span className="block text-[10px] opacity-70">{location.state}</span></span>
                  <ChevronRight size={12} className="flex-shrink-0 opacity-70 ml-1" />
                </button>
              ))}
            </Panel>

            {!isYashobhoomi && <Panel title={`Venues ${activeVenue?.city ? `in ${activeVenue.city}` : ""}`} icon={<Building2 size={9} className="inline mr-1" />}>
              {venues.map((venue) => (
                <button key={venue.id} onClick={() => setActiveVenueId(venue.subVenueId)} className={`w-full text-left flex items-start justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 gap-2 ${activeVenue?.id === venue.id ? "bg-[#fff7ed] text-[#f97316] border border-[#fed7aa]" : "text-gray-600 hover:bg-gray-50 hover:text-[#f97316]"}`}>
                  <span className="leading-snug">{venue.name}</span>
                  <ChevronRight size={12} className="flex-shrink-0 opacity-60 mt-0.5" />
                </button>
              ))}
              {activeVenue && (
                <Link href={`/venue/${activeVenue.locationId}/${activeVenue.subVenueId}`} onClick={onClose} className="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 text-sm font-semibold text-gray-700 hover:border-[#f97316] hover:bg-[#fff7ed] hover:text-[#f97316]">
                  <Info size={15} /> Know more about {activeVenue.name.split(",")[0]}
                </Link>
              )}
            </Panel>}

            <Panel title="Services Available">
              {catalog.services.map((service) => (
                <button key={service.id} onMouseEnter={() => setActiveServiceId(service.id)} onClick={() => setActiveServiceId(service.id)} className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${activeService?.id === service.id ? "bg-[#fff7ed] text-gray-900 border border-[#fed7aa] shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-[#f97316]"}`}>
                  <span className="leading-tight flex-1">{service.label}</span>
                  <ChevronRight size={12} className="flex-shrink-0 opacity-50" />
                </button>
              ))}
            </Panel>

            <div className="min-w-0 overflow-y-auto border-r border-gray-100 px-6 py-4" style={{ maxHeight: "460px" }}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{activeService?.label ?? "Service"} Packages</p>
              <div className="space-y-1.5">{activeService?.packages.map((pkg, idx) => <Link key={`${activeService.id}-${idx}`} href={withLocation(pkg.href, selectedLocationName)} onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-[#f97316] hover:bg-[#fff7ed] hover:shadow-sm transition-all group"><span className="text-sm text-gray-700 group-hover:text-[#f97316] font-medium">{pkg.label}</span><ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316]" /></Link>)}</div>
            </div>

            <div className="bg-gradient-to-b from-[#fff7ed] to-white px-4 py-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
              {selectedLocationName ? <p className="mb-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#f97316]">Location: {selectedLocationName}</p> : null}
              <Link href={requirementHref} onClick={onClose} className="block w-full text-center bg-[#f97316] text-white px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#ea580c] transition-colors mb-2.5">Book Now</Link>
              <Link href={requirementHref} onClick={onClose} className="block w-full text-center border border-[#f97316] text-[#f97316] px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#fff7ed] transition-colors">Get Quote</Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return <div className="min-w-0 overflow-y-auto border-r border-gray-100 px-4 py-4" style={{ maxHeight: "460px" }}><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">{icon}{title}</p>{children}</div>;
}

function MenuState({ title, detail }: { title: string; detail?: string }) {
  return <div className="py-12 text-center text-sm text-gray-500"><p className="font-semibold text-gray-800">{title}</p>{detail && <p className="mt-1">{detail}</p>}</div>;
}

type StepStatus = "active" | "done" | "inactive";

function StepBadge({ n, label, status }: { n: number; label: string; status: StepStatus }) {
  const circleClass = status === "active" ? "bg-[#f97316] text-white" : status === "done" ? "bg-[#fb923c] text-white opacity-85" : "bg-gray-200 text-gray-500";
  const textClass = status === "active" ? "text-[#f97316] font-semibold" : status === "done" ? "text-[#c2410c] font-medium opacity-85" : "text-gray-400";
  return <div className={`flex items-center gap-1.5 whitespace-nowrap ${textClass}`}><span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${circleClass}`}>{n}</span><span className="text-xs">{label}</span></div>;
}

function StepArrow() {
  return <ChevronRight size={12} className="text-gray-300 flex-shrink-0 mx-1" />;
}

function withLocation(href: string, location: string) {
  if (!location) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}location=${encodeURIComponent(location)}`;
}
