"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Check,
  AlertCircle,
  Instagram,
  Youtube,
  Facebook,
  Music,
  Shield,
} from "lucide-react";
import { SimpleSocialAvatar } from "@/components/ui/simple-social-avatar";

interface VerificationData {
  platform: string;
  username: string;
  displayName?: string;
  profilePicture?: string;
  profileData: any;
}

interface VerificationStatus {
  verified: boolean;
  platform?: string;
  username?: string;
  verifiedAt?: string;
  profileData?: any;
}

export function IdentityVerificationSection() {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [step, setStep] = useState<"form" | "confirm" | "verified">("form");
  const [platform, setPlatform] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  const platforms = [
    {
      value: "instagram",
      label: "Instagram",
      icon: Instagram,
      description: "Enter your Instagram username",
      placeholder: "@username or username",
    },
    {
      value: "tiktok",
      label: "TikTok",
      icon: Music,
      description: "Enter your TikTok username",
      placeholder: "@username or username",
    },
    {
      value: "youtube",
      label: "YouTube",
      icon: Youtube,
      description: "Enter your YouTube channel details",
      placeholder: "Channel handle or URL",
    },
    {
      value: "facebook",
      label: "Facebook",
      icon: Facebook,
      description: "Enter your Facebook profile URL",
      placeholder: "https://facebook.com/profile",
    },
  ];

  // Load current verification status on component mount
  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) return;

      const response = await fetch("/api/identity/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data);
        if (data.verified) {
          setStep("verified");
        }
      }
    } catch (error) {
      console.error("Error fetching verification status:", error);
    }
  };

  const handleVerify = async () => {
    if (!platform || !username) {
      setError("Please select a platform and enter your username");
      return;
    }

    if (platform === "facebook" && !url) {
      setError("Please enter your Facebook profile URL");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/identity/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform,
          username,
          url: platform === "facebook" ? url : undefined,
          channelId:
            platform === "youtube" && channelId ? channelId : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setVerificationData(data.verificationData);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!verificationData) return;

    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/identity/verify", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          platform: verificationData.platform,
          username: verificationData.username,
          profileData: verificationData.profileData,
          confirmed: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Confirmation failed");
      }

      // Refresh verification status
      await fetchVerificationStatus();
      setStep("verified");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStep("form");
    setPlatform("");
    setUsername("");
    setUrl("");
    setChannelId("");
    setError("");
    setVerificationData(null);
  };

  const selectedPlatform = platforms.find((p) => p.value === platform);
  const PlatformIcon = selectedPlatform?.icon || Instagram;

  // If already verified, show success state
  if (step === "verified" && verificationStatus?.verified) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-600" />
            Identity Verified
          </CardTitle>
          <CardDescription>
            Your identity has been successfully verified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {selectedPlatform && (
                  <selectedPlatform.icon className="h-4 w-4" />
                )}
                <span className="font-medium capitalize">
                  {verificationStatus.platform}
                </span>
              </div>
              <p className="font-semibold">{verificationStatus.username}</p>
              <p className="text-sm text-gray-600">
                Verified on{" "}
                {new Date(verificationStatus.verifiedAt!).toLocaleDateString()}
              </p>
            </div>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your identity verification is complete. You can now submit your
              releases to music platforms.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification
        </CardTitle>
        <CardDescription>
          {step === "form"
            ? "Verify your identity using one of your social media accounts to unlock release submission."
            : "Please confirm this is your account."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "form" && (
          <>
            <div className="space-y-2">
              <Label htmlFor="platform">Select Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                      <SelectItem key={platform.value} value={platform.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {platform.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {selectedPlatform && (
              <div className="space-y-2">
                <Label htmlFor="username">{selectedPlatform.description}</Label>
                <Input
                  id="username"
                  placeholder={selectedPlatform.placeholder}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            )}

            {platform === "youtube" && (
              <div className="space-y-2">
                <Label htmlFor="channelId">Channel ID (Optional)</Label>
                <Input
                  id="channelId"
                  placeholder="UC..."
                  value={channelId}
                  onChange={(e) => setChannelId(e.target.value)}
                />
                <p className="text-sm text-gray-500">
                  Leave empty if you only have the username/URL
                </p>
              </div>
            )}

            {platform === "facebook" && (
              <div className="space-y-2">
                <Label htmlFor="url">Facebook Profile URL</Label>
                <Input
                  id="url"
                  placeholder="https://facebook.com/your-profile"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            )}

            <Button
              onClick={handleVerify}
              disabled={loading || !platform || !username}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify Account
            </Button>
          </>
        )}

        {step === "confirm" && verificationData && (
          <>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <PlatformIcon className="h-4 w-4" />
                  <span className="font-medium capitalize">
                    {verificationData.platform}
                  </span>
                </div>
                <p className="font-semibold">{verificationData.displayName}</p>
                <p className="text-sm text-gray-600">
                  @{verificationData.username}
                </p>
              </div>
            </div>

            <Alert>
              <Check className="h-4 w-4" />
              <AlertDescription>
                We found this account. Please confirm this is your profile to
                complete verification.
              </AlertDescription>
            </Alert>

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetForm} className="flex-1">
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Verify
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
