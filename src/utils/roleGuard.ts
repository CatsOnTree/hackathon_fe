import { useAuth } from "../contexts/AuthContext";
import type { ReactNode } from "react";

interface RoleGuardProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallback?: ReactNode;
}

/**
 * RoleGuard component - conditionally renders content based on user role
 * @param requiredRoles - array of roles allowed to see content (e.g., ['ADMIN', 'PANELIST'])
 * @param fallback - what to show if user doesn't have required role (default: null)
 */
function normalizeRole(role?: string | null) {
  return role?.replace(/^ROLE_/, "") || "";
}

export function RoleGuard({
  children,
  requiredRoles = [],
  fallback = null,
}: RoleGuardProps) {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);

  if (requiredRoles.length === 0) {
    return children; // No restriction
  }

  if (
    !normalizedRole ||
    !requiredRoles.map(normalizeRole).includes(normalizedRole)
  ) {
    return fallback;
  }

  return children;
}

/**
 * Hook to check if user has specific role(s)
 */
export function useHasRole(...roles: string[]): boolean {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);
  return normalizedRole
    ? roles.map(normalizeRole).includes(normalizedRole)
    : false;
}

/**
 * Hook to check if user can access a feature
 */
export function useCanAccess(featureName: string): boolean {
  const { role } = useAuth();

  const roleFeatureMap: Record<string, string[]> = {
    // Dashboard
    viewDashboard: ["ADMIN", "PARTICIPANT"],

    // Events
    viewEvents: ["ADMIN"],
    createEvent: ["ADMIN"],
    editEvent: ["ADMIN"],
    deleteEvent: ["ADMIN"],

    // Registration
    registerParticipant: ["PARTICIPANT"],
    viewRegistration: ["ADMIN", "PARTICIPANT"],

    // Participants - PANELIST can view and edit
    viewParticipants: ["ADMIN", "PANELIST"],
    editParticipant: ["ADMIN", "PANELIST"],

    // Attendance - PANELIST can view and check in
    checkIn: ["ADMIN", "PANELIST"],
    viewAttendance: ["ADMIN", "PANELIST"],

    // Panelists
    viewPanelists: ["ADMIN"],
    createPanelist: ["ADMIN"],

    // Assignments
    viewAssignments: ["ADMIN"],
    createAssignment: ["ADMIN"],

    // Feedback - PANELIST can view and submit
    viewFeedback: ["ADMIN", "PANELIST"],
    submitFeedback: ["PANELIST"],

    // Squads
    viewSquads: ["ADMIN"],
    createSquad: ["ADMIN"],

    // Email Logs
    viewEmailLogs: ["ADMIN"],
  };

  const requiredRoles = roleFeatureMap[featureName] || [];
  const normalizedRole = normalizeRole(role);
  return normalizedRole ? requiredRoles.includes(normalizedRole) : false;
}

/**
 * Redirect-to-message helper for pages user can't access
 */
export function getAccessDeniedMessage(featureName: string): string {
  const messageMap: Record<string, string> = {
    createEvent: "Only admins can create events",
    createPanelist: "Only admins can create panelists",
    submitFeedback: "Only panelists can submit feedback",
    registerParticipant: "Only participants can register",
    viewEmailLogs: "Only admins can view email logs",
  };

  return (
    messageMap[featureName] ||
    "You don't have permission to access this feature"
  );
}
