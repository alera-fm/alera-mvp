"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Wallet, AlertCircle, CreditCard } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { PayoutMethodSetup } from "./payout-method-setup"
import { requestWithdrawal, getPayoutMethod } from "@/lib/wallet-api"

interface WithdrawalSectionProps {
  pendingEarnings: number
  threshold: number
  artistId: string
  onWithdrawalRequest?: () => void
}

export function WithdrawalSection({ 
  pendingEarnings, 
  threshold, 
  artistId,
  onWithdrawalRequest 
}: WithdrawalSectionProps) {
  const canWithdraw = pendingEarnings >= threshold
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [payoutMethod, setPayoutMethod] = useState<any>(null)

  useEffect(() => {
    fetchPayoutMethod()
  }, [artistId])

  const fetchPayoutMethod = async () => {
    try {
      const data = await getPayoutMethod(artistId)
      setPayoutMethod(data)
    } catch (error) {
      console.error('Error fetching payout method:', error)
      setPayoutMethod(null)
    }
  }

  const handleWithdrawalRequest = async () => {
    if (!payoutMethod?.method) {
      toast({
        title: "No Payout Method",
        description: "Please set up a payout method first",
        variant: "destructive"
      })
      return
    }

    const amount = parseFloat(withdrawalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive"
      })
      return
    }

    if (amount > pendingEarnings) {
      toast({
        title: "Insufficient Balance",
        description: "Withdrawal amount exceeds available balance",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      await requestWithdrawal({
        artist_id: artistId,
        amount_requested: amount,
        method: payoutMethod.method,
        account_details: payoutMethod.account_info_masked
      })

      toast({
        title: "Withdrawal Request Submitted",
        description: `Your withdrawal request for $${amount.toFixed(2)} has been submitted and is pending approval.`,
      })

      setIsDialogOpen(false)
      setWithdrawalAmount("")

      if (onWithdrawalRequest) {
        onWithdrawalRequest()
      }
    } catch (error: any) {
      toast({
        title: "Withdrawal Request Failed",
        description: error.message || "Failed to submit withdrawal request",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <Card className="bg-white dark:bg-[#1a1a2e] border-gray-200 dark:border-gray-800 rounded-3xl overflow-hidden">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl text-[#333] dark:text-white">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Wallet className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Withdrawal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <span className="text-lg font-medium text-[#333] dark:text-white">Available Balance</span>
            <span className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${pendingEarnings.toFixed(2)}
            </span>
          </div>

          {/* Payout Method Setup */}
          <PayoutMethodSetup 
            artistId={artistId} 
            onPayoutMethodSet={setPayoutMethod}
          />

          {payoutMethod && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Payout Method: <span className="font-medium text-[#333] dark:text-white">{payoutMethod.method}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Account: <span className="font-medium text-[#333] dark:text-white">
                    {payoutMethod.method === 'bank' ? 
                      `***${payoutMethod.account_info?.split('|')[0]?.slice(-4) || '****'}` :
                      payoutMethod.account_info_masked || payoutMethod.account_info?.split('|')[0] || 'Not set'
                    }
                  </span>
                </p>
              </div>
            )}

          {/* Withdraw Button */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                disabled={!canWithdraw || !payoutMethod?.method}
                className={`w-full py-3 rounded-xl font-semibold ${
                  canWithdraw && payoutMethod?.method
                    ? "bg-green-600 hover:bg-green-700 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                }`}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Request Withdrawal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Request Withdrawal</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount (USD)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={withdrawalAmount}
                    onChange={(e) => setWithdrawalAmount(e.target.value)}
                    max={pendingEarnings}
                    step="0.01"
                  />
                  <p className="text-sm text-gray-500">
                    Available: ${pendingEarnings.toFixed(2)}
                  </p>
                </div>

                {payoutMethod?.method && (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      Payout Method: {payoutMethod.method}
                    </p>
                    {payoutMethod.account_info_masked && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {payoutMethod.account_info_masked}
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleWithdrawalRequest}
                  disabled={isSubmitting}
                  className="bg-[#BFFF00] text-black hover:bg-[#BFFF00]/90"
                >
                  {isSubmitting ? "Submitting..." : "Submit Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payout Information */}
          <div className="space-y-3">
            <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium">Payout threshold: ${threshold}</p>
                <p className="mt-1">Withdrawal requests are processed manually by admins.</p>
                {!payoutMethod?.method && (
                  <p className="mt-1 font-medium">Please set up a payout method to request withdrawals.</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
