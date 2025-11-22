const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";
const USER_AGENT = "vin-journal/1.0 (contact@vinjournal.local)";

export type GeoResult = {
  latitude: number;
  longitude: number;
  displayName: string;
};

export async function geocodePlace(query: string): Promise<GeoResult | null> {
  if (!query) return null;

  const url = new URL(NOMINATIM_URL);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1");

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error("Geocodage Nominatim indisponible");
  }

  const body = (await response.json()) as Array<{ lat: string; lon: string; display_name: string }>;
  if (!body.length) return null;

  const [first] = body;
  return {
    latitude: Number(first.lat),
    longitude: Number(first.lon),
    displayName: first.display_name,
  };
}
