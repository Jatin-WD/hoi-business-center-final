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
  const requirementHref = `/contact?type=Service%20Requirement&service=${encodeURIComponent(activeService?.label || "")}&location=Yashobhoomi`;

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
    <div className="w-full border-t-2 border-[#f97316] bg-white" style={{ boxShadow: "0 18px 40px rgba(0,0,0,0.10)" }}>
      <div className="mx-auto w-full max-w-[1600px] px-5">
        <div className="flex items-center gap-0 overflow-x-auto border-b border-gray-100 py-2.5">
          <StepBadge n={1} label="Yashobhoomi" status="active" />
          <StepArrow />
          <StepBadge n={2} label="Services" status={activeService ? "active" : "inactive"} />
          <StepArrow />
          <StepBadge n={3} label="Packages" status={activeService ? "active" : "inactive"} />
          <div className="ml-auto hidden whitespace-nowrap pl-6 text-xs text-gray-400 xl:flex items-center gap-1.5">
            <MapPin size={11} />
            <span className="font-semibold text-[#f97316]">Yashobhoomi</span>
          </div>
        </div>

        {loading && <MenuState title="Loading services..." />}
        {error && <MenuState title="Could not load menu" detail={error} />}

        {!loading && !error && (
          <div className="grid min-h-[430px] grid-cols-[290px_minmax(250px,260px)_minmax(300px,1fr)_180px]">
            <div className="min-w-0 border-r border-gray-100 px-4 py-4">
              <Link
                href="/yashobhoomi"
                onClick={onClose}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-orange-100 bg-[#fff8f1] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-[188px] overflow-hidden">
                  <img
                    src="/assets/yashobhoomi.png"
                    alt={yashobhoomiVenue?.name || "Yashobhoomi"}
                    className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/28 to-black/5" />
                  <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-[#f97316] px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Sparkles size={12} /> Official Venue
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <div className="inline-flex items-center rounded-full bg-black/30 px-2.5 py-1 text-[11px] font-medium tracking-wide text-white/90 backdrop-blur-sm">
                      Dwarka, New Delhi
                    </div>
                    <h3 className="mt-2 max-w-[220px] text-[18px] font-bold leading-tight drop-shadow-sm">
                      {yashobhoomiVenue?.name || YASHOBHOOMI_LOCATION.label}
                    </h3>
                    <p className="mt-1 max-w-[90%] text-[12px] leading-5 text-white/90">
                      HOI's primary exhibition base for focused, premium service delivery.
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4">
                  <p className="text-sm leading-relaxed text-gray-600">
                    HOI's primary exhibition base. All six services and packages are routed through Yashobhoomi for a focused, premium experience.
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <MapPin size={12} className="text-[#f97316]" />
                      Primary HOI venue
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                      <Sparkles size={12} className="text-[#f97316]" />
                      6 services, 1 venue
                    </span>
                  </div>

                  <div className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-[#f97316]">
                    View Yashobhoomi <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            </div>

            <Panel title="Services Available">
              {catalog.services.map((service) => (
                <button
                  key={service.id}
                  onMouseEnter={() => setActiveServiceId(service.id)}
                  onClick={() => setActiveServiceId(service.id)}
                  className={`mb-0.5 flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all ${
                    activeService?.id === service.id
                      ? "border border-[#fed7aa] bg-[#fff7ed] text-gray-900 shadow-sm"
                      : "text-gray-700 hover:bg-gray-50 hover:text-[#f97316]"
                  }`}
                >
                  <span className="leading-tight flex-1">{service.label}</span>
                  <ChevronRight size={12} className="flex-shrink-0 opacity-50" />
                </button>
              ))}
            </Panel>

            <div className="min-w-0 border-r border-gray-100 px-5 py-4">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                {activeService?.label ?? "Service"} Packages
              </p>
              {activeService?.packages.length ? (
                <div className="space-y-1.5">
                  {activeService.packages.map((pkg, idx) => (
                    <Link
                      key={`${activeService.id}-${idx}`}
                      href={withLocation(pkg.href, "Yashobhoomi")}
                      onClick={onClose}
                      className="group flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3 transition-all hover:border-[#f97316] hover:bg-[#fff7ed] hover:shadow-sm"
                    >
                      <span className="text-sm font-medium text-gray-700 group-hover:text-[#f97316]">{pkg.label}</span>
                      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316]" />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm leading-relaxed text-gray-600">
                    {activeService?.description || "Service details are available, but no package links are stored for this row yet."}
                  </p>
                  {activeService?.price || activeService?.durationType || activeService?.durationValue ? (
                    <div className="grid grid-cols-1 gap-2 rounded-2xl border border-[#fed7aa] bg-[#fff7ed] p-4">
                      {activeService.price ? (
                        <p className="text-sm font-semibold text-gray-900">
                          Price: <span className="text-[#f97316]">{activeService.price}</span>
                        </p>
                      ) : null}
                      {activeService.durationType || activeService.durationValue ? (
                        <p className="text-sm text-gray-700">
                          Duration: {activeService.durationType || "duration"} {activeService.durationValue ? `- ${activeService.durationValue}` : ""}
                        </p>
                      ) : null}
                    </div>
                  ) : null}
                  {activeService?.features?.length ? (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Features</p>
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

            <div className="bg-gradient-to-b from-[#fff7ed] to-white px-4 py-5">
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Quick Actions</p>
              <p className="mb-3 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-[#f97316]">Location: Yashobhoomi</p>
              <Link href={requirementHref} onClick={onClose} className="mb-2.5 block w-full rounded-lg bg-[#f97316] px-3 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]">
                Book Now
              </Link>
              <Link href={requirementHref} onClick={onClose} className="block w-full rounded-lg border border-[#f97316] px-3 py-2.5 text-center text-sm font-semibold text-[#f97316] transition-colors hover:bg-[#fff7ed]">
                Get Quote
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-0 border-r border-gray-100 px-4 py-4">
      <p className="mb-3 px-1 text-[10px] font-bold uppercase tracking-widest text-gray-400">
        {icon}
        {title}
      </p>
      {children}
    </div>
  );
}

function MenuState({ title, detail }: { title: string; detail?: string }) {
  return (
    <div className="py-12 text-center text-sm text-gray-500">
      <p className="font-semibold text-gray-800">{title}</p>
      {detail && <p className="mt-1">{detail}</p>}
    </div>
  );
}

type StepStatus = "active" | "done" | "inactive";

function StepBadge({ n, label, status }: { n: number; label: string; status: StepStatus }) {
  const circleClass =
    status === "active"
      ? "bg-[#f97316] text-white"
      : status === "done"
        ? "bg-[#fb923c] text-white opacity-85"
        : "bg-gray-200 text-gray-500";
  const textClass =
    status === "active"
      ? "text-[#f97316] font-semibold"
      : status === "done"
        ? "text-[#c2410c] font-medium opacity-85"
        : "text-gray-400";
  return (
    <div className={`flex items-center gap-1.5 whitespace-nowrap ${textClass}`}>
      <span className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${circleClass}`}>{n}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function StepArrow() {
  return <ChevronRight size={12} className="mx-1 flex-shrink-0 text-gray-300" />;
}

function withLocation(href: string, location: string) {
  if (!location) return href;
  const separator = href.includes("?") ? "&" : "?";
  return `${href}${separator}location=${encodeURIComponent(location)}`;
}
