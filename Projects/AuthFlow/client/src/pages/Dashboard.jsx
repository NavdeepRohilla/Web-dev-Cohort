import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout();
      showToast("You have been logged out.", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      showToast("Session cleared locally.", "warning");
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-24 sm:px-6">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300">
            AuthFlow Pro
          </p>
          <h1 className="mt-2 text-4xl font-black leading-tight text-zinc-950 dark:text-white sm:text-5xl">
            Dashboard
          </h1>
        </div>

        <button type="button" className="secondary-button" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <LogOut size={18} />
          )}
          <span>{isLoggingOut ? "Logging out" : "Logout"}</span>
        </button>
      </header>

      <section className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-emerald-100 text-2xl font-black text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200">
              {getInitials(user.username)}
            </div>
            <div>
              <p className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
                User profile
              </p>
              <h2 className="mt-1 break-words text-3xl font-black text-zinc-950 dark:text-white">
                {user.username}
              </h2>
              <span
                className={[
                  "mt-3 inline-flex rounded-lg px-3 py-1 text-xs font-black",
                  isAdmin
                    ? "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200"
                    : "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
                ].join(" ")}
              >
                {user.role}
              </span>
            </div>
          </div>

          <dl className="mt-8 grid gap-3">
            <ProfileRow label="Username" value={user.username} />
            <ProfileRow label="Email" value={user.email} />
            <ProfileRow label="Role" value={user.role} />
          </dl>
        </article>

        <div className="grid gap-5">
          <InsightCard
            icon={<ShieldCheck size={22} />}
            label="Session status"
            value="Authenticated"
            tone="emerald"
          />
          <InsightCard
            icon={<UserRound size={22} />}
            label="Access level"
            value={user.role}
            tone={isAdmin ? "orange" : "zinc"}
          />
          <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-zinc-900">
            <p className="text-xs font-black uppercase text-zinc-500 dark:text-zinc-400">
              {isAdmin ? "Admin workspace" : "Workspace"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-zinc-950 dark:text-white">
              {isAdmin ? "Administrator account" : "Standard account"}
            </h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-zinc-500 dark:text-zinc-400">
              {isAdmin
                ? "Your role badge unlocks the admin-facing state in this dashboard."
                : "Your authenticated profile is loaded from FreeAPI through the Express proxy."}
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}

function ProfileRow({ label, value }) {
  return (
    <div className="grid gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-white/10 dark:bg-zinc-950 sm:grid-cols-[130px_1fr] sm:items-center">
      <dt className="text-sm font-black text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="break-words text-sm font-black text-zinc-950 dark:text-white">{value}</dd>
    </div>
  );
}

function InsightCard({ icon, label, value, tone }) {
  const toneClasses = {
    emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-400/15 dark:text-emerald-200",
    orange: "bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-200",
    zinc: "bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200",
  };

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-zinc-900">
      <div className={`grid h-11 w-11 place-items-center rounded-lg ${toneClasses[tone]}`}>
        {icon}
      </div>
      <p className="mt-5 text-sm font-black uppercase text-zinc-500 dark:text-zinc-400">{label}</p>
      <strong className="mt-1 block break-words text-2xl font-black text-zinc-950 dark:text-white">
        {value}
      </strong>
    </article>
  );
}

function getInitials(username) {
  return username
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .padEnd(2, "A");
}
