"use client";

import { useEffect, useRef, useState } from "react";
import { CrosshairIcon, PinIcon } from "@/components/checkout/icons/CheckoutIcons";
import * as checkoutApi from "@/lib/api/checkout";
import { loadGoogleMaps } from "@/lib/maps/loadGoogleMaps";
import { resolveAddressWithGoogleMaps } from "@/lib/maps/resolveAddressWithGoogleMaps";

const DEFAULT_LOCATION = { lat: 24.7136, lng: 46.6753 };
const RESOLVE_DEBOUNCE_MS = 450;
const PLACEHOLDER_TITLES = new Set(["selected location", "current location"]);

/**
 * @param {{
 *   value?: { lat?: number | null; lng?: number | null; placeId?: string; formattedAddress?: string };
 *   onConfirm?: (resolved: Record<string, unknown>) => void;
 * }} props
 */
export default function MapLocationPicker({ value, onConfirm }) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const resolveSeq = useRef(0);
  const idleTimer = useRef(null);
  const initialCoordinates = useRef({
    lat: value?.lat ?? DEFAULT_LOCATION.lat,
    lng: value?.lng ?? DEFAULT_LOCATION.lng,
  });
  const [query, setQuery] = useState(value?.formattedAddress || "");
  const [location, setLocation] = useState({
    lat: value?.lat ?? DEFAULT_LOCATION.lat,
    lng: value?.lng ?? DEFAULT_LOCATION.lng,
    placeId: value?.placeId || "",
    formattedAddress: value?.formattedAddress || "",
    title: "",
    subtitle: "",
  });
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    let idleListener = null;
    loadGoogleMaps()
      .then((maps) => {
        if (!alive || !maps || !mapNode.current) return;
        setMapsAvailable(true);
        const center = {
          lat: Number(initialCoordinates.current.lat),
          lng: Number(initialCoordinates.current.lng),
        };
        const map = new maps.Map(mapNode.current, {
          center,
          zoom: 17,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        idleListener = map.addListener("idle", () => {
          const next = map.getCenter();
          if (!next) return;
          const lat = next.lat();
          const lng = next.lng();
          setLocation((current) => ({ ...current, lat, lng }));
          if (idleTimer.current) window.clearTimeout(idleTimer.current);
          idleTimer.current = window.setTimeout(() => {
            void resolve({ lat, lng }, { quiet: true });
          }, RESOLVE_DEBOUNCE_MS);
        });
      })
      .catch(() => setMapsAvailable(false));
    return () => {
      alive = false;
      if (idleTimer.current) window.clearTimeout(idleTimer.current);
      if (idleListener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(idleListener);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * @param {{ lat?: number; lng?: number; query?: string; placeId?: string }} input
   * @param {{ quiet?: boolean; pan?: boolean }} [opts]
   */
  async function resolve(input, opts = {}) {
    const seq = ++resolveSeq.current;
    if (!opts.quiet) {
      setBusy(true);
      setError("");
    }
    try {
      let address = await resolveAddressWithGoogleMaps(input);
      if (!address) {
        const data = await checkoutApi.resolveCheckoutAddress(input);
        address = data?.address ?? data?.item ?? data ?? {};
      }
      if (seq !== resolveSeq.current) return null;
      const nextLocation = {
        lat: Number(address?.latitude ?? address?.lat ?? input.lat ?? location.lat),
        lng: Number(address?.longitude ?? address?.lng ?? input.lng ?? location.lng),
        placeId: String(address?.placeId ?? ""),
        formattedAddress: String(address?.formattedAddress ?? address?.address ?? query),
        title: shortTitle(address),
        subtitle: shortSubtitle(address),
        ...pickAddressFields(address),
      };
      setLocation(nextLocation);
      if (!opts.quiet || input.query) {
        setQuery(nextLocation.formattedAddress);
      }
      if (opts.pan && mapRef.current) {
        mapRef.current.panTo({ lat: nextLocation.lat, lng: nextLocation.lng });
        mapRef.current.setZoom?.(17);
      }
      return { ...address, ...nextLocation };
    } catch (err) {
      if (seq !== resolveSeq.current) return null;
      if (!opts.quiet) {
        setError(err instanceof Error ? err.message : "Could not find this location.");
      }
      return null;
    } finally {
      if (seq === resolveSeq.current && !opts.quiet) setBusy(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Current location is unavailable in this browser.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        void resolve({ lat: coords.latitude, lng: coords.longitude }, { pan: true });
      },
      () => {
        setBusy(false);
        setError("Location permission was not granted.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function confirm() {
    const center = mapRef.current?.getCenter?.();
    const lat = center ? center.lat() : location.lat;
    const lng = center ? center.lng() : location.lng;
    const payload = await resolve({ lat, lng });
    if (payload) onConfirm?.(payload);
  }

  return (
    <div className="co-map-picker">
      <div className="co-map-picker__canvas">
        <div className="co-map-picker__toolbar">
          <form
            className="co-map-picker__search"
            onSubmit={(event) => {
              event.preventDefault();
              if (query.trim()) void resolve({ query: query.trim() }, { pan: true });
            }}
          >
            <span className="co-map-picker__search-icon" aria-hidden>
              ⌕
            </span>
            <input
              className="co-map-picker__search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for your short address, building..."
              aria-label="Search address"
            />
          </form>
          <button
            type="button"
            className="co-map-picker__locate"
            onClick={useCurrentLocation}
            disabled={busy}
          >
            <CrosshairIcon className="size-4" />
            Use current location
          </button>
        </div>

        <div ref={mapNode} className="co-map-picker__map" />
        {!mapsAvailable ? (
          <div className="co-map-picker__fallback">
            <PinIcon className="size-10 text-blue-700" />
            <span>Map preview unavailable — search or use current location</span>
          </div>
        ) : null}

        <div className="co-map-picker__pin" aria-hidden>
          <div className="co-map-picker__tooltip">Your order will be delivered here</div>
          <div className="co-map-picker__pin-dot" />
        </div>
      </div>

      {error ? <p className="co-map-picker__error">{error}</p> : null}

      <div className="co-map-picker__footer">
        <div className="co-map-picker__current">
          <span className="co-map-picker__current-icon">
            <PinIcon className="size-5" />
          </span>
          <span className="min-w-0">
            <span className="co-map-picker__current-label">Current location</span>
            <strong className="co-map-picker__current-title">
              {location.title || location.formattedAddress || "Selected location"}
            </strong>
            <span className="co-map-picker__current-sub">
              {location.subtitle ||
                `${Number(location.lat).toFixed(5)}, ${Number(location.lng).toFixed(5)}`}
            </span>
          </span>
        </div>
        <button type="button" className="co-map-picker__confirm" onClick={confirm} disabled={busy}>
          Confirm location
        </button>
      </div>
    </div>
  );
}

function pickAddressFields(address) {
  return {
    placeName: usableName(address?.placeName || address?.name),
    buildingNo: String(address?.buildingNo || ""),
    street: String(address?.street || ""),
    secondary: String(address?.secondary || ""),
    neighborhood: String(address?.neighborhood || ""),
    district: String(address?.district || ""),
    city: String(address?.city || ""),
    stateProvince: String(address?.stateProvince || address?.stateCode || ""),
    stateCode: String(address?.stateCode || ""),
    postalCode: String(address?.postalCode || ""),
    countryCode: String(address?.countryCode || ""),
    country: String(address?.country || ""),
    landmark: usableName(address?.landmark || address?.placeName || address?.name),
    nationalAddress: String(address?.nationalAddress || ""),
  };
}

function usableName(value) {
  const name = String(value || "").trim();
  if (!name || PLACEHOLDER_TITLES.has(name.toLowerCase())) return "";
  return name;
}

function shortTitle(address) {
  const placeName = usableName(address?.placeName || address?.name || address?.landmark);
  if (placeName) return placeName;
  const national = String(address?.nationalAddress || "").trim();
  if (national) return national;
  if (address?.buildingNo && address?.street) return `${address.buildingNo} ${address.street}`;
  if (address?.street) return String(address.street);
  const formatted = String(address?.formattedAddress || "");
  if (formatted) return formatted.split(",")[0]?.trim() || formatted;
  return "Selected location";
}

function shortSubtitle(address) {
  const placeName = usableName(address?.placeName || address?.name);
  const parts = [
    address?.street && address?.buildingNo
      ? `${address.buildingNo} ${address.street}`
      : address?.street,
    address?.district || address?.neighborhood,
    address?.city,
    countryName(address?.countryCode) || address?.country,
  ].filter(Boolean);
  const filtered = parts.filter((part) => String(part).trim() !== placeName);
  if (filtered.length) return filtered.join(" · ");
  return String(address?.formattedAddress || "")
    .split(",")
    .slice(1)
    .join(",")
    .trim();
}

function countryName(code) {
  if (code === "SA") return "Saudi Arabia";
  if (code === "SN") return "Senegal";
  if (code === "AE") return "United Arab Emirates";
  if (code === "BH") return "Bahrain";
  if (code === "KW") return "Kuwait";
  if (code === "OM") return "Oman";
  if (code === "US") return "United States";
  if (code === "GB") return "United Kingdom";
  return code || "";
}
