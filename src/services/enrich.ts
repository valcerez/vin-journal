import { geocodePlace } from "./nominatim";
import { BottleFormState } from "../types/bottle";

const APPELLATION_HINTS: Record<string, { region: string; country: string }> = {
  "saint-emilion": { region: "Bordeaux", country: "France" },
  "bourgogne": { region: "Bourgogne", country: "France" },
  "cote du rhone": { region: "Vallée du Rhône", country: "France" },
  "rioja": { region: "La Rioja", country: "Espagne" },
  "chianti": { region: "Toscane", country: "Italie" },
  "champagne": { region: "Champagne", country: "France" },
};

const normalize = (value?: string | null) =>
  (value ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export async function enrichFromAppellation(fields: BottleFormState) {
  const normalized = normalize(fields.appellation);
  const hint = normalized ? APPELLATION_HINTS[normalized] : undefined;

  const region = fields.region || hint?.region || "";
  const country = fields.country || hint?.country || "";

  const query = [fields.appellation, region, country].filter(Boolean).join(", ");
  const coords = query ? await geocodePlace(query) : null;

  return {
    region,
    country,
    coords,
  };
}
