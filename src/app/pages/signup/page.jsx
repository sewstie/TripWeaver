"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Loader2,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";

export default function Signup() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
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

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    setTimeout(() => {
      console.log("Signup data:", formData);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section className="py-20 min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
      <div className="container mx-auto px-6">
        <div className="max-w-md mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-8 shadow-xl">
          <h1 className="text-3xl font-bold mb-6 text-center text-[var(--tw-text)]">
            Join <span className="text-[var(--tw-focus)]">TripWeaver</span>
          </h1>

          <p className="text-[var(--tw-text)] opacity-80 text-center mb-8">
            Create an account to start your journey with us
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block mb-2 font-medium text-[var(--tw-text)]"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.username
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)]`}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-red-500 text-sm">{errors.username}</p>
              )}
            </div>

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
                  autoComplete="none"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-2 font-medium text-[var(--tw-text)]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <CheckCircle className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)]`}
                  placeholder="••••••••"
                  autoComplete="none"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                  ) : (
                    <Eye className="h-5 w-5 text-[var(--tw-text)] opacity-70" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleChange}
                    className={`h-4 w-4 rounded border-[var(--tw-border)] text-[var(--tw-focus)] ${
                      errors.agreeToTerms ? "border-red-500" : ""
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label
                    htmlFor="agreeToTerms"
                    className="text-[var(--tw-text)]"
                  >
                    I agree to the{" "}
                    <Link
                      href="#"
                      className="text-[var(--tw-focus)] hover:opacity-80"
                    >
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="#"
                      className="text-[var(--tw-focus)] hover:opacity-80"
                    >
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="mt-1 text-red-500 text-sm">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[var(--tw-text)]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-[var(--tw-focus)] font-medium hover:opacity-80"
              >
                Sign in
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
