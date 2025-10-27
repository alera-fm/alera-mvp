"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import {
  Eye,
  ChevronDown,
  DollarSign,
  User,
  Calendar,
  CreditCard,
} from "lucide-react";

interface Withdrawal {
  id: number;
  artist_name: string;
  amount_requested: number;
  method: string;
  status: "pending" | "approved" | "rejected" | "completed";
  created_at: string;
  updated_at: string;
  payout_details?: string;
  full_payout_details?: any;
}

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<number | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<Withdrawal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/withdrawals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWithdrawals(data.withdrawals);
      } else {
        toast.error("Failed to fetch withdrawals");
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      toast.error("Error fetching withdrawals");
    } finally {
      setLoading(false);
    }
  };

  const updateWithdrawalStatus = async (
    withdrawalId: number,
    newStatus: string,
    fromModal = false
  ) => {
    setProcessing(withdrawalId);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("/api/admin/withdrawals", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          withdrawal_id: withdrawalId,
          status: newStatus,
        }),
      });

      if (response.ok) {
        toast.success(`Withdrawal request ${newStatus} successfully`);
        fetchWithdrawals();
        if (fromModal) {
          setIsModalOpen(false);
          setSelectedWithdrawal(null);
        }
      } else {
        toast.error("Failed to update withdrawal status");
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error);
      toast.error("Error updating withdrawal status");
    } finally {
      setProcessing(null);
    }
  };

  const openWithdrawalDetailsModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsModalOpen(true);
  };

  const formatFullPayoutDetails = (withdrawal: Withdrawal) => {
    if (!withdrawal.payout_details) return null;

    try {
      const details = JSON.parse(withdrawal.payout_details);
      return details;
    } catch (error) {
      return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variantMap: {
      [key: string]:
        | "warning"
        | "info"
        | "destructive"
        | "success"
        | "secondary";
    } = {
      pending: "warning",
      approved: "info",
      rejected: "destructive",
      completed: "success",
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
          <CardTitle>Withdrawal Management</CardTitle>
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
        <CardTitle>Withdrawal Management</CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage artist withdrawal requests
        </p>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {withdrawals.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-muted-foreground">
              No withdrawal requests found
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-4 p-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">
                        {withdrawal.artist_name}
                      </div>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    <div className="text-lg font-semibold text-success">
                      ${withdrawal.amount_requested}
                    </div>

                    <div>
                      <button
                        onClick={() => openWithdrawalDetailsModal(withdrawal)}
                        className="font-medium text-sm text-info hover:underline"
                      >
                        {withdrawal.method}
                      </button>
                      {withdrawal.payout_details && (
                        <div className="text-xs text-muted-foreground mt-1 break-all">
                          {withdrawal.payout_details}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(withdrawal.created_at), {
                        addSuffix: true,
                      })}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Select
                        onValueChange={(value) =>
                          updateWithdrawalStatus(
                            withdrawal.id,
                            value as
                              | "pending"
                              | "approved"
                              | "rejected"
                              | "completed"
                          )
                        }
                        disabled={processing === withdrawal.id}
                        value={withdrawal.status}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approve</SelectItem>
                          <SelectItem value="rejected">Reject</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">Artist</TableHead>
                    <TableHead className="whitespace-nowrap">Amount</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Method & Details
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Status</TableHead>
                    <TableHead className="whitespace-nowrap">
                      Requested
                    </TableHead>
                    <TableHead className="whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {withdrawal.artist_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <span className="font-semibold text-success">
                          ${withdrawal.amount_requested}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div>
                          <button
                            onClick={() =>
                              openWithdrawalDetailsModal(withdrawal)
                            }
                            className="font-medium text-info hover:underline"
                          >
                            {withdrawal.method}
                          </button>
                          {withdrawal.payout_details && (
                            <div className="text-xs text-muted-foreground mt-1">
                              {withdrawal.payout_details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {getStatusBadge(withdrawal.status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDistanceToNow(new Date(withdrawal.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) =>
                              updateWithdrawalStatus(
                                withdrawal.id,
                                value as
                                  | "pending"
                                  | "approved"
                                  | "rejected"
                                  | "completed"
                              )
                            }
                            disabled={processing === withdrawal.id}
                            value={withdrawal.status}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="approved">Approve</SelectItem>
                              <SelectItem value="rejected">Reject</SelectItem>
                              <SelectItem value="completed">
                                Completed
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        {/* Withdrawal Details Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[600px] overflow-hidden p-0">
            <DialogHeader className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4">
              <DialogTitle className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <DollarSign className="h-5 w-5 text-success" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Withdrawal Request</h2>
                  <p className="text-sm text-muted-foreground">
                    ${selectedWithdrawal?.amount_requested} •{" "}
                    {selectedWithdrawal?.artist_name}
                  </p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="overflow-y-auto max-h-[calc(90vh-5rem)] px-6 py-6">
              {selectedWithdrawal && (
                <div className="space-y-6">
                  {/* Status & Amount Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-success/10 rounded-lg">
                            <DollarSign className="h-4 w-4 text-success" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Amount Requested
                            </p>
                            <p className="text-2xl font-bold text-success">
                              ${selectedWithdrawal.amount_requested}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-card border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-info/10 rounded-lg">
                            <Calendar className="h-4 w-4 text-info" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-muted-foreground mb-1">
                              Status
                            </p>
                            {getStatusBadge(selectedWithdrawal.status)}
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
                          {selectedWithdrawal.artist_name}
                        </span>
                      </div>
                      <div className="grid grid-cols-[120px_1fr] gap-2 items-start">
                        <span className="text-sm text-muted-foreground">
                          Requested
                        </span>
                        <span className="text-sm font-medium">
                          {formatDistanceToNow(
                            new Date(selectedWithdrawal.created_at),
                            { addSuffix: true }
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Details */}
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-primary" />
                        Payment Method - {selectedWithdrawal.method}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-muted p-4 rounded-lg space-y-2">
                        {(() => {
                          const details =
                            formatFullPayoutDetails(selectedWithdrawal);
                          if (!details) {
                            return (
                              <p className="text-sm text-muted-foreground">
                                Payout details not available
                              </p>
                            );
                          }

                          switch (details.method?.toLowerCase()) {
                            case "paypal":
                              return (
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      PayPal Email:
                                    </span>{" "}
                                    {details.paypal_email || "Not provided"}
                                  </p>
                                </div>
                              );
                            case "bank transfer":
                              return (
                                <div className="space-y-1">
                                  <p className="text-sm">
                                    <span className="font-medium">Bank:</span>{" "}
                                    {details.bank_name || "Not provided"}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Account Holder:
                                    </span>{" "}
                                    {details.account_holder_name ||
                                      "Not provided"}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Account Number:
                                    </span>{" "}
                                    {details.account_number || "Not provided"}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Routing Number:
                                    </span>{" "}
                                    {details.routing_number || "Not provided"}
                                  </p>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Country:
                                    </span>{" "}
                                    {details.country || "Not provided"}
                                  </p>
                                </div>
                              );
                            case "crypto (usdt - trc20)":
                              return (
                                <div>
                                  <p className="text-sm">
                                    <span className="font-medium">
                                      Wallet Address:
                                    </span>
                                  </p>
                                  <p className="text-xs font-mono break-all bg-background p-2 rounded mt-1">
                                    {details.wallet_address || "Not provided"}
                                  </p>
                                </div>
                              );
                            default:
                              return (
                                <p className="text-sm text-muted-foreground">
                                  {selectedWithdrawal.payout_details}
                                </p>
                              );
                          }
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Buttons */}
                  {selectedWithdrawal.status === "pending" && (
                    <Card className="bg-card  border-primary/20">
                      <CardContent className="p-4">
                        <div className="flex gap-3">
                          <Button
                            onClick={() =>
                              updateWithdrawalStatus(
                                selectedWithdrawal.id,
                                "approved",
                                true
                              )
                            }
                            disabled={processing === selectedWithdrawal.id}
                            variant="success"
                            className="flex-1"
                          >
                            {processing === selectedWithdrawal.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              "✓ Approve Withdrawal"
                            )}
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() =>
                              updateWithdrawalStatus(
                                selectedWithdrawal.id,
                                "rejected",
                                true
                              )
                            }
                            disabled={processing === selectedWithdrawal.id}
                            className="flex-1"
                          >
                            {processing === selectedWithdrawal.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              "✕ Reject Request"
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
