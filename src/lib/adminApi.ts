import {
  getAdminAuthState,
  saveAdminSession,
  updateAdminTokens,
} from "@/lib/adminSession";

const DEFAULT_BASE_URL = "https://hashmaramala-production.up.railway.app";

function getBaseUrl() {
  return DEFAULT_BASE_URL.replace(/\/+$/, "");
}

function buildUrl(path: string) {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getBaseUrl()}${normalized}`;
}

function readString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function extractRoot(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const payload = data as Record<string, unknown>;
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data as Record<string, unknown>;
  }
  return payload;
}

function findArray(payload: unknown, keys: string[]): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const source = payload as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(source[key])) return source[key] as unknown[];
  }
  for (const key of keys) {
    const child = source[key];
    if (child && typeof child === "object") {
      const found = findArray(child, keys);
      if (found.length) return found;
    }
  }
  return [];
}

function findObject(payload: unknown, keys: string[]) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return payload;
  const source = payload as Record<string, unknown>;
  for (const key of keys) {
    const child = source[key];
    if (child && typeof child === "object" && !Array.isArray(child)) return child;
  }
  return payload;
}

function formatDate(value: string) {
  if (!value) return "-";
  if (!value.includes("T")) return value;
  return value.slice(0, 10).split("-").reverse().join("/");
}

function getErrorMessage(status: number, body: unknown) {
  if (typeof body === "string" && body.trim()) return body.trim();
  if (body && typeof body === "object") {
    const source = body as Record<string, unknown>;
    const message = readString(source.message);
    const details = readString(source.errors, source.error, source.details);
    if (message && details) return `${message}: ${details}`;
    if (details) return details;
    if (message) return message;
  }
  return `Request failed with status ${status}.`;
}

async function parseBody(response: Response) {
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

export class AdminApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "AdminApiError";
    this.status = status;
    this.body = body;
  }
}

async function apiFetch(
  path: string,
  opts: Omit<RequestInit, "body"> & { token?: string; body?: unknown } = {},
) {
  const { token, headers, body, ...rest } = opts;
  const finalHeaders = new Headers(headers || {});
  let finalBody = body;

  finalHeaders.set("Accept", "application/json");
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  if (body != null && !(body instanceof FormData)) {
    if (!finalHeaders.has("Content-Type")) {
      finalHeaders.set("Content-Type", "application/json");
    }
    if (typeof body !== "string") {
      finalBody = JSON.stringify(body);
    }
  }

  let response: Response;
  try {
    response = await fetch(buildUrl(path), {
      ...rest,
      headers: finalHeaders,
      body: finalBody as BodyInit | null | undefined,
    });
  } catch (error) {
    throw new AdminApiError(
      "Could not reach the Hashmar server.",
      0,
      error instanceof Error ? error.message : error,
    );
  }

  const parsed = await parseBody(response);
  if (!response.ok) {
    throw new AdminApiError(getErrorMessage(response.status, parsed), response.status, parsed);
  }

  return parsed;
}

function getStoredTokens() {
  const auth = getAdminAuthState();
  return {
    accessToken: readString(auth?.accessToken),
    refreshToken: readString(auth?.refreshToken),
  };
}

async function sessionFetch(
  path: string,
  opts: Omit<RequestInit, "body"> & { body?: unknown } = {},
  retry = true,
) {
  const tokens = getStoredTokens();
  try {
    return await apiFetch(path, { ...opts, token: tokens.accessToken || undefined });
  } catch (error) {
    if (!(error instanceof AdminApiError) || error.status !== 401 || !retry || !tokens.refreshToken) {
      throw error;
    }
    const refreshed = await apiFetch("/agents/refresh", {
      method: "POST",
      body: { refresh_token: tokens.refreshToken },
    });
    await updateAdminTokens({
      accessToken: readString(
        (refreshed as any)?.tokens?.access_token,
        (refreshed as any)?.access_token,
        (refreshed as any)?.token,
      ),
      refreshToken: readString(
        (refreshed as any)?.tokens?.refresh_token,
        (refreshed as any)?.refresh_token,
      ),
    });
    return sessionFetch(path, opts, false);
  }
}

export async function loginAdmin(email: string, password: string) {
  const response = await apiFetch("/auth/login", {
    method: "POST",
    body: { email, password },
  });
  const root = extractRoot(response);
  const user = findObject(response, ["user", "admin", "data"]) as Record<string, unknown>;
  const role = readString(user?.role, root.role);
  if (role && role !== "ADMIN") {
    throw new AdminApiError("This account is not an admin account.", 403, response);
  }
  await saveAdminSession(
    readString(user?.email, email),
    readString(user?.full_name, user?.name, "Admin"),
    {
      accessToken: readString(
        (response as any)?.tokens?.access_token,
        (response as any)?.access_token,
        (root as any)?.access_token,
      ),
      refreshToken: readString(
        (response as any)?.tokens?.refresh_token,
        (response as any)?.refresh_token,
        (root as any)?.refresh_token,
      ),
      userId: readString(user?.id),
      role: role || "ADMIN",
    },
  );
  return response;
}

export type AdminGeoOption = { id: string; name: string };

export async function getGeoStates() {
  const payload = await apiFetch("/geo/states");
  return findArray(payload, ["data", "states", "items", "results", "records"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = readString(item.id, item.code, item.name);
      const name = readString(item.name, item.state);
      return id && name ? { id, name } : null;
    })
    .filter(Boolean) as AdminGeoOption[];
}

export async function getGeoLgas(stateId: string) {
  const payload = await apiFetch(`/geo/states/${encodeURIComponent(stateId)}/lgas`);
  return findArray(payload, ["data", "lgas", "items", "results", "records"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = readString(item.id, item.name);
      const name = readString(item.name, item.lga);
      return id && name ? { id, name } : null;
    })
    .filter(Boolean) as AdminGeoOption[];
}

export async function syncGeoData() {
  return sessionFetch("/admin/geo/sync", { method: "POST" });
}

export type PendingAgentRow = {
  id: string;
  name: string;
  phone: string;
  email: string;
  state: string;
  lga: string;
  status: "pending" | "verified";
  registrationDate: string;
  gender: string;
};

export async function listPendingAgents(): Promise<PendingAgentRow[]> {
  const payload = await sessionFetch("/admin/pending-agents");
  return findArray(payload, ["data", "agents", "items", "results", "records", "rows"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = readString(item.id, item.agent_id, item.user_id);
      if (!id) return null;
      return {
        id,
        name: readString(item.full_name, item.name) || "Agent",
        phone: readString(item.phone_number, item.phone) || "-",
        email: readString(item.email) || "-",
        state: readString(item.state) || "-",
        lga: readString(item.lga) || "-",
        status: readString(item.status).toUpperCase() === "ACTIVE" ? "verified" : "pending",
        registrationDate: formatDate(readString(item.created_at, item.registration_date)),
        gender: readString(item.gender) || "-",
      };
    })
    .filter(Boolean) as PendingAgentRow[];
}

export async function decideAgentApproval(agentId: string, status: "ACTIVE" | "REJECTED", rejectionReason = "") {
  return sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}/approve`, {
    method: "POST",
    body: {
      status,
      ...(status === "REJECTED" && rejectionReason ? { rejection_reason: rejectionReason } : {}),
    },
  });
}

export type AdminFarmerRow = {
  id: string;
  farmerId: string;
  name: string;
  regDate: string;
  state: string;
  lga: string;
  crop: string;
  gender: string;
  phone: string;
  raw: Record<string, unknown>;
};

export async function listFarmers(): Promise<AdminFarmerRow[]> {
  const payload = await sessionFetch("/farmers?page=1&page_size=200");
  return findArray(payload, ["data", "farmers", "items", "results", "records", "rows"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const farmerId = readString(item.farmer_id, item.id, item.client_id);
      if (!farmerId) return null;
      const primaryCrops = Array.isArray(item.primary_crops) ? item.primary_crops : [];
      return {
        id: readString(item.id, item.farmer_id, item.client_id),
        farmerId,
        name: readString(item.full_name, item.name) || "Farmer",
        regDate: formatDate(readString(item.created_at, item.updated_at, item.issue_date)),
        state: readString(item.state_of_origin, item.state) || "-",
        lga: readString(item.lga, item.local_govt_area) || "-",
        crop: readString(primaryCrops[0], item.crop_type, item.primary_crop) || "-",
        gender: readString(item.gender) || "-",
        phone: readString(item.phone_number, item.phone) || "-",
        raw: item,
      };
    })
    .filter(Boolean) as AdminFarmerRow[];
}

export type AdminFarmerDetailData = {
  farmerId: string;
  personal: {
    fullName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    address: string;
    nin: string;
    bvn: string;
  };
  farm: {
    farmSize: string;
    farmLocation: string;
    cropType: string;
    soilType: string;
    landOwnership: string;
  };
  cooperative: {
    cooperativeName: string;
    registrationNumber: string;
    membershipRole: string;
    lga: string;
    commodityFocus: string[];
    cooperativeSize: string;
    landOwnershipType: string;
    farmSizeHectares: string;
    inputSupplier: string;
  };
  enrollingAgent: {
    fullName: string;
    state: string;
    lga: string;
  };
  biometric: { fingerprint: string; face: string };
  idCard: {
    fullName: string;
    farmerId: string;
    cooperativeName: string;
    agentName: string;
    issueDate: string;
    expiryDate: string;
    photoUrl: string | null;
  };
  raw: Record<string, unknown>;
};

export async function getFarmerDetail(farmerId: string): Promise<AdminFarmerDetailData> {
  const payload = await sessionFetch(`/farmers/${encodeURIComponent(farmerId)}`);
  const row = findObject(payload, ["data", "farmer", "item", "record"]) as Record<string, unknown>;
  const primaryCrops = Array.isArray(row.primary_crops) ? (row.primary_crops as string[]) : [];
  return {
    farmerId: readString(row.farmer_id, row.id, farmerId),
    personal: {
      fullName: readString(row.full_name, row.name) || "Farmer",
      dateOfBirth: readString(row.date_of_birth) || "-",
      gender: readString(row.gender) || "-",
      phone: readString(row.phone_number, row.phone) || "-",
      address: readString(row.residential_address, row.address) || "-",
      nin: readString(row.nin) || "-",
      bvn: readString(row.bvn) || "-",
    },
    farm: {
      farmSize: readString(row.farm_size) || "-",
      farmLocation: readString(row.farm_location, row.residential_address) || "-",
      cropType: readString(primaryCrops[0], row.crop_type, row.primary_crop) || "-",
      soilType: readString(row.soil_type) || "-",
      landOwnership: readString(row.land_ownership) || "-",
    },
    cooperative: {
      cooperativeName: readString(row.cooperative_name) || "-",
      registrationNumber: readString(row.cooperative_reg_no) || "-",
      membershipRole: readString(row.membership_role) || "-",
      lga: readString(row.cooperative_lga, row.lga) || "-",
      commodityFocus: primaryCrops,
      cooperativeSize: readString(row.cooperative_size) || "-",
      landOwnershipType: readString(row.land_ownership) || "-",
      farmSizeHectares: readString(row.farm_size) || "-",
      inputSupplier: readString(row.input_supplier) || "-",
    },
    enrollingAgent: {
      fullName: readString(row.agent_name, row.enrolling_agent_name) || "Unavailable",
      state: readString(row.agent_state, row.state_of_origin) || "-",
      lga: readString(row.agent_lga, row.lga) || "-",
    },
    biometric: {
      fingerprint: readString(row.fingerprint_status) || "Unavailable",
      face: readString(row.face_status, row.biometric_status) || "Unavailable",
    },
    idCard: {
      fullName: readString(row.full_name, row.name) || "Farmer",
      farmerId: readString(row.farmer_id, row.id, farmerId),
      cooperativeName: readString(row.cooperative_name) || "-",
      agentName: readString(row.agent_name, row.enrolling_agent_name) || "-",
      issueDate: readString(row.issue_date) || "-",
      expiryDate: readString(row.expiry_date) || "-",
      photoUrl: readString(row.profile_photo_url, row.profile_photo) || null,
    },
    raw: row,
  };
}

export async function updateFarmer(farmerId: string, body: Record<string, unknown>) {
  return sessionFetch(`/admin/farmers/${encodeURIComponent(farmerId)}`, {
    method: "PATCH",
    body: body as unknown,
  });
}
