import { type ReactNode } from "react";
import { ArrowRight, ChevronRight, Building2, LayoutGrid, MapPin, Sparkles } from "lucide-react";
import { Link } from "wouter";

const coreValues = [
  { title: "Excellence", desc: "We deliver the highest standards in every service." },
  { title: "Reliability", desc: "Your timeline is our commitment. We never miss a deadline." },
  { title: "Innovation", desc: "Creative booth designs and marketing strategies that stand out." },
  { title: "Partnership", desc: "We treat every client as a long-term partner, not a transaction." },
];

const serviceHighlights = [
  "Booth Reservation",
  "Booth Design",
  "Booth Install & Demolition",
  "Logistics Services",
  "Marketing Services",
  "Interpretation & Protocol",
  "Man Power Services",
  "Event Calendar Management",
];

export default function AboutPage() {
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
            <Link href="/" className="transition-colors hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">About Us</span>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
                <Sparkles size={14} />
                About HOI
              </p>
              <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl">
                HOI Business Center, presented in a style that feels closer to the Yashobhoomi experience.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/80 sm:text-lg">
                Learn about our mission, values, and our role at India's premier business and exhibition center.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-4 backdrop-blur">
              <StatCard icon={<Building2 size={16} />} label="Primary venue" value="Yashobhoomi" />
              <StatCard icon={<MapPin size={16} />} label="Coverage" value="India + Dubai" />
              <StatCard icon={<LayoutGrid size={16} />} label="Core services" value="8" />
              <StatCard icon={<Sparkles size={16} />} label="Approach" value="End-to-end" />
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-[1600px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <section className="rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Who We Are</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900">Built around Yashobhoomi and the full exhibition journey.</h2>
            <div className="mt-5 space-y-4 text-base leading-7 text-slate-600">
              <p>
                HOI Business Center is the premier exhibition and event services provider at Yashobhoomi - India's largest MICE (Meetings, Incentives, Conferences & Exhibitions) venue, located in Dwarka, New Delhi.
              </p>
              <p>
                Our team of seasoned professionals provides comprehensive end-to-end services for exhibitors, ensuring that every aspect of your exhibition journey - from initial booth reservation to final demolition - is handled with expertise and care.
              </p>
              <p>
                With operations extending to Dubai and other major cities, we bring global exhibition experience to every engagement.
              </p>
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
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/70">Our approach</p>
                <h3 className="mt-2 text-2xl font-black">We combine venue understanding, execution discipline, and client-first planning.</h3>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                  The result is a service experience that feels premium, organized, and directly tied to how exhibitions actually run on the ground.
                </p>
              </div>
            </div>
          </section>
        </div>

        <section className="mt-8 rounded-[1.75rem] border border-black/5 bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[color:var(--hoi-primary)]">Our Core Values</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">What we stand for</h2>
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
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/70">Our Services Overview</p>
              <h2 className="mt-2 text-2xl font-black">Current services, arranged like a premium venue section</h2>
            </div>
            <Link href="/service" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-900 transition-colors hover:bg-slate-100">
              Explore Services
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
