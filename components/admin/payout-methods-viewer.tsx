"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { CreditCard, Search, User, Eye, Calendar, Shield } from "lucide-react";

interface PayoutMethod {
  id: string;
  artist_id: number;
  artist_name: string;
  artist_email: string;
  method: string;
  encrypted_account_info: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export function PayoutMethodsViewer() {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayoutMethod, setSelectedPayoutMethod] =
    useState<PayoutMethod | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchPayoutMethods();
  }, []);

  const fetchPayoutMethods = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/payout-methods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayoutMethods(data.payoutMethods);
      } else {
        toast.error("Failed to fetch payout methods");
      }
    } catch (error) {
      console.error("Error fetching payout methods:", error);
      toast.error("Error fetching payout methods");
    } finally {
      setLoading(false);
    }
  };

  const filteredMethods = payoutMethods.filter(
    (method) =>
      method.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.artist_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMethodBadge = (method: string) => {
    const variantMap: {
      [key: string]: "info" | "success" | "default" | "secondary";
    } = {
      paypal: "info",
      "bank transfer": "success",
      "crypto (usdt - trc20)": "default",
    };

    // Handle undefined or null method
    const safeMethod = method || "unknown";
    const methodKey = safeMethod.toLowerCase();
    const variant = variantMap[methodKey] || "secondary";

    return <Badge variant={variant}>{safeMethod}</Badge>;
  };

  const formatAccountDetails = (method: PayoutMethod) => {
    try {
      const accountInfo = JSON.parse(method.encrypted_account_info);

      switch (accountInfo.method) {
        case "PayPal":
          return accountInfo.paypal_email || "N/A";
        case "Bank Transfer":
          return accountInfo.bank_name
            ? `${accountInfo.bank_name} - ***${
                accountInfo.account_number?.slice(-4) || "****"
              }`
            : "Bank details set";
        case "Crypto (USDT - TRC20)":
          return accountInfo.wallet_address
            ? `${accountInfo.wallet_address.slice(
                0,
                8
              )}...${accountInfo.wallet_address.slice(-4)}`
            : "Wallet address set";
        default:
          return "Account details set";
      }
    } catch (error) {
      return "N/A";
    }
  };

  const getFullAccountDetails = (method: PayoutMethod) => {
    try {
      const accountInfo = JSON.parse(method.encrypted_account_info);

      switch (accountInfo.method) {
        case "PayPal":
          return {
            method: "PayPal",
            email: accountInfo.paypal_email || "Not provided",
          };
        case "Bank Transfer":
          return {
            method: "Bank Transfer",
            bankName: accountInfo.bank_name || "Not provided",
            accountNumber: accountInfo.account_number || "Not provided",
            routingNumber: accountInfo.routing_number || "Not provided",
            accountHolderName:
              accountInfo.account_holder_name || "Not provided",
            country: accountInfo.country || "Not provided",
          };
        case "Crypto (USDT - TRC20)":
          return {
            method: "Crypto (USDT - TRC20)",
            walletAddress: accountInfo.wallet_address || "Not provided",
          };
        default:
          return {
            method: "Unknown",
            details: "Account details not available",
          };
      }
    } catch (error) {
      return {
        method: "Error",
        details: "Unable to parse account information",
      };
    }
  };

  const openPayoutDetailsModal = (method: PayoutMethod) => {
    setSelectedPayoutMethod(method);
    setIsModalOpen(true);
  };

  const updatePayoutMethodStatus = async (
    payoutMethodId: string,
    status: string
  ) => {
    setProcessing(payoutMethodId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/payout-methods", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          payout_method_id: payoutMethodId,
          status: status,
        }),
      });

      if (response.ok) {
        toast.success(`Payout method ${status} successfully`);
        fetchPayoutMethods();
        setIsModalOpen(false);
      } else {
        toast.error("Failed to update payout method status");
      }
    } catch (error) {
      console.error("Error updating payout method status:", error);
      toast.error("Error updating payout method status");
    } finally {
      setProcessing(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const variantMap: {
      [key: string]: "warning" | "success" | "destructive" | "secondary";
    } = {
      pending: "warning",
      approved: "success",
      rejected: "destructive",
    };

    const variant = variantMap[status] || "secondary";

    return (
      <Badge variant={variant}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payout Methods
          </CardTitle>
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payout Methods
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          View all artist payout method configurations
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Artists</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search by artist name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredMethods.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm
                ? "No payout methods found for search term"
                : "No payout methods configured"}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4">
              {filteredMethods.map((method) => (
                <Card
                  key={method.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => openPayoutDetailsModal(method)}
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {method.artist_name}
                        </div>
                        <div className="text-sm text-muted-foreground truncate">
                          {method.artist_email}
                        </div>
                      </div>
                      {getStatusBadge(method.status || "pending")}
                    </div>

                    <div className="flex justify-between items-center">
                      {getMethodBadge(method.method)}
                      <div className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(method.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="font-mono text-sm break-all bg-muted p-2 rounded">
                      {formatAccountDetails(method)}
                    </div>

                    <div className="flex items-center justify-center pt-2">
                      <Eye className="h-4 w-4 text-muted-foreground mr-1" />
                      <span className="text-xs text-muted-foreground">
                        Click to view full details
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Artist</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Method Type
                    </TableHead>
                    <TableHead className="whitespace-nowrap">
                      Account Details
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">Created</TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <div className="font-medium">
                            {method.artist_name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.artist_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getMethodBadge(method.method)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="font-mono text-sm">
                          {formatAccountDetails(method)}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(method.status || "pending")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(method.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openPayoutDetailsModal(method)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Payout Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-hidden p-0">
            <DialogHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4">
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Payout Method</h2>
                  <p className="text-sm text-muted-foreground">
                    {selectedPayoutMethod?.artist_name}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] px-6 py-6">
              {selectedPayoutMethod && (
                <div className="space-y-6">
                  {/* Method & Status Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-info/10 rounded-lg">
                            <CreditCard className="h-4 w-4 text-info" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Payment Method
                            </p>
                            {getMethodBadge(selectedPayoutMethod.method)}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <Shield className="h-4 w-4 text-success" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Status
                            </p>
                            {getStatusBadge(
                              selectedPayoutMethod.status || "pending"
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Artist Information */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        Artist Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-sm text-muted-foreground">
                          Artist Name
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPayoutMethod.artist_name}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-sm text-muted-foreground">
                          Email
                        </span>
                        <span className="text-sm font-medium">
                          {selectedPayoutMethod.artist_email}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-sm text-muted-foreground">
                          Created
                        </span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(
                            new Date(selectedPayoutMethod.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Account Details */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Account Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        {(() => {
                          const details =
                            getFullAccountDetails(selectedPayoutMethod);
                          switch (details.method) {
                            case "PayPal":
                              return (
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">Email:</span>{" "}
                                    {details.email}
                                  </p>
                                </div>
                              );
                            case "Bank Transfer":
                              return (
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium">Bank:</span>{" "}
                                    {details.bankName}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Account Holder:
                                    </span>{" "}
                                    {details.accountHolderName}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Account Number:
                                    </span>{" "}
                                    {details.accountNumber}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Routing Number:
                                    </span>{" "}
                                    {details.routingNumber}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Country:
                                    </span>{" "}
                                    {details.country}
                                  </p>
                                </div>
                              );
                            case "Crypto (USDT - TRC20)":
                              return (
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Wallet Address:
                                    </span>
                                  </p>
                                  <p className="text-xs font-mono break-all bg-background p-2 rounded mt-1">
                                    {details.walletAddress}
                                  </p>
                                </div>
                              );
                            default:
                              return (
                                <p className="text-sm text-destructive">
                                  {details.details}
                                </p>
                              );
                          }
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {(selectedPayoutMethod.status === "pending" ||
                    !selectedPayoutMethod.status) && (
                    <Card className="bg-card border border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              updatePayoutMethodStatus(
                                selectedPayoutMethod.id,
                                "approved"
                              )
                            }
                            disabled={processing === selectedPayoutMethod.id}
                            variant="success"
                            className="flex-1"
                          >
                            {processing === selectedPayoutMethod.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              "✓ Approve Method"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              updatePayoutMethodStatus(
                                selectedPayoutMethod.id,
                                "rejected"
                              )
                            }
                            disabled={processing === selectedPayoutMethod.id}
                            className="flex-1"
                          >
                            {processing === selectedPayoutMethod.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              "✕ Reject Method"
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
