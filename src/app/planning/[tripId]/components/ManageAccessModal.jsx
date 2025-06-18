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
import Confirmation from "@/app/components/Confirmation";

export default function ManageAccessModal({ trip, onClose }) {
  const { currentUser } = useAuth();
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("editor");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [collaboratorDetails, setCollaboratorDetails] = useState([]);
  const [loadingCollaborators, setLoadingCollaborators] = useState(true);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    userId: null,
    userName: "",
  });

  useEffect(() => {
    const fetchCollaboratorDetails = async () => {
      if (!trip?.collaborators) return;

      try {
        const collaborators = Object.entries(trip.collaborators);
        const collaboratorPromises = collaborators.map(async ([userId, role]) => {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", userId)
          );
          const userSnapshot = await getDocs(userQuery);
          
          if (!userSnapshot.empty) {
            const userData = userSnapshot.docs[0].data();
            return {
              uid: userId,
              role,
              email: userData.email,
              displayName: userData.displayName || userData.email,
            };
          }
          return null;
        });

        const collaboratorData = await Promise.all(collaboratorPromises);
        setCollaboratorDetails(collaboratorData.filter(Boolean));
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
    if (!email.trim()) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const userQuery = query(
        collection(db, "users"),
        where("email", "==", email.trim().toLowerCase())
      );
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        setMessage("No user found with this email address.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      const userData = userSnapshot.docs[0].data();
      const userId = userData.uid;

      if (trip.collaborators && trip.collaborators[userId]) {
        setMessage("User is already a collaborator on this trip.");
        setMessageType("error");
        setIsSubmitting(false);
        return;
      }

      await updateDoc(doc(db, "trips", trip.id), {
        [`collaborators.${userId}`]: selectedRole,
        updatedAt: new Date(),
      });

      setEmail("");
      setMessage(`Invitation sent to ${userData.email}!`);
      setMessageType("success");

      setCollaboratorDetails((prev) => [
        ...prev,
        {
          uid: userId,
          role: selectedRole,
          email: userData.email,
          displayName: userData.displayName || userData.email,
        },
      ]);

      setTimeout(() => {
        setMessage("");
        setMessageType("");
      }, 3000);
    } catch (error) {
      setMessage("Failed to invite user. Please try again.");
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

      setMessage("Role updated successfully");
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
    setConfirmModal({
      isOpen: true,
      userId,
      userName,
    });
  };

  const confirmRemoveCollaborator = async () => {
    const { userId, userName } = confirmModal;
    setConfirmModal({ isOpen: false, userId: null, userName: "" });

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
        return <Users className="w-4 h-4 text-blue-500" />;
      case "viewer":
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return <Users className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleDisplayName = (role) => {
    switch (role) {
      case "owner":
        return "Owner";
      case "editor":
        return "Editor";
      case "viewer":
        return "Viewer";
      default:
        return "Unknown";
    }
  };

  const isOwner = trip.collaborators?.[currentUser?.uid] === "owner";

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black opacity-40 backdrop-blur-sm"></div>
        <div className="relative bg-[var(--tw-subbackground)] rounded-lg p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-[var(--tw-text)]">
              Manage Trip Access
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[var(--tw-field)] rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-[var(--tw-text)]" />
            </button>
          </div>

          {isOwner && (
            <form onSubmit={handleInvite} className="mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter email address..."
                    className="w-full bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)]"
                    required
                  />
                </div>
                <div className="relative">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="bg-[var(--tw-field)] border border-[var(--tw-field)] rounded-lg px-3 py-2 text-[var(--tw-text)] focus:outline-none focus:ring-2 focus:ring-[var(--tw-focus)] appearance-none pr-8"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[var(--tw-text)] opacity-60 pointer-events-none" />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="cursor-pointer bg-[var(--tw-focus)] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isSubmitting ? "Inviting..." : "Invite"}
                </button>
              </div>
            </form>
          )}

          {message && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {messageType === "success" && (
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
              )}
              <span className="text-sm">{message}</span>
            </div>
          )}

          <div>
            <h4 className="text-lg font-semibold text-[var(--tw-text)] mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Collaborators ({collaboratorDetails.length})
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
                    className="flex items-center justify-between bg-[var(--tw-field)] rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getRoleIcon(collaborator.role)}
                        <div>
                          <div className="font-medium text-[var(--tw-text)]">
                            {collaborator.displayName}
                            {collaborator.uid === currentUser?.uid && (
                              <span className="text-sm text-[var(--tw-text)] opacity-60 ml-1">
                                (You)
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-[var(--tw-text)] opacity-70">
                            {collaborator.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isOwner && collaborator.uid !== currentUser?.uid ? (
                        <>
                          <div className="relative">
                            <select
                              value={collaborator.role}
                              onChange={(e) =>
                                handleRoleChange(collaborator.uid, e.target.value)
                              }
                              className="bg-[var(--tw-subbackground)] border border-[var(--tw-border)] rounded px-2 py-1 text-sm text-[var(--tw-text)] focus:outline-none focus:ring-1 focus:ring-[var(--tw-focus)] appearance-none pr-6"
                            >
                              <option value="editor">Editor</option>
                              <option value="viewer">Viewer</option>
                            </select>
                            <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-[var(--tw-text)] opacity-60 pointer-events-none" />
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveCollaborator(
                                collaborator.uid,
                                collaborator.displayName
                              )
                            }
                            className="cursor-pointer p-1"
                            title="Remove access"
                          >
                            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-400 transition-all duration-75" />
                          </button>
                        </>
                      ) : (
                        <span className="px-2 py-1 text-sm bg-[var(--tw-subbackground)] text-[var(--tw-text)] rounded">
                          {getRoleDisplayName(collaborator.role)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[var(--tw-field)]">
            <div className="text-sm text-[var(--tw-text)] opacity-70 space-y-1">
              <p>
                <strong>Owner:</strong> Full control - can edit trip details,
                manage collaborators, and delete the trip
              </p>
              <p>
                <strong>Editor:</strong> Can view and edit trip itinerary items
              </p>
              <p>
                <strong>Viewer:</strong> Can only view the trip - no editing
                permissions
              </p>
            </div>
          </div>
        </div>
      </div>

      <Confirmation
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, userId: null, userName: "" })}
        onConfirm={confirmRemoveCollaborator}
        title="Remove Collaborator"
        message={`Are you sure you want to remove ${confirmModal.userName} from this trip? They will lose access to view and edit this trip.`}
        confirmText="Remove"
        cancelText="Cancel"
        type="danger"
      />
    </>
  );
}
