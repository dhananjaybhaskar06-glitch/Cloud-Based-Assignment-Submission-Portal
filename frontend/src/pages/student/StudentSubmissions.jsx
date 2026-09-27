import { useEffect, useState } from "react";

import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function StudentSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        submissionResponse,
        assignmentResponse,
      ] = await Promise.all([
        api.get("/submissions/me"),
        api.get("/assignments/"),
      ]);

      setSubmissions(submissionResponse.data);
      setAssignments(assignmentResponse.data);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load submissions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAssignment = (id) =>
    assignments.find(
      (assignment) => assignment.id === id
    );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleDownload = async (
    submissionId,
    fileName
  ) => {
    try {
      const response = await api.get(
        `/submissions/${submissionId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(
        response.data
      );

      const link = document.createElement("a");

      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);
    } catch {
      setError("Unable to download file.");
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        Loading submissions...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />

      <main className="main-area">
        <Topbar title="My Submissions" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                My Submissions
              </h1>

              <p className="page-subtitle">
                Track submitted files, grades, and teacher feedback.
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

          {submissions.length === 0 ? (
            <div className="card">
              <div
                className="card-body"
                style={{
                  textAlign: "center",
                  padding: "60px",
                }}
              >
                <h3>No submissions yet</h3>

                <p>
                  Your submitted assignments will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                {submissions.map((submission) => {
                  const assignment =
                    getAssignment(
                      submission.assignment_id
                    );

                  return (
                    <div
                      key={submission.id}
                      className="meta-box"
                      style={{
                        marginBottom: "15px",
                      }}
                    >
                      <div className="assignment-top">
                        <div>
                          <div className="assignment-number">
                            SUBMISSION #{submission.id}
                          </div>

                          <h3 className="assignment-title">
                            {assignment?.title ||
                              `Assignment #${submission.assignment_id}`}
                          </h3>
                        </div>

                        <span
                          className={
                            submission.status === "GRADED"
                              ? "status status-graded"
                              : "status status-submitted"
                          }
                        >
                          {submission.status}
                        </span>
                      </div>

                      <div className="profile-grid">
                        <div className="profile-item">
                          <div className="profile-label">
                            File
                          </div>

                          <div className="profile-value">
                            {submission.file_name}
                          </div>
                        </div>

                        <div className="profile-item">
                          <div className="profile-label">
                            Submitted
                          </div>

                          <div className="profile-value">
                            {formatDate(
                              submission.submitted_at
                            )}
                          </div>
                        </div>

                        <div className="profile-item">
                          <div className="profile-label">
                            Marks
                          </div>

                          <div className="profile-value">
                            {submission.marks ?? "Pending"}
                          </div>
                        </div>
                      </div>

                      {submission.feedback && (
                        <div style={{ marginTop: "15px" }}>
                          <div className="meta-label">
                            Teacher Feedback
                          </div>

                          <p>
                            {submission.feedback}
                          </p>
                        </div>
                      )}

                      <div style={{ marginTop: "15px" }}>
                        <button
                          className="btn btn-secondary"
                          onClick={() =>
                            handleDownload(
                              submission.id,
                              submission.file_name
                            )
                          }
                        >
                          ↓ Download Submission
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}