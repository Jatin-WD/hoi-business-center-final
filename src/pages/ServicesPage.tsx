import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, CheckCircle2, PackageSearch, Sparkles, ArrowUpRight } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService } from "@/lib/catalog";
import { SERVICE_DETAIL_CONTENT } from "@/lib/serviceContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function ServicesPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "services.page.title": "Services",
    "services.page.description": "Explore the six canonical HOI services. Each card opens a dedicated description page, and every service can also flow into the booking path.",
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
    <div className="min-h-screen bg-[#f7f4ef]">
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316]" />
        <div className="absolute inset-0 opacity-15" style={{ backgroundImage: "radial-gradient(circle at 18% 22%, white 0, transparent 20%), radial-gradient(circle at 78% 26%, white 0, transparent 16%), radial-gradient(circle at 50% 76%, white 0, transparent 18%)" }} />
        <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 lg:py-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
              <Sparkles size={14} />
              {t("common.serviceCatalog", "Service catalog")}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {cms("services.page.title")}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {cms("services.page.description")}
            </p>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:py-14">
        <section className="mb-8 rounded-[1.75rem] border border-black/5 bg-white p-6 shadow-sm">
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
              <h2 className="mt-2 text-2xl font-black text-slate-900">{t("common.tapService", "Tap a service to see the full description")}</h2>
            </div>
            <Link href="/service" className="inline-flex items-center gap-2 rounded-xl border border-[color:var(--hoi-primary)] px-4 py-2.5 text-sm font-bold text-[color:var(--hoi-primary)] transition-colors hover:bg-orange-50">
              {t("common.bookingMenu", "Booking menu")}
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((service) => (
              <article key={service.id} className="group overflow-hidden rounded-[1.65rem] border border-black/5 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(17,17,17,0.08)]">
                <div className="bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316] px-6 py-5 text-white">
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("service.hoiService", "HOI Service")}</p>
                  <h3 className="mt-2 text-2xl font-black">{service.label}</h3>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">
                    {service.detail?.description || service.description || "Explore the service in detail and move into the booking path when ready."}
                  </p>
                </div>

                <div className="p-6">
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
    <div className="rounded-2xl border border-gray-100 bg-[#f7f4ef] p-5">
      <div className="flex items-center gap-2 text-[#f97316]">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
    </div>
  );
}
