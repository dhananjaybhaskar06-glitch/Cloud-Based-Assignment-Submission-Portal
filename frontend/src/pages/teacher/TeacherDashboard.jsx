import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssignments = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/assignments/"
      );

      setAssignments(response.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();

    return {
      total: assignments.length,

      active: assignments.filter(
        (item) =>
          new Date(item.deadline) > now
      ).length,

      closed: assignments.filter(
        (item) =>
          new Date(item.deadline) <= now
      ).length,
    };
  }, [assignments]);

  if (loading) {
    return (
      <div className="loading-page">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />

      <main className="main-area">
        <Topbar title="Teacher Dashboard" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Welcome,{" "}
                {user?.name?.split(" ")[0]}
              </h1>

              <p className="page-subtitle">
                Manage your coursework and student submissions.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate("/teacher/assignments")
              }
            >
              + New Assignment
            </button>
          </div>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <div>
                <div className="stat-label">
                  TOTAL ASSIGNMENTS
                </div>

                <div className="stat-value">
                  {stats.total}
                </div>
              </div>

              <div className="stat-icon">▣</div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">
                  ACTIVE
                </div>

                <div className="stat-value">
                  {stats.active}
                </div>
              </div>

              <div className="stat-icon">◉</div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">
                  CLOSED
                </div>

                <div className="stat-value">
                  {stats.closed}
                </div>
              </div>

              <div className="stat-icon">◷</div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">
                  ROLE
                </div>

                <div
                  className="stat-value"
                  style={{
                    fontSize: "18px",
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role}
                </div>
              </div>

              <div className="stat-icon">✓</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  Assignment Management
                </h2>

                <p className="card-description">
                  Create, edit, delete, and review assignments.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  navigate("/teacher/assignments")
                }
              >
                Manage Assignments →
              </button>
            </div>

            <div className="card-body">
              <div className="assignment-grid">
                {assignments
                  .slice(0, 3)
                  .map((assignment) => (
                    <article
                      className="assignment-card"
                      key={assignment.id}
                    >
                      <div className="assignment-number">
                        ASSIGNMENT #{assignment.id}
                      </div>

                      <h3 className="assignment-title">
                        {assignment.title}
                      </h3>

                      <p className="assignment-description">
                        {assignment.description}
                      </p>

                      <div className="assignment-footer">
                        <button
                          className="btn btn-primary"
                          onClick={() =>
                            navigate(
                              `/teacher/assignments/${assignment.id}`
                            )
                          }
                        >
                          View Details →
                        </button>
                      </div>
                    </article>
                  ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}