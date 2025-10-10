/**
 * Release Link Parser Service (Ultimate Stable Version 🚀)
 * ✅ Preserves real streaming URLs (no ffm.to truncation)
 * ✅ Includes full fanEngagement (emailSignup + fanZone)
 * ✅ Fixes JSON schema “missing required” errors
 * ✅ Resolves redirects once
 */

import Firecrawl from "@mendable/firecrawl-js";
import OpenAI from "openai";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const redirectCache = new Map<string, string>();

export interface StreamingService {
  name: string;
  url: string;
}

export interface FanEngagement {
  enabled: boolean;
  emailSignup?: {
    enabled: boolean;
    endpoint?: string;
  };
  fanZone?: {
    enabled: boolean;
    url?: string;
  };
}

export interface ParsedReleaseData {
  artistName: string;
  releaseTitle: string;
  artworkUrl?: string | null;
  streamingServices: StreamingService[];
  fanEngagement: FanEngagement;
}

export async function parseReleaseLink(
  sourceUrl: string
): Promise<ParsedReleaseData> {
  try {
    console.log(`[Release Parser] 🔥 Scraping ${sourceUrl}`);
    const result = await firecrawl.scrape(sourceUrl, {
      formats: ["markdown", "html"],
      onlyMainContent: false,
      waitFor: 10000, // Wait 10 seconds for ALL JavaScript to fully load streaming links
    });

    if (!result?.markdown)
      throw new Error("Firecrawl returned no markdown content");

    const markdown = result.markdown;
    const html = result.html || "";
    console.log(`[Release Parser] ✅ Scraped ${markdown.length} chars`);

    // Step 2 — Pre-extract URLs (fast)
    console.log(`[Release Parser] 🔗 Step 2: Pre-extracting streaming URLs...`);
    const streamingUrls = extractStreamingUrls(markdown + "\n" + html);
    console.log(
      `[Release Parser] 📌 Found ${streamingUrls.length} streaming URLs`
    );

    // Step 3 — Extract metadata with OpenAI (fast, minimal data)
    console.log(
      `[Release Parser] 🤖 Step 3: Extracting metadata with OpenAI...`
    );
    const parsed = await extractStructuredData(
      result.metadata,
      streamingUrls,
      markdown.slice(0, 3000) // Just first 3k chars for context
    );

    // Step 4 — Resolve redirect URLs to get final destination
    console.log(
      `[Release Parser] 🔗 Step 4: Resolving ${parsed.streamingServices.length} redirects...`
    );
    parsed.streamingServices = await resolveRedirects(parsed.streamingServices);

    console.log(
      `[Release Parser] ✅ Parsed: ${parsed.artistName} - ${parsed.releaseTitle}`
    );
    parsed.streamingServices.forEach((s, i) =>
      console.log(`   ${i + 1}. ${s.name}: ${s.url}`)
    );

    return parsed;
  } catch (error: any) {
    console.error(`[Release Parser] ❌ Failed parsing ${sourceUrl}:`, error);
    throw new Error(`Failed to parse ${sourceUrl}: ${error.message}`);
  }
}

/* 🔗 Pre-extract streaming URLs with regex (fast) */
function extractStreamingUrls(text: string): string[] {
  const streamingPatterns = [
    /https?:\/\/(?:open\.)?spotify\.com\/(?:album|track|artist)\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:geo\.)?music\.apple\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:geo\.)?itunes\.apple\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/music\.amazon\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:www\.)?deezer\.com\/(?:album|track)\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:www\.)?tidal\.com\/(?:album|track)\/[^\s\)"'<>]+/gi,
    /https?:\/\/pandora\.app\.link\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:www\.)?boomplay\.com\/(?:albums|songs)\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:www\.)?soundcloud\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/(?:www\.)?audiomack\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/music\.youtube\.com\/[^\s\)"'<>]+/gi,
    /https?:\/\/api\.ffm\.to\/sl\/[^\s\)"'<>]+/gi, // Feature.fm redirect links
  ];

  const allUrls: string[] = [];

  for (const pattern of streamingPatterns) {
    const matches = text.match(pattern) || [];
    allUrls.push(...matches);
  }

  // Filter out image URLs and duplicates
  const validUrls = allUrls.filter(
    (url) => !url.match(/\.(png|jpg|jpeg|gif|webp|svg)$/i)
  );

  return [...new Set(validUrls)]; // Remove duplicates
}

/* 🧠 STEP 3 — Extract Structured Data (Super Fast - URLs pre-extracted) */
async function extractStructuredData(
  metadata: any,
  streamingUrls: string[],
  contextSnippet: string
): Promise<ParsedReleaseData> {
  const schema = {
    type: "object",
    required: [
      "artistName",
      "releaseTitle",
      "artworkUrl",
      "streamingServices",
      "fanEngagement",
    ],
    additionalProperties: false,
    properties: {
      artistName: { type: "string" },
      releaseTitle: { type: "string" },
      artworkUrl: { type: "string" },
      streamingServices: {
        type: "array",
        items: {
          type: "object",
          required: ["name", "url"],
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            url: { type: "string" },
          },
        },
      },
      fanEngagement: {
        type: "object",
        required: ["enabled", "emailSignup", "fanZone"],
        additionalProperties: false,
        properties: {
          enabled: { type: "boolean" },
          emailSignup: {
            type: "object",
            required: ["enabled", "endpoint"],
            additionalProperties: false,
            properties: {
              enabled: { type: "boolean" },
              endpoint: { type: "string" },
            },
          },
          fanZone: {
            type: "object",
            required: ["enabled", "url"],
            additionalProperties: false,
            properties: {
              enabled: { type: "boolean" },
              url: { type: "string" },
            },
          },
        },
      },
    },
  };

  const completion = await withTimeout(
    openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You classify streaming service URLs and extract music release metadata. Match each URL to the correct service name (Spotify, Apple Music, iTunes, YouTube Music, Amazon Music, Tidal, Deezer, SoundCloud, Audiomack, Pandora, Boomplay).`,
        },
        {
          role: "user",
          content: `Extract music release data.

METADATA:
Title: ${metadata?.title || "Unknown"}
OG Title: ${metadata?.ogTitle || "Unknown"}
OG Image: ${metadata?.ogImage || ""}

STREAMING URLs FOUND (${streamingUrls.length}):
${streamingUrls.join("\n")}

CONTEXT:
${contextSnippet}

Classify each URL above into the streamingServices array with correct service names. Extract artistName and releaseTitle.`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "release_data", schema, strict: true },
      },
      temperature: 0.1,
      max_tokens: 4000,
    }),
    30000 // 30 second timeout (much faster now)
  );

  const json = completion.choices[0]?.message?.content;
  if (!json) throw new Error("Empty OpenAI response");

  const data = JSON.parse(json) as ParsedReleaseData;
  data.artistName = data.artistName?.trim() || "Unknown Artist";
  data.releaseTitle = data.releaseTitle?.trim() || "Unknown Release";
  data.artworkUrl = data.artworkUrl || null;

  // Keep only valid HTTP(S) links
  data.streamingServices = (data.streamingServices || []).filter((s) =>
    /^https?:\/\//.test(s.url)
  );

  return data;
}

/* 🔁 STEP 4 — Redirect Resolver */
async function resolveRedirects(
  services: StreamingService[]
): Promise<StreamingService[]> {
  const resolved: StreamingService[] = [];

  for (const s of services) {
    let finalUrl = s.url;
    try {
      if (redirectCache.has(s.url)) {
        finalUrl = redirectCache.get(s.url)!;
      } else if (/ffm\.to|feature\.fm|api\.ffm\.to/i.test(s.url)) {
        const res = await fetch(s.url, { method: "HEAD", redirect: "follow" });
        if (res.url && res.url !== s.url) {
          finalUrl = res.url;
          redirectCache.set(s.url, res.url);
        }
      }
    } catch (err) {
      console.warn(
        `[Redirect Resolver] ⚠️ ${s.url} → failed: ${(err as Error).message}`
      );
    }
    resolved.push({ ...s, url: finalUrl });
  }

  return resolved;
}

/* ⚙️ Utilities */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("⏱️ Timeout waiting for OpenAI")), ms)
    ),
  ]);
}

export function getSupportedStreamingServices(): string[] {
  return [
    "Spotify",
    "Apple Music",
    "YouTube Music",
    "Amazon Music",
    "Tidal",
    "Deezer",
    "Audiomack",
    "SoundCloud",
    "Pandora",
    "iHeartRadio",
    "Boomplay",
    "iTunes",
  ];
}
