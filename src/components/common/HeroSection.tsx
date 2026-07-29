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
    <div
      className="relative overflow-hidden text-white"
      style={{
        background: "linear-gradient(135deg, #111111 0%, #1f2937 58%, var(--hoi-primary) 100%)",
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 0, transparent 22%), radial-gradient(circle at 85% 30%, white 0, transparent 18%), radial-gradient(circle at 45% 75%, white 0, transparent 20%)" }} />
      <div className="relative mx-auto max-w-[1600px] px-6 py-14 sm:px-8 sm:py-16">
          <PageBreadcrumb items={breadcrumbs} />
          <div className="mt-5 max-w-4xl">
            <p className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
            {t("hero.contentArea", "Yashobhoomi-style content area")}
            </p>
          <h1 className="mt-4 text-4xl font-black leading-tight md:text-5xl">{title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-white/80 sm:text-lg">{description}</p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </div>
  );
}
