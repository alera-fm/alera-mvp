"use client";

import { HeaderSection } from "@/components/header-section";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DistributionFlow } from "@/components/distribution/distribution-flow";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function NewReleasePage() {
  const router = useRouter();

  const handleSave = (release: any) => {
    if (release.status === "under_review") {
      router.push("/dashboard/my-music");
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-6">
        <HeaderSection />
        <DistributionFlow onSave={handleSave} />
        <MobileNavigation />
      </div>
    </ProtectedRoute>
  );
}
