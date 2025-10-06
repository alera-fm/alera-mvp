import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Validate that the URL is from a trusted source
    const allowedDomains = [
      "instagram.fmvs2-1.fna.fbcdn.net",
      "scontent-iad3-1.cdninstagram.com",
      "scontent-iad3-2.cdninstagram.com",
      "yt3.googleusercontent.com",
      "p16-sign-va.tiktokcdn.com",
      "scontent-iad3-2.xx.fbcdn.net",
      "instagram.com",
      "tiktok.com",
      "youtube.com",
      "facebook.com",
    ];

    const url = new URL(imageUrl);
    const isAllowed = allowedDomains.some(
      (domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }

    // Try multiple strategies to fetch the image
    let response;
    const strategies = [
      // Strategy 1: Basic fetch with minimal headers
      async () => {
        return fetch(imageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          },
        });
      },
      // Strategy 2: With Instagram referer
      async () => {
        return fetch(imageUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            Referer: "https://www.instagram.com/",
          },
        });
      },
      // Strategy 3: With Instagram app user agent
      async () => {
        return fetch(imageUrl, {
          headers: {
            "User-Agent": "Instagram 219.0.0.12.117 Android",
            Referer: "https://www.instagram.com/",
          },
        });
      },
      // Strategy 4: No headers at all
      async () => {
        return fetch(imageUrl);
      },
    ];

    // Try each strategy until one works
    for (const strategy of strategies) {
      try {
        response = await strategy();
        if (response.ok) {
          console.log(
            `Successfully fetched image using strategy ${
              strategies.indexOf(strategy) + 1
            }`
          );
          break;
        }
      } catch (error) {
        console.log(
          `Strategy ${strategies.indexOf(strategy) + 1} failed:`,
          error
        );
        continue;
      }
    }

    if (!response || !response.ok) {
      console.error(`All strategies failed to fetch image: ${imageUrl}`);
      return NextResponse.json(
        { error: "Failed to fetch image after trying multiple strategies" },
        { status: 404 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get("content-type") || "image/jpeg";

    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache for 1 hour
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
