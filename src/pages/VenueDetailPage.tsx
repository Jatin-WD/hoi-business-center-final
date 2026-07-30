import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Building2, Calendar, Globe, MapPin, Ruler, Users } from "lucide-react";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { apiClient } from "@/lib/api-client";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";
import { loadCatalog, normalizeVenue, type CatalogService, type CatalogVenue } from "@/lib/catalog";

const CANONICAL_YASHOBHOOMI_SUB_VENUE_ID = "india-international-convention-and-expo-centre";

interface Props {
  params?: { locationId?: string; subVenueId?: string };
}

export default function VenueDetailPage({ params }: Props) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const locationId = params?.locationId ?? "";
  const subVenueId = params?.subVenueId ?? "";
  const [venue, setVenue] = useState<CatalogVenue | null>(null);
  const [otherVenues, setOtherVenues] = useState<CatalogVenue[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const serviceHref = `/service/${locationId}/${subVenueId}`;
  const locationTitle = useMemo(() => venue?.city || venue?.state || locationId, [venue, locationId]);
  const legacyYashobhoomiSlug = locationId === "yashobhoomi" && subVenueId && subVenueId !== CANONICAL_YASHOBHOOMI_SUB_VENUE_ID;

  useEffect(() => {
    if (!legacyYashobhoomiSlug || typeof window === "undefined") return;
    window.location.replace(`/venue/yashobhoomi/${CANONICAL_YASHOBHOOMI_SUB_VENUE_ID}`);
  }, [legacyYashobhoomiSlug]);

  useEffect(() => {
    let mounted = true;
    Promise.all([apiClient.getVenue(locationId, subVenueId), loadCatalog()])
      .then(([venueResponse, catalog]) => {
        if (!mounted) return;
        const apiVenue = (venueResponse as any)?.data?.venue;
        setVenue(apiVenue ? normalizeVenue(apiVenue) : null);
        setOtherVenues(catalog.venues.filter((item) => item.locationId === locationId && item.subVenueId !== subVenueId));
        setServices(catalog.services);
        setError("");
      })
      .catch((err) => mounted && setError(err instanceof Error ? err.message : "Failed to load venue"))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [locationId, subVenueId]);

  if (loading) return <CenteredMessage title="Loading venue..." />;
  if (error || !venue) return <CenteredMessage title="Venue Not Found" detail={error || "We couldn't find details for this venue."} />;

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <div className="bg-[linear-gradient(135deg,#0a0f18_0%,#111827_56%,#f97316_112%)] px-8 py-16 text-white">
        <div className="max-w-[1600px] mx-auto">
          <PageBreadcrumb
            items={[
              { label: t("nav.home", "Home"), href: "/" },
              { label: t("nav.booking", "Booking"), href: "/service" },
              { label: locationTitle, href: `/service/${locationId}/${subVenueId}` },
              { label: venue.name.split(",")[0] },
            ]}
            className="mb-5 text-white/72"
          />
          <div className="flex items-center gap-2 text-yellow-300 text-sm font-semibold uppercase tracking-wider mb-3">
            <MapPin size={14} />
            <span>{venue.city}, {venue.state}</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold">{venue.name}</h1>
          <p className="text-zinc-200 max-w-2xl text-lg">{venue.description}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={serviceHref} className="inline-flex items-center gap-2 bg-[#f97316] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#ea580c] transition-colors">
              View Services at This Venue <ArrowRight size={16} />
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-2 border border-white/40 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-white/10 transition-colors">
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <main className="lg:col-span-2 space-y-8">
            <img src={venue.image} alt={venue.name} className="w-full h-72 object-cover rounded-2xl shadow-md" />
            <VenueStats venue={venue} />
            <InfoBlock title={`About ${venue.name.split(",")[0]}`} text={venue.about} address={venue.address} />
            <Specialities specialities={venue.specialities} />
            <ServicesBlock services={services} serviceHref={serviceHref} />
          </main>
          <aside className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-28">
            <h3 className="mb-2 text-lg font-bold text-gray-900">Book HOI Services Here</h3>
              <p className="text-sm text-gray-500 mb-5">Contact our team to plan your exhibition at {venue.name.split(",")[0]}.</p>
              <Link href={serviceHref} className="block w-full text-center bg-[#f97316] text-white py-3 rounded-xl font-semibold hover:bg-[#ea580c] transition-colors mb-3 text-sm">View Services</Link>
              <Link href="/contact" className="block w-full text-center border border-[#f97316] text-[#f97316] py-3 rounded-xl font-semibold hover:bg-orange-50 transition-colors text-sm">Contact Us</Link>
              {venue.website && <a href={venue.website} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#f97316] transition-colors"><Globe size={14} />Official Website</a>}
              <OtherVenues locationTitle={locationTitle} venues={otherVenues} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function VenueStats({ venue }: { venue: CatalogVenue }) {
  const stats = [
    { icon: Ruler, label: "Total Area", value: venue.totalArea },
    { icon: Building2, label: "Halls / Spaces", value: venue.halls },
    { icon: Users, label: "Capacity", value: venue.capacity },
    { icon: Calendar, label: "Established", value: venue.established },
  ];
  return <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{stats.map((stat) => <div key={stat.label} className="rounded-2xl border border-gray-100 bg-white p-5 text-center transition-colors hover:border-[#f97316]"><stat.icon size={20} className="mx-auto mb-2 text-[#f97316]" /><p className="text-lg font-bold text-gray-900">{stat.value || "-"}</p><p className="mt-0.5 text-xs text-gray-500">{stat.label}</p></div>)}</div>;
}

function InfoBlock({ title, text, address }: { title: string; text: string; address: string }) {
  return <section className="rounded-2xl border border-gray-100 bg-white p-7"><h2 className="mb-4 text-xl font-bold text-gray-900">{title}</h2><p className="leading-relaxed text-gray-600">{text}</p><div className="mt-5 flex items-start gap-2 text-sm text-gray-500"><MapPin size={16} className="mt-0.5 flex-shrink-0 text-[#f97316]" /><span>{address}</span></div></section>;
}

function Specialities({ specialities }: { specialities: string[] }) {
  return <section className="rounded-2xl border border-gray-100 bg-white p-7"><h2 className="mb-4 text-xl font-bold text-gray-900">Known For</h2><div className="flex flex-wrap gap-2">{specialities.map((item) => <span key={item} className="rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-sm font-medium text-[#f97316]">{item}</span>)}</div></section>;
}

function ServicesBlock({ services, serviceHref }: { services: CatalogService[]; serviceHref: string }) {
  return <section className="rounded-2xl border border-gray-100 bg-white p-7"><h2 className="mb-5 text-xl font-bold text-gray-900">HOI Services Available Here</h2><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{services.map((service) => <Link key={service.id} href={serviceHref} className="group flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3 transition-all hover:border-[#f97316] hover:bg-orange-50"><div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-orange-50 transition-colors group-hover:bg-[#f97316]"><ArrowRight size={14} className="text-[#f97316] transition-colors group-hover:text-white" /></div><div><p className="text-sm font-semibold text-gray-800 group-hover:text-[#f97316]">{service.label}</p><p className="text-xs text-gray-400">{service.packages.length} packages</p></div></Link>)}</div><div className="mt-5"><Link href={serviceHref} className="inline-flex items-center gap-2 rounded-lg bg-[#f97316] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#ea580c]">View All Services & Packages <ArrowRight size={14} /></Link></div></section>;
}

function OtherVenues({ locationTitle, venues }: { locationTitle: string; venues: CatalogVenue[] }) {
  if (!venues.length) return null;
  return <div className="mt-5 border-t border-gray-100 pt-4"><p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Other Venues in {locationTitle}</p><div className="space-y-1.5">{venues.map((venue) => <Link key={venue.id} href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="block py-1 text-sm text-gray-600 transition-colors hover:text-[#f97316]">{venue.name.split(",")[0]}</Link>)}</div></div>;
}

function CenteredMessage({ title, detail }: { title: string; detail?: string }) {
  return <div className="flex min-h-screen items-center justify-center bg-[#f5efe4]"><div className="text-center"><h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>{detail && <p className="mb-4 text-gray-500">{detail}</p>}<Link href="/service" className="font-medium text-[#f97316] hover:underline">Back to Booking</Link></div></div>;
}
