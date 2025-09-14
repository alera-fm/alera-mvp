"use client";

import { useState, useEffect, Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  CreditCard,
  Monitor,
  Save,
  Clock,
  DollarSign,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { MobileNavigation } from "@/components/mobile-navigation";
import { useToast } from "@/hooks/use-toast";
import { HeaderSection } from "@/components/header-section";
import { useAuth } from "@/context/AuthContext";
import { SubscriptionDetails } from "@/components/subscription/SubscriptionDetails";

interface UserProfile {
  id: number;
  email: string;
  artist_name: string;
  display_name: string;
  phone_number: string;
  country: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  company_name: string;
  tax_id: string;
  business_email: string;
  business_phone: string;
  business_address_line_1: string;
  business_address_line_2: string;
  business_city: string;
  business_state_province: string;
  business_postal_code: string;
  business_country: string;
}

interface BillingTransaction {
  id: number;
  transaction_date: string;
  amount: number;
  transaction_type: string;
  status: string;
  description: string;
  reference_id: string;
  payment_method: string;
}

interface LoginSession {
  id: number;
  login_time: string;
  ip_address: string;
  device_type: string;
  browser: string;
  location: string;
  status: string;
}

function SettingsPageContent() {
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState(
    searchParams?.get("tab") || "profile",
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [billingHistory, setBillingHistory] = useState<BillingTransaction[]>(
    [],
  );
  const [loginHistory, setLoginHistory] = useState<LoginSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmailChangeDialog, setShowEmailChangeDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [isRequestingEmailChange, setIsRequestingEmailChange] = useState(false);
  const { toast } = useToast();

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (error) {
      console.error("Profile fetch error:", error);
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    }
  };

  const fetchBillingHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/profile/billing-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      

      if (response.ok) {
        const data = await response.json();
        setBillingHistory(data.billing_history);
      }
    } catch (error) {
      console.error("Billing history fetch error:", error);
    }
  };

  const fetchLoginHistory = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/profile/login-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setLoginHistory(data.login_history);
      }
    } catch (error) {
      console.error("Login history fetch error:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.user);
        // Refresh user data in AuthContext to update across the app
        await refreshUser();
        toast({
          title: "Success",
          description: "Profile updated successfully!",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const updateProfile = (field: keyof UserProfile, value: string) => {
    if (profile) {
      setProfile({ ...profile, [field]: value });
    }
  };

  const handleEmailChangeRequest = async () => {
    if (!newEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter a new email address",
        variant: "destructive",
      });
      return;
    }

    if (newEmail === profile?.email) {
      toast({
        title: "Error",
        description: "New email must be different from current email",
        variant: "destructive",
      });
      return;
    }

    setIsRequestingEmailChange(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/auth/request-email-change", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ new_email: newEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.development_mode && data.verification_url) {
          // Development mode: Show verification URL
          toast({
            title: "Development Mode",
            description: (
              <div className="space-y-2">
                <p>{data.message}</p>
                <div className="mt-2">
                  <a 
                    href={data.verification_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm"
                  >
                    Click here to verify email change
                  </a>
                </div>
              </div>
            ),
            variant: "default",
            duration: 10000, // Show longer for development
          });
        } else {
          // Production mode: Normal message
          toast({
            title: "Verification Email Sent",
            description: data.message,
            variant: "default",
          });
        }
        setShowEmailChangeDialog(false);
        setNewEmail("");
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send verification email",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Email change request error:", error);
      toast({
        title: "Error",
        description: "Failed to send verification email",
        variant: "destructive",
      });
    } finally {
      setIsRequestingEmailChange(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const formatTransactionType = (type: string) => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchProfile(),
        fetchBillingHistory(),
        fetchLoginHistory(),
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    // Update active tab when URL search params change
    const tab = searchParams?.get("tab");
    if (tab && ["profile", "billing", "login"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-4 md:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-4 md:p-6 pb-24 md:pb-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <HeaderSection />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-white">
              Settings & Profile
            </h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="billing" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Billing</span>
              </TabsTrigger>
              <TabsTrigger value="login" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Login History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {profile && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="artist_name">Artist Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="artist_name"
                              placeholder="Enter your artist name"
                              value={profile.artist_name || ""}
                              onChange={(e) =>
                                updateProfile("artist_name", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="display_name">Display Name</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="display_name"
                              placeholder="Enter your display name"
                              value={profile.display_name || ""}
                              onChange={(e) =>
                                updateProfile("display_name", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="email">Email Address</Label>
                          <div className="space-y-3">
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                id="email"
                                type="email"
                                value={profile.email || ""}
                                readOnly
                                className="pl-10 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              />
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setShowEmailChangeDialog(true)}
                              className="w-fit"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Change Email Address
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="phone_number">Phone Number</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="phone_number"
                              placeholder="Enter your phone number"
                              value={profile.phone_number || ""}
                              onChange={(e) =>
                                updateProfile("phone_number", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="country"
                              placeholder="Enter your country"
                              value={profile.country || ""}
                              onChange={(e) =>
                                updateProfile("country", e.target.value)
                              }
                              className="pl-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="text-md font-medium">Address Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address_line_1">Address Line 1</Label>
                            <Input
                              id="address_line_1"
                              placeholder="Street address"
                              value={profile.address_line_1 || ""}
                              onChange={(e) =>
                                updateProfile("address_line_1", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="address_line_2">Address Line 2</Label>
                            <Input
                              id="address_line_2"
                              placeholder="Apartment, suite, etc. (optional)"
                              value={profile.address_line_2 || ""}
                              onChange={(e) =>
                                updateProfile("address_line_2", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="City"
                              value={profile.city || ""}
                              onChange={(e) =>
                                updateProfile("city", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="state_province">State/Province</Label>
                            <Input
                              id="state_province"
                              placeholder="State or Province"
                              value={profile.state_province || ""}
                              onChange={(e) =>
                                updateProfile("state_province", e.target.value)
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="postal_code">Postal Code</Label>
                            <Input
                              id="postal_code"
                              placeholder="ZIP/Postal Code"
                              value={profile.postal_code || ""}
                              onChange={(e) =>
                                updateProfile("postal_code", e.target.value)
                              }
                            />
                          </div>
                        </div>
                      </div>

                      <div className="border-t pt-6">
                        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                          <Building className="h-5 w-5" />
                          Business Information
                        </h3>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="company_name">Company Name</Label>
                              <Input
                                id="company_name"
                                placeholder="Enter your company name"
                                value={profile.company_name || ""}
                                onChange={(e) =>
                                  updateProfile("company_name", e.target.value)
                                }
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="tax_id">ABN/VAT/Tax ID</Label>
                              <Input
                                id="tax_id"
                                placeholder="Enter your tax ID"
                                value={profile.tax_id || ""}
                                onChange={(e) =>
                                  updateProfile("tax_id", e.target.value)
                                }
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="business_email">Business Email</Label>
                              <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="business_email"
                                  type="email"
                                  placeholder="Enter business email"
                                  value={profile.business_email || ""}
                                  onChange={(e) =>
                                    updateProfile("business_email", e.target.value)
                                  }
                                  className="pl-10"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="business_phone">Business Phone</Label>
                              <div className="relative">
                                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                  id="business_phone"
                                  placeholder="Enter business phone"
                                  value={profile.business_phone || ""}
                                  onChange={(e) =>
                                    updateProfile("business_phone", e.target.value)
                                  }
                                  className="pl-10"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-md font-medium">Business Address</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="business_address_line_1">Business Address Line 1</Label>
                                <Input
                                  id="business_address_line_1"
                                  placeholder="Business street address"
                                  value={profile.business_address_line_1 || ""}
                                  onChange={(e) =>
                                    updateProfile("business_address_line_1", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="business_address_line_2">Business Address Line 2</Label>
                                <Input
                                  id="business_address_line_2"
                                  placeholder="Suite, floor, etc. (optional)"
                                  value={profile.business_address_line_2 || ""}
                                  onChange={(e) =>
                                    updateProfile("business_address_line_2", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="business_city">Business City</Label>
                                <Input
                                  id="business_city"
                                  placeholder="Business city"
                                  value={profile.business_city || ""}
                                  onChange={(e) =>
                                    updateProfile("business_city", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="business_state_province">Business State/Province</Label>
                                <Input
                                  id="business_state_province"
                                  placeholder="Business state or province"
                                  value={profile.business_state_province || ""}
                                  onChange={(e) =>
                                    updateProfile("business_state_province", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="business_postal_code">Business Postal Code</Label>
                                <Input
                                  id="business_postal_code"
                                  placeholder="Business ZIP/Postal Code"
                                  value={profile.business_postal_code || ""}
                                  onChange={(e) =>
                                    updateProfile("business_postal_code", e.target.value)
                                  }
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="business_country">Business Country</Label>
                                <div className="relative">
                                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                  <Input
                                    id="business_country"
                                    placeholder="Business country"
                                    value={profile.business_country || ""}
                                    onChange={(e) =>
                                      updateProfile("business_country", e.target.value)
                                    }
                                    className="pl-10"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-6">
                        <Button
                          onClick={handleSaveProfile}
                          disabled={saving}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {saving ? "Saving..." : "Save Changes"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="billing">
              <div className="space-y-6">
                {/* Subscription Details */}
                <SubscriptionDetails />

                {/* Billing History */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5" />
                      Billing History
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Reference</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {billingHistory.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell className="font-medium">
                                {new Date(
                                  transaction.transaction_date,
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {transaction.description}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">
                                  {formatTransactionType(
                                    transaction.transaction_type,
                                  )}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  {Number(transaction.amount).toFixed(2)}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(transaction.status)}
                                  <Badge
                                    className={getStatusColor(transaction.status)}
                                  >
                                    {transaction.status}
                                  </Badge>
                                </div>
                              </TableCell>
                              <TableCell>{transaction.payment_method}</TableCell>
                              <TableCell className="font-mono text-sm">
                                {transaction.reference_id}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4">
                      {billingHistory.map((transaction) => (
                        <div
                          key={transaction.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <div className="text-sm font-medium">
                              {new Date(
                                transaction.transaction_date,
                              ).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(transaction.status)}
                              <Badge
                                className={getStatusColor(transaction.status)}
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {transaction.description}
                            </div>
                            <div className="flex items-center justify-between">
                              <Badge variant="outline">
                                {formatTransactionType(
                                  transaction.transaction_type,
                                )}
                              </Badge>
                              <div className="font-medium flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {Number(transaction.amount).toFixed(2)}
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>Payment: {transaction.payment_method}</div>
                              <div className="font-mono">
                                Ref: {transaction.reference_id}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {billingHistory.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        No billing history found
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Monitor className="h-5 w-5" />
                    Login History
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Login Time</TableHead>
                          <TableHead>Device</TableHead>
                          <TableHead>Browser</TableHead>
                          <TableHead>IP Address</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loginHistory.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div>
                                    {new Date(
                                      session.login_time,
                                    ).toLocaleDateString()}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(
                                      session.login_time,
                                    ).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {session.device_type}
                              </Badge>
                            </TableCell>
                            <TableCell>{session.browser}</TableCell>
                            <TableCell className="font-mono text-sm">
                              {session.ip_address}
                            </TableCell>
                            <TableCell>{session.location}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(session.status)}
                                <Badge
                                  className={getStatusColor(session.status)}
                                >
                                  {session.status}
                                </Badge>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4 p-4">
                    {loginHistory.map((session) => (
                      <div
                        key={session.id}
                        className="border rounded-lg p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <div className="text-sm font-medium">
                              <div>
                                {new Date(
                                  session.login_time,
                                ).toLocaleDateString()}
                              </div>
                              <div className="text-xs text-gray-500">
                                {new Date(
                                  session.login_time,
                                ).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(session.status)}
                            <Badge className={getStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {session.device_type}
                            </Badge>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {session.browser}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            <div className="font-mono">
                              IP: {session.ip_address}
                            </div>
                            <div>Location: {session.location}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {loginHistory.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      No login history found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        <MobileNavigation />

        {/* Email Change Dialog */}
        <Dialog open={showEmailChangeDialog} onOpenChange={setShowEmailChangeDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Change Email Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input
                  id="current-email"
                  value={profile?.email || ""}
                  readOnly
                  className="bg-gray-50 dark:bg-gray-800"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-email">New Email Address</Label>
                <Input
                  id="new-email"
                  type="email"
                  placeholder="Enter your new email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  📧 A verification email will be sent to your new email address. 
                  You'll need to click the verification link to complete the change.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowEmailChangeDialog(false);
                  setNewEmail("");
                }}
                disabled={isRequestingEmailChange}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEmailChangeRequest}
                disabled={isRequestingEmailChange || !newEmail.trim()}
              >
                {isRequestingEmailChange ? "Sending..." : "Send Verification Email"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <ProtectedRoute>
        <div className="min-h-screen bg-[#f8f8f8] dark:bg-[#0a0a13] p-4 md:p-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </ProtectedRoute>
    }>
      <SettingsPageContent />
    </Suspense>
  );
}
