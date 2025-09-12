"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "react-hot-toast"
import { formatDistanceToNow } from "date-fns"
import { CreditCard, Search, User, Eye } from "lucide-react"

interface PayoutMethod {
  id: string
  artist_id: number
  artist_name: string
  artist_email: string
  method: string
  encrypted_account_info: string
  status: string
  created_at: string
  updated_at: string
}

export function PayoutMethodsViewer() {
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<PayoutMethod | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchPayoutMethods()
  }, [])

  const fetchPayoutMethods = async () => {
    try {
      const token = localStorage.getItem("authToken")
      const response = await fetch("/api/admin/payout-methods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayoutMethods(data.payoutMethods)
      } else {
        toast.error("Failed to fetch payout methods")
      }
    } catch (error) {
      console.error("Error fetching payout methods:", error)
      toast.error("Error fetching payout methods")
    } finally {
      setLoading(false)
    }
  }

  const filteredMethods = payoutMethods.filter(
    (method) =>
      method.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      method.artist_email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getMethodBadge = (method: string) => {
    const variants = {
      paypal: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      "bank transfer": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      "crypto (usdt - trc20)": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    }

    // Handle undefined or null method
    const safeMethod = method || "unknown"
    const methodKey = safeMethod.toLowerCase()

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${variants[methodKey as keyof typeof variants] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"}`}
      >
        {safeMethod}
      </span>
    )
  }

  const formatAccountDetails = (method: PayoutMethod) => {
    try {
      const accountInfo = JSON.parse(method.encrypted_account_info)

      switch (accountInfo.method) {
        case "PayPal":
          return accountInfo.paypal_email || "N/A"
        case "Bank Transfer":
          return accountInfo.bank_name
            ? `${accountInfo.bank_name} - ***${accountInfo.account_number?.slice(-4) || "****"}`
            : "Bank details set"
        case "Crypto (USDT - TRC20)":
          return accountInfo.wallet_address
            ? `${accountInfo.wallet_address.slice(0, 8)}...${accountInfo.wallet_address.slice(-4)}`
            : "Wallet address set"
        default:
          return "Account details set"
      }
    } catch (error) {
      return "N/A"
    }
  }

  const getFullAccountDetails = (method: PayoutMethod) => {
    try {
      const accountInfo = JSON.parse(method.encrypted_account_info)

      switch (accountInfo.method) {
        case "PayPal":
          return {
            method: "PayPal",
            email: accountInfo.paypal_email || "Not provided"
          }
        case "Bank Transfer":
          return {
            method: "Bank Transfer",
            bankName: accountInfo.bank_name || "Not provided",
            accountNumber: accountInfo.account_number || "Not provided",
            routingNumber: accountInfo.routing_number || "Not provided",
            accountHolderName: accountInfo.account_holder_name || "Not provided",
            country: accountInfo.country || "Not provided"
          }
        case "Crypto (USDT - TRC20)":
          return {
            method: "Crypto (USDT - TRC20)",
            walletAddress: accountInfo.wallet_address || "Not provided"
          }
        default:
          return {
            method: "Unknown",
            details: "Account details not available"
          }
      }
    } catch (error) {
      return {
        method: "Error",
        details: "Unable to parse account information"
      }
    }
  }

  const openPayoutDetailsModal = (method: PayoutMethod) => {
    setSelectedPayoutMethod(method)
    setIsModalOpen(true)
  }

  const updatePayoutMethodStatus = async (payoutMethodId: string, status: string) => {
    setProcessing(payoutMethodId)
    try {
      const token = localStorage.getItem("authToken")
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
      })

      if (response.ok) {
        toast.success(`Payout method ${status} successfully`)
        fetchPayoutMethods()
        setIsModalOpen(false)
      } else {
        toast.error("Failed to update payout method status")
      }
    } catch (error) {
      console.error("Error updating payout method status:", error)
      toast.error("Error updating payout method status")
    } finally {
      setProcessing(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
      approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    }

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payout Methods
        </CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-400">View all artist payout method configurations</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search Artists</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
            <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm ? "No payout methods found for search term" : "No payout methods configured"}
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
                        <div className="font-medium truncate">{method.artist_name}</div>
                        <div className="text-sm text-gray-500 truncate">{method.artist_email}</div>
                      </div>
                      {getStatusBadge(method.status || 'pending')}
                    </div>

                    <div className="flex justify-between items-center">
                      {getMethodBadge(method.method)}
                      <div className="text-xs text-gray-600">
                        {formatDistanceToNow(new Date(method.created_at), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>

                    <div className="font-mono text-sm break-all bg-gray-50 dark:bg-gray-800 p-2 rounded">
                      {formatAccountDetails(method)}
                    </div>

                    <div className="flex items-center justify-center pt-2">
                      <Eye className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-xs text-gray-500">Click to view full details</span>
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
                    <TableHead>Method Type</TableHead>
                    <TableHead>Account Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMethods.map((method) => (
                    <TableRow key={method.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{method.artist_name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{method.artist_email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{getMethodBadge(method.method)}</TableCell>
                      <TableCell>
                        <div className="font-mono text-sm">{formatAccountDetails(method)}</div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(method.status || 'pending')}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(method.created_at), {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Payout Method Details</DialogTitle>
            </DialogHeader>
            {selectedPayoutMethod && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Artist</Label>
                    <p className="font-medium">{selectedPayoutMethod.artist_name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</Label>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{selectedPayoutMethod.artist_email}</p>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Payment Method</Label>
                  <div className="mt-1">{getMethodBadge(selectedPayoutMethod.method)}</div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Account Details</Label>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg space-y-2">
                    {(() => {
                      const details = getFullAccountDetails(selectedPayoutMethod)
                      switch (details.method) {
                        case "PayPal":
                          return (
                            <div>
                              <p className="text-sm"><span className="font-medium">Email:</span> {details.email}</p>
                            </div>
                          )
                        case "Bank Transfer":
                          return (
                            <div className="space-y-1">
                              <p className="text-sm"><span className="font-medium">Bank:</span> {details.bankName}</p>
                              <p className="text-sm"><span className="font-medium">Account Holder:</span> {details.accountHolderName}</p>
                              <p className="text-sm"><span className="font-medium">Account Number:</span> {details.accountNumber}</p>
                              <p className="text-sm"><span className="font-medium">Routing Number:</span> {details.routingNumber}</p>
                              <p className="text-sm"><span className="font-medium">Country:</span> {details.country}</p>
                            </div>
                          )
                        case "Crypto (USDT - TRC20)":
                          return (
                            <div>
                              <p className="text-sm"><span className="font-medium">Wallet Address:</span></p>
                              <p className="text-xs font-mono break-all bg-gray-100 dark:bg-gray-700 p-2 rounded mt-1">
                                {details.walletAddress}
                              </p>
                            </div>
                          )
                        default:
                          return <p className="text-sm text-red-600">{details.details}</p>
                      }
                    })()}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedPayoutMethod.status || 'pending')}</div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDistanceToNow(new Date(selectedPayoutMethod.created_at), { addSuffix: true })}
                  </p>
                </div>

                {(selectedPayoutMethod.status === 'pending' || !selectedPayoutMethod.status) && (
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={() => updatePayoutMethodStatus(selectedPayoutMethod.id, "approved")}
                      disabled={processing === selectedPayoutMethod.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processing === selectedPayoutMethod.id ? "Processing..." : "Approve"}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => updatePayoutMethodStatus(selectedPayoutMethod.id, "rejected")}
                      disabled={processing === selectedPayoutMethod.id}
                    >
                      {processing === selectedPayoutMethod.id ? "Processing..." : "Reject"}
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
