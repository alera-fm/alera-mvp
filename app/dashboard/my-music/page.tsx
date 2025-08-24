"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HeaderSection } from "@/components/header-section";
import { MobileNavigation } from "@/components/mobile-navigation";
import { MyMusicHeader } from "@/components/my-music/my-music-header";
import { ReleasesGrid } from "@/components/my-music/releases-grid";
import { ReleasesTable } from "@/components/my-music/releases-table";
import { EditReleaseModal } from "@/components/my-music/edit-release-modal";
import { useToast } from "@/hooks/use-toast";
import { Music, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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
  secondaryGenre: string | null;
  label: string | null;
  copyright: string;
  upcEan: string | null;
  explicitContent: boolean;
  credits: {
    producers: string[];
    writers: string[];
    composers: string[];
    engineers: string[];
    mixedBy: string[];
    masteredBy: string[];
    featuredArtists: string[];
  };
  lyrics: string | null;
  isrcCode: string | null;
  trackCount: number;
  distributionType: string;
}

export default function MyMusicPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Error",
          description: "Please log in to view your releases.",
        });
        return;
      }

      const response = await fetch("/api/distribution/releases", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const transformedReleases = data.releases.map((release: any) => ({
          id: release.id,
          trackTitle: release.release_title,
          artistName: release.artist_name,
          releaseDate: release.release_date,
          submissionDate: release.created_at,
          status: mapStatus(release.status),
          streams: 0, // This would come from analytics API
          revenue: 0, // This would come from analytics API
          platforms: release.selected_stores || [],
          artwork: release.album_cover_url,
          genre: release.primary_genre,
          secondaryGenre: release.secondary_genre,
          label: release.record_label || "Independent",
          copyright: `© ${new Date(release.created_at).getFullYear()} ${release.artist_name}`,
          upcEan: null, // This would be generated after approval
          explicitContent: release.explicit_lyrics || false,
          credits: {
            producers: [],
            writers: [],
            composers: [],
            engineers: [],
            mixedBy: [],
            masteredBy: [],
            featuredArtists: [],
          },
          lyrics: null,
          isrcCode: null, // This would be generated after approval
          trackCount: release.track_count || 0,
          distributionType: release.distribution_type,
        }));
        setReleases(transformedReleases);
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch releases.",
        });
      }
    } catch (error) {
      console.error("Error fetching releases:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while fetching releases.",
      });
    } finally {
      setLoading(false);
    }
  };

  const mapStatus = (status: string) => {
    switch (status) {
      case "draft":
        return "Pending";
      case "under_review":
        return "Under Review";
      case "approved":
        return "Sent to Stores";
      case "rejected":
        return "Rejected";
      case "distributed":
        return "Live";
      default:
        return "Pending";
    }
  };

  const handleEditRelease = (release: Release) => {
    setSelectedRelease(release);
    setIsEditModalOpen(true);
  };

  const handleSaveRelease = (updatedRelease: Release) => {
    setReleases((prev) =>
      prev.map((release) =>
        release.id === updatedRelease.id ? updatedRelease : release,
      ),
    );
  };

  const handleCloseModal = () => {
    setIsEditModalOpen(false);
    setSelectedRelease(null);
  };

  return (
    <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] pb-32 md:pb-6 overflow-x-hidden">
      <div className="max-w-7xl mx-auto p-3 md:p-5 space-y-6">
        {/* Mobile Header with Navigation */}

        <HeaderSection />

        <MyMusicHeader totalReleases={releases.length} />

        {loading ? (
          /* Loading State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="h-12 w-12 text-purple-500 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-[#333] dark:text-white mb-2">
                Loading your releases...
              </h3>
              <p className="text-[#666] dark:text-gray-400">
                Please wait while we fetch your music catalog.
              </p>
            </div>
          </motion.div>
        ) : releases.length === 0 ? (
          /* Empty State */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center py-12"
          >
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="h-12 w-12 text-purple-500" />
              </div>
              <h3 className="text-xl font-semibold text-[#333] dark:text-white mb-2">
                No releases yet
              </h3>
              <p className="text-[#666] dark:text-gray-400 mb-6">
                Start your music journey by distributing your first release to
                all major platforms.
              </p>
              <Button
                asChild
                className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90 rounded-full h-12 px-6"
              >
                <Link href="/dashboard/new-release">
                  <Plus className="h-4 w-4 mr-2" />
                  Distribute Your First Release
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block">
              <ReleasesTable releases={releases} onEdit={handleEditRelease} />
            </div>

            {/* Mobile/Tablet Grid View */}
            <div className="xl:hidden">
              <ReleasesGrid releases={releases} onEdit={handleEditRelease} />
            </div>
          </>
        )}
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Edit Release Modal */}
      <EditReleaseModal
        release={selectedRelease}
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveRelease}
      />
    </div>
  );
}
