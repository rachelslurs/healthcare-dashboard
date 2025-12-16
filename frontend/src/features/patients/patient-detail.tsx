import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useParams, useNavigate } from "@tanstack/react-router";
import { PencilIcon, UserMinusIcon, EllipsisVerticalIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

import LoadingBrand from "@/components/feedback/loading-brand";
import QueryErrorDisplay from "@/components/errors/query-error-display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownButton,
  DropdownMenu,
  DropdownItem,
  DropdownLabel,
} from "@/components/ui/dropdown";
import {
  DescriptionList,
  DescriptionTerm,
  DescriptionDetails,
} from "@/components/ui/description-list";
import {
  Dialog,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogActions,
} from "@/components/ui/dialog";
import { getStatusColor } from "@/lib/badge-utils";
import { API_BASE_URL } from "@/lib/constants";
import { formatDate } from "@/lib/date-utils";
import { getErrorMessage } from "@/lib/error-utils";
import { toast } from "@/lib/toast";

import { getPatient, deletePatient } from "./api";
import Tags from "./tags";
import type { Patient } from "./types";

export default function PatientDetail() {
  const { patientId } = useParams({ strict: false });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: patient,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: () => {
      if (!patientId) {
        throw new Error('Patient ID is required');
      }
      return getPatient(patientId);
    },
    enabled: !!patientId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Mutation for deleting a patient
  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });

      toast({
        title: "Patient deleted",
      });

      // Navigate back to patients list after successful deletion
      navigate({ to: "/patients" });
    },
    onError: (err) => {
      const errorMessage = getErrorMessage(err, "Failed to delete patient");
      console.error("Failed to delete patient:", err);
      setDeleteDialogOpen(false);

      toast({
        title: "Failed to delete patient",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="p-2">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <LoadingBrand size="lg" className="text-violet-600" />
            <p className="text-sm text-gray-600">Loading patient information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2">
        <QueryErrorDisplay
          error={error instanceof Error ? error : new Error('Failed to load patient')}
          reset={() => refetch()}
          title="Failed to load patient"
          retryLabel="Try again"
        />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-2">
        <h1 className="text-2xl font-bold mb-4">Patient Detail</h1>
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  const handleEdit = () => {
    navigate({ to: `/patients/${patientId}/edit` });
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!patientId) return;
    deleteMutation.mutate(patientId);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  // Generate initials for avatar fallback
  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0).toUpperCase() || "";
    const last = lastName?.charAt(0).toUpperCase() || "";
    return `${first}${last}` || "?";
  };

  const photoUrl = patient.photoUrl
    ? `${API_BASE_URL}${patient.photoUrl.startsWith("/") ? patient.photoUrl : `/${patient.photoUrl}`}`
    : null;

  return (
    <div className="flex h-full min-h-0 flex-col -m-4 lg:-m-10">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-zinc-200 px-4 lg:px-10 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-4 min-w-0">
            {/* Patient Photo or Avatar */}
            <div className="shrink-0 relative">
              {photoUrl ? (
                <>
                  <img
                    src={photoUrl}
                    alt={`${patient.firstName} ${patient.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-2 border-neutral-200 shadow-sm"
                    onError={(e) => {
                      // Fallback to avatar if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      const avatar = target.nextElementSibling as HTMLElement;
                      if (avatar) avatar.style.display = "flex";
                    }}
                  />
                  <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-purple-100 to-purple-200 flex items-center justify-center text-purple-900 text-2xl font-medium font-serif tracking-wide shadow-sm hidden">
                    {getInitials(patient.firstName, patient.lastName)}
                  </div>
                </>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-200 via-purple-100 to-purple-200 flex items-center justify-center text-purple-900 text-2xl font-medium font-serif tracking-wide shadow-sm">
                  {getInitials(patient.firstName, patient.lastName)}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold mb-2 truncate">
                {patient.firstName} {patient.lastName}
              </h1>
              <div className="flex items-center gap-2">
                <Badge color={getStatusColor(patient.status)}>
                  {patient.status.charAt(0).toUpperCase() +
                    patient.status.slice(1)}
                </Badge>
                {patient.age && (
                  <span className="text-sm text-gray-600">
                    Age: {patient.age}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Desktop: Show buttons, Mobile: Show overflow menu */}
          <div className="hidden md:flex items-center gap-2">
            <Button outline onClick={handleDeleteClick} className="items-center">
              <UserMinusIcon data-slot="icon" />
              Delete
            </Button>
            <Button color="violet" onClick={handleEdit} className="items-center">
              <PencilIcon data-slot="icon" />
              Edit Patient
            </Button>
          </div>
          <div className="md:hidden">
            <Dropdown>
              <DropdownButton as={Button} outline className="items-center">
                <EllipsisVerticalIcon data-slot="icon" />
                <span className="sr-only">Actions</span>
              </DropdownButton>
              <DropdownMenu anchor="bottom end">
                <DropdownItem onClick={handleEdit}>
                  <PencilIcon data-slot="icon" />
                  <DropdownLabel>Edit Patient</DropdownLabel>
                </DropdownItem>
                <DropdownItem onClick={handleDeleteClick}>
                  <UserMinusIcon data-slot="icon" />
                  <DropdownLabel>Delete</DropdownLabel>
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-10 py-10">
        <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Basic Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
          <DescriptionList>
            <DescriptionTerm>Patient ID</DescriptionTerm>
            <DescriptionDetails className="truncate">{patient.id}</DescriptionDetails>

            <DescriptionTerm>Date of Birth</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {formatDate(patient.dateOfBirth)}
            </DescriptionDetails>

            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails className="truncate">{patient.email}</DescriptionDetails>

            <DescriptionTerm>Phone</DescriptionTerm>
            <DescriptionDetails className="truncate">{patient.phone}</DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Address */}
        {patient.address ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">Address</h2>
            <DescriptionList>
              <DescriptionTerm>Street</DescriptionTerm>
              <DescriptionDetails className="truncate">{patient.address.street}</DescriptionDetails>

              <DescriptionTerm>City</DescriptionTerm>
              <DescriptionDetails className="truncate">{patient.address.city}</DescriptionDetails>

              <DescriptionTerm>State</DescriptionTerm>
              <DescriptionDetails className="truncate">{patient.address.state}</DescriptionDetails>

              <DescriptionTerm>ZIP Code</DescriptionTerm>
              <DescriptionDetails className="truncate">{patient.address.zipCode}</DescriptionDetails>

              <DescriptionTerm>Country</DescriptionTerm>
              <DescriptionDetails className="truncate">{patient.address.country}</DescriptionDetails>
            </DescriptionList>
          </section>
        ) : null}

        {/* Emergency Contact */}
        {patient.emergencyContact ? (
          <section>
            <h2 className="text-lg font-semibold mb-4">Emergency Contact</h2>
            <DescriptionList>
              <DescriptionTerm>Name</DescriptionTerm>
              <DescriptionDetails className="truncate">
                {patient.emergencyContact.name}
              </DescriptionDetails>

              <DescriptionTerm>Relationship</DescriptionTerm>
              <DescriptionDetails className="truncate">
                {patient.emergencyContact.relationship}
              </DescriptionDetails>

              <DescriptionTerm>Phone</DescriptionTerm>
              <DescriptionDetails className="truncate">
                {patient.emergencyContact.phone}
              </DescriptionDetails>

              {patient.emergencyContact.email && (
                <>
                  <DescriptionTerm>Email</DescriptionTerm>
                  <DescriptionDetails className="truncate">
                    {patient.emergencyContact.email}
                  </DescriptionDetails>
                </>
              )}
            </DescriptionList>
          </section>
        ) : null}

        {/* Medical Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
          <DescriptionList>
            <DescriptionTerm>Blood Type</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {patient.medicalInfo.bloodType || "—"}
            </DescriptionDetails>

            <DescriptionTerm>Allergies</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.allergies.length > 0 ? (
                <Tags items={patient.medicalInfo.allergies} color="blue" />
              ) : (
                <span className="truncate block">None</span>
              )}
            </DescriptionDetails>

            <DescriptionTerm>Conditions</DescriptionTerm>
            <DescriptionDetails>
              {patient.medicalInfo.conditions.length > 0 ? (
                <Tags items={patient.medicalInfo.conditions} color="blue" />
              ) : (
                <span className="truncate block">None</span>
              )}
            </DescriptionDetails>

            <DescriptionTerm>Last Visit</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {formatDate(patient.medicalInfo.lastVisit)}
            </DescriptionDetails>
          </DescriptionList>
        </section>

        {/* Insurance Information */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Insurance Information</h2>
          <DescriptionList>
            <DescriptionTerm>Provider</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {patient.insurance.provider}
            </DescriptionDetails>

            <DescriptionTerm>Policy Number</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {patient.insurance.policyNumber}
            </DescriptionDetails>

            {patient.insurance.groupNumber && (
              <>
                <DescriptionTerm>Group Number</DescriptionTerm>
                <DescriptionDetails className="truncate">
                  {patient.insurance.groupNumber}
                </DescriptionDetails>
              </>
            )}

            <DescriptionTerm>Effective Date</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {formatDate(patient.insurance.effectiveDate) || "—"}
            </DescriptionDetails>

            {patient.insurance.expirationDate && (
              <>
                <DescriptionTerm>Expiration Date</DescriptionTerm>
                <DescriptionDetails className="truncate">
                  {formatDate(patient.insurance.expirationDate)}
                </DescriptionDetails>
              </>
            )}

            <DescriptionTerm>Copay</DescriptionTerm>
            <DescriptionDetails className="truncate">
              ${patient.insurance.copay.toFixed(2)}
            </DescriptionDetails>

            <DescriptionTerm>Deductible</DescriptionTerm>
            <DescriptionDetails className="truncate">
              {patient.insurance.deductible
                ? `$${patient.insurance.deductible.toFixed(2)}`
                : "—"}
            </DescriptionDetails>
          </DescriptionList>
        </section>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel}>
        <DialogTitle>Delete Patient</DialogTitle>
        <DialogDescription>
          Are you sure you want to delete{" "}
          {`${patient?.firstName} ${patient?.lastName}`}? This action cannot be
          undone.
        </DialogDescription>
        <DialogBody>
          <p className="text-sm text-neutral-600">
            This will permanently remove the patient from the system.
          </p>
        </DialogBody>
        <DialogActions>
          <Button outline onClick={handleDeleteCancel} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            color="red"
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
