import type { ReactNode } from "react"
import { BreadcrumbItem, default as PageBreadcrumb } from "./PageBreadcrumb"

interface HeroSectionProps {
  breadcrumbs: BreadcrumbItem[]
  title: string
  description: string
  children?: ReactNode
}

export default function HeroSection({ breadcrumbs, title, description, children }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-[#7c2d12] to-[#f97316] text-white py-14 px-6 sm:px-8">
      <div className="max-w-[1600px] mx-auto">
        <PageBreadcrumb items={breadcrumbs} />
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="max-w-3xl text-[#ffedd5] text-base sm:text-lg leading-relaxed">{description}</p>
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </div>
  )
}
