import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-gray-50 px-4">
      <div className="max-w-xl text-center">
        <p className="mb-3 text-sm font-bold uppercase tracking-wide text-yellow-600">Page not found</p>
        <h1 className="mb-4 text-7xl font-bold text-[#1a3a8f]">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-gray-900">This page is not available</h2>
        <p className="mb-8 text-gray-500">
          The link may be old, or the page may have moved. You can return home, browse services, or contact support.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-block rounded-xl bg-[#1a3a8f] px-6 py-3 font-semibold text-white transition-colors hover:bg-[#152e75]"
        >
          Return to Home
        </Link>
          <Link href="/service" className="inline-block rounded-xl border border-[#1a3a8f] px-6 py-3 font-semibold text-[#1a3a8f] hover:bg-blue-50">Browse Services</Link>
        </div>
      </div>
    </div>
  );
}
