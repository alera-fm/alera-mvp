"use client";

import { HeaderSection } from "@/components/header-section";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { DistributionFlow } from "@/components/distribution/distribution-flow";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Loader2 } from "lucide-react";

export default function EditReleasePage() {
  const router = useRouter();
  const params = useParams();
  const releaseId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);

  const handleSave = (release: any) => {
    if (release.status === "under_review") {
      router.push("/dashboard/my-music");
    }
  };

  useEffect(() => {
    // Set loading to false after component mounts
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-6 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
            <p className="text-gray-600 dark:text-gray-400">Loading release editor...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-6">
        <HeaderSection />
        <DistributionFlow 
          editId={releaseId}
          onSave={handleSave} 
        />
        <MobileNavigation />
      </div>
    </ProtectedRoute>
  );
}
