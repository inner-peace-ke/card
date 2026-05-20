const BASE = "/api";

function token() { return localStorage.getItem("wolf_token") ?? ""; }

export function setToken(t: string) { localStorage.setItem("wolf_token", t); }
export function clearToken() { localStorage.removeItem("wolf_token"); localStorage.removeItem("wolf_user"); }
export function getUser(): { username: string } | null {
  try { return JSON.parse(localStorage.getItem("wolf_user") ?? "null"); } catch { return null; }
}
export function setUser(u: object) { localStorage.setItem("wolf_user", JSON.stringify(u)); }

async function req(method: string, path: string, body?: object, superToken?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token()) headers["Authorization"] = `Bearer ${token()}`;
  if (superToken) headers["x-super-token"] = superToken;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "Request failed");
  return json;
}

export const api = {
  get:    (p: string)          => req("GET",    p),
  post:   (p: string, b: object) => req("POST",   p, b),
  put:    (p: string, b: object) => req("PUT",    p, b),
  delete: (p: string)          => req("DELETE",  p),
  superGet:  (p: string, t: string)          => req("GET",  p, undefined, t),
  superPost: (p: string, b: object, t: string) => req("POST", p, b, t),
  superPut:  (p: string, b: object, t: string) => req("PUT",  p, b, t),
};
