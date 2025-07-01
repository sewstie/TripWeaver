"use client";
import { useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { User, Mail, Calendar, Shield, Edit2, Save, X } from "lucide-react";

export default function ProfileCard() {
  const { currentUser, getUserName, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsloading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const getDisplayName = () => {
    const username = getUserName(currentUser?.uid);
    if (username) return username;
    if (currentUser?.displayName) return currentUser.displayName;
    return currentUser?.email?.split("@")[0] || "User";
  };

  const getProviderName = () => {
    if (!currentUser?.providerData?.length) return "Email/Password";

    const provider = currentUser.providerData[0].providerId;
    switch (provider) {
      case "google.com":
        return "Google";
      case "github.com":
        return "GitHub";
      case "password":
        return "Email/Password";
      default:
        return "Email/Password";
    }
  };

  const handleEditStart = () => {
    setDisplayName(getDisplayName());
    setIsEditing(true);
    setError("");
    setSuccess("");
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setDisplayName("");
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name cannot be empty");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });
      localStorage.setItem(`username_${currentUser.uid}`, displayName.trim());
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update profile. Please try again.");
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unkown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[var(--tw-subbackground)] flex flex-col justify-between rounded-lg p-6 dashboard-card">
      <div className="flex justify-between">
        <h2 className="text-2xl font-bold text-[var(--tw-text)] mb-6">
          Profile
        </h2>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={handleEditStart}
                className="cursor-pointer flex items-center gap-2 px-7 py-1.5 text-sm bg-[var(--tw-focus)] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="cursor-pointer flex items-center gap-2 px-5 py-1.5 text-sm bg-[var(--tw-green)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {!isLoading && "Save"}
                </button>
                <button
                  onClick={handleEditCancel}
                  className="cursor-pointer flex items-center justify-center w-8 h-8 bg-red-500 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
      <div>
        {error && (
          <div className="mb-4 p-3 bg-red-500 bg-opacity-10 border border-red-500 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-500 bg-opacity-10 border border-green-500 rounded-lg text-green-400 text-sm">
            {success}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Display Name
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="px-3 py-1 bg-[var(--tw-field)] border border-[var(--tw-border)] rounded text-[var(--tw-text)] text-sm focus:outline-none focus:border-[var(--tw-focus)]"
                />
              ) : (
                <span className="text-[var(--tw-text)] font-medium">
                  {getDisplayName()}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Email Address
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm">
              {currentUser?.email}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Member Since
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm">
              {formatDate(currentUser?.metadata?.creationTime)}
            </span>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3">
              <Shield className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Sign-in Method
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm">
              {getProviderName()}
            </span>
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={logout}
          className="cursor-pointer w-full px-4 py-2 border border-[var(--tw-focus)] rounded-lg font-semibold"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
