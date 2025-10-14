"use client";

import { ReleaseManagement } from "@/components/admin/release-management";

export default function ReleaseManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Release Management
        </h1>
        <p className="text-muted-foreground">
          Manage and monitor all music releases on the platform
        </p>
      </div>
      <ReleaseManagement />
    </div>
  );
}
