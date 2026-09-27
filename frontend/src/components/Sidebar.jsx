import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ role }) {
  const { logout } = useAuth();

  const isTeacher = role === "teacher";
  const basePath = isTeacher ? "/teacher" : "/student";

  const links = [
    {
      label: "Dashboard",
      path: basePath,
      icon: "⌂",
      end: true,
    },
    {
      label: "Assignments",
      path: `${basePath}/assignments`,
      icon: "▣",
    },
    {
      label: "Submissions",
      path: `${basePath}/submissions`,
      icon: "⇧",
    },
    {
      label: "Profile",
      path: `${basePath}/profile`,
      icon: "●",
    },
  ];

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-icon">
          A
        </div>

        <div>
          <div className="brand-title">
            Assignment Cloud
          </div>

          <div className="brand-subtitle">
            {isTeacher
              ? "TEACHER WORKSPACE"
              : "STUDENT WORKSPACE"}
          </div>
        </div>
      </div>

      <div className="sidebar-section">
        Workspace
      </div>

      <nav className="nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.end}
            className={({ isActive }) =>
              `nav-item ${isActive ? "active" : ""}`
            }
          >
            <span className="nav-icon">
              {link.icon}
            </span>

            <span>
              {link.label}
            </span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <button
          className="nav-item logout-nav"
          onClick={logout}
        >
          <span className="nav-icon">
            ↪
          </span>

          <span>
            Logout
          </span>
        </button>
      </div>

    </aside>
  );
}