import { useEffect, useState } from "react";

import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploadingId, setUploadingId] = useState(null);

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
          "Unable to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getSubmission = (id) =>
    submissions.find(
      (item) => item.assignment_id === id
    );

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  const handleUpload = async (
    assignmentId,
    event
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setSuccess("");

    const allowed = [
      ".pdf",
      ".doc",
      ".docx",
      ".zip",
      ".txt",
      ".png",
      ".jpg",
      ".jpeg",
    ];

    const extension =
      "." +
      file.name
        .split(".")
        .pop()
        .toLowerCase();

    if (!allowed.includes(extension)) {
      setError("This file type is not allowed.");
      event.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must not exceed 10 MB.");
      event.target.value = "";
      return;
    }

    try {
      setUploadingId(assignmentId);

      const formData = new FormData();
      formData.append("file", file);

      await api.post(
        `/assignments/${assignmentId}/submit`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setSuccess(
        "Assignment submitted successfully."
      );

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to submit assignment."
      );
    } finally {
      setUploadingId(null);
      event.target.value = "";
    }
  };

  if (loading) {
    return (
      <div className="loading-page">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="student" />

      <main className="main-area">
        <Topbar title="My Assignments" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                My Assignments
              </h1>

              <p className="page-subtitle">
                View coursework, deadlines, and submit your work.
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

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="assignment-grid">
            {assignments.map((assignment) => {
              const submission =
                getSubmission(assignment.id);

              return (
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

                    <span
                      className={
                        submission
                          ? "status status-submitted"
                          : "status status-pending"
                      }
                    >
                      {submission
                        ? submission.status
                        : "NOT SUBMITTED"}
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
                        {formatDate(assignment.deadline)}
                      </div>
                    </div>

                    <div className="meta-box">
                      <div className="meta-label">
                        Maximum Marks
                      </div>

                      <div className="meta-value">
                        {assignment.max_marks}
                      </div>
                    </div>
                  </div>

                  {submission?.status === "GRADED" && (
                    <div className="meta-box">
                      <div className="meta-label">
                        Result
                      </div>

                      <div className="score-box">
                        <span className="score-value">
                          {submission.marks}
                        </span>

                        <span className="score-total">
                          / {assignment.max_marks}
                        </span>
                      </div>

                      {submission.feedback && (
                        <p
                          style={{
                            marginTop: "10px",
                            fontSize: "12px",
                            color: "#4b5563",
                          }}
                        >
                          {submission.feedback}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="assignment-footer">
                    <label className="btn btn-primary">
                      {uploadingId === assignment.id
                        ? "Uploading..."
                        : submission
                          ? "Resubmit"
                          : "Submit Assignment"}

                      <input
                        type="file"
                        hidden
                        accept=".pdf,.doc,.docx,.zip,.txt,.png,.jpg,.jpeg"
                        disabled={
                          uploadingId === assignment.id
                        }
                        onChange={(event) =>
                          handleUpload(
                            assignment.id,
                            event
                          )
                        }
                      />
                    </label>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}