"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { AlertCircle } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const { login, signInWithGoogle, signInWithGithub } = useAuth();
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setAuthError("");
    try {
      await login(formData.email, formData.password);
      router.push("/");
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        setAuthError("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        setAuthError("Too many requests. Please try again later.");
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setAuthError("");
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Google sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setAuthError("Popup was blocked. Please allow popups and try again.");
      } else {
        setAuthError("Failed to sign in with Google. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    setAuthError("");
    try {
      await signInWithGithub();
      router.push("/");
    } catch (error) {
      console.error("GitHub sign-in error:", error);
      if (error.code === "auth/popup-closed-by-user") {
        setAuthError("Sign-in was cancelled.");
      } else if (error.code === "auth/popup-blocked") {
        setAuthError("Popup was blocked. Please allow popups and try again.");
      } else if (
        error.code === "auth/account-exists-with-different-credential"
      ) {
        setAuthError(
          "An account already exists with a different sign-in method."
        );
      } else {
        setAuthError("Failed to sign in with GitHub. Please try again.");
      }
    } finally {
      setIsGithubLoading(false);
    }
  };

  return (
    <section className="py-20 min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-[var(--tw-text)]">
            Welcome Back to{" "}
            <span className="text-[var(--tw-focus)]">TripWeaver</span>
          </h1>
          <p className="text-[var(--tw-text)] opacity-80 text-center mb-8">
            Sign in to access your travel plans and continue your journey
          </p>
          {authError && (
            <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}
          <div className="space-y-3 mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
              className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-white text-gray-700 border border-gray-300 flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <Loader2 className="anumate-spin h-5 w-5" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continue with Google
            </button>
            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={isGithubLoading}
              className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-gray-900 text-white flex items-center justify-center gap-2"
            >
              {isGithubLoading ? (
                <Loader2 className="animate-spin h-5 w-5" />
              ) : (
                <Github className="h-5 w-5" />
              )}
              Continue with Github
            </button>
          </div>
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--tw-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-[var(--tw-subbackground)] px-2 text-[var(--tw-text)] opacity-70">
                Or continue with email
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block mb-2 font-medium text-[var(--tw-text)]"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.email
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)]`}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-sm">{errors.email}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="password"
                className="block mb-2 font-medium text-[var(--tw-text)]"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.password
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)]`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">{errors.password}</p>
              )}
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  name="remember"
                  type="checkbox"
                  className="h-4 w-4 rounded border-[var(--tw-border)] text-[var(--tw-focus)]"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-[var(--tw-text)]"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                {" "}
                <Link
                  href="#"
                  className="font-medium text-[var(--tw-focus)] hover:opacity-80"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>
          <div className="mt-8 text-center">
            <p className="text-[var(--tw-text)]">
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-[var(--tw-focus)] font-medium hover:opacity-80"
              >
                Sign up now
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style jsx>{`
        .placeholder-custom::placeholder {
          color: var(--tw-text);
          opacity: 0.5;
        }
      `}</style>
    </section>
  );
}
