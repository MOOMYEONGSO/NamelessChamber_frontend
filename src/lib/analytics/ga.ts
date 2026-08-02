type EventValue = string | number | boolean | null | undefined;
type EventParams = Record<string, EventValue>;

let gaConfigured = false;
let lastTrackedPath = "";

declare global {
  interface Window {
    dataLayer: Array<Record<string, unknown>>;
  }
}

function ensureDataLayer() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
}

export function initGa() {
  if (gaConfigured) return;
  ensureDataLayer();
  gaConfigured = true;
}

export function trackPageView(path: string) {
  ensureDataLayer();
  if (!gaConfigured || path === lastTrackedPath) return;

  lastTrackedPath = path;
  window.dataLayer.push({
    event: "page_view",
    page_path: path,
    page_location: `${window.location.origin}${path}`,
    page_title: document.title,
  });
}

export function trackEvent(eventName: string, params: EventParams = {}) {
  ensureDataLayer();
  if (!gaConfigured) return;

  window.dataLayer.push({
    event: eventName,
    ...params,
  });
}
