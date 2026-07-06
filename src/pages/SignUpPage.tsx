import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { signupSchema, type SignUpValues } from "@/lib/validators";
import { DetailsForm } from "./signup/SignUpForms";

const hoiLogo = "/assets/hoi.png";

export default function SignUpPage() {
  const { user, loading, register } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState<SignUpValues>({ name: "", company: "", email: "", phone: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!loading && user) setLocation("/");
  }, [loading, setLocation, user]);

  const handleChange = (key: keyof SignUpValues) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const resetMessage = () => {
    setFieldErrors({});
    setSubmitError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessage();

    const result = signupSchema.safeParse(form);
    if (!result.success) {
      setFieldErrors(Object.fromEntries(result.error.errors.map((error) => [error.path[0] as string, error.message])));
      return;
    }

    setStatus("loading");
    try {
      await register(result.data);
      setLocation("/");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to create account. Please try again.");
      setStatus("error");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0f2460] to-[#1a3a8f] px-8 py-8 text-center">
            <Link href="/" className="inline-block mb-4">
              <img src={hoiLogo} alt="HOI Business Center Logo" className="h-12 w-auto mx-auto" />
            </Link>
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="text-blue-200 text-sm mt-1">Join HOI Business Center to manage your exhibition needs</p>
          </div>

          <div className="px-8 py-8">
            <DetailsForm form={form} fieldErrors={fieldErrors} submitError={submitError} status={status} showPassword={showPassword} onChange={handleChange} onSubmit={handleSubmit} onTogglePassword={() => setShowPassword((value) => !value)} />

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a3a8f] font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">© HOI Business Center. All rights reserved.</p>
      </div>
    </div>
  );
}
