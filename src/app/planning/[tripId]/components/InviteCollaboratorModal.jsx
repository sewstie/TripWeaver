"use client";
import { useState } from "react";
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { X, Mail, UserPlus, CheckCircle } from "lucide-react";

export default function InviteCollaboratorModal({ trip, onClose }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setMessage("Please enter an email address");
      setMessageType("error");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setMessage("Please enter a valid email address");
      setMessageType("error");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", email.trim().toLowerCase())
      );
      
      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        setMessage("User not found. Please ask your friend to sign up for TripWeaver first.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;

      if (trip.collaborators?.includes(userId)) {
        setMessage("This user is already a collaborator on this trip.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      await updateDoc(doc(db, "trips", trip.id), {
        collaborators: arrayUnion(userId),
        updatedAt: new Date()
      });

      setMessage(`Successfully invited ${email} as a collaborator!`);
      setMessageType("success");
      setEmail("");

      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error("Error inviting collaborator:", error);
      setMessage("Failed to invite collaborator. Please try again.");
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-[var(--tw-text)] flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Collaborator
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-[var(--tw-text)] opacity-70 text-sm mb-2">
            Invite others to collaborate on "{trip.name}" by entering their email address.
          </p>
          <p className="text-[var(--tw-text)] opacity-60 text-xs">
            They must already have a TripWeaver account to be added as a collaborator.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--tw-text)] mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--tw-text)] opacity-50" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg pl-10 pr-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                placeholder="friend@example.com"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              messageType === "success" 
                ? "bg-green-100 border border-green-300 text-green-800" 
                : "bg-red-100 border border-red-300 text-red-800"
            }`}>
              {messageType === "success" && <CheckCircle className="w-4 h-4" />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting || messageType === "success"}
              className="cursor-pointer flex-1 bg-[var(--tw-focus)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Inviting..." : "Send Invitation"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="cursor-pointer flex-1 bg-[var(--tw-field)] text-[var(--tw-text)] py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {trip.collaborators && trip.collaborators.length > 1 && (
          <div className="mt-4 pt-4 border-t border-[var(--tw-field)]">
            <p className="text-sm text-[var(--tw-text)] opacity-70">
              {trip.collaborators.length} collaborator{trip.collaborators.length > 1 ? 's' : ''} on this trip
            </p>
          </div>
        )}
      </div>
    </div>
  );
}