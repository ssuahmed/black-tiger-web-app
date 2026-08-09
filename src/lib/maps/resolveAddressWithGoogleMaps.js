/**
 * Client-side Google Maps geocoding / nearby place resolution.
 * Uses the browser Maps JS API (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
 */

const PLACE_TYPES = new Set([
  "establishment",
  "point_of_interest",
  "premise",
  "tourist_attraction",
  "shopping_mall",
  "store",
]);

/**
 * @param {{ lat?: number; lng?: number; query?: string; placeId?: string }} input
 * @returns {Promise<Record<string, unknown> | null>}
 */
export async function resolveAddressWithGoogleMaps(input) {
  const maps = window.google?.maps;
  if (!maps?.Geocoder) return null;

  const geocoder = new maps.Geocoder();
  /** @type {google.maps.GeocoderRequest} */
  const request = {};
  if (input.placeId) request.placeId = input.placeId;
  else if (input.lat != null && input.lng != null) {
    request.location = { lat: Number(input.lat), lng: Number(input.lng) };
  } else if (input.query?.trim()) request.address = input.query.trim();
  else return null;

  const geocodeResults = await geocode(geocoder, request);
  if (!geocodeResults.length) return null;

  const address = toAddress(geocodeResults);
  if (
    !address.placeName &&
    input.lat != null &&
    input.lng != null &&
    maps.places?.PlacesService
  ) {
    const nearby = await nearbyPlaceName(Number(address.latitude), Number(address.longitude));
    if (nearby) {
      address.placeName = nearby;
      address.name = nearby;
      address.landmark = nearby;
    }
  }
  return address;
}

/**
 * @param {google.maps.Geocoder} geocoder
 * @param {google.maps.GeocoderRequest} request
 * @returns {Promise<google.maps.GeocoderResult[]>}
 */
function geocode(geocoder, request) {
  return new Promise((resolve) => {
    geocoder.geocode(request, (results, status) => {
      if (status === "OK" && Array.isArray(results) && results.length) resolve(results);
      else resolve([]);
    });
  });
}

/**
 * @param {number} lat
 * @param {number} lng
 * @returns {Promise<string | undefined>}
 */
function nearbyPlaceName(lat, lng) {
  const maps = window.google?.maps;
  if (!maps?.places?.PlacesService) return Promise.resolve(undefined);

  const anchor = document.createElement("div");
  const service = new maps.places.PlacesService(anchor);
  return new Promise((resolve) => {
    service.nearbySearch(
      {
        location: { lat, lng },
        rankBy: maps.places.RankBy.DISTANCE,
        type: "establishment",
      },
      (results, status) => {
        if (status !== maps.places.PlacesServiceStatus.OK || !results?.length) {
          resolve(undefined);
          return;
        }
        const place = results[0];
        const placeLat = place.geometry?.location?.lat?.();
        const placeLng = place.geometry?.location?.lng?.();
        if (placeLat == null || placeLng == null) {
          resolve(place.name || undefined);
          return;
        }
        const meters = haversineMeters(lat, lng, placeLat, placeLng);
        resolve(meters <= 90 ? place.name || undefined : undefined);
      },
    );
  });
}

/**
 * @param {google.maps.GeocoderResult[]} results
 */
function toAddress(results) {
  const placeResult =
    results.find((result) => (result.types ?? []).some((type) => PLACE_TYPES.has(type))) ?? null;
  const streetResult =
    results.find((result) =>
      (result.types ?? []).some((type) =>
        ["street_address", "premise", "subpremise", "route"].includes(type),
      ),
    ) ?? results[0];
  const primary = placeResult ?? streetResult;
  const components = mergeComponents(results);
  const component = (type, short = false) => {
    const found = components.find((item) => item.types.includes(type));
    return short ? found?.short_name : found?.long_name;
  };

  const placeName =
    placeNameFromResult(placeResult) || component("premise") || component("establishment") || "";

  return {
    placeId: primary.place_id,
    placeName: placeName || undefined,
    name: placeName || undefined,
    landmark: placeName || undefined,
    formattedAddress: primary.formatted_address,
    latitude: primary.geometry.location.lat(),
    longitude: primary.geometry.location.lng(),
    buildingNo: component("street_number") || undefined,
    street: component("route") || undefined,
    secondary: component("subpremise") || undefined,
    neighborhood: component("neighborhood") || undefined,
    district:
      component("sublocality_level_1") ||
      component("sublocality") ||
      component("neighborhood") ||
      component("administrative_area_level_2") ||
      undefined,
    city: component("locality") || component("postal_town") || component("administrative_area_level_2") || undefined,
    stateProvince: component("administrative_area_level_1") || undefined,
    stateCode: component("administrative_area_level_1", true) || undefined,
    postalCode: component("postal_code") || undefined,
    countryCode: component("country", true) || undefined,
    country: component("country") || undefined,
    source: "google-maps-js",
  };
}

function placeNameFromResult(result) {
  if (!result) return "";
  if (!(result.types ?? []).some((type) => PLACE_TYPES.has(type))) return "";
  return result.formatted_address.split(",")[0]?.trim() || "";
}

function mergeComponents(results) {
  const preferred = [];
  const seenTypes = new Set();
  for (const result of results) {
    for (const component of result.address_components ?? []) {
      const fresh = component.types.filter((type) => !seenTypes.has(type));
      if (!fresh.length) continue;
      preferred.push(component);
      for (const type of component.types) seenTypes.add(type);
    }
  }
  return preferred;
}

function haversineMeters(lat1, lng1, lat2, lng2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const earth = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * earth * Math.asin(Math.sqrt(a));
}
