export interface Coordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  summary: string;
  formattedAddress: string;
  coordinates?: Coordinates; // Optional as Gemini might not always return exact coords in text
  googleMapsUri?: string;
  placeType?: string;
}

export interface GroundingMetadata {
  groundingChunks?: Array<{
    web?: { uri: string; title: string };
    maps?: { uri: string; title: string; placeAnswerSources?: unknown[] };
  }>;
}

export interface UserEntry {
  id: string;
  name: string;
  location: LocationData;
  joinedAt: Date;
}