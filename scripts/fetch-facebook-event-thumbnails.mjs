import fs from "node:fs/promises";
import path from "node:path";

const events = [
  {
    id: "facebook-event-01",
    url: "https://www.facebook.com/share/p/1D4ffUsfpu/",
    output: "facebook-event-01.jpg",
  },
  {
    id: "facebook-event-02",
    url: "https://www.facebook.com/share/p/186Cu8JK1L/",
    output: "facebook-event-02.jpg",
  },
  {
    id: "facebook-event-03",
    url: "https://www.facebook.com/share/p/1JiPKMAtF9/",
    output: "facebook-event-03.jpg",
  },
  {
    id: "facebook-event-04",
    url: "https://www.facebook.com/share/p/1DawJTNPeK/",
    output: "facebook-event-04.jpg",
  },
  {
    id: "facebook-event-05",
    url: "https://www.facebook.com/share/p/18xMEZ7fQr/",
    output: "facebook-event-05.jpg",
  },
  {
    id: "facebook-event-06",
    url: "https://www.facebook.com/share/p/1JjySWVEPC/",
    output: "facebook-event-06.jpg",
  },
];

const outputDir = path.join(process.cwd(), "public", "images", "events");
const metaPath = path.join(outputDir, "fetched-meta.json");

const BROWSER_HEADERS = {
  "user-agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
};

function decodeEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d+);/g, (_, num) => String.fromCodePoint(Number(num)))
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function extractMetaContent(html, patterns) {
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeEntities(match[1].trim());
  }
  return null;
}

function extractOgFromHtml(html) {
  const imageUrl = extractMetaContent(html, [
    /<meta[^>]+property=["']og:image:secure_url["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image:secure_url["'][^>]*>/i,
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ]);

  const title = extractMetaContent(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["'][^>]*>/i,
  ]);

  const description = extractMetaContent(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["'][^>]*>/i,
  ]);

  return { imageUrl, title, description };
}

async function tryFetchHtml(url) {
  const response = await fetch(url, {
    redirect: "follow",
    headers: BROWSER_HEADERS,
  });

  if (!response.ok) {
    throw new Error(`HTML fetch failed (${response.status})`);
  }

  return {
    html: await response.text(),
    finalUrl: response.url,
  };
}

async function tryMicrolink(url) {
  const endpoint = `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true&palette=false`;
  const response = await fetch(endpoint, {
    headers: {
      "user-agent": BROWSER_HEADERS["user-agent"],
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Microlink failed (${response.status})`);
  }

  const json = await response.json();
  if (json.status !== "success" || !json.data) {
    throw new Error("Microlink returned no data");
  }

  return {
    imageUrl: json.data.image?.url || null,
    title: json.data.title || null,
    description: json.data.description || null,
    source: "microlink",
  };
}

async function tryFacebookOEmbed(url) {
  const endpoint = `https://www.facebook.com/plugins/post/oembed.json?url=${encodeURIComponent(url)}`;
  const response = await fetch(endpoint, {
    headers: {
      "user-agent": BROWSER_HEADERS["user-agent"],
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Facebook oEmbed failed (${response.status})`);
  }

  const json = await response.json();
  return {
    imageUrl: json.thumbnail_url || null,
    title: json.title || null,
    description: json.author_name
      ? `Facebook post by ${json.author_name}`
      : null,
    source: "facebook-oembed",
  };
}

function isUsefulPreviewImage(imageUrl, title) {
  if (!imageUrl) return false;
  const lower = imageUrl.toLowerCase();
  // Generic Facebook branding assets — not real post thumbnails
  if (lower.includes("static.xx.fbcdn.net/rsrc.php")) return false;
  if (lower.includes("/rsrc.php/")) return false;
  if (title && title.trim().toLowerCase() === "facebook") return false;
  return true;
}

async function resolvePreview(url) {
  const attempts = [];

  // 1) Direct Facebook HTML / Open Graph
  try {
    const { html, finalUrl } = await tryFetchHtml(url);
    const og = extractOgFromHtml(html);
    if (isUsefulPreviewImage(og.imageUrl, og.title)) {
      return { ...og, source: "facebook-og", finalUrl };
    }
    attempts.push(`facebook-og: no useful image (resolved ${finalUrl})`);
  } catch (error) {
    attempts.push(`facebook-og: ${error.message}`);
  }

  // 2) Mobile Facebook HTML
  try {
    const mobileUrl = url.replace(
      "https://www.facebook.com/",
      "https://m.facebook.com/"
    );
    const { html, finalUrl } = await tryFetchHtml(mobileUrl);
    const og = extractOgFromHtml(html);
    if (isUsefulPreviewImage(og.imageUrl, og.title)) {
      return { ...og, source: "facebook-mobile-og", finalUrl };
    }
    attempts.push(`facebook-mobile-og: no useful image (resolved ${finalUrl})`);
  } catch (error) {
    attempts.push(`facebook-mobile-og: ${error.message}`);
  }

  // 3) Facebook oEmbed plugin endpoint
  try {
    const result = await tryFacebookOEmbed(url);
    if (isUsefulPreviewImage(result.imageUrl, result.title)) return result;
    attempts.push("facebook-oembed: no useful thumbnail_url");
  } catch (error) {
    attempts.push(`facebook-oembed: ${error.message}`);
  }

  // 4) Microlink meta API (third-party OG fetcher)
  try {
    const result = await tryMicrolink(url);
    if (isUsefulPreviewImage(result.imageUrl, result.title)) return result;
    attempts.push("microlink: no useful image");
  } catch (error) {
    attempts.push(`microlink: ${error.message}`);
  }

  return {
    imageUrl: null,
    title: null,
    description: null,
    source: null,
    attempts,
  };
}

async function downloadImage(imageUrl, outputPath) {
  const response = await fetch(imageUrl, {
    redirect: "follow",
    headers: {
      ...BROWSER_HEADERS,
      accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
      referer: "https://www.facebook.com/",
    },
  });

  if (!response.ok) {
    throw new Error(`Image download failed (${response.status})`);
  }

  const contentType = response.headers.get("content-type") || "";
  const buffer = Buffer.from(await response.arrayBuffer());

  if (buffer.length < 500) {
    throw new Error("Downloaded file looks too small to be a valid thumbnail");
  }

  // Preserve common formats; force .jpg name as requested even for png/webp.
  await fs.writeFile(outputPath, buffer);
  return { bytes: buffer.length, contentType };
}

await fs.mkdir(outputDir, { recursive: true });

const results = [];

for (const event of events) {
  const result = {
    id: event.id,
    url: event.url,
    imageSaved: false,
    imageUrl: null,
    title: null,
    description: null,
    source: null,
    error: null,
  };

  try {
    console.log(`\nFetching preview for ${event.id}`);
    console.log(`  URL: ${event.url}`);

    const preview = await resolvePreview(event.url);
    result.title = preview.title;
    result.description = preview.description;
    result.source = preview.source;
    result.imageUrl = preview.imageUrl;

    if (!preview.imageUrl) {
      console.warn(`  No image found for ${event.id}.`);
      if (preview.attempts?.length) {
        for (const attempt of preview.attempts) {
          console.warn(`    - ${attempt}`);
        }
      }
      result.error = "No OG/preview image found";
      results.push(result);
      continue;
    }

    console.log(`  Source: ${preview.source}`);
    console.log(`  Image: ${preview.imageUrl}`);
    if (preview.title) console.log(`  Title: ${preview.title}`);

    const outputPath = path.join(outputDir, event.output);
    const downloaded = await downloadImage(preview.imageUrl, outputPath);
    result.imageSaved = true;
    console.log(
      `  Saved ${outputPath} (${downloaded.bytes} bytes, ${downloaded.contentType})`
    );
  } catch (error) {
    result.error = error.message;
    console.error(`  Failed for ${event.id}:`, error.message);
  }

  results.push(result);
}

await fs.writeFile(metaPath, JSON.stringify(results, null, 2), "utf8");
console.log(`\nWrote metadata summary to ${metaPath}`);

const saved = results.filter((r) => r.imageSaved).length;
console.log(`\nDone: ${saved}/${events.length} thumbnails saved.`);
if (saved < events.length) {
  console.log(
    "For any missing images, save screenshots manually as public/images/events/facebook-event-XX.jpg"
  );
}
