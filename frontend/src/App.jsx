import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Login from "./pages/Login";

import StudentDashboard from "./pages/student/StudentDashboard";
import StudentAssignments from "./pages/student/StudentAssignments";
import StudentSubmissions from "./pages/student/StudentSubmissions";
import StudentProfile from "./pages/student/StudentProfile";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";
import TeacherAssignments from "./pages/teacher/TeacherAssignments";
import TeacherSubmissions from "./pages/teacher/TeacherSubmissions";
import TeacherProfile from "./pages/teacher/TeacherProfile";

import AssignmentDetails from "./pages/AssignmentDetails";

function ProtectedRoute({
  children,
  role,
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-page">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  if (
    role &&
    user.role !== role
  ) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* LOGIN */}

      <Route
        path="/login"
        element={<Login />}
      />

      {/* STUDENT */}

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/assignments"
        element={
          <ProtectedRoute role="student">
            <StudentAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/submissions"
        element={
          <ProtectedRoute role="student">
            <StudentSubmissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student/profile"
        element={
          <ProtectedRoute role="student">
            <StudentProfile />
          </ProtectedRoute>
        }
      />

      {/* TEACHER */}

      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/assignments"
        element={
          <ProtectedRoute role="teacher">
            <TeacherAssignments />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/assignments/:assignmentId"
        element={
          <ProtectedRoute role="teacher">
            <AssignmentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/submissions"
        element={
          <ProtectedRoute role="teacher">
            <TeacherSubmissions />
          </ProtectedRoute>
        }
      />

      <Route
        path="/teacher/profile"
        element={
          <ProtectedRoute role="teacher">
            <TeacherProfile />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}