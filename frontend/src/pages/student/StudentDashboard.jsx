import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        assignmentResponse,
        submissionResponse,
      ] = await Promise.all([
        api.get("/assignments/"),
        api.get("/submissions/me"),
      ]);

      setAssignments(assignmentResponse.data);
      setSubmissions(submissionResponse.data);
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
    loadData();
  }, []);

  const stats = useMemo(() => {
    const submitted = submissions.filter(
      (item) =>
        item.status === "SUBMITTED" ||
        item.status === "LATE" ||
        item.status === "GRADED"
    ).length;

    const graded = submissions.filter(
      (item) => item.status === "GRADED"
    ).length;

    return {
      total: assignments.length,
      submitted,
      pending: Math.max(
        assignments.length - submitted,
        0
      ),
      graded,
    };
  }, [assignments, submissions]);

  const getStatus = (assignmentId) => {
    const submission = submissions.find(
      (item) =>
        item.assignment_id === assignmentId
    );

    return submission?.status || "NOT_SUBMITTED";
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="loading-page">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />

      <main className="main-area">
        <Topbar title="Student Dashboard" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Good morning,{" "}
                {user?.name?.split(" ")[0]}
              </h1>

              <p className="page-subtitle">
                Here's your academic activity at a glance.
              </p>
            </div>

            <button
              className="btn btn-secondary"
              onClick={loadData}
            >
              ↻ Refresh
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
                  SUBMITTED
                </div>
                <div className="stat-value">
                  {stats.submitted}
                </div>
              </div>

              <div className="stat-icon">↑</div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">
                  PENDING
                </div>
                <div className="stat-value">
                  {stats.pending}
                </div>
              </div>

              <div className="stat-icon">◷</div>
            </div>

            <div className="stat-card">
              <div>
                <div className="stat-label">
                  GRADED
                </div>
                <div className="stat-value">
                  {stats.graded}
                </div>
              </div>

              <div className="stat-icon">✓</div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  Recent Assignments
                </h2>

                <p className="card-description">
                  Your latest coursework.
                </p>
              </div>

              <button
                className="btn btn-secondary"
                onClick={() =>
                  navigate("/student/assignments")
                }
              >
                View All
              </button>
            </div>

            <div className="card-body">
              {assignments.length === 0 ? (
                <p>No assignments available.</p>
              ) : (
                <div className="assignment-grid">
                  {assignments
                    .slice(0, 3)
                    .map((assignment) => (
                      <article
                        className="assignment-card"
                        key={assignment.id}
                      >
                        <div className="assignment-top">
                          <div>
                            <div className="assignment-number">
                              ASSIGNMENT #{assignment.id}
                            </div>

                            <h3 className="assignment-title">
                              {assignment.title}
                            </h3>
                          </div>

                          <span className="status status-submitted">
                            {getStatus(assignment.id)}
                          </span>
                        </div>

                        <p className="assignment-description">
                          {assignment.description}
                        </p>

                        <div className="assignment-meta">
                          <div className="meta-box">
                            <div className="meta-label">
                              Deadline
                            </div>

                            <div className="meta-value">
                              {formatDate(
                                assignment.deadline
                              )}
                            </div>
                          </div>

                          <div className="meta-box">
                            <div className="meta-label">
                              Marks
                            </div>

                            <div className="meta-value">
                              {assignment.max_marks}
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}