const slot = (provider: string) => `shipnote-key:${provider}`;

export function loadKey(provider: string) {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(slot(provider)) || sessionStorage.getItem(slot(provider)) || "";
}

export function isRemembered(provider: string) {
  return typeof window !== "undefined" && !!localStorage.getItem(slot(provider));
}

export function saveKey(provider: string, value: string, remember: boolean) {
  const target = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  other.removeItem(slot(provider));
  if (value) target.setItem(slot(provider), value);
  else target.removeItem(slot(provider));
}

export function clearKey(provider: string) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(slot(provider));
  sessionStorage.removeItem(slot(provider));
}
