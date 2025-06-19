import { NextResponse } from "next/server";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  const city = searchParams.get("city");

  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    let locationBias = "";
    if (city) {
      try {
        const geocodeResponse = await fetch(
          `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(
            city
          )}&key=${process.env.NEXT_PUBLIC_OPENCAGE_API_KEY}&limit=1`
        );
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.results && geocodeData.results.length > 0) {
          const { lat, lng } = geocodeData.results[0].geometry;
          locationBias = `&location=${lat},${lng}&radius=50000`;
        }
      } catch (error) {
        console.log("Geocoding failed for city bias:", error);
      }
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}${locationBias}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Google Places API error:", data);
      return NextResponse.json(
        { error: "Failed to fetch places" },
        { status: response.status }
      );
    }

    let suggestions = data.results || [];

    if (city) {
      const cityLower = city.toLowerCase();
      suggestions = suggestions.filter((result) => {
        const address = result.formatted_address.toLowerCase();
        return address.includes(cityLower);
      });
    }

    suggestions = suggestions.filter((result) => {
      const types = result.types || [];
      return (
        types.includes("tourist_attraction") ||
        types.includes("point_of_interest") ||
        types.includes("museum") ||
        types.includes("restaurant") ||
        types.includes("lodging") ||
        types.includes("establishment") ||
        types.includes("park") ||
        types.includes("amusement_park") ||
        types.includes("zoo") ||
        types.includes("aquarium") ||
        types.includes("art_gallery") ||
        types.includes("church") ||
        types.includes("hindu_temple") ||
        types.includes("mosque") ||
        types.includes("synagogue") ||
        types.includes("shopping_mall") ||
        types.includes("store")
      );
    });

    const formattedSuggestions = suggestions.slice(0, 8).map((result) => ({
      formatted: `${result.name}, ${result.formatted_address}`,
      name: result.name,
      address: result.formatted_address,
      types: result.types,
      geometry: {
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      },
      place_id: result.place_id,
      rating: result.rating,
    }));

    return NextResponse.json({ results: formattedSuggestions });
  } catch (error) {
    console.error("Error calling Google Places API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
