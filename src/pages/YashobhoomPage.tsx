import { Link } from "wouter";
import { ChevronRight, Building2, Boxes, Languages, Megaphone, PanelTop, Truck } from "lucide-react";
import { useCmsContent } from "@/hooks/useCmsContent";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateServiceLabel, translateSiteText } from "@/lib/site-translations";

export default function YashobhoomiPage() {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);
  const cms = useCmsContent({
    "yashobhoomi.hero.title": "Yashobhoomi Exhibition Services",
    "yashobhoomi.hero.description": "Manage your exhibition presence at India International Convention and Expo Centre, Dwarka with our complete service support.",
  });

  const services = [
    {
      icon: Boxes,
      title: translateServiceLabel("booth-reservation", language),
      desc: t("yash.service.boothReservation", "Reserve the right exhibition space at Yashobhoomi with HOI handling the process end to end."),
    },
    {
      icon: PanelTop,
      title: translateServiceLabel("booth-design", language),
      desc: t("yash.service.boothDesign", "Create booth concepts and layouts that fit the venue and the brand story."),
    },
    {
      icon: Building2,
      title: translateServiceLabel("booth-install-demolition", language),
      desc: t("yash.service.install", "Manage installation, execution, and teardown around the event schedule."),
    },
    {
      icon: Truck,
      title: translateServiceLabel("logistics", language),
      desc: t("yash.service.logistics", "Coordinate movement, handling, and on-site support for exhibition materials."),
    },
    {
      icon: Megaphone,
      title: translateServiceLabel("marketing", language),
      desc: t("yash.service.marketing", "Support visibility, promotions, and exhibition marketing before the event opens."),
    },
    {
      icon: Languages,
      title: translateServiceLabel("interpretation-protocol", language),
      desc: t("yash.service.interpretation", "Provide language support and protocol coordination for guests and exhibitors."),
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5efe4] text-[#111111]">
      <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0a0f18_0%,#111827_56%,#f97316_112%)] px-6 py-16 text-white sm:px-8">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 18% 22%, white 0, transparent 20%), radial-gradient(circle at 78% 26%, white 0, transparent 16%), radial-gradient(circle at 50% 76%, white 0, transparent 18%)" }} />
        <div className="mx-auto max-w-[1600px]">
          <div className="mb-4 flex items-center gap-2 text-sm text-white/72">
            <Link href="/" className="hover:text-white">{t("nav.home", "Home")}</Link>
            <ChevronRight size={14} />
            <span className="text-white">{t("nav.yashobhoomi", "Yashobhoomi")}</span>
          </div>
          <p className="inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-white/80 backdrop-blur-sm">
            {t("common.officialVenueSpotlight", "Official venue spotlight")}
          </p>
          <h1 className="hoi-display mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-5xl lg:text-6xl">
            {cms("yashobhoomi.hero.title")}
          </h1>
          <p className="mt-4 text-xl font-semibold text-white/82">
            {t("yash.hero.subtitle", "India International Convention & Expo Centre")}
          </p>
          <p className="mt-4 max-w-2xl text-white/76">
            {cms("yashobhoomi.hero.description")}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-[1600px] px-6 py-14 sm:px-8">
        <div className="mb-16 grid grid-cols-1 gap-14 lg:grid-cols-2">
          <div>
            <h2 className="hoi-display mb-6 text-3xl font-black text-[#111111]">{t("yash.role.title", "Role of HOI at Yashobhoomi")}</h2>
            <div className="space-y-4 leading-relaxed text-slate-700">
              <p>
                {t("yash.role.body1", "HOI Business Center serves as the official service partner at Yashobhoomi - India's premier convention and exhibition facility. Our role encompasses every aspect of exhibitor support within the venue.")}
              </p>
              <p>
                {t("yash.role.body2", "As the designated HOI partner, we have exclusive access and established processes that allow us to serve exhibitors more efficiently than any other vendor. We bring pre-approved layouts, recognized vendor credentials, and deep-rooted venue relationships built over years of collaboration.")}
              </p>
              <p>
                {t("yash.role.body3", "From the moment an exhibitor reserves their booth space to the final demolition and clearance, HOI is present - coordinating, problem-solving, and ensuring everything runs according to schedule. We are the single point of contact for all exhibition support needs.")}
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/services" className="inline-block rounded-xl bg-[#111111] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#f97316]">
                {t("yash.viewServices", "View Services at Yashobhoomi")}
              </Link>
              <Link href="/contact" className="inline-block rounded-xl border border-[#111111] px-6 py-3 font-semibold text-[#111111] transition-colors hover:bg-gray-50">
                {t("nav.contactUs", "Contact Us")}
              </Link>
            </div>
          </div>

          <div className="space-y-5">
            <div className="group relative overflow-hidden rounded-[2rem] border border-black/10 shadow-[0_18px_50px_rgba(17,17,17,0.08)]">
              <img src="/assets/yashobhoomi.png" alt="Yashobhoomi Convention Centre" className="h-[320px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,17,17,0.08)_0%,rgba(17,17,17,0.24)_42%,rgba(17,17,17,0.84)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(17,17,17,0.06)_0%,rgba(17,17,17,0)_44%,rgba(249,115,22,0.24)_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#111111]/92 via-[#111111]/40 to-transparent" />
              <div className="absolute inset-0 flex items-end p-6 text-white">
                <div className="max-w-md rounded-[1.5rem] border border-white/12 bg-[linear-gradient(135deg,rgba(17,17,17,0.82),rgba(17,17,17,0.58),rgba(249,115,22,0.28))] p-5 backdrop-blur-xl">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70">{t("common.officialVenueSpotlight", "Official venue spotlight")}</p>
                <h3 className="hoi-display mt-2 text-2xl font-black leading-tight">{t("yash.card.title", "Yashobhoomi, India International Convention and Expo Centre")}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/82">{t("yash.card.description", "The venue stays visually central to the page so visitors immediately understand where the service flow begins.")}</p>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: t("yash.stat.area", "Total Area"), value: "89,000 sq m" },
                { label: t("yash.stat.halls", "Exhibition Halls"), value: "12 Halls" },
                { label: t("yash.stat.capacity", "Capacity"), value: "11,000+ delegates" },
                { label: t("yash.stat.location", "Location"), value: "Dwarka, New Delhi" },
              ].map((stat, i) => (
                <div key={i} className="rounded-[1.35rem] border border-black/5 bg-white p-5 transition-colors hover:border-[#f97316] hover:shadow-[0_12px_30px_rgba(17,17,17,0.05)]">
                  <p className="text-2xl font-bold text-[#f97316]">{stat.value}</p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-16">
          <h2 className="hoi-display mb-8 text-2xl font-black text-[#111111]">{t("yash.services.title", "What HOI Provides at Yashobhoomi")}</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((item, idx) => (
              <div key={idx} className="rounded-[1.5rem] border border-black/5 bg-white p-6 transition-all hover:border-[#f97316] hover:shadow-[0_18px_40px_rgba(17,17,17,0.06)]">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f97316]/10">
                  <item.icon size={22} className="text-[#f97316]" />
                </div>
                <h3 className="mb-2 font-black text-[#111111]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-[#111111] via-[#231b16] to-[#f97316] p-10 text-center text-white">
          <h2 className="hoi-display mb-3 text-2xl font-black">{t("yash.cta.title", "Ready to exhibit at Yashobhoomi?")}</h2>
          <p className="mx-auto mb-6 max-w-xl text-white/76">
            {t("yash.cta.description", "Let HOI Business Center handle every detail of your exhibition - from booth booking to teardown.")}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/services" className="rounded-xl bg-[#f97316] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#ea580c]">
              {t("yash.explore", "Explore Services")}
            </Link>
            <Link href="/contact" className="rounded-xl border border-white/30 px-6 py-3 font-semibold text-white transition-colors hover:bg-white/10">
              {t("common.getInTouch", "Get in Touch")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
