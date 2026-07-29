import { useState } from "react";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("LKMALLSHOP@GMAIL.COM");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.adminLogin({ email, password });
      sessionStorage.setItem("hoi_admin_token", response.data.token);
      setLocation("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-xl">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]">
          <Lock size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel Login</h1>
        <p className="mt-2 text-sm text-gray-500">Only authorised HOI administrators can access submissions and CMS controls.</p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Admin Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#1a3a8f]"
              required
            />
          </div>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#1a3a8f] px-4 py-3 text-sm font-semibold text-white hover:bg-[#152e75] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Open Admin Panel"}
          </button>
        </form>
      </div>
    </div>
  );
}
