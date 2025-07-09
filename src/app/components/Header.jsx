"use client";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { User, Menu, X, Home } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const { currentUser, getUserName, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      window.removeEventListener("resize", checkMobile);
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const scrollToNextSection = () => {
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: viewportHeight,
      behavior: "smooth",
    });
    setMobileMenuOpen(false);
  };

  const handleExploreClick = () => {
    if (pathname === "/") {
      scrollToNextSection();
    } else {
      router.push("/");
    }
    setMobileMenuOpen(false);
  };

  const getDisplayName = () => {
    if (!currentUser) return null;
    const username = getUserName(currentUser.uid);
    if (username) return username;
    if (currentUser.displayName) return currentUser.displayName;
    return currentUser.email?.split("@")[0];
  };

  const handleLogout = () => {
    setMobileMenuOpen(false);
    logout();
  };

  const handleLogoClick = (e) => {
    if (isMobile) {
      e.preventDefault();
    }
  };

  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 py-4"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center">
        {isMobile ? (
          <span className="text-xl sm:text-2xl font-bold z-10 text-[var(--tw-text)]">
            TripWeaver
          </span>
        ) : (
          <Link
            href="/"
            className="text-xl sm:text-2xl font-bold z-10 text-[var(--tw-text)]"
            onClick={handleLogoClick}
          >
            TripWeaver
          </Link>
        )}

        <div className="hidden md:flex items-center gap-2">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <Link
                href="/account"
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
              >
                <span className="text-[var(--tw-text)] text-sm font-medium">
                  {getDisplayName()}
                </span>
                <User className="h-4 w-4 text-[var(--tw-text)]" />
              </Link>
              <button
                className="cursor-pointer px-5 py-2 rounded-full border border-[var(--tw-focus)] text-[var(--tw-text)] transition-all duration-300 hover:bg-opacity-20 z-10"
                onClick={logout}
                style={{ backgroundColor: "transparent" }}
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full text-[var(--tw-text)] z-10"
              >
                Login
              </Link>
              <button
                onClick={handleExploreClick}
                className="cursor-pointer px-5 py-2 rounded-full border border-[var(--tw-focus)] text-[var(--tw-text)] transition-all duration-300 hover:bg-opacity-20 z-10"
                style={{ backgroundColor: "transparent" }}
              >
                Explore
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden z-10 p-2 rounded-full bg-[var(--tw-subbackground)] bg-opacity-20 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5 text-[var(--tw-text)]" />
          ) : (
            <Menu className="h-5 w-5 text-[var(--tw-text)]" />
          )}
        </button>

        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-[var(--tw-background)] z-40 md:hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-[var(--tw-border)] border-opacity-20">
              <span className="text-xl font-bold text-[var(--tw-text)]">
                TripWeaver
              </span>
              <button onClick={() => setMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-[var(--tw-text)]" />
              </button>
            </div>

            <div className="flex-1 flex flex-col p-6 overflow-y-auto">
              {currentUser ? (
                <>
                  <div className="flex items-center gap-3 p-4 mb-6 bg-[var(--tw-subbackground)] rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-[var(--tw-field)] flex items-center justify-center">
                      <User className="h-6 w-6 text-[var(--tw-focus)]" />
                    </div>
                    <div>
                      <p className="font-medium text-[var(--tw-text)]">
                        {getDisplayName()}
                      </p>
                      <p className="text-sm text-[var(--tw-text)] opacity-70">
                        {currentUser.email}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <Link
                      href="/"
                      className="flex flex-col items-center gap-3 py-5 px-4 text-[var(--tw-text)] font-medium rounded-xl bg-[var(--tw-subbackground)] hover:bg-opacity-80 transition shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                        <Home
                          className="h-6 w-6 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span>Home</span>
                    </Link>

                    <Link
                      href="/account"
                      className="flex flex-col items-center gap-3 py-5 px-4 text-[var(--tw-text)] font-medium rounded-xl bg-[var(--tw-subbackground)] hover:bg-opacity-80 transition shadow-sm"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md">
                        <User
                          className="h-6 w-6 text-white"
                          strokeWidth={2.5}
                        />
                      </div>
                      <span>My Account</span>
                    </Link>
                  </div>

                  <div className="mt-auto">
                    <button
                      className="w-full py-3.5 px-4 rounded-xl bg-[var(--tw-focus)] text-white font-medium"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-4 mt-6">
                    <Link
                      href="/login"
                      className="block w-full py-3 text-center rounded-lg bg-[var(--tw-focus)] text-white font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className="block w-full py-3 text-center rounded-lg border border-[var(--tw-focus)] text-[var(--tw-text)] font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                    <button
                      onClick={handleExploreClick}
                      className="block w-full py-3 text-center rounded-lg bg-[var(--tw-subbackground)] text-[var(--tw-text)] font-medium mt-4"
                    >
                      Explore
                    </button>
                  </div>

                  <div className="mt-auto pt-6 border-t border-[var(--tw-border)] border-opacity-20">
                    <p className="text-sm text-center text-[var(--tw-text)] opacity-70">
                      Create an account to plan your travels with TripWeaver
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
