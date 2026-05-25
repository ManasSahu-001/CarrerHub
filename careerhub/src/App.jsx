import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./store/AuthContext";
import { useToast } from "./hooks/useToast";
import Navbar from "./components/shared/Navbar";
import Toast from "./components/ui/Toast";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Forgot from "./pages/Forgot";
import Feed from "./pages/Feed";
import Profile from "./pages/Profile";
import Search from "./pages/Search";
import Connections from "./pages/Connections";
import Settings from "./pages/Settings";
import ResetPassword from "./pages/ResetPassword";

// Pages that hide the navbar
const NO_NAV_ROUTES = ["/", "/login", "/register", "/forgot" , "/resetpassword"];

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const { user } = useAuth();
  const location = useLocation();
  const { toasts, toast } = useToast();

  const showNav = !NO_NAV_ROUTES.includes(location.pathname);

  return (
    <div className="overflow-x-hidden min-h-screen">
      {showNav && <Navbar toast={toast} />}

      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login toast={toast} />} />
          <Route path="/register" element={<Register toast={toast} />} />
          <Route path="/forgot" element={<Forgot toast={toast} />} />

          {/* Protected */}
          <Route path="/feed" element={<ProtectedRoute><Feed toast={toast} /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<Profile toast={toast} />} />
          <Route path="/search" element={<Search toast={toast} />} />
          <Route path="/connections" element={<ProtectedRoute><Connections toast={toast} /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings toast={toast} /></ProtectedRoute>} />
          <Route path="/reset-password/:token" element={<ResetPassword toast={toast} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to={user ? "/feed" : "/"} replace />} />
        </Routes>
      </main>

      <Toast toasts={toasts} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
