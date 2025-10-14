"use client";

import { RevenueUpload } from "@/components/admin/revenue-upload";

export default function RevenueReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Revenue Reports
        </h1>
        <p className="text-muted-foreground">
          Upload and manage artist revenue reports from streaming platforms
        </p>
      </div>
      <RevenueUpload />
    </div>
  );
}
