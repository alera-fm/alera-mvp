"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  History,
  User,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const PLATFORMS = [
  "Spotify",
  "Apple Music",
  "Deezer",
  "Meta",
  "TikTok",
  "Shazam",
];

interface Artist {
  id: number;
  artist_name: string;
  email: string;
}

interface AnalyticsUploadHistory {
  id: number;
  filename: string;
  platform: string;
  reporting_date: string;
  total_records: number;
  uploaded_at: string;
  uploaded_by?: number;
  uploaded_by_name?: string;
  artist_id?: number;
  selected_artist_name?: string;
}

export default function AnalyticsUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [platform, setPlatform] = useState<string>("");
  const [reportingDate, setReportingDate] = useState<string>("");
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadResults, setUploadResults] = useState<{
    success: boolean;
    recordsProcessed?: number;
    message?: string;
  } | null>(null);
  const [uploadHistory, setUploadHistory] = useState<AnalyticsUploadHistory[]>(
    []
  );
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState<string>("30");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  const { toast } = useToast();

  const fetchArtists = async () => {
    try {
      const response = await fetch("/api/admin/artists");
      if (response.ok) {
        const artistsData = await response.json();
        setArtists(artistsData);
      } else {
        toast({
          title: "Error",
          description: "Failed to load artists",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load artists",
        variant: "destructive",
      });
    } finally {
      setIsLoadingArtists(false);
    }
  };

  useEffect(() => {
    fetchArtists();
    fetchUploadHistory();
  }, []);

  useEffect(() => {
    fetchUploadHistory();
  }, [historyDays, filterPlatform]);

  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({ days: historyDays });
      if (filterPlatform && filterPlatform !== "all") {
        params.append("platform", filterPlatform);
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `/api/admin/analytics-upload-history?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUploadHistory(data.uploads || []);
      } else {
        console.error(
          "Failed to fetch analytics upload history:",
          response.status
        );
      }
    } catch (error) {
      console.error("Failed to fetch analytics upload history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const handleDeleteUpload = async (uploadId: number) => {
    try {
      setDeletingId(uploadId);
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `/api/admin/analytics-upload-history?upload_id=${uploadId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete upload");
      }
      toast({
        title: "Upload deleted",
        description: "Associated analytics were removed.",
      });
      fetchUploadHistory();
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Could not delete this upload.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "text/csv" ||
        file.type === "text/plain" ||
        file.name.endsWith(".csv") ||
        file.name.endsWith(".tsv") ||
        file.name.endsWith(".txt"))
    ) {
      setSelectedFile(file);
      setUploadResults(null);
    } else {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select a CSV, TSV, or text file",
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !platform || !reportingDate || !selectedArtistId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description:
          "Please select a file, platform, reporting date, and artist",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("platform", platform);
      formData.append("reporting_date", reportingDate);
      formData.append("artist_id", selectedArtistId);

      const response = await fetch("/api/admin/analytics-upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResults({
          success: true,
          recordsProcessed: data.recordsProcessed,
          message: data.message,
        });
        toast({
          title: "Upload successful",
          description: `Processed ${data.recordsProcessed} records`,
        });

        // Reset form and refresh history
        setSelectedFile(null);
        setPlatform("");
        setReportingDate("");
        setSelectedArtistId("");
        const fileInput = document.getElementById(
          "csv-upload"
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        fetchUploadHistory();
      } else {
        setUploadResults({
          success: false,
          message: data.error || "Upload failed",
        });
        toast({
          variant: "destructive",
          title: "Upload failed",
          description: data.error || "An error occurred during upload",
        });
      }
    } catch (error) {
      setUploadResults({
        success: false,
        message: "Network error occurred",
      });
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "Network error occurred",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Analytics Data Upload
          </CardTitle>
          <CardDescription>
            Upload daily analytics CSV files from distributors. Supported
            platforms: {PLATFORMS.join(", ")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="platform">Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reporting-date">Reporting Date</Label>
              <Input
                id="reporting-date"
                type="date"
                value={reportingDate}
                onChange={(e) => setReportingDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artist">Artist</Label>
              <Select
                value={selectedArtistId}
                onValueChange={setSelectedArtistId}
                disabled={isLoadingArtists}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      isLoadingArtists ? "Loading artists..." : "Select artist"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {artists.map((artist) => (
                    <SelectItem key={artist.id} value={artist.id.toString()}>
                      {artist.artist_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="csv-upload">CSV File</Label>
            <Input
              id="csv-upload"
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileSelect}
              className="cursor-pointer"
            />
            {selectedFile && (
              <p className="text-sm text-muted-foreground">
                Selected: {selectedFile.name} (
                {(selectedFile.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={
              !selectedFile ||
              !platform ||
              !reportingDate ||
              !selectedArtistId ||
              uploading
            }
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload Analytics Data"}
          </Button>

          {uploadResults && (
            <div
              className={`p-4 rounded-md border ${
                uploadResults.success
                  ? "bg-success/10 border-success/20 text-success"
                  : "bg-destructive/10 border-destructive/20 text-destructive"
              }`}
            >
              <div className="flex items-center gap-2">
                {uploadResults.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="font-medium">
                  {uploadResults.success
                    ? "Upload Successful"
                    : "Upload Failed"}
                </span>
              </div>
              <p className="text-sm mt-1">
                {uploadResults.message}
                {uploadResults.recordsProcessed &&
                  ` (${uploadResults.recordsProcessed} records processed)`}
              </p>
            </div>
          )}

          <div className="bg-muted p-4 rounded-md">
            <h4 className="font-medium mb-2">CSV Format Requirements:</h4>
            {platform ? (
              <div className="text-sm text-muted-foreground space-y-3">
                <p className="font-medium text-foreground">
                  Required columns for {platform} (must include ALL columns in
                  exact order):
                </p>
                {platform === "Deezer" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      Date | Song Name | ISRC | Service | Label | Artist Name |
                      Country | Streams | Source | Device Type
                    </p>
                  </div>
                )}
                {platform === "Apple Music" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      Date | Song Title | Artist | ISRC | Country | Device Type
                      | Source of Stream | Stream Count
                    </p>
                  </div>
                )}
                {platform === "Spotify" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      ISRC | Artist Name | Streams | Date | Song Name | Country
                      | Source | Device Type
                    </p>
                  </div>
                )}
                {platform === "Meta" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      Service | Product Type | ISRC | UPC | Song Title | Artist
                      | Event Count | Territory
                    </p>
                  </div>
                )}
                {platform === "Shazam" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      Track Title | Artist | Country | State | City | ISRC |
                      Shazam Count
                    </p>
                  </div>
                )}
                {platform === "TikTok" && (
                  <div className="bg-background p-3 rounded border">
                    <p className="font-mono text-xs break-all">
                      Platform Name | Song ID | ISRC | UPC | Song Title | Artist
                      | Platform Classified Genre | Territory | Content Type |
                      Creations | Video Views | Comments | Likes | Shares |
                      Favorites | Average Watchtime
                    </p>
                  </div>
                )}
                <div className="mt-3 pt-2 border-t border-muted-foreground/20">
                  <p className="font-medium text-destructive">
                    ⚠️ CRITICAL REQUIREMENTS:
                  </p>
                  <ul className="space-y-1 mt-1">
                    <li>
                      • ALL columns listed above must be present in your CSV/TSV
                      file
                    </li>
                    <li>• Column names must match EXACTLY (case-sensitive)</li>
                    <li>• Column order doesn't matter, but all must exist</li>
                    <li>
                      • Supports both comma-separated (CSV) and tab-separated
                      (TSV) files
                    </li>
                    <li>• Artist names must match existing user accounts</li>
                    <li>• Date format: YYYY-MM-DD (when applicable)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a platform to see specific column requirements
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Analytics Upload History
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Select value={filterPlatform} onValueChange={setFilterPlatform}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by platform (all)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  {PLATFORMS.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={historyDays} onValueChange={setHistoryDays}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {historyLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Loading analytics upload history...
            </div>
          ) : uploadHistory.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4 p-4">
                {uploadHistory.map((upload) => (
                  <Card key={upload.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="font-medium truncate">
                          {upload.filename}
                        </div>
                        <Badge variant="info" className="text-xs">
                          {upload.platform}
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Artist: {upload.selected_artist_name || "N/A"}
                      </div>

                      <div className="text-sm text-muted-foreground">
                        Reporting Date:{" "}
                        {new Date(upload.reporting_date).toLocaleDateString()}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {new Date(upload.uploaded_at).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                          {upload.total_records} records
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                          {upload.uploaded_by_name || "Admin"}
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteUpload(upload.id)}
                          disabled={deletingId === upload.id}
                        >
                          {deletingId === upload.id ? (
                            <>
                              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">
                        Filename
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Artist
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Platform
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Reporting Date
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Records
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Uploaded
                      </TableHead>
                      <TableHead className="whitespace-nowrap">
                        Uploaded By
                      </TableHead>
                      <TableHead className="whitespace-nowrap text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadHistory.map((upload) => (
                      <TableRow key={upload.id}>
                        <TableCell className="whitespace-nowrap max-w-xs truncate font-medium">
                          {upload.filename}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {upload.selected_artist_name || "N/A"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          <Badge variant="info" className="text-xs">
                            {upload.platform}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(upload.reporting_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {upload.total_records}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {new Date(upload.uploaded_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                          {upload.uploaded_by_name || "Admin"}
                        </TableCell>
                        <TableCell className="whitespace-nowrap text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUpload(upload.id)}
                            disabled={deletingId === upload.id}
                          >
                            {deletingId === upload.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Deleting...
                              </>
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No analytics uploads found
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
