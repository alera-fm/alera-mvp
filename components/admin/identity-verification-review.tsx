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

  const getProfileData = (verification: IdentityVerification) => {
    const data = verification.identity_data;
    if (!data) return null;

    switch (verification.identity_platform) {
      case "instagram":
        return {
          displayName: data.user?.full_name || data.user?.username,
          profilePicture:
            data.user?.profile_pic_url_hd || data.user?.profile_pic_url,
          followers: data.user?.follower_count,
          bio: data.user?.biography,
        };
      case "tiktok":
        return {
          displayName: data.user?.nickname || data.user?.uniqueId,
          profilePicture: data.user?.avatarLarger || data.user?.avatarMedium,
          followers: data.user?.followerCount,
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
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {verifications.length} pending verification
          {verifications.length !== 1 ? "s" : ""}
        </div>
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

                      {verification.idv_method === "social" ? (
                        <div className="flex items-center gap-2 mb-2">
                          {getPlatformIcon(verification.identity_platform)}
                          <Badge variant="outline" className="capitalize">
                            {verification.identity_platform}
                          </Badge>
                          <span className="text-sm font-medium">
                            @{verification.identity_username}
                          </span>
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

                  {verification.idv_method === "social" && profileData && (
                    <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        {profileData.profilePicture && (
                          <img
                            src={profileData.profilePicture}
                            alt="Profile"
                            className="w-12 h-12 rounded-full"
                          />
                        )}
                        <div>
                          <div className="font-medium">
                            {profileData.displayName}
                          </div>
                          {profileData.followers && (
                            <div className="text-sm text-gray-500">
                              {profileData.followers.toLocaleString()} followers
                            </div>
                          )}
                        </div>
                      </div>
                      {profileData.bio && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {profileData.bio}
                        </div>
                      )}
                    </div>
                  )}

                  {verification.idv_method === "document" && (
                    <div className="mb-4 p-3 bg-white dark:bg-gray-700 rounded-lg">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-blue-600" />
                          <span className="font-medium">
                            Document Verification
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <strong>Document Type:</strong>{" "}
                            {verification.idv_document_type?.replace("_", " ")}
                          </div>
                          <div>
                            <strong>Full Name:</strong>{" "}
                            {verification.idv_full_name}
                          </div>
                          <div>
                            <strong>Date of Birth:</strong>{" "}
                            {verification.idv_date_of_birth
                              ? new Date(
                                  verification.idv_date_of_birth
                                ).toLocaleDateString()
                              : "N/A"}
                          </div>
                          {verification.idv_document_number && (
                            <div>
                              <strong>Document Number:</strong>{" "}
                              {verification.idv_document_number}
                            </div>
                          )}
                        </div>

                        {verification.idv_document_url && (
                          <div>
                            <strong className="text-sm">Document Image:</strong>
                            <div className="mt-2">
                              <img
                                src={verification.idv_document_url}
                                alt="Verification Document"
                                className="max-w-full h-auto rounded-lg border"
                                style={{ maxHeight: "300px" }}
                              />
                            </div>
                          </div>
                        )}
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
