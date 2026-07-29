import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight, ChevronRight, Clock3, CheckCircle2, Layers3, MapPin, Sparkles } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { loadCatalog, type CatalogService } from "@/lib/catalog";
import { SERVICE_DETAIL_CONTENT } from "@/lib/serviceContent";

interface Props {
  params?: { serviceId?: string };
}

export default function ServiceDetailPage({ params }: Props) {
  const serviceId = params?.serviceId ?? "";
  const cms = useCmsContent({
    [`services.${serviceId}.title`]: SERVICE_DETAIL_CONTENT[serviceId]?.title ?? "Service",
    [`services.${serviceId}.description`]: SERVICE_DETAIL_CONTENT[serviceId]?.description ?? "Explore the service in detail and move into the booking flow when ready.",
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
  const selectedLocation = "Yashobhoomi";
  const bookingHref = `/service/${serviceId}`;

  if (!service || !detail) {
    return <EmptyState />;
  }

  const packageHref = (href: string) => `${href}?location=${encodeURIComponent(selectedLocation)}`;

  return (
    <div className="min-h-screen bg-[#f7f4ef]">
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
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <Link href="/services" className="hover:text-white">Services</Link>
            <ChevronRight size={14} />
            <span className="text-white">{detail.title}</span>
          </div>
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/80">
              <Sparkles size={14} />
              Service detail
            </p>
            <h1 className="mt-4 text-4xl font-black leading-tight sm:text-5xl">
              {cms(`services.${serviceId}.title`)}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
              {cms(`services.${serviceId}.description`)}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={bookingHref} className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-zinc-100">
                Open Booking
                <ArrowRight size={15} />
              </Link>
              <Link href="/services" className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                Back to Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-6 py-10 sm:px-8 lg:py-14">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Overview</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">{detail.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">{detail.overview}</p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <InfoCard icon={Layers3} title="What this covers" text={detail.highlights.join(" | ")} />
              <InfoCard icon={Clock3} title="Booking path" text="Start here, then move into the booking flow to pick packages and finalise the requirement." />
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black text-slate-900">Key highlights</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {detail.highlights.map((point) => (
                  <div key={point} className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-[#f7f4ef] p-4">
                    <CheckCircle2 size={18} className="mt-0.5 text-[#f97316]" />
                    <span className="text-sm leading-6 text-slate-700">{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-black text-slate-900">How it works</h3>
              <div className="mt-4 space-y-3">
                {detail.process.map((step, index) => (
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
            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Booking entry</p>
                  <h3 className="mt-2 text-2xl font-black text-slate-900">Booking for {detail.title}</h3>
                </div>
                <div className="rounded-2xl bg-orange-50 px-3 py-2 text-sm font-bold text-[#f97316]">
                  Yashobhoomi
                </div>
              </div>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                Use the booking path to select packages, confirm requirements, and move into final quotation.
              </p>

              <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link href={bookingHref} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
                  Book this service
                  <ArrowRight size={15} />
                </Link>
                <Link href={`/contact?type=Service%20Requirement&service=${encodeURIComponent(detail.title)}&location=Yashobhoomi`} className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#f97316] px-5 py-3 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50">
                  Request a quote
                </Link>
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Packages</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Package links for {detail.title}</h3>
              <div className="mt-5 space-y-3">
                {service.packages.map((pkg) => (
                  <Link
                    key={pkg.href}
                    href={packageHref(pkg.href)}
                    className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-[#f7f4ef] px-4 py-3.5 transition-all hover:border-[#f97316] hover:bg-orange-50"
                  >
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-[#f97316]">{pkg.label}</span>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-[#f97316]" />
                  </Link>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-[#111111] p-7 text-white shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Best for</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {detail.bestFor.map((item) => (
                  <span key={item} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Venue</p>
              <h3 className="mt-2 text-2xl font-black text-slate-900">Always centered on Yashobhoomi</h3>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                HOI keeps the public venue model strict and simple. This service flows into the Yashobhoomi booking path and the associated package flow.
              </p>
              <Link href="/yashobhoomi" className="mt-5 inline-flex items-center gap-2 rounded-xl border border-[#f97316] px-4 py-2.5 text-sm font-bold text-[#f97316] transition-colors hover:bg-orange-50">
                View Yashobhoomi
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

function EmptyState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-slate-900">Service not found</h1>
        <p className="mt-2 text-sm text-slate-500">This service does not exist in the canonical six-service catalog.</p>
        <Link href="/services" className="mt-5 inline-flex rounded-xl bg-[#f97316] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#ea580c]">
          Back to Services
        </Link>
      </div>
    </div>
  );
}
