import { Link } from "wouter"

export type BreadcrumbItem = {
  label: string
  href?: string
}

interface PageBreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export default function PageBreadcrumb({ items, className = "" }: PageBreadcrumbProps) {
  return (
    <div className={`flex flex-wrap items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => (
        <span key={item.label} className="flex items-center gap-2">
          {item.href ? (
            <Link href={item.href} className="hover:text-white transition-colors">
              {item.label}
            </Link>
          ) : (
            <span>{item.label}</span>
          )}
          {index < items.length - 1 && <span className="text-zinc-400">/</span>}
        </span>
      ))}
    </div>
  )
}
