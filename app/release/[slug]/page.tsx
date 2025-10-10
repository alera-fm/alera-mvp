"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface StreamingService {
  name: string;
  url: string;
}

interface FanEngagement {
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

interface ReleaseData {
  id: string;
  artistName: string;
  releaseTitle: string;
  artworkUrl?: string;
  streamingServices: StreamingService[];
  fanEngagement: FanEngagement;
  status: string;
  createdAt: string;
  parsedAt?: string;
  hasParsedData: boolean;
}

const streamingServiceIcons: Record<string, string> = {
  Spotify: "🎵",
  "Apple Music": "🎶",
  "YouTube Music": "📺",
  "Amazon Music": "🛒",
  Tidal: "💎",
  Deezer: "💜",
  Audiomack: "📻",
  SoundCloud: "☁️",
};

export default function PublicReleasePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [releaseData, setReleaseData] = useState<ReleaseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const fetchReleaseData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/public/release/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError("Release not found");
          } else {
            setError("Failed to load release data");
          }
          return;
        }

        const data = await response.json();
        setReleaseData(data.release);
      } catch (err) {
        console.error("Error fetching release data:", err);
        setError("Failed to load release data");
      } finally {
        setLoading(false);
      }
    };

    fetchReleaseData();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-gray-600 text-xl">Loading release...</div>
      </div>
    );
  }

  if (error || !releaseData) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-gray-600 text-xl text-center">
          <h1 className="text-3xl font-bold mb-4">Release Not Found</h1>
          <p>{error || "The release you are looking for does not exist."}</p>
        </div>
      </div>
    );
  }

  const handleStreamingServiceClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className=" relative min-h-screen ">
      {/* Backdrop blur effect */}
      <div
        className="fixed inset-0 bg-cover [filter:blur(20px)] scale-[2] !bg-center !bg-no-repeat"
        style={{ backgroundImage: `url(${releaseData.artworkUrl})` }}
        aria-hidden="true"
      />

      <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
      <div
        className="fixed inset-0 pointer-events-none [box-shadow:inset_0_0_200px_80px_rgba(0,0,0,0.65)]"
        aria-hidden="true"
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="w-full max-w-xs mx-auto">
          {/* Album Artwork */}
          {releaseData.artworkUrl && (
            <div className="">
              <div className="relative aspect-square object-contain w-full mx-auto !h-72">
                <Image
                  src={releaseData.artworkUrl}
                  alt={`${releaseData.artistName} - ${releaseData.releaseTitle}`}
                  fill
                  className=" object-fill"
                  priority
                />
              </div>
            </div>
          )}

          {/* Powered By Banner */}
          <div className="bg-gray-800 p-3 text-center">
            <div className="text-white text-sm">
              <span className="text-gray-300">POWERED BY</span>
              <div className="text-2xl font-bold">ALERA</div>
            </div>
          </div>

          {/* Release Title & Instructions */}
          <div className="bg-gray-700 p-4 text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {releaseData.releaseTitle}
            </h1>
            <p className="text-gray-300 text-sm">
              Choose your preferred music service
            </p>
          </div>

          {/* Streaming Services */}
          {releaseData.streamingServices.length > 0 ? (
            <div className="">
              {releaseData.streamingServices.map((service, index) => (
                <Card
                  key={index}
                  className="bg-gray-100 border-gray-200 rounded-none"
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {streamingServiceIcons[service.name] || "🎵"}
                      </div>
                      <span className="font-medium text-gray-900">
                        {service.name === "Apple Music"
                          ? "Pre-add on Apple Music"
                          : service.name}
                      </span>
                    </div>
                    <Button
                      onClick={() => handleStreamingServiceClick(service.url)}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-900 border border-gray-300 px-4 py-2 rounded-lg font-medium"
                    >
                      {/* {service.name === "Apple Music" ? "Pre-Add" : "Pre-Save"} */}
                      Play
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="bg-gray-100 p-4 text-center">
              <p className="text-gray-600">
                Streaming links will be available soon
              </p>
            </div>
          )}

          {/* Fan Engagement Section */}
          {releaseData.fanEngagement.enabled && (
            <div className="bg-gray-100 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Fan Engagement
              </h3>

              {releaseData.fanEngagement.emailSignup?.enabled && (
                <div className="mb-3">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      if (releaseData.fanEngagement.emailSignup?.endpoint) {
                        window.open(
                          releaseData.fanEngagement.emailSignup.endpoint,
                          "_blank"
                        );
                      }
                    }}
                  >
                    Join Fan List
                  </Button>
                </div>
              )}

              {releaseData.fanEngagement.fanZone?.enabled && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    if (releaseData.fanEngagement.fanZone?.url) {
                      window.open(
                        releaseData.fanEngagement.fanZone.url,
                        "_blank"
                      );
                    }
                  }}
                >
                  Visit Fan Zone
                </Button>
              )}
            </div>
          )}

          {/* Footer Links */}
          {/* <div className="text-center text-gray-600 text-sm space-y-2">
            <p>
              By using this service you agree to our{" "}
              <a href="/privacy" className="underline hover:text-white">
                Privacy Policy
              </a>{" "}
              and{" "}
              <a href="/terms" className="underline hover:text-white">
                Terms Of Use
              </a>
            </p>
            <div className="space-x-4">
              <a
                href="/manage-permissions"
                className="underline hover:text-white"
              >
                Manage your permissions
              </a>
              <a href="/report-problem" className="underline hover:text-white">
                Report a Problem
              </a>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}
