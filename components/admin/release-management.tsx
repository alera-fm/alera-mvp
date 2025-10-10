"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Music, ExternalLink } from "lucide-react";
import { ReleaseLinkManager } from "./release-link-manager";

// Helper function to safely format dates
const safeFormatDistance = (dateString: string | null | undefined): string => {
  if (!dateString || !dateString.trim()) return "Unknown";

  // Check if date already has timezone info (ends with Z or has timezone offset)
  const hasTimezone =
    dateString.endsWith("Z") ||
    dateString.includes("+") ||
    dateString.includes("-", 10);
  const date = new Date(hasTimezone ? dateString : dateString + "Z");

  if (isNaN(date.getTime())) return "Invalid date";

  return formatDistanceToNow(date, { addSuffix: true });
};

interface Release {
  id: string;
  artist_display_name: string;
  artist_email: string;
  distribution_type: string;
  artist_name: string;
  release_title: string;
  primary_genre: string;
  track_count: number;
  status: string;
  submitted_at: string;
  created_at: string;
  update_status?: string;
  tracks?: any[];
  selected_stores?: string[];
  updated_at?: string;
  record_label?: string;
  c_line?: string;
  p_line?: string;
  has_spotify_profile?: boolean;
  spotify_profile_url?: string;
  has_apple_profile?: boolean;
  apple_profile_url?: string;
  additional_delivery?: string[];
  secondary_genre?: string;
  language?: string;
  explicit_lyrics?: boolean;
  instrumental?: boolean;
  version_info?: string;
  version_other?: string;
  original_release_date?: string;
  previously_released?: boolean;
  track_price?: number;
  album_cover_url?: string;
  terms_agreed?: boolean;
  fake_streaming_agreement?: boolean;
  distribution_agreement?: boolean;
  artist_names_agreement?: boolean;
  snapchat_terms?: boolean;
  youtube_music_agreement?: boolean;
  upc?: string;
  credits?: {
    producers: string[];
    writers: string[];
    composers: string[];
    engineers?: string[];
    mixedBy?: string[];
    masteredBy?: string[];
    featuredArtists?: string[];
  };
  lyrics?: string;
}

interface Artist {
  id: number;
  artist_name: string;
  email: string;
}

export function ReleaseManagement() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [audioScans, setAudioScans] = useState<any[]>([]);
  const [scanSummary, setScanSummary] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [filterArtistId, setFilterArtistId] = useState<string>("all");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [upcCode, setUpcCode] = useState("");
  const [trackIsrcCodes, setTrackIsrcCodes] = useState<{
    [key: string]: string;
  }>({});
  const [editingCodes, setEditingCodes] = useState(false);

  useEffect(() => {
    fetchArtists();
  }, []);

  useEffect(() => {
    fetchReleases();
  }, [statusFilter, filterArtistId]);

  const fetchArtists = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/artists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setArtists(data);
      } else {
        toast.error("Failed to fetch artists");
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast.error("Error fetching artists");
    }
  };

  const fetchReleases = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const params = new URLSearchParams({ status: statusFilter });
      if (filterArtistId && filterArtistId !== "all") {
        params.append("artist_id", filterArtistId);
      }

      const response = await fetch(`/api/admin/releases?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReleases(data.releases);
      } else {
        toast.error("Failed to fetch releases");
      }
    } catch (error) {
      console.error("Error fetching releases:", error);
      toast.error("Error fetching releases");
    } finally {
      setLoading(false);
    }
  };

  const fetchReleaseDetails = async (releaseId: string) => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/releases/${releaseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRelease(data.release);
        setAudioScans(data.audio_scans || []);
        setScanSummary(data.scan_summary || null);
      } else {
        toast.error("Failed to fetch release details");
      }
    } catch (error) {
      console.error("Error fetching release details:", error);
      toast.error("Error fetching release details");
    }
  };

  const updateReleaseStatus = async (releaseId: string, newStatus: string) => {
    setProcessing(releaseId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/releases", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          release_id: releaseId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Release ${newStatus} successfully`);
        fetchReleases();
        setSelectedRelease(null);
      } else {
        toast.error("Failed to update release status");
      }
    } catch (error) {
      console.error("Error updating release status:", error);
      toast.error("Error updating release status");
    } finally {
      setProcessing(null);
    }
  };

  const updateReleaseUpdateStatus = async (
    releaseId: string,
    newUpdateStatus: string
  ) => {
    setProcessing(releaseId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/releases/${releaseId}/update-status`,
        {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          update_status: newUpdateStatus,
        }),
        }
      );

      if (response.ok) {
        const displayStatus = newUpdateStatus === "" ? "none" : newUpdateStatus;
        toast.success(`Release update status updated to ${displayStatus}`);
        fetchReleases();
        setSelectedRelease(null);
      } else {
        const errorData = await response.json();
        toast.error(
          errorData.error || "Failed to update release update status"
        );
      }
    } catch (error) {
      console.error("Error updating release update status:", error);
      toast.error("Failed to update release update status");
    } finally {
      setProcessing(null);
    }
  };

  const updateCodes = async (releaseId: string) => {
    setProcessing(releaseId);
    try {
      const token = localStorage.getItem("authToken");
      
      // Prepare track codes array
      const trackCodes = Object.entries(trackIsrcCodes).map(
        ([trackId, isrc]) => ({
        trackId,
          isrc,
        })
      );

      const response = await fetch(`/api/admin/releases/${releaseId}/codes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          upc: upcCode || undefined,
          trackCodes: trackCodes.length > 0 ? trackCodes : undefined,
        }),
      });

      if (response.ok) {
        toast.success("Codes updated successfully");
        fetchReleases();
        setEditingCodes(false);
        setUpcCode("");
        setTrackIsrcCodes({});
        setSelectedRelease(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update codes");
      }
    } catch (error) {
      console.error("Error updating codes:", error);
      toast.error("Error updating codes");
    } finally {
      setProcessing(null);
    }
  };

  const initializeCodes = (release: Release) => {
    setUpcCode(release.upc || "");
    
    // Initialize track ISRC codes
    const initialTrackCodes: { [key: string]: string } = {};
    if (release.tracks) {
      release.tracks.forEach((track: any) => {
        initialTrackCodes[track.id] = track.isrc || "";
      });
    }
    setTrackIsrcCodes(initialTrackCodes);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
      pending:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      under_review:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      sent_to_stores:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      live: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      takedown_requested:
        "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      takedown: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      // Legacy statuses for backwards compatibility
      approved:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      published:
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    };

    const formatStatus = (status: string) => {
      switch (status) {
        case "pending":
          return "Pending";
        case "under_review":
          return "Under Review";
        case "sent_to_stores":
          return "Sent to Stores";
        case "live":
          return "Live";
        case "rejected":
          return "Rejected";
        case "takedown_requested":
          return "Takedown Requested";
        case "takedown":
          return "Takedown";
        case "approved":
          return "Approved"; // Legacy
        case "published":
          return "Published"; // Legacy
        default:
          return (
            status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")
          );
      }
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          variants[status as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {formatStatus(status)}
      </span>
    );
  };

  const getUpdateStatusBadge = (updateStatus?: string) => {
    if (!updateStatus) return null;

    const variants = {
      "Changes Submitted":
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      "Up-to-Date":
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          variants[updateStatus as keyof typeof variants] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {updateStatus}
      </span>
    );
  };

  // Function to convert release data to CSV format
  const convertToCSV = (release: Release) => {
    const header = Object.keys(release).join(",");
    const values = Object.values(release)
      .map((value: any) => {
        if (Array.isArray(value)) {
          return `"${value.join(";")}"`; // Handle arrays by joining with semicolons
        }
        return `"${value}"`; // Enclose all values in quotes
      })
      .join(",");

    return `${header}\n${values}`;
  };

  // Function to trigger the download of complete release data as ZIP
  const downloadCompleteReleaseData = async (release: Release) => {
    if (!release) return;

    setDownloading(release.id);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/releases/${release.id}/download`,
        {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${release.release_title.replace(
          /[^a-zA-Z0-9]/g,
          "_"
        )}_complete_release_data.zip`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("Release data downloaded successfully!");
      } else {
        toast.error("Failed to download release data");
      }
    } catch (error) {
      console.error("Error downloading release data:", error);
      toast.error("Error downloading release data");
    } finally {
      setDownloading(null);
    }
  };

  // Function to trigger the download of release data as CSV (legacy)
  const downloadReleaseData = (release: Release) => {
    if (!release) return;

    const csvData = convertToCSV(release);
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${release.release_title.replace(
      /\s+/g,
      "_"
    )}_release_data.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Release Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="h-5 w-5" />
          Release Management
        </CardTitle>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manage artist distribution submissions
          </p>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Select value={filterArtistId} onValueChange={setFilterArtistId}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by artist (all)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Artists</SelectItem>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id.toString()}>
                    {artist.artist_name || artist.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="sent_to_stores">Sent to Stores</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="takedown_requested">
                  Takedown Requested
                </SelectItem>
                <SelectItem value="takedown">Takedown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {releases.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-600 dark:text-gray-400">
              No releases found{" "}
              {filterArtistId !== "all" ? `for selected artist ` : ""}with
              status: {statusFilter}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4 p-4">
              {releases.map((release) => (
                <Card key={release.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">
                          {release.artist_display_name}
                        </div>
                        <div className="text-xs text-gray-500 truncate">
                          {release.artist_email}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        {getStatusBadge(release.status)}
                        {getUpdateStatusBadge(release.update_status)}
                      </div>
                    </div>

                    <div>
                      <div className="font-medium text-sm">
                        {release.release_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        by {release.artist_name}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      <Badge variant="outline">
                        {release.distribution_type}
                      </Badge>
                      <span className="text-gray-500">
                        {release.primary_genre}
                      </span>
                      <span className="text-gray-500">
                        {release.track_count} tracks
                      </span>
                    </div>

                    <div className="text-xs space-y-1">
                      <div>
                        <span className="font-medium text-gray-700">UPC:</span>{" "}
                        {release.upc || "N/A"}
                      </div>
                      {release.tracks && release.tracks.length > 0 && (
                        <div>
                          <span className="font-medium text-gray-700">
                            ISRC:
                          </span>{" "}
                          {release.tracks[0]?.isrc || "N/A"}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600 space-y-1">
                      <div>
                        Created: {safeFormatDistance(release.created_at)}
                      </div>
                      {release.submitted_at && (
                        <div>
                          Submitted: {safeFormatDistance(release.submitted_at)}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full bg-transparent"
                            onClick={() => fetchReleaseDetails(release.id)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex items-center justify-between">
                              Release Details
                              <div className="flex gap-2">
                                <Button
                                  onClick={() =>
                                    selectedRelease &&
                                    downloadCompleteReleaseData(selectedRelease)
                                  }
                                  variant="default"
                                  size="sm"
                                  disabled={downloading === selectedRelease?.id}
                                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                                >
                                  {downloading === selectedRelease?.id ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                      Downloading...
                                    </>
                                  ) : (
                                    <>📦 Download Complete ZIP</>
                                  )}
                                </Button>
                                <Button
                                  onClick={() =>
                                    selectedRelease &&
                                    downloadReleaseData(selectedRelease)
                                  }
                                  variant="outline"
                                  size="sm"
                                >
                                  📊 CSV Only
                                </Button>
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          {selectedRelease && (
                            <div className="space-y-6">
                              {/* Artist Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-medium text-lg border-b pb-2">
                                    Artist Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Display Name:</strong>{" "}
                                      {selectedRelease.artist_display_name}
                                    </div>
                                    <div>
                                      <strong>Email:</strong>{" "}
                                      {selectedRelease.artist_email}
                                    </div>
                                    <div>
                                      <strong>Artist Name (on release):</strong>{" "}
                                      {selectedRelease.artist_name}
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h3 className="font-medium text-lg border-b pb-2">
                                    Release Status
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Status:</strong>{" "}
                                      {getStatusBadge(selectedRelease.status)}
                                    </div>
                                    {selectedRelease.update_status && (
                                      <div>
                                        <strong>Update Status:</strong>{" "}
                                        {getUpdateStatusBadge(
                                          selectedRelease.update_status
                                        )}
                                      </div>
                                    )}
                                    <div>
                                      <strong>Created:</strong>{" "}
                                      {safeFormatDistance(
                                        selectedRelease.created_at
                                      )}
                                    </div>
                                    {selectedRelease.submitted_at && (
                                      <div>
                                        <strong>Submitted:</strong>{" "}
                                        {safeFormatDistance(
                                          selectedRelease.submitted_at
                                        )}
                                      </div>
                                    )}
                                    <div>
                                      <strong>Last Updated:</strong>{" "}
                                      {safeFormatDistance(
                                        selectedRelease.updated_at ||
                                          selectedRelease.submitted_at
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Release Information */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <h3 className="font-medium text-lg border-b pb-2">
                                    Release Information
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Release Title:</strong>{" "}
                                      {selectedRelease.release_title}
                                    </div>
                                    <div>
                                      <strong>Distribution Type:</strong>{" "}
                                      {selectedRelease.distribution_type}
                                    </div>
                                    <div>
                                      <strong>Record Label:</strong>{" "}
                                      {selectedRelease.record_label ||
                                        "Not specified"}
                                    </div>
                                    <div>
                                      <strong>Primary Genre:</strong>{" "}
                                      {selectedRelease.primary_genre}
                                    </div>
                                    <div>
                                      <strong>Secondary Genre:</strong>{" "}
                                      {selectedRelease.secondary_genre ||
                                        "Not specified"}
                                    </div>
                                    <div>
                                      <strong>Language:</strong>{" "}
                                      {selectedRelease.language}
                                    </div>
                                    <div>
                                      <strong>Explicit Lyrics:</strong>{" "}
                                      {selectedRelease.explicit_lyrics
                                        ? "Yes"
                                        : "No"}
                                    </div>
                                    <div>
                                      <strong>Instrumental:</strong>{" "}
                                      {selectedRelease.instrumental
                                        ? "Yes"
                                        : "No"}
                                    </div>
                                    <div>
                                      <strong>Version Info:</strong>{" "}
                                      {selectedRelease.version_info}
                                    </div>
                                    {selectedRelease.version_other && (
                                      <div>
                                        <strong>Custom Version:</strong>{" "}
                                        {selectedRelease.version_other}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                <div className="space-y-4">
                                  <h3 className="font-medium text-lg border-b pb-2">
                                    Release Details
                                  </h3>
                                  <div className="space-y-2 text-sm">
                                    <div>
                                      <strong>Original Release Date:</strong>{" "}
                                      {selectedRelease.original_release_date
                                        ? new Date(
                                            selectedRelease.original_release_date
                                          ).toLocaleDateString()
                                        : "Not specified"}
                                  </div>
                                    <div>
                                      <strong>Previously Released:</strong>{" "}
                                      {selectedRelease.previously_released
                                        ? "Yes"
                                        : "No"}
                                    </div>
                                    <div>
                                      <strong>Track Price:</strong> $
                                      {selectedRelease.track_price || "0.99"}
                                    </div>
                                    <div>
                                      <strong>Album Cover:</strong>{" "}
                                      {selectedRelease.album_cover_url
                                        ? "Uploaded"
                                        : "Not uploaded"}
                                    </div>
                                    <div>
                                      <strong>Total Tracks:</strong>{" "}
                                      {selectedRelease.tracks?.length || 0}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Credits and Lyrics Section */}
                              <div className="space-y-4">
                                <h3 className="font-medium text-lg border-b pb-2">
                                  Credits & Lyrics
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">
                                        Credits
                                      </h4>
                                      <div className="space-y-2 text-sm">
                                        {selectedRelease.credits &&
                                        typeof selectedRelease.credits ===
                                          "object" ? (
                                          <>
                                            {selectedRelease.credits
                                              .producers &&
                                              selectedRelease.credits.producers
                                                .length > 0 && (
                                              <div>
                                                  <strong>Producers:</strong>{" "}
                                                  {selectedRelease.credits.producers.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits.writers &&
                                              selectedRelease.credits.writers
                                                .length > 0 && (
                                              <div>
                                                  <strong>Writers:</strong>{" "}
                                                  {selectedRelease.credits.writers.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits
                                              .composers &&
                                              selectedRelease.credits.composers
                                                .length > 0 && (
                                              <div>
                                                  <strong>Composers:</strong>{" "}
                                                  {selectedRelease.credits.composers.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits
                                              .engineers &&
                                              selectedRelease.credits.engineers
                                                .length > 0 && (
                                              <div>
                                                  <strong>Engineers:</strong>{" "}
                                                  {selectedRelease.credits.engineers.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits.mixedBy &&
                                              selectedRelease.credits.mixedBy
                                                .length > 0 && (
                                              <div>
                                                  <strong>Mixed By:</strong>{" "}
                                                  {selectedRelease.credits.mixedBy.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits
                                              .masteredBy &&
                                              selectedRelease.credits.masteredBy
                                                .length > 0 && (
                                              <div>
                                                  <strong>Mastered By:</strong>{" "}
                                                  {selectedRelease.credits.masteredBy.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                            {selectedRelease.credits
                                              .featuredArtists &&
                                              selectedRelease.credits
                                                .featuredArtists.length > 0 && (
                                              <div>
                                                  <strong>
                                                    Featured Artists:
                                                  </strong>{" "}
                                                  {selectedRelease.credits.featuredArtists.join(
                                                    ", "
                                                  )}
                                              </div>
                                            )}
                                          </>
                                        ) : (
                                          <div className="text-gray-500">
                                            No credits available
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="space-y-4">
                                    <div>
                                      <h4 className="font-medium text-sm mb-2">
                                        Lyrics
                                      </h4>
                                      <div className="text-sm">
                                        {selectedRelease.lyrics ? (
                                          <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto">
                                            {selectedRelease.lyrics}
                                          </div>
                                        ) : (
                                          <div className="text-gray-500">
                                            No lyrics available
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Agreements */}
                              <div className="space-y-4">
                                <h3 className="font-medium text-lg border-b pb-2">
                                  Legal Agreements
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <strong>Terms Agreed:</strong>{" "}
                                    {selectedRelease.terms_agreed
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                  <div>
                                    <strong>Fake Streaming Agreement:</strong>{" "}
                                    {selectedRelease.fake_streaming_agreement
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                  <div>
                                    <strong>Distribution Agreement:</strong>{" "}
                                    {selectedRelease.distribution_agreement
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                  <div>
                                    <strong>Artist Names Agreement:</strong>{" "}
                                    {selectedRelease.artist_names_agreement
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                  <div>
                                    <strong>Snapchat Terms:</strong>{" "}
                                    {selectedRelease.snapchat_terms
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                  <div>
                                    <strong>YouTube Music Agreement:</strong>{" "}
                                    {selectedRelease.youtube_music_agreement
                                      ? "✅ Yes"
                                      : "❌ No"}
                                  </div>
                                </div>
                              </div>

                              {/* Distribution Stores */}
                              <div className="space-y-4">
                                <h3 className="font-medium text-lg border-b pb-2">
                                  Distribution Stores (
                                  {selectedRelease.selected_stores?.length || 0}{" "}
                                  selected)
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                  {selectedRelease.selected_stores?.map(
                                    (store) => (
                                      <Badge
                                        key={store}
                                        variant="outline"
                                        className="text-xs"
                                      >
                                      {store}
                                    </Badge>
                                    )
                                  ) || (
                                    <span className="text-sm text-gray-500">
                                      No stores selected
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Track Details */}
                              {selectedRelease.tracks &&
                                selectedRelease.tracks.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="font-medium text-lg border-b pb-2">
                                      Track Details
                                    </h3>
                                  <div className="space-y-4">
                                      {selectedRelease.tracks.map(
                                        (track, index) => (
                                          <div
                                            key={index}
                                            className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                          >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="space-y-2">
                                            <div className="flex items-center gap-2">
                                              <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                                                Track {track.track_number}
                                              </span>
                                                  <div className="font-medium">
                                                    {track.track_title}
                                                  </div>
                                            </div>
                                            <div className="text-sm space-y-1">
                                                  <div>
                                                    <strong>Artists:</strong>{" "}
                                                    {track.artist_names?.join(
                                                      ", "
                                                    ) || "Not specified"}
                                                  </div>
                                                  {track.featured_artists
                                                    ?.length > 0 && (
                                                    <div>
                                                      <strong>Featured:</strong>{" "}
                                                      {track.featured_artists.join(
                                                        ", "
                                                      )}
                                                    </div>
                                                  )}
                                                  <div>
                                                    <strong>Genre:</strong>{" "}
                                                    {track.genre}
                                                  </div>
                                                  <div>
                                                    <strong>ISRC:</strong>{" "}
                                                    {track.isrc ||
                                                      "Not provided"}
                                                  </div>
                                                  <div>
                                                    <strong>Has Lyrics:</strong>{" "}
                                                    {track.has_lyrics
                                                      ? "Yes"
                                                      : "No"}
                                                  </div>
                                            </div>
                                          </div>

                                          <div className="space-y-2">
                                            <div className="text-sm space-y-1">
                                                  <div>
                                                    <strong>Audio File:</strong>{" "}
                                                    {track.audio_file_name
                                                      ? `✅ ${track.audio_file_name}`
                                                      : "❌ Not uploaded"}
                                                  </div>

                                              {/* Songwriters */}
                                              <div>
                                                    <strong>
                                                      Songwriters:
                                                    </strong>
                                                    {track.songwriters &&
                                                    track.songwriters.length >
                                                      0 ? (
                                                  <div className="mt-1 space-y-1">
                                                        {track.songwriters.map(
                                                          (
                                                            songwriter: any,
                                                            idx: number
                                                          ) => (
                                                            <div
                                                              key={idx}
                                                              className="text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded"
                                                            >
                                                              {songwriter.firstName ||
                                                                songwriter.first_name}{" "}
                                                              {songwriter.middleName ||
                                                                songwriter.middle_name}{" "}
                                                              {songwriter.lastName ||
                                                                songwriter.last_name}{" "}
                                                              -{" "}
                                                              {songwriter.role}
                                                      </div>
                                                          )
                                                        )}
                                                  </div>
                                                ) : (
                                                      <span className="text-gray-500">
                                                        {" "}
                                                        Not specified
                                                      </span>
                                                )}
                                              </div>

                                              {/* Producer Credits */}
                                              <div>
                                                <strong>Producers:</strong>
                                                    {track.producer_credits &&
                                                    track.producer_credits
                                                      .length > 0 ? (
                                                  <div className="mt-1 space-y-1">
                                                        {track.producer_credits.map(
                                                          (
                                                            producer: any,
                                                            idx: number
                                                          ) => (
                                                            <div
                                                              key={idx}
                                                              className="text-xs bg-green-50 dark:bg-green-900/30 p-2 rounded"
                                                            >
                                                              {producer.name} -{" "}
                                                              {producer.role}
                                                      </div>
                                                          )
                                                        )}
                                                  </div>
                                                ) : (
                                                      <span className="text-gray-500">
                                                        {" "}
                                                        Not specified
                                                      </span>
                                                )}
                                              </div>

                                              {/* Performer Credits */}
                                              <div>
                                                <strong>Performers:</strong>
                                                    {track.performer_credits &&
                                                    track.performer_credits
                                                      .length > 0 ? (
                                                  <div className="mt-1 space-y-1">
                                                        {track.performer_credits.map(
                                                          (
                                                            performer: any,
                                                            idx: number
                                                          ) => (
                                                            <div
                                                              key={idx}
                                                              className="text-xs bg-orange-50 dark:bg-orange-900/30 p-2 rounded"
                                                            >
                                                              {performer.name} -{" "}
                                                              {performer.role}
                                                      </div>
                                                          )
                                                        )}
                                                  </div>
                                                ) : (
                                                      <span className="text-gray-500">
                                                        {" "}
                                                        Not specified
                                                      </span>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Lyrics */}
                                        {track.lyrics_text && (
                                          <div className="mt-3 pt-3 border-t">
                                                <strong className="text-sm">
                                                  Lyrics:
                                                </strong>
                                            <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-32 overflow-y-auto">
                                                  <pre className="whitespace-pre-wrap font-mono">
                                                    {track.lyrics_text}
                                                  </pre>
                                            </div>
                                          </div>
                                        )}
                                          </div>
                                        )
                                      )}
                                    </div>
                                  </div>
                                )}

                              {/* Audio Scan Results */}
                              {audioScans && audioScans.length > 0 && (
                                <div className="space-y-4">
                                  <h3 className="font-medium text-lg border-b pb-2 flex items-center justify-between">
                                    AI Content Scanning Results
                                    {scanSummary && (
                                      <div className="flex gap-2 text-sm">
                                        {scanSummary.processing > 0 && (
                                          <Badge variant="secondary">
                                            🔄 {scanSummary.processing}{" "}
                                            Processing
                                          </Badge>
                                        )}
                                        {scanSummary.passed > 0 && (
                                          <Badge className="bg-green-500">
                                            ✅ {scanSummary.passed} Passed
                                          </Badge>
                                        )}
                                        {scanSummary.flagged > 0 && (
                                          <Badge variant="destructive">
                                            ⚠️ {scanSummary.flagged} Flagged
                                          </Badge>
                                        )}
                                        {scanSummary.failed > 0 && (
                                          <Badge variant="destructive">
                                            ❌ {scanSummary.failed} Failed
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </h3>
                                  <div className="space-y-3">
                                    {audioScans.map((scan, index) => (
                                      <div
                                        key={index}
                                        className={`border rounded-lg p-4 ${
                                          scan.scan_status === "flagged"
                                            ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                                            : scan.scan_status === "failed"
                                            ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10"
                                            : scan.scan_passed
                                            ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                                            : "bg-gray-50 dark:bg-gray-800"
                                        }`}
                                      >
                                        <div className="flex items-start justify-between mb-3">
                                          <div>
                                            <div className="font-medium text-sm">
                                              {scan.track_title ||
                                                `Track ${index + 1}`}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                              {scan.track_artist}
                                            </div>
                                          </div>
                                          <Badge
                                            className={
                                              scan.scan_status === "processing"
                                                ? "bg-blue-500"
                                                : scan.scan_status ===
                                                    "completed" &&
                                                  scan.scan_passed
                                                ? "bg-green-500"
                                                : scan.scan_status === "flagged"
                                                ? "bg-red-500"
                                                : scan.scan_status === "failed"
                                                ? "bg-yellow-500"
                                                : "bg-gray-500"
                                            }
                                          >
                                            {scan.scan_status === "processing"
                                              ? "🔄 Processing"
                                              : scan.scan_status ===
                                                  "completed" &&
                                                scan.scan_passed
                                              ? "✅ Passed"
                                              : scan.scan_status === "flagged"
                                              ? "⚠️ Flagged"
                                              : scan.scan_status === "failed"
                                              ? "❌ Failed"
                                              : scan.scan_status}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                          <div>
                                            <strong>IRCAM Job ID:</strong>{" "}
                                            {scan.ircam_job_id}
                                          </div>
                                          <div>
                                            <strong>Scan Status:</strong>{" "}
                                            {scan.scan_status}
                                          </div>
                                        </div>

                                        {/* AI Detection Results */}
                                        {scan.ai_generated_detected && (
                                          <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 rounded">
                                            <div className="font-medium text-sm text-purple-800 dark:text-purple-200 mb-2">
                                              ⚠️ AI-Generated Music Detected
                                            </div>
                                            <div className="text-xs space-y-1">
                                              <div>
                                                <strong>Confidence:</strong>{" "}
                                                {scan.ai_confidence}%
                                              </div>
                                              {scan.ai_model_version && (
                                                <div>
                                                  <strong>
                                                    Model Version:
                                                  </strong>{" "}
                                                  {scan.ai_model_version}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Flagged Reason */}
                                        {scan.flagged_reason && (
                                          <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded text-xs">
                                            <strong>Reason:</strong>{" "}
                                            {scan.flagged_reason}
                                          </div>
                                        )}

                                        {/* Error Message */}
                                        {scan.error_message && (
                                          <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 rounded text-xs">
                                            <strong>Error:</strong>{" "}
                                            {scan.error_message}
                                          </div>
                                        )}

                                        {/* Admin Review Status */}
                                        {scan.admin_reviewed && (
                                          <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 rounded">
                                            <div className="text-xs space-y-1">
                                              <div>
                                                <strong>Admin Decision:</strong>{" "}
                                                {scan.admin_decision}
                                              </div>
                                              {scan.admin_notes && (
                                                <div>
                                                  <strong>Admin Notes:</strong>{" "}
                                                  {scan.admin_notes}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        )}

                                        <div className="mt-2 text-xs text-gray-500">
                                          Scanned:{" "}
                                          {safeFormatDistance(scan.created_at)}
                                          {scan.updated_at !==
                                            scan.created_at && (
                                            <span className="ml-2">
                                              • Updated:{" "}
                                              {safeFormatDistance(
                                                scan.updated_at
                                              )}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {selectedRelease.status === "under_review" && (
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm font-medium">
                                      Admin Notes
                                    </label>
                                    <Textarea
                                      value={adminNotes}
                                      onChange={(e) =>
                                        setAdminNotes(e.target.value)
                                      }
                                      placeholder="Add notes for the artist..."
                                      rows={3}
                                    />
                                  </div>
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      onClick={() =>
                                        updateReleaseStatus(
                                          selectedRelease.id,
                                          "approved"
                                        )
                                      }
                                      disabled={
                                        processing === selectedRelease.id
                                      }
                                      className="bg-green-600 hover:bg-green-700 w-full"
                                    >
                                      {processing === selectedRelease.id
                                        ? "Processing..."
                                        : "Approve"}
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        updateReleaseStatus(
                                          selectedRelease.id,
                                          "rejected"
                                        )
                                      }
                                      disabled={
                                        processing === selectedRelease.id
                                      }
                                      className="w-full"
                                    >
                                      {processing === selectedRelease.id
                                        ? "Processing..."
                                        : "Reject"}
                                    </Button>
                                  </div>
                                </div>
                              )}

                              {/* Release Link Manager - Only show for live releases */}
                              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  Debug: Release status is "
                                  {selectedRelease.status}"
                                </p>
                                {selectedRelease.status === "live" && (
                                  <ReleaseLinkManager
                                    releaseId={selectedRelease.id}
                                    releaseTitle={selectedRelease.release_title}
                                  />
                                )}
                                {selectedRelease.status !== "live" && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    Release Link Manager only appears for LIVE
                                    releases
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>

                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">
                          Update Status
                        </label>
                        <Select 
                          value={release.status} 
                          onValueChange={(newStatus) =>
                            updateReleaseStatus(release.id, newStatus)
                          }
                          disabled={processing === release.id}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="under_review">
                              Under Review
                            </SelectItem>
                            <SelectItem value="sent_to_stores">
                              Sent to Stores
                            </SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                            <SelectItem value="takedown_requested">
                              Takedown Requested
                            </SelectItem>
                            <SelectItem value="takedown">Takedown</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Release</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Genre</TableHead>
                    <TableHead>Tracks</TableHead>
                    <TableHead>Codes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Update Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {releases.map((release) => (
                    <TableRow key={release.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {release.artist_display_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {release.artist_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {release.release_title}
                          </div>
                          <div className="text-sm text-gray-500">
                            by {release.artist_name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {release.distribution_type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {release.primary_genre}
                      </TableCell>
                      <TableCell className="text-center">
                        {release.track_count}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-xs">
                            <span className="font-medium">UPC:</span>{" "}
                            {release.upc || "N/A"}
                          </div>
                          {release.tracks && release.tracks.length > 0 && (
                            <div className="text-xs">
                              <span className="font-medium">ISRC:</span>{" "}
                              {release.tracks[0]?.isrc || "N/A"}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(release.status)}</TableCell>
                      <TableCell>
                        {getUpdateStatusBadge(release.update_status)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        <div className="space-y-1">
                          <div>
                            Created: {safeFormatDistance(release.created_at)}
                          </div>
                          {release.submitted_at && (
                            <div>
                              Submitted:{" "}
                              {safeFormatDistance(release.submitted_at)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => fetchReleaseDetails(release.id)}
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="flex items-center justify-between">
                                  Release Details
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() =>
                                        selectedRelease &&
                                        downloadCompleteReleaseData(
                                          selectedRelease
                                        )
                                      }
                                      variant="default"
                                      size="sm"
                                      disabled={
                                        downloading === selectedRelease?.id
                                      }
                                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white disabled:opacity-50"
                                    >
                                      {downloading === selectedRelease?.id ? (
                                        <>
                                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                          Downloading...
                                        </>
                                      ) : (
                                        <>📦 Download Complete ZIP</>
                                      )}
                                    </Button>
                                    <Button
                                      onClick={() =>
                                        selectedRelease &&
                                        downloadReleaseData(selectedRelease)
                                      }
                                      variant="outline"
                                      size="sm"
                                    >
                                      📊 CSV Only
                                    </Button>
                                  </div>
                                </DialogTitle>
                              </DialogHeader>
                              {selectedRelease && (
                                <div className="space-y-6">
                                  {/* Artist Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="font-medium text-lg border-b pb-2">
                                        Artist Information
                                      </h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <strong>Display Name:</strong>{" "}
                                          {selectedRelease.artist_display_name}
                                        </div>
                                        <div>
                                          <strong>Email:</strong>{" "}
                                          {selectedRelease.artist_email}
                                        </div>
                                        <div>
                                          <strong>
                                            Artist Name (on release):
                                          </strong>{" "}
                                          {selectedRelease.artist_name}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-medium text-lg border-b pb-2">
                                        Release Status
                                      </h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <strong>Status:</strong>{" "}
                                          {getStatusBadge(
                                            selectedRelease.status
                                          )}
                                        </div>
                                        {selectedRelease.update_status && (
                                          <div>
                                            <strong>Update Status:</strong>{" "}
                                            {getUpdateStatusBadge(
                                              selectedRelease.update_status
                                            )}
                                          </div>
                                        )}
                                        <div>
                                          <strong>Created:</strong>{" "}
                                          {safeFormatDistance(
                                            selectedRelease.created_at
                                          )}
                                        </div>
                                    {selectedRelease.submitted_at && (
                                          <div>
                                            <strong>Submitted:</strong>{" "}
                                            {safeFormatDistance(
                                              selectedRelease.submitted_at
                                            )}
                                          </div>
                                        )}
                                        <div>
                                          <strong>Last Updated:</strong>{" "}
                                          {safeFormatDistance(
                                            selectedRelease.updated_at ||
                                              selectedRelease.submitted_at
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Release Information */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                      <h3 className="font-medium text-lg border-b pb-2">
                                        Release Information
                                      </h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <strong>Release Title:</strong>{" "}
                                          {selectedRelease.release_title}
                                        </div>
                                        <div>
                                          <strong>Distribution Type:</strong>{" "}
                                          {selectedRelease.distribution_type}
                                        </div>
                                        <div>
                                          <strong>Record Label:</strong>{" "}
                                          {selectedRelease.record_label ||
                                            "Not specified"}
                                        </div>
                                        <div>
                                          <strong>C-Line (©):</strong>{" "}
                                          {selectedRelease.c_line ||
                                            "Not specified"}
                                        </div>
                                        <div>
                                          <strong>P-Line (℗):</strong>{" "}
                                          {selectedRelease.p_line ||
                                            "Not specified"}
                                        </div>
                                        <div>
                                          <strong>Primary Genre:</strong>{" "}
                                          {selectedRelease.primary_genre}
                                        </div>
                                        <div>
                                          <strong>Secondary Genre:</strong>{" "}
                                          {selectedRelease.secondary_genre ||
                                            "Not specified"}
                                        </div>
                                        <div>
                                          <strong>Language:</strong>{" "}
                                          {selectedRelease.language}
                                        </div>
                                        <div>
                                          <strong>Explicit Lyrics:</strong>{" "}
                                          {selectedRelease.explicit_lyrics
                                            ? "Yes"
                                            : "No"}
                                        </div>
                                        <div>
                                          <strong>Instrumental:</strong>{" "}
                                          {selectedRelease.instrumental
                                            ? "Yes"
                                            : "No"}
                                        </div>
                                        <div>
                                          <strong>Version Info:</strong>{" "}
                                          {selectedRelease.version_info}
                                        </div>
                                        {selectedRelease.version_other && (
                                          <div>
                                            <strong>Custom Version:</strong>{" "}
                                            {selectedRelease.version_other}
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <h3 className="font-medium text-lg border-b pb-2">
                                        Release Details
                                      </h3>
                                      <div className="space-y-2 text-sm">
                                        <div>
                                          <strong>
                                            Original Release Date:
                                          </strong>{" "}
                                          {selectedRelease.original_release_date
                                            ? new Date(
                                                selectedRelease.original_release_date
                                              ).toLocaleDateString()
                                            : "Not specified"}
                                      </div>
                                        <div>
                                          <strong>Previously Released:</strong>{" "}
                                          {selectedRelease.previously_released
                                            ? "Yes"
                                            : "No"}
                                        </div>
                                        <div>
                                          <strong>Track Price:</strong> $
                                          {selectedRelease.track_price ||
                                            "0.99"}
                                        </div>
                                        <div>
                                          <strong>Album Cover:</strong>{" "}
                                          {selectedRelease.album_cover_url
                                            ? "Uploaded"
                                            : "Not uploaded"}
                                        </div>
                                        <div>
                                          <strong>Total Tracks:</strong>{" "}
                                          {selectedRelease.tracks?.length || 0}
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Credits and Lyrics Section */}
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg border-b pb-2">
                                      Credits & Lyrics
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">
                                            Credits
                                          </h4>
                                          <div className="space-y-2 text-sm">
                                            {selectedRelease.credits &&
                                            typeof selectedRelease.credits ===
                                              "object" ? (
                                              <>
                                                {selectedRelease.credits
                                                  .producers &&
                                                  selectedRelease.credits
                                                    .producers.length > 0 && (
                                                  <div>
                                                      <strong>
                                                        Producers:
                                                      </strong>{" "}
                                                      {selectedRelease.credits.producers.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .writers &&
                                                  selectedRelease.credits
                                                    .writers.length > 0 && (
                                                  <div>
                                                      <strong>Writers:</strong>{" "}
                                                      {selectedRelease.credits.writers.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .composers &&
                                                  selectedRelease.credits
                                                    .composers.length > 0 && (
                                                  <div>
                                                      <strong>
                                                        Composers:
                                                      </strong>{" "}
                                                      {selectedRelease.credits.composers.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .engineers &&
                                                  selectedRelease.credits
                                                    .engineers.length > 0 && (
                                                  <div>
                                                      <strong>
                                                        Engineers:
                                                      </strong>{" "}
                                                      {selectedRelease.credits.engineers.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .mixedBy &&
                                                  selectedRelease.credits
                                                    .mixedBy.length > 0 && (
                                                  <div>
                                                      <strong>Mixed By:</strong>{" "}
                                                      {selectedRelease.credits.mixedBy.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .masteredBy &&
                                                  selectedRelease.credits
                                                    .masteredBy.length > 0 && (
                                                  <div>
                                                      <strong>
                                                        Mastered By:
                                                      </strong>{" "}
                                                      {selectedRelease.credits.masteredBy.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                                {selectedRelease.credits
                                                  .featuredArtists &&
                                                  selectedRelease.credits
                                                    .featuredArtists.length >
                                                    0 && (
                                                  <div>
                                                      <strong>
                                                        Featured Artists:
                                                      </strong>{" "}
                                                      {selectedRelease.credits.featuredArtists.join(
                                                        ", "
                                                      )}
                                                  </div>
                                                )}
                                              </>
                                            ) : (
                                              <div className="text-gray-500">
                                                No credits available
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="space-y-4">
                                        <div>
                                          <h4 className="font-medium text-sm mb-2">
                                            Lyrics
                                          </h4>
                                          <div className="text-sm">
                                            {selectedRelease.lyrics ? (
                                              <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-md max-h-40 overflow-y-auto">
                                                {selectedRelease.lyrics}
                                              </div>
                                            ) : (
                                              <div className="text-gray-500">
                                                No lyrics available
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Agreements */}
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg border-b pb-2">
                                      Legal Agreements
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Terms Agreed:</strong>{" "}
                                        {selectedRelease.terms_agreed
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                      <div>
                                        <strong>
                                          Fake Streaming Agreement:
                                        </strong>{" "}
                                        {selectedRelease.fake_streaming_agreement
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                      <div>
                                        <strong>Distribution Agreement:</strong>{" "}
                                        {selectedRelease.distribution_agreement
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                      <div>
                                        <strong>Artist Names Agreement:</strong>{" "}
                                        {selectedRelease.artist_names_agreement
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                      <div>
                                        <strong>Snapchat Terms:</strong>{" "}
                                        {selectedRelease.snapchat_terms
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                      <div>
                                        <strong>
                                          YouTube Music Agreement:
                                        </strong>{" "}
                                        {selectedRelease.youtube_music_agreement
                                          ? "✅ Yes"
                                          : "❌ No"}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Distribution Stores */}
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg border-b pb-2">
                                      Distribution Stores (
                                      {selectedRelease.selected_stores
                                        ?.length || 0}{" "}
                                      selected)
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedRelease.selected_stores?.map(
                                        (store) => (
                                          <Badge
                                            key={store}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                          {store}
                                        </Badge>
                                        )
                                      ) || (
                                        <span className="text-sm text-gray-500">
                                          No stores selected
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Artist Profiles */}
                                  <div className="space-y-4">
                                    <h3 className="font-medium text-lg border-b pb-2">
                                      Artist Profiles
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <strong>Spotify for Artists:</strong>{" "}
                                        {selectedRelease.has_spotify_profile
                                          ? "✅ Yes"
                                          : "❌ No"}
                                        {selectedRelease.has_spotify_profile &&
                                          selectedRelease.spotify_profile_url && (
                                          <div className="mt-1">
                                            <a 
                                                href={
                                                  selectedRelease.spotify_profile_url
                                                }
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
                                            >
                                                {
                                                  selectedRelease.spotify_profile_url
                                                }
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                      <div>
                                        <strong>
                                          Apple Music for Artists:
                                        </strong>{" "}
                                        {selectedRelease.has_apple_profile
                                          ? "✅ Yes"
                                          : "❌ No"}
                                        {selectedRelease.has_apple_profile &&
                                          selectedRelease.apple_profile_url && (
                                          <div className="mt-1">
                                            <a 
                                                href={
                                                  selectedRelease.apple_profile_url
                                                }
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
                                            >
                                                {
                                                  selectedRelease.apple_profile_url
                                                }
                                            </a>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Additional Delivery Options */}
                                  {selectedRelease.additional_delivery &&
                                    selectedRelease.additional_delivery.length >
                                      0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-lg border-b pb-2">
                                          Additional Delivery Options (
                                          {
                                            selectedRelease.additional_delivery
                                              .length
                                          }{" "}
                                          selected)
                                        </h3>
                                      <div className="grid gap-2">
                                          {selectedRelease.additional_delivery.map(
                                            (option) => (
                                              <div
                                                key={option}
                                                className="flex items-center gap-2"
                                              >
                                                <Badge
                                                  variant="secondary"
                                                  className="text-xs"
                                                >
                                              ✅ {option}
                                            </Badge>
                                          </div>
                                            )
                                          )}
                                      </div>
                                    </div>
                                  )}

                                  {/* Track Details */}
                                  {selectedRelease.tracks &&
                                    selectedRelease.tracks.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-medium text-lg border-b pb-2">
                                          Track Details
                                        </h3>
                                      <div className="space-y-4">
                                          {selectedRelease.tracks.map(
                                            (track, index) => (
                                              <div
                                                key={index}
                                                className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                                              >
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                              <div className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                  <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded text-xs font-medium">
                                                        Track{" "}
                                                        {track.track_number}
                                                  </span>
                                                      <div className="font-medium">
                                                        {track.track_title}
                                                      </div>
                                                </div>
                                                <div className="text-sm space-y-1">
                                                      <div>
                                                        <strong>
                                                          Artists:
                                                        </strong>{" "}
                                                        {track.artist_names?.join(
                                                          ", "
                                                        ) || "Not specified"}
                                                      </div>
                                                      {track.featured_artists
                                                        ?.length > 0 && (
                                                        <div>
                                                          <strong>
                                                            Featured:
                                                          </strong>{" "}
                                                          {track.featured_artists.join(
                                                            ", "
                                                          )}
                                                        </div>
                                                      )}
                                                      <div>
                                                        <strong>Genre:</strong>{" "}
                                                        {track.genre}
                                                      </div>
                                                      <div>
                                                        <strong>ISRC:</strong>{" "}
                                                        {track.isrc ||
                                                          "Not provided"}
                                                      </div>
                                                      <div>
                                                        <strong>
                                                          Has Lyrics:
                                                        </strong>{" "}
                                                        {track.has_lyrics
                                                          ? "Yes"
                                                          : "No"}
                                                      </div>
                                                </div>
                                              </div>

                                              <div className="space-y-2">
                                                <div className="text-sm space-y-1">
                                                      <div>
                                                        <strong>
                                                          Audio File:
                                                        </strong>{" "}
                                                        {track.audio_file_name
                                                          ? `✅ ${track.audio_file_name}`
                                                          : "❌ Not uploaded"}
                                                      </div>

                                                  {/* Songwriters */}
                                                  <div>
                                                        <strong>
                                                          Songwriters:
                                                        </strong>
                                                        {track.songwriters &&
                                                        track.songwriters
                                                          .length > 0 ? (
                                                      <div className="mt-1 space-y-1">
                                                            {track.songwriters.map(
                                                              (
                                                                songwriter: any,
                                                                idx: number
                                                              ) => (
                                                                <div
                                                                  key={idx}
                                                                  className="text-xs bg-blue-50 dark:bg-blue-900/30 p-2 rounded"
                                                                >
                                                                  {songwriter.firstName ||
                                                                    songwriter.first_name}{" "}
                                                                  {songwriter.middleName ||
                                                                    songwriter.middle_name}{" "}
                                                                  {songwriter.lastName ||
                                                                    songwriter.last_name}{" "}
                                                                  -{" "}
                                                                  {
                                                                    songwriter.role
                                                                  }
                                                          </div>
                                                              )
                                                            )}
                                                      </div>
                                                    ) : (
                                                          <span className="text-gray-500">
                                                            {" "}
                                                            Not specified
                                                          </span>
                                                    )}
                                                  </div>

                                                  {/* Producer Credits */}
                                                  <div>
                                                        <strong>
                                                          Producers:
                                                        </strong>
                                                        {track.producer_credits &&
                                                        track.producer_credits
                                                          .length > 0 ? (
                                                      <div className="mt-1 space-y-1">
                                                            {track.producer_credits.map(
                                                              (
                                                                producer: any,
                                                                idx: number
                                                              ) => (
                                                                <div
                                                                  key={idx}
                                                                  className="text-xs bg-green-50 dark:bg-green-900/30 p-2 rounded"
                                                                >
                                                                  {
                                                                    producer.name
                                                                  }{" "}
                                                                  -{" "}
                                                                  {
                                                                    producer.role
                                                                  }
                                                          </div>
                                                              )
                                                            )}
                                                      </div>
                                                    ) : (
                                                          <span className="text-gray-500">
                                                            {" "}
                                                            Not specified
                                                          </span>
                                                    )}
                                                  </div>

                                                  {/* Performer Credits */}
                                                  <div>
                                                        <strong>
                                                          Performers:
                                                        </strong>
                                                        {track.performer_credits &&
                                                        track.performer_credits
                                                          .length > 0 ? (
                                                      <div className="mt-1 space-y-1">
                                                            {track.performer_credits.map(
                                                              (
                                                                performer: any,
                                                                idx: number
                                                              ) => (
                                                                <div
                                                                  key={idx}
                                                                  className="text-xs bg-orange-50 dark:bg-orange-900/30 p-2 rounded"
                                                                >
                                                                  {
                                                                    performer.name
                                                                  }{" "}
                                                                  -{" "}
                                                                  {
                                                                    performer.role
                                                                  }
                                                          </div>
                                                              )
                                                            )}
                                                      </div>
                                                    ) : (
                                                          <span className="text-gray-500">
                                                            {" "}
                                                            Not specified
                                                          </span>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>

                                            {/* Lyrics */}
                                            {track.lyrics_text && (
                                              <div className="mt-3 pt-3 border-t">
                                                    <strong className="text-sm">
                                                      Lyrics:
                                                    </strong>
                                                <div className="mt-1 text-xs bg-gray-100 dark:bg-gray-700 p-3 rounded max-h-32 overflow-y-auto">
                                                      <pre className="whitespace-pre-wrap font-mono">
                                                        {track.lyrics_text}
                                                      </pre>
                                                </div>
                                              </div>
                                            )}
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )}

                                  {/* Audio Scan Results */}
                                  {audioScans && audioScans.length > 0 && (
                                    <div className="space-y-4">
                                      <h3 className="font-medium text-lg border-b pb-2 flex items-center justify-between">
                                        AI Content Scanning Results
                                        {scanSummary && (
                                          <div className="flex gap-2 text-sm">
                                            {scanSummary.processing > 0 && (
                                              <Badge variant="secondary">
                                                🔄 {scanSummary.processing}{" "}
                                                Processing
                                              </Badge>
                                            )}
                                            {scanSummary.passed > 0 && (
                                              <Badge className="bg-green-500">
                                                ✅ {scanSummary.passed} Passed
                                              </Badge>
                                            )}
                                            {scanSummary.flagged > 0 && (
                                              <Badge variant="destructive">
                                                ⚠️ {scanSummary.flagged} Flagged
                                              </Badge>
                                            )}
                                            {scanSummary.failed > 0 && (
                                              <Badge variant="destructive">
                                                ❌ {scanSummary.failed} Failed
                                              </Badge>
                                            )}
                                          </div>
                                        )}
                                      </h3>
                                      <div className="space-y-3">
                                        {audioScans.map((scan, index) => (
                                          <div
                                            key={index}
                                            className={`border rounded-lg p-4 ${
                                              scan.scan_status === "flagged"
                                                ? "border-red-300 bg-red-50 dark:bg-red-900/10"
                                                : scan.scan_status === "failed"
                                                ? "border-yellow-300 bg-yellow-50 dark:bg-yellow-900/10"
                                                : scan.scan_passed
                                                ? "border-green-300 bg-green-50 dark:bg-green-900/10"
                                                : "bg-gray-50 dark:bg-gray-800"
                                            }`}
                                          >
                                            <div className="flex items-start justify-between mb-3">
                                              <div>
                                                <div className="font-medium text-sm">
                                                  {scan.track_title ||
                                                    `Track ${index + 1}`}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {scan.track_artist}
                                                </div>
                                              </div>
                                              <Badge
                                                className={
                                                  scan.scan_status ===
                                                  "processing"
                                                    ? "bg-blue-500"
                                                    : scan.scan_status ===
                                                        "completed" &&
                                                      scan.scan_passed
                                                    ? "bg-green-500"
                                                    : scan.scan_status ===
                                                      "flagged"
                                                    ? "bg-red-500"
                                                    : scan.scan_status ===
                                                      "failed"
                                                    ? "bg-yellow-500"
                                                    : "bg-gray-500"
                                                }
                                              >
                                                {scan.scan_status ===
                                                "processing"
                                                  ? "🔄 Processing"
                                                  : scan.scan_status ===
                                                      "completed" &&
                                                    scan.scan_passed
                                                  ? "✅ Passed"
                                                  : scan.scan_status ===
                                                    "flagged"
                                                  ? "⚠️ Flagged"
                                                  : scan.scan_status ===
                                                    "failed"
                                                  ? "❌ Failed"
                                                  : scan.scan_status}
                                              </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-xs">
                                              <div>
                                                <strong>IRCAM Job ID:</strong>{" "}
                                                {scan.ircam_job_id}
                                              </div>
                                              <div>
                                                <strong>Scan Status:</strong>{" "}
                                                {scan.scan_status}
                                              </div>
                                            </div>

                                            {/* AI Detection Results */}
                                            {scan.ai_generated_detected && (
                                              <div className="mt-3 p-3 bg-purple-100 dark:bg-purple-900/30 border border-purple-300 rounded">
                                                <div className="font-medium text-sm text-purple-800 dark:text-purple-200 mb-2">
                                                  ⚠️ AI-Generated Music Detected
                                                </div>
                                                <div className="text-xs space-y-1">
                                                  <div>
                                                    <strong>Confidence:</strong>{" "}
                                                    {scan.ai_confidence}%
                                                  </div>
                                                  {scan.ai_model_version && (
                                                    <div>
                                                      <strong>
                                                        Model Version:
                                                      </strong>{" "}
                                                      {scan.ai_model_version}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            {/* Flagged Reason */}
                                            {scan.flagged_reason && (
                                              <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 border border-red-300 rounded text-xs">
                                                <strong>Reason:</strong>{" "}
                                                {scan.flagged_reason}
                                              </div>
                                            )}

                                            {/* Error Message */}
                                            {scan.error_message && (
                                              <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 rounded text-xs">
                                                <strong>Error:</strong>{" "}
                                                {scan.error_message}
                                              </div>
                                            )}

                                            {/* Admin Review Status */}
                                            {scan.admin_reviewed && (
                                              <div className="mt-3 p-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-300 rounded">
                                                <div className="text-xs space-y-1">
                                                  <div>
                                                    <strong>
                                                      Admin Decision:
                                                    </strong>{" "}
                                                    {scan.admin_decision}
                                                  </div>
                                                  {scan.admin_notes && (
                                                    <div>
                                                      <strong>
                                                        Admin Notes:
                                                      </strong>{" "}
                                                      {scan.admin_notes}
                                                    </div>
                                                  )}
                                                </div>
                                              </div>
                                            )}

                                            <div className="mt-2 text-xs text-gray-500">
                                              Scanned:{" "}
                                              {safeFormatDistance(
                                                scan.created_at
                                              )}
                                              {scan.updated_at !==
                                                scan.created_at && (
                                                <span className="ml-2">
                                                  • Updated:{" "}
                                                  {safeFormatDistance(
                                                    scan.updated_at
                                                  )}
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* UPC and ISRC Code Management */}
                                  <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-medium text-lg border-b pb-2">
                                        Distribution Codes
                                      </h3>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          if (!editingCodes) {
                                            initializeCodes(selectedRelease);
                                          }
                                          setEditingCodes(!editingCodes);
                                        }}
                                      >
                                        {editingCodes ? "Cancel" : "Edit Codes"}
                                      </Button>
                                    </div>
                                    
                                    {editingCodes ? (
                                      <div className="space-y-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-800">
                                        {/* UPC Code */}
                                        <div>
                                          <label className="text-sm font-medium">
                                            UPC Code
                                          </label>
                                          <input
                                            type="text"
                                            value={upcCode}
                                            onChange={(e) =>
                                              setUpcCode(e.target.value)
                                            }
                                            placeholder="Enter UPC code from distributor"
                                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                          />
                                        </div>

                                        {/* Track ISRC Codes */}
                                        {selectedRelease.tracks &&
                                          selectedRelease.tracks.length > 0 && (
                                          <div>
                                              <label className="text-sm font-medium">
                                                Track ISRC Codes
                                              </label>
                                            <div className="space-y-2 mt-2">
                                                {selectedRelease.tracks.map(
                                                  (track: any) => (
                                                    <div
                                                      key={track.id}
                                                      className="flex items-center gap-3"
                                                    >
                                                  <span className="text-sm font-medium w-32">
                                                        Track{" "}
                                                        {track.track_number}:
                                                  </span>
                                                  <input
                                                    type="text"
                                                        value={
                                                          trackIsrcCodes[
                                                            track.id
                                                          ] || ""
                                                        }
                                                        onChange={(e) =>
                                                          setTrackIsrcCodes(
                                                            (prev) => ({
                                                      ...prev,
                                                              [track.id]:
                                                                e.target.value,
                                                            })
                                                          )
                                                        }
                                                    placeholder="Enter ISRC code"
                                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                                  />
                                                </div>
                                                  )
                                                )}
                                            </div>
                                          </div>
                                        )}

                                        {/* Save/Cancel Buttons */}
                                        <div className="flex gap-2 pt-2">
                                          <Button
                                            onClick={() =>
                                              updateCodes(selectedRelease.id)
                                            }
                                            disabled={
                                              processing === selectedRelease.id
                                            }
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            {processing === selectedRelease.id
                                              ? "Saving..."
                                              : "Save Codes"}
                                          </Button>
                                          <Button
                                            variant="outline"
                                            onClick={() => {
                                              setEditingCodes(false);
                                              setUpcCode("");
                                              setTrackIsrcCodes({});
                                            }}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="space-y-3">
                                        {/* Display Current UPC */}
                                        <div className="flex items-center gap-3">
                                          <span className="text-sm font-medium w-24">
                                            UPC Code:
                                          </span>
                                          <span className="text-sm">
                                            {selectedRelease.upc ||
                                              "Not assigned"}
                                          </span>
                                        </div>

                                        {/* Display Current ISRC Codes */}
                                        {selectedRelease.tracks &&
                                          selectedRelease.tracks.length > 0 && (
                                          <div>
                                              <span className="text-sm font-medium">
                                                Track ISRC Codes:
                                              </span>
                                            <div className="space-y-1 mt-1">
                                                {selectedRelease.tracks.map(
                                                  (track: any) => (
                                                    <div
                                                      key={track.id}
                                                      className="flex items-center gap-3 text-sm"
                                                    >
                                                      <span className="w-32">
                                                        Track{" "}
                                                        {track.track_number}:
                                                      </span>
                                                      <span>
                                                        {track.isrc ||
                                                          "Not assigned"}
                                                      </span>
                                                </div>
                                                  )
                                                )}
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">
                                        Admin Notes
                                      </label>
                                      <Textarea
                                        value={adminNotes}
                                        onChange={(e) =>
                                          setAdminNotes(e.target.value)
                                        }
                                        placeholder="Add notes for the artist..."
                                        rows={3}
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <div>
                                        <label className="text-sm font-medium">
                                          Update Status
                                        </label>
                                        <Select 
                                          value={selectedRelease.status} 
                                          onValueChange={(newStatus) =>
                                            updateReleaseStatus(
                                              selectedRelease.id,
                                              newStatus
                                            )
                                          }
                                          disabled={
                                            processing === selectedRelease.id
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="pending">
                                              Pending
                                            </SelectItem>
                                            <SelectItem value="under_review">
                                              Under Review
                                            </SelectItem>
                                            <SelectItem value="sent_to_stores">
                                              Sent to Stores
                                            </SelectItem>
                                            <SelectItem value="live">
                                              Live
                                            </SelectItem>
                                            <SelectItem value="rejected">
                                              Rejected
                                            </SelectItem>
                                            <SelectItem value="takedown_requested">
                                              Takedown Requested
                                            </SelectItem>
                                            <SelectItem value="takedown">
                                              Takedown
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">
                                          Update Status (Changes)
                                        </label>
                                        <Select 
                                          value={
                                            selectedRelease.update_status ||
                                            "none"
                                          }
                                          onValueChange={(newUpdateStatus) =>
                                            updateReleaseUpdateStatus(
                                              selectedRelease.id,
                                              newUpdateStatus === "none"
                                                ? ""
                                                : newUpdateStatus
                                            )
                                          }
                                          disabled={
                                            processing === selectedRelease.id
                                          }
                                        >
                                          <SelectTrigger className="w-full">
                                            <SelectValue placeholder="No changes submitted" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="none">
                                              No changes
                                            </SelectItem>
                                            <SelectItem value="Changes Submitted">
                                              Changes Submitted
                                            </SelectItem>
                                            <SelectItem value="Up-to-Date">
                                              Up-to-Date
                                            </SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Release Link Manager - Only show for live releases */}
                              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                  Debug: Release status is "
                                  {selectedRelease?.status}"
                                </p>
                                {selectedRelease?.status === "live" && (
                                  <ReleaseLinkManager
                                    releaseId={selectedRelease?.id}
                                    releaseTitle={selectedRelease.release_title}
                                  />
                                )}
                                {selectedRelease?.status !== "live" && (
                                  <p className="text-sm text-blue-600 mt-2">
                                    Release Link Manager only appears for LIVE
                                    releases
                                  </p>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Select 
                            value={release.status} 
                            onValueChange={(newStatus) =>
                              updateReleaseStatus(release.id, newStatus)
                            }
                            disabled={processing === release.id}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="under_review">
                                Under Review
                              </SelectItem>
                              <SelectItem value="sent_to_stores">
                                Sent to Stores
                              </SelectItem>
                              <SelectItem value="live">Live</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="takedown_requested">
                                Takedown Requested
                              </SelectItem>
                              <SelectItem value="takedown">Takedown</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
