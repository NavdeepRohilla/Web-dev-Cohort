const API_URL = import.meta.env.VITE_API_URL || "/api";

export async function apiRequest(path, options = {}) {
  const { method = "GET", body } = options;
  const headers = {
    Accept: "application/json",
  };

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  let response;
  let data;

  try {
    // Every frontend auth request goes to Express. credentials: "include"
    // lets the browser send the proxy cookies that Express maps to FreeAPI.
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
    data = await safeJson(response);
  } catch (error) {
    throw new Error("Unable to reach the AuthFlow Pro server.");
  }

  if (!response.ok || data?.success === false) {
    throw new Error(getErrorMessage(data, response.status));
  }

  return data;
}

async function safeJson(response) {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    return {};
  }
}

function getErrorMessage(data, status) {
  const firstError = Array.isArray(data?.errors) ? data.errors[0] : null;

  if (typeof firstError === "string") return firstError;
  if (firstError?.message) return firstError.message;
  if (data?.message) return data.message;
  if (status === 401) return "Please log in to continue.";
  if (status === 409) return "An account with those details already exists.";

  return "Something went wrong. Please try again.";
}
