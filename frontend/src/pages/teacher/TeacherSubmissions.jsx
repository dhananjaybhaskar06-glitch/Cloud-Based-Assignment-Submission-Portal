import { useEffect, useState } from "react";

import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function TeacherSubmissions() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const assignmentResponse =
        await api.get("/assignments/");

      const assignmentList =
        assignmentResponse.data;

      const results = await Promise.all(
        assignmentList.map(async (assignment) => {
          try {
            const response = await api.get(
              `/assignments/${assignment.id}/submissions`
            );

            return response.data.map(
              (submission) => ({
                ...submission,
                assignment_title:
                  assignment.title,
                max_marks:
                  assignment.max_marks,
              })
            );
          } catch {
            return [];
          }
        })
      );

      setSubmissions(results.flat());
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
    loadSubmissions();
  }, []);

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
      setError(
        "Unable to download submission."
      );
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
      <Sidebar role="teacher" />

      <main className="main-area">
        <Topbar title="Student Submissions" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Student Submissions
              </h1>

              <p className="page-subtitle">
                Review submitted coursework and access grading workflows.
              </p>
            </div>

            <button
              className="btn btn-secondary"
              onClick={loadSubmissions}
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
                  Student submissions will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="card-body">
                {submissions.map((submission) => (
                  <div
                    className="meta-box"
                    key={submission.id}
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
                          {submission.assignment_title}
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
                          Student ID
                        </div>

                        <div className="profile-value">
                          {submission.student_id}
                        </div>
                      </div>

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
                          {submission.marks ??
                            "Pending"}
                        </div>
                      </div>
                    </div>

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
                        ↓ Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}