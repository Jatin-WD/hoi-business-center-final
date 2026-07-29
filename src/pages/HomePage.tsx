import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, BadgeInfo, CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService, type CatalogVenue } from "@/lib/catalog";

const publicNotices = [
  "Public information portal for HOI Business Center at Yashobhoomi",
  "Six canonical services only: booth reservation, booth design, booth install & demolition, logistics, marketing, and interpretation & protocol",
  "Manpower remains a separate application flow, not a core service card",
];

const processSteps = [
  { title: "Select service", body: "Open the service catalog and choose the required service card." },
  { title: "Review detail page", body: "Read the service description, package links, and Yashobhoomi context." },
  { title: "Start booking", body: "Move into the booking flow to confirm scope and requirements." },
  { title: "Coordinate execution", body: "HOI team manages delivery, support, and on-ground coordination." },
];

export default function HomePage() {
  const cms = useCmsContent({
    "home.hero.badge": "Public information portal",
    "home.hero.title": "HOI Business Center at Yashobhoomi",
    "home.hero.description": "A clear, official-style homepage for exhibition services at Yashobhoomi. Browse the six services, review the venue context, and move into booking when ready.",
    "home.services.title": "Six Canonical Services",
    "home.services.description": "The public site uses one simple model: Yashobhoomi as the venue, and only these six service paths.",
    "home.locations.title": "Yashobhoomi spotlight",
    "home.locations.description": "Venue-led presentation with factual details and a clean image-first layout.",
    "home.why.title": "Why HOI Business Center",
    "home.why.description": "An official, structured service experience built to reduce confusion and keep the content focused.",
    "home.cta.title": "Need a service requirement reviewed?",
    "home.cta.description": "Use the booking flow or contact the team for a direct response. The workflow stays simple and tied to Yashobhoomi.",
  });

  const [services, setServices] = useState<CatalogService[]>([]);
  const [venues, setVenues] = useState<CatalogVenue[]>([]);

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

  const yashobhoomi =
    useMemo(() => venues.find((venue) => venue.locationId === "yashobhoomi") ?? venues[0] ?? null, [venues]) ??
    ({
      locationId: "yashobhoomi",
      subVenueId: "iicc-dwarka",
      name: "Yashobhoomi, India International Convention and Expo Centre",
      city: "New Delhi",
      state: "Delhi",
      description: "HOI Business Center's primary exhibition venue.",
      about: "Yashobhoomi is the official HOI showcase venue for exhibitions and convention-led services.",
      totalArea: "India's largest MICE destination",
      halls: "Exhibition and convention halls",
      capacity: "Large-scale business events",
      established: "2023",
      image: "/assets/yashobhoomi.png",
    } satisfies CatalogVenue);

  const canonicalServices = services.slice(0, 6);

  return (
    <div className="min-h-screen bg-[#f6f1e7] text-[#111111]">
      <section className="border-b border-black/5 bg-[#111111] text-white">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-3 px-6 py-3 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-semibold uppercase tracking-[0.18em] text-white/80">
              <ShieldCheck size={14} />
              Official information
            </span>
            <span className="text-white/70">HOI Business Center</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-white/70 sm:text-sm">
            <span>Yashobhoomi</span>
            <span className="opacity-50">|</span>
            <span>Dwarka, New Delhi</span>
            <span className="opacity-50">|</span>
            <a href="tel:+919810097323" className="hover:text-white">+91 98100 97323</a>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-black/5 bg-[#f3efe6]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,17,17,0.05),transparent_35%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_30%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-8 px-6 py-12 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-16">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#6b4b2d] shadow-sm">
              <Sparkles size={14} />
              {cms("home.hero.badge")}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              {cms("home.hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-slate-700 sm:text-lg">
              {cms("home.hero.description")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#2a2018]">
                Browse Services
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#111111]/15 bg-white px-6 py-3.5 text-sm font-bold text-[#111111] transition-colors hover:bg-[#faf8f2]">
                Contact Team
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_70px_rgba(17,17,17,0.08)]">
            <div className="relative min-h-[440px]">
              <img
                src="/assets/yashobhoomi.png"
                alt="Yashobhoomi exhibition venue"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/28 to-black/5" />
              <div className="absolute inset-0 p-6 text-white">
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
                  Yashobhoomi
                </div>
                <div className="mt-auto flex h-full flex-col justify-end">
                  <div className="max-w-md rounded-[1.5rem] border border-white/15 bg-black/35 p-5 backdrop-blur-md">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Venue focus</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">Official exhibition venue for every public service flow</h2>
                    <p className="mt-3 text-sm leading-6 text-white/80">
                      The homepage stays centered on one venue so users do not have to decode multiple locations or mixed service models.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-white">
        <div className="mx-auto max-w-[1600px] px-6 py-5 sm:px-8">
          <div className="grid gap-3 lg:grid-cols-3">
            {publicNotices.map((notice) => (
              <div key={notice} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-[#f8f5ee] px-4 py-3.5">
                <BadgeInfo size={16} className="mt-0.5 flex-shrink-0 text-[#f97316]" />
                <p className="text-sm leading-6 text-slate-700">{notice}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-[#f6f1e7]">
        <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={CalendarDays} label="Events managed" value="500+" />
            <MetricCard icon={Users} label="Booths delivered" value="1,200+" />
            <MetricCard icon={MapPin} label="Venue model" value="Yashobhoomi" />
            <MetricCard icon={ShieldCheck} label="Service model" value="6 services" />
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-18">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
          <SectionHeading
            eyebrow="Services"
            title={cms("home.services.title")}
            description={cms("home.services.description")}
            align="left"
          />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {canonicalServices.map((service, index) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group rounded-[1.75rem] border border-black/5 bg-[#fcfaf5] p-6 shadow-[0_14px_40px_rgba(17,17,17,0.04)] transition-all hover:-translate-y-0.5 hover:border-[#f97316]/35 hover:shadow-[0_18px_50px_rgba(17,17,17,0.08)]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111111] text-white">
                    <span className="text-sm font-black">{String(index + 1).padStart(2, "0")}</span>
                  </div>
                  <span className="rounded-full border border-[#f97316]/15 bg-[#fff2e8] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#9a4a12]">
                    Booking ready
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black text-[#111111] transition-colors group-hover:text-[#f97316]">
                  {service.label}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-slate-600">
                  {service.description || "Official service description available on the detail page."}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#f97316]">
                  Open service detail
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f6f1e7] py-14 lg:py-18">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 sm:px-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] lg:p-8">
            <SectionHeading
              eyebrow="Venue"
              title={cms("home.locations.title")}
              description={cms("home.locations.description")}
              align="left"
            />
            <div className="mt-6 space-y-4">
              <p className="text-base leading-8 text-slate-700">
                {yashobhoomi.about || yashobhoomi.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact label="Location" value={`${yashobhoomi.city}, ${yashobhoomi.state}`} />
                <Fact label="Scale" value={yashobhoomi.totalArea || "Major exhibition venue"} />
                <Fact label="Facilities" value={yashobhoomi.halls || "Convention and expo halls"} />
                <Fact label="Established" value={yashobhoomi.established || "2023"} />
              </div>
            </div>
          </div>

          <Link href={`/venue/${yashobhoomi.locationId}/${yashobhoomi.subVenueId}`} className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/5 bg-[#111111] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
            <img
              src={yashobhoomi.image || "/assets/yashobhoomi.png"}
              alt={yashobhoomi.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/84 via-black/30 to-black/10" />
            <div className="absolute inset-0 flex flex-col justify-end p-7 text-white lg:p-8">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">
                Official venue spotlight
              </span>
              <h3 className="mt-4 max-w-xl text-3xl font-black leading-tight">{yashobhoomi.name}</h3>
              <p className="mt-3 max-w-xl text-sm leading-7 text-white/82">
                {yashobhoomi.description}
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-18">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-black/5 bg-[#111111] p-7 text-white shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
              <SectionHeading
                eyebrow="How it works"
                title="Simple booking sequence"
                description="The homepage now guides users in a straight line from service discovery to booking."
                align="left"
                tone="light"
              />
              <div className="mt-6 space-y-4">
                {processSteps.map((step, index) => (
                  <div key={step.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-white/75">{step.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-black/5 bg-[#f6f1e7] p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] lg:p-8">
              <SectionHeading
                eyebrow="Why HOI"
                title={cms("home.why.title")}
                description={cms("home.why.description")}
                align="left"
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  "Official venue-first presentation",
                  "Only six canonical services on public site",
                  "Separate manpower application flow",
                  "CMS-backed copy for easy updates",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
                    <CheckCircle2 size={18} className="mt-0.5 text-[#f97316]" />
                    <span className="text-sm leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-black/5 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b4b2d]">Note</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  This homepage keeps the public information model strict and simple, which makes it easier for users to understand what HOI offers and where each path leads.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/5 bg-[#111111] py-16 text-white">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">
                <Clock3 size={14} />
                Ready to move forward
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{cms("home.cta.title")}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">{cms("home.cta.description")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                Contact Us
                <ArrowRight size={16} />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                Browse Services
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: typeof CalendarDays; label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-black/5 bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)]">
      <div className="flex items-center gap-2 text-[#f97316]">
        <Icon size={16} />
        <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <p className="mt-3 text-3xl font-black text-[#111111]">{value}</p>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.35rem] border border-black/5 bg-[#faf8f2] p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{value}</p>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "dark",
}: {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}) {
  const textTone = tone === "light" ? "text-white/78" : "text-slate-600";
  const headingTone = tone === "light" ? "text-white" : "text-[#111111]";

  return (
    <div className={align === "left" ? "max-w-3xl" : "mx-auto max-w-3xl text-center"}>
      <p className={`text-xs font-bold uppercase tracking-[0.24em] ${tone === "light" ? "text-white/65" : "text-[#6b4b2d]"}`}>
        {eyebrow}
      </p>
      <h2 className={`mt-3 text-3xl font-black tracking-tight sm:text-4xl ${headingTone}`}>{title}</h2>
      <p className={`mt-3 text-base leading-8 ${textTone}`}>{description}</p>
    </div>
  );
}
