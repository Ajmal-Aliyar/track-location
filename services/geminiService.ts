import { GoogleGenAI } from "@google/genai";
import { LocationData, Coordinates } from "../types";

// Initialize the Gemini Client
// We use the GenAI SDK as instructed.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const parseGeminiResponse = (text: string, defaultAddress: string): LocationData => {
    try {
        const cleanText = text.replace(/```json/g, "").replace(/```/g, "").trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("Failed to parse JSON", e);
        return {
            formattedAddress: defaultAddress,
            summary: text,
            placeType: "Custom Location",
        };
    }
};

export const exploreLocation = async (address: string): Promise<LocationData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Locate the address or place: "${address}". 
      
      1. Verify this location exists using Google Maps.
      2. Provide a JSON response with the following fields:
         - "formattedAddress": The official, complete address found on Maps.
         - "coordinates": { "lat": number, "lng": number } - The precise latitude and longitude.
         - "summary": A 2-3 sentence engaging description of what this place is.
         - "placeType": A short string describing the type of place (e.g., "Restaurant", "Corporate Office").
      
      Return ONLY the JSON object. Do not include markdown formatting.`,
      config: {
        tools: [{ googleMaps: {} }],
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");

    const data = parseGeminiResponse(text, address);

    // Add explicit maps URI if found in grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      const mapChunk = groundingChunks.find((c) => c.maps?.uri);
      if (mapChunk?.maps?.uri) {
        data.googleMapsUri = mapChunk.maps.uri;
      }
    }

    return data;
  } catch (error) {
    console.error("Error exploring location:", error);
    throw error;
  }
};

export const getLocationFromCoordinates = async (coords: Coordinates): Promise<LocationData> => {
    try {
        // We ask Gemini to identify what is at these coordinates.
        // This acts as an intelligent reverse-geocoding + description service.
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Identify the location at Latitude: ${coords.lat}, Longitude: ${coords.lng}.
            
            1. Determine the nearest address or landmark.
            2. Provide a JSON response with:
               - "formattedAddress": The nearest readable address.
               - "coordinates": { "lat": ${coords.lat}, "lng": ${coords.lng} }
               - "summary": A brief description of this area or landmark.
               - "placeType": The type of location (e.g. "Park", "Street", "Building").
               
            Return ONLY the JSON object.`,
            config: {
                tools: [{ googleMaps: {} }],
            },
        });

        const text = response.text;
        if (!text) throw new Error("No response from Gemini");

        return parseGeminiResponse(text, `${coords.lat}, ${coords.lng}`);
    } catch (error) {
        console.error("Error identifying location:", error);
        throw error;
    }
};