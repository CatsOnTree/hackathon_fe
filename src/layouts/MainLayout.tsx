import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardCheck,
  Gauge,
  LogOut,
  Mail,
  Menu,
  MessageSquare,
  Network,
  PanelLeftClose,
  QrCode,
  Users,
  UserRoundCheck,
  UserSearch,
} from "lucide-react";
import { useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { normalizeRole } from "../utils/roleGuard";

const allNavItems = [
  {
    label: "Dashboard",
    to: "/",
    icon: Gauge,
    roles: ["ADMIN"],
  },
  { label: "Events", to: "/events", icon: CalendarDays, roles: ["ADMIN"] },
  {
    label: "Registration",
    to: "/registration",
    icon: QrCode,
    roles: ["ADMIN"],
  },
  {
    label: "Participants",
    to: "/participants",
    icon: Users,
    roles: ["ADMIN", "PANELIST"],
  },
  {
    label: "Attendance",
    to: "/attendance",
    icon: ClipboardCheck,
    roles: ["ADMIN", "PANELIST"],
  },
  { label: "Panelists", to: "/panelists", icon: UserSearch, roles: ["ADMIN"] },
  {
    label: "Assignments",
    to: "/assignments",
    icon: UserRoundCheck,
    roles: ["ADMIN"],
  },
  {
    label: "Feedback",
    to: "/feedback",
    icon: MessageSquare,
    roles: ["ADMIN", "PANELIST"],
  },
  { label: "Squads", to: "/squads", icon: Network, roles: ["ADMIN"] },
  { label: "Email Logs", to: "/email-logs", icon: Mail, roles: [] },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { role, logout } = useAuth();

  const normalizedRole = useMemo(() => normalizeRole(role), [role]);

  const navItems = useMemo(
    () =>
      allNavItems.filter((item) =>
        item.roles
          .map((itemRole) => normalizeRole(itemRole))
          .includes(normalizedRole),
      ),
    [normalizedRole],
  );

  const crumb =
    allNavItems.find((item) => item.to === location.pathname)?.label ||
    "Dashboard";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleDisplay = () => {
    const roleMap: Record<string, string> = {
      ADMIN: "Admin",
      PANELIST: "Panelist",
      PARTICIPANT: "Participant",
      ROLE_ADMIN: "Admin",
      ROLE_PANELIST: "Panelist",
    };
    return roleMap[normalizedRole] || role || "User";
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-zinc-200 bg-zinc-950 text-white transition lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-16 items-center justify-between px-5">
          <div>
            <p className="text-sm font-semibold text-emerald-300">
              AI Recruitment
            </p>
            <p className="text-xs text-zinc-400">Event Platform</p>
          </div>
          <button
            className="rounded-md p-2 text-zinc-300 hover:bg-zinc-800 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <PanelLeftClose className="h-5 w-5" />
          </button>
        </div>
        <nav className="space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-emerald-500 text-zinc-950"
                    : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {open ? (
        <button
          className="fixed inset-0 z-30 bg-zinc-950/30 lg:hidden"
          onClick={() => setOpen(false)}
          aria-label="Close menu overlay"
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-zinc-200 bg-white/95 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="btn-secondary h-9 w-9 p-0 lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <p className="text-xs text-zinc-500">Home / {crumb}</p>
              <p className="text-sm font-semibold text-zinc-900">{crumb}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 py-1 pl-1 pr-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                {getRoleDisplay().charAt(0)}
              </span>
              <div className="hidden text-sm sm:inline">
                <p className="font-medium text-zinc-700">{getRoleDisplay()}</p>
                <p className="text-xs text-zinc-500">Event Manager</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-md p-2 text-zinc-600 hover:bg-red-100 hover:text-red-600 transition"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
