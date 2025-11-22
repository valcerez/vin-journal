export type BottleFormState = {
  name: string;
  vintage: string;
  region: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  rating: number;
  notes: string;
};

export type BottleInsertPayload = {
  user_id: string;
  image_url: string;
  name: string;
  vintage: string | null;
  region: string | null;
  location: string | null;
  rating: number;
  notes: string | null;
  // Deprecated/Legacy fields (optional if we want to keep type compatibility for a bit, but better to clean)
  // Keeping them optional for now to avoid breaking other files immediately if they reference them
  producer?: string | null;
  cuvee?: string | null;
  appellation?: string | null;
  country?: string | null;
  address?: string | null;
  alcohol_percent?: number | null;
  tasting_date?: string;
  latitude?: number | null;
  longitude?: number | null;
};
