import Sidebar from "../../components/Sidebar";
import Topbar from "../../components/Topbar";
import { useAuth } from "../../context/AuthContext";

export default function TeacherProfile() {
  const { user } = useAuth();

  return (
    <div className="app-shell">
      <Sidebar role="teacher" />

      <main className="main-area">
        <Topbar title="Teacher Profile" />

        <section className="content">
          <div className="page-header">
            <div>
              <h1 className="page-title">
                My Profile
              </h1>

              <p className="page-subtitle">
                View your teacher account information.
              </p>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">
                  Account Information
                </h2>

                <p className="card-description">
                  Your registered Assignment Cloud account.
                </p>
              </div>

              <div className="avatar">
                {user?.name
                  ?.charAt(0)
                  .toUpperCase()}
              </div>
            </div>

            <div className="card-body">
              <div className="profile-grid">
                <div className="profile-item">
                  <div className="profile-label">
                    FULL NAME
                  </div>

                  <div className="profile-value">
                    {user?.name}
                  </div>
                </div>

                <div className="profile-item">
                  <div className="profile-label">
                    EMAIL ADDRESS
                  </div>

                  <div className="profile-value">
                    {user?.email}
                  </div>
                </div>

                <div className="profile-item">
                  <div className="profile-label">
                    ROLE
                  </div>

                  <div className="profile-value">
                    Teacher
                  </div>
                </div>

                <div className="profile-item">
                  <div className="profile-label">
                    ACCOUNT STATUS
                  </div>

                  <div className="profile-value">
                    Active
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}