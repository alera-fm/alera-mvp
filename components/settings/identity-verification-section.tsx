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
  Clock,
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
  status?: string;
  verified: boolean;
  platform?: string;
  username?: string;
  verifiedAt?: string;
  submittedAt?: string;
  reviewedAt?: string;
  adminNotes?: string;
  profileData?: any;
}

export function IdentityVerificationSection() {
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus | null>(null);
  const [step, setStep] = useState<
    "form" | "confirm" | "verified" | "pending" | "rejected" | "document"
  >("form");
  const [verificationMethod, setVerificationMethod] = useState<
    "social" | "document"
  >("social");
  const [platform, setPlatform] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [channelId, setChannelId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [verificationData, setVerificationData] =
    useState<VerificationData | null>(null);

  // Document verification fields
  const [documentType, setDocumentType] = useState<string>("");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [fullName, setFullName] = useState<string>("");
  const [dateOfBirth, setDateOfBirth] = useState<string>("");
  const [documentNumber, setDocumentNumber] = useState<string>("");

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

  const documentTypes = [
    { value: "passport", label: "Passport" },
    { value: "drivers_license", label: "Driver's License" },
    { value: "national_id", label: "National ID" },
    { value: "other", label: "Other Government ID" },
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
        } else if (data.status === "pending") {
          setStep("pending");
        } else if (data.status === "rejected") {
          setStep("rejected");
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
      setSuccess(
        "Identity verification submitted successfully! Please wait for admin approval."
      );
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

  const handleDocumentUpload = async () => {
    if (!documentType || !documentFile || !fullName || !dateOfBirth) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // First upload the document file
      const formData = new FormData();
      formData.append("file", documentFile);

      const token = localStorage.getItem("authToken");
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload document");
      }

      const uploadData = await uploadResponse.json();

      // Then submit document verification
      const verifyResponse = await fetch("/api/identity/verify-document", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          documentType,
          documentUrl: uploadData.url,
          documentName: documentFile.name,
          fullName,
          dateOfBirth,
          documentNumber: documentNumber || null,
        }),
      });

      const data = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(data.error || "Document verification failed");
      }

      setSuccess(
        "Document verification submitted successfully! Please wait for admin approval."
      );
      setStep("pending");
      await fetchVerificationStatus();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Document verification failed"
      );
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
    setDocumentType("");
    setDocumentFile(null);
    setFullName("");
    setDateOfBirth("");
    setDocumentNumber("");
    setError("");
    setSuccess("");
    setVerificationData(null);
  };

  const selectedPlatform = platforms.find((p) => p.value === platform);
  const PlatformIcon = selectedPlatform?.icon || Instagram;

  // If pending, show pending state
  if (step === "pending" && verificationStatus?.status === "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Identity Verification Pending
          </CardTitle>
          <CardDescription>
            Verify your identity using one of your social media accounts or ID
            to unlock release submission
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
              <Clock className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-orange-800 dark:text-orange-200">
                Submitted:{" "}
                {verificationStatus.submittedAt
                  ? new Date(
                      verificationStatus.submittedAt
                    ).toLocaleDateString()
                  : "Unknown"}
              </span>
            </div>
            {verificationStatus.platform && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Platform:</strong> {verificationStatus.platform}
                <br />
                <strong>Username:</strong> {verificationStatus.username}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // If rejected, show rejected state
  if (step === "rejected" && verificationStatus?.status === "rejected") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            Identity Verification Rejected
          </CardTitle>
          <CardDescription>
            Your identity verification was not approved. Please review the admin
            notes below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your identity verification request was rejected by an
                administrator.
              </AlertDescription>
            </Alert>

            {verificationStatus.platform && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <strong>Platform:</strong> {verificationStatus.platform}
                <br />
                <strong>Username:</strong> {verificationStatus.username}
              </div>
            )}

            {verificationStatus.adminNotes && (
              <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <strong className="text-sm text-gray-700 dark:text-gray-300">
                  Admin Notes:
                </strong>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {verificationStatus.adminNotes}
                </p>
              </div>
            )}

            <Button
              onClick={() => {
                setStep("form");
                setPlatform("");
                setUsername("");
                setUrl("");
                setChannelId("");
                setError("");
                setSuccess("");
              }}
              className="w-full"
            >
              Try Again with Different Method
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

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
    <Card className="">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Identity Verification
        </CardTitle>
        <CardDescription>
          {step === "form"
            ? "Verify your identity using one of your social media accounts or ID to unlock release submission."
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
            {/* Verification Method Selection */}
            <div className="space-y-4">
              <Label>Verification Method</Label>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={
                    verificationMethod === "social" ? "default" : "outline"
                  }
                  onClick={() => setVerificationMethod("social")}
                  className="h-20 flex flex-col gap-2"
                >
                  <Instagram className="h-6 w-6" />
                  <span className="text-sm">Social Media</span>
                </Button>
                <Button
                  type="button"
                  variant={
                    verificationMethod === "document" ? "default" : "outline"
                  }
                  onClick={() => setVerificationMethod("document")}
                  className="h-20 flex flex-col gap-2"
                >
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Document Upload</span>
                </Button>
              </div>
            </div>

            {verificationMethod === "social" && (
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
                          <SelectItem
                            key={platform.value}
                            value={platform.value}
                          >
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
                    <Label htmlFor="username">
                      {selectedPlatform.description}
                    </Label>
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

            {verificationMethod === "document" && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="documentType">Document Type</Label>
                    <Select
                      value={documentType}
                      onValueChange={setDocumentType}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select document type" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name (as shown on document)
                    </Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentNumber">
                      Document Number (Optional)
                    </Label>
                    <Input
                      id="documentNumber"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Enter document number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documentFile">Upload Document</Label>
                    <Input
                      id="documentFile"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setDocumentFile(e.target.files?.[0] || null)
                      }
                    />
                    <p className="text-xs text-gray-500">
                      Upload a clear photo of your ID document (JPG, PNG, or
                      PDF)
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleDocumentUpload}
                  disabled={
                    loading ||
                    !documentType ||
                    !documentFile ||
                    !fullName ||
                    !dateOfBirth
                  }
                  className="w-full"
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Document Verification
                </Button>
              </>
            )}
          </>
        )}

        {step === "confirm" && verificationData && (
          <>
            <div className="flex items-center gap-4 p-4  rounded-lg">
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
