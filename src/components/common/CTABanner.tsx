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
    <div className="bg-[#1a3a8f] text-white rounded-3xl p-8 shadow-lg">
      <div className="max-w-3xl">
        <h2 className="text-2xl font-bold mb-3">{title}</h2>
        <p className="text-sm text-blue-100 mb-6 leading-relaxed">{description}</p>
        {children}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href={primaryHref}
            className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#1a3a8f] hover:bg-gray-100 transition-colors"
          >
            {primaryLabel}
          </Link>
          {secondaryHref && secondaryLabel ? (
            <Link
              href={secondaryHref}
              className="inline-flex items-center justify-center rounded-xl border border-white/80 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              {secondaryLabel}
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  )
}
