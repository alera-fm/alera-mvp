"use client";

import AnalyticsUpload from "@/components/admin/analytics-upload";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analytics Data
        </h1>
        <p className="text-muted-foreground">
          Upload and manage analytics data from various streaming platforms
        </p>
      </div>
      <AnalyticsUpload />
    </div>
  );
}
