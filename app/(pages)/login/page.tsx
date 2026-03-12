// app/(auth)/login/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { EyeIcon, EyeClosedIcon } from "lucide-react";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import ShowTerms from "@/components/showTerms";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SIGN_IN_TIMEOUT_MS = 30_000;

function resolveAuthError(error: string | null | undefined): string {
  if (!error) return "Unable to sign in. Please try again.";

  const map: Record<string, string> = {
    INACTIVE_ACCOUNT: "Your account is inactive. Contact info.accufin@gmail.com to reactivate.",
    CredentialsSignin: "Incorrect email or password.",
    OAuthSignin: "Could not start sign-in. Please try again.",
    OAuthCallback: "Sign-in callback failed. Please try again.",
    OAuthCreateAccount: "Could not link your account. Please contact support.",
    no_account: "No account found for this email. Please register first.",
    Default: "An unexpected error occurred. Please try again.",
  };

  if (error.includes(" ") || error.length > 40) return error;
  return map[error] ?? map.Default;
}

function LoadingSpinner() {
  return (
    <span className="h-4 w-4 border-2 border-white/60 border-t-transparent rounded-full animate-spin" />
  );
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const inactive = searchParams?.get("inactive");
    const error = searchParams?.get("error");

    if (inactive === "1") {
      toast.error("Your account is inactive. Contact info.accufin@gmail.com to reactivate.");
    } else if (error) {
      toast.error(resolveAuthError(error));
    }
  }, [searchParams]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      toast.error("Please agree to the Terms & Conditions to continue.");
      return;
    }
    if (!email.trim() || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const signInPromise = signIn("credentials", {
        redirect: false,
        email: email.toLowerCase().trim(),
        password,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(
          () => reject(new Error("Sign-in timed out. Please try again.")),
          SIGN_IN_TIMEOUT_MS
        )
      );

      const result = await Promise.race([signInPromise, timeoutPromise]);

      if (!result) {
        toast.error("No response from the server. Please try again.");
        return;
      }

      if (result.error) {
        toast.error(resolveAuthError(result.error));
        return;
      }

      if (!result.ok) {
        toast.error("Sign-in failed. Please try again.");
        return;
      }

      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 md:pt-[120px] pt-[150px]">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/image-000.png" alt="Accufin Logo" className="h-24 w-auto" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg ring-1 ring-gray-100 sm:rounded-xl sm:px-10">
          <form className="space-y-6" onSubmit={handleSignIn} noValidate>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="appearance-none block w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 disabled:bg-gray-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeClosedIcon className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="agree-terms"
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="text-sm text-gray-900">
                I agree to the
              </label>
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className={`text-sm hover:underline focus:outline-none ${
                  agreedToTerms ? "text-[#007399]" : "text-red-600"
                }`}
              >
                Terms & Conditions
              </button>
            </div>

            <div>
              {!agreedToTerms ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="block">
                        <button
                          type="submit"
                          disabled
                          aria-disabled="true"
                          className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-[#007399] opacity-60 cursor-not-allowed"
                        >
                          Sign in
                        </button>
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Please agree to Terms &amp; Conditions first.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <LoadingSpinner />
                      Signing in…
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-3 flex-shrink-0 text-sm text-gray-500">
                Don&apos;t have an account?
              </span>
              <div className="flex-grow border-t border-gray-300" />
            </div>
            <div className="mt-4">
              <Link
                href="/register"
                className="w-full flex justify-center py-2 px-4 border border-gray-200 rounded-md shadow-sm text-sm font-medium text-[#007399] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-colors"
              >
                Create new account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showTerms && <ShowTerms toggleTerms={() => setShowTerms(false)} />}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center">
          <img src="/image-000.png" alt="Accufin Logo" className="h-24 w-auto mb-8" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007399]" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}