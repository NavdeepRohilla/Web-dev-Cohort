export function validateLogin(values) {
  const errors = {};

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  }

  return errors;
}

export function validateRegister(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.username.trim()) {
    errors.username = "Username is required.";
  } else if (values.username.trim().length < 3) {
    errors.username = "Username must be at least 3 characters.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }

  if (!["ADMIN", "USER"].includes(values.role)) {
    errors.role = "Choose ADMIN or USER.";
  }

  return errors;
}
