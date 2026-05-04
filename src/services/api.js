const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

const apiClient = {
  async request(path, options = {}, token) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) const detail = Array.isArray(data.detail) 
  ? data.detail.map(d => d.msg).join(", ") 
  : data.detail || "Erro desconhecido";
throw new ApiError(detail, res.status);
    return data;
  },
  get:    (path, token)        => apiClient.request(path, {}, token),
  post:   (path, body, token)  => apiClient.request(path, { method: "POST",   body: JSON.stringify(body) }, token),
  put:    (path, body, token)  => apiClient.request(path, { method: "PUT",    body: JSON.stringify(body) }, token),
  delete: (path, token)        => apiClient.request(path, { method: "DELETE" }, token),
};

export default apiClient;
