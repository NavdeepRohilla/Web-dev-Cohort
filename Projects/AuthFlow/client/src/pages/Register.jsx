import { UserPlus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateRegister } from "../utils/validation.js";

const initialValues = {
  email: "",
  username: "",
  password: "",
  role: "USER",
};

export default function Register() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateRegister(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      await register({
        email: values.email.trim(),
        username: values.username.trim(),
        password: values.password,
        role: values.role,
      });
      showToast("Account created. You can log in now.", "success");
      navigate("/login", { replace: true });
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Create account" subtitle="Register a USER or ADMIN profile through FreeAPI.">
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
        <div>
          <div className="field-shell">
            <input
              id="email"
              name="email"
              className="field-input"
              value={values.email}
              onChange={updateValue}
              autoComplete="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
            />
            <label className="field-label" htmlFor="email">
              Email
            </label>
          </div>
          <p id="email-error" className="field-error mt-1">
            {errors.email || ""}
          </p>
        </div>

        <div>
          <div className="field-shell">
            <input
              id="username"
              name="username"
              className="field-input"
              value={values.username}
              onChange={updateValue}
              autoComplete="username"
              aria-invalid={Boolean(errors.username)}
              aria-describedby={errors.username ? "username-error" : undefined}
            />
            <label className="field-label" htmlFor="username">
              Username
            </label>
          </div>
          <p id="username-error" className="field-error mt-1">
            {errors.username || ""}
          </p>
        </div>

        <PasswordInput
          id="password"
          label="Password"
          value={values.password}
          onChange={updateValue}
          error={errors.password}
          autoComplete="new-password"
        />

        <div>
          <div className="field-shell">
            <select
              id="role"
              name="role"
              className="field-input appearance-none"
              value={values.role}
              onChange={updateValue}
              aria-invalid={Boolean(errors.role)}
              aria-describedby={errors.role ? "role-error" : undefined}
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <label className="field-label" htmlFor="role">
              Role
            </label>
          </div>
          <p id="role-error" className="field-error mt-1">
            {errors.role || ""}
          </p>
        </div>

        <button type="submit" className="primary-button mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <UserPlus size={18} />
          )}
          <span>{isLoading ? "Creating account" : "Register"}</span>
        </button>

        <p className="text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          Already registered?{" "}
          <Link className="font-black text-emerald-700 dark:text-emerald-300" to="/login">
            Back to login
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
