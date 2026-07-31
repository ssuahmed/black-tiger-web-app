/**
 * Lazy-load Google Maps JS API when NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is set.
 * @returns {Promise<typeof google.maps | null>}
 */
export function loadGoogleMaps() {
  if (typeof window === "undefined") return Promise.resolve(null);
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key) return Promise.resolve(null);
  if (window.google?.maps) return Promise.resolve(window.google.maps);

  if (window.__btGoogleMapsPromise) return window.__btGoogleMapsPromise;

  window.__btGoogleMapsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&libraries=places`;
    script.async = true;
    script.onload = () => resolve(window.google?.maps ?? null);
    script.onerror = () => reject(new Error("Failed to load Google Maps"));
    document.head.appendChild(script);
  });
  return window.__btGoogleMapsPromise;
}
