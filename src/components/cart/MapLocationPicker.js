"use client";

import { useEffect, useRef, useState } from "react";
import { CrosshairIcon, PinIcon } from "@/components/checkout/icons/CheckoutIcons";
import * as checkoutApi from "@/lib/api/checkout";
import { loadGoogleMaps } from "@/lib/maps/loadGoogleMaps";

const DEFAULT_LOCATION = { lat: 24.7136, lng: 46.6753 };

/**
 * @param {{
 *   value?: { lat?: number | null; lng?: number | null; placeId?: string; formattedAddress?: string };
 *   onConfirm?: (resolved: Record<string, unknown>) => void;
 * }} props
 */
export default function MapLocationPicker({ value, onConfirm }) {
  const mapNode = useRef(null);
  const mapRef = useRef(null);
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
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current = map;
        idleListener = map.addListener("idle", () => {
          const next = map.getCenter();
          if (!next) return;
          setLocation((current) => ({
            ...current,
            lat: next.lat(),
            lng: next.lng(),
          }));
        });
      })
      .catch(() => setMapsAvailable(false));
    return () => {
      alive = false;
      if (idleListener && window.google?.maps?.event) {
        window.google.maps.event.removeListener(idleListener);
      }
    };
  }, []);

  async function resolve(input) {
    setBusy(true);
    setError("");
    try {
      const data = await checkoutApi.resolveCheckoutAddress(input);
      const address = data?.address ?? data?.item ?? data ?? {};
      const nextLocation = {
        lat: Number(address?.latitude ?? address?.lat ?? input.lat ?? location.lat),
        lng: Number(address?.longitude ?? address?.lng ?? input.lng ?? location.lng),
        placeId: String(address?.placeId ?? ""),
        formattedAddress: String(address?.formattedAddress ?? address?.address ?? query),
        title: shortTitle(address),
        subtitle: shortSubtitle(address),
      };
      setLocation(nextLocation);
      setQuery(nextLocation.formattedAddress);
      if (mapRef.current) {
        mapRef.current.panTo({ lat: nextLocation.lat, lng: nextLocation.lng });
      }
      return { ...address, ...nextLocation };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not find this location.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      setError("Current location is unavailable in this browser.");
      return;
    }
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => void resolve({ lat: coords.latitude, lng: coords.longitude }),
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
              if (query.trim()) void resolve({ query: query.trim() });
            }}
          >
            <span className="co-map-picker__search-icon" aria-hidden>
              ⌕
            </span>
            <input
              className="co-map-picker__search-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search for your national address, building..."
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

function shortTitle(address) {
  const formatted = String(address?.formattedAddress || "");
  const national = String(address?.nationalAddress || "");
  if (national) return national;
  if (address?.buildingNo && address?.street) return `${address.buildingNo} ${address.street}`;
  if (formatted) return formatted.split(",")[0]?.trim() || formatted;
  return "Selected location";
}

function shortSubtitle(address) {
  const parts = [
    address?.district,
    address?.city,
    countryName(address?.countryCode),
  ].filter(Boolean);
  if (parts.length) return parts.join(" - ");
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
  return code || "";
}
