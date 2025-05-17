"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      console.log("Login data", formData);
      setIsLoading(false);
    }, 1500);
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
