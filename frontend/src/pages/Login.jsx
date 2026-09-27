import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      if (user.role === "teacher") {
        navigate("/teacher");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand-content">

          <div className="brand">
            <div className="brand-icon">A</div>

            <div>
              <div className="brand-title">
                Assignment Cloud
              </div>

              <div className="brand-subtitle">
                STUDENT WORKFLOW PLATFORM
              </div>
            </div>
          </div>

          <h1 className="login-brand-title">
            One place for
            <br />
            every assignment.
          </h1>

          <p className="login-brand-text">
            Submit coursework, track deadlines, receive
            feedback, and manage academic workflows through
            a secure cloud-ready platform.
          </p>

          <div className="login-features">

            <div className="login-feature">
              <span className="feature-check">✓</span>
              Secure role-based authentication
            </div>

            <div className="login-feature">
              <span className="feature-check">✓</span>
              Assignment submission and tracking
            </div>

            <div className="login-feature">
              <span className="feature-check">✓</span>
              Teacher grading and feedback
            </div>

            <div className="login-feature">
              <span className="feature-check">✓</span>
              Cloud-ready architecture
            </div>

          </div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">

          <div className="login-logo">
            <div className="brand-icon">A</div>
            <strong>Assignment Cloud</strong>
          </div>

          <h1 className="login-heading">
            Welcome back
          </h1>

          <p className="login-subheading">
            Sign in to continue to your academic workspace.
          </p>

          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">

              <label className="form-label">
                EMAIL ADDRESS
              </label>

              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />

            </div>

            <div className="form-group">

              <label className="form-label">
                PASSWORD
              </label>

              <input
                className="login-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />

            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="demo-box">
            <strong>Demo environment</strong>
            <br />
            Teacher account: teacher@example.com
            <br />
            Student account: student@example.com
          </div>

        </div>
      </section>
    </div>
  );
}