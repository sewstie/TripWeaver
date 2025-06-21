"use client";
import TripHeader from "../TripHeader";
import EditTripModal from "../EditTripModal";
import ManageAccessModal from "../ManageAccessModal";
import { Construction, MapPin } from "lucide-react";

export default function AdvancedTripLayout({
  trip,
  tripId,
  userRole,
  canEdit,
  onEdit,
  onManageAccess,
  onDelete,
  isEditModalOpen,
  onCloseEditModal,
  onTripUpdate,
  isManageAccessModalOpen,
  onCloseManageAccessModal,
}) {
  return (
    <div className="space-y-6">
      <TripHeader
        trip={trip}
        onEdit={onEdit}
        onManageAccess={onManageAccess}
        onDelete={onDelete}
      />

      <div className="bg-[var(--tw-subbackground)] rounded-lg p-12 text-center">
        <Construction className="w-16 h-16 text-[var(--tw-focus)] mx-auto mb-6" />

        <h2 className="text-3xl font-bold text-[var(--tw-text)] mb-4">
          Advanced Trip Planning
        </h2>

        <h3 className="text-xl font-semibold text-[var(--tw-text)] mb-4">
          Work in Progress
        </h3>

        <p className="text-[var(--tw-text)] opacity-70 mb-6 max-w-md mx-auto">
          We're building an amazing multi-city trip planning experience. Check
          back soon for the ability to plan complex journeys with multiple
          destinations!
        </p>

        <div className="bg-[var(--tw-field)] rounded-lg p-4 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 text-[var(--tw-text)] opacity-80">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {trip?.arrivalCity?.formatted?.split(",")[0]}
              {trip?.isRoundTrip
                ? " (Advanced Trip)"
                : ` → ${trip?.departureCity?.formatted?.split(",")[0]}`}
            </span>
          </div>
        </div>
      </div>

      {isEditModalOpen && canEdit && (
        <EditTripModal
          trip={trip}
          onClose={onCloseEditModal}
          onUpdate={onTripUpdate}
        />
      )}

      {isManageAccessModalOpen && (
        <ManageAccessModal trip={trip} onClose={onCloseManageAccessModal} />
      )}
    </div>
  );
}
