import {
  getAdminAuthState,
  normalizeAdminRole,
  saveAdminSession,
  updateAdminTokens,
} from "@/lib/adminSession";

const DEFAULT_BASE_URL = "https://hashmaramala-production.up.railway.app";

function getBaseUrl() {
  const configured = (import.meta.env.VITE_HASHMAR_API_BASE_URL as string | undefined)?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (import.meta.env.DEV) return "/api";
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

function readBooleanish(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") {
      if (value === 1) return true;
      if (value === 0) return false;
    }
    if (typeof value === "string") {
      const normalized = value.trim().toLowerCase();
      if (!normalized) continue;
      if (normalized === "true" || normalized === "1" || normalized === "yes") return true;
      if (normalized === "false" || normalized === "0" || normalized === "no") return false;
    }
  }
  return undefined;
}

function extractRoot(data: unknown): Record<string, unknown> {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const payload = data as Record<string, unknown>;
  if (payload.data && typeof payload.data === "object" && !Array.isArray(payload.data)) {
    return payload.data as Record<string, unknown>;
  }
  return payload;
}

function extractTokens(data: unknown) {
  const root = extractRoot(data);
  const tokenSource =
    root.tokens && typeof root.tokens === "object"
      ? (root.tokens as Record<string, unknown>)
      : data && typeof data === "object" && (data as Record<string, unknown>).tokens && typeof (data as Record<string, unknown>).tokens === "object"
        ? ((data as Record<string, unknown>).tokens as Record<string, unknown>)
        : root;

  return {
    accessToken: readString(
      tokenSource.access_token,
      tokenSource.accessToken,
      root.access_token,
      root.accessToken,
      root.token,
    ),
    refreshToken: readString(
      tokenSource.refresh_token,
      tokenSource.refreshToken,
      root.refresh_token,
      root.refreshToken,
    ),
  };
}

function extractAuthUser(data: unknown): Record<string, unknown> {
  const root = extractRoot(data);
  const nestedUser =
    (root.user && typeof root.user === "object" && !Array.isArray(root.user) ? root.user : null) ||
    (root.admin && typeof root.admin === "object" && !Array.isArray(root.admin) ? root.admin : null) ||
    (data && typeof data === "object" && (data as Record<string, unknown>).user && typeof (data as Record<string, unknown>).user === "object"
      ? (data as Record<string, unknown>).user
      : null);

  if (nestedUser && typeof nestedUser === "object" && !Array.isArray(nestedUser)) {
    return nestedUser as Record<string, unknown>;
  }

  return root;
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

function asNestedRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** Build "First Last" from pairs until one pair yields non-empty parts. */
function composeFullNameFromPairs(...pairs: ReadonlyArray<readonly [unknown, unknown]>): string {
  for (const [a, b] of pairs) {
    const first = readString(a);
    const last = readString(b);
    if (!first && !last) continue;
    return `${first} ${last}`.trim();
  }
  return "";
}

/**
 * Many list/detail payloads nest profile under user/profile/agent/account or split name into parts.
 */
function resolveAgentDisplayFields(source: Record<string, unknown>) {
  const user = asNestedRecord(source.user);
  const profile = asNestedRecord(source.profile);
  const account = asNestedRecord(source.account);
  const agentNest = asNestedRecord(source.agent);
  const farmer = asNestedRecord(source.farmer);

  const name = readString(
    source.full_name,
    source.fullName,
    source.display_name,
    source.name,
    source.username,
    source.user_name,
    agentNest?.full_name,
    agentNest?.fullName,
    agentNest?.display_name,
    agentNest?.name,
    user?.full_name,
    user?.fullName,
    user?.display_name,
    user?.name,
    user?.username,
    profile?.full_name,
    profile?.fullName,
    profile?.name,
    farmer?.full_name,
    farmer?.fullName,
    farmer?.display_name,
    farmer?.name,
    composeFullNameFromPairs(
      [source.first_name, source.last_name],
      [agentNest?.first_name, agentNest?.last_name],
      [user?.first_name, user?.last_name],
      [profile?.first_name, profile?.last_name],
      [farmer?.first_name, farmer?.last_name],
    ),
  );

  const phone = readString(
    source.phone_number,
    source.phone,
    source.mobile,
    source.mobile_phone,
    source.telephone,
    agentNest?.phone_number,
    agentNest?.phone,
    agentNest?.mobile,
    user?.phone_number,
    user?.phone,
    profile?.phone_number,
    profile?.phone,
    account?.phone_number,
    account?.phone,
    farmer?.phone_number,
    farmer?.phone,
    farmer?.mobile,
  );

  const email = readString(
    source.email,
    agentNest?.email,
    user?.email,
    profile?.email,
    account?.email,
    farmer?.email,
  );

  const state = readString(
    source.state,
    source.state_name,
    source.state_of_origin,
    source.assigned_state,
    source.operation_state,
    agentNest?.state,
    user?.state,
    profile?.state,
    farmer?.state,
    farmer?.state_of_origin,
  );

  const lga = readString(
    source.lga,
    source.lga_name,
    source.local_government,
    source.local_govt_area,
    source.local_goverment_area,
    agentNest?.lga,
    user?.lga,
    profile?.lga,
    farmer?.lga,
    farmer?.local_government,
    farmer?.local_govt_area,
  );

  return { name, phone, email, state, lga };
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
    const detail =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : typeof error === "string" && error.trim()
          ? error.trim()
          : "";
    throw new AdminApiError(
      detail
        ? `Could not reach the Hashmar server. ${detail}`
        : "Could not reach the Hashmar server.",
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
    const refreshed = await apiFetch("/auth/refresh", {
      method: "POST",
      body: { refresh_token: tokens.refreshToken },
    });
    const nextTokens = extractTokens(refreshed);
    await updateAdminTokens({
      accessToken: nextTokens.accessToken,
      refreshToken: nextTokens.refreshToken,
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
  const user = extractAuthUser(response);
  const tokens = extractTokens(response);
  const topLevelRole =
    response && typeof response === "object" && !Array.isArray(response)
      ? (response as Record<string, unknown>).role
      : "";
  const roleRaw = readString(user?.role, root.role, topLevelRole);
  const normalized = normalizeAdminRole(roleRaw);
  if (roleRaw && !normalized) {
    throw new AdminApiError("This account is not an admin account.", 403, response);
  }
  const role = normalized || "ADMIN";
  await saveAdminSession(
    readString(user?.email, email),
    readString(user?.full_name, user?.name, "Admin"),
    {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: readString(user?.id),
      role,
    },
  );
  return response;
}

/** Admin login-flow reset: request OTP by email. */
export async function requestAdminPasswordResetOtp(email: string) {
  return apiFetch("/auth/reset-password", {
    method: "POST",
    body: { email: String(email || "").trim() },
  });
}

/** Admin login-flow reset: verify OTP by email. */
export async function verifyAdminPasswordResetOtp(input: { email: string; otp: string }) {
  const response = await apiFetch("/auth/verify", {
    method: "POST",
    body: {
      email: String(input.email || "").trim(),
      otp: String(input.otp || "").trim(),
    },
  });
  const tokens = extractTokens(response);
  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    response,
  };
}

/** Admin login-flow reset: set new password after OTP verify. */
export async function submitAdminPasswordReset(input: {
  newPassword: string;
  token: string;
}) {
  return apiFetch("/auth/change-password", {
    method: "POST",
    token: String(input.token || "").trim() || undefined,
    body: {
      new_password: String(input.newPassword || ""),
    },
  });
}

export async function registerAdmin(input: {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
}) {
  const body = {
    full_name: input.fullName.trim(),
    email: input.email.trim(),
    phone_number: input.phoneNumber.trim(),
    password: input.password,
  };
  try {
    return await sessionFetch("/admin/register", {
      method: "POST",
      body,
    });
  } catch (error) {
    // Some deployed backends expose only the super-admin registration route.
    if (error instanceof AdminApiError && error.status === 404) {
      return sessionFetch("/superadmin/register", {
        method: "POST",
        body,
      });
    }
    throw error;
  }
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
  registrationTimestamp: string;
  gender: string;
};

function derivePendingStatus(raw?: string) {
  const normalized = readString(raw).toUpperCase();
  if (
    ["ACTIVE", "APPROVED", "VERIFIED", "COMPLETE", "COMPLETED"].some((value) =>
      normalized.includes(value),
    )
  ) {
    return "verified";
  }
  return "pending";
}

function mapPendingRow(item: Record<string, unknown>) {
  const id = readString(
    item.agent_id,
    item.id,
    item.user_id,
    item.farmer_id,
    item.upgrade_id,
    item.request_id,
  );
  if (!id) return null;
  const fields = resolveAgentDisplayFields(item);
  const nestedUser = asNestedRecord(item.user);
  const nestedProfile = asNestedRecord(item.profile);
  const nestedFarmer = asNestedRecord(item.farmer);
  const gender = readString(
    item.gender,
    nestedUser?.gender,
    nestedProfile?.gender,
    nestedFarmer?.gender,
  );
  const statusRaw = readString(
    item.status,
    item.request_status,
    item.upgrade_status,
    nestedProfile?.status,
    nestedFarmer?.status,
  );
  const registrationTimestamp = readString(
    item.created_at,
    item.registration_date,
    item.requested_at,
    item.requested_date,
    item.date_created,
  );
  return {
    id,
    name: fields.name || "Agent",
    phone: fields.phone || "-",
    email: fields.email || "-",
    state: fields.state || "-",
    lga: fields.lga || "-",
    status: derivePendingStatus(statusRaw),
    registrationDate: formatDate(registrationTimestamp),
    registrationTimestamp,
    gender: gender || "-",
  };
}

export async function listPendingAgents(): Promise<PendingAgentRow[]> {
  const payload = await sessionFetch("/admin/pending-agents");
  return findArray(payload, ["data", "agents", "items", "results", "records", "rows"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      return mapPendingRow(row as Record<string, unknown>);
    })
    .filter(Boolean) as PendingAgentRow[];
}

export async function listFarmerUpgradeRequests(): Promise<PendingAgentRow[]> {
  const payload = await sessionFetch("/admin/upgrades/farmers-to-agents");
  return findArray(payload, [
    "data",
    "agents",
    "items",
    "results",
    "records",
    "rows",
    "requests",
    "farmers",
    "upgrades",
  ])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      return mapPendingRow(row as Record<string, unknown>);
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

export async function updateAgent(agentId: string, body: Record<string, unknown>) {
  return sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}`, {
    method: "PATCH",
    body,
  });
}

export async function deactivateAgent(agentId: string) {
  return sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}/deactivate`, {
    method: "POST",
  });
}

export async function reassignAgentLocation(agentId: string, input: { state: string; lga: string }) {
  return sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}/reassign-location`, {
    method: "PUT",
    body: {
      state: input.state.trim(),
      lga: input.lga.trim(),
    },
  });
}

export type AdminAgentListRow = {
  id: string;
  agentId: string;
  name: string;
  phone: string;
  regDate: string;
  state: string;
  lga: string;
  status: "Active" | "Inactive" | "Pending";
};

export type ListAdminAgentsParams = {
  status?: "ACTIVE" | "PENDING" | "SUSPENDED";
  search?: string;
  page?: number;
  pageSize?: number;
};

export type AdminAgentDetail = {
  agentId: string;
  name: string;
  email: string;
  phone: string;
  state: string;
  lga: string;
  status: AdminAgentListRow["status"];
  farmersOnboarded: string;
  gender: string;
  registrationDate: string;
  lastSync: string;
  lastActive: string;
  avatarUrl: string;
  verificationLabel: string;
};

export type AdminAgentEnrolledFarmerRow = {
  id: string;
  farmerId: string;
  name: string;
  regDate: string;
  state: string;
  lga: string;
};

function mapAgentStatus(
  value: string,
  isActive?: boolean,
): AdminAgentListRow["status"] {
  const normalized = readString(value).toUpperCase();
  if (normalized === "ACTIVE" || normalized === "APPROVED" || normalized === "VERIFIED") {
    return "Active";
  }
  if (normalized === "PENDING") return "Pending";
  if (normalized === "INACTIVE" || normalized === "DEACTIVATED" || normalized === "SUSPENDED") {
    return "Inactive";
  }
  if (isActive === false) return "Inactive";
  return "Active";
}

function mapVerificationLabel(status: AdminAgentListRow["status"]) {
  if (status === "Active") return "Verified";
  if (status === "Pending") return "Pending";
  return "Inactive";
}

export async function listAdminAgents(params: ListAdminAgentsParams = {}): Promise<AdminAgentListRow[]> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  if (params.search && params.search.trim()) query.set("search", params.search.trim());
  if (typeof params.page === "number" && Number.isFinite(params.page) && params.page > 0) {
    query.set("page", String(Math.trunc(params.page)));
  }
  if (typeof params.pageSize === "number" && Number.isFinite(params.pageSize) && params.pageSize > 0) {
    query.set("page_size", String(Math.trunc(params.pageSize)));
  }
  const suffix = query.toString();
  const payload = await sessionFetch(suffix ? `/admin/agents?${suffix}` : "/admin/agents");
  return findArray(payload, ["data", "agents", "items", "results", "records", "rows"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const agentId = readString(item.agent_id, item.id, item.user_id);
      if (!agentId) return null;
      const nestedUser = asNestedRecord(item.user);
      const nestedAgent = asNestedRecord(item.agent);
      const isActive = readBooleanish(
        item.is_active,
        nestedAgent?.is_active,
        nestedUser?.is_active,
      );
      const status = mapAgentStatus(readString(item.status), isActive);
      const fields = resolveAgentDisplayFields(item);
      return {
        id: readString(item.id, item.agent_id, item.user_id, agentId),
        agentId,
        name: fields.name || "Agent",
        phone: fields.phone || "-",
        regDate: formatDate(readString(item.created_at, item.registration_date)),
        state: fields.state || "-",
        lga: fields.lga || "-",
        status,
      };
    })
    .filter(Boolean) as AdminAgentListRow[];
}

export async function getAdminAgentDetail(agentId: string): Promise<AdminAgentDetail> {
  const payload = await sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}`);
  const row = findObject(payload, ["data", "agent", "item", "record"]) as Record<string, unknown>;
  const nestedAgent = asNestedRecord(row.agent);
  const nestedUser = asNestedRecord(row.user);
  const isActive = readBooleanish(
    row.is_active,
    nestedAgent?.is_active,
    nestedUser?.is_active,
  );
  const status = mapAgentStatus(readString(row.status), isActive);
  const fields = resolveAgentDisplayFields(row);
  const nestedProfile = asNestedRecord(row.profile);
  const gender = readString(row.gender, nestedUser?.gender, nestedProfile?.gender);
  return {
    agentId: readString(row.agent_id, row.id, row.user_id, agentId),
    name: fields.name || "Agent",
    email: fields.email || "-",
    phone: fields.phone || "-",
    state: fields.state || "-",
    lga: fields.lga || "-",
    status,
    farmersOnboarded:
      readString(row.farmers_onboarded, row.total_farmers_registered, row.total_farmers, 0) || "0",
    gender: gender || "-",
    registrationDate: formatDate(readString(row.created_at, row.registration_date)),
    lastSync: readString(row.last_sync_at, row.last_sync) || "-",
    lastActive: formatDate(readString(row.last_active_at, row.last_active, row.updated_at)),
    avatarUrl: readString(row.avatar_url, row.profile_photo_url, row.photo_url) || "/avatar-placeholder.svg",
    verificationLabel: readString(row.verification_label) || mapVerificationLabel(status),
  };
}

export async function getAgentEnrolledFarmers(
  agentId: string,
): Promise<AdminAgentEnrolledFarmerRow[]> {
  const payload = await sessionFetch(`/admin/agents/${encodeURIComponent(agentId)}/farmers`);
  return findArray(payload, ["data", "farmers", "items", "results", "records", "rows"])
    .map((row, index) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const farmerId = readString(item.farmer_id, item.id, item.client_id);
      if (!farmerId) return null;
      return {
        id: readString(item.id, item.farmer_id) || `${agentId}-${index}`,
        farmerId,
        name: readString(item.full_name, item.name) || "Farmer",
        regDate: formatDate(readString(item.created_at, item.registration_date)),
        state: readString(item.state_of_origin, item.state) || "-",
        lga: readString(item.lga, item.local_govt_area) || "-",
      };
    })
    .filter(Boolean) as AdminAgentEnrolledFarmerRow[];
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
    agentId: string;
    fullName: string;
    phone: string;
    email: string;
    registrationDate: string;
    gender: string;
    status: string;
    state: string;
    lga: string;
    photoUrl: string | null;
    totalFarmersRegistered: string;
    lastSync: string;
    lastActive: string;
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
  const biometrics = asNestedRecord(row.biometrics);
  const fingerprintItems = Array.isArray(biometrics?.fingerprints) ? (biometrics.fingerprints as unknown[]) : [];
  const hasCapturedFingerprint = fingerprintItems.some((entry) => {
    const fingerprint = asNestedRecord(entry);
    return Boolean(readString(fingerprint?.template, fingerprint?.finger, fingerprint?.id, fingerprint?.farmer_id));
  });
  const hasCapturedFace = Boolean(
    readString(
      biometrics?.face_photo,
      row.profile_photo_url,
      row.photo_url,
      row.profile_photo,
      row.photo,
      row.face_photo,
    ),
  );
  const enrollingAgentId = readString(row.enrolled_by_agent_id, row.agent_id, row.enrolling_agent_id);
  const enrolledAgentDetail = enrollingAgentId
    ? await getAdminAgentDetail(enrollingAgentId).catch(() => null)
    : null;

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
      agentId: enrolledAgentDetail?.agentId || enrollingAgentId,
      fullName:
        readString(enrolledAgentDetail?.name, row.agent_name, row.enrolling_agent_name) || "Unavailable",
      phone: readString(enrolledAgentDetail?.phone) || "-",
      email: readString(enrolledAgentDetail?.email) || "-",
      registrationDate: readString(enrolledAgentDetail?.registrationDate) || "-",
      gender: readString(enrolledAgentDetail?.gender) || "-",
      status: readString(enrolledAgentDetail?.status) || "Pending",
      state: readString(enrolledAgentDetail?.state, row.agent_state, row.state_of_origin) || "-",
      lga: readString(enrolledAgentDetail?.lga, row.agent_lga, row.lga) || "-",
      photoUrl: enrolledAgentDetail?.avatarUrl || null,
      totalFarmersRegistered: readString(enrolledAgentDetail?.farmersOnboarded) || "-",
      lastSync: readString(enrolledAgentDetail?.lastSync) || "-",
      lastActive: readString(enrolledAgentDetail?.lastActive) || "-",
    },
    biometric: {
      fingerprint: readString(row.fingerprint_status) || (hasCapturedFingerprint ? "Captured" : "Unavailable"),
      face: readString(row.face_status, row.biometric_status) || (hasCapturedFace ? "Captured" : "Unavailable"),
    },
    idCard: {
      fullName: readString(row.full_name, row.name) || "Farmer",
      farmerId: readString(row.farmer_id, row.id, farmerId),
      cooperativeName: readString(row.cooperative_name) || "-",
      agentName:
        readString(enrolledAgentDetail?.name, row.agent_name, row.enrolling_agent_name) || "-",
      issueDate: readString(row.issue_date) || "-",
      expiryDate: readString(row.expiry_date) || "-",
      photoUrl: readString(row.profile_photo_url, row.photo_url, row.profile_photo, row.photo) || null,
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

export type AdminSupportTicketStatus = "Open" | "In review" | "Resolved";

export type AdminSupportTicketRow = {
  id: string;
  issueType: string;
  description: string;
  farmerId: string;
  userId: string;
  agentId: string;
  agentName: string;
  agentPhone: string;
  agentEmail: string;
  agentAvatarUrl: string;
  state: string;
  status: AdminSupportTicketStatus;
  createdAt: string;
  raw: Record<string, unknown>;
};

function mapSupportTicketFields(item: Record<string, unknown>) {
  const agent = findObject(item, ["agent", "reporter", "user"]) as Record<string, unknown> | null;
  return {
    issueType: readString(item.issue_type, item.type, item.category) || "Reported issue",
    description: readString(item.description, item.details) || "No description provided.",
    farmerId: readString(item.farmer_id) || "-",
    userId: readString(item.user_id, item.reporter_id) || "-",
    agentId: readString(item.agent_id, agent?.id, agent?.agent_id) || "-",
    agentName:
      readString(
        item.agent_name,
        item.reporter_name,
        agent?.name,
        agent?.full_name,
        agent?.fullName,
      ) || "-",
    agentPhone:
      readString(item.agent_phone, agent?.phone, agent?.phone_number, agent?.phoneNumber) || "-",
    agentEmail: readString(item.agent_email, agent?.email) || "-",
    agentAvatarUrl:
      readString(
        item.agent_photo_url,
        agent?.profile_photo,
        agent?.profile_photo_url,
        agent?.avatar_url,
        agent?.photo_url,
      ) || "",
    state: readString(item.state, item.agent_state, agent?.state) || "-",
    status: mapSupportTicketStatus(readString(item.status)),
    createdAt: formatDate(readString(item.created_at, item.updated_at)),
  };
}

function mapSupportTicketStatus(value: string): AdminSupportTicketStatus {
  const normalized = readString(value).toUpperCase();
  if (normalized === "RESOLVED" || normalized === "CLOSED") return "Resolved";
  if (normalized === "IN_REVIEW" || normalized === "IN REVIEW" || normalized === "PENDING") {
    return "In review";
  }
  return "Open";
}

export async function listSupportTickets(): Promise<AdminSupportTicketRow[]> {
  const payload = await sessionFetch("/admin/support/tickets");
  return findArray(payload, ["data", "tickets", "items", "results", "records", "rows"])
    .map((row) => {
      if (!row || typeof row !== "object") return null;
      const item = row as Record<string, unknown>;
      const id = readString(item.id);
      if (!id) return null;
      return {
        id,
        ...mapSupportTicketFields(item),
        raw: item,
      };
    })
    .filter(Boolean) as AdminSupportTicketRow[];
}

function mapSupportTicketRow(row: unknown): AdminSupportTicketRow | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Record<string, unknown>;
  const id = readString(item.id);
  if (!id) return null;
  return {
    id,
    ...mapSupportTicketFields(item),
    raw: item,
  };
}

export async function getSupportTicketById(ticketId: string): Promise<AdminSupportTicketRow> {
  const payload = await sessionFetch(`/admin/support/tickets/${encodeURIComponent(ticketId)}`);
  const row = findObject(payload, ["data", "ticket", "item", "record"]);
  const mapped = mapSupportTicketRow(row);
  if (!mapped) throw new AdminApiError("Support ticket not found.", 404, payload);
  return mapped;
}

export async function updateSupportTicketStatus(
  ticketId: string,
  status: AdminSupportTicketStatus,
) {
  const backendStatus = status === "In review" ? "IN_REVIEW" : status.toUpperCase();
  const payload = await sessionFetch(`/admin/support/tickets/${encodeURIComponent(ticketId)}`, {
    method: "PATCH",
    body: { status: backendStatus },
  });
  const row = findObject(payload, ["data", "ticket", "item", "record"]);
  const mapped = mapSupportTicketRow(row);
  if (mapped) return mapped;
  return getSupportTicketById(ticketId);
}

export async function replayOutbox(rows: Array<{ kind: string; payload: unknown }>) {
  return sessionFetch("/admin/outbox/replay", {
    method: "POST",
    body: { rows },
  });
}
