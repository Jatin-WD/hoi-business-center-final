import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Calendar, CheckCircle, MapPin, Users } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService, type CatalogVenue } from "@/lib/catalog";

const stats = [
  { value: "500+", label: "Events Managed", icon: Calendar },
  { value: "1,200+", label: "Booths Delivered", icon: Award },
  { value: "50+", label: "Cities Covered", icon: MapPin },
  { value: "3,000+", label: "Happy Clients", icon: Users },
];

const features = [
  "Official partner at Yashobhoomi, Dwarka, New Delhi",
  "Complete booth lifecycle management from design to demolition",
  "Experienced interpretation and protocol teams",
  "Dedicated marketing support for maximum visibility",
  "Transparent, tiered pricing for all budgets",
  "One-stop solution: no need to coordinate multiple vendors",
];

export default function HomePage() {
  const [services, setServices] = useState<CatalogService[]>([]);
  const [venues, setVenues] = useState<CatalogVenue[]>([]);
  const cms = useCmsContent({
    "home.hero.badge": "India's Premier Exhibition & Business Center Service",
    "home.hero.title": "Your Complete Exhibition Partner at HOI Business Center",
    "home.hero.description": "From booth reservation to design, installation, logistics, marketing, and manpower services - we handle every aspect of your exhibition journey.",
    "home.services.title": "Our Services",
    "home.services.description": "Comprehensive exhibition solutions designed to make your presence unforgettable.",
    "home.locations.title": "Where We Operate",
    "home.locations.description": "Admin-managed venues loaded from the database.",
    "home.why.title": "Why Choose KIL - HOI Business Center?",
    "home.why.description": "Our end-to-end services ensure your exhibition is seamless, professional, and impactful.",
    "home.cta.title": "Ready to Elevate Your Exhibition Presence?",
    "home.cta.description": "Contact our team today and let us create an unforgettable exhibition experience for your brand.",
  });

  const locations = useMemo(() => venues.slice(0, 3), [venues]);
  const heroImage = "/assets/yashobhoomi.png";

  useEffect(() => {
    let mounted = true;
    loadCatalog().then((data) => {
      if (!mounted) return;
      setServices(data.services);
      setVenues(data.venues);
    }).catch(() => {
      if (!mounted) return;
      setServices([]);
      setVenues([]);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden bg-[#0f2460] text-white">
        <img src={heroImage} alt="Yashobhoomi exhibition venue" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2460]/95 via-[#1a3a8f]/75 to-[#0f2460]/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f2460]/70 to-transparent" />
        <div className="relative max-w-[1600px] mx-auto px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-sm mb-6">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />{cms("home.hero.badge")}
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">{cms("home.hero.title")}</h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed">{cms("home.hero.description")}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/service" className="inline-flex items-center gap-2 bg-yellow-400 text-gray-900 font-bold px-6 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors text-base">Explore Services <ArrowRight size={18} /></Link>
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/20 transition-colors text-base">Get a Quote</Link>
            </div>
          </div>
        </div>
      </section>
      <StatsSection />
      <ServicesSection title={cms("home.services.title")} description={cms("home.services.description")} services={services} />
      <LocationsSection title={cms("home.locations.title")} description={cms("home.locations.description")} venues={locations} />
      <WhySection title={cms("home.why.title")} description={cms("home.why.description")} />
      <section className="relative overflow-hidden bg-[#0f2460] py-16">
        <img src="/assets/hall.jpg" alt="Exhibition hall" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-[#0f2460]/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f2460]/95 via-[#1a3a8f]/70 to-[#0f2460]/70" />
        <div className="relative max-w-[1600px] mx-auto px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">{cms("home.cta.title")}</h2>
          <p className="text-blue-200 mb-8 max-w-xl mx-auto">{cms("home.cta.description")}</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="bg-yellow-400 text-gray-900 font-bold px-8 py-3.5 rounded-xl hover:bg-yellow-300 transition-colors">Contact Us Now</Link>
            <Link href="/service" className="bg-white/10 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-colors">View All Services</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatsSection() {
  return <section className="bg-white border-b border-gray-100"><div className="max-w-[1600px] mx-auto px-8 py-10"><div className="grid grid-cols-2 lg:grid-cols-4 gap-8">{stats.map((stat) => <div key={stat.label} className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0"><stat.icon size={22} className="text-[#1a3a8f]" /></div><div><p className="text-2xl font-bold text-gray-900">{stat.value}</p><p className="text-sm text-gray-500">{stat.label}</p></div></div>)}</div></div></section>;
}

function ServicesSection({ title, description, services }: { title: string; description: string; services: CatalogService[] }) {
  return <section className="bg-gray-50 py-16 lg:py-20"><div className="max-w-[1600px] mx-auto px-8"><SectionTitle title={title} description={description} /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">{services.map((service) => <Link key={service.id} href={service.packages[0]?.href ?? "/service"} className="group bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#1a3a8f] hover:shadow-lg transition-all duration-200"><h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#1a3a8f] transition-colors">{service.label}</h3><p className="text-sm text-gray-500 leading-relaxed mb-4">{service.packages.length} packages available</p><div className="flex items-center gap-1 text-[#1a3a8f] text-sm font-medium">Learn more <ArrowRight size={14} /></div></Link>)}</div></div></section>;
}

function LocationsSection({ title, description, venues }: { title: string; description: string; venues: CatalogVenue[] }) {
  return <section className="bg-white py-16 lg:py-20"><div className="max-w-[1600px] mx-auto px-8"><SectionTitle title={title} description={description} /><div className="grid grid-cols-1 md:grid-cols-3 gap-6">{venues.map((venue) => <Link key={venue.id} href={`/venue/${venue.locationId}/${venue.subVenueId}`} className="relative rounded-2xl overflow-hidden group block" style={{ height: "280px" }}><img src={venue.image} alt={venue.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-6"><h3 className="text-white font-bold text-xl mb-1">{venue.name}</h3><p className="text-white/70 text-sm">{venue.city}, {venue.state}</p></div></Link>)}</div></div></section>;
}

function WhySection({ title, description }: { title: string; description: string }) {
  return <section className="bg-gray-50 py-16 lg:py-20"><div className="max-w-[1600px] mx-auto px-8"><div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center"><div><h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">{title}</h2><p className="text-gray-500 mb-8 leading-relaxed">{description}</p><div className="space-y-4">{features.map((point) => <div key={point} className="flex items-start gap-3"><CheckCircle size={20} className="text-[#1a3a8f] flex-shrink-0 mt-0.5" /><span className="text-gray-700 text-sm">{point}</span></div>)}</div></div><div className="bg-[#1a3a8f] rounded-2xl p-8 text-white"><h3 className="text-xl font-bold mb-6">Process Flow</h3><p className="text-blue-100">Choose service, select location, pick package, confirm booking, and our team handles execution.</p></div></div></div></section>;
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return <div className="text-center mb-12"><h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">{title}</h2><p className="text-gray-500 max-w-xl mx-auto">{description}</p></div>;
}
