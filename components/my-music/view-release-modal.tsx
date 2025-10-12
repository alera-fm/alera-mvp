"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Building,
  Copyright,
  Hash,
  Music,
  User,
  Globe,
  Tag,
  FileText,
  CheckCircle,
  ArrowUpRight,
  ExternalLink,
  Copy,
} from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";

interface Release {
  id: string;
  trackTitle: string;
  artistName: string;
  releaseDate: string | null;
  submissionDate: string;
  status: string;
  streams: number;
  revenue: number;
  platforms: string[];
  artwork: string | null;
  genre: string;
  secondaryGenre?: string;
  label: string;
  copyright: string;
  upcEan?: string;
  upc?: string;
  explicitContent: boolean;
  credits: {
    producers: string[];
    writers: string[];
    composers: string[];
    engineers?: string[];
    mixedBy?: string[];
    masteredBy?: string[];
    featuredArtists?: string[];
  };
  lyrics?: string;
  isrcCode?: string;
  trackCount?: number;
  distributionType?: string;
  language?: string;
  instrumental?: boolean;
  versionInfo?: string;
  versionOther?: string;
  originalReleaseDate?: string;
  previouslyReleased?: boolean;
  albumCoverUrl?: string;
  selectedStores?: string[];
  trackPrice?: number;
  termsAgreed?: boolean;
  fakeStreamingAgreement?: boolean;
  distributionAgreement?: boolean;
  artistNamesAgreement?: boolean;
  snapchatTerms?: boolean;
  youtubeMusicAgreement?: boolean;
}

interface ViewReleaseModalProps {
  release: Release | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (release: Release) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Live":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "Sent to Stores":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "Under Review":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "Pending":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    case "Draft":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
    case "Rejected":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    case "Takedown":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "Live":
      return <CheckCircle className="h-4 w-4" />;
    case "Sent to Stores":
      return <ArrowUpRight className="h-4 w-4" />;
    case "Under Review":
      return <Clock className="h-4 w-4" />;
    case "Pending":
      return <Clock className="h-4 w-4" />;
    case "Draft":
      return <FileText className="h-4 w-4" />;
    case "Takedown":
      return <Clock className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case "Live":
      return "Live";
    case "Sent to Stores":
      return "Sent to Stores";
    case "Under Review":
      return "Under Review";
    case "Pending":
      return "Pending";
    case "Draft":
      return "Draft";
    case "Takedown":
      return "Takendown";
    default:
      return status;
  }
};

export function ViewReleaseModal({
  release,
  isOpen,
  onClose,
  onEdit,
}: ViewReleaseModalProps) {
  if (!release) return null;

  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit =
    release.status === "Pending" ||
    release.status === "Under Review" ||
    release.status === "Sent to Stores" ||
    release.status === "Live";

  // Generate public URL for live releases
  const generatePublicUrl = () => {
    if (release.status !== "Live") return null;

    // Format artist name and track title for URL (replace spaces with hyphens, lowercase)
    const formatForUrl = (text: string) => {
      return text
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
    };

    // Use the user's actual artist name from their profile, not the release's artist name
    const userArtistName = user?.artistName || release.artistName;
    const artistSlug = formatForUrl(userArtistName);
    const titleSlug = formatForUrl(release.trackTitle);

    return `/${artistSlug}/${titleSlug}`;
  };

  const publicUrl = generatePublicUrl();
  const fullPublicUrl = publicUrl
    ? `${window.location.origin}${publicUrl}`
    : null;

  const copyToClipboard = () => {
    if (fullPublicUrl) {
      navigator.clipboard.writeText(fullPublicUrl);
      toast({
        title: "Copied!",
        description: "Public URL copied to clipboard",
      });
    }
  };

  const openPublicPage = () => {
    if (publicUrl) {
      window.open(publicUrl, "_blank");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl !max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Release Details
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Release Information */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Album Art */}
                  <div className="flex-shrink-0">
                    <div className="relative w-48 h-48 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={release.artwork || "/placeholder.svg"}
                        alt={`${release.trackTitle} cover`}
                        fill
                        className="object-cover"
                      />
                      {release.explicitContent && (
                        <div className="absolute bottom-2 left-2 bg-black text-white text-xs px-2 py-1 rounded">
                          EXPLICIT
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Release Details */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {release.trackTitle}
                      </h2>
                      <p className="text-lg text-gray-600 dark:text-gray-300">
                        {release.distributionType} by {release.artistName}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Label:
                          </span>
                          <span className="text-sm font-medium">
                            {release.label}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Copyright className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Copyright:
                          </span>
                          <span className="text-sm font-medium">
                            {release.copyright}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Music className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Primary Genre:
                          </span>
                          <span className="text-sm font-medium">
                            {release.genre}
                          </span>
                        </div>

                        {release.secondaryGenre && (
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              Secondary Genre:
                            </span>
                            <span className="text-sm font-medium">
                              {release.secondaryGenre}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Language:
                          </span>
                          <span className="text-sm font-medium">
                            {release.language || "English"}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {release.upcEan && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              UPC/EAN:
                            </span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {release.upcEan}
                            </code>
                          </div>
                        )}

                        {release.upc && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              UPC:
                            </span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {release.upc}
                            </code>
                          </div>
                        )}

                        {release.isrcCode && (
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              ISRC:
                            </span>
                            <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                              {release.isrcCode}
                            </code>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Tracks:
                          </span>
                          <span className="text-sm font-medium">
                            {release.trackCount || 0}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Price:
                          </span>
                          <span className="text-sm font-medium">
                            ${release.trackPrice || 0.99}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Status and Dates */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Clock className="h-3 w-3 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            In Review
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <CheckCircle className="h-3 w-3 text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            Approved
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              release.status === "Sent to Stores" ||
                              release.status === "Live"
                                ? "bg-green-100 dark:bg-green-900/30"
                                : "bg-gray-200 dark:bg-gray-700"
                            }`}
                          >
                            {getStatusIcon(release.status)}
                          </div>
                          <span
                            className={`text-sm ${
                              release.status === "Sent to Stores" ||
                              release.status === "Live"
                                ? "text-green-600 dark:text-green-400 font-medium"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {getStatusText(release.status)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Dates</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Received:
                        </span>
                        <span className="text-sm font-medium">
                          {new Date(
                            release.submissionDate
                          ).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Release:
                        </span>
                        <span className="text-sm font-medium">
                          {release.releaseDate
                            ? new Date(release.releaseDate).toLocaleDateString()
                            : "Not set"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Public URL - Only show for Live releases */}
                  {publicUrl && (
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Public URL</h3>
                      <div className="space-y-3">
                        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-gray-500" />
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                              Share this link with your fans
                            </span>
                          </div>
                          <code className="text-xs text-gray-700 dark:text-gray-300 break-all block">
                            {fullPublicUrl}
                          </code>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={copyToClipboard}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <Copy className="h-3 w-3 mr-2" />
                            Copy
                          </Button>
                          <Button
                            onClick={openPublicPage}
                            variant="outline"
                            size="sm"
                            className="flex-1"
                          >
                            <ExternalLink className="h-3 w-3 mr-2" />
                            Open
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="pt-4">
                    {canEdit ? (
                      <Button
                        onClick={() => onEdit(release)}
                        className="w-full bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                      >
                        Edit Release
                      </Button>
                    ) : (
                      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                        Release cannot be edited in current status
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
