import { type ReactNode } from "react";
import { ArrowRight, ChevronRight, Building2, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function AboutPage() {
  const { language } = useSiteLanguage();
  const t = (key: string) => translateSiteText(language, key);
  const cms = useCmsContent({
    "about.badge": t("about.badge"),
    "about.hero.title": t("about.hero.title"),
    "about.hero.description": t("about.hero.description"),
    "about.whoTitle": t("about.whoTitle"),
    "about.body1": t("about.body1"),
    "about.body2": t("about.body2"),
    "about.body3": t("about.body3"),
    "about.ourApproach": t("about.ourApproach"),
    "about.approachTitle": t("about.approachTitle"),
    "about.approachBody": t("about.approachBody"),
    "about.coreValues": t("about.coreValues"),
    "about.coreValuesTitle": t("about.coreValuesTitle"),
    "about.value.excellence": t("about.value.excellence"),
    "about.value.excellenceDesc": t("about.value.excellenceDesc"),
    "about.value.reliability": t("about.value.reliability"),
    "about.value.reliabilityDesc": t("about.value.reliabilityDesc"),
    "about.value.innovation": t("about.value.innovation"),
    "about.value.innovationDesc": t("about.value.innovationDesc"),
    "about.value.partnership": t("about.value.partnership"),
    "about.value.partnershipDesc": t("about.value.partnershipDesc"),
    "about.servicesOverview": t("about.servicesOverview"),
    "about.currentServices": t("about.currentServices"),
  });
  const coreValues = [
    { title: cms("about.value.excellence"), desc: cms("about.value.excellenceDesc") },
    { title: cms("about.value.reliability"), desc: cms("about.value.reliabilityDesc") },
    { title: cms("about.value.innovation"), desc: cms("about.value.innovationDesc") },
    { title: cms("about.value.partnership"), desc: cms("about.value.partnershipDesc") },
  ];

  const serviceHighlights = [
    translateServiceLabel("booth-reservation", language),
    translateServiceLabel("booth-design", language),
    translateServiceLabel("booth-install-demolition", language),
    translateServiceLabel("logistics", language),
    translateServiceLabel("marketing", language),
    translateServiceLabel("interpretation-protocol", language),
  ];

  return (
    <div className="min-h-screen bg-[#f5efe4]">
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
            <Link href="/" className="transition-colors hover:text-white">{t("nav.home")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t("nav.aboutUs")}</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
                <Sparkles size={14} />
                {cms("about.badge")}
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
                {cms("about.hero.title")}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                {cms("about.hero.description")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <StatCard icon={<Building2 size={16} />} label={t("about.primaryVenue")} value={t("nav.yashobhoomi")} />
              <StatCard icon={<MapPin size={16} />} label={t("about.coverage")} value={t("nav.yashobhoomi")} />
              <StatCard icon={<LayoutGrid size={16} />} label={t("about.coreServices")} value="6" />
              <StatCard icon={<Sparkles size={16} />} label={t("about.approach")} value={t("about.endToEnd")} />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("about.whoWeAre")}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">{cms("about.whoTitle")}</h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
              <p>{cms("about.body1")}</p>
              <p>{cms("about.body2")}</p>
              <p>{cms("about.body3")}</p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {[cms("about.partnerYashobhoomi"), cms("about.lifecycle"), cms("about.interpretationTeam"), cms("about.marketingSupport")].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#111111] text-white shadow-sm">
            <div className="relative min-h-[320px]">
              <video
                className="absolute inset-0 h-full w-full object-cover opacity-75"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster="/assets/hoi-booth-install.jpg"
              >
                <source src="/assets/hoi-booth-video.mov" type="video/quicktime" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("about.ourApproach")}</p>
                <h3 className="mt-2 text-2xl font-black">{t("about.approachTitle")}</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                  {t("about.approachBody")}
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
              {t("common.exploreServices")}
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
