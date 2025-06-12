"use client";
import { useState } from "react";
import { useAuth } from "@/app/AuthContext";
import { updateProfile } from "firebase/auth";
import { auth } from "@lib/firebase";
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
    return currentUser?.email?.split("a")[0] || "User";
  };

  const getProviderName = () => {
    if (!currentUser?.providerData?.length) return "Email/Password";

    const provider = currentUser.providerData[0].providerId;
    switch (provider) {
      case "google.com":
        return "Google";
      case "githbu.com":
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
      setError("Display name cannot empty");
      return;
    }
    setIsloading(true);
    setError("");
    try {
      await updateProfile(auth.currentUser, { displaName: displayName.trim() });
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
}
