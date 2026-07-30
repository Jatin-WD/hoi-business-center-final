import type { ReactNode } from "react";
import { BreadcrumbItem, default as PageBreadcrumb } from "./PageBreadcrumb";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

interface HeroSectionProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  description: string
  children?: ReactNode
}

export default function HeroSection({ breadcrumbs, title, description, children }: HeroSectionProps) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div className="relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,#0a0f18_0%,#111827_54%,#f97316_110%)]" />
      <div className="absolute inset-0 opacity-25" style={{ backgroundImage: "radial-gradient(circle at 18% 20%, rgba(255,255,255,0.28) 0, transparent 18%), radial-gradient(circle at 84% 28%, rgba(255,255,255,0.16) 0, transparent 16%), radial-gradient(circle at 50% 74%, rgba(255,255,255,0.12) 0, transparent 18%)" }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.32),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.06),transparent_30%)]" />
      <div className="relative mx-auto max-w-[1600px] px-6 py-16 sm:px-8 sm:py-18 lg:py-20">
        <PageBreadcrumb items={breadcrumbs} className="mb-5 text-white/72" />
        <div className="max-w-4xl">
          <p className="inline-flex items-center rounded-full border border-white/12 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/78 backdrop-blur-sm">
            {t("hero.contentArea", "Yashobhoomi-style content area")}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-[1.05] tracking-[-0.04em] md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
