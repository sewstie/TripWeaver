"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setEmail(e.target.value);

    if (errors.email) {
      setErrors({});
    }

    if (message) {
      setMessage("");
      setMessageType("");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setMessage("");
    setMessageType("");

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Please check your inbox.");
      setMessageType("success");
      setEmail("");
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        setMessage("No account exists with this email address.");
      } else if (error.code === "auth/too-many-requests") {
        setMessage("Too many requests. Please try again later.");
      } else if (error.code === "auth/invalid-email") {
        setMessage("Invalid email address. Please check and try again.");
      } else {
        setMessage("An unexpected error occurred. Please try again.");
      }
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const metaViewport = document.querySelector("meta[name=viewport]");
    if (!metaViewport) {
      const meta = document.createElement("meta");
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1, maximum-scale=1";
      document.head.appendChild(meta);
    } else {
      metaViewport.content =
        "width=device-width, initial-scale=1, maximum-scale=1";
    }

    return () => {
      if (metaViewport) {
        metaViewport.content = "width=device-width, initial-scale=1";
      }
    };
  }, []);

  return (
    <section className="py-8 sm:py-20 min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-center text-[var(--tw-text)]">
            Reset Your Password
          </h1>
          <p className="text-[var(--tw-text)] opacity-80 text-center text-sm sm:text-base mb-5 sm:mb-6">
            Enter your email to receive a password reset link
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block mb-1.5 sm:mb-2 text-sm font-medium text-[var(--tw-text)]"
              >
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.email
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)] text-base`}
                  placeholder="your@email.com"
                  autoComplete="email"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">
                  {errors.email}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full py-2.5 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>

            <div className="min-h-[20px] text-center text-sm transition-opacity duration-300">
              {message ? (
                <p
                  className={`${
                    messageType === "error" ? "text-red-500" : "text-green-500"
                  } font-medium`}
                >
                  {message}
                </p>
              ) : (
                <p className="opacity-0">Status message placeholder</p>
              )}
            </div>
          </form>

          <div className="mt-2 text-center">
            <Link
              href="/login"
              className="text-[var(--tw-focus)] font-medium hover:opacity-80 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
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
