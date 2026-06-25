import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/Login/LoginPage";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardPage } from "../pages/Dashboard/DashboardPage";
import { EventsPage } from "../pages/Events/EventsPage";
import { RegistrationPage } from "../pages/Registration/RegistrationPage";
import { PublicRegistrationPage } from "../pages/Registration/PublicRegistrationPage";
import { ParticipantsPage } from "../pages/Participants/ParticipantsPage";
import { AttendancePage } from "../pages/Attendance/AttendancePage";
import { PanelistsPage } from "../pages/Panelists/PanelistsPage";
import { AssignmentsPage } from "../pages/Assignments/AssignmentsPage";
import { FeedbackPage } from "../pages/Feedback/FeedbackPage";
import { SquadsPage } from "../pages/Squads/SquadsPage";
import { EmailLogsPage } from "../pages/EmailLogs/EmailLogsPage";
import { useAuth } from "../contexts/AuthContext";

function normalizeRole(role?: string | null) {
  return role?.replace(/^ROLE_/, "") || "";
}

function useCanAccessRoute(requiredRoles: string[]): boolean {
  const { role } = useAuth();
  const normalizedRole = normalizeRole(role);
  return normalizedRole
    ? requiredRoles.map(normalizeRole).includes(normalizedRole)
    : false;
}

function ProtectedRoute({
  component: Component,
  requiredRoles,
  fallback = <Navigate to="/" replace />,
}: any) {
  return useCanAccessRoute(requiredRoles) ? <Component /> : fallback;
}

export function AppRoutes() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/participants/register"
        element={<PublicRegistrationPage />}
      />
      {isAuthenticated ? (
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route
            path="events"
            element={
              <ProtectedRoute
                component={EventsPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="registration"
            element={
              <ProtectedRoute
                component={RegistrationPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="participants"
            element={
              <ProtectedRoute
                component={ParticipantsPage}
                requiredRoles={["ADMIN", "PANELIST"]}
              />
            }
          />
          <Route
            path="attendance"
            element={
              <ProtectedRoute
                component={AttendancePage}
                requiredRoles={["ADMIN", "PANELIST"]}
              />
            }
          />
          <Route
            path="panelists"
            element={
              <ProtectedRoute
                component={PanelistsPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="assignments"
            element={
              <ProtectedRoute
                component={AssignmentsPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="feedback"
            element={
              <ProtectedRoute
                component={FeedbackPage}
                requiredRoles={["ADMIN", "PANELIST"]}
              />
            }
          />
          <Route
            path="squads"
            element={
              <ProtectedRoute
                component={SquadsPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route
            path="email-logs"
            element={
              <ProtectedRoute
                component={EmailLogsPage}
                requiredRoles={["ADMIN"]}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
