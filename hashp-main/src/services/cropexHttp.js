const DEFAULT_CROPEX_BASE_URL = "https://hashmaramala-production.up.railway.app";

export function getCropexBaseUrl() {
  const raw =
    typeof import.meta !== "undefined" && import.meta.env?.VITE_CROPEX_API_BASE_URL
      ? import.meta.env.VITE_CROPEX_API_BASE_URL
      : DEFAULT_CROPEX_BASE_URL;
  return String(raw || DEFAULT_CROPEX_BASE_URL).replace(/\/+$/, "");
}

function buildCropexUrl(path) {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path || ""}`;
  return `${getCropexBaseUrl()}${normalizedPath}`;
}

function getErrorMessage(status, body) {
  if (typeof body === "string" && body.trim()) return body.trim();
  if (body && typeof body === "object") {
    if (typeof body.errors === "string" && body.errors.trim()) {
      const baseMessage =
        typeof body.message === "string" && body.message.trim() ? body.message.trim() : "";
      return baseMessage ? `${baseMessage}: ${body.errors.trim()}` : body.errors.trim();
    }
    if (Array.isArray(body.errors) && body.errors.length > 0) {
      const details = body.errors
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item === "object") {
            return (
              item.message ||
              item.error ||
              item.details ||
              ""
            ).trim();
          }
          return "";
        })
        .filter(Boolean)
        .join("; ");
      if (details) {
        const baseMessage =
          typeof body.message === "string" && body.message.trim() ? body.message.trim() : "";
        return baseMessage ? `${baseMessage}: ${details}` : details;
      }
    }
    if (typeof body.message === "string" && body.message.trim()) return body.message.trim();
    if (typeof body.error === "string" && body.error.trim()) return body.error.trim();
    if (typeof body.details === "string" && body.details.trim()) return body.details.trim();
  }
  return `Request failed with status ${status}.`;
}

async function parseCropexBody(response) {
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class CropexHttpError extends Error {
  constructor(message, status, body) {
    super(message);
    this.name = "CropexHttpError";
    this.status = status;
    this.body = body;
  }
}

export async function cropexFetch(path, opts = {}) {
  const {
    method = "GET",
    headers,
    body,
    token,
    ...rest
  } = opts;

  const finalHeaders = new Headers(headers || {});
  let finalBody = body;

  if (token) {
    finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (!finalHeaders.has("Accept")) {
    finalHeaders.set("Accept", "application/json");
  }

  if (body != null && !(body instanceof FormData)) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
    if (typeof body !== "string") {
      finalBody = JSON.stringify(body);
    }
  }

  let response;
  try {
    response = await fetch(buildCropexUrl(path), {
      method,
      headers: finalHeaders,
      body: finalBody,
      ...rest,
    });
  } catch (error) {
    throw new CropexHttpError(
      "Could not reach the Hashmar CropEx server.",
      0,
      { cause: error instanceof Error ? error.message : String(error || "") }
    );
  }

  const parsedBody = await parseCropexBody(response);
  if (!response.ok) {
    throw new CropexHttpError(getErrorMessage(response.status, parsedBody), response.status, parsedBody);
  }

  return parsedBody;
}
