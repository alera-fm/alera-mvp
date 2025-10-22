"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  User,
  Music,
  Loader2,
  Mail,
  Calendar,
  CreditCard,
  Package,
  ExternalLink,
  X,
  AlertCircle,
} from "lucide-react";
import type { SearchResult } from "@/types/admin";
import { formatDistanceToNow } from "date-fns";

interface UserDetails {
  id: number;
  email: string;
  artist_name: string;
  created_at: string;
  is_verified: boolean;
  identity_verified: boolean;
  subscription?: {
    tier: string;
    status: string;
    trial_expires_at?: string;
    subscription_expires_at?: string;
  };
  release_count: number;
  total_earnings: number;
}

interface ReleaseDetails {
  id: string;
  artist_name: string;
  artist_email: string;
  release_title: string;
  distribution_type: string;
  primary_genre: string;
  track_count: number;
  status: string;
  submitted_at: string;
  created_at: string;
  upc?: string;
  album_cover_url?: string;
  tracks?: Array<{
    id: string;
    track_title: string;
    track_number: number;
    isrc?: string;
  }>;
}

export function AdminQuickSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceTimer = useRef<NodeJS.Timeout>(null);

  // Dialog states
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [releaseDialogOpen, setReleaseDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDetails | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<ReleaseDetails | null>(
    null
  );
  const [loadingDetails, setLoadingDetails] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.trim().length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) return;

        const response = await fetch(
          `/api/admin/search?q=${encodeURIComponent(query)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  const fetchUserDetails = async (userId: number | string) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setUserDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const fetchReleaseDetails = async (releaseId: string) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch(`/api/admin/releases/${releaseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedRelease(data.release);
        setReleaseDialogOpen(true);
      }
    } catch (error) {
      console.error("Error fetching release details:", error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === "user") {
      fetchUserDetails(result.id);
    } else if (result.type === "release") {
      fetchReleaseDetails(result.id as string);
    }
    setQuery("");
    setResults([]);
    setIsOpen(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      {
        variant:
          | "default"
          | "secondary"
          | "success"
          | "warning"
          | "destructive";
        label: string;
      }
    > = {
      draft: { variant: "secondary", label: "Draft" },
      pending: { variant: "secondary", label: "Pending" },
      under_review: { variant: "warning", label: "Under Review" },
      sent_to_stores: { variant: "default", label: "Sent to Stores" },
      live: { variant: "success", label: "Live" },
      rejected: { variant: "destructive", label: "Rejected" },
      takedown_requested: { variant: "warning", label: "Takedown Requested" },
      takedown: { variant: "destructive", label: "Takedown" },
    };

    const config = statusConfig[status] || {
      variant: "secondary" as const,
      label: status,
    };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <>
      <div ref={searchRef} className="relative w-full">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search for users or releases..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 pr-10 h-11"
          />
          {query && !isLoading && (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isLoading && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
          )}
        </div>

        {/* Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 max-h-[400px] overflow-y-auto">
            {results.map((result, index) => (
              <button
                key={`${result.type}-${result.id}-${index}`}
                onClick={() => handleResultClick(result)}
                className="w-full px-4 py-3 flex items-start gap-3 hover:bg-accent transition-colors text-left border-b border-border last:border-b-0"
              >
                <div className="mt-1">
                  {result.type === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <Music className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">
                    {result.title}
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {result.subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {isOpen &&
          results.length === 0 &&
          !isLoading &&
          query.trim().length >= 2 && (
            <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50 px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">No results found</p>
            </div>
          )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              User Details
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedUser ? (
            <div className="space-y-4">
              {/* Basic Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Artist Name:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.artist_name || "Not set"}
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      Email:
                    </span>
                    <span className="text-sm font-medium break-all">
                      {selectedUser.email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined:
                    </span>
                    <span className="text-xs sm:text-sm">
                      {new Date(selectedUser.created_at).toLocaleDateString()} (
                      {formatDistanceToNow(new Date(selectedUser.created_at), {
                        addSuffix: true,
                      })}
                      )
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Email Verified:
                    </span>
                    <Badge
                      variant={
                        selectedUser.is_verified ? "success" : "secondary"
                      }
                      className="w-fit"
                    >
                      {selectedUser.is_verified ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Identity Verified:
                    </span>
                    <Badge
                      variant={
                        selectedUser.identity_verified ? "success" : "secondary"
                      }
                      className="w-fit"
                    >
                      {selectedUser.identity_verified ? "Yes" : "No"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              {selectedUser.subscription && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm md:text-base flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Tier:
                      </span>
                      <Badge
                        variant={
                          selectedUser.subscription.tier === "pro"
                            ? "default"
                            : selectedUser.subscription.tier === "plus"
                            ? "success"
                            : "secondary"
                        }
                        className="w-fit capitalize"
                      >
                        {selectedUser.subscription.tier}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        Status:
                      </span>
                      <Badge
                        variant={
                          selectedUser.subscription.status === "active"
                            ? "success"
                            : "secondary"
                        }
                        className="w-fit capitalize"
                      >
                        {selectedUser.subscription.status}
                      </Badge>
                    </div>
                    {selectedUser.subscription.trial_expires_at && (
                      <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                        <span className="text-xs sm:text-sm text-muted-foreground">
                          Trial Expires:
                        </span>
                        <span className="text-xs sm:text-sm">
                          {new Date(
                            selectedUser.subscription.trial_expires_at
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Activity Stats */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Total Releases:
                    </span>
                    <span className="text-sm font-medium">
                      {selectedUser.release_count}
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr] gap-1 sm:gap-2 sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Total Earnings:
                    </span>
                    <span className="text-sm font-medium text-success">
                      ${selectedUser.total_earnings.toFixed(2)}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setUserDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* Release Details Dialog */}
      <Dialog open={releaseDialogOpen} onOpenChange={setReleaseDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] md:w-full">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Music className="h-5 w-5" />
              Release Details
            </DialogTitle>
          </DialogHeader>

          {loadingDetails ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedRelease ? (
            <div className="space-y-4">
              {/* Album Cover & Basic Info */}
              <div className="flex flex-col sm:flex-row gap-4">
                {selectedRelease.album_cover_url && (
                  <img
                    src={selectedRelease.album_cover_url}
                    alt={selectedRelease.release_title}
                    className="w-full sm:w-24 h-48 sm:h-24 rounded-lg border object-cover"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold mb-1">
                    {selectedRelease.release_title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    by {selectedRelease.artist_name}
                  </p>
                  {getStatusBadge(selectedRelease.status)}
                </div>
              </div>

              {/* Release Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">
                    Release Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Artist Email:
                    </span>
                    <span className="text-sm font-medium break-all">
                      {selectedRelease.artist_email}
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm sm:items-center">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Type:
                    </span>
                    <Badge variant="outline" className="w-fit">
                      {selectedRelease.distribution_type}
                    </Badge>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Genre:
                    </span>
                    <span className="text-sm">
                      {selectedRelease.primary_genre}
                    </span>
                  </div>
                  <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Track Count:
                    </span>
                    <span className="text-sm">
                      {selectedRelease.track_count}
                    </span>
                  </div>
                  {selectedRelease.upc && (
                    <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm">
                      <span className="text-xs sm:text-sm text-muted-foreground">
                        UPC:
                      </span>
                      <span className="text-sm font-mono">
                        {selectedRelease.upc}
                      </span>
                    </div>
                  )}
                  <div className="flex flex-col sm:grid sm:grid-cols-[140px_1fr] gap-1 sm:gap-2 text-sm">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Submitted:
                    </span>
                    <span className="text-xs sm:text-sm">
                      {new Date(
                        selectedRelease.submitted_at
                      ).toLocaleDateString()}{" "}
                      (
                      {formatDistanceToNow(
                        new Date(selectedRelease.submitted_at),
                        {
                          addSuffix: true,
                        }
                      )}
                      )
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Tracks */}
              {selectedRelease.tracks && selectedRelease.tracks.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm md:text-base">
                      Tracks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedRelease.tracks.map((track) => (
                        <div
                          key={track.id}
                          className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                        >
                          <div className="text-sm text-muted-foreground w-6">
                            {track.track_number}.
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {track.track_title}
                            </div>
                            {track.isrc && (
                              <div className="text-xs text-muted-foreground font-mono">
                                ISRC: {track.isrc}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setReleaseDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
