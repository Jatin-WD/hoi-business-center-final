import { Link } from "wouter";
import { ChevronRight, Building2, Boxes, Languages, Megaphone, PanelTop, Truck } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";

export default function YashobhoomiPage() {
  const cms = useCmsContent({
    "yashobhoomi.hero.title": "Yashobhoomi Exhibition Services",
    "yashobhoomi.hero.description": "Manage your exhibition presence at India International Convention and Expo Centre, Dwarka with our complete service support.",
  });

  const services = [
    {
      icon: Boxes,
      title: "Booth Reservation",
      desc: "Reserve the right exhibition space at Yashobhoomi with HOI handling the process end to end.",
    },
    {
      icon: PanelTop,
      title: "Booth Design",
      desc: "Create booth concepts and layouts that fit the venue and the brand story.",
    },
    {
      icon: Building2,
      title: "Booth Install & Demolition",
      desc: "Manage installation, execution, and teardown around the event schedule.",
    },
    {
      icon: Truck,
      title: "Logistics Services",
      desc: "Coordinate movement, handling, and on-site support for exhibition materials.",
    },
    {
      icon: Megaphone,
      title: "Marketing Services",
      desc: "Support visibility, promotions, and exhibition marketing before the event opens.",
    },
    {
      icon: Languages,
      title: "Interpretation & Protocol",
      desc: "Provide language support and protocol coordination for guests and exhibitors.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316] px-8 py-16 text-white">
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-4 flex items-center gap-2 text-sm text-zinc-200">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight size={14} />
            <span className="text-white">Yashobhoomi</span>
          </div>
          <h1 className="mb-3 text-4xl font-bold">{cms("yashobhoomi.hero.title")}</h1>
          <p className="mb-3 text-xl font-semibold text-zinc-200">
            India International Convention &amp; Expo Centre
          </p>
          <p className="max-w-2xl text-zinc-200">
            {cms("yashobhoomi.hero.description")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-8 py-14">
        <div className="mb-16 grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="mb-6 text-3xl font-bold text-gray-900">Role of HOI at Yashobhoomi</h2>
            <div className="space-y-4 leading-relaxed text-gray-600">
              <p>
                HOI Business Center serves as the <strong>official service partner at Yashobhoomi</strong> - India's premier convention and exhibition facility. Our role encompasses every aspect of exhibitor support within the venue.
              </p>
              <p>
                As the designated HOI partner, we have exclusive access and established processes that allow us to serve exhibitors more efficiently than any other vendor. We bring pre-approved layouts, recognized vendor credentials, and deep-rooted venue relationships built over years of collaboration.
              </p>
              <p>
                From the moment an exhibitor reserves their booth space to the final demolition and clearance, HOI is present - coordinating, problem-solving, and ensuring everything runs according to schedule. We are the single point of contact for all exhibition support needs.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/service/yashobhoomi" className="inline-block rounded-xl bg-[#111111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#f97316]">
                View Services at Yashobhoomi
              </Link>
              <Link href="/contact" className="inline-block rounded-xl border border-[#111111] px-6 py-3 font-semibold text-[#111111] transition-colors hover:bg-gray-50">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <img src="/assets/yashobhoomi.png" alt="Yashobhoomi Convention Centre" className="h-60 w-full rounded-2xl object-cover shadow-md" />
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Total Area", value: "89,000 sq m" },
                { label: "Exhibition Halls", value: "12 Halls" },
                { label: "Capacity", value: "11,000+ delegates" },
                { label: "Location", value: "Dwarka, New Delhi" },
              ].map((stat, i) => (
                <div key={i} className="rounded-xl border border-gray-100 bg-white p-5 transition-colors hover:border-[#f97316]">
                  <p className="text-2xl font-bold text-[#f97316]">{stat.value}</p>
                  <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="mb-8 text-2xl font-bold text-gray-900">What HOI Provides at Yashobhoomi</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item, idx) => (
              <div key={idx} className="rounded-2xl border border-gray-100 bg-white p-6 transition-all hover:border-[#f97316] hover:shadow-md">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100">
                  <item.icon size={22} className="text-[#f97316]" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-[#111111] via-[#1f1f1f] to-[#f97316] p-10 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Ready to exhibit at Yashobhoomi?</h2>
          <p className="mx-auto mb-6 max-w-xl text-zinc-200">
            Let HOI Business Center handle every detail of your exhibition - from booth booking to teardown.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/service/yashobhoomi" className="rounded-xl bg-[#f97316] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#ea580c]">
              Explore Services
            </Link>
            <Link href="/contact" className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
              Get in Touch
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
