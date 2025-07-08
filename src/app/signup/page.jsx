"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Mail, Lock, User, Eye, EyeOff, Github } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { AlertCircle } from "lucide-react";
import { auth, getRedirectResult, googleProvider } from "@/lib/firebase";
import {
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signInWithPopup,
} from "firebase/auth";

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
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [authError, setAuthError] = useState("");
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(true);
  const { signup, signInWithGoogle, signInWithGithub, isMobile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    async function checkRedirectResult() {
      try {
        const pendingRedirect = localStorage.getItem("authRedirectPending");

        if (pendingRedirect) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        const result = await getRedirectResult(auth);

        if (result?.user) {
          localStorage.removeItem("authRedirectPending");
          router.push("/");
          return;
        }

        if (pendingRedirect) {
          await new Promise((resolve) => setTimeout(resolve, 500));

          const currentUser = auth.currentUser;

          if (currentUser) {
            localStorage.removeItem("authRedirectPending");
            router.push("/");
            return;
          } else {
            await auth.authStateReady();

            const refreshedUser = auth.currentUser;
            if (refreshedUser) {
              localStorage.removeItem("authRedirectPending");
              router.push("/");
              return;
            }

            const startTime = parseInt(
              localStorage.getItem("redirectStartTime") || "0"
            );
            if (startTime && Date.now() - startTime > 5 * 60 * 1000) {
              localStorage.removeItem("authRedirectPending");
              localStorage.removeItem("redirectStartTime");
              setAuthError("Authentication timeout. Please try again.");
            }
          }
        }
      } catch (error) {
        setAuthError(`Authentication error: ${error.message}`);
        localStorage.removeItem("authRedirectPending");
      } finally {
        if (!localStorage.getItem("authRedirectPending")) {
          setIsCheckingRedirect(false);
        }
      }
    }

    checkRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const pendingRedirect = localStorage.getItem("authRedirectPending");
        if (pendingRedirect) {
          localStorage.removeItem("authRedirectPending");
          localStorage.removeItem("redirectStartTime");
          router.push("/");
        }
      }
    });

    return () => {
      unsubscribe();
      localStorage.removeItem("authRedirectPending");
      localStorage.removeItem("redirectStartTime");
    };
  }, [router]);

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
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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
      await signup(formData.email, formData.password, formData.username);
      router.push("/");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setAuthError("Email is already in use");
      } else if (error.code === "auth/invalid-email") {
        setAuthError("Email address is invalid");
      } else if (error.code === "auth/weak-password") {
        setAuthError("Password is too weak");
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
      if (isMobile) {
        try {
          const result = await signInWithPopup(auth, googleProvider);
          if (result) {
            router.push("/");
            return;
          }
        } catch (popupError) {
          localStorage.setItem("authRedirectPending", "google");
          localStorage.setItem("redirectStartTime", Date.now().toString());

          await setPersistence(auth, browserLocalPersistence);
          await signInWithGoogle();
        }
      } else {
        await signInWithGoogle();
        router.push("/");
      }
    } catch (error) {
      setAuthError(`Authentication error: ${error.message}`);
      setIsGoogleLoading(false);
    } finally {
      if (!isMobile) {
        setIsGoogleLoading(false);
      }
    }
  };

  const handleGithubSignIn = async () => {
    setIsGithubLoading(true);
    setAuthError("");
    try {
      if (isMobile) {
        localStorage.setItem("authRedirectPending", "github");
        localStorage.setItem("redirectStartTime", Date.now().toString());
        await setPersistence(auth, browserLocalPersistence);
        await signInWithGithub();
      } else {
        await signInWithGithub();
        router.push("/");
      }
    } catch (error) {
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
      setIsGithubLoading(false);
    } finally {
      if (!isMobile) {
        setIsGithubLoading(false);
      }
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

  useEffect(() => {
    const pendingRedirect = localStorage.getItem("authRedirectPending");

    if (!pendingRedirect) {
      setIsCheckingRedirect(false);
    }
  }, []);

  if (isCheckingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 mx-auto mb-4 text-[var(--tw-focus)]" />
          <p className="text-[var(--tw-text)] opacity-80">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-8 sm:py-20 min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-md mx-auto bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm rounded-xl p-6 sm:p-8 shadow-xl">
          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-center text-[var(--tw-text)]">
            Create Your Account
          </h1>
          <p className="text-[var(--tw-text)] opacity-80 text-center text-sm sm:text-base mb-5 sm:mb-6">
            Join TripWeaver to plan your next adventure
          </p>

          {authError && (
            <div className="mb-5 sm:mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-sm">{authError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block mb-1.5 sm:mb-2 text-sm font-medium text-[var(--tw-text)]"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.username
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)] text-base`}
                  placeholder="Choose a username"
                  autoComplete="username"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">
                  {errors.username}
                </p>
              )}
            </div>

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
                  name="email"
                  value={formData.email}
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

            <div>
              <label
                htmlFor="password"
                className="block mb-1.5 sm:mb-2 text-sm font-medium text-[var(--tw-text)]"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.password
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)] text-base`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">
                  {errors.password}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block mb-1.5 sm:mb-2 text-sm font-medium text-[var(--tw-text)]"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-1.5 focus:border-[var(--tw-text)] placeholder-custom bg-[var(--tw-field)] border ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-[var(--tw-border)]"
                  } text-[var(--tw-text)] text-base`}
                  placeholder="••••••••"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="cursor-pointer absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-[var(--tw-text)] opacity-70" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-red-500 text-xs sm:text-sm">
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
                <div className="ml-3 text-xs sm:text-sm">
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
                <p className="mt-1 text-red-500 text-xs sm:text-sm">
                  {errors.agreeToTerms}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="cursor-pointer w-full py-2.5 px-6 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-[var(--tw-focus)] text-white flex items-center justify-center mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[var(--tw-border)]"></div>
            </div>
            <div className="relative flex justify-center text-xs sm:text-sm">
              <span className="bg-[var(--tw-subbackground)] px-2 text-[var(--tw-text)] opacity-70">
                Or continue with
              </span>
            </div>
          </div>
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isGithubLoading}
              className="cursor-pointer w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 hover:opacity-90 bg-white text-gray-700 border border-gray-300 flex items-center justify-center gap-2"
            >
              {isGoogleLoading ? (
                <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24">
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
              <span className="text-sm sm:text-base">
                {isGoogleLoading && isMobile
                  ? "Redirecting..."
                  : "Sign up with Google"}
              </span>
            </button>

            <button
              type="button"
              onClick={handleGithubSignIn}
              disabled={isGithubLoading || isGoogleLoading}
              className="cursor-pointer w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-300 hover:opacity-80 bg-gray-800 text-white flex items-center justify-center gap-2"
            >
              {isGithubLoading ? (
                <Loader2 className="animate-spin h-4 w-4 sm:h-5 sm:w-5" />
              ) : (
                <Github className="h-4 w-4 sm:h-5 sm:w-5" />
              )}
              <span className="text-sm sm:text-base">
                {isGithubLoading && isMobile
                  ? "Redirecting..."
                  : "Sign up with GitHub"}
              </span>
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--tw-text)]">
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
