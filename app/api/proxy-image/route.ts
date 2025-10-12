import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy API endpoint to fetch images from social media platforms
 * This bypasses CORS restrictions by fetching images server-side
 * GET /api/proxy-image?url=<encoded_image_url>
 */
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

    // Decode the URL
    const decodedUrl = decodeURIComponent(imageUrl);

    // Validate that it's a social media image URL
    const allowedDomains = [
      "instagram.com",
      "scontent-",
      "fbcdn.net",
      "tiktokcdn.com",
      "tiktokcdn-us.com",
      "youtube.com",
      "ytimg.com",
      "facebook.com",
    ];

    const isAllowedDomain = allowedDomains.some((domain) =>
      decodedUrl.includes(domain)
    );

    if (!isAllowedDomain) {
      return NextResponse.json(
        { error: "Domain not allowed" },
        { status: 403 }
      );
    }

    // Fetch the image from the social media platform
    const imageResponse = await fetch(decodedUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "image/*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        DNT: "1",
        Connection: "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      },
    });

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch image" },
        { status: imageResponse.status }
      );
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("Proxy image error:", error);
    return NextResponse.json(
      { error: "Failed to proxy image" },
      { status: 500 }
    );
  }
}
