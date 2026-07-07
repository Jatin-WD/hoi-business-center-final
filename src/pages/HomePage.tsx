import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, Award, Calendar, CheckCircle, MapPin, Users } from "lucide-react";
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

  const heroImage = "/assets/yashobhoomi.png";

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (!mounted) return;
        setServices(data.services);
        setVenues(data.venues);
      })
      .catch(() => {
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
      <section className="relative overflow-hidden bg-[#111111] text-white">
        <img src={heroImage} alt="Yashobhoomi exhibition venue" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#111111]/78 to-[#f97316]/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

        <div className="relative mx-auto max-w-[1600px] px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm backdrop-blur-sm">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#f97316]" />
              India's Premier Exhibition & Business Center Service
            </div>
            <h1 className="mb-6 text-4xl font-bold leading-tight lg:text-6xl">
              Your Complete Exhibition Partner at HOI Business Center
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-zinc-200">
              From booth reservation to design, installation, logistics, marketing, and manpower services - we handle every aspect of your exhibition journey.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/service" className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-[#ea580c]">
                Explore Services <ArrowRight size={18} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-white/15">
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </section>

      <StatsSection />
      <ServicesSection title="Our Services" description="Comprehensive exhibition solutions designed to make your presence unforgettable." services={services} />
      <LocationsSection title="Where We Operate" description="Yashobhoomi is our primary showcase venue and the place where HOI makes its strongest impact." venues={venues} />
      <WhySection title="Why Choose HOI Business Center?" description="Our end-to-end services ensure your exhibition is seamless, professional, and impactful." />

      <section className="relative overflow-hidden bg-[#111111] py-16">
        <img src="/assets/hall.jpg" alt="Exhibition hall" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-black/75" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-[#111111]/75 to-[#f97316]/40" />
        <div className="relative mx-auto max-w-[1600px] px-8 text-center">
          <h2 className="mb-4 text-3xl font-bold text-white lg:text-4xl">Ready to Elevate Your Exhibition Presence?</h2>
          <p className="mx-auto mb-8 max-w-xl text-zinc-200">
            Contact our team today and let us create an unforgettable exhibition experience for your brand.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="rounded-xl bg-[#f97316] px-8 py-3.5 font-bold text-white transition-colors hover:bg-[#ea580c]">
              Contact Us Now
            </Link>
            <Link href="/service" className="rounded-xl border border-white/20 bg-white/10 px-8 py-3.5 font-semibold text-white transition-colors hover:bg-white/15">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatsSection() {
  return (
    <section className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-[1600px] px-8 py-10">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gray-100">
                <stat.icon size={22} className="text-[#f97316]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesSection({ title, description, services }: { title: string; description: string; services: CatalogService[] }) {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1600px] px-8">
        <SectionTitle title={title} description={description} />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((service) => (
            <Link
              key={service.id}
              href={service.packages[0]?.href ?? `/service/${service.id}`}
              className="group rounded-2xl border border-gray-100 bg-white p-6 transition-all duration-200 hover:border-[#f97316] hover:shadow-lg"
            >
              <h3 className="mb-2 font-semibold text-gray-900 transition-colors group-hover:text-[#f97316]">{service.label}</h3>
              <p className="mb-3 line-clamp-3 text-sm leading-relaxed text-gray-500">
                {service.description || `${service.packages.length} package${service.packages.length === 1 ? "" : "s"} available`}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-[#f97316]">
                Learn more <ArrowRight size={14} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LocationsSection({ title, description, venues }: { title: string; description: string; venues: CatalogVenue[] }) {
  const spotlightImage = "/assets/yashobhoomi.png";
  const yashobhoomi =
    venues.find((venue) => venue.locationId === "yashobhoomi")
    ?? venues[0]
    ?? {
      locationId: "yashobhoomi",
      subVenueId: "iicc-dwarka",
      name: "Yashobhoomi, India International Convention and Expo Centre",
      city: "New Delhi",
      state: "Delhi",
      description: "HOI Business Center's primary exhibition location in Dwarka, New Delhi.",
      about: "Yashobhoomi is the official HOI showcase venue for large exhibitions, conferences, and brand activations.",
      totalArea: "India's largest MICE destination",
      halls: "Exhibition and convention halls",
      capacity: "Large-scale exhibitions and business events",
      established: "2023",
      image: "/assets/yashobhoomi.png",
    };

  return (
    <section className="bg-white py-16 lg:py-20">
      <div className="mx-auto max-w-[1600px] px-8">
        <SectionTitle title={title} description={description} />
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[2rem] border border-gray-200 bg-gradient-to-br from-white via-gray-50 to-white p-8 shadow-[0_20px_60px_rgba(0,0,0,0.06)] lg:p-10">
            <div className="inline-flex items-center rounded-full bg-gray-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#111111]">
              Official HOI Venue
            </div>
            <h3 className="mt-5 text-3xl font-bold text-gray-900 lg:text-4xl">{yashobhoomi.name}</h3>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
              {yashobhoomi.about || yashobhoomi.description}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <VenueMetric label="Location" value={`${yashobhoomi.city}, ${yashobhoomi.state}`} />
              <VenueMetric label="Scale" value={yashobhoomi.totalArea || "Large-scale venue"} />
              <VenueMetric label="Facilities" value={yashobhoomi.halls || "Convention-ready halls"} />
              <VenueMetric label="Since" value={yashobhoomi.established || "2023"} />
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {["Priority venue for HOI services", "Ideal for exhibitions & conventions", "End-to-end execution support"].map((point) => (
                <span key={point} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700">
                  {point}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/yashobhoomi" className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                Explore Yashobhoomi <ArrowRight size={16} />
              </Link>
              <Link href="/service" className="inline-flex items-center gap-2 rounded-xl border border-[#111111] px-6 py-3.5 text-sm font-bold text-[#111111] transition-colors hover:bg-gray-50">
                Browse Services
              </Link>
            </div>
          </div>

          <Link href={`/venue/${yashobhoomi.locationId}/${yashobhoomi.subVenueId}`} className="group relative block min-h-[420px] h-full overflow-hidden rounded-[2rem] shadow-[0_24px_70px_rgba(0,0,0,0.12)]">
            <img
              src={spotlightImage}
              alt={yashobhoomi.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              loading="eager"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/38 to-black/10" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/25 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-7 text-white lg:p-8">
              <div className="mb-4 inline-flex rounded-full bg-white/12 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-100 backdrop-blur-sm">
                Yashobhoomi Spotlight
              </div>
              <h4 className="text-2xl font-bold lg:text-3xl">{yashobhoomi.name}</h4>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-zinc-200/90 lg:text-base">
                {yashobhoomi.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-3 text-sm">
                {[
                  yashobhoomi.city && yashobhoomi.state ? `${yashobhoomi.city}, ${yashobhoomi.state}` : "New Delhi",
                  yashobhoomi.capacity || "Large-scale business events",
                ].map((item) => (
                  <span key={item} className="rounded-full bg-white/12 px-4 py-2 backdrop-blur-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}

function WhySection({ title, description }: { title: string; description: string }) {
  return (
    <section className="bg-gray-50 py-16 lg:py-20">
      <div className="mx-auto max-w-[1600px] px-8">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900 lg:text-4xl">{title}</h2>
            <p className="mb-8 leading-relaxed text-gray-500">{description}</p>
            <div className="space-y-4">
              {features.map((point) => (
                <div key={point} className="flex items-start gap-3">
                  <CheckCircle size={20} className="mt-0.5 flex-shrink-0 text-[#f97316]" />
                  <span className="text-sm text-gray-700">{point}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl bg-[#111111] p-8 text-white">
            <h3 className="mb-6 text-xl font-bold">Process Flow</h3>
            <p className="text-zinc-200">
              Choose service, select location, pick package, confirm booking, and our team handles execution.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-12 text-center">
      <h2 className="mb-4 text-3xl font-bold text-gray-900 lg:text-4xl">{title}</h2>
      <p className="mx-auto max-w-xl text-gray-500">{description}</p>
    </div>
  );
}

function VenueMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-bold leading-snug text-gray-900">{value}</p>
    </div>
  );
}
