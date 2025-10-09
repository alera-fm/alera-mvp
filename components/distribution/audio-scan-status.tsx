"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ScanResult {
  id: number;
  track_id?: number;
  ircam_job_id: string;
  status: string;
  track_title?: string;
  track_artist?: string;
  ai_generated_detected: boolean;
  ai_confidence?: number;
  ai_model_version?: string;
  scan_passed?: boolean;
  flagged_reason?: string;
  admin_reviewed: boolean;
  admin_decision?: string;
  admin_notes?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

interface AudioScanStatusProps {
  releaseId: string | number;
  onScanComplete?: (passed: boolean) => void;
}

export function AudioScanStatus({
  releaseId,
  onScanComplete,
}: AudioScanStatusProps) {
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [releaseStatus, setReleaseStatus] = useState<string>("not_scanned");
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    fetchScanResults();
  }, [releaseId]);

  // Poll for updates if any scan is still processing
  useEffect(() => {
    const hasProcessingScans = scans.some(
      (s) => s.status === "processing" || s.status === "pending"
    );

    if (hasProcessingScans && !polling) {
      setPolling(true);
      const interval = setInterval(() => {
        fetchScanResults();
      }, 5000); // Poll every 5 seconds

      return () => {
        clearInterval(interval);
        setPolling(false);
      };
    }
  }, [scans]);

  const fetchScanResults = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`/api/audio-scan/release/${releaseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || []);
        setReleaseStatus(data.release_scan_status || "not_scanned");

        // Notify parent if all scans are complete
        const allComplete = data.scans.every(
          (s: ScanResult) =>
            s.status === "completed" ||
            s.status === "failed" ||
            s.status === "flagged"
        );
        const allPassed = data.scans.every((s: ScanResult) => s.scan_passed);

        if (allComplete && onScanComplete) {
          onScanComplete(allPassed);
        }
      }
    } catch (error) {
      console.error("Error fetching scan results:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string, scanPassed?: boolean) => {
    if (status === "processing" || status === "pending") {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
    if (status === "completed" && scanPassed) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
    if (status === "flagged") {
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    }
    if (status === "failed") {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <Info className="h-5 w-5 text-gray-500" />;
  };

  const getStatusBadge = (status: string, scanPassed?: boolean) => {
    if (status === "processing" || status === "pending") {
      return <Badge variant="secondary">Processing</Badge>;
    }
    if (status === "completed" && scanPassed) {
      return <Badge className="bg-green-500">Passed</Badge>;
    }
    if (status === "flagged") {
      return <Badge variant="destructive">Flagged</Badge>;
    }
    if (status === "failed") {
      return <Badge variant="destructive">Failed</Badge>;
    }
    return <Badge variant="outline">Unknown</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            Loading scan results...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (scans.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audio Content Scanning
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <Info className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No audio files have been scanned yet.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Upload audio files in the Tracks section to begin scanning.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasFlags = scans.some((s) => s.status === "flagged");
  const allPassed = scans.every((s) => s.scan_passed);
  const anyProcessing = scans.some(
    (s) => s.status === "processing" || s.status === "pending"
  );

  return (
    <Card className={hasFlags ? "border-yellow-500" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Audio Content Scanning
          </div>
          {anyProcessing && (
            <Badge variant="secondary">
              <Loader2 className="h-3 w-3 animate-spin mr-1" />
              Scanning in progress...
            </Badge>
          )}
          {!anyProcessing && allPassed && (
            <Badge className="bg-green-500">All scans passed</Badge>
          )}
          {!anyProcessing && hasFlags && (
            <Badge variant="destructive">Issues detected</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {scans.map((scan) => (
          <div key={scan.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(scan.status, scan.scan_passed)}
                <div>
                  <p className="font-medium">
                    {scan.track_title || `Track ${scan.track_id || scan.id}`}
                  </p>
                  {scan.track_artist && (
                    <p className="text-sm text-muted-foreground">
                      {scan.track_artist}
                    </p>
                  )}
                </div>
              </div>
              {getStatusBadge(scan.status, scan.scan_passed)}
            </div>

            {/* AI-Generated Music Detection */}
            {scan.ai_generated_detected && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-purple-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
                      AI-Generated Music Detected
                    </p>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                      Confidence: {scan.ai_confidence}%
                    </p>
                    {scan.ai_model_version && (
                      <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                        Model Version: {scan.ai_model_version}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Flagged Reason */}
            {scan.flagged_reason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {scan.flagged_reason}
                </p>
              </div>
            )}

            {/* Admin Review */}
            {scan.admin_reviewed && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  Admin Review: {scan.admin_decision}
                </p>
                {scan.admin_notes && (
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {scan.admin_notes}
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {scan.error_message && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Error: {scan.error_message}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Last updated: {new Date(scan.updated_at).toLocaleString()}
            </div>
          </div>
        ))}

        {/* Overall Status Message */}
        {hasFlags && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              ⚠️ This release has been flagged for review
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
              Our team will review the flagged content before your release can
              be submitted to stores. This typically takes 24-48 hours.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
