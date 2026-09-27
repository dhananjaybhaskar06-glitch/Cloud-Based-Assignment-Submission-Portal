import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Topbar({ title }) {
  const { user } = useAuth();

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    const theme = darkMode ? "dark" : "light";

    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem("theme", theme);
  }, [darkMode]);

  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">
          {title}
        </div>
      </div>

      <div className="user-menu">
        <button
          className="theme-toggle"
          onClick={() =>
            setDarkMode((current) => !current)
          }
          title={
            darkMode
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
          aria-label="Toggle theme"
        >
          {darkMode ? "☀" : "☾"}
        </button>

        <div className="avatar">
          {user?.name
            ?.charAt(0)
            .toUpperCase()}
        </div>

        <div>
          <div className="user-name">
            {user?.name}
          </div>

          <div className="user-role">
            {user?.role}
          </div>
        </div>
      </div>
    </header>
  );
}