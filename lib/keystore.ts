const KEY = "shipnote-key";
export function loadKey() { if (typeof window === "undefined") return ""; return localStorage.getItem(KEY) || sessionStorage.getItem(KEY) || ""; }
export function saveKey(value: string, remember: boolean) { const target = remember ? localStorage : sessionStorage; const other = remember ? sessionStorage : localStorage; other.removeItem(KEY); value ? target.setItem(KEY, value) : target.removeItem(KEY); }
export function clearKey() { if (typeof window !== "undefined") { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY); } }
