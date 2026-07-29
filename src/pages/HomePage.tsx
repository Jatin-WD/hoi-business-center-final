import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, MapPin, ShieldCheck, Sparkles, Users } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService, type CatalogVenue } from "@/lib/catalog";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function HomePage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
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

  const canonicalServices = services.slice(0, 6).map((service) => ({ ...service, label: translateServiceLabel(service.id, language) }));
  const processSteps = [
    { title: t("home.process.selectService", "Select service"), body: t("home.process.selectServiceBody", "Open the service catalog and choose the required service card.") },
    { title: t("home.process.review", "Review detail page"), body: t("home.process.reviewBody", "Read the service description, package links, and Yashobhoomi context.") },
    { title: t("home.process.start", "Start booking"), body: t("home.process.startBody", "Move into the booking flow to confirm scope and requirements.") },
    { title: t("home.process.coordinate", "Coordinate execution"), body: t("home.process.coordinateBody", "HOI team manages delivery, support, and on-ground coordination.") },
  ];

  return (
    <div className="min-h-screen bg-[#f4ede2] text-[#111111]">
      <section className="border-b border-black/5 bg-[#0f0f0f] text-white">
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

      <section className="relative overflow-hidden border-b border-black/5 bg-[#efe4d1]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(17,17,17,0.06),transparent_38%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.45),transparent_25%)]" />
        <div className="relative mx-auto grid max-w-[1600px] gap-10 px-6 py-14 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-[#111111]/10 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-[#8b4d22] shadow-[0_10px_25px_rgba(17,17,17,0.06)]">
              <Sparkles size={14} />
              {cms("home.hero.badge")}
            </p>
            <h1 className="mt-5 max-w-2xl text-4xl font-black leading-tight tracking-tight text-[#111111] sm:text-5xl lg:text-6xl">
              {cms("home.hero.title")}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#5b5448] sm:text-lg">
              {cms("home.hero.description")}
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-[#111111] px-6 py-3.5 text-sm font-bold text-white shadow-[0_18px_35px_rgba(17,17,17,0.15)] transition-colors hover:bg-[#2a2018]">
                {t("common.browseServices", "Browse Services")}
                <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl border border-[#111111]/12 bg-white px-6 py-3.5 text-sm font-bold text-[#111111] shadow-[0_10px_25px_rgba(17,17,17,0.05)] transition-colors hover:bg-[#faf8f2]">
                {t("common.contactTeam", "Contact Team")}
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_24px_70px_rgba(17,17,17,0.12)]">
            <div className="relative min-h-[440px]">
              <img
                src="/assets/yashobhoomi.png"
                alt="Yashobhoomi exhibition venue"
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,11,11,0.18)_0%,rgba(11,11,11,0.46)_52%,rgba(11,11,11,0.88)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(17,17,17,0.05)_0%,rgba(17,17,17,0.00)_40%,rgba(249,115,22,0.22)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-52 bg-gradient-to-t from-[#111111]/88 via-[#111111]/35 to-transparent" />
              <div className="absolute inset-0 p-6 text-white">
                <div className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                  {t("nav.yashobhoomi", "Yashobhoomi")}
                </div>
                <div className="mt-auto flex h-full flex-col justify-end">
                  <div className="max-w-md rounded-[1.75rem] border border-white/14 bg-[linear-gradient(135deg,rgba(17,17,17,0.82),rgba(17,17,17,0.56),rgba(249,115,22,0.30))] p-5 shadow-[0_16px_40px_rgba(17,17,17,0.24)] backdrop-blur-xl">
                    <div className="mb-3 h-1.5 w-24 rounded-full bg-[linear-gradient(90deg,#f97316,rgba(255,255,255,0.1))]" />
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/72">{t("common.venueFocus", "Venue focus")}</p>
                    <h2 className="mt-2 text-2xl font-black leading-tight">{t("home.hero.focusTitle", "Official exhibition venue for every public service flow")}</h2>
                    <p className="mt-3 text-sm leading-6 text-white/82">
                      {t("home.hero.focusDesc", "The homepage stays centered on one venue so users do not have to decode multiple locations or mixed service models.")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-black/5 bg-[#f4ede2]">
        <div className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard icon={CalendarDays} label={t("home.metric.events", "Events managed")} value="500+" />
            <MetricCard icon={Users} label={t("home.metric.booths", "Booths delivered")} value="1,200+" />
            <MetricCard icon={MapPin} label={t("home.metric.venue", "Venue model")} value={t("nav.yashobhoomi", "Yashobhoomi")} />
            <MetricCard icon={ShieldCheck} label={t("home.metric.services", "Service model")} value={t("home.metric.six", "6 services")} />
          </div>
        </div>
      </section>

      <section className="bg-[#111111] py-14 text-white lg:py-18">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
          <SectionHeading
            eyebrow={t("nav.services", "Services")}
            title={cms("home.services.title")}
            description={cms("home.services.description")}
            align="left"
            tone="light"
          />
          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {canonicalServices.map((service, index) => (
              <Link
                key={service.id}
                href={`/services/${service.id}`}
                className="group rounded-[1.75rem] border border-white/10 bg-gradient-to-br from-[#171717] via-[#202020] to-[#111111] p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.28)] transition-all hover:-translate-y-0.5 hover:border-[#f97316]/30 hover:shadow-[0_24px_70px_rgba(0,0,0,0.38)]"
              >
                <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#111111] shadow-sm">
                      <span className="text-sm font-black">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
                    {t("common.bookingReady", "Booking ready")}
                  </span>
                </div>

                <h3 className="mt-5 text-2xl font-black text-white transition-colors group-hover:text-[#ffb37a]">
                  {service.label}
                </h3>
                <p className="mt-3 line-clamp-3 text-sm leading-7 text-white/72">
                  {service.description || "Official service description available on the detail page."}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-bold text-[#ff9d5c]">
                  {t("common.openServiceDetail", "Open service detail")}
                  <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4ede2] py-14 lg:py-18">
        <div className="mx-auto grid max-w-[1600px] gap-6 px-6 sm:px-8 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] lg:p-8">
            <SectionHeading
              eyebrow={t("nav.yashobhoomi", "Venue")}
              title={cms("home.locations.title")}
              description={cms("home.locations.description")}
              align="left"
            />
            <div className="mt-6 space-y-4">
              <p className="text-base leading-8 text-slate-700">
                {yashobhoomi.about || yashobhoomi.description}
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Fact label={t("home.fact.location", "Location")} value={`${yashobhoomi.city}, ${yashobhoomi.state}`} />
                <Fact label={t("home.fact.scale", "Scale")} value={yashobhoomi.totalArea || t("home.fact.major", "Major exhibition venue")} />
                <Fact label={t("home.fact.facilities", "Facilities")} value={yashobhoomi.halls || t("home.fact.halls", "Convention and expo halls")} />
                <Fact label={t("home.fact.established", "Established")} value={yashobhoomi.established || "2023"} />
              </div>
            </div>
          </div>

          <Link href={`/venue/${yashobhoomi.locationId}/${yashobhoomi.subVenueId}`} className="group relative min-h-[360px] overflow-hidden rounded-[2rem] border border-black/5 bg-[#111111] shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
            <img
              src={yashobhoomi.image || "/assets/yashobhoomi.png"}
              alt={yashobhoomi.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.06)_0%,rgba(17,17,17,0.28)_34%,rgba(17,17,17,0.82)_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(17,17,17,0.08)_0%,rgba(17,17,17,0.00)_42%,rgba(249,115,22,0.22)_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#111111]/90 via-[#111111]/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-7 text-white lg:p-8">
              <span className="inline-flex w-fit rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-white/75 backdrop-blur-sm">
                {t("common.officialVenueSpotlight", "Official venue spotlight")}
              </span>
              <h3 className="mt-4 max-w-xl text-3xl font-black leading-tight">{yashobhoomi.name}</h3>
              <p className="mt-3 max-w-lg text-sm leading-7 text-white/86">
                {yashobhoomi.description}
              </p>
            </div>
          </Link>
        </div>
      </section>

      <section className="bg-[#f8f3ea] py-14 lg:py-18">
        <div className="mx-auto max-w-[1600px] px-6 sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="rounded-[2rem] border border-black/5 bg-[#111111] p-7 text-white shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
              <SectionHeading
              eyebrow={t("common.howItWorks", "How it works")}
              title={t("home.process.title", "Simple booking sequence")}
              description={t("common.howItWorksDesc", "The homepage now guides users in a straight line from service discovery to booking.")}
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

            <div className="rounded-[2rem] border border-black/5 bg-white p-7 shadow-[0_18px_50px_rgba(17,17,17,0.05)] lg:p-8">
              <SectionHeading
              eyebrow={t("common.whyHoi", "Why HOI")}
                title={cms("home.why.title")}
                description={cms("home.why.description")}
                align="left"
              />
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  t("home.why.item1", "Official venue-first presentation"),
                  t("home.why.item2", "Only six canonical services on public site"),
                  t("home.why.item3", "Separate manpower application flow"),
                  t("home.why.item4", "CMS-backed copy for easy updates"),
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-black/5 bg-white p-4">
                    <CheckCircle2 size={18} className="mt-0.5 text-[#f97316]" />
                    <span className="text-sm leading-6 text-slate-700">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-black/5 bg-white p-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6b4b2d]">{t("common.note", "Note")}</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {t("home.note.body", "This homepage keeps the public information model strict and simple, which makes it easier for users to understand what HOI offers and where each path leads.")}
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
                {t("common.readyToMoveForward", "Ready to move forward")}
              </p>
              <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">{cms("home.cta.title")}</h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">{cms("home.cta.description")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                {t("nav.contactUs", "Contact Us")}
                <ArrowRight size={16} />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-white/10">
                {t("common.browseServices", "Browse Services")}
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
