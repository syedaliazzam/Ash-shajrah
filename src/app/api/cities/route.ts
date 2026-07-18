import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type CountryCitiesResponse = {
  error?: boolean;
  msg?: string;
  data?: {
    cities?: string[];
  } | string[] | unknown[];
  cities?: string[];
};

function getCityApiUrl() {
  return (
    process.env.CITIES_API_URL ||
    "https://countriesnow.space/api/v0.1/countries/cities/q"
  );
}

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams.get("country")?.trim();

  if (!country) {
    return NextResponse.json(
      { error: "Country is required." },
      { status: 400 }
    );
  }

  try {
    const apiUrl = getCityApiUrl();
    const targetUrl = new URL(apiUrl);

    if (targetUrl.searchParams.has("country")) {
      targetUrl.searchParams.set("country", country);
    } else {
      targetUrl.searchParams.append("country", country);
    }

    const response = await fetch(targetUrl.toString(), {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "City lookup failed." },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as CountryCitiesResponse;
    const cities = Array.isArray(payload.data)
      ? payload.data.filter((city): city is string => typeof city === "string")
      : Array.isArray(payload.cities)
        ? payload.cities
        : Array.isArray((payload.data as { cities?: string[] } | undefined)?.cities)
          ? ((payload.data as { cities?: string[] }).cities ?? [])
          : [];

    return NextResponse.json({ cities });
  } catch (error) {
    console.error("City lookup failed:", error);
    return NextResponse.json(
      { error: "City lookup failed." },
      { status: 502 }
    );
  }
}
