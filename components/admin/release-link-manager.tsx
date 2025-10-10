"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "react-hot-toast";
import { ExternalLink, Loader2, Music } from "lucide-react";

interface ReleaseLinkManagerProps {
  releaseId: string;
  releaseTitle: string;
}

interface StreamingService {
  name: string;
  url: string;
}

interface ParsedLink {
  id: string;
  artistName: string;
  releaseTitle: string;
  artworkUrl: string | null;
  streamingServices: StreamingService[];
  sourceUrl: string;
  parsedAt: string;
}

export function ReleaseLinkManager({
  releaseId,
  releaseTitle,
}: ReleaseLinkManagerProps) {
  const [sourceUrl, setSourceUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [parsedLinks, setParsedLinks] = useState<ParsedLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);

  // Fetch existing parsed links
  useEffect(() => {
    fetchParsedLinks();
  }, [releaseId]);

  const fetchParsedLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/releases/${releaseId}/parse-link`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.links) {
        setParsedLinks(data.links);
      }
    } catch (error) {
      console.error("Error fetching parsed links:", error);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const handleParseLink = async () => {
    if (!sourceUrl.trim()) {
      toast.error("Please enter a URL");
      return;
    }

    // Validate URL
    try {
      new URL(sourceUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/releases/${releaseId}/parse-link`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ sourceUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          toast.error("This link has already been parsed for this release");
        } else {
          throw new Error(data.error || "Failed to parse link");
        }
        return;
      }

      toast.success(
        `✅ Parsed ${data.data.streamingServices.length} streaming services!`
      );
      setSourceUrl("");
      fetchParsedLinks(); // Refresh the list
    } catch (error: any) {
      console.error("Error parsing link:", error);
      toast.error(error.message || "Failed to parse link");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 mt-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Parse Distributor Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="https://ditto.fm/your-release or https://distrokid.com/..."
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleParseLink()}
              disabled={isLoading}
            />
            <Button onClick={handleParseLink} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Parsing...
                </>
              ) : (
                "Parse Link"
              )}
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a link from Ditto, DistroKid, TuneCore, or other distributors
            to automatically extract streaming service links.
          </p>
        </CardContent>
      </Card>

      {/* Parsed Links List */}
      {isLoadingLinks ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : parsedLinks.length > 0 ? (
        <div className="space-y-4">
          <h4 className="font-medium text-sm text-gray-700">Parsed Links</h4>
          {parsedLinks.map((link) => (
            <Card key={link.id}>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h5 className="font-medium">{link.artistName}</h5>
                      <p className="text-sm text-gray-600">
                        {link.releaseTitle}
                      </p>
                      <a
                        href={link.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1"
                      >
                        View source <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    {link.artworkUrl && (
                      <img
                        src={link.artworkUrl}
                        alt={link.releaseTitle}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-2">
                      Streaming Services ({link.streamingServices.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {link.streamingServices.map((service, idx) => (
                        <a
                          key={idx}
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs"
                        >
                          <Music className="h-3 w-3" />
                          {service.name}
                        </a>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-gray-400">
                    Parsed{" "}
                    {new Date(link.parsedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No parsed links yet. Enter a distributor link above to get started.
        </p>
      )}
    </div>
  );
}
