import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const { isCheckingSession } = useAuth();

  if (isCheckingSession) {
    return (
      <main className="grid min-h-screen place-items-center bg-stone-100 text-emerald-800 dark:bg-zinc-950 dark:text-emerald-200">
        <div className="flex items-center gap-3 rounded-lg border border-emerald-900/10 bg-white px-5 py-4 shadow-soft dark:border-white/10 dark:bg-zinc-900">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-r-transparent" />
          <span className="text-sm font-bold">Checking your session</span>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-zinc-50">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(244,114,76,0.18),transparent_32%)]" />
      <ThemeToggle />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}
