const OPENCAGE_API_KEY = process.env.NEXT_PUBLIC_OPENCAGE_API_KEY;

export async function geocodeLocation(locationString) {
  if (!OPENCAGE_API_KEY) {
    console.error("OpenCage API key not found");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
        locationString
      )}&key=${OPENCAGE_API_KEY}&limit=1`
    );

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const result = data.results[0];
      return {
        lat: result.geometry.lat,
        lng: result.geometry.lng,
        formatted: result.formatted,
      };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}
