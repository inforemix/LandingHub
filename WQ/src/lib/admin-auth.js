import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || process.env.ADMIN_TOKEN || "inforemix";
const ADMIN_COOKIE_NAME = "wq_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function getSessionToken() {
  return crypto.createHash("sha256").update(`${ADMIN_PASSWORD}:writequest-admin`).digest("hex");
}

export function isValidAdminPassword(password) {
  return Boolean(password) && password === ADMIN_PASSWORD;
}

export function getAdminCookieName() {
  return ADMIN_COOKIE_NAME;
}

export function getSetAdminCookieValue() {
  const parts = [
    `${ADMIN_COOKIE_NAME}=${getSessionToken()}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function getClearAdminCookieValue() {
  const parts = [
    `${ADMIN_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (process.env.NODE_ENV === "production") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

export function isAdminAuthorized(request) {
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token && token === ADMIN_PASSWORD) return true;

  const cookieToken = request.cookies?.get(ADMIN_COOKIE_NAME)?.value || "";
  return cookieToken === getSessionToken();
}

export function unauthorizedJson() {
  return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
}
