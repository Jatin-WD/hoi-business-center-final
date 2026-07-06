import { useEffect, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, MapPin, Sparkles } from "lucide-react";
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
  const [activeServiceId, setActiveServiceId] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const yashobhoomiVenue =
    catalog.venues.find((venue) => venue.locationId === YASHOBHOOMI_LOCATION.id)
    ?? catalog.venues[0]
    ?? null;
  const activeService = catalog.services.find((service) => service.id === activeServiceId) ?? catalog.services[0];
  const selectedServiceName = activeService?.label || "";
  const requirementHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(selectedServiceName)}&location=Yashobhoomi`;

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (!mounted) return;
        setCatalog(data);
        setActiveServiceId(data.services[0]?.id ?? "");
        setError("");
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Failed to load menu"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="w-full bg-white border-t-2 border-[#f97316]" style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.12)" }}>
      <div className="mx-auto w-full max-w-[1600px] px-5">
        <div className="flex items-center gap-0 py-2.5 border-b border-gray-100 overflow-x-auto">
          <StepBadge n={1} label="Yashobhoomi" status="active" />
          <StepArrow />
          <StepBadge n={2} label="Services" status={activeService ? "active" : "inactive"} />
          <StepArrow />
          <StepBadge n={3} label="Packages" status={activeService ? "active" : "inactive"} />
          <div className="ml-auto pl-6 text-xs text-gray-400 hidden xl:flex items-center gap-1.5 whitespace-nowrap">
            <MapPin size={11} />
            <span className="font-semibold text-[#f97316]">Yashobhoomi</span>
          </div>
        </div>

        {loading && <MenuState title="Loading services..." />}
        {error && <MenuState title="Could not load menu" detail={error} />}
        {!loading && !error && (
          <div
            className="grid min-h-[340px] grid-cols-[280px_minmax(250px,260px)_minmax(300px,1fr)_180px]"
          >
            <div className="min-w-0 overflow-y-auto border-r border-gray-100 px-4 py-4" style={{ maxHeight: "340px" }}>
              <Link
                href="/yashobhoomi"
                onClick={onClose}
                className="group relative block overflow-hidden rounded-2xl border border-orange-100 bg-gradient-to-br from-[#fff7ed] via-white to-[#fff1e8] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-44">
                  <img
                    src={yashobhoomiVenue?.image || "/assets/yashobhoomi.png"}
                    alt={yashobhoomiVenue?.name || "Yashobhoomi"}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Sparkles size={12} /> Official Venue
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-lg font-bold leading-tight">{yashobhoomiVenue?.name || YASHOBHOOMI_LOCATION.label}</h3>
                    <p className="mt-1 text-xs text-orange-50/90">Dwarka, New Delhi</p>
                  </div>
                </div>
                <div className="space-y-3 p-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    HOI Business Center’s primary exhibition base. All six services and packages are routed through Yashobhoomi for a focused, premium experience.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="Priority" value="HOI Venue" />
                    <MiniStat label="Focus" value="All 6 Services" />
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-[#f97316]">
                    View Yashobhoomi <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </div>

            <Panel title="Services Available">
              {catalog.services.map((service) => (
                <button key={service.id} onMouseEnter={() => setActiveServiceId(service.id)} onClick={() => setActiveServiceId(service.id)} className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all mb-0.5 ${activeService?.id === service.id ? "bg-[#fff7ed] text-gray-900 border border-[#fed7aa] shadow-sm" : "text-gray-700 hover:bg-gray-50 hover:text-[#f97316]"}`}>
                  <span className="leading-tight flex-1">{service.label}</span>
                  <ChevronRight size={12} className="flex-shrink-0 opacity-50" />
                </button>
              ))}
            </Panel>

            <div className="min-w-0 overflow-y-auto border-r border-gray-100 px-5 py-4" style={{ maxHeight: "340px" }}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">{activeService?.label ?? "Service"} Packages</p>
              {activeService?.packages.length ? (
                <div className="space-y-1.5">
                  {activeService.packages.map((pkg, idx) => (
                    <Link key={`${activeService.id}-${idx}`} href={withLocation(pkg.href, "Yashobhoomi")} onClick={onClose} className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:border-[#f97316] hover:bg-[#fff7ed] hover:shadow-sm transition-all group">
                      <span className="text-sm text-gray-700 group-hover:text-[#f97316] font-medium">{pkg.label}</span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316]" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-gray-600">{activeService?.description || "Service details are available, but no package links are stored for this row yet."}</p>
                  {activeService?.price || activeService?.durationType || activeService?.durationValue ? (
                    <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-4">
                      {activeService.price ? <p className="text-sm font-semibold text-gray-900">Price: <span className="text-[#f97316]">{activeService.price}</span></p> : null}
                      {activeService.durationType || activeService.durationValue ? <p className="text-sm text-gray-700">Duration: {activeService.durationType || "duration"} {activeService.durationValue ? `- ${activeService.durationValue}` : ""}</p> : null}
                    </div>
                  ) : null}
                  {activeService?.features?.length ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Features</p>
                      <div className="flex flex-wrap gap-2">
                        {activeService.features.slice(0, 12).map((feature) => (
                          <span key={feature} className="rounded-full border border-[#fed7aa] bg-white px-3 py-1 text-xs font-medium text-gray-700">
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-b from-[#fff7ed] to-white px-4 py-6">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Actions</p>
              <p className="mb-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#f97316]">Location: Yashobhoomi</p>
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
  return <div className="min-w-0 overflow-y-auto border-r border-gray-100 px-4 py-4" style={{ maxHeight: "340px" }}><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 px-1">{icon}{title}</p>{children}</div>;
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

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-orange-100 bg-white px-3 py-2 shadow-sm">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-0.5 text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}

function withLocation(href: string, location: string) {
  if (!location) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}location=${encodeURIComponent(location)}`;
}
