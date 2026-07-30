import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Clock3, CheckCircle2, Layers3, MapPin, Sparkles } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService } from "@/lib/catalog";
import { SERVICE_DETAIL_CONTENT } from "@/lib/serviceContent";
import { getServiceMediaImage, getServiceMediaVideo } from "@/lib/service-media";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translatePackageLabel, translateServiceLabel, translateSiteText } from "@/lib/site-translations";

interface Props {
  params?: { serviceId?: string };
}

export default function ServiceDetailPage({ params }: Props) {
  const { language } = useSiteLanguage();
  const t = (key: string) => translateSiteText(language, key);
  const serviceId = params?.serviceId ?? "";
  const serviceLabel = translateServiceLabel(serviceId, language);
  const cms = useCmsContent({
    [`services.${serviceId}.title`]: SERVICE_DETAIL_CONTENT[serviceId]?.title ?? serviceLabel,
    [`services.${serviceId}.description`]: SERVICE_DETAIL_CONTENT[serviceId]?.description ?? t("services.detailFallback"),
    [`services.${serviceId}.overview`]: SERVICE_DETAIL_CONTENT[serviceId]?.overview ?? "",
    [`services.${serviceId}.highlights`]: JSON.stringify(SERVICE_DETAIL_CONTENT[serviceId]?.highlights ?? []),
    [`services.${serviceId}.process`]: JSON.stringify(SERVICE_DETAIL_CONTENT[serviceId]?.process ?? []),
    [`services.${serviceId}.bestFor`]: JSON.stringify(SERVICE_DETAIL_CONTENT[serviceId]?.bestFor ?? []),
  });

  const [services, setServices] = useState<CatalogService[]>([]);

  useEffect(() => {
    let mounted = true;
    loadCatalog()
      .then((data) => {
        if (!mounted) return;
        setServices(data.services);
      })
      .catch(() => {
        if (!mounted) return;
        setServices([]);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const service = services.find((item) => item.id === serviceId) ?? null;
  const detail = SERVICE_DETAIL_CONTENT[serviceId];
  const serviceImage = getServiceMediaImage(serviceId, service?.images);
  const serviceVideo = getServiceMediaVideo(serviceId);
  const content = {
    title: cms(`services.${serviceId}.title`) || detail?.title || serviceLabel,
    description: cms(`services.${serviceId}.description`) || detail?.description || t("services.detailFallback"),
    overview: cms(`services.${serviceId}.overview`) || detail?.overview || "",
    highlights: readCmsList(cms(`services.${serviceId}.highlights`), detail?.highlights ?? []),
    process: readCmsList(cms(`services.${serviceId}.process`), detail?.process ?? []),
    bestFor: readCmsList(cms(`services.${serviceId}.bestFor`), detail?.bestFor ?? []),
  };
  const selectedLocation = "Yashobhoomi";
  const bookingHref = `/service/${serviceId}`;

  if (!service || !detail) {
    return <EmptyState t={t} />;
  }

  const packageHref = (href: string) => `${href}?location=${encodeURIComponent(selectedLocation)}`;

  return (
    <div className="min-h-screen bg-[#f5efe4]">
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0 bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316]" />
        <div
          className="absolute inset-0 opacity-15"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 22%, white 0, transparent 20%), radial-gradient(circle at 78% 26%, white 0, transparent 16%), radial-gradient(circle at 50% 76%, white 0, transparent 18%)",
          }}
        />
        <div className="relative mx-auto max-w-[1600px] px-6 py-14 sm:px-8 lg:py-20">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-200">
            <Link href="/" className="hover:text-white">{t("nav.home")}</Link>
            <ChevronRight size={14} />
            <Link href="/services" className="hover:text-white">{t("nav.services")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{serviceLabel}</span>
          </div>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
              <Sparkles size={14} />
              {t("common.serviceDetail")}
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {content.title}
            </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
            {content.description}
          </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={bookingHref} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-zinc-100">
                {t("service.openBooking")}
                <ArrowRight size={15} />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                {t("service.backToServices")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:py-14">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("common.overview")}</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">{serviceLabel}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{content.overview}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={Layers3} title={t("service.whatCovers")} text={content.highlights.join(" | ")} />
              <InfoCard icon={Clock3} title={t("service.bookingPath")} text={t("service.bookingPathDesc")} />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black text-slate-900">{t("common.keyHighlights")}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {content.highlights.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-[#f7f4ef] p-4">
                    <CheckCircle2 size={18} className="mt-0.5 text-[#f97316]" />
                    <span className="text-sm leading-6 text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black text-slate-900">{t("common.howItWorks")}</h3>
              <div className="mt-4 space-y-3">
                {content.process.map((step, index) => (
                  <div key={step} className="flex gap-3 rounded-2xl border border-gray-100 bg-white p-4">
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#f97316] text-sm font-black text-white">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <section className="overflow-hidden rounded-[1.75rem] border border-black/5 bg-white shadow-sm">
              <div className="relative min-h-[280px] bg-[#111111]">
                {serviceVideo ? (
                  <video
                    className="absolute inset-0 h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster={serviceImage}
                  >
                    <source src={serviceVideo} type="video/quicktime" />
                    <img src={serviceImage} alt={serviceLabel} className="h-full w-full object-cover" />
                  </video>
                ) : (
                  <img src={serviceImage} alt={serviceLabel} className="absolute inset-0 h-full w-full object-cover" />
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,15,24,0.08)_0%,rgba(10,15,24,0.36)_42%,rgba(10,15,24,0.86)_100%)]" />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#111111]/90 via-[#111111]/45 to-transparent" />
                <div className="absolute inset-0 flex items-end p-6 text-white">
                  <div className="max-w-md rounded-[1.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(17,17,17,0.84),rgba(17,17,17,0.58),rgba(249,115,22,0.24))] p-5 backdrop-blur-xl">
                    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">{t("common.officialVenueSpotlight", "Official venue spotlight")}</p>
                    <h3 className="mt-2 text-2xl font-black leading-tight">{serviceLabel}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/82">{content.description}</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("common.bookingEntry")}</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">{t("service.bookingFor")} {serviceLabel}</h3>
                </div>
                <div className="rounded-2xl bg-orange-50 px-3 py-2 text-sm font-bold text-[#f97316]">
                  {t("nav.yashobhoomi")}
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                {t("service.bookingEntryDesc")}
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href={bookingHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                  {t("common.bookThisService")}
                  <ArrowRight size={15} />
                </Link>
                <Link href={`/contact?type=Service%20Requirement&service=${encodeURIComponent(serviceLabel)}&location=Yashobhoomi`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f97316] px-5 py-3 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50">
                  {t("common.requestQuote")}
                </Link>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("common.packages")}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{t("service.packageLinksFor")} {serviceLabel}</h3>
              <div className="mt-5 space-y-3">
                {service.packages.map((pkg) => (
                  <Link
                    key={pkg.href}
                    href={packageHref(pkg.href)}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f7f4ef] px-4 py-3.5 transition-all hover:border-[#f97316] hover:bg-orange-50"
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-[#f97316]">{translatePackageLabel(pkg.label, language)}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316]" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-[#111111] p-7 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">{t("common.bestFor")}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {content.bestFor.map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">{t("services.detail.venue")}</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">{t("service.alwaysCentered")}</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {t("service.alwaysCenteredDesc")}
              </p>
              <Link href="/yashobhoomi" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#f97316] px-4 py-2.5 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50">
                {t("service.viewYashobhoomi")}
                <MapPin size={15} />
              </Link>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

function InfoCard({ icon: Icon, title, text }: { icon: typeof Layers3; title: string; text: string }) {
  return (
    <div className="rounded-[1.35rem] border border-gray-100 bg-[#f7f4ef] p-5">
      <div className="flex items-center gap-2 text-[#f97316]">
        <Icon size={16} />
        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{title}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function EmptyState({ t }: { t: (key: string, fallback?: string) => string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">{t("service.notFound")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("service.notFoundDesc")}</p>
        <Link href="/services" className="mt-5 inline-flex rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
          {t("service.backToServices")}
        </Link>
      </div>
    </div>
  );
}

function readCmsList(value: string, fallback: string[]) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) && parsed.every((item) => typeof item === "string") ? parsed : fallback;
  } catch {
    return value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
