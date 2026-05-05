import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export default function PasswordInput({ id, label, value, onChange, error, autoComplete }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div>
      <div className="field-shell">
        <input
          id={id}
          name={id}
          className="field-input pr-12"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsVisible((current) => !current)}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-md text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label={isVisible ? "Hide password" : "Show password"}
        >
          {isVisible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <p id={`${id}-error`} className="field-error mt-1">
        {error || ""}
      </p>
    </div>
  );
}
