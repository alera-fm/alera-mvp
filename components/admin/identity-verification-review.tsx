"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "react-hot-toast";
import {
  Check,
  X,
  Clock,
  User,
  Instagram,
  Youtube,
  Facebook,
  Music,
  Shield,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface IdentityVerification {
  id: number;
  email: string;
  artist_name: string;
  identity_platform: string;
  identity_username: string;
  identity_data: any;
  idv_method: string;
  idv_document_type: string;
  idv_document_url: string;
  idv_document_name: string;
  idv_full_name: string;
  idv_date_of_birth: string;
  idv_document_number: string;
  identity_verification_submitted_at: string;
  created_at: string;
}

export function IdentityVerificationReview() {
  const [verifications, setVerifications] = useState<IdentityVerification[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedVerification, setSelectedVerification] =
    useState<IdentityVerification | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/identity-verifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setVerifications(data.verifications);
      } else {
        toast.error("Failed to fetch identity verifications");
      }
    } catch (error) {
      console.error("Error fetching verifications:", error);
      toast.error("Error fetching identity verifications");
    } finally {
      setLoading(false);
    }
  };

  const reviewVerification = async (
    userId: number,
    decision: "approved" | "rejected"
  ) => {
    setProcessing(userId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/identity-verifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          decision,
          notes: notes.trim() || null,
        }),
      });

      if (response.ok) {
        toast.success(`Identity verification ${decision} successfully`);
        setNotes("");
        setDialogOpen(false);
        setSelectedVerification(null);
        fetchVerifications(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${decision} verification`);
      }
    } catch (error) {
      console.error("Error reviewing verification:", error);
      toast.error(`Failed to ${decision} verification`);
    } finally {
      setProcessing(null);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="h-4 w-4" />;
      case "youtube":
        return <Youtube className="h-4 w-4" />;
      case "facebook":
        return <Facebook className="h-4 w-4" />;
      case "tiktok":
        return <Music className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getVerificationMethod = (verification: IdentityVerification) => {
    if (verification.idv_method) {
      return verification.idv_method;
    }

    if (verification.identity_data && verification.identity_platform) {
      return "social";
    }

    if (
      verification.idv_document_url ||
      verification.idv_full_name ||
      verification.idv_document_type
    ) {
      return "document";
    }

    return "unknown";
  };

  const getProfileUrl = (verification: IdentityVerification) => {
    const username = verification.identity_username?.replace("@", "") || "";

    switch (verification.identity_platform) {
      case "instagram":
        return `https://instagram.com/${username}`;
      case "tiktok":
        return `https://tiktok.com/@${username}`;
      case "youtube":
        return `https://youtube.com/@${username}`;
      case "facebook":
        if (username.startsWith("http")) {
          const cleanUrl = username.replace(/^@/, "").trim();
          const facebookMatches = cleanUrl.match(
            /https:\/\/www\.facebook\.com\/[^?\s]+/g
          );
          if (facebookMatches && facebookMatches.length > 0) {
            return facebookMatches[facebookMatches.length - 1];
          }
          return cleanUrl;
        }
        return `https://facebook.com/${username}`;
      default:
        return null;
    }
  };

  const getProfileData = (verification: IdentityVerification) => {
    const data = verification.identity_data;
    if (!data) return null;

    const userData = data.user || data.data?.user;

    switch (verification.identity_platform) {
      case "instagram":
        return {
          displayName: userData?.full_name || userData?.username,
          profilePicture:
            userData?.profile_pic_url_hd || userData?.profile_pic_url,
          followers:
            userData?.edge_follow?.count || userData?.edge_followed_by?.count,
          bio: userData?.biography,
        };
      case "tiktok":
        return {
          displayName: data.user?.nickname || data.user?.uniqueId,
          profilePicture: data.user?.avatarLarger || data.user?.avatarMedium,
          followers: data.stats?.followerCount || data.statsV2?.followerCount,
          bio: data.user?.signature,
        };
      case "youtube":
        return {
          displayName: data.name,
          profilePicture: data.avatar?.image?.sources?.[0]?.url,
          subscribers: data.subscriberCount,
          bio: data.description,
        };
      case "facebook":
        return {
          displayName: data.name,
          profilePicture: data.profilePhoto?.url,
          bio: data.about,
        };
      default:
        return null;
    }
  };

  const openVerificationDialog = (verification: IdentityVerification) => {
    setSelectedVerification(verification);
    setDialogOpen(true);
    setNotes("");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Identity Verification Review
          </CardTitle>
          <div className="text-sm text-muted-foreground mb-3">
            {verifications.length} pending verification
            {verifications.length !== 1 ? "s" : ""}
          </div>

          {verifications.length > 0 && (
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-info rounded-full"></div>
                <span className="text-muted-foreground">
                  Social Media:{" "}
                  {
                    verifications.filter(
                      (v) => getVerificationMethod(v) === "social"
                    ).length
                  }
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-muted-foreground">
                  Document:{" "}
                  {
                    verifications.filter(
                      (v) => getVerificationMethod(v) === "document"
                    ).length
                  }
                </span>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {verifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No pending identity verifications</p>
              <p className="text-sm mt-2">
                All identity verifications have been reviewed
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {verifications.map((verification) => {
                const verificationMethod = getVerificationMethod(verification);
                return (
                  <Card
                    key={verification.id}
                    className="cursor-pointer hover:shadow-lg hover:scale-[1.02] transition-all duration-200 border-border bg-card"
                    onClick={() => openVerificationDialog(verification)}
                  >
                    <CardContent className="p-4 space-y-3">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between">
                        <Badge
                          variant={
                            verificationMethod === "social"
                              ? "default"
                              : "secondary"
                          }
                          className="text-xs"
                        >
                          {verificationMethod === "social"
                            ? "Social"
                            : verificationMethod === "document"
                            ? "Document"
                            : "Unknown"}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          <Clock className="h-3 w-3" />
                          Pending
                        </Badge>
                      </div>

                      {/* Artist Info */}
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground truncate">
                          {verification.artist_name}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {verification.email}
                        </div>
                      </div>

                      {/* Platform/Method Info */}
                      {verificationMethod === "social" ? (
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(verification.identity_platform)}
                          <span className="text-sm text-muted-foreground truncate">
                            @{verification.identity_username}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-info" />
                          <span className="text-sm text-muted-foreground truncate">
                            {verification.idv_document_type?.replace("_", " ")}
                          </span>
                        </div>
                      )}

                      {/* Submitted Time */}
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        Submitted{" "}
                        {formatDistanceToNow(
                          new Date(
                            verification.identity_verification_submitted_at
                          ),
                          { addSuffix: true }
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Identity Verification Details
            </DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* Artist Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Artist Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Artist Name:</span>
                    <span className="font-medium">
                      {selectedVerification.artist_name}
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="font-medium">
                      {selectedVerification.email}
                    </span>
                  </div>
                  <div className="grid grid-cols-[120px_1fr] gap-2">
                    <span className="text-muted-foreground">Submitted:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(
                        new Date(
                          selectedVerification.identity_verification_submitted_at
                        ),
                        { addSuffix: true }
                      )}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Verification Details */}
              {getVerificationMethod(selectedVerification) === "social" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      {getPlatformIcon(selectedVerification.identity_platform)}
                      Social Media Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {selectedVerification.identity_platform}
                      </Badge>
                      <span className="text-sm font-medium">
                        @{selectedVerification.identity_username}
                      </span>
                      {getProfileUrl(selectedVerification) && (
                        <Button
                          variant="link"
                          size="sm"
                          asChild
                          className="h-auto p-0"
                        >
                          <a
                            href={getProfileUrl(selectedVerification)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="h-3 w-3" />
                            Visit Profile
                          </a>
                        </Button>
                      )}
                    </div>

                    {(() => {
                      const profileData = getProfileData(selectedVerification);
                      return profileData ? (
                        <div className="space-y-3">
                          <div className="flex items-start gap-4">
                            {profileData.profilePicture && (
                              <img
                                src={`/api/proxy-image?url=${encodeURIComponent(
                                  profileData.profilePicture
                                )}`}
                                alt="Profile"
                                className="w-16 h-16 rounded-full border-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-lg">
                                {profileData.displayName}
                              </div>
                              {profileData.followers && (
                                <div className="text-sm text-muted-foreground">
                                  👥 {profileData.followers.toLocaleString()}{" "}
                                  followers
                                </div>
                              )}
                              {profileData.subscribers && (
                                <div className="text-sm text-muted-foreground">
                                  📺 {profileData.subscribers.toLocaleString()}{" "}
                                  subscribers
                                </div>
                              )}
                            </div>
                          </div>
                          {profileData.bio && (
                            <div className="bg-muted p-3 rounded-lg">
                              <div className="text-sm font-medium mb-1">
                                Bio:
                              </div>
                              <div className="text-sm">{profileData.bio}</div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                          <div className="text-sm text-warning">
                            ⚠️ Profile data unavailable. Please verify manually
                            by visiting the profile.
                          </div>
                        </div>
                      );
                    })()}
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Shield className="h-5 w-5 text-info" />
                      Document Verification
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedVerification.idv_document_type && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Document Type
                          </div>
                          <div className="text-sm">
                            {selectedVerification.idv_document_type.replace(
                              "_",
                              " "
                            )}
                          </div>
                        </div>
                      )}
                      {selectedVerification.idv_full_name && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Full Name
                          </div>
                          <div className="text-sm">
                            {selectedVerification.idv_full_name}
                          </div>
                        </div>
                      )}
                      {selectedVerification.idv_date_of_birth && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Date of Birth
                          </div>
                          <div className="text-sm">
                            {new Date(
                              selectedVerification.idv_date_of_birth
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      )}
                      {selectedVerification.idv_document_number && (
                        <div className="bg-muted p-3 rounded-lg">
                          <div className="text-sm font-medium text-muted-foreground mb-1">
                            Document Number
                          </div>
                          <div className="text-sm font-mono">
                            {selectedVerification.idv_document_number}
                          </div>
                        </div>
                      )}
                    </div>

                    {selectedVerification.idv_document_url && (
                      <div>
                        <div className="text-sm font-medium text-muted-foreground mb-2">
                          Document Image
                        </div>
                        <div className="border-2 border-dashed rounded-lg p-4">
                          <img
                            src={selectedVerification.idv_document_url}
                            alt="Verification Document"
                            className="max-w-full h-auto rounded-lg border"
                            style={{ maxHeight: "400px" }}
                          />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Admin Notes and Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Review & Decision</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="notes">Admin Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes about this verification..."
                      rows={3}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() =>
                        reviewVerification(selectedVerification.id, "approved")
                      }
                      disabled={processing === selectedVerification.id}
                      variant="success"
                      className="flex-1"
                    >
                      {processing === selectedVerification.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <Check className="h-4 w-4 mr-2" />
                      )}
                      Approve
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        reviewVerification(selectedVerification.id, "rejected")
                      }
                      disabled={processing === selectedVerification.id}
                      className="flex-1"
                    >
                      {processing === selectedVerification.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      ) : (
                        <X className="h-4 w-4 mr-2" />
                      )}
                      Reject
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
