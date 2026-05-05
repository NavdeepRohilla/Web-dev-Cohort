import { Link, NavLink } from "react-router-dom";

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-24 sm:px-6">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-soft dark:border-white/10 dark:bg-zinc-900 md:grid-cols-[0.9fr_1.1fr]">
        <aside className="relative flex min-h-[250px] flex-col justify-between overflow-hidden bg-emerald-800 p-7 text-white md:min-h-[620px] md:p-10">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-white text-base font-black text-emerald-800">
            AP
          </div>
          <div>
            <p className="text-xs font-black uppercase text-emerald-100">AuthFlow Pro</p>
            <h1 className="mt-4 max-w-sm text-4xl font-black leading-none sm:text-5xl">
              Secure sessions, cleanly routed.
            </h1>
          </div>
          <div className="w-fit rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold backdrop-blur">
            Express proxy + FreeAPI
          </div>
          <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full border-[28px] border-white/15" />
        </aside>

        <div className="p-7 sm:p-10">
          <div className="mb-8 grid grid-cols-2 gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 dark:border-white/10 dark:bg-zinc-950">
            <AuthTab to="/login">Login</AuthTab>
            <AuthTab to="/register">Register</AuthTab>
          </div>

          <div className="mb-8">
            <p className="text-xs font-black uppercase text-emerald-700 dark:text-emerald-300">
              AuthFlow Pro
            </p>
            <h2 className="mt-2 text-3xl font-black text-zinc-950 dark:text-white">{title}</h2>
            <p className="mt-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>

          {children}
        </div>
      </section>
    </main>
  );
}

function AuthTab({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          "grid h-10 place-items-center rounded-md text-sm font-black transition",
          isActive
            ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-800 dark:text-white"
            : "text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white",
        ].join(" ")
      }
    >
      {children}
    </NavLink>
  );
}
