"use client";
import { useAuth } from "@/app/AuthContext";
import { useRouter } from "next/nagivation";
import { useEffect } from "react";
import ProfileCard from "../components/account/ProfileCard";

export default function AccountPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !currentUser) {
      router.push("/login");
    }
  }, [currentUser.loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--tw-background)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--tw-focus)]"></div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--tw-background)] pt-20 pb-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--tw-text)] mb-2">
            Account Settings
          </h1>
          <p className="text-[var(--tw-text)] opacity-70">
            Manage ypur profile information and account preferences.
          </p>
        </div>
        <div className="grid gap-6">
          <ProfileCard />
        </div>
      </div>
    </div>
  );
}
