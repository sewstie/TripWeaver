"use client";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { User } from "lucide-react";

export default function Header() {
  const { currentUser, getUserName, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const scrollToNextSection = () => {
    const viewportHeight = window.innerHeight;
    window.scrollTo({
      top: viewportHeight,
      behavior: "smooth",
    });
  };

  const handleExploreClick = () => {
    if (pathname === "/") {
      scrollToNextSection();
    } else {
      router.push("/");
    }
  };

  const getDisplayName = () => {
    if (!currentUser) return null;
    const username = getUserName(currentUser.uid);
    if (username) return username;
    if (currentUser.displayName) return currentUser.displayName;
    return currentUser.email?.split("@")[0];
  };

  return (
    <header
      className="absolute top-0 left-0 right-0 z-50 py-4"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold z-10 text-[var(--tw-text)]"
        >
          TripWeaver
        </Link>
        <div className="flex items-center gap-2">
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
                className="cursor-pointer px-5 py-2 rounded-full border border-[var(--tw-focus)] text-[var(--tw-text)] transition-all duration-300 hover:bg-opacity-20 z-10 "
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
      </div>
    </header>
  );
}
