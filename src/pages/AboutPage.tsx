import { type ReactNode } from "react";
import { ArrowRight, Building2, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";
import PageBreadcrumb from "@/components/common/PageBreadcrumb";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function AboutPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "about.badge": t("about.badge", "About HOI"),
    "about.hero.title": t("about.hero.title", "About HOI Business Center"),
    "about.hero.description": t("about.hero.description", "Your trusted exhibition service partner for booth reservation, booth design, booth install & demolition, logistics services, marketing services, and interpretation & protocol."),
    "about.whoTitle": t("about.fullJourney", "Built around Yashobhoomi and the full exhibition journey."),
    "about.body1": t("about.primaryText1", "HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi."),
    "about.body2": t("about.primaryText2", "Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care."),
    "about.body3": t("about.primaryText3", "Everything we present on the public site is centered on Yashobhoomi and the six canonical HOI services, so the experience stays simple and consistent."),
    "about.ourApproach": t("about.ourApproach", "Our approach"),
    "about.approachTitle": t("about.approachTitle", "We combine venue understanding, execution discipline, and client-first planning."),
    "about.approachBody": t("about.approachBody", "The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground."),
    "about.coreValues": t("about.coreValues", "Our Core Values"),
    "about.coreValuesTitle": t("about.coreValuesTitle", "What we stand for"),
    "about.value.excellence": t("about.value.excellence", "Excellence"),
    "about.value.excellenceDesc": t("about.value.excellenceDesc", "We deliver the highest standards in every service."),
    "about.value.reliability": t("about.value.reliability", "Reliability"),
    "about.value.reliabilityDesc": t("about.value.reliabilityDesc", "Your timeline is our commitment. We never miss a deadline."),
    "about.value.innovation": t("about.value.innovation", "Innovation"),
    "about.value.innovationDesc": t("about.value.innovationDesc", "Creative booth designs and marketing strategies that stand out."),
    "about.value.partnership": t("about.value.partnership", "Partnership"),
    "about.value.partnershipDesc": t("about.value.partnershipDesc", "We treat every client as a long-term partner, not a transaction."),
    "about.servicesOverview": t("about.servicesOverview", "Our Services Overview"),
    "about.currentServices": t("about.currentServices", "Current services, arranged like a premium venue section"),
  });
  const coreValues = [
    { title: cms("about.value.excellence") || t("about.excellence", "Excellence"), desc: cms("about.value.excellenceDesc") || t("about.excellenceDesc", "We deliver the highest standards in every service.") },
    { title: cms("about.value.reliability") || t("about.reliability", "Reliability"), desc: cms("about.value.reliabilityDesc") || t("about.reliabilityDesc", "Your timeline is our commitment. We never miss a deadline.") },
    { title: cms("about.value.innovation") || t("about.innovation", "Innovation"), desc: cms("about.value.innovationDesc") || t("about.innovationDesc", "Creative booth designs and marketing strategies that stand out.") },
    { title: cms("about.value.partnership") || t("about.partnership", "Partnership"), desc: cms("about.value.partnershipDesc") || t("about.partnershipDesc", "We treat every client as a long-term partner, not a transaction.") },
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

        <div className="relative mx-auto max-w-[1600px] px-5 py-16 sm:px-8 lg:py-20">
          <PageBreadcrumb
            items={[
              { label: t("nav.home"), href: "/" },
              { label: t("nav.aboutUs") },
            ]}
            className="mb-5 text-white/72"
          />

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

          <div className="mt-6 overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_18px_50px_rgba(17,17,17,0.18)]">
            <img
              src="/assets/hoi-team-opening.webp"
              alt="HOI Business Center team"
              className="h-[360px] w-full object-cover object-center"
            />
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
              {[cms("about.partnerYashobhoomi") || t("about.partnerYashobhoomi", "Official partner at Yashobhoomi"), cms("about.lifecycle") || t("about.lifecycle", "Complete booth lifecycle management"), cms("about.interpretationTeam") || t("about.interpretationTeam", "Experienced interpretation and protocol teams"), cms("about.marketingSupport") || t("about.marketingSupport", "Dedicated marketing support")].map((item) => (
                <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-[#111111] text-white shadow-sm">
            <div className="relative min-h-[420px]">
              <img src="/assets/hoi-team-group.webp" alt="HOI Business Center team" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.08)_0%,rgba(17,17,17,0.44)_44%,rgba(17,17,17,0.9)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(17,17,17,0.10)_0%,rgba(17,17,17,0)_45%,rgba(249,115,22,0.26)_100%)]" />
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/30 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-7">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("about.ourApproach", "Our approach")}</p>
                <h3 className="mt-2 max-w-xl text-2xl font-black leading-tight">
                  {t("about.approachTitle", "We combine venue understanding, execution discipline, and client-first planning.")}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/82">
                  {t("about.approachBody", "The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.")}
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/8">
                    <img src="/assets/hoi-team-group.webp" alt="HOI team group" className="h-24 w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/8">
                    <img src="/assets/hoi-team-candid.jpg" alt="HOI team candid" className="h-24 w-full object-cover" />
                  </div>
                  <div className="overflow-hidden rounded-2xl border border-white/12 bg-white/8">
                    <img src="/assets/hoi-booth-install.jpg" alt="HOI booth installation" className="h-24 w-full object-cover" />
                  </div>
                </div>
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
