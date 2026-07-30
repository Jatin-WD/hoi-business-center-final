import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, PackageSearch, Sparkles, ArrowUpRight } from "lucide-react";
import HeroSection from "@/components/common/HeroSection";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService } from "@/lib/catalog";
import { SERVICE_DETAIL_CONTENT } from "@/lib/serviceContent";
import { getServiceMediaImage } from "@/lib/service-media";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function ServicesPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "services.page.eyebrow": "Service catalog",
    "services.page.title": "Services",
    "services.page.description": "Explore the six canonical HOI services. Each card opens a dedicated description page, and every service can also flow into the booking path.",
    "services.section.eyebrow": "Service cards",
    "services.section.title": "Tap a service to see the full description",
    "services.card.tag": "HOI Service",
    "services.card.defaultDesc": "Explore the service in detail and move into the booking path when ready.",
    "services.booth-reservation.description": "Reserve exhibition space at Yashobhoomi with HOI managing availability, coordination, and booking support.",
    "services.booth-design.description": "Create a strong exhibition identity with booth layouts tailored for visibility, flow, and brand impact.",
    "services.booth-install-demolition.description": "Manage installation, supervision, and teardown with disciplined execution around the event schedule.",
    "services.logistics.description": "Coordinate movement, handling, and material support for smooth exhibition delivery.",
    "services.marketing.description": "Promote the exhibition presence before the event with brand-focused marketing support.",
    "services.interpretation-protocol.description": "Support visitors, delegates, and executives with language and protocol coordination.",
  });
  const [services, setServices] = useState<CatalogService[]>([]);

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (mounted) setServices(data.services);
      })
      .catch(() => {
        if (mounted) setServices([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const cards = useMemo(() => services.map((service) => ({
    ...service,
    label: translateServiceLabel(service.id, language),
    detail: SERVICE_DETAIL_CONTENT[service.id],
  })), [language, services]);

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <HeroSection
        breadcrumbs={[{ label: t("nav.home", "Home"), href: "/" }, { label: t("nav.services", "Services") }]}
        title={cms("services.page.title")}
        description={cms("services.page.description")}
      >
        <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
          <Sparkles size={14} />
          {cms("services.page.eyebrow")}
        </p>
      </HeroSection>

      <main className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:py-14">
        <section className="hoi-panel mb-8 rounded-[1.75rem] border border-black/5 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard icon={PackageSearch} label={t("common.canonicalServices", "Canonical services")} value="6" />
            <StatCard icon={CheckCircle2} label={t("common.venueFocus", "Venue focus")} value={t("nav.yashobhoomi", "Yashobhoomi")} />
            <StatCard icon={ArrowUpRight} label={t("common.nextStep", "Next step")} value={t("common.viewDetails", "View details")} />
          </div>
        </section>

        <section>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("common.serviceCards", "Service cards")}</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">{cms("services.section.title")}</h2>
            </div>
            <Link href="/service" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--hoi-primary)] px-4 py-2.5 text-sm font-bold text-[color:var(--hoi-primary)] transition-colors hover:bg-orange-50">
              {t("common.bookingMenu", "Booking menu")}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((service) => (
              <article key={service.id} className="group overflow-hidden rounded-[1.65rem] border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                <div className="relative h-44 overflow-hidden bg-slate-100">
                  <img
                    src={getServiceMediaImage(service.id, service.images)}
                    alt={service.label}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,15,24,0.08)_0%,rgba(10,15,24,0.48)_58%,rgba(10,15,24,0.82)_100%)]" />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0f18]/80 to-transparent" />
                  <div className="absolute left-5 top-5">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/75">{cms("services.card.tag")}</p>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-2xl font-black text-slate-900">{service.label}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    {cms(`services.${service.id}.description`) || service.detail?.description || service.description || cms("services.card.defaultDesc")}
                  </p>
                  <div className="space-y-2">
                    {(service.detail?.highlights ?? []).slice(0, 3).map((point) => (
                      <div key={point} className="flex items-start gap-2 text-sm text-slate-600">
                        <span className="mt-1 h-2 w-2 rounded-full bg-[#f97316]" />
                        <span>{point}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href={`/services/${service.id}`} className="inline-flex items-center gap-2 rounded-xl bg-[#f97316] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                      {t("common.viewDetails", "View Details")}
                      <ArrowRight size={15} />
                    </Link>
                    <Link href={`/service/${service.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[#f97316] px-4 py-2.5 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50">
                      {t("common.bookNow", "Book Now")}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: typeof PackageSearch; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-[0_10px_30px_rgba(17,17,17,0.04)]">
      <div className="flex items-center gap-2 text-[#f97316]">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
