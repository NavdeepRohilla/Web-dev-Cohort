import axios from "axios";

const FREEAPI_BASE_URL =
  process.env.FREEAPI_BASE_URL || "https://api.freeapi.app/api/v1/users";

export async function forwardToFreeApi(req, res, next, options) {
  const { method, path, successMessage } = options;

  try {
    // Express is the only service the React app calls. This proxy forwards the
    // JSON body and any auth cookies from the browser to the real FreeAPI auth
    // endpoint, then maps the upstream response into a predictable shape.
    const upstreamResponse = await axios({
      method,
      url: `${FREEAPI_BASE_URL}${path}`,
      data: ["POST", "PUT", "PATCH"].includes(method) ? req.body : undefined,
      validateStatus: () => true,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Cookie: req.headers.cookie || "",
      },
    });

    applyUpstreamCookies(res, upstreamResponse.headers["set-cookie"]);

    const payload = normalizeResponse(upstreamResponse.data, {
      status: upstreamResponse.status,
      fallbackMessage: successMessage,
    });

    res.status(upstreamResponse.status).json(payload);
  } catch (error) {
    next({
      statusCode: 502,
      message: "Unable to reach the upstream authentication service.",
    });
  }
}

function normalizeResponse(data, { status, fallbackMessage }) {
  const success = data?.success ?? status < 400;
  const message =
    data?.message || (success ? fallbackMessage : "Authentication request failed");

  return {
    success,
    statusCode: data?.statusCode || status,
    message,
    data: data?.data ?? null,
    errors: data?.errors ?? [],
  };
}

function applyUpstreamCookies(res, cookies = []) {
  if (!Array.isArray(cookies) || cookies.length === 0) return;

  // FreeAPI sets cookies for api.freeapi.app. A browser will reject those from a
  // localhost proxy, so the Domain attribute is removed and local-dev-friendly
  // SameSite/Secure attributes are applied before returning them to React.
  const rewrittenCookies = cookies.map(rewriteCookieForLocalProxy);
  res.setHeader("Set-Cookie", rewrittenCookies);
}

function rewriteCookieForLocalProxy(cookie) {
  const parts = cookie
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  const [nameAndValue, ...attributes] = parts;
  const cleanedAttributes = attributes.filter((attribute) => {
    const lower = attribute.toLowerCase();
    if (lower.startsWith("domain=")) return false;
    if (lower.startsWith("path=")) return false;
    if (process.env.NODE_ENV !== "production" && lower === "secure") return false;
    if (lower.startsWith("samesite=")) return false;
    return true;
  });

  cleanedAttributes.push("Path=/");
  cleanedAttributes.push(
    process.env.NODE_ENV === "production" ? "SameSite=None" : "SameSite=Lax",
  );

  if (process.env.NODE_ENV === "production") {
    cleanedAttributes.push("Secure");
  }

  return [nameAndValue, ...cleanedAttributes].join("; ");
}
