"use client";
import { useState, useEffect } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteField,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/AuthContext";
import {
  X,
  Mail,
  UserPlus,
  CheckCircle,
  Crown,
  Users,
  ChevronDown,
  Trash2,
} from "lucide-react";

export default function ManageAccessModal({ trip, onClose }) {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [collaboratorDetails, setCollaboratorDetails] = useState([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);

  useEffect(() => {
    const fetchCollaboratorDetails = async () => {
      if (!trip?.collaborators) {
        setLoadingCollaborators(false);
        return;
      }

      try {
        const collaboratorIds = Object.keys(trip.collaborators);
        const collaboratorData = [];

        for (const userId of collaboratorIds) {
          const userDoc = await getDoc(doc(db, "users", userId));
          if (userDoc.exists()) {
            collaboratorData.push({
              uid: userId,
              role: trip.collaborators[userId],
              ...userDoc.data(),
            });
          }
        }

        collaboratorData.sort((a, b) => {
          if (a.role === "owner") return -1;
          if (b.role === "owner") return 1;
          return a.displayName?.localeCompare(b.displayName) || 0;
        });

        setCollaboratorDetails(collaboratorData);
      } catch (error) {
        console.error("Error fetching collaborator details:", error);
      } finally {
        setLoadingCollaborators(false);
      }
    };

    fetchCollaboratorDetails();
  }, [trip]);

  const handleInvite = async (e) => {
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
      const searchEmail = email.trim().toLowerCase();

      const usersQuery = query(
        collection(db, "users"),
        where("email", "==", searchEmail)
      );

      const querySnapshot = await getDocs(usersQuery);

      if (querySnapshot.empty) {
        setMessage(
          "User not found. Please ask your friend to sign up for TripWeaver first."
        );
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userId = userDoc.id;

      if (trip.collaborators?.[userId]) {
        setMessage("This user is already a collaborator on this trip.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const tripRef = doc(db, "trips", trip.id);
      await updateDoc(tripRef, {
        [`collaborators.${userId}`]: selectedRole,
        updatedAt: new Date(),
      });

      setMessage(`Successfully invited ${email} as ${selectedRole}!`);
      setMessageType("success");
      setEmail("");

      const newCollaborator = {
        uid: userId,
        role: selectedRole,
        ...userDoc.data(),
      };
      setCollaboratorDetails((prev) => [...prev, newCollaborator]);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      console.error("Invitation error:", error);
      setMessage(`Failed to invite collaborator: ${error.message}`);
      setMessageType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateDoc(doc(db, "trips", trip.id), {
        [`collaborators.${userId}`]: newRole,
        updatedAt: new Date(),
      });

      setCollaboratorDetails((prev) =>
        prev.map((collab) =>
          collab.uid === userId ? { ...collab, role: newRole } : collab
        )
      );

      setMessage(`Role updated successfully`);
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    } catch (error) {
      setMessage("Failed to update role. Please try again.");
      setMessageType("error");
    }
  };

  const handleRemoveCollaborator = async (userId, userName) => {
    if (!confirm(`Remove ${userName} from this trip?`)) return;

    try {
      await updateDoc(doc(db, "trips", trip.id), {
        [`collaborators.${userId}`]: deleteField(),
        updatedAt: new Date(),
      });

      setCollaboratorDetails((prev) =>
        prev.filter((collab) => collab.uid !== userId)
      );

      setMessage(`${userName} removed from trip`);
      setMessageType("success");
      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 2000);
    } catch (error) {
      setMessage("Failed to remove collaborator. Please try again.");
      setMessageType("error");
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "owner":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "editor":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "viewer":
        return <Users className="w-4 h-4 text-gray-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "editor":
        return "Can Edit";
      case "viewer":
        return "Can View";
      default:
        return "Unknown";
    }
  };

  const isOwner = trip.collaborators?.[currentUser?.uid] === "owner";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
      <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-[var(--tw-text)] flex items-center gap-2">
            <Users className="w-5 h-5" />
            Manage Access
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[var(--tw-text)]" />
          </button>
        </div>

        <div className="mb-6">
          <h4 className="text-lg font-semibold text-[var(--tw-text)] mb-3">
            People with access
          </h4>

          {loadingCollaborators ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--tw-focus)]"></div>
            </div>
          ) : (
            <div className="space-y-3">
              {collaboratorDetails.map((collaborator) => (
                <div
                  key={collaborator.uid}
                  className="flex items-center justify-between p-3 bg-[var(--tw-field)] rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--tw-focus)] rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {collaborator.displayName?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--tw-text)]">
                        {collaborator.displayName || "Unknown User"}
                        {collaborator.uid === currentUser?.uid && " (You)"}
                      </p>
                      <p className="text-sm text-[var(--tw-text)] opacity-60">
                        {collaborator.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {collaborator.role === "owner" ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg">
                        {getRoleIcon(collaborator.role)}
                        <span className="text-sm font-medium">Owner</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isOwner && (
                          <select
                            value={collaborator.role}
                            onChange={(e) =>
                              handleRoleChange(collaborator.uid, e.target.value)
                            }
                            className="bg-[var(--tw-subbackground)] border border-[var(--tw-field)] rounded px-2 py-1 text-sm text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                          >
                            <option value="editor">Can Edit</option>
                            <option value="viewer">Can View</option>
                          </select>
                        )}

                        {!isOwner && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--tw-subbackground)] rounded-lg">
                            {getRoleIcon(collaborator.role)}
                            <span className="text-sm">
                              {getRoleDisplayName(collaborator.role)}
                            </span>
                          </div>
                        )}

                        {isOwner && (
                          <button
                            onClick={() =>
                              handleRemoveCollaborator(
                                collaborator.uid,
                                collaborator.displayName
                              )
                            }
                            className="cursor-pointer p-1 hover:bg-red-100 rounded transition-colors"
                            title="Remove access"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {isOwner && (
          <>
            <div className="border-t border-[var(--tw-field)] pt-6">
              <h4 className="text-lg font-semibold text-[var(--tw-text)] mb-3">
                Invite new people
              </h4>
              <p className="text-[var(--tw-text)] opacity-70 text-sm mb-4">
                Invite others to collaborate on "{trip.name}" by entering their
                email address.
              </p>

              <form onSubmit={handleInvite} className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
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
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                    disabled={isSubmitting}
                  >
                    <option value="editor">Can Edit</option>
                    <option value="viewer">Can View</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || messageType === "success"}
                  className="cursor-pointer w-full bg-[var(--tw-focus)] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Inviting..." : "Send Invitation"}
                </button>
              </form>
            </div>
          </>
        )}

        {message && (
          <div
            className={`mt-4 p-3 rounded-lg flex items-center gap-2 ${
              messageType === "success"
                ? "bg-green-100 border border-green-300 text-green-800"
                : "bg-red-100 border border-red-300 text-red-800"
            }`}
          >
            {messageType === "success" && <CheckCircle className="w-4 h-4" />}
            <span className="text-sm">{message}</span>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="cursor-pointer bg-[var(--tw-field)] text-[var(--tw-text)] py-2 px-4 rounded-lg hover:bg-opacity-80 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
