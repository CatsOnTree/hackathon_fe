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
          <Route path="events" element={<EventsPage />} />
          <Route path="registration" element={<RegistrationPage />} />
          <Route path="participants" element={<ParticipantsPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="panelists" element={<PanelistsPage />} />
          <Route path="assignments" element={<AssignmentsPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="squads" element={<SquadsPage />} />
          <Route path="email-logs" element={<EmailLogsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
