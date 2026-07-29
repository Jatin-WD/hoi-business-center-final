import { type ReactNode } from "react";
import { ArrowRight, ChevronRight, Building2, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

export default function AboutPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "about.badge": "About HOI",
    "about.hero.title": "About HOI Business Center",
    "about.hero.description": "Your trusted exhibition service partner for booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol.",
    "about.whoTitle": "Built around Yashobhoomi and the full exhibition journey.",
    "about.body1": "HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi.",
    "about.body2": "Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care.",
    "about.body3": "Everything we present on the public site is centered on Yashobhoomi and the six canonical HOI services, so the experience stays simple and consistent.",
    "about.ourApproach": "Our approach",
    "about.approachTitle": "We combine venue understanding, execution discipline, and client-first planning.",
    "about.approachBody": "The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.",
    "about.coreValues": "Our Core Values",
    "about.coreValuesTitle": "What we stand for",
    "about.value.excellence": "Excellence",
    "about.value.excellenceDesc": "We deliver the highest standards in every service.",
    "about.value.reliability": "Reliability",
    "about.value.reliabilityDesc": "Your timeline is our commitment. We never miss a deadline.",
    "about.value.innovation": "Innovation",
    "about.value.innovationDesc": "Creative booth designs and marketing strategies that stand out.",
    "about.value.partnership": "Partnership",
    "about.value.partnershipDesc": "We treat every client as a long-term partner, not a transaction.",
    "about.servicesOverview": "Our Services Overview",
    "about.currentServices": "Current services, arranged like a premium venue section",
  });
  const coreValues = [
    { title: cms("about.value.excellence"), desc: cms("about.value.excellenceDesc") },
    { title: cms("about.value.reliability"), desc: cms("about.value.reliabilityDesc") },
    { title: cms("about.value.innovation"), desc: cms("about.value.innovationDesc") },
    { title: cms("about.value.partnership"), desc: cms("about.value.partnershipDesc") },
  ];

  const serviceHighlights = [
    t("service.booth-reservation", "Booth Reservation"),
    t("service.booth-design", "Booth Design"),
    t("service.booth-install-demolition", "Booth Install & Demolition"),
    t("service.logistics", "Logistics Services"),
    t("service.marketing", "Marketing Services"),
    t("service.interpretation-protocol", "Interpretation & Protocol"),
  ];

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #111111 0%, #1f2937 58%, var(--hoi-primary) 100%)",
        }}
      >
        <img
          src="/assets/yashobhoomi.png"
          alt="Yashobhoomi exhibition venue"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 18% 22%, white 0, transparent 22%), radial-gradient(circle at 80% 24%, white 0, transparent 16%), radial-gradient(circle at 50% 74%, white 0, transparent 20%)" }} />

        <div className="relative mx-auto max-w-[1600px] px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
          <div className="flex items-center gap-2 text-white/70 text-sm">
            <Link href="/" className="transition-colors hover:text-white">{t("nav.home", "Home")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t("nav.aboutUs", "About Us")}</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
                <Sparkles size={14} />
                {cms("about.badge")}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                {cms("about.hero.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                {cms("about.hero.description")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <StatCard icon={<Building2 size={16} />} label={t("about.primaryVenue", "Primary venue")} value={t("nav.yashobhoomi", "Yashobhoomi")} />
              <StatCard icon={<MapPin size={16} />} label={t("about.coverage", "Coverage")} value={t("nav.yashobhoomi", "Yashobhoomi")} />
              <StatCard icon={<LayoutGrid size={16} />} label={t("about.coreServices", "Core services")} value="6" />
              <StatCard icon={<Sparkles size={16} />} label={t("about.approach", "Approach")} value={t("about.endToEnd", "End-to-end")} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("about.whoWeAre", "Who We Are")}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">{cms("about.whoTitle")}</h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
              <p>{cms("about.body1")}</p>
              <p>{cms("about.body2")}</p>
              <p>{cms("about.body3")}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {["Official partner at Yashobhoomi", "Complete booth lifecycle management", "Experienced interpretation and protocol teams", "Dedicated marketing support"].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#111111] text-white shadow-sm">
            <div className="relative min-h-[320px]">
              <img src="/assets/hall.jpg" alt="Exhibition hall" className="absolute inset-0 h-full w-full object-cover opacity-65" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("about.ourApproach", "Our approach")}</p>
                <h3 className="mt-2 text-2xl font-black">{t("about.approachTitle", "We combine venue understanding, execution discipline, and client-first planning.")}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                  {t("about.approachBody", "The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.")}
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{cms("about.coreValues")}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">{cms("about.coreValuesTitle")}</h2>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {coreValues.map((value) => (
              <div key={value.title} className="rounded-[1.35rem] border border-slate-200 bg-slate-50 p-5">
                <div className="mb-4 h-10 w-10 rounded-2xl bg-[color:var(--hoi-primary)]/10 text-[color:var(--hoi-primary)] ring-1 ring-[color:var(--hoi-primary)]/10 flex items-center justify-center">
                  <Sparkles size={16} />
                </div>
                <h3 className="text-lg font-black text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-[1.75rem] border border-black/5 bg-[#111111] p-7 text-white shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">{cms("about.servicesOverview")}</p>
              <h2 className="mt-2 text-2xl font-black">{cms("about.currentServices")}</h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
              {t("common.exploreServices", "Explore Services")}
              <ArrowRight size={16} />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {serviceHighlights.map((service) => (
              <div key={service} className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white/90">
                {service}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/10 p-4 text-white/95">
      <div className="flex items-center gap-2 text-white/80">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-2 text-xl font-black">{value}</p>
    </div>
  );
}
