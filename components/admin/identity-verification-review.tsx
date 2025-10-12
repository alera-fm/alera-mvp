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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

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
  const [reviewing, setReviewing] = useState<number | null>(null);
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
        setReviewing(null);
        setNotes("");
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

  // Helper function to determine verification method from data
  const getVerificationMethod = (verification: IdentityVerification) => {
    // If idv_method is explicitly set, use it
    if (verification.idv_method) {
      return verification.idv_method;
    }

    // Auto-detect based on available data
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

  // Helper function to generate profile URLs
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
        // Handle Facebook URLs that might already be full URLs
        if (username.startsWith("http")) {
          // Clean up malformed Facebook URLs
          const cleanUrl = username.replace(/^@/, "").trim();

          // If it contains multiple facebook.com URLs, extract the last valid one
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

    // Handle nested data structure for Instagram
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification Review</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification Review
        </CardTitle>
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-3">
          {verifications.length} pending verification
          {verifications.length !== 1 ? "s" : ""}
        </div>

        {/* Verification Method Summary */}
        {verifications.length > 0 && (
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Social Media:{" "}
                {
                  verifications.filter(
                    (v) => getVerificationMethod(v) === "social"
                  ).length
                }
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
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
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No pending identity verifications</p>
            <p className="text-sm mt-2">
              All identity verifications have been reviewed
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {verifications.map((verification) => {
              const verificationMethod = getVerificationMethod(verification);
              const profileData = getProfileData(verification);
              const isReviewing = reviewing === verification.id;
              const isProcessing = processing === verification.id;

              return (
                <div
                  key={verification.id}
                  className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <div>
                          <div className="font-medium">
                            {verification.artist_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {verification.email}
                          </div>
                        </div>
                      </div>

                      {/* Verification Method Badge */}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge
                          variant={
                            verificationMethod === "social"
                              ? "default"
                              : "secondary"
                          }
                          className="font-semibold"
                        >
                          {verificationMethod === "social"
                            ? "Social Media Verification"
                            : verificationMethod === "document"
                            ? "Document Verification"
                            : "Unknown Method"}
                        </Badge>
                      </div>

                      {verificationMethod === "social" ? (
                        <div className="flex items-center gap-2 mb-2">
                          {getPlatformIcon(verification.identity_platform)}
                          <Badge variant="outline" className="capitalize">
                            {verification.identity_platform}
                          </Badge>
                          <span className="text-sm font-medium">
                            @{verification.identity_username}
                          </span>
                          {getProfileUrl(verification) && (
                            <a
                              href={getProfileUrl(verification)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:text-blue-700 text-xs ml-2 flex items-center gap-1"
                            >
                              🔗 Visit Profile
                            </a>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mb-2">
                          <Shield className="h-4 w-4 text-blue-600" />
                          <Badge variant="outline" className="capitalize">
                            {verification.idv_document_type?.replace("_", " ")}
                          </Badge>
                          <span className="text-sm font-medium">
                            {verification.idv_full_name}
                          </span>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        Submitted:{" "}
                        {formatDistanceToNow(
                          new Date(
                            verification.identity_verification_submitted_at
                          ),
                          { addSuffix: true }
                        )}
                      </div>
                    </div>

                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-3 w-3" />
                      Pending
                    </Badge>
                  </div>

                  {verificationMethod === "social" && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-3">
                        {getPlatformIcon(verification.identity_platform)}
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Social Media Profile Data
                        </h4>
                      </div>

                      {profileData ? (
                        <>
                          <div className="flex items-start gap-4 mb-3">
                            {profileData.profilePicture && (
                              <div className="relative">
                                <img
                                  src={`/api/proxy-image?url=${encodeURIComponent(
                                    profileData.profilePicture
                                  )}`}
                                  alt="Profile"
                                  className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    const originalSrc = target.src;

                                    // If proxy fails, try direct URL as fallback
                                    if (
                                      originalSrc.includes("/api/proxy-image")
                                    ) {
                                      target.src = profileData.profilePicture;
                                      return;
                                    }

                                    // If both fail, show placeholder
                                    target.style.display = "none";
                                    const placeholder =
                                      document.createElement("div");
                                    placeholder.className =
                                      "w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 flex items-center justify-center";
                                    placeholder.innerHTML =
                                      '<svg class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"></path></svg>';
                                    target.parentNode?.insertBefore(
                                      placeholder,
                                      target
                                    );
                                  }}
                                />
                              </div>
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-lg mb-1">
                                {profileData.displayName}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                @{verification.identity_username}
                              </div>
                              {profileData.followers && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                  👥 {profileData.followers.toLocaleString()}{" "}
                                  followers
                                </div>
                              )}
                              {profileData.subscribers && (
                                <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                  📺 {profileData.subscribers.toLocaleString()}{" "}
                                  subscribers
                                </div>
                              )}
                            </div>
                          </div>

                          {profileData.bio && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Bio:
                              </div>
                              <div className="text-sm text-gray-600 dark:text-gray-300">
                                {profileData.bio}
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>⚠️ No Profile Data Available:</strong> The
                            social media profile data could not be retrieved.
                            Please verify manually by visiting the profile.
                          </div>
                          <div className="mt-2 text-sm">
                            <strong>Profile URL:</strong> @
                            {verification.identity_username} on{" "}
                            {verification.identity_platform}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>🔍 Verification Check:</strong> Verify that
                          this social media profile belongs to the artist and
                          matches their submitted information.
                        </div>
                        {getProfileUrl(verification) && (
                          <div className="mt-2">
                            <a
                              href={getProfileUrl(verification)!}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                            >
                              🌐 Open {verification.identity_platform} Profile
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {verificationMethod === "document" && (
                    <div className="mb-4 p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                      <div className="flex items-center gap-2 mb-4">
                        <Shield className="h-5 w-5 text-blue-600" />
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          Document Verification Details
                        </h4>
                      </div>

                      {verification.idv_full_name ||
                      verification.idv_document_type ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {verification.idv_document_type && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📄 Document Type
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {verification.idv_document_type.replace(
                                  "_",
                                  " "
                                )}
                              </div>
                            </div>
                          )}

                          {verification.idv_full_name && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                👤 Full Name
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {verification.idv_full_name}
                              </div>
                            </div>
                          )}

                          {verification.idv_date_of_birth && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                📅 Date of Birth
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white">
                                {new Date(
                                  verification.idv_date_of_birth
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          )}

                          {verification.idv_document_number && (
                            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                🔢 Document Number
                              </div>
                              <div className="text-sm text-gray-900 dark:text-white font-mono">
                                {verification.idv_document_number}
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 mb-4">
                          <div className="text-sm text-yellow-800 dark:text-yellow-200">
                            <strong>⚠️ No Document Details Available:</strong>{" "}
                            The document verification details could not be
                            retrieved. Please contact the user for additional
                            information.
                          </div>
                        </div>
                      )}

                      {verification.idv_document_url && (
                        <div className="mb-4">
                          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            📸 Document Image
                          </div>
                          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            <img
                              src={verification.idv_document_url}
                              alt="Verification Document"
                              className="max-w-full h-auto rounded-lg border border-gray-200 dark:border-gray-600"
                              style={{ maxHeight: "400px" }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-xs text-blue-800 dark:text-blue-200">
                          <strong>🔍 Verification Check:</strong> Verify that
                          the document is clear, authentic, and the information
                          matches the artist's submitted details. Check for any
                          signs of tampering or falsification.
                        </div>
                      </div>
                    </div>
                  )}

                  {!isReviewing ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setReviewing(verification.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Review
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="notes">Admin Notes (Optional)</Label>
                        <Textarea
                          id="notes"
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add notes about this verification..."
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            reviewVerification(verification.id, "approved")
                          }
                          disabled={isProcessing}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            reviewVerification(verification.id, "rejected")
                          }
                          disabled={isProcessing}
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1" />
                          ) : (
                            <X className="h-4 w-4 mr-1" />
                          )}
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setReviewing(null);
                            setNotes("");
                          }}
                          disabled={isProcessing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
