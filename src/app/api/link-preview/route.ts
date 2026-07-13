import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "www.facebook.com",
  "facebook.com",
  "m.facebook.com",
  "web.facebook.com",
]);

export type LinkPreviewResponse = {
  title: string | null;
  description: string | null;
  image: string | null;
  url: string;
};

function isAllowedFacebookUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMeta(
  html: string,
  key: "property" | "name",
  name: string
): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+${key}=["']${name}["'][^>]+content=["']([^"']+)["']`,
      "i"
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+${key}=["']${name}["']`,
      "i"
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }

  return null;
}

async function fetchFacebookHtml(url: string): Promise<LinkPreviewResponse | null> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      Accept: "text/html,application/xhtml+xml",
      "Accept-Language": "en-US,en;q=0.9",
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;

  const html = await response.text();
  return {
    title:
      extractMeta(html, "property", "og:title") ||
      extractMeta(html, "name", "title"),
    description:
      extractMeta(html, "property", "og:description") ||
      extractMeta(html, "name", "description"),
    image:
      extractMeta(html, "property", "og:image:secure_url") ||
      extractMeta(html, "property", "og:image") ||
      extractMeta(html, "name", "twitter:image"),
    url: extractMeta(html, "property", "og:url") || url,
  };
}

async function fetchMicrolink(url: string): Promise<LinkPreviewResponse | null> {
  try {
    const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true`;
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) return null;

    const json = (await response.json()) as {
      status?: string;
      data?: {
        title?: string;
        description?: string;
        image?: { url?: string };
        url?: string;
      };
    };

    if (json.status !== "success" || !json.data) return null;

    return {
      title: json.data.title ?? null,
      description: json.data.description ?? null,
      image: json.data.image?.url ?? null,
      url: json.data.url ?? url,
    };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const urlParam = request.nextUrl.searchParams.get("url");

  if (!urlParam) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  if (!isAllowedFacebookUrl(urlParam)) {
    return NextResponse.json(
      { error: "Only Facebook HTTPS URLs are allowed" },
      { status: 400 }
    );
  }

  const fallback: LinkPreviewResponse = {
    title: null,
    description: null,
    image: null,
    url: urlParam,
  };

  try {
    const direct = await fetchFacebookHtml(urlParam);
    if (direct?.image || direct?.title) {
      return NextResponse.json({
        title: direct.title,
        description: direct.description,
        image: direct.image,
        url: direct.url || urlParam,
      });
    }

    const microlink = await fetchMicrolink(urlParam);
    if (microlink) {
      return NextResponse.json(microlink);
    }

    return NextResponse.json(fallback);
  } catch {
    return NextResponse.json(fallback);
  }
}
