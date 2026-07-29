import type { ReactNode } from "react";
import { Link } from "wouter";
import { useSiteLanguage } from "@/hooks/useSiteLanguage";
import { translateSiteText } from "@/lib/site-translations";

interface CTABannerProps {
  title: string
  description: string
  primaryLabel: string
  primaryHref: string
  secondaryLabel?: string
  secondaryHref?: string
  children?: ReactNode
}

export default function CTABanner({
  title,
  description,
  primaryLabel,
  primaryHref,
  secondaryLabel,
  secondaryHref,
  children,
}: CTABannerProps) {
  const { language } = useSiteLanguage();
  const t = (key: string, fallback = "") => translateSiteText(language, key, fallback);

  return (
    <div
      className="rounded-[2rem] border border-white/10 p-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]"
      style={{
        background: "linear-gradient(135deg, #111111 0%, #1f2937 58%, var(--hoi-primary) 100%)",
      }}
    >
      <div className="max-w-3xl">
        <p className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.24em] text-white/75">
          {t("common.readyToMoveForward", "Ready to move forward")}
        </p>
        <h2 className="mt-4 text-2xl font-black sm:text-3xl">{title}</h2>
        <p className="mt-3 text-sm leading-relaxed text-zinc-200">{description}</p>
        {children}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-[#111111] transition-colors hover:bg-zinc-100"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
