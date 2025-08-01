"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { User, Mail, Calendar, Shield, Edit2, Save, X } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";

export default function ProfileCard() {
  const { currentUser, getUserName, logout, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const getDisplayName = () => {
    const username = getUserName(currentUser?.uid);
    if (username) return username;
    if (currentUser?.displayName) return currentUser.displayName;
    return currentUser?.email?.split("@")[0] || "User";
  };

  useEffect(() => {
    if (!isEditing && currentUser) {
      setDisplayName(getDisplayName());
    }
  }, [currentUser, isEditing]);

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
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setDisplayName("");
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim(),
      });

      if (currentUser?.uid) {
        try {
          await updateDoc(doc(db, "users", currentUser.uid), {
            displayName: displayName.trim(),
            updatedAt: new Date(),
          });
        } catch (firestoreError) {
          console.error(
            "Error updating Firestore user document:",
            firestoreError
          );
        }
      }
      localStorage.setItem(`username_${currentUser.uid}`, displayName.trim());

      if (typeof refreshUserData === "function") {
        await refreshUserData();
      } else {
        await auth.currentUser.reload();

        const event = new CustomEvent("userDisplayNameChanged", {
          detail: { uid: currentUser.uid, name: displayName.trim() },
        });
        window.dispatchEvent(event);
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="bg-[var(--tw-subbackground)] flex flex-col justify-between rounded-lg p-4 sm:p-6 dashboard-card">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--tw-text)] mb-3 sm:mb-0">
            Profile
          </h2>
          <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  onClick={handleEditStart}
                  className="cursor-pointer flex items-center gap-2 px-5 sm:px-7 py-1.5 text-sm bg-[var(--tw-focus)] text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="cursor-pointer flex items-center gap-2 px-4 sm:px-5 py-1.5 text-sm bg-[var(--tw-green)] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
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
                    className="cursor-pointer flex items-center gap-2 px-4 sm:px-5 py-1.5 text-sm border border-[var(--tw-border)] text-[var(--tw-text)] rounded-lg hover:bg-[var(--tw-field)] transition-colors"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <User className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Display Name
              </span>
            </div>
            <div className="flex items-center gap-2 ml-8 sm:ml-0">
              {isEditing ? (
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-[var(--tw-field)] border border-[var(--tw-border)] rounded text-[var(--tw-text)] text-sm focus:outline-none focus:border-[var(--tw-focus)]"
                  autoFocus
                />
              ) : (
                <span className="text-[var(--tw-text)] font-medium break-words">
                  {getDisplayName()}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <Mail className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Email Address
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm ml-8 sm:ml-0 break-words">
              {currentUser?.email}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <Calendar className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Member Since
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm ml-8 sm:ml-0">
              {formatDate(currentUser?.metadata?.creationTime)}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-[var(--tw-border)]">
            <div className="flex items-center gap-3 mb-2 sm:mb-0">
              <Shield className="h-4 w-4 text-[var(--tw-text)] opacity-70" />
              <span className="text-[var(--tw-text)] opacity-70">
                Sign-in Method
              </span>
            </div>
            <span className="text-[var(--tw-text)] font-medium text-sm ml-8 sm:ml-0">
              {getProviderName()}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={logout}
          className="cursor-pointer text-[var(--tw-text)] w-full px-4 py-2 border border-[var(--tw-focus)] rounded-lg hover:bg-[var(--tw-field)] transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
