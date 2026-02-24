import { useAuth } from "./lib/auth";
import { Home } from "./pages/Home";
import { Login } from "./pages/Login";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return user ? <Home /> : <Login />;
}
