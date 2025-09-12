"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, FileText, User, History, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Artist {
  id: number;
  email: string;
  artist_name: string;
  created_at: string;
}

interface UploadHistory {
  artist_id: number;
  artist_name: string;
  reporting_month: string;
  record_count: number;
  total_amount: number;
  first_upload: string;
  last_upload: string;
  platform_count: number;
  upload_type: string;
}

export function RevenueUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [selectedArtistId, setSelectedArtistId] = useState<string>("");
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingArtists, setIsLoadingArtists] = useState(true);
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyDays, setHistoryDays] = useState<string>("30");
  const [filterArtistId, setFilterArtistId] = useState<string>("all");
  const [deletingUploadId, setDeletingUploadId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchArtists();
    fetchUploadHistory();
  }, []);

  useEffect(() => {
    fetchUploadHistory();
  }, [historyDays, filterArtistId]);

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

  const fetchUploadHistory = async () => {
    try {
      setHistoryLoading(true);
      const params = new URLSearchParams({ days: historyDays });
      if (filterArtistId && filterArtistId !== "all") {
        params.append("artist_id", filterArtistId);
      }

      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/upload-history?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        console.log("Upload history data:", data);
        // Filter to only show earnings uploads, not analytics
        const earningsOnly = (data.uploads || []).filter((upload: any) => upload.upload_type === 'earnings');
        setUploadHistory(earningsOnly);
      } else {
        console.error("Failed to fetch upload history:", response.status);
      }
    } catch (error) {
      console.error("Failed to fetch upload history:", error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (
        selectedFile.name.endsWith(".tsv") ||
        selectedFile.name.endsWith(".csv")
      ) {
        setFile(selectedFile);
      } else {
        toast({
          title: "Error",
          description: "Please select a TSV or CSV file",
          variant: "destructive",
        });
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    if (!selectedArtistId) {
      toast({
        title: "Error",
        description: "Please select an artist first",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Use admin-specific upload with authentication
      const formData = new FormData();
      formData.append('file', file);
      formData.append('artist_id', selectedArtistId);
      
      const token = localStorage.getItem("authToken");
      const response = await fetch('/api/upload-revenue-report', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload revenue report');
      }
      
      const result = await response.json();

      // Show detailed success message
      const successMessage = `
        ✅ Upload Complete!

        📁 File: ${file.name}
        📊 Records Processed: ${result.processed}
        👤 Artist: ${artists.find((a) => a.id.toString() === selectedArtistId)?.artist_name || "Unknown"}
        ${result.errors?.length ? `⚠️ Errors: ${result.errors.length}` : "✨ No errors!"}

        The earnings data has been added to the artist's wallet.
      `;

      toast({
        title: "Upload Successful!",
        description: successMessage,
        variant: "default",
        duration: 8000,
      });

      setFile(null);
      setSelectedArtistId("");
      // Reset file input
      const fileInput = document.getElementById(
        "revenue-file",
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";

      // Refresh upload history after successful upload
      await fetchUploadHistory();
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to upload revenue report",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteUpload = async (uploadId: number, artistName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete this upload for ${artistName}? This will also remove all associated earnings data and cannot be undone.`,
      )
    ) {
      return;
    }

    try {
      setDeletingUploadId(uploadId);
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/admin/upload-history/${uploadId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast({
          title: "Upload Deleted",
          description:
            "Upload record and associated earnings data have been removed.",
        });
        await fetchUploadHistory();
      } else {
        toast({
          title: "Delete Failed",
          description: "Failed to delete upload record",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Delete error:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete upload record",
        variant: "destructive",
      });
    } finally {
      setDeletingUploadId(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Revenue Report
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="artist-select">Select Artist</Label>
            <Select
              value={selectedArtistId}
              onValueChange={setSelectedArtistId}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isLoadingArtists ? "Loading artists..." : "Select an artist"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {artists.map((artist) => (
                  <SelectItem key={artist.id} value={artist.id.toString()}>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{artist.artist_name || artist.email}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="revenue-file">TSV/CSV File</Label>
            <Input
              id="revenue-file"
              type="file"
              accept=".tsv,.csv"
              onChange={handleFileChange}
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <FileText className="h-4 w-4" />
              <span className="text-sm truncate">{file.name}</span>
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={
              !file || !selectedArtistId || isUploading || isLoadingArtists
            }
            className="w-full"
          >
            {isUploading ? "Uploading..." : "Upload Report"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Revenue Upload History
            </div>
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
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              Loading upload history...
            </div>
          ) : uploadHistory.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block md:hidden space-y-3 p-4">
                {uploadHistory.map((upload, index) => (
                  <Card
                    key={index}
                    className="border border-gray-200 dark:border-gray-700"
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                              {upload.artist_name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                              {upload.filename.slice(0, 20)}
                            </div>
                          </div>
                          <Badge
                            variant={
                              upload.upload_status === "success"
                                ? "default"
                                : "destructive"
                            }
                            className="ml-2 flex-shrink-0"
                          >
                            {upload.upload_status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Date:
                            </span>
                            <div className="font-medium">
                              {new Date(
                                upload.uploaded_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Records:
                            </span>
                            <div className="font-medium">
                              {upload.total_records}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">
                              Amount:
                            </span>
                            <div className="font-medium text-green-600 dark:text-green-400">
                              ${Number(upload.total_amount || 0).toFixed(2)}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteUpload(
                                  upload.id,
                                  upload.artist_name,
                                )
                              }
                              disabled={deletingUploadId === upload.id}
                              className="h-8 px-3 text-xs"
                            >
                              {deletingUploadId === upload.id ? (
                                <span className="flex items-center gap-1">
                                  <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>
                                  Deleting...
                                </span>
                              ) : (
                                <>
                                  <Trash2 className="h-3 w-3 mr-1" />
                                  Delete
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Artist
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          File
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Records
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {uploadHistory.map((upload, index) => (
                        <tr
                          key={index}
                          className="hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                            {upload.artist_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                            {upload.filename}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {new Date(upload.uploaded_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {upload.total_records}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            ${Number(upload.total_amount || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                upload.upload_type === "earnings"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {upload.upload_type === "earnings" ? "Earnings" : "Analytics"}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={
                                upload.upload_status === "success"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {upload.upload_status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                handleDeleteUpload(
                                  upload.id,
                                  upload.artist_name,
                                )
                              }
                              disabled={deletingUploadId === upload.id}
                            >
                              {deletingUploadId === upload.id
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-600 dark:text-gray-400">
              No uploads found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
