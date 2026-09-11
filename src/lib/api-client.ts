import type {
  Connection, ConnectionTestResult, TableListResponse, SchemaResponse, ERDResponse,
  TableSelectionResponse, ChatRequest, ChatResponse, SemanticLayer,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (res.status === 401) throw new ApiError(401, "Not authenticated");
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body.detail ?? `Request failed: ${res.status}`);
  }
  return res.json();
}

export interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  picture_url: string | null;
  sheets_connected: boolean;
}

export const api = {
  getCurrentUser: () => request<CurrentUser>("/auth/me"),
  logout: () => request<{ status: string }>("/auth/logout", { method: "POST" }),

  listConnections: () => request<Connection[]>("/connections"),

  createConnection: (name: string, source_type: string, config: Record<string, unknown>) =>
    request<Connection>("/connections", { method: "POST", body: JSON.stringify({ name, source_type, config }) }),

  createCSVConnection: async (name: string, files: File[]) => {
    const formData = new FormData();
    formData.append("name", name);
    files.forEach((f) => formData.append("files", f));
    const res = await fetch(`${API_URL}/connections/csv`, { method: "POST", body: formData, credentials: "include" });
    if (res.status === 401) throw new ApiError(401, "Not authenticated");
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new ApiError(res.status, body.detail ?? "Upload failed");
    }
    return res.json() as Promise<Connection>;
  },

  createGSheetsConnection: (name: string, sheet_url: string) =>
    request<Connection>("/connections/gsheets", { method: "POST", body: JSON.stringify({ name, sheet_url }) }),

  testConnection: (id: string) => request<ConnectionTestResult>(`/connections/${id}/test`, { method: "POST" }),
  listTables: (id: string) => request<TableListResponse>(`/connections/${id}/tables`),
  getSchema: (id: string, tables?: string[]) =>
    request<SchemaResponse>(`/connections/${id}/schema${tables ? `?tables=${tables.join(",")}` : ""}`),
  getERD: (id: string, tables?: string[]) =>
    request<ERDResponse>(`/connections/${id}/erd${tables ? `?tables=${tables.join(",")}` : ""}`),
  selectTables: (id: string, tableNames: string[]) =>
    request<TableSelectionResponse>(`/connections/${id}/tables/select`, { method: "POST", body: JSON.stringify({ table_names: tableNames }) }),
  getSelectedTables: (id: string) => request<TableSelectionResponse>(`/connections/${id}/tables/selected`),
  draftSemanticLayer: (id: string) => request<SemanticLayer>(`/connections/${id}/semantic/draft`, { method: "POST" }),
  getSemanticLayer: (id: string) => request<SemanticLayer>(`/connections/${id}/semantic`),
  updateSemanticLayer: (id: string, layer: SemanticLayer) =>
    request<SemanticLayer>(`/connections/${id}/semantic`, { method: "PUT", body: JSON.stringify(layer) }),
  deleteConnection: (id: string, hard = true) =>
    request<{ status: string }>(`/connections/${id}?hard=${hard}`, { method: "DELETE" }),
  chat: (payload: ChatRequest) => request<ChatResponse>("/chat", { method: "POST", body: JSON.stringify(payload) }),
};

export { ApiError };