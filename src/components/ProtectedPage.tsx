import { Redirect, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function ProtectedPage({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center bg-gray-50 px-4 text-center">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-orange-100 border-t-[#f97316]" />
          <p className="text-sm font-semibold text-gray-600">Checking your login...</p>
        </div>
      </div>
    );
  }

  if (!user) return <Redirect to={`/login?redirect=${encodeURIComponent(location)}`} />;
  return <>{children}</>;
}
