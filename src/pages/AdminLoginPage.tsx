import { useState } from "react";
import { useLocation } from "wouter";
import { Lock } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await apiClient.adminLogin({ email, password });
      localStorage.setItem("hoi_admin_token", response.data.token);
      setLocation("/admin");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-16">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]"><Lock size={24} /></div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-500">View website requirements stored in the database.</p>
        <label className="mt-6 block text-sm font-semibold text-gray-700">Admin Email</label>
        <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1a3a8f]" />
        <label className="mt-4 block text-sm font-semibold text-gray-700">Password</label>
        <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[#1a3a8f]" />
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-[#1a3a8f] px-4 py-3 font-semibold text-white disabled:opacity-60">{loading ? "Signing in..." : "Open Requirements"}</button>
      </form>
    </main>
  );
}
