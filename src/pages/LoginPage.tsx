import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Eye, EyeOff, LogIn } from "lucide-react";
import kilLogo from "/assets/kil.png";
import { useAuth } from "@/hooks/useAuth";
import { loginSchema, type LoginValues } from "@/lib/validators";

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const [, setLocation] = useLocation();
  const redirectParam = new URLSearchParams(window.location.search).get("redirect");
  const redirectTo = redirectParam?.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/";
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<LoginValues>({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && user) setLocation(redirectTo);
  }, [loading, redirectTo, setLocation, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitError("");
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(
        Object.fromEntries(result.error.errors.map((error) => [error.path[0] as string, error.message]))
      );
      return;
    }
    setStatus("loading");
    try {
      await login(result.data);
      setLocation(redirectTo);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in. Please try again.");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] px-8 py-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <img src={kilLogo} alt="KIL Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-blue-200 text-sm mt-1">Sign in to your HOI Business Center account</p>
          </div>
          <div className="px-8 py-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a8f] focus:border-transparent transition"
                  placeholder="you@company.com"
                  data-testid="input-email"
                />
                {fieldErrors.email ? <p className="mt-2 text-sm text-red-600">{fieldErrors.email}</p> : null}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <Link href="#" className="text-xs text-[#1a3a8f] hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a3a8f] focus:border-transparent transition"
                    placeholder="Enter your password"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {fieldErrors.password ? <p className="mt-2 text-sm text-red-600">{fieldErrors.password}</p> : null}
              </div>
              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full flex items-center justify-center gap-2 bg-[#1a3a8f] text-white py-3 rounded-xl font-semibold hover:bg-[#152e75] transition-colors disabled:cursor-not-allowed disabled:opacity-60"
                data-testid="btn-submit-login"
              >
                <LogIn size={18} />
                {status === "loading" ? "Signing In..." : "Sign In"}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Don't have an account?{" "}
              <Link href="/signup" className="text-[#1a3a8f] font-semibold hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">© KIL - HOI Business Center. All rights reserved.</p>
      </div>
    </div>
  )
}
