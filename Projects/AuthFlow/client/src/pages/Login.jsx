import { LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { validateLogin } from "../utils/validation.js";

const initialValues = {
  username: "",
  password: "",
};

export default function Login() {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTo = location.state?.from?.pathname || "/dashboard";

  function updateValue(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validateLogin(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setIsLoading(true);
    try {
      const user = await login({
        username: values.username.trim(),
        password: values.password,
      });
      showToast(`Welcome back, ${user.username}.`, "success");
      navigate(redirectTo, { replace: true });
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Login with your FreeAPI username and password.">
      <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
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
          autoComplete="current-password"
        />

        <button type="submit" className="primary-button mt-2" disabled={isLoading}>
          {isLoading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          ) : (
            <LogIn size={18} />
          )}
          <span>{isLoading ? "Logging in" : "Login"}</span>
        </button>

        <p className="text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
          New here?{" "}
          <Link className="font-black text-emerald-700 dark:text-emerald-300" to="/register">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
