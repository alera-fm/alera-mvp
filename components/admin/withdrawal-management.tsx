"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { Eye, ChevronDown } from "lucide-react"

interface Withdrawal {
  id: number
  artist_name: string
  amount_requested: number
  method: string
  status: "pending" | "approved" | "rejected" | "completed"
  created_at: string
  updated_at: string
  payout_details?: string
  full_payout_details?: any
}

export function WithdrawalManagement() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState<number | null>(null)
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchWithdrawals()
  }, [])

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/admin/withdrawals", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWithdrawals(data.withdrawals)
      } else {
        toast.error("Failed to fetch withdrawals")
      }
    } catch (error) {
      console.error("Error fetching withdrawals:", error)
      toast.error("Error fetching withdrawals")
    } finally {
      setLoading(false)
    }
  }

  const updateWithdrawalStatus = async (withdrawalId: number, newStatus: string, fromModal = false) => {
    setProcessing(withdrawalId)
    try {
      const token = localStorage.getItem("authToken")
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
      })

      if (response.ok) {
        toast.success(`Withdrawal request ${newStatus} successfully`)
        fetchWithdrawals()
        if (fromModal) {
          setIsModalOpen(false)
          setSelectedWithdrawal(null)
        }
      } else {
        toast.error("Failed to update withdrawal status")
      }
    } catch (error) {
      console.error("Error updating withdrawal status:", error)
      toast.error("Error updating withdrawal status")
    } finally {
      setProcessing(null)
    }
  }

  const openWithdrawalDetailsModal = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal)
    setIsModalOpen(true)
  }

  const formatFullPayoutDetails = (withdrawal: Withdrawal) => {
    if (!withdrawal.payout_details) return null
    
    try {
      const details = JSON.parse(withdrawal.payout_details)
      return details
    } catch (error) {
      return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
      completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Withdrawal Management</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">Manage artist withdrawal requests</p>
      </CardHeader>
      <CardContent className="p-0 sm:p-6">
        {withdrawals.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-gray-600 dark:text-gray-400">No withdrawal requests found</p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-4 p-4">
              {withdrawals.map((withdrawal) => (
                <Card key={withdrawal.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="font-medium">{withdrawal.artist_name}</div>
                      {getStatusBadge(withdrawal.status)}
                    </div>

                    <div className="text-lg font-semibold text-green-600">${withdrawal.amount_requested}</div>

                    <div>
                      <button
                        onClick={() => openWithdrawalDetailsModal(withdrawal)}
                        className="font-medium text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        {withdrawal.method}
                      </button>
                      {withdrawal.payout_details && (
                        <div className="text-xs text-gray-500 mt-1 break-all">{withdrawal.payout_details}</div>
                      )}
                    </div>

                    <div className="text-xs text-gray-600">
                      {formatDistanceToNow(new Date(withdrawal.created_at), {
                        addSuffix: true,
                      })}
                    </div>

                    <div className="flex flex-col gap-2">
                      <Select
                        onValueChange={(value) => updateWithdrawalStatus(withdrawal.id, value as "pending" | "approved" | "rejected" | "completed")}
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
            <div className="hidden md:block rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artist</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Method & Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {withdrawals.map((withdrawal) => (
                    <TableRow key={withdrawal.id}>
                      <TableCell className="font-medium">{withdrawal.artist_name}</TableCell>
                      <TableCell>${withdrawal.amount_requested}</TableCell>
                      <TableCell>
                        <div>
                          <button
                            onClick={() => openWithdrawalDetailsModal(withdrawal)}
                            className="font-medium text-blue-600 hover:text-blue-800 underline"
                          >
                            {withdrawal.method}
                          </button>
                          {withdrawal.payout_details && (
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {withdrawal.payout_details}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(withdrawal.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            onValueChange={(value) => updateWithdrawalStatus(withdrawal.id, value as "pending" | "approved" | "rejected" | "completed")}
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
                              <SelectItem value="completed">Completed</SelectItem>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Withdrawal Request Details</DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Artist</Label>
                    <p className="font-medium">{selectedWithdrawal.artist_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount Requested</Label>
                    <p className="text-lg font-semibold text-green-600">${selectedWithdrawal.amount_requested}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedWithdrawal.status)}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</Label>
                  <p className="font-medium">{selectedWithdrawal.method}</p>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payout Details</Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    {(() => {
                      const details = formatFullPayoutDetails(selectedWithdrawal)
                      if (!details) {
                        return <p className="text-sm text-gray-600">Payout details not available</p>
                      }

                      switch (details.method?.toLowerCase()) {
                        case "paypal":
                          return (
                            <div>
                              <p className="text-sm"><span className="font-medium">PayPal Email:</span> {details.paypal_email || "Not provided"}</p>
                            </div>
                          )
                        case "bank transfer":
                          return (
                            <div className="space-y-1">
                              <p className="text-sm"><span className="font-medium">Bank:</span> {details.bank_name || "Not provided"}</p>
                              <p className="text-sm"><span className="font-medium">Account Holder:</span> {details.account_holder_name || "Not provided"}</p>
                              <p className="text-sm"><span className="font-medium">Account Number:</span> {details.account_number || "Not provided"}</p>
                              <p className="text-sm"><span className="font-medium">Routing Number:</span> {details.routing_number || "Not provided"}</p>
                              <p className="text-sm"><span className="font-medium">Country:</span> {details.country || "Not provided"}</p>
                            </div>
                          )
                        case "crypto (usdt - trc20)":
                          return (
                            <div>
                              <p className="text-sm"><span className="font-medium">Wallet Address:</span></p>
                              <p className="text-xs font-mono break-all bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                                {details.wallet_address || "Not provided"}
                              </p>
                            </div>
                          )
                        default:
                          return <p className="text-sm text-gray-600">{selectedWithdrawal.payout_details}</p>
                      }
                    })()}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Requested</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(selectedWithdrawal.created_at), { addSuffix: true })}
                  </p>
                </div>

                {selectedWithdrawal.status === "pending" && (
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, "approved", true)}
                      disabled={processing === selectedWithdrawal.id}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {processing === selectedWithdrawal.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updateWithdrawalStatus(selectedWithdrawal.id, "rejected", true)}
                      disabled={processing === selectedWithdrawal.id}
                      className="flex-1"
                    >
                      {processing === selectedWithdrawal.id ? "Processing..." : "Reject"}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
