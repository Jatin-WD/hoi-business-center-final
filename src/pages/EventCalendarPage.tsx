import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  MapPin,
  Search,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

type EventItem = {
  id: number | string;
  name: string;
  date: string;
  venue: string;
  category?: string;
  status?: string;
  locationId?: string;
  description?: string;
  sourceUrl?: string;
  source_url?: string;
  imageUrl?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
};

const PAGE_SIZE = 8;
const ALL_VALUE = "all";

const LOCATION_LABELS: Record<string, string> = {
  all: "All Locations",
  yashobhoomi: "Yashobhoomi",
  delhi: "Delhi",
  mumbai: "Mumbai",
  pune: "Pune",
  chennai: "Chennai",
  bangalore: "Bangalore",
  hyderabad: "Hyderabad",
  kolkata: "Kolkata",
  ahmedabad: "Ahmedabad",
  kochi: "Kochi",
  chandigarh: "Chandigarh",
  jaipur: "Jaipur",
};

export default function EventCalendarPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "events.hero.title": "Event Calendar",
    "events.hero.description": "Explore upcoming exhibitions and trade shows across key venues.",
  });
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_VALUE);
  const [locationFilter, setLocationFilter] = useState(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState(ALL_VALUE);

  useEffect(() => {
    let mounted = true;

    setLoading(true);
    apiClient
      .getEvents()
      .then((response) => {
        if (!mounted) return;
        const items = Array.isArray(response?.data?.events) ? response.data.events : [];
        setEvents(
          items.map((event: any) => ({
            ...event,
            locationId: event.locationId || event.location_id || "",
            sourceUrl: event.sourceUrl || event.source_url || "",
            description: event.description || "",
            imageUrl: event.imageUrl || event.image_url || "",
          }))
        );
      })
      .catch(() => {
        if (!mounted) return;
        setEvents([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(
    () => [ALL_VALUE, ...Array.from(new Set(events.map((event) => String(event.category || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))],
    [events]
  );
  const locationOptions = useMemo(
    () => [ALL_VALUE, ...Array.from(new Set(events.map((event) => String(event.locationId || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))],
    [events]
  );
  const statusOptions = useMemo(
    () => [ALL_VALUE, ...Array.from(new Set(events.map((event) => String(event.status || "").trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b))],
    [events]
  );

  const filteredEvents = useMemo(() => {
    const text = query.trim().toLowerCase();
    const matchesText = (event: EventItem) => {
      if (!text) return true;
      return [event.name, event.date, event.venue, event.category, event.status, event.description, event.sourceUrl]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(text));
    };

    return events.filter((event) => {
      const categoryMatch = categoryFilter === ALL_VALUE || String(event.category || "").toLowerCase() === categoryFilter.toLowerCase();
      const locationMatch = locationFilter === ALL_VALUE || String(event.locationId || "").toLowerCase() === locationFilter.toLowerCase();
      const statusMatch = statusFilter === ALL_VALUE || String(event.status || "").toLowerCase() === statusFilter.toLowerCase();
      return categoryMatch && locationMatch && statusMatch && matchesText(event);
    });
  }, [events, query, categoryFilter, locationFilter, statusFilter]);

  const totalEvents = events.length;
  const filteredCount = filteredEvents.length;
  const totalPages = Math.max(1, Math.ceil(filteredCount / PAGE_SIZE));

  const visibleEvents = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredEvents.slice(start, start + PAGE_SIZE);
  }, [filteredEvents, currentPage]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, categoryFilter, locationFilter, statusFilter]);

  useEffect(() => {
    if (!selectedEvent) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedEvent(null);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [selectedEvent]);

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #111111 0%, #241d18 55%, var(--hoi-primary) 100%)",
        }}
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0, transparent 22%), radial-gradient(circle at 80% 30%, white 0, transparent 18%), radial-gradient(circle at 50% 70%, white 0, transparent 20%)" }} />
        <div className="relative mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Link href="/" className="transition-colors hover:text-white">{t("nav.home", "Home")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t("nav.eventCalendar", "Event Calendar")}</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white/90">
                <CalendarDays size={14} />
                {t("nav.eventCalendar", "Event Calendar")}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {cms("events.hero.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                {cms("events.hero.description")}
              </p>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <StatCard label={t("events.stat.total", "Total events")} value={totalEvents} />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{t("events.listings.eyebrow", "Event listings")}</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">{t("events.listings.title", "Cards styled for quick scanning")}</h2>
          </div>
          <p className="text-sm text-slate-600">
            {loading ? t("events.loading", "Loading events...") : (
              <>
                {t("events.listings.showing", "Showing")} <span className="font-semibold text-slate-900">{visibleEvents.length}</span> {t("common.of", "of")}{" "}
                <span className="font-semibold text-slate-900">{filteredCount}</span> {t("events.listings.filteredWord", "filtered events")}
                <span className="mx-2 text-slate-300">|</span>
                <span className="font-semibold text-slate-900">{totalEvents}</span> {t("events.listings.eventsWord", "total events")}
              </>
            )}
          </p>
        </div>

        <div className="mb-5 rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 lg:grid-cols-[1.4fr_repeat(3,minmax(0,1fr))]">
            <SearchInput value={query} onChange={setQuery} placeholder={t("events.filters.search", "Search by event, venue, or description")} />
            <SelectField label={t("events.filters.category", "Category")} value={categoryFilter} onChange={setCategoryFilter} options={categoryOptions} />
            <SelectField label={t("events.filters.location", "Location")} value={locationFilter} onChange={setLocationFilter} options={locationOptions} />
            <SelectField label={t("events.filters.status", "Status")} value={statusFilter} onChange={setStatusFilter} options={statusOptions} />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <FilterChip active={categoryFilter === ALL_VALUE} onClick={() => setCategoryFilter(ALL_VALUE)}>{t("events.filters.allCategories", "All categories")}</FilterChip>
              {categoryOptions.filter((item) => item !== ALL_VALUE).slice(0, 5).map((item) => (
                <FilterChip key={item} active={categoryFilter === item} onClick={() => setCategoryFilter(item)}>{item}</FilterChip>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategoryFilter(ALL_VALUE);
                setLocationFilter(ALL_VALUE);
                setStatusFilter(ALL_VALUE);
              }}
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition-colors hover:border-[color:var(--hoi-primary)] hover:text-[color:var(--hoi-primary)]"
            >
              {t("events.filters.clear", "Clear filters")}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: PAGE_SIZE }).map((_, index) => (
              <div key={index} className="h-40 animate-pulse rounded-[1.5rem] border border-black/5 bg-white" />
            ))}
          </div>
        ) : filteredCount === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <CalendarDays size={42} className="mx-auto text-slate-300" />
            <h3 className="mt-4 text-xl font-bold text-slate-900">{t("events.empty.title", "No matching events")}</h3>
            <p className="mt-2 text-sm text-slate-600">{t("events.empty.description", "Try changing the filters or search terms to find the event you want.")}</p>
          </div>
        ) : (
          <>
            <div className="grid gap-3 lg:grid-cols-2">
              {visibleEvents.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => setSelectedEvent(event)}
                  className="group flex w-full flex-col gap-3 rounded-[1.35rem] border border-black/5 bg-white p-4 text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(17,17,17,0.08)] focus:outline-none focus:ring-2 focus:ring-[color:var(--hoi-primary)]/30"
                  data-testid={`event-card-${event.id}`}
                >
                  <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start md:gap-5">
                    <div className="flex gap-3.5">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[color:var(--hoi-primary)]/10 text-[color:var(--hoi-primary)] ring-1 ring-[color:var(--hoi-primary)]/10">
                        <CalendarDays size={24} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">{t("events.label.event", "Event")}</p>
                          <span className="rounded-full bg-gradient-to-r from-[color:var(--hoi-primary)] to-amber-500 px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                            {event.category || t("events.label.featured", "Featured")}
                          </span>
                        </div>
                        <h3 className="mt-1 line-clamp-2 text-[17px] font-bold leading-snug text-slate-900 transition-colors group-hover:text-[color:var(--hoi-primary)]">
                          {event.name}
                        </h3>
                        <div className="mt-2 space-y-1.25 text-[13px] text-slate-600">
                          <MetaRow icon={<Clock3 size={14} />} text={event.date} />
                          <MetaRow icon={<MapPin size={14} />} text={event.venue} />
                          {event.description ? <p className="line-clamp-2 pt-1 text-[12px] leading-5 text-slate-500">{event.description}</p> : null}
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-3 md:min-w-[160px] md:items-end">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Pill tone="neutral">{locationLabel(event.locationId, language)}</Pill>
                        <Pill tone={event.status?.toLowerCase() === "upcoming" ? "success" : "neutral"}>{event.status || "Upcoming"}</Pill>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400 md:justify-end">
                        <span>{t("events.quickAction", "Quick action")}</span>
                        <span className="h-px w-8 bg-slate-200" />
                      </div>

                      <span
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-[color:var(--hoi-primary)]/20 bg-[color:var(--hoi-primary)] px-4 py-2 text-sm font-bold text-white shadow-[0_10px_25px_rgba(249,115,22,0.25)] transition-transform group-hover:translate-y-[-1px]"
                        aria-hidden="true"
                      >
                        Book Booth
                        <ArrowRight size={15} />
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </>
        )}
      </section>

      {selectedEvent && (
        <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white/95">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/70">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function MetaRow({ icon, text }: { icon: ReactNode; text?: string }) {
  if (!text) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

function Pill({ children, tone }: { children: string; tone: "neutral" | "success" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${
        tone === "success"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {children}
    </span>
  );
}

function Pagination({ currentPage, totalPages, onPageChange }: { currentPage: number; totalPages: number; onPageChange: (page: number) => void }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const pages = getPageButtons(currentPage, totalPages);

  return (
    <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-[1.25rem] border border-black/5 bg-white px-4 py-4 shadow-sm sm:flex-row">
      <p className="text-sm text-slate-600">
        {t("common.page", "Page")} <span className="font-semibold text-slate-900">{currentPage}</span> {t("common.of", "of")} <span className="font-semibold text-slate-900">{totalPages}</span>
      </p>

      <div className="flex items-center gap-2">
        <PagerButton disabled={currentPage === 1} onClick={() => onPageChange(currentPage - 1)} icon={<ChevronLeft size={16} />} label={t("common.previous", "Previous")} />
        {pages.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2 text-slate-400">...</span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              className={`min-w-10 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
                page === currentPage
                  ? "bg-[color:var(--hoi-primary)] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              }`}
            >
              {page}
            </button>
          )
        )}
        <PagerButton disabled={currentPage === totalPages} onClick={() => onPageChange(currentPage + 1)} icon={<ChevronRight size={16} />} label={t("common.next", "Next")} />
      </div>
    </div>
  );
}

function PagerButton({ disabled, onClick, icon, label }: { disabled: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-[color:var(--hoi-primary)] hover:text-[color:var(--hoi-primary)] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {icon}
      {label}
    </button>
  );
}

function EventDetailModal({ event, onClose }: { event: EventItem; onClose: () => void }) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  useEffect(() => {
    const handleKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const contactHref = `/contact?type=Event%20Booking&event=${encodeURIComponent(event.name)}&location=${encodeURIComponent(locationLabel(event.locationId, language))}`;
  const officialSite = event.sourceUrl || event.source_url || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" onMouseDown={onClose}>
      <div
        className="max-h-[calc(100vh-3rem)] w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-white shadow-2xl"
        onMouseDown={(mouseEvent) => mouseEvent.stopPropagation()}
      >
        <div
          className="flex items-start justify-between gap-4 px-6 py-5 text-white"
          style={{
            background: "linear-gradient(135deg, #111111 0%, #1f2937 55%, var(--hoi-primary) 100%)",
          }}
        >
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("events.details.eyebrow", "Event details")}</p>
            <h3 className="mt-1 text-2xl font-black leading-tight">{event.name}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            aria-label={t("events.closeDetails", "Close event details")}
          >
            <X size={20} />
          </button>
        </div>

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto px-6 py-6">
          {event.imageUrl || event.image_url ? (
            <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <img
                src={event.imageUrl || event.image_url}
                alt={event.name}
                className="h-56 w-full object-cover"
                loading="lazy"
              />
            </div>
          ) : null}

          {event.description ? (
            <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("events.about", "About this event")}</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{event.description}</p>
            </div>
          ) : null}

          <div className="grid gap-3 sm:grid-cols-2">
            <InfoTile label={t("events.field.date", "Date")} value={event.date} />
            <InfoTile label={t("events.field.venue", "Venue")} value={event.venue} />
            <InfoTile label={t("events.field.location", "Location")} value={locationLabel(event.locationId, language)} />
            <InfoTile label={t("events.field.category", "Category")} value={event.category || "-"} />
            <InfoTile label={t("events.field.status", "Status")} value={event.status || t("events.status.upcoming", "Upcoming")} />
          </div>

          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{t("events.nextStep", "What you can do next")}</p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {t("events.nextStepDesc", "Open the contact flow with this event preselected, or close this popup and continue browsing the calendar.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {officialSite ? (
                <a href={officialSite} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[color:var(--hoi-primary)] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:opacity-95">
                  {t("events.officialSite", "Official Site")}
                  <ArrowRight size={16} />
                </a>
              ) : null}
              <Link href={contactHref} className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--hoi-primary)]/15 bg-white px-4 py-2.5 text-sm font-bold text-[color:var(--hoi-primary)] transition-colors hover:border-[color:var(--hoi-primary)]/30">
                {t("events.bookBooth", "Book Booth")}
                <ArrowRight size={16} />
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
              >
                {t("common.close", "Close")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value || "-"}</p>
    </div>
  );
}

function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 focus-within:border-[color:var(--hoi-primary)]">
      <span className="text-slate-400"><Search size={15} /></span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 focus:border-[color:var(--hoi-primary)] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option === ALL_VALUE ? "All" : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
        active
          ? "border-[color:var(--hoi-primary)] bg-[color:var(--hoi-primary)] text-white"
          : "border-slate-200 bg-white text-slate-600 hover:border-[color:var(--hoi-primary)] hover:text-[color:var(--hoi-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function locationLabel(locationId: string | undefined, language: string) {
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  if (!locationId) return t("events.location.all", "All Locations");
  return LOCATION_LABELS[locationId] || locationId.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function getPageButtons(currentPage: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1);

  const pages: Array<number | "..."> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) pages.push("...");
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}
