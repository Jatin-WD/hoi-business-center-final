import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Building2, Calendar, ChevronRight, Globe, MapPin, Ruler, Users } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { loadCatalog, normalizeVenue, type CatalogService, type CatalogVenue } from "@/lib/catalog";

interface Props {
  params?: { locationId?: string; subVenueId?: string };
}

export default function VenueDetailPage({ params }: Props) {
  const locationId = params?.locationId ?? "";
  const subVenueId = params?.subVenueId ?? "";
  const [venue, setVenue] = useState<CatalogVenue | null>(null);
  const [otherVenues, setOtherVenues] = useState<CatalogVenue[]>([]);
  const [services, setServices] = useState<CatalogService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const serviceHref = `/service/${locationId}/${subVenueId}`;
  const locationTitle = useMemo(() => venue?.city || venue?.state || locationId, [venue, locationId]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] text-white py-16 px-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center gap-2 text-blue-200 text-sm mb-4 flex-wrap">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link href="/service" className="hover:text-white">Service</Link>
            <ChevronRight size={14} />
            <Link href={`/service/${locationId}/${subVenueId}`} className="hover:text-white">{locationTitle}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{venue.name.split(",")[0]}</span>
          </div>
          <div className="flex items-center gap-2 text-yellow-300 text-sm font-semibold uppercase tracking-wider mb-3">
            <MapPin size={14} />
            <span>{venue.city}, {venue.state}</span>
          </div>
          <h1 className="text-4xl font-bold mb-3">{venue.name}</h1>
          <p className="text-blue-200 max-w-2xl text-lg">{venue.description}</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={serviceHref} className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-yellow-300 transition-colors">
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
              <h3 className="text-lg font-bold text-gray-900 mb-2">Book HOI Services Here</h3>
              <p className="text-sm text-gray-500 mb-5">Contact our team to plan your exhibition at {venue.name.split(",")[0]}.</p>
              <Link href={serviceHref} className="block w-full text-center bg-[#1a3a8f] text-white py-3 rounded-xl font-semibold hover:bg-[#152e75] transition-colors mb-3 text-sm">View Services</Link>
              <Link href="/contact" className="block w-full text-center border border-[#1a3a8f] text-[#1a3a8f] py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors text-sm">Contact Us</Link>
              {venue.website && <a href={venue.website} target="_blank" rel="noopener noreferrer" className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[#1a3a8f] transition-colors"><Globe size={14} />Official Website</a>}
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
  return <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{stats.map((stat) => <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-[#1a3a8f] transition-colors"><stat.icon size={20} className="text-[#1a3a8f] mx-auto mb-2" /><p className="text-lg font-bold text-gray-900">{stat.value || "-"}</p><p className="text-xs text-gray-500 mt-0.5">{stat.label}</p></div>)}</div>;
}

function InfoBlock({ title, text, address }: { title: string; text: string; address: string }) {
  return <section className="bg-white rounded-2xl border border-gray-100 p-7"><h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2><p className="text-gray-600 leading-relaxed">{text}</p><div className="mt-5 flex items-start gap-2 text-sm text-gray-500"><MapPin size={16} className="text-[#1a3a8f] mt-0.5 flex-shrink-0" /><span>{address}</span></div></section>;
}

function Specialities({ specialities }: { specialities: string[] }) {
  return <section className="bg-white rounded-2xl border border-gray-100 p-7"><h2 className="text-xl font-bold text-gray-900 mb-4">Known For</h2><div className="flex flex-wrap gap-2">{specialities.map((item) => <span key={item} className="px-4 py-2 bg-blue-50 text-[#1a3a8f] rounded-full text-sm font-medium border border-blue-100">{item}</span>)}</div></section>;
}

function ServicesBlock({ services, serviceHref }: { services: CatalogService[]; serviceHref: string }) {
  return <section className="bg-white rounded-2xl border border-gray-100 p-7"><h2 className="text-xl font-bold text-gray-900 mb-5">HOI Services Available Here</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{services.map((service) => <Link key={service.id} href={serviceHref} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-gray-100 hover:border-[#1a3a8f] hover:bg-blue-50 transition-all group"><div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a3a8f] transition-colors"><ArrowRight size={14} className="text-[#1a3a8f] group-hover:text-white transition-colors" /></div><div><p className="text-sm font-semibold text-gray-800 group-hover:text-[#1a3a8f]">{service.label}</p><p className="text-xs text-gray-400">{service.packages.length} packages</p></div></Link>)}</div><div className="mt-5"><Link href={serviceHref} className="inline-flex items-center gap-2 bg-[#1a3a8f] text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#152e75] transition-colors">View All Services & Packages <ArrowRight size={14} /></Link></div></section>;
}

function OtherVenues({ locationTitle, venues }: { locationTitle: string; venues: CatalogVenue[] }) {
  if (!venues.length) return null;
  return <div className="mt-5 pt-4 border-t border-gray-100"><p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Other Venues in {locationTitle}</p><div className="space-y-1.5">{venues.map((venue) => <Link key={venue.id} href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="block text-sm text-gray-600 hover:text-[#1a3a8f] transition-colors py-1">{venue.name.split(",")[0]}</Link>)}</div></div>;
}

function CenteredMessage({ title, detail }: { title: string; detail?: string }) {
  return <div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-center"><h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>{detail && <p className="text-gray-500 mb-4">{detail}</p>}<Link href="/service" className="text-[#1a3a8f] font-medium hover:underline">Back to Services</Link></div></div>;
}
