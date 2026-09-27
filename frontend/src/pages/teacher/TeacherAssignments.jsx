import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";

export default function TeacherAssignments() {
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [maxMarks, setMaxMarks] = useState("100");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          "Unable to load assignments."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
  }, []);

  const handleCreate = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const selectedDeadline =
      new Date(deadline);

    if (
      !deadline ||
      selectedDeadline <= new Date()
    ) {
      setError(
        "Assignment deadline must be in the future."
      );
      return;
    }

    const marks = Number(maxMarks);

    if (!marks || marks <= 0) {
      setError(
        "Maximum marks must be greater than 0."
      );
      return;
    }

    try {
      await api.post(
        "/assignments/",
        {
          title: title.trim(),
          description: description.trim(),
          deadline: selectedDeadline.toISOString(),
          max_marks: marks,
        }
      );

      setTitle("");
      setDescription("");
      setDeadline("");
      setMaxMarks("100");

      setShowCreate(false);

      setSuccess(
        "Assignment created successfully."
      );

      await loadAssignments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to create assignment."
      );
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Delete this assignment?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/assignments/${id}`
      );

      setSuccess(
        "Assignment deleted successfully."
      );

      await loadAssignments();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to delete assignment."
      );
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  if (loading) {
    return (
      <div className="loading-page">
        Loading assignments...
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />

      <main className="main-area">
        <Topbar title="Assignment Management" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                Assignments
              </h1>

              <p className="page-subtitle">
                Create and manage coursework.
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={() =>
                setShowCreate(!showCreate)
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

          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          {showCreate && (
            <div
              className="card"
              style={{
                marginBottom: "28px",
              }}
            >
              <div className="card-header">
                <div>
                  <h2 className="card-title">
                    Create Assignment
                  </h2>

                  <p className="card-description">
                    Define the assignment, deadline and marks.
                  </p>
                </div>
              </div>

              <div className="card-body">
                <form onSubmit={handleCreate}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        TITLE
                      </label>

                      <input
                        className="form-input"
                        value={title}
                        onChange={(e) =>
                          setTitle(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        MAXIMUM MARKS
                      </label>

                      <input
                        className="form-input"
                        type="number"
                        min="1"
                        value={maxMarks}
                        onChange={(e) =>
                          setMaxMarks(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group full">
                      <label className="form-label">
                        DESCRIPTION
                      </label>

                      <textarea
                        className="form-textarea"
                        value={description}
                        onChange={(e) =>
                          setDescription(e.target.value)
                        }
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        DEADLINE
                      </label>

                      <input
                        className="form-input"
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) =>
                          setDeadline(e.target.value)
                        }
                        required
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: "20px",
                      display: "flex",
                      gap: "10px",
                    }}
                  >
                    <button
                      className="btn btn-primary"
                      type="submit"
                    >
                      Create Assignment
                    </button>

                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() =>
                        setShowCreate(false)
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="assignment-grid">
            {assignments.map((assignment) => (
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

                <div className="assignment-footer">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(
                        `/teacher/assignments/${assignment.id}`
                      )
                    }
                  >
                    Manage →
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() =>
                      handleDelete(assignment.id)
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}