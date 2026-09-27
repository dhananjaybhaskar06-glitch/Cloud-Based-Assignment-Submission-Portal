import { useEffect, useState } from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../services/api";

export default function AssignmentDetails() {
  const { assignmentId } = useParams();
  const navigate = useNavigate();

  const [assignment, setAssignment] =
    useState(null);

  const [submissions, setSubmissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [editing, setEditing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [editForm, setEditForm] =
    useState({
      title: "",
      description: "",
      deadline: "",
      max_marks: "",
    });

  const [gradingId, setGradingId] =
    useState(null);

  const [gradeForm, setGradeForm] =
    useState({
      marks: "",
      feedback: "",
    });

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const assignmentResponse =
        await api.get(
          `/assignments/${assignmentId}`
        );

      const assignmentData =
        assignmentResponse.data;

      setAssignment(assignmentData);

      const localDeadline =
        new Date(
          assignmentData.deadline
        );

      const localDeadlineValue =
        new Date(
          localDeadline.getTime() -
            localDeadline.getTimezoneOffset() *
              60000
        )
          .toISOString()
          .slice(0, 16);

      setEditForm({
        title:
          assignmentData.title,
        description:
          assignmentData.description,
        deadline:
          localDeadlineValue,
        max_marks:
          String(
            assignmentData.max_marks
          ),
      });

      const submissionsResponse =
        await api.get(
          `/assignments/${assignmentId}/submissions`
        );

      setSubmissions(
        submissionsResponse.data
      );
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to load assignment details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [assignmentId]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateAssignment =
    async (e) => {
      e.preventDefault();

      setError("");
      setMessage("");

      if (!editForm.title.trim()) {
        setError(
          "Assignment title is required."
        );
        return;
      }

      if (
        !editForm.description.trim()
      ) {
        setError(
          "Assignment description is required."
        );
        return;
      }

      if (!editForm.deadline) {
        setError(
          "Assignment deadline is required."
        );
        return;
      }

      const maxMarks =
        Number(editForm.max_marks);

      if (
        !Number.isFinite(maxMarks) ||
        maxMarks <= 0
      ) {
        setError(
          "Maximum marks must be greater than 0."
        );
        return;
      }

      try {
        setSaving(true);

        const response =
          await api.put(
            `/assignments/${assignmentId}`,
            {
              title:
                editForm.title.trim(),
              description:
                editForm.description.trim(),
              deadline:
                new Date(
                  editForm.deadline
                ).toISOString(),
              max_marks:
                maxMarks,
            }
          );

        setAssignment(
          response.data
        );

        setEditing(false);

        setMessage(
          "Assignment updated successfully."
        );
      } catch (err) {
        setError(
          err.response?.data?.detail ||
            "Unable to update assignment."
        );
      } finally {
        setSaving(false);
      }
    };

  const downloadSubmission =
    async (
      submissionId,
      fileName
    ) => {
      try {
        const response =
          await api.get(
            `/submissions/${submissionId}/download`,
            {
              responseType: "blob",
            }
          );

        const url =
          window.URL.createObjectURL(
            new Blob([
              response.data,
            ])
          );

        const link =
          document.createElement(
            "a"
          );

        link.href = url;
        link.download = fileName;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          url
        );
      } catch (err) {
        alert(
          err.response?.data?.detail ||
            "Unable to download submission."
        );
      }
    };

  const openGradeForm = (
    submission
  ) => {
    setGradingId(
      submission.id
    );

    setGradeForm({
      marks:
        submission.marks !== null &&
        submission.marks !== undefined
          ? String(
              submission.marks
            )
          : "",
      feedback:
        submission.feedback ||
        "",
    });

    setError("");
    setMessage("");
  };

  const cancelGrade = () => {
    setGradingId(null);

    setGradeForm({
      marks: "",
      feedback: "",
    });
  };

  const handleGradeChange = (
    e
  ) => {
    const { name, value } =
      e.target;

    setGradeForm(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );
  };

  const submitGrade = async (
    e,
    submission
  ) => {
    e.preventDefault();

    setError("");
    setMessage("");

    const marks =
      Number(gradeForm.marks);

    if (
      !Number.isFinite(marks)
    ) {
      setError(
        "Please enter valid marks."
      );
      return;
    }

    if (marks < 0) {
      setError(
        "Marks cannot be negative."
      );
      return;
    }

    if (
      marks >
      assignment.max_marks
    ) {
      setError(
        `Marks cannot exceed ${assignment.max_marks}.`
      );
      return;
    }

    try {
      await api.patch(
        `/submissions/${submission.id}/grade`,
        {
          marks,
          feedback:
            gradeForm.feedback.trim() ||
            null,
        }
      );

      setMessage(
        "Submission graded successfully."
      );

      setGradingId(null);

      setGradeForm({
        marks: "",
        feedback: "",
      });

      await loadData();
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Unable to grade submission."
      );
    }
  };

  if (loading) {
    return (
      <div style={styles.center}>
        <h2>
          Loading assignment...
        </h2>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div style={styles.page}>
        <div style={styles.container}>
          <button
            onClick={() =>
              navigate("/teacher")
            }
            style={
              styles.backButton
            }
          >
            ← Back to Dashboard
          </button>

          <div style={styles.error}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div style={styles.center}>
        <h2>
          Assignment not found
        </h2>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <button
          onClick={() =>
            navigate("/teacher")
          }
          style={
            styles.backButton
          }
        >
          ← Back to Dashboard
        </button>

        {/* ASSIGNMENT INFORMATION */}

        <section style={styles.card}>
          <div
            style={
              styles.titleRow
            }
          >
            <div>
              <h1>
                {assignment.title}
              </h1>

              <p
                style={
                  styles.assignmentId
                }
              >
                Assignment ID:{" "}
                {assignment.id}
              </p>
            </div>

            <button
              onClick={() => {
                setEditing(
                  !editing
                );
                setError("");
                setMessage("");
              }}
              style={
                styles.editButton
              }
            >
              {editing
                ? "Close Edit"
                : "Edit Assignment"}
            </button>
          </div>

          {message && (
            <div
              style={
                styles.success
              }
            >
              {message}
            </div>
          )}

          {error && (
            <div
              style={
                styles.error
              }
            >
              {error}
            </div>
          )}

          {/* EDIT FORM */}

          {editing ? (
            <form
              onSubmit={
                updateAssignment
              }
              style={
                styles.editForm
              }
            >
              <div
                style={
                  styles.formGroup
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Assignment Title
                </label>

                <input
                  type="text"
                  name="title"
                  value={
                    editForm.title
                  }
                  onChange={
                    handleEditChange
                  }
                  style={
                    styles.input
                  }
                  required
                />
              </div>

              <div
                style={
                  styles.formGroup
                }
              >
                <label
                  style={
                    styles.label
                  }
                >
                  Description
                </label>

                <textarea
                  name="description"
                  value={
                    editForm.description
                  }
                  onChange={
                    handleEditChange
                  }
                  rows="5"
                  style={
                    styles.textarea
                  }
                  required
                />
              </div>

              <div
                style={
                  styles.formRow
                }
              >
                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Deadline
                  </label>

                  <input
                    type="datetime-local"
                    name="deadline"
                    value={
                      editForm.deadline
                    }
                    onChange={
                      handleEditChange
                    }
                    style={
                      styles.input
                    }
                    required
                  />
                </div>

                <div
                  style={
                    styles.formGroup
                  }
                >
                  <label
                    style={
                      styles.label
                    }
                  >
                    Maximum Marks
                  </label>

                  <input
                    type="number"
                    name="max_marks"
                    value={
                      editForm.max_marks
                    }
                    onChange={
                      handleEditChange
                    }
                    min="1"
                    step="0.5"
                    style={
                      styles.input
                    }
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={
                  styles.saveButton
                }
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </form>
          ) : (
            <>
              <div
                style={
                  styles.descriptionBox
                }
              >
                <h3>
                  Description
                </h3>

                <p>
                  {
                    assignment.description
                  }
                </p>
              </div>

              <div
                style={
                  styles.infoGrid
                }
              >
                <div
                  style={
                    styles.infoBox
                  }
                >
                  <strong>
                    Deadline
                  </strong>

                  <span>
                    {new Date(
                      assignment.deadline
                    ).toLocaleString()}
                  </span>
                </div>

                <div
                  style={
                    styles.infoBox
                  }
                >
                  <strong>
                    Maximum Marks
                  </strong>

                  <span>
                    {
                      assignment.max_marks
                    }
                  </span>
                </div>

                <div
                  style={
                    styles.infoBox
                  }
                >
                  <strong>
                    Teacher ID
                  </strong>

                  <span>
                    {
                      assignment.teacher_id
                    }
                  </span>
                </div>
              </div>
            </>
          )}
        </section>

        {/* SUBMISSIONS */}

        <section style={styles.card}>
          <div
            style={
              styles.sectionHeader
            }
          >
            <div>
              <h2>
                Student Submissions
              </h2>

              <p
                style={
                  styles.muted
                }
              >
                Total submissions:{" "}
                {
                  submissions.length
                }
              </p>
            </div>

            <button
              onClick={
                loadData
              }
              style={
                styles.refreshButton
              }
            >
              Refresh
            </button>
          </div>

          {submissions.length ===
          0 ? (
            <div
              style={
                styles.empty
              }
            >
              <h3>
                No submissions yet
              </h3>

              <p>
                Students have not
                submitted this
                assignment.
              </p>
            </div>
          ) : (
            <div
              style={
                styles.submissionList
              }
            >
              {submissions.map(
                (
                  submission
                ) => (
                  <div
                    key={
                      submission.id
                    }
                    style={
                      styles.submissionCard
                    }
                  >
                    <div
                      style={
                        styles.submissionTop
                      }
                    >
                      <div>
                        <h3>
                          Student #
                          {
                            submission.student_id
                          }
                        </h3>

                        <p
                          style={
                            styles.fileName
                          }
                        >
                          File:{" "}
                          {
                            submission.file_name
                          }
                        </p>
                      </div>

                      <span
                        style={{
                          ...styles.status,
                          ...(submission.status ===
                          "GRADED"
                            ? styles.graded
                            : {}),
                        }}
                      >
                        {
                          submission.status
                        }
                      </span>
                    </div>

                    <div
                      style={
                        styles.submissionInfo
                      }
                    >
                      <div>
                        <strong>
                          Submitted
                        </strong>

                        <span>
                          {new Date(
                            submission.submitted_at
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Marks
                        </strong>

                        <span>
                          {submission.marks ??
                            "Not graded"}
                        </span>
                      </div>

                      <div>
                        <strong>
                          Feedback
                        </strong>

                        <span>
                          {submission.feedback ||
                            "No feedback"}
                        </span>
                      </div>
                    </div>

                    {/* ACTIONS */}

                    <div
                      style={
                        styles.submissionActions
                      }
                    >
                      <button
                        onClick={() =>
                          downloadSubmission(
                            submission.id,
                            submission.file_name
                          )
                        }
                        style={
                          styles.downloadButton
                        }
                      >
                        Download
                      </button>

                      <button
                        onClick={() =>
                          openGradeForm(
                            submission
                          )
                        }
                        style={
                          styles.gradeButton
                        }
                      >
                        {submission.status ===
                        "GRADED"
                          ? "Update Grade"
                          : "Grade Submission"}
                      </button>
                    </div>

                    {/* GRADE FORM */}

                    {gradingId ===
                      submission.id && (
                      <form
                        onSubmit={(e) =>
                          submitGrade(
                            e,
                            submission
                          )
                        }
                        style={
                          styles.gradeForm
                        }
                      >
                        <h3>
                          Grade Submission
                        </h3>

                        <div
                          style={
                            styles.formGroup
                          }
                        >
                          <label
                            style={
                              styles.label
                            }
                          >
                            Marks
                          </label>

                          <input
                            type="number"
                            name="marks"
                            value={
                              gradeForm.marks
                            }
                            onChange={
                              handleGradeChange
                            }
                            min="0"
                            max={
                              assignment.max_marks
                            }
                            step="0.5"
                            placeholder={`0-${assignment.max_marks}`}
                            style={
                              styles.input
                            }
                            required
                          />
                        </div>

                        <div
                          style={
                            styles.formGroup
                          }
                        >
                          <label
                            style={
                              styles.label
                            }
                          >
                            Feedback
                          </label>

                          <textarea
                            name="feedback"
                            value={
                              gradeForm.feedback
                            }
                            onChange={
                              handleGradeChange
                            }
                            rows="4"
                            placeholder="Enter feedback for the student..."
                            style={
                              styles.textarea
                            }
                          />
                        </div>

                        <div
                          style={
                            styles.gradeActions
                          }
                        >
                          <button
                            type="submit"
                            style={
                              styles.saveGradeButton
                            }
                          >
                            Save Grade
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelGrade
                            }
                            style={
                              styles.cancelButton
                            }
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight:
      "100vh",
    background:
      "#f4f7fb",
    fontFamily:
      "Arial, sans-serif",
    padding:
      "30px 20px",
  },

  container: {
    maxWidth:
      "1200px",
    margin:
      "0 auto",
  },

  center: {
    minHeight:
      "100vh",
    display:
      "flex",
    justifyContent:
      "center",
    alignItems:
      "center",
    fontFamily:
      "Arial, sans-serif",
  },

  backButton: {
    padding:
      "10px 16px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#374151",
    color:
      "white",
    cursor:
      "pointer",
    marginBottom:
      "20px",
  },

  card: {
    background:
      "white",
    padding:
      "30px",
    borderRadius:
      "12px",
    marginBottom:
      "25px",
    boxShadow:
      "0 5px 15px rgba(0,0,0,0.06)",
  },

  titleRow: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "20px",
  },

  assignmentId: {
    color:
      "#666",
    fontSize:
      "14px",
  },

  editButton: {
    padding:
      "10px 16px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#f59e0b",
    color:
      "white",
    cursor:
      "pointer",
    fontWeight:
      "bold",
  },

  success: {
    background:
      "#d1e7dd",
    color:
      "#0f5132",
    padding:
      "12px",
    borderRadius:
      "6px",
    marginTop:
      "20px",
  },

  error: {
    background:
      "#f8d7da",
    color:
      "#842029",
    padding:
      "12px",
    borderRadius:
      "6px",
    marginTop:
      "20px",
  },

  editForm: {
    marginTop:
      "25px",
    padding:
      "20px",
    background:
      "#f8fafc",
    borderRadius:
      "8px",
  },

  descriptionBox: {
    marginTop:
      "25px",
    padding:
      "20px",
    background:
      "#f8fafc",
    borderRadius:
      "8px",
  },

  infoGrid: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(200px, 1fr))",
    gap:
      "15px",
    marginTop:
      "25px",
  },

  infoBox: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "8px",
    padding:
      "15px",
    background:
      "#f8fafc",
    borderRadius:
      "8px",
  },

  formGroup: {
    marginBottom:
      "18px",
    flex: 1,
  },

  formRow: {
    display:
      "flex",
    gap:
      "20px",
  },

  label: {
    display:
      "block",
    fontWeight:
      "bold",
    marginBottom:
      "8px",
    color:
      "#374151",
  },

  input: {
    width:
      "100%",
    boxSizing:
      "border-box",
    padding:
      "11px",
    border:
      "1px solid #cbd5e1",
    borderRadius:
      "6px",
    fontSize:
      "14px",
  },

  textarea: {
    width:
      "100%",
    boxSizing:
      "border-box",
    padding:
      "11px",
    border:
      "1px solid #cbd5e1",
    borderRadius:
      "6px",
    fontSize:
      "14px",
    resize:
      "vertical",
    fontFamily:
      "Arial, sans-serif",
  },

  saveButton: {
    padding:
      "11px 20px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#198754",
    color:
      "white",
    cursor:
      "pointer",
    fontWeight:
      "bold",
  },

  sectionHeader: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    marginBottom:
      "20px",
  },

  muted: {
    color:
      "#666",
  },

  refreshButton: {
    padding:
      "9px 16px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#2563eb",
    color:
      "#ffffff",
    cursor:
      "pointer",
  },

  empty: {
    textAlign:
      "center",
    padding:
      "40px",
    color:
      "#666",
  },

  submissionList: {
    display:
      "flex",
    flexDirection:
      "column",
    gap:
      "18px",
  },

  submissionCard: {
    border:
      "1px solid #e2e8f0",
    borderRadius:
      "10px",
    padding:
      "20px",
    background:
      "#ffffff",
  },

  submissionTop: {
    display:
      "flex",
    justifyContent:
      "space-between",
    alignItems:
      "center",
    gap:
      "20px",
  },

  fileName: {
    color:
      "#666",
    marginTop:
      "5px",
  },

  status: {
    display:
      "inline-block",
    padding:
      "6px 10px",
    borderRadius:
      "5px",
    background:
      "#e5e7eb",
    fontSize:
      "12px",
    fontWeight:
      "bold",
  },

  graded: {
    background:
      "#d1e7dd",
    color:
      "#0f5132",
  },

  submissionInfo: {
    display:
      "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap:
      "15px",
    marginTop:
      "20px",
    paddingTop:
      "15px",
    borderTop:
      "1px solid #eee",
  },

  submissionInfoItem: {
    display:
      "flex",
    flexDirection:
      "column",
  },

  submissionActions: {
    display:
      "flex",
    gap:
      "10px",
    marginTop:
      "20px",
  },

  downloadButton: {
    padding:
      "9px 15px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#2563eb",
    color:
      "white",
    cursor:
      "pointer",
  },

  gradeButton: {
    padding:
      "9px 15px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#198754",
    color:
      "white",
    cursor:
      "pointer",
  },

  gradeForm: {
    marginTop:
      "20px",
    padding:
      "20px",
    background:
      "#f8fafc",
    borderRadius:
      "8px",
    border:
      "1px solid #e2e8f0",
  },

  gradeActions: {
    display:
      "flex",
    gap:
      "10px",
  },

  saveGradeButton: {
    padding:
      "10px 18px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#198754",
    color:
      "white",
    cursor:
      "pointer",
    fontWeight:
      "bold",
  },

  cancelButton: {
    padding:
      "10px 18px",
    border:
      "none",
    borderRadius:
      "6px",
    background:
      "#6c757d",
    color:
      "white",
    cursor:
      "pointer",
  },
};