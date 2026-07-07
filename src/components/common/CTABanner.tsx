import type { ReactNode } from "react"
import { Link } from "wouter"

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
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#111111] via-[#1f1f1f] to-[#f97316] p-8 text-white shadow-[0_24px_70px_rgba(0,0,0,0.18)]">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="mb-6 text-sm leading-relaxed text-zinc-200">{description}</p>
        {children}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-zinc-100"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
